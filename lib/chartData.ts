import type { MergedData, YearRates } from './types'
import { dateInfo, getRates, tariff3, tariff2, adj } from './tariffs'

export interface HourProfile {
  hour: number
  laboral: number | null
  finde: number | null
}

export interface DowProfile {
  hour: number
  Lun: number | null
  Mar: number | null
  Mie: number | null
  Jue: number | null
  Vie: number | null
  Sab: number | null
  Dom: number | null
}

export interface CumulativeCost {
  date: string
  label: string
  g3: number
  g2: number
}

export interface RollingDay {
  date: string
  label: string
  dailyKwh: number
  rolling7: number | null
}

// day 1–31 as key, value = total kWh that day
export type MonthSeries = { monthKey: string; label: string; days: Record<number, number> }

export interface ChartData {
  hourProfile: HourProfile[]
  dowProfile: DowProfile[]
  cumulativeCosts: CumulativeCost[]
  rollingDays: RollingDay[]
  monthSeries: MonthSeries[]  // only populated when ≥ 2 distinct months
}

const DOW_KEYS = ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'] as const

export function computeChartData(
  mergedData: MergedData,
  userRates: Record<number, Partial<YearRates>>,
  feriadosMap: Record<string, string>,
  evMode: boolean
): ChartData {
  const allDates = Object.keys(mergedData).sort()

  if (allDates.length === 0) {
    return {
      hourProfile: Array.from({ length: 24 }, (_, h) => ({ hour: h, laboral: null, finde: null })),
      dowProfile: Array.from({ length: 24 }, (_, h) => ({
        hour: h, Lun: null, Mar: null, Mie: null, Jue: null, Vie: null, Sab: null, Dom: null,
      })),
      cumulativeCosts: [],
      rollingDays: [],
      monthSeries: [],
    }
  }

  // --- Hour profile (avg kWh by hour, laboral vs finde/feriado) ---
  const hourSumLab = new Array(24).fill(0)
  const hourCntLab = new Array(24).fill(0)
  const hourSumFin = new Array(24).fill(0)
  const hourCntFin = new Array(24).fill(0)

  // --- Day-of-week profile ---
  const dowSum: number[][] = Array.from({ length: 7 }, () => new Array(24).fill(0))
  const dowCnt: number[][] = Array.from({ length: 7 }, () => new Array(24).fill(0))

  // --- Cumulative costs ---
  const cumulativeCosts: CumulativeCost[] = []
  let cumG3 = 0
  let cumG2 = 0

  // --- kWh histogram ---
  const kwhValues: number[] = []

  // --- Monthly day-of-month profile ---
  // monthMap: "YYYY-MM" → { day → kWh }
  const monthMap = new Map<string, Record<number, number>>()

  // --- Rolling 7-day ---
  const dailyKwh: number[] = []
  const dailyLabels: string[] = []
  const dailyDates: string[] = []

  for (const dk of allDates) {
    const info = dateInfo(dk, feriadosMap)
    const { R3, R2 } = getRates(info.year, userRates)
    let dayG3 = 0
    let dayG2 = 0
    let dayKwh = 0

    for (let h = 0; h < 24; h++) {
      const raw = mergedData[dk]?.[h] ?? null
      const v = adj(raw, evMode)
      if (v == null) continue

      kwhValues.push(v)
      dayKwh += v

      const t3 = tariff3(h, info.isOffPeak, R3)
      const t2 = tariff2(h, info.isOffPeak, R2)
      dayG3 += v * t3.rate
      dayG2 += v * t2.rate

      // hour profile
      if (info.isOffPeak) {
        hourSumFin[h] += v; hourCntFin[h]++
      } else {
        hourSumLab[h] += v; hourCntLab[h]++
      }

      // dow profile
      dowSum[info.dow][h] += v
      dowCnt[info.dow][h]++

    }

    cumG3 += dayG3
    cumG2 += dayG2
    const [y, m, d] = dk.split('-').map(Number)

    // monthly accumulation
    const mk = `${y}-${String(m).padStart(2, '0')}`
    if (!monthMap.has(mk)) monthMap.set(mk, {})
    monthMap.get(mk)![d] = (monthMap.get(mk)![d] ?? 0) + dayKwh

    const label = `${d} ${['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'][m - 1]}`
    cumulativeCosts.push({ date: dk, label, g3: cumG3, g2: cumG2 })

    dailyKwh.push(dayKwh)
    dailyLabels.push(label)
    dailyDates.push(dk)
  }

  // --- Build hourProfile ---
  const hourProfile: HourProfile[] = Array.from({ length: 24 }, (_, h) => ({
    hour: h,
    laboral: hourCntLab[h] > 0 ? hourSumLab[h] / hourCntLab[h] : null,
    finde: hourCntFin[h] > 0 ? hourSumFin[h] / hourCntFin[h] : null,
  }))

  // --- Build dowProfile ---
  const dowProfile: DowProfile[] = Array.from({ length: 24 }, (_, h) => ({
    hour: h,
    Dom: dowCnt[0][h] > 0 ? dowSum[0][h] / dowCnt[0][h] : null,
    Lun: dowCnt[1][h] > 0 ? dowSum[1][h] / dowCnt[1][h] : null,
    Mar: dowCnt[2][h] > 0 ? dowSum[2][h] / dowCnt[2][h] : null,
    Mie: dowCnt[3][h] > 0 ? dowSum[3][h] / dowCnt[3][h] : null,
    Jue: dowCnt[4][h] > 0 ? dowSum[4][h] / dowCnt[4][h] : null,
    Vie: dowCnt[5][h] > 0 ? dowSum[5][h] / dowCnt[5][h] : null,
    Sab: dowCnt[6][h] > 0 ? dowSum[6][h] / dowCnt[6][h] : null,
  }))

  // --- kWh histogram (0.5 kWh bins) ---
  const BIN = 0.5
  const binMap = new Map<number, number>()
  for (const v of kwhValues) {
    const b = Math.floor(v / BIN) * BIN
    binMap.set(b, (binMap.get(b) ?? 0) + 1)
  }
  const kwhHistogram: KwhBin[] = Array.from(binMap.entries())
    .sort(([a], [b]) => a - b)
    .map(([b, count]) => ({ bin: b.toFixed(1), count }))

  // --- Rolling 7-day ---
  const rollingDays: RollingDay[] = dailyKwh.map((kwh, i) => {
    let rolling7: number | null = null
    if (i >= 6) {
      const sum = dailyKwh.slice(i - 6, i + 1).reduce((a, b) => a + b, 0)
      rolling7 = sum / 7
    }
    return { date: dailyDates[i], label: dailyLabels[i], dailyKwh: kwh, rolling7 }
  })

  // --- Month series (only when ≥ 2 distinct months) ---
  const MONTH_LABELS = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic']
  const monthSeries: MonthSeries[] = monthMap.size >= 2
    ? Array.from(monthMap.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([mk, days]) => {
          const [my, mm] = mk.split('-').map(Number)
          return { monthKey: mk, label: `${MONTH_LABELS[mm - 1]} ${my}`, days }
        })
    : []

  return {
    hourProfile,
    dowProfile,
    cumulativeCosts,
    kwhHistogram,
    rollingDays,
    monthSeries,
  }
}

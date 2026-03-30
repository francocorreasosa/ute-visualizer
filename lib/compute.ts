import type {
  MergedData,
  YearRates,
  ComputeResult,
  BandCosts,
  BandCosts2,
  BandKwh,
  BandKwh2,
} from './types'
import { tariff3, tariff2, dateInfo, getRates, adj } from './tariffs'

/**
 * Core computation: single pass over all dates to compute maxV, stats, and
 * cost comparison between Triple Horario and Doble Horario.
 *
 * Called inside useMemo in page.tsx — re-runs only when mergedData,
 * userRates, feriadosMap, or evMode change.
 */
export function computeAll(
  mergedData: MergedData,
  userRates: Record<number, Partial<YearRates>>,
  feriadosMap: Record<string, string>,
  evMode: boolean
): ComputeResult {
  const allDates = Object.keys(mergedData).sort()

  if (allDates.length === 0) {
    return {
      allDates: [],
      maxV: 0,
      stats: {
        totalKwh: 0,
        valle: { kwh: 0, pct: 0 },
        llano: { kwh: 0, pct: 0 },
        punta: { kwh: 0, pct: 0 },
      },
      comparison: {
        g3: 0,
        g2: 0,
        c3: { Valle: 0, Llano: 0, Punta: 0 },
        c2: { Punta: 0, 'Fuera de Punta': 0 },
        k3: { Valle: 0, Llano: 0, Punta: 0 },
        k2: { Punta: 0, 'Fuera de Punta': 0 },
      },
    }
  }

  const allV: number[] = []
  let g3 = 0
  let g2 = 0
  let totalKwh = 0
  const c3: BandCosts = { Valle: 0, Llano: 0, Punta: 0 }
  const c2: BandCosts2 = { Punta: 0, 'Fuera de Punta': 0 }
  const k3: BandKwh = { Valle: 0, Llano: 0, Punta: 0 }
  const k2: BandKwh2 = { Punta: 0, 'Fuera de Punta': 0 }

  for (const dk of allDates) {
    const info = dateInfo(dk, feriadosMap)
    const { R3, R2 } = getRates(info.year, userRates)
    for (let h = 0; h < 24; h++) {
      const v = adj(mergedData[dk]?.[h] ?? null, evMode)
      if (v == null) continue
      allV.push(v)
      const t3 = tariff3(h, info.isOffPeak, R3)
      const t2 = tariff2(h, info.isOffPeak, R2)
      totalKwh += v
      g3 += v * t3.rate
      g2 += v * t2.rate
      c3[t3.name as keyof BandCosts] += v * t3.rate
      c2[t2.name as keyof BandCosts2] += v * t2.rate
      k3[t3.name as keyof BandKwh] += v
      k2[t2.name as keyof BandKwh2] += v
    }
  }

  const maxV = allV.length > 0 ? Math.max(...allV) : 0

  return {
    allDates,
    maxV,
    stats: {
      totalKwh,
      valle: { kwh: k3.Valle, pct: totalKwh > 0 ? (k3.Valle / totalKwh) * 100 : 0 },
      llano: { kwh: k3.Llano, pct: totalKwh > 0 ? (k3.Llano / totalKwh) * 100 : 0 },
      punta: { kwh: k3.Punta, pct: totalKwh > 0 ? (k3.Punta / totalKwh) * 100 : 0 },
    },
    comparison: { g3, g2, c3, c2, k3, k2 },
  }
}

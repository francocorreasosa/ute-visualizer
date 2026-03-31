import type {
  MergedData,
  YearRates,
  ComputeResult,
  BandCosts,
  BandCosts2,
  BandCostsSimple,
  BandKwh,
  BandKwh2,
  BandKwhSimple,
} from './types'
import { tariff3, tariff2, tariff1, dateInfo, getRates, adj } from './tariffs'

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
  evMode: boolean,
  puntaStart = 17
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
        g3: 0, g2: 0, g1: 0,
        c3: { Valle: 0, Llano: 0, Punta: 0 },
        c2: { Punta: 0, 'Fuera de Punta': 0 },
        c1: { e1: 0, e2: 0, e3: 0 },
        k3: { Valle: 0, Llano: 0, Punta: 0 },
        k2: { Punta: 0, 'Fuera de Punta': 0 },
        k1: { e1: 0, e2: 0, e3: 0 },
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

  // Monthly kWh grouping for tariff1 (key = "YYYY-MM|year")
  const monthKwh = new Map<string, { kwh: number; year: number }>()

  for (const dk of allDates) {
    const info = dateInfo(dk, feriadosMap)
    const { R3, R2 } = getRates(info.year, userRates)
    const [y, m] = dk.split('-')
    const mk = `${y}-${m}`
    if (!monthKwh.has(mk)) monthKwh.set(mk, { kwh: 0, year: info.year })
    for (let h = 0; h < 24; h++) {
      const v = adj(mergedData[dk]?.[h] ?? null, evMode)
      if (v == null) continue
      allV.push(v)
      monthKwh.get(mk)!.kwh += v
      const t3 = tariff3(h, info.isOffPeak, R3, puntaStart)
      const t2 = tariff2(h, info.isOffPeak, R2, puntaStart)
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

  // Tariff Simple: apply block pricing per month
  let g1 = 0
  const c1: BandCostsSimple = { e1: 0, e2: 0, e3: 0 }
  const k1: BandKwhSimple = { e1: 0, e2: 0, e3: 0 }
  for (const { kwh, year } of monthKwh.values()) {
    const { R1 } = getRates(year, userRates)
    const t1 = tariff1(kwh, R1)
    g1 += t1.cost
    c1.e1 += t1.c.e1; c1.e2 += t1.c.e2; c1.e3 += t1.c.e3
    k1.e1 += t1.k.e1; k1.e2 += t1.k.e2; k1.e3 += t1.k.e3
  }

  return {
    allDates,
    maxV,
    stats: {
      totalKwh,
      valle: { kwh: k3.Valle, pct: totalKwh > 0 ? (k3.Valle / totalKwh) * 100 : 0 },
      llano: { kwh: k3.Llano, pct: totalKwh > 0 ? (k3.Llano / totalKwh) * 100 : 0 },
      punta: { kwh: k3.Punta, pct: totalKwh > 0 ? (k3.Punta / totalKwh) * 100 : 0 },
    },
    comparison: { g3, g2, g1, c3, c2, c1, k3, k2, k1 },
  }
}

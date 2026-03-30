import type { TariffResult, Triple3Rates, Triple2Rates, DateInfo, YearRates } from './types'
import { DAY_NAMES, MONTH_NAMES, DEFAULT_RATES } from './constants'

export function tariff3(h: number, isOffPeak: boolean, R3: Triple3Rates): TariffResult {
  if (h >= 0 && h <= 6) return { name: 'Valle', rate: R3.valle }
  if (h >= 17 && h <= 20 && !isOffPeak) return { name: 'Punta', rate: R3.punta }
  return { name: 'Llano', rate: R3.llano }
}

export function tariff2(h: number, isOffPeak: boolean, R2: Triple2Rates): TariffResult {
  if (h >= 17 && h <= 20 && !isOffPeak) return { name: 'Punta', rate: R2.punta }
  return { name: 'Fuera de Punta', rate: R2.fp }
}

export function colorCell(v: number | null, maxV: number): string {
  if (v == null || maxV === 0) return '#0c1222'
  const t = Math.min(v / maxV, 1)
  const stops: [number, number, number, number][] = [
    [0, 12, 18, 34],
    [0.15, 14, 61, 94],
    [0.3, 8, 145, 178],
    [0.5, 245, 158, 11],
    [0.75, 239, 68, 68],
    [1, 220, 38, 38],
  ]
  let i = 0
  for (; i < stops.length - 1; i++) {
    if (t <= stops[i + 1][0]) break
  }
  const [t0, r0, g0, b0] = stops[i]
  const [t1, r1, g1, b1] = stops[i + 1]
  const f = (t - t0) / (t1 - t0)
  return `rgb(${Math.round(r0 + (r1 - r0) * f)},${Math.round(g0 + (g1 - g0) * f)},${Math.round(b0 + (b1 - b0) * f)})`
}

export function dateInfo(ds: string, feriadosMap: Record<string, string>): DateInfo {
  const [y, m, d] = ds.split('-').map(Number)
  const dt = new Date(y, m - 1, d)
  const dow = dt.getDay()
  const isWknd = dow === 0 || dow === 6
  const isFeriado = ds in feriadosMap
  return {
    year: y,
    dow,
    dn: DAY_NAMES[dow],
    day: d,
    mn: MONTH_NAMES[m - 1],
    isWknd,
    isFeriado,
    feriadoName: feriadosMap[ds] || '',
    isOffPeak: isWknd || isFeriado,
  }
}

export function getRates(
  year: number,
  userRates: Record<number, Partial<YearRates>>
): { R3: Triple3Rates; R2: Triple2Rates } {
  const def = DEFAULT_RATES[year] ?? DEFAULT_RATES[2026]
  const saved = userRates[year] ?? {}
  return {
    R3: {
      valle: Number(saved.t3_valle ?? def.t3_valle),
      llano: Number(saved.t3_llano ?? def.t3_llano),
      punta: Number(saved.t3_punta ?? def.t3_punta),
    },
    R2: {
      punta: Number(saved.t2_punta ?? def.t2_punta),
      fp: Number(saved.t2_fp ?? def.t2_fp),
    },
  }
}

/** Adjust kWh for EV simulation: subtract 6.5 from hours over 7 kWh */
export function adj(v: number | null, evMode: boolean): number | null {
  if (v == null) return null
  if (evMode && v > 7) return Math.max(v - 6.5, 0)
  return v
}

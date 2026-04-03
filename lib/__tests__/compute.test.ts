import { describe, it, expect } from 'vitest'
import { computeAll } from '../compute'
import type { MergedData, EVConfig } from '../types'

const NO_RATES = {}
const NO_FERIADOS = {}

// ─── helpers ──────────────────────────────────────────────────────────────────

/** Build a MergedData with one value at a single date+hour */
function singleHour(date: string, hour: number, kwh: number): MergedData {
  return { [date]: { [hour]: kwh } }
}

// ─── empty data ───────────────────────────────────────────────────────────────
describe('computeAll — empty data', () => {
  it('returns all-zero result', () => {
    const result = computeAll({}, NO_RATES, NO_FERIADOS, false)
    expect(result.allDates).toHaveLength(0)
    expect(result.maxV).toBe(0)
    expect(result.stats.totalKwh).toBe(0)
    expect(result.comparison.g3).toBe(0)
    expect(result.comparison.g2).toBe(0)
    expect(result.comparison.g1).toBe(0)
  })
})

// ─── single known value ───────────────────────────────────────────────────────
describe('computeAll — single hour', () => {
  // 2026-03-31 = Monday, hour 10 = Llano, no holiday
  // 2026 rates: t3_llano = 6.309, t2_fp = 5.821, t1_e1 = 8.228
  const data = singleHour('2026-03-31', 10, 5)

  it('maxV equals the single kWh value', () => {
    const { maxV } = computeAll(data, NO_RATES, NO_FERIADOS, false)
    expect(maxV).toBeCloseTo(5)
  })

  it('totalKwh equals the single kWh value', () => {
    const { stats } = computeAll(data, NO_RATES, NO_FERIADOS, false)
    expect(stats.totalKwh).toBeCloseTo(5)
  })

  it('g3 cost = kWh × llano rate', () => {
    const { comparison } = computeAll(data, NO_RATES, NO_FERIADOS, false)
    expect(comparison.g3).toBeCloseTo(5 * 6.309)
  })

  it('g2 cost = kWh × fuera-de-punta rate (daytime weekday)', () => {
    const { comparison } = computeAll(data, NO_RATES, NO_FERIADOS, false)
    expect(comparison.g2).toBeCloseTo(5 * 5.821)
  })
})

// ─── EV mode ──────────────────────────────────────────────────────────────────
describe('computeAll — EV mode', () => {
  it('reduces kWh for hours with consumption > 7 kWh', () => {
    // 10 kWh at a daytime hour → adj subtracts 6.5 → 3.5 kWh
    const data = singleHour('2026-03-31', 10, 10)
    const withEV = computeAll(data, NO_RATES, NO_FERIADOS, true)
    expect(withEV.stats.totalKwh).toBeCloseTo(3.5)
  })

  it('does NOT reduce kWh for hours at or below 7 kWh', () => {
    const data = singleHour('2026-03-31', 10, 7)
    const withEV = computeAll(data, NO_RATES, NO_FERIADOS, true)
    expect(withEV.stats.totalKwh).toBeCloseTo(7)
  })
})

// ─── weekend → no Punta ───────────────────────────────────────────────────────
describe('computeAll — weekend off-peak', () => {
  it('peak-window hours on a Sunday are not counted as Punta', () => {
    // 2026-03-29 = Sunday; hour 18 would be Punta on a weekday
    const data = singleHour('2026-03-29', 18, 5)
    const { stats } = computeAll(data, NO_RATES, NO_FERIADOS, false)
    expect(stats.punta.kwh).toBeCloseTo(0)
    // kWh should land in Valle or Llano, not Punta
    expect(stats.valle.kwh + stats.llano.kwh).toBeCloseTo(5)
  })
})

// ─── puntaStart parameter ─────────────────────────────────────────────────────
describe('computeAll — puntaStart', () => {
  it('h=17 is Punta with default puntaStart=17', () => {
    const data = singleHour('2026-03-31', 17, 4) // Monday
    const { stats } = computeAll(data, NO_RATES, NO_FERIADOS, false, 17)
    expect(stats.punta.kwh).toBeCloseTo(4)
  })

  it('h=17 is NOT Punta when puntaStart=18', () => {
    const data = singleHour('2026-03-31', 17, 4) // Monday
    const { stats } = computeAll(data, NO_RATES, NO_FERIADOS, false, 18)
    expect(stats.punta.kwh).toBeCloseTo(0)
  })
})

// ─── EV simulator (evConfig) ─────────────────────────────────────────────────
//
// Config: 300 km/month, 60 kWh battery, 300 km range, 100% efficiency, 2 kW charger
// dailyKwh = (300/30) × (60/300) / 1 = 2 kWh/day
// hoursNeeded = 2/2 = 1.0 → h=0 gets exactly 2 kW added (Valle rate: 2.98)
//
// Base data: 2026-03-31 (Monday), h=10, 5 kWh (Llano: 6.309)
// With EV: h=0 adds 2 kWh (Valle: 2.98) → totalKwh = 7
//
describe('computeAll — evConfig', () => {
  const data = singleHour('2026-03-31', 10, 5)
  const evConfig: EVConfig = {
    enabled: true,
    monthlyKm: 300,
    batteryKwh: 60,
    rangeKm: 300,
    chargingKw: 2,
    chargeStart: 0,
    chargeEnd: 1,
    efficiency: 100,
  }

  it('adds EV load to totalKwh', () => {
    const { stats } = computeAll(data, NO_RATES, NO_FERIADOS, false, 17, evConfig)
    expect(stats.totalKwh).toBeCloseTo(7) // 5 base + 2 EV
  })

  it('EV kWh at h=0 lands in Valle band', () => {
    const { stats } = computeAll(data, NO_RATES, NO_FERIADOS, false, 17, evConfig)
    expect(stats.valle.kwh).toBeCloseTo(2)
  })

  it('g3 cost includes EV kWh at Valle rate', () => {
    const { comparison } = computeAll(data, NO_RATES, NO_FERIADOS, false, 17, evConfig)
    const expected = 5 * 6.309 + 2 * 2.98
    expect(comparison.g3).toBeCloseTo(expected, 1)
  })

  it('g3 without evConfig is lower than with it', () => {
    const without = computeAll(data, NO_RATES, NO_FERIADOS, false, 17)
    const withEV = computeAll(data, NO_RATES, NO_FERIADOS, false, 17, evConfig)
    expect(withEV.comparison.g3).toBeGreaterThan(without.comparison.g3)
  })

  it('disabled evConfig has no effect', () => {
    const without = computeAll(data, NO_RATES, NO_FERIADOS, false, 17)
    const withDisabled = computeAll(data, NO_RATES, NO_FERIADOS, false, 17, { ...evConfig, enabled: false })
    expect(withDisabled.stats.totalKwh).toBeCloseTo(without.stats.totalKwh)
  })

  it('overnight window adds EV load across midnight correctly', () => {
    // 3000 km/month, 7 kW charger, window 22→6 → ~20 kWh/day spread over ~2.86h
    const overnight: EVConfig = {
      enabled: true,
      monthlyKm: 3000,
      batteryKwh: 60,
      rangeKm: 300,
      chargingKw: 7,
      chargeStart: 22,
      chargeEnd: 6,
      efficiency: 100,
    }
    const { stats } = computeAll(data, NO_RATES, NO_FERIADOS, false, 17, overnight)
    // base 5 kWh + ~20 kWh EV = ~25 kWh
    expect(stats.totalKwh).toBeCloseTo(25, 0)
  })
})

// ─── multi-month tariff1 (Simple plan) block pricing ─────────────────────────
//
// The Simple plan (g1) applies block pricing PER MONTH, not on the cumulative
// total. Two months at 350 kWh each costs less than one month at 700 kWh,
// because each month resets the tier counter.
//
// TODO: Fill in the expected g1 value below based on your domain knowledge of
//       the 2026 rates. The fixture uses two months × 350 kWh per month.
//
//   2026 rates:  t1_e1 = 8.228,  t1_e2 = 10.311,  t1_e3 = 12.858
//
//   Per month: 100 kWh @ e1 + 250 kWh @ e2
//              = 100×8.228 + 250×10.311
//              = 822.8  +  2577.75  = 3400.55
//
//   Two months: 3400.55 × 2 = 6801.10
//
describe('computeAll — multi-month Simple plan (tariff1)', () => {
  // 350 kWh spread over 10 days in January 2026 (35 kWh/day, h=12 = 1.458 kWh/h × 24h ≈ 35)
  // Simpler: just put all 350 kWh in a single hour per day, one day per month
  const jan = singleHour('2026-01-15', 12, 350)
  const feb = singleHour('2026-02-15', 12, 350)
  const data: MergedData = { ...jan, ...feb }

  it('g1 applies block pricing per-month, not on total 700 kWh', () => {
    const { comparison } = computeAll(data, NO_RATES, NO_FERIADOS, false)
    // Cost if applied per-month (2 × 350 kWh):
    //   each month: 100×8.228 + 250×10.311 = 3400.55
    //   total: 3400.55 × 2 = 6801.10
    const perMonthCost = 2 * (100 * 8.228 + 250 * 10.311)
    expect(comparison.g1).toBeCloseTo(perMonthCost, 1)
  })

  it('g1 < hypothetical cost if 700 kWh were billed in one block', () => {
    const { comparison } = computeAll(data, NO_RATES, NO_FERIADOS, false)
    // If 700 kWh were one month: 100×8.228 + 500×10.311 + 100×12.858 = 7264.1
    const singleMonthCost = 100 * 8.228 + 500 * 10.311 + 100 * 12.858
    expect(comparison.g1).toBeLessThan(singleMonthCost)
  })
})

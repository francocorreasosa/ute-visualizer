import { describe, it, expect } from 'vitest'
import { computeChartData } from '../chartData'
import type { MergedData, EVConfig } from '../types'

const NO_RATES = {}
const NO_FERIADOS = {}

function dayData(date: string, kwh: number): MergedData {
  return { [date]: { 10: kwh } }
}

// ─── empty data ───────────────────────────────────────────────────────────────
describe('computeChartData — empty data', () => {
  it('returns empty arrays and 24-slot profiles', () => {
    const result = computeChartData({}, NO_RATES, NO_FERIADOS, false)
    expect(result.cumulativeCosts).toHaveLength(0)
    expect(result.monthlyCosts).toHaveLength(0)
    expect(result.hourProfile).toHaveLength(24)
  })
})

// ─── monthlyCosts grouping ────────────────────────────────────────────────────
describe('computeChartData — monthlyCosts', () => {
  it('single month produces one monthlyCosts entry', () => {
    const data = dayData('2026-03-15', 100)
    const { monthlyCosts } = computeChartData(data, NO_RATES, NO_FERIADOS, false)
    expect(monthlyCosts).toHaveLength(1)
    expect(monthlyCosts[0].monthKey).toBe('2026-03')
    expect(monthlyCosts[0].label).toContain('Mar')
    expect(monthlyCosts[0].label).toContain('2026')
  })

  it('two months produce two entries sorted chronologically', () => {
    const data: MergedData = {
      ...dayData('2026-01-15', 200),
      ...dayData('2026-02-15', 300),
    }
    const { monthlyCosts } = computeChartData(data, NO_RATES, NO_FERIADOS, false)
    expect(monthlyCosts).toHaveLength(2)
    expect(monthlyCosts[0].monthKey).toBe('2026-01')
    expect(monthlyCosts[1].monthKey).toBe('2026-02')
  })

  it('g3 and g2 costs are positive for non-zero consumption', () => {
    const data = dayData('2026-03-31', 50) // Monday, h=10 = Llano / FP
    const { monthlyCosts } = computeChartData(data, NO_RATES, NO_FERIADOS, false)
    expect(monthlyCosts[0].g3).toBeGreaterThan(0)
    expect(monthlyCosts[0].g2).toBeGreaterThan(0)
  })

  it('g1 cost applies Simple block pricing for the monthly total', () => {
    // 350 kWh in one month → 100×e1 + 250×e2
    // 2026 rates: e1=8.228, e2=10.311
    const data = dayData('2026-03-15', 350)
    const { monthlyCosts } = computeChartData(data, NO_RATES, NO_FERIADOS, false)
    const expected = 100 * 8.228 + 250 * 10.311
    expect(monthlyCosts[0].g1).toBeCloseTo(expected, 1)
  })

  it('enabling evConfig increases monthly costs', () => {
    const data = dayData('2026-03-31', 5)
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
    const without = computeChartData(data, NO_RATES, NO_FERIADOS, false)
    const withEV = computeChartData(data, NO_RATES, NO_FERIADOS, false, 17, evConfig)
    expect(withEV.monthlyCosts[0].g3).toBeGreaterThan(without.monthlyCosts[0].g3)
    expect(withEV.monthlyCosts[0].g2).toBeGreaterThan(without.monthlyCosts[0].g2)
    expect(withEV.monthlyCosts[0].g1).toBeGreaterThan(without.monthlyCosts[0].g1)
  })
})

// ─── cumulativeCosts ──────────────────────────────────────────────────────────
describe('computeChartData — cumulativeCosts', () => {
  it('produces one entry per day', () => {
    const data: MergedData = {
      ...dayData('2026-03-01', 10),
      ...dayData('2026-03-02', 10),
      ...dayData('2026-03-03', 10),
    }
    const { cumulativeCosts } = computeChartData(data, NO_RATES, NO_FERIADOS, false)
    expect(cumulativeCosts).toHaveLength(3)
  })

  it('cumulative g3 is non-decreasing', () => {
    const data: MergedData = {
      ...dayData('2026-03-01', 10),
      ...dayData('2026-03-02', 10),
      ...dayData('2026-03-03', 10),
    }
    const { cumulativeCosts } = computeChartData(data, NO_RATES, NO_FERIADOS, false)
    for (let i = 1; i < cumulativeCosts.length; i++) {
      expect(cumulativeCosts[i].g3).toBeGreaterThanOrEqual(cumulativeCosts[i - 1].g3)
    }
  })
})

import { describe, it, expect } from 'vitest'
import { tariff1, tariff2, tariff3, adj, colorCell, dateInfo, getRates, evHourlyKw } from '../tariffs'
import type { SimpleRates } from '../tariffs'
import type { Triple3Rates, Triple2Rates, EVConfig } from '../types'

// 2026 default rates for deterministic tests
const R1: SimpleRates = { e1: 8.228, e2: 10.311, e3: 12.858 }
const R3: Triple3Rates = { valle: 2.98, llano: 6.309, punta: 14.68148 }
const R2: Triple2Rates = { punta: 14.68148, fp: 5.821 }

// ─── tariff1 (block pricing) ────────────────────────────────────────────────
describe('tariff1', () => {
  it('zero kWh → zero cost', () => {
    const r = tariff1(0, R1)
    expect(r.cost).toBe(0)
    expect(r.k).toEqual({ e1: 0, e2: 0, e3: 0 })
  })

  it('50 kWh fills only the e1 band', () => {
    const r = tariff1(50, R1)
    expect(r.k).toEqual({ e1: 50, e2: 0, e3: 0 })
    expect(r.cost).toBeCloseTo(50 * R1.e1)
  })

  it('exactly 100 kWh fills e1, nothing spills into e2', () => {
    const r = tariff1(100, R1)
    expect(r.k).toEqual({ e1: 100, e2: 0, e3: 0 })
    expect(r.cost).toBeCloseTo(100 * R1.e1)
  })

  it('350 kWh splits across e1 (100) and e2 (250)', () => {
    const r = tariff1(350, R1)
    expect(r.k).toEqual({ e1: 100, e2: 250, e3: 0 })
    expect(r.cost).toBeCloseTo(100 * R1.e1 + 250 * R1.e2)
  })

  it('700 kWh uses all three bands', () => {
    const r = tariff1(700, R1)
    expect(r.k).toEqual({ e1: 100, e2: 500, e3: 100 })
    expect(r.cost).toBeCloseTo(100 * R1.e1 + 500 * R1.e2 + 100 * R1.e3)
  })
})

// ─── tariff3 (Triple Horario) ────────────────────────────────────────────────
describe('tariff3', () => {
  it('hours 0–6 are always Valle', () => {
    for (let h = 0; h <= 6; h++) {
      expect(tariff3(h, false, R3).name).toBe('Valle')
    }
  })

  it('peak window (17–20) on a weekday is Punta', () => {
    for (let h = 17; h <= 20; h++) {
      expect(tariff3(h, false, R3).name).toBe('Punta')
    }
  })

  it('peak window on a weekend/holiday is Llano (not Punta)', () => {
    expect(tariff3(18, true, R3).name).toBe('Llano')
  })

  it('daytime hours outside peak are Llano', () => {
    expect(tariff3(10, false, R3).name).toBe('Llano')
    expect(tariff3(7, false, R3).name).toBe('Llano')
  })

  it('hour 21 falls outside peak window and is Llano', () => {
    expect(tariff3(21, false, R3).name).toBe('Llano')
  })

  it('puntaStart=18 shifts peak window to 18–21', () => {
    expect(tariff3(17, false, R3, 18).name).toBe('Llano')
    expect(tariff3(18, false, R3, 18).name).toBe('Punta')
    expect(tariff3(21, false, R3, 18).name).toBe('Punta')
    expect(tariff3(22, false, R3, 18).name).toBe('Llano')
  })
})

// ─── tariff2 (Doble Horario) ─────────────────────────────────────────────────
describe('tariff2', () => {
  it('peak hour on weekday is Punta', () => {
    expect(tariff2(18, false, R2).name).toBe('Punta')
  })

  it('peak hour on weekend is Fuera de Punta', () => {
    expect(tariff2(18, true, R2).name).toBe('Fuera de Punta')
  })

  it('off-peak hour on weekday is Fuera de Punta', () => {
    expect(tariff2(8, false, R2).name).toBe('Fuera de Punta')
    expect(tariff2(3, false, R2).name).toBe('Fuera de Punta')
  })
})

// ─── adj (EV simulation) ─────────────────────────────────────────────────────
describe('adj', () => {
  it('evMode=false returns value unchanged', () => {
    expect(adj(10, false)).toBe(10)
    expect(adj(0, false)).toBe(0)
  })

  it('null always returns null', () => {
    expect(adj(null, false)).toBeNull()
    expect(adj(null, true)).toBeNull()
  })

  it('evMode=true, v=7 (not > 7) → unchanged', () => {
    expect(adj(7, true)).toBe(7)
  })

  it('evMode=true, v > 7 → subtract 6.5', () => {
    expect(adj(7.1, true)).toBeCloseTo(0.6)
    expect(adj(10, true)).toBeCloseTo(3.5)
  })

  it('evMode=true, result never goes below 0', () => {
    // 7.1 - 6.5 = 0.6, fine
    // but if v was 6.9 it wouldn't trigger anyway (≤7)
    expect(adj(7.5, true)).toBeCloseTo(1.0)
  })
})

// ─── colorCell ───────────────────────────────────────────────────────────────
describe('colorCell', () => {
  it('null value returns the dark background color', () => {
    expect(colorCell(null, 10)).toBe('#0c1222')
  })

  it('maxV=0 returns the dark background color', () => {
    expect(colorCell(5, 0)).toBe('#0c1222')
  })

  it('v=0 → first stop color', () => {
    expect(colorCell(0, 10)).toBe('rgb(12,18,34)')
  })

  it('v=maxV → last stop color (deep red)', () => {
    expect(colorCell(10, 10)).toBe('rgb(220,38,38)')
  })

  it('v > maxV is clamped to maxV', () => {
    expect(colorCell(20, 10)).toBe('rgb(220,38,38)')
  })
})

// ─── dateInfo ────────────────────────────────────────────────────────────────
describe('dateInfo', () => {
  it('2025-03-31 is a Monday (weekday, no holiday)', () => {
    const info = dateInfo('2025-03-31', {})
    expect(info.dow).toBe(1)
    expect(info.isWknd).toBe(false)
    expect(info.isFeriado).toBe(false)
    expect(info.isOffPeak).toBe(false)
  })

  it('2025-03-29 is a Saturday (weekend)', () => {
    const info = dateInfo('2025-03-29', {})
    expect(info.isWknd).toBe(true)
    expect(info.isOffPeak).toBe(true)
  })

  it('a date in feriadosMap is off-peak', () => {
    const info = dateInfo('2025-01-01', { '2025-01-01': 'Año Nuevo' })
    expect(info.isFeriado).toBe(true)
    expect(info.isOffPeak).toBe(true)
    expect(info.feriadoName).toBe('Año Nuevo')
  })

  it('returns correct year, month name, and day name', () => {
    const info = dateInfo('2026-07-18', {})
    expect(info.year).toBe(2026)
    expect(info.mn).toBe('Jul')
    expect(info.day).toBe(18)
  })
})

// ─── evHourlyKw ──────────────────────────────────────────────────────────────
describe('evHourlyKw', () => {
  // Base config: 300 km/month, 60 kWh battery, 300 km range, 100% efficiency
  // dailyKwh = (300/30) * (60/300) / 1 = 10 * 0.2 = 2 kWh/day
  // chargingKw = 2 → hoursNeeded = 2/2 = 1.0 hour
  const base: EVConfig = {
    enabled: true,
    monthlyKm: 300,
    batteryKwh: 60,
    rangeKm: 300,
    chargingKw: 2,
    chargeStart: 0,
    chargeEnd: 1,  // 1-hour window: only h=0
    efficiency: 100,
  }

  it('returns 0 when disabled', () => {
    expect(evHourlyKw(0, { ...base, enabled: false })).toBe(0)
  })

  it('returns 0 for efficiency <= 0', () => {
    expect(evHourlyKw(0, { ...base, efficiency: 0 })).toBe(0)
  })

  it('hour inside window gets full chargingKw for a complete hour', () => {
    // hoursNeeded=1.0, so h=0 (pos=0) should get full 2 kW
    expect(evHourlyKw(0, base)).toBeCloseTo(2)
  })

  it('hour outside window returns 0', () => {
    expect(evHourlyKw(1, base)).toBe(0)
    expect(evHourlyKw(12, base)).toBe(0)
    expect(evHourlyKw(23, base)).toBe(0)
  })

  it('fractional last hour returns partial kW', () => {
    // dailyKwh=2, chargingKw=4 → hoursNeeded=0.5
    // h=0 (pos=0): pos < floor(0.5)=0? no. pos < 0.5? yes → 4 * 0.5 = 2 kW
    const cfg: EVConfig = { ...base, chargingKw: 4, chargeEnd: 4 }
    expect(evHourlyKw(0, cfg)).toBeCloseTo(2)
    expect(evHourlyKw(1, cfg)).toBe(0)
  })

  it('overnight window (wrap around midnight) distributes load correctly', () => {
    // 3000 km/month, 60 kWh battery, 300 km range, 100% efficiency, 7 kW charger
    // dailyKwh = (3000/30) * (60/300) = 100 * 0.2 = 20 kWh/day
    // hoursNeeded = 20/7 ≈ 2.857 hours
    // window: 22→6 (8 hours): pos 0=h22, pos 1=h23, pos 2=h0, pos 3=h1 ...
    const cfg: EVConfig = {
      ...base,
      monthlyKm: 3000,
      chargingKw: 7,
      chargeStart: 22,
      chargeEnd: 6,
    }
    expect(evHourlyKw(22, cfg)).toBeCloseTo(7)          // pos 0 < floor(2.857)=2
    expect(evHourlyKw(23, cfg)).toBeCloseTo(7)          // pos 1 < 2
    expect(evHourlyKw(0, cfg)).toBeCloseTo(7 * 0.857, 1) // pos 2, fractional
    expect(evHourlyKw(1, cfg)).toBe(0)                  // pos 3 > 2.857
    expect(evHourlyKw(21, cfg)).toBe(0)                 // outside window
  })

  it('start === end is treated as a full 24-hour window', () => {
    // All 24 hours should receive load
    const cfg: EVConfig = { ...base, chargeStart: 0, chargeEnd: 0 }
    // dailyKwh=2, chargingKw=2, hoursNeeded=1.0
    // h=0 is pos 0: full hour → 2 kW
    // h=1 is pos 1: > 1.0 → 0
    expect(evHourlyKw(0, cfg)).toBeCloseTo(2)
    expect(evHourlyKw(1, cfg)).toBe(0)
  })

  it('caps charging at window size when demand exceeds it', () => {
    // dailyKwh=100 kWh (enormous), chargingKw=10, hoursNeeded=10
    // but window is only 2 hours (start=0, end=2)
    // effectiveHours = min(10, 2) = 2
    const cfg: EVConfig = {
      ...base,
      monthlyKm: 15000,   // (15000/30)*0.2=100 kWh/day
      chargingKw: 10,
      chargeStart: 0,
      chargeEnd: 2,
    }
    expect(evHourlyKw(0, cfg)).toBeCloseTo(10) // full hour
    expect(evHourlyKw(1, cfg)).toBeCloseTo(10) // full hour
    expect(evHourlyKw(2, cfg)).toBe(0)         // outside window
  })
})

// ─── getRates ────────────────────────────────────────────────────────────────
describe('getRates', () => {
  it('returns 2026 defaults for year 2026 with no overrides', () => {
    const { R1, R3, R2 } = getRates(2026, {})
    expect(R3.valle).toBeCloseTo(2.98)
    expect(R1.e1).toBeCloseTo(8.228)
    expect(R2.fp).toBeCloseTo(5.821)
  })

  it('falls back to 2026 defaults for an unknown year', () => {
    const { R1 } = getRates(9999, {})
    expect(R1.e1).toBeCloseTo(8.228)
  })

  it('user overrides take precedence over defaults', () => {
    const { R3 } = getRates(2026, { 2026: { t3_valle: 1.234 } })
    expect(R3.valle).toBeCloseTo(1.234)
    // Other fields still come from defaults
    expect(R3.llano).toBeCloseTo(6.309)
  })
})

import { describe, it, expect } from 'vitest'
import { parseCSV } from '../parseCSV'

const HEADER = 'Fecha y hora;kWh'

function makeRow(date: string, hour: number, kwh: string) {
  const hh = String(hour).padStart(2, '0')
  return `${date} ${hh}:00;${kwh}`
}

describe('parseCSV', () => {
  it('parses a single valid row', () => {
    const csv = [HEADER, makeRow('31-03-2025', 10, '1,5')].join('\n')
    const result = parseCSV(csv)
    expect(result.data['2025-03-31'][10]).toBeCloseTo(1.5)
    expect(result.days).toBe(1)
    expect(result.dateFrom).toBe('2025-03-31')
    expect(result.dateTo).toBe('2025-03-31')
    expect(result.years).toContain(2025)
  })

  it('parses multiple days correctly', () => {
    const rows = [
      makeRow('01-01-2025', 0, '2,0'),
      makeRow('02-01-2025', 12, '3,0'),
      makeRow('03-01-2025', 23, '1,0'),
    ]
    const result = parseCSV([HEADER, ...rows].join('\n'))
    expect(result.days).toBe(3)
    expect(result.dateFrom).toBe('2025-01-01')
    expect(result.dateTo).toBe('2025-01-03')
  })

  it('handles CRLF line endings', () => {
    const csv = [HEADER, makeRow('31-03-2025', 5, '0,5')].join('\r\n')
    const result = parseCSV(csv)
    expect(result.data['2025-03-31'][5]).toBeCloseTo(0.5)
  })

  it('skips malformed rows without throwing', () => {
    const csv = [
      HEADER,
      'bad-row-no-semicolon',
      makeRow('01-06-2025', 8, 'abc'),
      makeRow('01-06-2025', 9, '2,0'),
    ].join('\n')
    expect(() => parseCSV(csv)).not.toThrow()
    const result = parseCSV(csv)
    expect(result.data['2025-06-01'][8]).toBeUndefined()
    expect(result.data['2025-06-01'][9]).toBeCloseTo(2.0)
  })

  it('returns empty result for header-only CSV', () => {
    const result = parseCSV(HEADER)
    expect(result.days).toBe(0)
    expect(result.dateFrom).toBe('?')
    expect(result.dateTo).toBe('?')
    expect(result.years).toHaveLength(0)
  })

  it('collects multiple years', () => {
    const rows = [
      makeRow('31-12-2024', 23, '1,0'),
      makeRow('01-01-2025', 0, '2,0'),
    ]
    const result = parseCSV([HEADER, ...rows].join('\n'))
    expect(result.years).toContain(2024)
    expect(result.years).toContain(2025)
  })

  it('converts comma decimal separator to float', () => {
    const csv = [HEADER, makeRow('15-06-2025', 14, '7,34')].join('\n')
    const result = parseCSV(csv)
    expect(result.data['2025-06-15'][14]).toBeCloseTo(7.34)
  })
})

import { describe, it, expect } from 'vitest'
import { fmt, formatDateShort, parseNum } from '../format'

describe('fmt', () => {
  it('formats numbers below 1000 as dollars', () => {
    expect(fmt(0)).toBe('$0')
    expect(fmt(999)).toBe('$999')
    expect(fmt(500)).toBe('$500')
  })

  it('formats 1000 as $1.0k', () => {
    expect(fmt(1000)).toBe('$1.0k')
  })

  it('formats numbers >= 1000 in k notation', () => {
    expect(fmt(3500)).toBe('$3.5k')
    expect(fmt(12000)).toBe('$12.0k')
    expect(fmt(1234)).toBe('$1.2k')
  })
})

describe('formatDateShort', () => {
  it('formats a valid date string', () => {
    expect(formatDateShort('2025-03-31')).toBe('31 Mar 2025')
    expect(formatDateShort('2026-01-01')).toBe('1 Ene 2026')
    expect(formatDateShort('2024-12-25')).toBe('25 Dic 2024')
  })

  it('returns ? for invalid or placeholder input', () => {
    expect(formatDateShort('?')).toBe('?')
    expect(formatDateShort('')).toBe('?')
  })
})

describe('parseNum', () => {
  it('parses a numeric string with dot decimal', () => {
    expect(parseNum('3.14')).toBeCloseTo(3.14)
  })

  it('parses a string with comma decimal (UTE format)', () => {
    expect(parseNum('1,5')).toBeCloseTo(1.5)
    expect(parseNum('0,75')).toBeCloseTo(0.75)
  })

  it('passes through a number directly', () => {
    expect(parseNum(42)).toBe(42)
    expect(parseNum(0)).toBe(0)
  })
})

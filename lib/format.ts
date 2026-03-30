import { MONTH_NAMES } from './constants'

export function fmt(n: number): string {
  return n >= 1000 ? '$' + (n / 1000).toFixed(1) + 'k' : '$' + n.toFixed(0)
}

export function formatDateShort(ds: string): string {
  if (!ds || ds === '?') return '?'
  const [y, m, d] = ds.split('-').map(Number)
  return `${d} ${MONTH_NAMES[m - 1]} ${y}`
}

export function parseNum(v: string | number): number {
  return parseFloat(String(v).replace(',', '.'))
}

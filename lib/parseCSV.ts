import type { ParseResult, MergedData } from './types'

export function parseCSV(text: string): ParseResult {
  const lines = text.trim().replace(/\r/g, '').split('\n')
  const data: MergedData = {}
  const dates = new Set<string>()
  const years = new Set<number>()

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line) continue
    const parts = line.split(';')
    if (parts.length < 2) continue
    const val = parseFloat(parts[1].replace(',', '.'))
    if (isNaN(val)) continue
    const sp = parts[0].split(' ')
    if (sp.length < 2) continue
    const [dd, mm, yyyy] = sp[0].split('-')
    const dateKey = `${yyyy}-${mm}-${dd}`
    const hour = parseInt(sp[1].split(':')[0])
    if (!data[dateKey]) data[dateKey] = {}
    data[dateKey][hour] = val
    dates.add(dateKey)
    years.add(parseInt(yyyy))
  }

  const sorted = [...dates].sort()
  return {
    data,
    dateFrom: sorted[0] || '?',
    dateTo: sorted[sorted.length - 1] || '?',
    days: sorted.length,
    years: [...years],
  }
}

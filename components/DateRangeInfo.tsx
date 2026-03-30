import { formatDateShort } from '@/lib/format'

interface Props {
  dateFrom: string
  dateTo: string
  dayCount: number
  fileCount: number
  years: number[]
}

export default function DateRangeInfo({ dateFrom, dateTo, dayCount, fileCount, years }: Props) {
  return (
    <p className="font-mono text-[12px] text-text-muted text-center mb-4">
      <b className="text-orange">{formatDateShort(dateFrom)}</b>
      {' → '}
      <b className="text-orange">{formatDateShort(dateTo)}</b>
      {' · '}{dayCount} días · {fileCount} archivo{fileCount > 1 ? 's' : ''} · Años:{' '}
      {years.join(', ')}
    </p>
  )
}

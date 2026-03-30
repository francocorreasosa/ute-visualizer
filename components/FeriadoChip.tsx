import { DAY_NAMES, MONTH_NAMES } from '@/lib/constants'

interface Props {
  dateStr: string
  name: string
  onRemove: () => void
}

export default function FeriadoChip({ dateStr, name, onRemove }: Props) {
  const [y, m, d] = dateStr.split('-').map(Number)
  const dt = new Date(y, m - 1, d)
  const dn = DAY_NAMES[dt.getDay()]
  const mn = MONTH_NAMES[m - 1]

  return (
    <div className="bg-slate-dark border border-slate-border rounded-md px-[10px] py-1 flex items-center gap-[6px] text-text-data font-mono text-[11px]">
      {dn} {d} {mn}{' '}
      <span className="text-text-dim text-[9px]">{y}</span>{' '}
      <span className="text-[#c084fc] text-[10px]">{name}</span>
      <span
        className="cursor-pointer text-red font-bold text-sm leading-none hover:text-[#f87171]"
        onClick={onRemove}
      >
        ×
      </span>
    </div>
  )
}

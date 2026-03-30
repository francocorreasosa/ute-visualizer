import type { LoadedFile } from '@/lib/types'
import { formatDateShort } from '@/lib/format'

interface Props {
  file: LoadedFile
  onRemove: () => void
}

export default function FileChip({ file, onRemove }: Props) {
  return (
    <div className="bg-slate-dark border border-slate-border rounded-md px-[10px] py-1 font-mono text-[10.5px] text-[#9ca3af] flex items-center gap-[6px]">
      {file.name}
      <span className="text-green">
        {formatDateShort(file.dateFrom)} → {formatDateShort(file.dateTo)} ({file.days}d)
      </span>
      <span
        className="cursor-pointer text-red font-bold text-sm leading-none hover:text-[#f87171]"
        onClick={onRemove}
      >
        ×
      </span>
    </div>
  )
}

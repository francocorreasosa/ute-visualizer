import { fmt } from '@/lib/format'

interface Props {
  diff: number
  diffPct: number
  winnerLabel: string
  dayCount: number
  isMultiYear: boolean
}

export default function DiffBar({ diff, diffPct, winnerLabel, dayCount, isMultiYear }: Props) {
  const savings = Math.abs(diff)
  const barWidth = Math.min(diffPct * 3, 100)

  return (
    <div className="mt-5 bg-card rounded-[14px] px-6 py-5 border border-[rgba(255,255,255,0.06)] text-center">
      <div className="font-mono text-[12px] text-text-muted mb-[10px]">
        Diferencia en el período ({dayCount} días{isMultiYear ? ' · multi-año' : ''})
      </div>
      <div className="w-full max-w-[400px] h-[28px] bg-slate-dark rounded-md overflow-hidden mx-auto">
        <div
          className="h-full rounded-md transition-[width] duration-700 ease-in-out"
          style={{
            width: `${barWidth}%`,
            background: 'linear-gradient(90deg,#22c55e,#16a34a)',
          }}
        />
      </div>
      <div className="font-mono text-[24px] font-bold text-green mt-[10px]">
        {diff === 0 ? 'Empate' : `Ahorrás ${fmt(savings)} con ${winnerLabel}`}
      </div>
      <div className="font-mono text-[13px] text-text-muted mt-[2px]">
        {diffPct.toFixed(1)}%{' '}
        {diff > 0 ? 'más barato con doble' : 'más barato con triple'}
      </div>
    </div>
  )
}

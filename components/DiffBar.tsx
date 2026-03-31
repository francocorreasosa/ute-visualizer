import { fmt } from '@/lib/format'

interface Props {
  g3: number
  g2: number
  g1: number
  dayCount: number
  isMultiYear: boolean
}

const PLAN_NAMES: Record<string, string> = {
  triple: 'Triple Horario',
  doble: 'Doble Horario',
  simple: 'Simple',
}

export default function DiffBar({ g3, g2, g1, dayCount, isMultiYear }: Props) {
  const plans = [
    { key: 'triple', cost: g3 },
    { key: 'doble', cost: g2 },
    { key: 'simple', cost: g1 },
  ].sort((a, b) => a.cost - b.cost)

  const winner = plans[0]
  const second = plans[1]
  const savings = second.cost - winner.cost
  const savingsPct = second.cost > 0 ? (savings / second.cost) * 100 : 0
  const barWidth = Math.min(savingsPct * 3, 100)

  return (
    <div className="mt-5 bg-card rounded-[14px] px-6 py-5 border border-[rgba(255,255,255,0.06)] text-center">
      <div className="font-mono text-[12px] text-text-muted mb-[10px]">
        Diferencia en el período ({dayCount} días{isMultiYear ? ' · multi-año' : ''})
      </div>
      <div className="w-full max-w-[400px] h-[28px] bg-slate-dark rounded-md overflow-hidden mx-auto">
        <div
          className="h-full rounded-md transition-[width] duration-700 ease-in-out"
          style={{ width: `${barWidth}%`, background: 'linear-gradient(90deg,#22c55e,#16a34a)' }}
        />
      </div>
      <div className="font-mono text-[24px] font-bold text-green mt-[10px]">
        {savings < 0.01 ? 'Empate' : `Ahorrás ${fmt(savings)} con ${PLAN_NAMES[winner.key]}`}
      </div>
      <div className="font-mono text-[13px] text-text-muted mt-[2px]">
        {savingsPct.toFixed(1)}% más barato que {PLAN_NAMES[second.key]}
      </div>
    </div>
  )
}

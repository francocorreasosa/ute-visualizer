import { fmt, fmtFull } from '@/lib/format'
import type { MonthlyCost } from '@/lib/chartData'

interface Props {
  g3: number
  g2: number
  g1: number
  dayCount: number
  isMultiYear: boolean
  monthlyCosts: MonthlyCost[]
}

const PLAN_NAMES: Record<string, string> = {
  triple: 'Triple Horario',
  doble: 'Doble Horario',
  simple: 'Simple',
}

export default function DiffBar({ g3, g2, g1, dayCount, isMultiYear, monthlyCosts }: Props) {
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

      {monthlyCosts.length >= 2 && (
        <div className="mt-5 border-t border-[rgba(255,255,255,0.06)] pt-4">
          <div className="font-mono text-[11px] text-text-dim mb-3 uppercase tracking-wider">
            Comparación mensual
          </div>
          <div className="overflow-x-auto">
            <table className="w-full font-mono text-[12px] border-separate border-spacing-y-[3px]">
              <thead>
                <tr className="text-text-dim text-[10px] uppercase tracking-wider">
                  <th className="text-left pb-1 px-2 font-normal">Mes</th>
                  <th className="text-right pb-1 px-2 font-normal">Triple</th>
                  <th className="text-right pb-1 px-2 font-normal">Doble</th>
                  <th className="text-right pb-1 px-2 font-normal">Simple</th>
                  <th className="text-right pb-1 px-2 font-normal">Más barato</th>
                </tr>
              </thead>
              <tbody>
                {monthlyCosts.map(({ monthKey, label, g3: mg3, g2: mg2, g1: mg1 }) => {
                  const minCost = Math.min(mg3, mg2, mg1)
                  const winnerKey = mg3 === minCost ? 'triple' : mg2 === minCost ? 'doble' : 'simple'
                  const winnerLabel = winnerKey === 'triple' ? 'Triple' : winnerKey === 'doble' ? 'Doble' : 'Simple'
                  const winnerColor = winnerKey === 'triple' ? '#ff6b2b' : winnerKey === 'doble' ? '#8b5cf6' : '#22c55e'
                  return (
                    <tr key={monthKey} className="bg-[rgba(255,255,255,0.02)] rounded-md">
                      <td className="text-left px-2 py-[5px] text-text-muted rounded-l-md">{label}</td>
                      <td className="text-right px-2 py-[5px] text-[#ff6b2b]">{fmtFull(mg3)}</td>
                      <td className="text-right px-2 py-[5px] text-[#8b5cf6]">{fmtFull(mg2)}</td>
                      <td className="text-right px-2 py-[5px] text-[#22c55e]">{fmtFull(mg1)}</td>
                      <td className="text-right px-2 py-[5px] rounded-r-md font-bold" style={{ color: winnerColor }}>
                        {winnerLabel}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

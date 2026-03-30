import { fmt } from '@/lib/format'

export interface BreakdownItem {
  label: string
  value: string
  color?: string
}

interface Props {
  planName: string
  total: number
  isWinner: boolean
  breakdown: BreakdownItem[]
  avgPerKwh: number
  accentColor: string
}

export default function PlanCard({ planName, total, isWinner, breakdown, avgPerKwh, accentColor }: Props) {
  return (
    <div
      className={`bg-card rounded-[14px] p-6 border relative overflow-hidden ${
        isWinner ? 'border-[rgba(34,197,94,0.3)]' : 'border-[rgba(255,255,255,0.06)]'
      }`}
    >
      {isWinner && (
        <div className="absolute top-3 right-3 bg-green text-bg font-mono text-[10px] font-bold px-2 py-[3px] rounded uppercase tracking-[0.5px]">
          Más barato
        </div>
      )}
      <div className="font-mono text-[13px] font-semibold text-[#9ca3af] uppercase tracking-[1.5px] mb-1">
        {planName}
      </div>
      <div
        className="font-mono text-[32px] font-bold mb-4"
        style={{ color: isWinner ? '#22c55e' : '#e0e4f0' }}
      >
        {fmt(total)}
      </div>
      <ul className="list-none p-0">
        {breakdown.map((item, i) => (
          <li
            key={i}
            className="flex justify-between items-center font-mono text-[12px] py-[6px] border-b border-[rgba(255,255,255,0.04)] text-[#9ca3af] last:border-0"
          >
            <span>{item.label}</span>
            <span className="text-text-data font-semibold" style={{ color: item.color }}>
              {item.value}
            </span>
          </li>
        ))}
        <li className="flex justify-between items-center font-mono text-[12px] py-[6px] border-t border-[rgba(255,255,255,0.1)] pt-2 text-[#9ca3af] mt-1">
          <span>$/kWh promedio</span>
          <span className="text-amber font-semibold">${avgPerKwh.toFixed(2)}</span>
        </li>
      </ul>
    </div>
  )
}

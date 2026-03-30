import type { ComputedStats } from '@/lib/types'

interface Props {
  stats: ComputedStats
}

function StatCard({
  label,
  value,
  sub,
  color,
}: {
  label: string
  value: string
  sub?: string
  color: string
}) {
  return (
    <div className="bg-card rounded-[10px] px-[18px] py-3 text-center border border-[rgba(255,255,255,0.05)] min-w-[110px]">
      <div className="text-[9.5px] text-text-dim font-mono uppercase tracking-[1.2px] mb-[3px]">
        {label}
      </div>
      <div className={`text-[20px] font-bold font-mono ${color}`}>{value}</div>
      {sub && <div className="text-[10px] text-text-dim font-mono mt-[2px]">{sub}</div>}
    </div>
  )
}

export default function StatsCards({ stats }: Props) {
  const { totalKwh, valle, llano, punta } = stats
  return (
    <div className="flex gap-4 justify-center mt-[22px] flex-wrap">
      <StatCard label="Total" value={`${totalKwh.toFixed(0)} kWh`} color="text-orange" />
      <StatCard
        label="Valle"
        value={`${valle.kwh.toFixed(0)} kWh`}
        sub={`${valle.pct.toFixed(0)}%`}
        color="text-green"
      />
      <StatCard
        label="Llano"
        value={`${llano.kwh.toFixed(0)} kWh`}
        sub={`${llano.pct.toFixed(0)}%`}
        color="text-[#06b6d4]"
      />
      <StatCard
        label="Punta"
        value={`${punta.kwh.toFixed(0)} kWh`}
        sub={`${punta.pct.toFixed(0)}%`}
        color="text-red"
      />
    </div>
  )
}

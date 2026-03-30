import type { ComputedComparison, ComputedStats } from '@/lib/types'
import { fmt } from '@/lib/format'
import PlanCard from './PlanCard'
import DiffBar from './DiffBar'

interface Props {
  comparison: ComputedComparison
  stats: ComputedStats
  dayCount: number
  isMultiYear: boolean
}

export default function CompareSection({ comparison, stats, dayCount, isMultiYear }: Props) {
  const { g3, g2, c3, c2, k3, k2 } = comparison
  const { totalKwh } = stats
  const diff = g3 - g2
  const diffPct = Math.abs(diff / Math.min(g3, g2)) * 100
  const tripleWins = diff < 0
  const dobleWins = diff > 0
  const winnerLabel = tripleWins ? 'Triple horario' : 'Doble horario'

  const triple3Breakdown = [
    { label: 'Valle (00–06)', value: fmt(c3.Valle), color: '#22c55e' },
    { label: `${k3.Valle.toFixed(0)} kWh`, value: `${totalKwh > 0 ? ((k3.Valle / totalKwh) * 100).toFixed(0) : 0}%` },
    { label: 'Llano (07–16, 21–23)', value: fmt(c3.Llano), color: '#3b82f6' },
    { label: `${k3.Llano.toFixed(0)} kWh`, value: `${totalKwh > 0 ? ((k3.Llano / totalKwh) * 100).toFixed(0) : 0}%` },
    { label: 'Punta (17–20 lab.)', value: fmt(c3.Punta), color: '#ef4444' },
    { label: `${k3.Punta.toFixed(0)} kWh`, value: `${totalKwh > 0 ? ((k3.Punta / totalKwh) * 100).toFixed(0) : 0}%` },
  ]

  const doble2Breakdown = [
    { label: 'Punta (17–20 lab.)', value: fmt(c2.Punta), color: '#ef4444' },
    { label: `${k2.Punta.toFixed(0)} kWh`, value: `${totalKwh > 0 ? ((k2.Punta / totalKwh) * 100).toFixed(0) : 0}%` },
    { label: 'Fuera de Punta (resto)', value: fmt(c2['Fuera de Punta']), color: '#3b82f6' },
    { label: `${k2['Fuera de Punta'].toFixed(0)} kWh`, value: `${totalKwh > 0 ? ((k2['Fuera de Punta'] / totalKwh) * 100).toFixed(0) : 0}%` },
  ]

  return (
    <div className="mt-8 w-full max-w-content">
      <h2
        className="text-[20px] font-bold text-center mb-5"
        style={{
          background: 'linear-gradient(135deg,#3b82f6,#8b5cf6)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}
      >
        Triple Horario vs Doble Horario
      </h2>
      <div className="grid grid-cols-2 gap-4 max-[640px]:grid-cols-1">
        <PlanCard
          planName="Triple Horario"
          total={g3}
          isWinner={tripleWins}
          breakdown={triple3Breakdown}
          avgPerKwh={totalKwh > 0 ? g3 / totalKwh : 0}
          accentColor="#ff6b2b"
        />
        <PlanCard
          planName="Doble Horario"
          total={g2}
          isWinner={dobleWins}
          breakdown={doble2Breakdown}
          avgPerKwh={totalKwh > 0 ? g2 / totalKwh : 0}
          accentColor="#8b5cf6"
        />
      </div>
      <DiffBar
        diff={diff}
        diffPct={diffPct}
        winnerLabel={winnerLabel}
        dayCount={dayCount}
        isMultiYear={isMultiYear}
      />
    </div>
  )
}

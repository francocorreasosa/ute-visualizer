import type { ComputedComparison, ComputedStats } from '@/lib/types'
import type { MonthlyCost } from '@/lib/chartData'
import { fmt } from '@/lib/format'
import PlanCard from './PlanCard'
import DiffBar from './DiffBar'

interface Props {
  comparison: ComputedComparison
  stats: ComputedStats
  dayCount: number
  isMultiYear: boolean
  puntaStart: number
  monthlyCosts: MonthlyCost[]
}

export default function CompareSection({ comparison, stats, dayCount, isMultiYear, puntaStart, monthlyCosts }: Props) {
  const { g3, g2, g1, c3, c2, c1, k3, k2, k1 } = comparison
  const { totalKwh } = stats
  const puntaLabel = `${puntaStart}–${puntaStart + 3}`

  const minCost = Math.min(g3, g2, g1)

  const triple3Breakdown = [
    { label: 'Valle (00–06)', value: fmt(c3.Valle), color: '#22c55e' },
    { label: `${k3.Valle.toFixed(0)} kWh`, value: `${totalKwh > 0 ? ((k3.Valle / totalKwh) * 100).toFixed(0) : 0}%` },
    { label: 'Llano (resto lab.)', value: fmt(c3.Llano), color: '#3b82f6' },
    { label: `${k3.Llano.toFixed(0)} kWh`, value: `${totalKwh > 0 ? ((k3.Llano / totalKwh) * 100).toFixed(0) : 0}%` },
    { label: `Punta (${puntaLabel} lab.)`, value: fmt(c3.Punta), color: '#ef4444' },
    { label: `${k3.Punta.toFixed(0)} kWh`, value: `${totalKwh > 0 ? ((k3.Punta / totalKwh) * 100).toFixed(0) : 0}%` },
  ]

  const doble2Breakdown = [
    { label: `Punta (${puntaLabel} lab.)`, value: fmt(c2.Punta), color: '#ef4444' },
    { label: `${k2.Punta.toFixed(0)} kWh`, value: `${totalKwh > 0 ? ((k2.Punta / totalKwh) * 100).toFixed(0) : 0}%` },
    { label: 'Fuera de Punta (resto)', value: fmt(c2['Fuera de Punta']), color: '#3b82f6' },
    { label: `${k2['Fuera de Punta'].toFixed(0)} kWh`, value: `${totalKwh > 0 ? ((k2['Fuera de Punta'] / totalKwh) * 100).toFixed(0) : 0}%` },
  ]

  const simple1Breakdown = [
    { label: '1° escalón (1–100 kWh)', value: fmt(c1.e1), color: '#22c55e' },
    { label: `${k1.e1.toFixed(0)} kWh`, value: `${totalKwh > 0 ? ((k1.e1 / totalKwh) * 100).toFixed(0) : 0}%` },
    { label: '2° escalón (101–600 kWh)', value: fmt(c1.e2), color: '#f59e0b' },
    { label: `${k1.e2.toFixed(0)} kWh`, value: `${totalKwh > 0 ? ((k1.e2 / totalKwh) * 100).toFixed(0) : 0}%` },
    { label: '3° escalón (601+ kWh)', value: fmt(c1.e3), color: '#ef4444' },
    { label: `${k1.e3.toFixed(0)} kWh`, value: `${totalKwh > 0 ? ((k1.e3 / totalKwh) * 100).toFixed(0) : 0}%` },
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
        Comparación de tarifas
      </h2>
      <div className="grid grid-cols-3 gap-4 max-[768px]:grid-cols-1">
        <PlanCard
          planName="Triple Horario"
          total={g3}
          isWinner={g3 === minCost}
          breakdown={triple3Breakdown}
          avgPerKwh={totalKwh > 0 ? g3 / totalKwh : 0}
          accentColor="#ff6b2b"
        />
        <PlanCard
          planName="Doble Horario"
          total={g2}
          isWinner={g2 === minCost}
          breakdown={doble2Breakdown}
          avgPerKwh={totalKwh > 0 ? g2 / totalKwh : 0}
          accentColor="#8b5cf6"
        />
        <PlanCard
          planName="Simple"
          total={g1}
          isWinner={g1 === minCost}
          breakdown={simple1Breakdown}
          avgPerKwh={totalKwh > 0 ? g1 / totalKwh : 0}
          accentColor="#22c55e"
        />
      </div>
      <DiffBar
        g3={g3}
        g2={g2}
        g1={g1}
        dayCount={dayCount}
        isMultiYear={isMultiYear}
        monthlyCosts={monthlyCosts}
      />
    </div>
  )
}

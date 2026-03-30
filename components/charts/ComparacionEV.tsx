'use client'

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts'
import type { EvComparison } from '@/lib/chartData'
import ChartCard from './ChartCard'

interface Props { data: EvComparison | null }

const BARS = [
  { name: 'Triple con EV', key: 'tripleWith', fill: '#ff6b2b' },
  { name: 'Triple sin EV', key: 'tripleWithout', fill: '#ffa07a' },
  { name: 'Doble con EV', key: 'dobleWith', fill: '#8b5cf6' },
  { name: 'Doble sin EV', key: 'dobleWithout', fill: '#c4b5fd' },
]

export default function ComparacionEV({ data }: Props) {
  if (!data) return null

  const chartData = BARS.map(({ name, key, fill }) => ({
    name,
    value: data[key as keyof EvComparison] as number,
    fill,
  }))

  return (
    <ChartCard
      title="Impacto del auto eléctrico"
      subtitle="Costo total con y sin simulación EV (−6.5 kWh en horas > 7 kWh)"
    >
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={chartData} margin={{ top: 4, right: 8, left: -4, bottom: 40 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
          <XAxis
            dataKey="name"
            tick={{ fill: '#9ca3af', fontSize: 10, fontFamily: 'JetBrains Mono' }}
            stroke="rgba(255,255,255,0.08)"
            angle={-20}
            textAnchor="end"
            interval={0}
          />
          <YAxis
            tick={{ fill: '#6b7280', fontSize: 10, fontFamily: 'JetBrains Mono' }}
            stroke="rgba(255,255,255,0.08)"
            tickFormatter={(v) => v >= 1000 ? `$${(v / 1000).toFixed(1)}k` : `$${v.toFixed(0)}`}
          />
          <Tooltip
            contentStyle={{ background: '#111827', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontFamily: 'JetBrains Mono', fontSize: 11 }}
            formatter={(v: number) => [v >= 1000 ? `$${(v / 1000).toFixed(2)}k` : `$${v.toFixed(1)}`]}
          />
          <Bar dataKey="value" name="Costo total">
            {chartData.map((d, i) => (
              <Cell key={i} fill={d.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}

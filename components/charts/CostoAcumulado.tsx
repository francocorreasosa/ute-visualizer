'use client'

import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import type { CumulativeCost } from '@/lib/chartData'
import ChartCard from './ChartCard'

interface Props { data: CumulativeCost[] }

export default function CostoAcumulado({ data }: Props) {
  return (
    <ChartCard
      title="Costo acumulado en el tiempo"
      subtitle="$ acumulados — Triple Horario vs Doble Horario"
    >
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data} margin={{ top: 4, right: 8, left: -4, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
          <XAxis
            dataKey="label"
            tick={false}
            stroke="rgba(255,255,255,0.08)"
          />
          <YAxis
            tick={{ fill: '#6b7280', fontSize: 10, fontFamily: 'JetBrains Mono' }}
            stroke="rgba(255,255,255,0.08)"
            tickFormatter={(v) => v >= 1000 ? `$${(v / 1000).toFixed(1)}k` : `$${v.toFixed(0)}`}
          />
          <Tooltip
            contentStyle={{ background: '#111827', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontFamily: 'JetBrains Mono', fontSize: 11 }}
            labelFormatter={(_, payload) => payload?.[0]?.payload?.date ?? ''}
            formatter={(v: number) => [v >= 1000 ? `$${(v / 1000).toFixed(2)}k` : `$${v.toFixed(1)}`]}
          />
          <Legend wrapperStyle={{ fontFamily: 'JetBrains Mono', fontSize: 10 }} />
          <Line
            type="monotone" dataKey="g3" name="Triple Horario"
            stroke="#ff6b2b" strokeWidth={2} dot={false}
          />
          <Line
            type="monotone" dataKey="g2" name="Doble Horario"
            stroke="#8b5cf6" strokeWidth={2} dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}

'use client'

import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import type { RollingDay } from '@/lib/chartData'
import ChartCard from './ChartCard'

interface Props { data: RollingDay[] }

export default function Rolling7Dias({ data }: Props) {
  return (
    <ChartCard
      title="Consumo diario y media móvil 7 días"
      subtitle="Barras: kWh por día — línea: media móvil 7 días"
    >
      <ResponsiveContainer width="100%" height={220}>
        <ComposedChart data={data} margin={{ top: 4, right: 8, left: -10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
          <XAxis
            dataKey="label"
            tick={false}
            stroke="rgba(255,255,255,0.08)"
          />
          <YAxis
            tick={{ fill: '#6b7280', fontSize: 10, fontFamily: 'JetBrains Mono' }}
            stroke="rgba(255,255,255,0.08)"
            tickFormatter={(v) => v.toFixed(0)}
          />
          <Tooltip
            contentStyle={{ background: '#111827', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontFamily: 'JetBrains Mono', fontSize: 11 }}
            labelFormatter={(_, payload) => payload?.[0]?.payload?.date ?? ''}
            formatter={(v: number, name: string) => [
              `${v.toFixed(1)} kWh`,
              name,
            ]}
          />
          <Legend wrapperStyle={{ fontFamily: 'JetBrains Mono', fontSize: 10 }} />
          <Bar dataKey="dailyKwh" name="kWh/día" fill="rgba(59,130,246,0.4)" />
          <Line
            type="monotone"
            dataKey="rolling7"
            name="Media 7d"
            stroke="#f59e0b"
            strokeWidth={2}
            dot={false}
            connectNulls={false}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}

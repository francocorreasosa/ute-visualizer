'use client'

import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import type { MonthSeries } from '@/lib/chartData'
import ChartCard from './ChartCard'

interface Props { data: MonthSeries[] }

// Distinct colors for up to ~12 months
const PALETTE = [
  '#ff6b2b', '#3b82f6', '#22c55e', '#f59e0b',
  '#8b5cf6', '#ef4444', '#06b6d4', '#ec4899',
  '#84cc16', '#f97316', '#6366f1', '#14b8a6',
]

export default function ConsumoPorDiaMes({ data }: Props) {
  if (data.length < 2) return null

  // Build recharts rows: one per day-of-month (1–31), cumulative kWh
  const rows = Array.from({ length: 31 }, (_, i) => {
    const day = i + 1
    const row: Record<string, number | null> & { day: number } = { day }
    for (const m of data) {
      // Sum all days from 1 to `day` that have data
      let cum = 0
      let hasAny = false
      for (let d = 1; d <= day; d++) {
        if (m.days[d] != null) { cum += m.days[d]; hasAny = true }
      }
      row[m.label] = hasAny ? cum : null
    }
    return row
  })

  return (
    <ChartCard
      title="Consumo acumulado por mes"
      subtitle="kWh acumulados a lo largo del mes — cada línea es un mes distinto"
    >
      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={rows} margin={{ top: 4, right: 8, left: -10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
          <XAxis
            dataKey="day"
            tick={{ fill: '#6b7280', fontSize: 10, fontFamily: 'JetBrains Mono' }}
            stroke="rgba(255,255,255,0.08)"
            tickFormatter={(d) => `${d}`}
          />
          <YAxis
            tick={{ fill: '#6b7280', fontSize: 10, fontFamily: 'JetBrains Mono' }}
            stroke="rgba(255,255,255,0.08)"
            tickFormatter={(v) => v.toFixed(0)}
          />
          <Tooltip
            contentStyle={{ background: '#111827', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontFamily: 'JetBrains Mono', fontSize: 11 }}
            labelFormatter={(d) => `Día ${d}`}
            formatter={(v) => [typeof v === 'number' ? `${v.toFixed(1)} kWh` : '']}
          />
          <Legend wrapperStyle={{ fontFamily: 'JetBrains Mono', fontSize: 10 }} />
          {data.map((m, i) => (
            <Line
              key={m.monthKey}
              type="monotone"
              dataKey={m.label}
              stroke={PALETTE[i % PALETTE.length]}
              strokeWidth={2}
              dot={false}
              connectNulls={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}

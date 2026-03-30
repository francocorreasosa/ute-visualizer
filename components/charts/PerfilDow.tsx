'use client'

import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import type { DowProfile } from '@/lib/chartData'
import ChartCard from './ChartCard'

interface Props { data: DowProfile[] }

const DOW_COLORS: Record<string, string> = {
  Lun: '#3b82f6',
  Mar: '#22c55e',
  Mie: '#f59e0b',
  Jue: '#ff6b2b',
  Vie: '#ef4444',
  Sab: '#8b5cf6',
  Dom: '#6b7280',
}

export default function PerfilDow({ data }: Props) {
  return (
    <ChartCard
      title="Perfil por día de la semana"
      subtitle="kWh promedio por hora según día"
    >
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data} margin={{ top: 4, right: 8, left: -10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
          <XAxis
            dataKey="hour"
            tickFormatter={(h) => `${h}h`}
            tick={{ fill: '#6b7280', fontSize: 10, fontFamily: 'JetBrains Mono' }}
            stroke="rgba(255,255,255,0.08)"
          />
          <YAxis
            tick={{ fill: '#6b7280', fontSize: 10, fontFamily: 'JetBrains Mono' }}
            stroke="rgba(255,255,255,0.08)"
            tickFormatter={(v) => v.toFixed(1)}
          />
          <Tooltip
            contentStyle={{ background: '#111827', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontFamily: 'JetBrains Mono', fontSize: 11 }}
            labelFormatter={(h) => `Hora ${h}:00`}
            formatter={(v) => [typeof v === "number" ? `${v.toFixed(2)} kWh` : ""]}
          />
          <Legend wrapperStyle={{ fontFamily: 'JetBrains Mono', fontSize: 10 }} />
          {Object.entries(DOW_COLORS).map(([dow, color]) => (
            <Line
              key={dow}
              type="monotone"
              dataKey={dow}
              name={dow}
              stroke={color}
              strokeWidth={1.5}
              dot={false}
              connectNulls
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}

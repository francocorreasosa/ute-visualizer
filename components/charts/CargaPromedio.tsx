'use client'

import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import type { HourProfile } from '@/lib/chartData'
import ChartCard from './ChartCard'

interface Props { data: HourProfile[] }

export default function CargaPromedio({ data }: Props) {
  return (
    <ChartCard
      title="Curva de carga promedio"
      subtitle="kWh promedio por hora — laborables vs fines de semana / feriados"
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
          <Line
            type="monotone" dataKey="laboral" name="Laborable"
            stroke="#ff6b2b" strokeWidth={2} dot={false} connectNulls
          />
          <Line
            type="monotone" dataKey="finde" name="Finde/Feriado"
            stroke="#8b5cf6" strokeWidth={2} dot={false} connectNulls
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}

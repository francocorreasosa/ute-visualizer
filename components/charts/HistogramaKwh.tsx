'use client'

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import type { KwhBin } from '@/lib/chartData'
import ChartCard from './ChartCard'

interface Props { data: KwhBin[] }

export default function HistogramaKwh({ data }: Props) {
  return (
    <ChartCard
      title="Distribución de consumo horario"
      subtitle="Frecuencia de valores kWh por hora — pico bimodal indica carga de EV"
    >
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} margin={{ top: 4, right: 8, left: -10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
          <XAxis
            dataKey="bin"
            tickFormatter={(v) => `${v}`}
            tick={{ fill: '#6b7280', fontSize: 9, fontFamily: 'JetBrains Mono' }}
            stroke="rgba(255,255,255,0.08)"
            interval="preserveStartEnd"
          />
          <YAxis
            tick={{ fill: '#6b7280', fontSize: 10, fontFamily: 'JetBrains Mono' }}
            stroke="rgba(255,255,255,0.08)"
          />
          <Tooltip
            contentStyle={{ background: '#111827', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontFamily: 'JetBrains Mono', fontSize: 11 }}
            labelFormatter={(v) => `${v}–${(parseFloat(v) + 0.5).toFixed(1)} kWh`}
            formatter={(v: number) => [`${v} horas`]}
          />
          <Bar dataKey="count" name="Horas" fill="#3b82f6" />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}

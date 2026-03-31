'use client'

import type { YearRates } from '@/lib/types'
import { DEFAULT_RATES } from '@/lib/constants'

interface Props {
  detectedYears: number[]
  userRates: Record<number, Partial<YearRates>>
  puntaStart: number
  onRateChange: (year: number, field: keyof YearRates, value: string) => void
}

const FIELDS1: { field: keyof YearRates; label: string; hint: string; color: string }[] = [
  { field: 't1_e1', label: '1° escalón', hint: '1–100 kWh', color: '#22c55e' },
  { field: 't1_e2', label: '2° escalón', hint: '101–600 kWh', color: '#f59e0b' },
  { field: 't1_e3', label: '3° escalón', hint: '601+ kWh', color: '#ef4444' },
]

function getRateValue(year: number, field: keyof YearRates, userRates: Record<number, Partial<YearRates>>): string {
  const def = DEFAULT_RATES[year] ?? DEFAULT_RATES[2026]
  return String(userRates[year]?.[field] ?? def[field])
}

function RateInput({ year, field, label, hint, color, userRates, onRateChange }: {
  year: number
  field: keyof YearRates
  label: string
  hint: string
  color: string
  userRates: Record<number, Partial<YearRates>>
  onRateChange: (year: number, field: keyof YearRates, value: string) => void
}) {
  return (
    <div className="mb-2 font-mono text-[12px]">
      <div className="flex flex-col mb-[3px]">
        <span style={{ color }}>{label}</span>
        {hint && <span className="text-text-dim text-[9px]">{hint}</span>}
      </div>
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={getRateValue(year, field, userRates)}
          onChange={(e) => onRateChange(year, field, e.target.value)}
          className="bg-slate-dark border border-slate-border rounded-md px-[10px] py-[6px] text-text-data font-mono text-[12px] w-full text-right focus:outline-none focus:border-orange"
        />
        <span className="text-text-dim text-[10px] shrink-0">$/kWh</span>
      </div>
    </div>
  )
}

export default function TariffEditor({ detectedYears, userRates, puntaStart, onRateChange }: Props) {
  const years = detectedYears.length > 0 ? detectedYears : [2026]
  const puntaLabel = `${puntaStart}–${puntaStart + 3}`

  const FIELDS3 = [
    { field: 't3_valle' as keyof YearRates, label: 'Valle (00–06)', hint: '', color: '#22c55e' },
    { field: 't3_llano' as keyof YearRates, label: 'Llano', hint: '', color: '#3b82f6' },
    { field: 't3_punta' as keyof YearRates, label: `Punta (${puntaLabel})`, hint: '', color: '#ef4444' },
  ]
  const FIELDS2 = [
    { field: 't2_punta' as keyof YearRates, label: `Punta (${puntaLabel})`, hint: '', color: '#ef4444' },
    { field: 't2_fp' as keyof YearRates, label: 'Fuera de Punta', hint: '', color: '#3b82f6' },
  ]
  const FIELDS1 = [
    { field: 't1_e1' as keyof YearRates, label: '1° escalón', hint: '1–100 kWh', color: '#22c55e' },
    { field: 't1_e2' as keyof YearRates, label: '2° escalón', hint: '101–600 kWh', color: '#f59e0b' },
    { field: 't1_e3' as keyof YearRates, label: '3° escalón', hint: '601+ kWh', color: '#ef4444' },
  ]

  return (
    <div className="w-full max-w-content mb-5">
      {years.map((year) => (
        <div key={year} className="mb-4">
          <div className="font-mono text-[13px] font-bold text-orange mb-[10px] text-center py-[6px] border-b border-[rgba(255,255,255,0.06)]">
            ⚡ Tarifas {year}
          </div>
          <div className="grid grid-cols-3 gap-3 max-[768px]:grid-cols-1">
            {/* Triple Horario */}
            <div className="bg-card rounded-[10px] p-4 border border-[rgba(255,255,255,0.06)]">
              <h3 className="font-mono text-[11px] uppercase tracking-[1.5px] text-orange mb-3">
                Triple Horario
              </h3>
              {FIELDS3.map(({ field, label, hint, color }) => (
                <RateInput key={field} year={year} field={field} label={label} hint={hint} color={color} userRates={userRates} onRateChange={onRateChange} />
              ))}
            </div>

            {/* Doble Horario */}
            <div className="bg-card rounded-[10px] p-4 border border-[rgba(255,255,255,0.06)]">
              <h3 className="font-mono text-[11px] uppercase tracking-[1.5px] text-purple mb-3">
                Doble Horario
              </h3>
              {FIELDS2.map(({ field, label, hint, color }) => (
                <RateInput key={field} year={year} field={field} label={label} hint={hint} color={color} userRates={userRates} onRateChange={onRateChange} />
              ))}
            </div>

            {/* Simple */}
            <div className="bg-card rounded-[10px] p-4 border border-[rgba(255,255,255,0.06)]">
              <h3 className="font-mono text-[11px] uppercase tracking-[1.5px] text-green mb-3">
                Simple
              </h3>
              {FIELDS1.map(({ field, label, hint, color }) => (
                <RateInput key={field} year={year} field={field} label={label} hint={hint} color={color} userRates={userRates} onRateChange={onRateChange} />
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

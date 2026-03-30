'use client'

import type { YearRates } from '@/lib/types'
import { DEFAULT_RATES } from '@/lib/constants'

interface Props {
  detectedYears: number[]
  userRates: Record<number, Partial<YearRates>>
  onRateChange: (year: number, field: keyof YearRates, value: string) => void
}

const FIELDS: { field: keyof YearRates; label: string; color: string }[] = [
  { field: 't3_valle', label: 'Valle (00–06)', color: '#22c55e' },
  { field: 't3_llano', label: 'Llano', color: '#3b82f6' },
  { field: 't3_punta', label: 'Punta (17–20)', color: '#ef4444' },
]

const FIELDS2: { field: keyof YearRates; label: string; color: string }[] = [
  { field: 't2_punta', label: 'Punta (17–20)', color: '#ef4444' },
  { field: 't2_fp', label: 'Fuera de Punta', color: '#3b82f6' },
]

function getRateValue(year: number, field: keyof YearRates, userRates: Record<number, Partial<YearRates>>): string {
  const def = DEFAULT_RATES[year] ?? DEFAULT_RATES[2026]
  return String(userRates[year]?.[field] ?? def[field])
}

export default function TariffEditor({ detectedYears, userRates, onRateChange }: Props) {
  const years = detectedYears.length > 0 ? detectedYears : [2026]

  return (
    <div className="w-full max-w-content mb-5">
      {years.map((year) => (
        <div key={year} className="mb-4">
          <div className="font-mono text-[13px] font-bold text-orange mb-[10px] text-center py-[6px] border-b border-[rgba(255,255,255,0.06)]">
            ⚡ Tarifas {year}
          </div>
          <div className="grid grid-cols-2 gap-3 max-[640px]:grid-cols-1">
            {/* Triple Horario */}
            <div className="bg-card rounded-[10px] p-4 border border-[rgba(255,255,255,0.06)]">
              <h3 className="font-mono text-[11px] uppercase tracking-[1.5px] text-orange mb-3">
                Triple Horario {year}
              </h3>
              {FIELDS.map(({ field, label, color }) => (
                <div key={field} className="flex items-center gap-2 mb-2 font-mono text-[12px]">
                  <label className="min-w-[110px] shrink-0" style={{ color: '#9ca3af' }}>
                    <span style={{ color }}>{label}</span>
                  </label>
                  <input
                    type="text"
                    value={getRateValue(year, field, userRates)}
                    onChange={(e) => onRateChange(year, field, e.target.value)}
                    className="bg-slate-dark border border-slate-border rounded-md px-[10px] py-[6px] text-text-data font-mono text-[12px] w-[100px] text-right focus:outline-none focus:border-orange"
                  />
                  <span className="text-text-dim text-[10px]">$/kWh</span>
                </div>
              ))}
            </div>

            {/* Doble Horario */}
            <div className="bg-card rounded-[10px] p-4 border border-[rgba(255,255,255,0.06)]">
              <h3 className="font-mono text-[11px] uppercase tracking-[1.5px] text-purple mb-3">
                Doble Horario {year}
              </h3>
              {FIELDS2.map(({ field, label, color }) => (
                <div key={field} className="flex items-center gap-2 mb-2 font-mono text-[12px]">
                  <label className="min-w-[110px] shrink-0" style={{ color: '#9ca3af' }}>
                    <span style={{ color }}>{label}</span>
                  </label>
                  <input
                    type="text"
                    value={getRateValue(year, field, userRates)}
                    onChange={(e) => onRateChange(year, field, e.target.value)}
                    className="bg-slate-dark border border-slate-border rounded-md px-[10px] py-[6px] text-text-data font-mono text-[12px] w-[100px] text-right focus:outline-none focus:border-orange"
                  />
                  <span className="text-text-dim text-[10px]">$/kWh</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

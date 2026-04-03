'use client'

import type { EVConfig } from '@/lib/types'

interface Props {
  evMode: boolean
  onEvModeChange: (v: boolean) => void
  evConfig: EVConfig
  onChange: (patch: Partial<EVConfig>) => void
}

const PRESET_KW = [3.5, 7, 22] as const

function hourLabel(h: number) {
  return `${String(h).padStart(2, '0')}:00`
}

const HOURS = Array.from({ length: 24 }, (_, i) => i)

function NumInput({
  value,
  onChange,
  min,
  max,
  step = 1,
  suffix,
  disabled,
}: {
  value: number
  onChange: (v: number) => void
  min?: number
  max?: number
  step?: number
  suffix?: string
  disabled?: boolean
}) {
  return (
    <div className="flex items-center gap-1">
      <input
        type="number"
        value={value}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        onChange={(e) => {
          const v = parseFloat(e.target.value)
          if (!isNaN(v)) onChange(v)
        }}
        className="bg-slate-dark border border-slate-border rounded-md px-2 py-[5px] text-text-data font-mono text-[12px] w-full text-right focus:outline-none focus:border-orange disabled:opacity-40"
      />
      {suffix && <span className="text-text-dim text-[10px] shrink-0">{suffix}</span>}
    </div>
  )
}

export default function EVSimulator({ evMode, onEvModeChange, evConfig, onChange }: Props) {
  const { enabled, monthlyKm, batteryKwh, rangeKm, chargingKw, chargeStart, chargeEnd, efficiency } = evConfig

  const isCustomKw = !PRESET_KW.includes(chargingKw as typeof PRESET_KW[number])

  // Derived summary values
  const efficiencyKwhPer100 = rangeKm > 0 ? (batteryKwh / rangeKm) * 100 : 0
  const dailyKwhRaw = rangeKm > 0 && efficiency > 0
    ? (monthlyKm / 30) * (batteryKwh / rangeKm) / (efficiency / 100)
    : 0
  const hoursPerDay = chargingKw > 0 ? dailyKwhRaw / chargingKw : 0
  const monthlyKwhAdded = dailyKwhRaw * 30
  const windowSize = chargeStart < chargeEnd
    ? chargeEnd - chargeStart
    : chargeStart > chargeEnd
      ? (24 - chargeStart) + chargeEnd
      : 24
  const windowTooSmall = hoursPerDay > windowSize

  return (
    <div className="w-full max-w-content mb-5">
      <div className="font-mono text-[13px] font-bold text-orange mb-[10px] text-center py-[6px] border-b border-[rgba(255,255,255,0.06)]">
        🔋 Simulación Auto Eléctrico
      </div>

      <div className="bg-card rounded-[10px] p-4 border border-[rgba(255,255,255,0.06)]">
        {/* Already have an EV — show bill without it */}
        <label className="flex items-start gap-2 cursor-pointer mb-3 font-mono text-[12px]">
          <input
            type="checkbox"
            checked={evMode}
            onChange={(e) => onEvModeChange(e.target.checked)}
            className="w-4 h-4 cursor-pointer accent-orange mt-[2px] shrink-0"
          />
          <div>
            <div className="text-text-muted">Ya tengo un auto eléctrico</div>
            <div className="text-text-dim text-[10px] mt-[2px]">Muestra tu factura sin él (resta 6.5 kWh a horas &gt; 7 kWh)</div>
          </div>
        </label>

        <div className="border-t border-[rgba(255,255,255,0.06)] my-3" />

        {/* Simulate getting an EV — add charging load */}
        <label className="flex items-start gap-2 cursor-pointer mb-4 font-mono text-[12px]">
          <input
            type="checkbox"
            checked={enabled}
            onChange={(e) => onChange({ enabled: e.target.checked })}
            className="w-4 h-4 cursor-pointer accent-orange mt-[2px] shrink-0"
          />
          <div>
            <div className="text-text-muted">Quiero simular un auto eléctrico en mi casa</div>
            <div className="text-text-dim text-[10px] mt-[2px]">Agrega la carga del AE a tu consumo y recalcula la factura</div>
          </div>
        </label>

        <div className={enabled ? '' : 'opacity-40 pointer-events-none'}>
          {/* Row 1: km, battery, range */}
          <div className="grid grid-cols-3 gap-3 mb-3 max-[600px]:grid-cols-1">
            <div>
              <div className="font-mono text-[10px] text-text-dim mb-1 uppercase tracking-wider">Km/mes</div>
              <NumInput value={monthlyKm} min={1} onChange={(v) => onChange({ monthlyKm: v })} suffix="km" />
            </div>
            <div>
              <div className="font-mono text-[10px] text-text-dim mb-1 uppercase tracking-wider">Batería</div>
              <NumInput value={batteryKwh} min={1} step={0.5} onChange={(v) => onChange({ batteryKwh: v })} suffix="kWh" />
            </div>
            <div>
              <div className="font-mono text-[10px] text-text-dim mb-1 uppercase tracking-wider">Autonomía</div>
              <NumInput value={rangeKm} min={1} onChange={(v) => onChange({ rangeKm: v })} suffix="km" />
            </div>
          </div>

          {/* Efficiency derived */}
          <div className="font-mono text-[10px] text-text-dim mb-4 text-center">
            Consumo estimado: <span className="text-text-muted">{efficiencyKwhPer100.toFixed(1)} kWh/100km</span>
          </div>

          {/* Charging power */}
          <div className="mb-3">
            <div className="font-mono text-[10px] text-text-dim mb-2 uppercase tracking-wider">Potencia de carga</div>
            <div className="flex flex-wrap gap-2 items-center">
              {PRESET_KW.map((kw) => (
                <button
                  key={kw}
                  onClick={() => onChange({ chargingKw: kw })}
                  className="px-3 py-[5px] rounded-md font-mono text-[12px] cursor-pointer border transition-all"
                  style={chargingKw === kw && !isCustomKw
                    ? { background: 'linear-gradient(135deg,#ff6b2b,#e63946)', color: '#fff', borderColor: 'transparent' }
                    : { background: 'transparent', color: '#6b7280', borderColor: 'rgba(255,255,255,0.1)' }
                  }
                >
                  {kw} kW
                </button>
              ))}
              <button
                onClick={() => onChange({ chargingKw: isCustomKw ? chargingKw : 11 })}
                className="px-3 py-[5px] rounded-md font-mono text-[12px] cursor-pointer border transition-all"
                style={isCustomKw
                  ? { background: 'linear-gradient(135deg,#ff6b2b,#e63946)', color: '#fff', borderColor: 'transparent' }
                  : { background: 'transparent', color: '#6b7280', borderColor: 'rgba(255,255,255,0.1)' }
                }
              >
                Otro
              </button>
              {isCustomKw && (
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    value={chargingKw}
                    min={0.5}
                    step={0.5}
                    onChange={(e) => {
                      const v = parseFloat(e.target.value)
                      if (!isNaN(v) && v > 0) onChange({ chargingKw: v })
                    }}
                    className="bg-slate-dark border border-orange rounded-md px-2 py-[5px] text-text-data font-mono text-[12px] w-[70px] text-right focus:outline-none"
                  />
                  <span className="text-text-dim text-[10px]">kW</span>
                </div>
              )}
            </div>
          </div>

          {/* Charging window */}
          <div className="mb-3">
            <div className="font-mono text-[10px] text-text-dim mb-2 uppercase tracking-wider">Ventana de carga</div>
            <div className="flex items-center gap-3 font-mono text-[12px]">
              <div className="flex flex-col gap-1">
                <span className="text-text-dim text-[10px]">Desde</span>
                <select
                  value={chargeStart}
                  onChange={(e) => onChange({ chargeStart: Number(e.target.value) })}
                  className="bg-slate-dark border border-slate-border rounded-md px-2 py-[5px] text-text-data font-mono text-[12px] focus:outline-none focus:border-orange cursor-pointer"
                >
                  {HOURS.map((h) => (
                    <option key={h} value={h}>{hourLabel(h)}</option>
                  ))}
                </select>
              </div>
              <span className="text-text-dim mt-4">→</span>
              <div className="flex flex-col gap-1">
                <span className="text-text-dim text-[10px]">Hasta</span>
                <select
                  value={chargeEnd}
                  onChange={(e) => onChange({ chargeEnd: Number(e.target.value) })}
                  className="bg-slate-dark border border-slate-border rounded-md px-2 py-[5px] text-text-data font-mono text-[12px] focus:outline-none focus:border-orange cursor-pointer"
                >
                  {HOURS.map((h) => (
                    <option key={h} value={h}>{hourLabel(h)}</option>
                  ))}
                </select>
              </div>
              <span className="text-text-dim text-[10px] mt-4">({windowSize}h ventana)</span>
            </div>
          </div>

          {/* Charging efficiency */}
          <div className="mb-4">
            <div className="font-mono text-[10px] text-text-dim mb-2 uppercase tracking-wider">
              Eficiencia de carga
              <span className="text-text-dim normal-case ml-1">(pérdidas CA→batería)</span>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={70}
                max={100}
                step={1}
                value={efficiency}
                onChange={(e) => onChange({ efficiency: Number(e.target.value) })}
                className="flex-1 accent-orange cursor-pointer"
              />
              <span className="font-mono text-[13px] text-text-data w-10 text-right">{efficiency}%</span>
            </div>
          </div>

          {/* Summary */}
          <div className="border-t border-[rgba(255,255,255,0.06)] pt-3 font-mono text-[11px]">
            <div className="grid grid-cols-3 gap-2 text-center max-[600px]:grid-cols-1">
              <div className="bg-[rgba(255,255,255,0.02)] rounded-md px-3 py-2">
                <div className="text-text-dim mb-[2px]">kWh/día agregados</div>
                <div className="text-text-data text-[14px] font-bold">{dailyKwhRaw.toFixed(1)}</div>
              </div>
              <div className={`bg-[rgba(255,255,255,0.02)] rounded-md px-3 py-2 ${windowTooSmall ? 'border border-[#ef4444]/40' : ''}`}>
                <div className="text-text-dim mb-[2px]">Horas carga/día</div>
                <div className={`text-[14px] font-bold ${windowTooSmall ? 'text-[#ef4444]' : 'text-text-data'}`}>
                  {hoursPerDay.toFixed(1)}h
                </div>
                {windowTooSmall && (
                  <div className="text-[#ef4444] text-[9px] mt-[2px]">supera ventana</div>
                )}
              </div>
              <div className="bg-[rgba(255,255,255,0.02)] rounded-md px-3 py-2">
                <div className="text-text-dim mb-[2px]">kWh/mes agregados</div>
                <div className="text-text-data text-[14px] font-bold">{monthlyKwhAdded.toFixed(0)}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

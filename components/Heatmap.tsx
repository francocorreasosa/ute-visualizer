'use client'

import { memo, useCallback, Fragment } from 'react'
import type { MergedData, YearRates, TooltipState } from '@/lib/types'
import { tariff3, tariff2, colorCell, dateInfo, getRates, adj } from '@/lib/tariffs'
import { fmt } from '@/lib/format'

interface Props {
  allDates: string[]
  mergedData: MergedData
  userRates: Record<number, Partial<YearRates>>
  feriadosMap: Record<string, string>
  maxV: number
  evMode: boolean
  puntaStart: number
  onCellHover: (state: TooltipState) => void
  onCellLeave: () => void
}

const HOURS = Array.from({ length: 24 }, (_, i) => i)

// Precompute set of dates where a year transition happens
function getYearChangeDates(allDates: string[]): Set<string> {
  const s = new Set<string>()
  for (let i = 1; i < allDates.length; i++) {
    if (allDates[i].substring(0, 4) !== allDates[i - 1].substring(0, 4)) {
      s.add(allDates[i])
    }
  }
  return s
}

const Heatmap = memo(function Heatmap({
  allDates,
  mergedData,
  userRates,
  feriadosMap,
  maxV,
  evMode,
  puntaStart,
  onCellHover,
  onCellLeave,
}: Props) {
  const yearChangeDates = getYearChangeDates(allDates)

  // Precompute cumulative kWh consumed BEFORE each (date, hour) within the month.
  // allDates is sorted, so we can iterate in order and accumulate per month.
  const cellCumBefore: Record<string, Record<number, number>> = {}
  const monthRunning: Record<string, number> = {}
  for (const dk of allDates) {
    const mk = dk.substring(0, 7)
    if (!(mk in monthRunning)) monthRunning[mk] = 0
    cellCumBefore[dk] = {}
    for (let h = 0; h < 24; h++) {
      cellCumBefore[dk][h] = monthRunning[mk]
      const v = adj(mergedData[dk]?.[h] ?? null, evMode)
      if (v != null) monthRunning[mk] += v
    }
  }

  // Single onMouseMove handler for all cells (event delegation)
  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const td = (e.target as HTMLElement).closest('td[data-d]') as HTMLTableCellElement | null
      if (!td) { onCellLeave(); return }

      const dk = td.dataset.d!
      const h = parseInt(td.dataset.h!)
      const vStr = td.dataset.v!
      const vrStr = td.dataset.vr || ''
      const tn = td.dataset.t!
      const r = parseFloat(td.dataset.r!)
      const tn2 = td.dataset.t2!
      const r2 = parseFloat(td.dataset.r2!)
      const tn1 = td.dataset.t1!
      const r1 = parseFloat(td.dataset.r1!)
      const fn = td.dataset.fn || ''
      const yr = parseInt(td.dataset.y!)

      const kwh = vStr === '—' ? null : parseFloat(vStr)
      const kwhRaw = vrStr ? parseFloat(vrStr) : null

      const info = dateInfo(dk, feriadosMap)
      const dayType = info.isFeriado ? fn : info.isWknd ? 'Fin de semana' : 'Laboral'

      onCellHover({
        visible: true,
        x: e.clientX,
        y: e.clientY,
        content: {
          dateStr: dk, hour: h, kwh, kwhRaw,
          tariff3Name: tn, tariff3Rate: r,
          tariff2Name: tn2, tariff2Rate: r2,
          tariff1Rate: r1, tariff1Name: tn1,
          feriadoName: fn, dayType, year: yr,
          dn: info.dn, day: info.day, mn: info.mn,
        },
      })
    },
    [feriadosMap, onCellHover, onCellLeave]
  )

  return (
    <div
      className="overflow-x-auto"
      onMouseMove={handleMouseMove}
      onMouseLeave={onCellLeave}
    >
      <table className="heatmap-table">
        <thead>
          <tr>
            <th className="font-mono text-[10.5px] font-medium text-text-dim py-[3px] text-right pr-[10px] whitespace-nowrap min-w-[84px]" />
            {HOURS.map((h) => (
              <th
                key={h}
                className={`font-mono text-[10.5px] font-medium py-[3px] text-center min-w-[30px] ${
                  h <= 6 ? 'text-green' : h >= puntaStart && h <= puntaStart + 3 ? 'text-red' : 'text-blue'
                }`}
              >
                {String(h).padStart(2, '0')}
              </th>
            ))}
            <th className="font-mono py-[3px] pl-[10px] text-[9.5px] text-text-dim">kWh</th>
            <th className="font-mono py-[3px] pl-[6px] text-[9.5px] text-amber">Costo</th>
          </tr>
        </thead>
        <tbody>
          {allDates.map((dk) => {
            const info = dateInfo(dk, feriadosMap)
            const rates = getRates(info.year, userRates)

            let dayTotal = 0
            let dayCost3 = 0

            const cells = HOURS.map((h) => {
              const vRaw = mergedData[dk]?.[h] ?? null
              const v = adj(vRaw, evMode)
              const t3 = tariff3(h, info.isOffPeak, rates.R3, puntaStart)
              const t2 = tariff2(h, info.isOffPeak, rates.R2, puntaStart)
              const cumBefore = cellCumBefore[dk]?.[h] ?? 0
              const r1 = cumBefore < 100 ? rates.R1.e1 : cumBefore < 600 ? rates.R1.e2 : rates.R1.e3
              const t1name = cumBefore < 100 ? '1° esc.' : cumBefore < 600 ? '2° esc.' : '3° esc.'

              if (v != null) {
                dayTotal += v
                dayCost3 += v * t3.rate
              }

              return (
                <td
                  key={h}
                  className="heatmap-cell"
                  style={{ background: colorCell(v, maxV) }}
                  data-d={dk}
                  data-h={h}
                  data-v={v != null ? v.toFixed(2) : '—'}
                  data-vr={vRaw != null ? vRaw.toFixed(2) : ''}
                  data-t={t3.name}
                  data-r={t3.rate}
                  data-t2={t2.name}
                  data-r2={t2.rate}
                  data-t1={t1name}
                  data-r1={r1}
                  data-fn={info.feriadoName}
                  data-y={info.year}
                />
              )
            })

            const thStyle = info.isFeriado
              ? { color: '#e879f9', opacity: 0.85 }
              : info.isWknd
              ? { color: '#ff6b2b', opacity: 0.7 }
              : {}

            return (
              <Fragment key={dk}>
                {yearChangeDates.has(dk) && (
                  <tr>
                    <th
                      className="font-mono text-[12px] font-bold text-orange text-right pr-[10px]"
                      style={{ height: 20, verticalAlign: 'middle' }}
                    >
                      — {info.year} —
                    </th>
                    {HOURS.map((h) => (
                      <td key={h} className="year-sep-fill" />
                    ))}
                    <td /><td />
                  </tr>
                )}
                <tr>
                  <th
                    className="font-mono text-[10.5px] font-medium py-0 text-right pr-[10px] whitespace-nowrap min-w-[84px] text-text-dim"
                    style={thStyle}
                  >
                    {info.dn} {info.day} {info.mn}{info.isFeriado ? ' 🎭' : ''}
                  </th>
                  {cells}
                  <td className="font-mono text-[10px] font-semibold text-right px-[6px] pl-3 whitespace-nowrap text-text-muted border-l-2 border-[rgba(255,255,255,0.04)]">
                    {dayTotal.toFixed(1)}
                  </td>
                  <td className="font-mono text-[10px] font-semibold text-right px-[6px] pl-2 whitespace-nowrap text-amber">
                    {fmt(dayCost3)}
                  </td>
                </tr>
              </Fragment>
            )
          })}
        </tbody>
      </table>
    </div>
  )
})

export default Heatmap

'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import type { TooltipState } from '@/lib/types'

interface Props {
  state: TooltipState
}

export default function Tooltip({ state }: Props) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])

  if (!mounted || !state.visible || !state.content) return null

  const { content, x, y } = state
  const {
    dn, day, mn, year, hour, kwh, kwhRaw,
    tariff3Name, tariff3Rate, tariff2Name, tariff2Rate,
    tariff1Rate, tariff1Name, dayType,
  } = content

  const cost3 = kwh != null ? (kwh * tariff3Rate).toFixed(1) : '—'
  const cost2 = kwh != null ? (kwh * tariff2Rate).toFixed(1) : '—'
  const cost1 = kwh != null ? (kwh * tariff1Rate).toFixed(1) : '—'
  const hourStr = String(hour).padStart(2, '0')
  const evAdjusted = kwh != null && kwhRaw != null && Math.abs(kwh - kwhRaw) > 0.001

  return createPortal(
    <div
      className="fixed bg-[#1a1f2e] border border-border-dim rounded-lg px-[14px] py-[10px] font-mono text-[12px] text-text-data z-[9999] pointer-events-none shadow-[0_10px_30px_rgba(0,0,0,0.7)] whitespace-nowrap"
      style={{ left: x + 14, top: y - 50 }}
    >
      {dn} {day} {mn} {year} · {hourStr}:00{' '}
      <span className="text-text-dim text-[10px]">({dayType})</span>
      <br />
      <span className="text-[20px] font-bold text-orange">
        {kwh != null ? kwh.toFixed(2) : '—'} kWh
      </span>
      {evAdjusted && (
        <>
          <br />
          <span className="text-text-dim text-[10px]">
            🚗 Original: {kwhRaw!.toFixed(2)} kWh → ajustado −6.5
          </span>
        </>
      )}
      <br />
      <span className="text-[13px] font-semibold text-amber">
        Triple: ${cost3}{' '}
        <span className="text-text-dim text-[10px]">{tariff3Name} ${tariff3Rate}</span>
      </span>
      <br />
      <span className="text-[12px] font-semibold text-purple">
        Doble: ${cost2}{' '}
        <span className="text-text-dim text-[10px]">{tariff2Name} ${tariff2Rate}</span>
      </span>
      <br />
      <span className="text-[12px] font-semibold text-green">
        Simple: ${cost1}{' '}
        <span className="text-text-dim text-[10px]">{tariff1Name} ${tariff1Rate}</span>
      </span>
    </div>,
    document.body
  )
}

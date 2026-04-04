'use client'

import { useRef } from 'react'
import { analytics } from '@/lib/analytics'

interface Props {
  title: string
  subtitle?: string
  children: React.ReactNode
}

export default function ChartCard({ title, subtitle, children }: Props) {
  const tracked = useRef(false)

  function handleMouseEnter() {
    if (tracked.current) return
    tracked.current = true
    analytics.chartViewed(title)
  }

  return (
    <div
      className="bg-surface border border-[rgba(255,255,255,0.06)] rounded-[14px] p-5 shadow-[0_8px_32px_rgba(0,0,0,0.4)]"
      onMouseEnter={handleMouseEnter}
    >
      <div className="mb-4">
        <h3 className="font-mono text-[13px] font-bold text-white">{title}</h3>
        {subtitle && <p className="font-mono text-[10px] text-text-dim mt-0.5">{subtitle}</p>}
      </div>
      {children}
    </div>
  )
}

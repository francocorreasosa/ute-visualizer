'use client'

import { useMemo, useCallback } from 'react'
import { useAppState } from '@/hooks/useAppState'
import { parseCSV } from '@/lib/parseCSV'
import { computeAll } from '@/lib/compute'
import { DEMO_CSV } from '@/lib/constants'
import { parseNum } from '@/lib/format'
import type { YearRates, TooltipState } from '@/lib/types'

import Header from '@/components/Header'
import UploadZone from '@/components/UploadZone'
import TariffEditor from '@/components/TariffEditor'
import FeriadosSection from '@/components/FeriadosSection'
import ResultsSection from '@/components/ResultsSection'
import EmptyState from '@/components/EmptyState'
import Tooltip from '@/components/Tooltip'
import LegalDisclaimer from '@/components/LegalDisclaimer'

export default function Page() {
  const [state, dispatch] = useAppState()
  const { mergedData, loadedFiles, detectedYears, userRates, feriadosMap, evMode, tooltip } = state

  // Single computation pass — only re-runs when inputs change
  const { allDates, maxV, stats, comparison } = useMemo(
    () => computeAll(mergedData, userRates, feriadosMap, evMode),
    [mergedData, userRates, feriadosMap, evMode]
  )

  const hasData = allDates.length > 0

  // File handlers
  function processFiles(files: FileList) {
    for (const file of Array.from(files)) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = parseCSV(e.target!.result as string)
        dispatch({
          type: 'MERGE_DATA',
          payload: {
            data: result.data,
            file: { name: file.name, dateFrom: result.dateFrom, dateTo: result.dateTo, days: result.days },
            years: result.years,
          },
        })
      }
      reader.readAsText(file, 'utf-8')
    }
  }

  function loadDemo() {
    const result = parseCSV(DEMO_CSV)
    dispatch({
      type: 'MERGE_DATA',
      payload: {
        data: result.data,
        file: { name: 'ejemplo_feb_2026.csv', dateFrom: result.dateFrom, dateTo: result.dateTo, days: result.days },
        years: result.years,
      },
    })
  }

  // Tooltip handlers (stable references for Heatmap memo)
  const handleCellHover = useCallback((s: TooltipState) => {
    dispatch({ type: 'SHOW_TOOLTIP', payload: s })
  }, [dispatch])

  const handleCellLeave = useCallback(() => {
    dispatch({ type: 'HIDE_TOOLTIP' })
  }, [dispatch])

  return (
    <main className="min-h-screen flex flex-col items-center px-5 py-9 pb-12">
      {/* Controls column — constrained to 860px for readability */}
      <div className="w-full max-w-content flex flex-col items-center">
        <Header />

        <UploadZone
          loadedFiles={loadedFiles}
          onFilesDropped={processFiles}
          onRemoveFile={() => dispatch({ type: 'REMOVE_FILE', payload: 0 })}
          onClearAll={() => dispatch({ type: 'CLEAR_ALL' })}
          onLoadDemo={loadDemo}
        />

        <TariffEditor
          detectedYears={detectedYears}
          userRates={userRates}
          onRateChange={(year, field, rawValue) => {
            const value = parseNum(rawValue)
            if (!isNaN(value)) {
              dispatch({ type: 'SET_RATE', payload: { year, field: field as keyof YearRates, value } })
            }
          }}
        />

        <FeriadosSection
          feriadosMap={feriadosMap}
          onAdd={(date, name) => dispatch({ type: 'ADD_FERIADO', payload: { date, name } })}
          onRemove={(date) => dispatch({ type: 'REMOVE_FERIADO', payload: date })}
        />

        {/* EV Mode toggle */}
        <div className="w-full mb-4 flex items-center justify-center gap-[10px] font-mono text-[12px]">
          <label className="flex items-center gap-2 cursor-pointer bg-card border border-[rgba(255,255,255,0.06)] rounded-lg px-4 py-2">
            <input
              type="checkbox"
              checked={evMode}
              onChange={(e) => dispatch({ type: 'SET_EV_MODE', payload: e.target.checked })}
              className="w-4 h-4 cursor-pointer accent-orange"
            />
            <span className="text-[#9ca3af]">🚗 Simular sin auto eléctrico</span>
            <span className="text-text-dim text-[10px]">(resta 6.5 kWh a horas &gt; 7 kWh)</span>
          </label>
        </div>

        <button
          className="border-none rounded-lg px-7 py-[10px] text-white font-mono text-[13px] font-bold cursor-pointer mb-6 block transition-transform hover:scale-[1.03] hover:shadow-[0_4px_20px_rgba(255,107,43,0.3)]"
          style={{ background: 'linear-gradient(135deg,#ff6b2b,#e63946)' }}
          onClick={() => {/* useMemo auto-recalculates — button kept for UX */}}
        >
          Recalcular
        </button>

      </div>

      {/* Results — full viewport width so heatmap doesn't force-scroll on wide screens */}
      {hasData ? (
        <ResultsSection
          allDates={allDates}
          mergedData={mergedData}
          fileCount={loadedFiles.length}
          detectedYears={detectedYears}
          userRates={userRates}
          feriadosMap={feriadosMap}
          maxV={maxV}
          evMode={evMode}
          stats={stats}
          comparison={comparison}
          onCellHover={handleCellHover}
          onCellLeave={handleCellLeave}
        />
      ) : (
        <EmptyState />
      )}

      <div className="w-full max-w-content">
        <LegalDisclaimer />
      </div>

      <Tooltip state={tooltip} />
    </main>
  )
}

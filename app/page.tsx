'use client'

import { useMemo, useCallback, useState } from 'react'
import { useAppState } from '@/hooks/useAppState'
import { parseCSV } from '@/lib/parseCSV'
import { computeAll } from '@/lib/compute'
import { computeChartData } from '@/lib/chartData'
import { DEMO_CSV } from '@/lib/constants'
import { parseNum } from '@/lib/format'
import type { YearRates, TooltipState } from '@/lib/types'
import { analytics } from '@/lib/analytics'

import Header from '@/components/Header'
import UploadZone from '@/components/UploadZone'
import TariffEditor from '@/components/TariffEditor'
import FeriadosSection from '@/components/FeriadosSection'
import EVSimulator from '@/components/EVSimulator'
import ResultsSection from '@/components/ResultsSection'
import EmptyState from '@/components/EmptyState'
import Tooltip from '@/components/Tooltip'
import LegalDisclaimer from '@/components/LegalDisclaimer'
import ContributorsSection from '@/components/ContributorsSection'
import TabBar from '@/components/TabBar'

export default function Page() {
  const [state, dispatch] = useAppState()
  const { mergedData, loadedFiles, detectedYears, userRates, feriadosMap, evMode, evConfig, puntaStart, tooltip } = state
  const [activeTab, setActiveTab] = useState<'heatmap' | 'charts'>('heatmap')

  // Single computation pass — only re-runs when inputs change
  const { allDates, maxV, stats, comparison } = useMemo(
    () => computeAll(mergedData, userRates, feriadosMap, evMode, puntaStart, evConfig),
    [mergedData, userRates, feriadosMap, evMode, puntaStart, evConfig]
  )

  const chartData = useMemo(
    () => computeChartData(mergedData, userRates, feriadosMap, evMode, puntaStart, evConfig),
    [mergedData, userRates, feriadosMap, evMode, puntaStart, evConfig]
  )

  // Compute best cost for each punta option to show optimal recommendation
  const puntaAnalysis = useMemo(() =>
    ([17, 18, 19] as const).map(ps => {
      const { comparison } = computeAll(mergedData, userRates, feriadosMap, evMode, ps, evConfig)
      return { ps, best: Math.min(comparison.g3, comparison.g2, comparison.g1) }
    }),
    [mergedData, userRates, feriadosMap, evMode, evConfig]
  )

  const hasData = allDates.length > 0

  // File handlers
  function processFiles(files: FileList) {
    for (const file of Array.from(files)) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = parseCSV(e.target!.result as string)
        analytics.fileUploaded(result.days, result.years)
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
    analytics.demoLoaded()
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
    <main className="min-h-screen flex flex-col lg:flex-row lg:items-start">
      {/* Sidebar — inputs, sticky on desktop */}
      <aside className="w-full lg:w-[480px] lg:flex-shrink-0 flex flex-col items-center px-5 py-9 lg:h-screen lg:sticky lg:top-0 lg:overflow-y-auto lg:border-r lg:border-[rgba(255,255,255,0.06)]">
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
          puntaStart={puntaStart}
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

        <EVSimulator
          evMode={evMode}
          onEvModeChange={(v) => { analytics.evSimulatorToggled(v); dispatch({ type: 'SET_EV_MODE', payload: v }) }}
          evConfig={evConfig}
          onChange={(patch) => dispatch({ type: 'SET_EV_CONFIG', payload: patch })}
        />

        <button
          className="border-none rounded-lg px-7 py-[10px] text-white font-mono text-[13px] font-bold cursor-pointer mb-6 block transition-transform hover:scale-[1.03] hover:shadow-[0_4px_20px_rgba(255,107,43,0.3)]"
          style={{ background: 'linear-gradient(135deg,#ff6b2b,#e63946)' }}
          onClick={() => {/* useMemo auto-recalculates — button kept for UX */}}
        >
          Recalcular
        </button>

        <LegalDisclaimer />
        <ContributorsSection />
      </aside>

      {/* Results panel — flex-1 min-w-0 prevents heatmap from overflowing flex container */}
      <section className="flex-1 min-w-0 flex flex-col items-center px-5 py-9">
        {hasData ? (
          <>
            <TabBar activeTab={activeTab} onChange={(tab) => { analytics.tabChanged(tab); setActiveTab(tab) }} />
            <ResultsSection
              activeTab={activeTab}
              puntaStart={puntaStart}
              puntaAnalysis={puntaAnalysis}
              onPuntaChange={(v) => { analytics.puntaStartChanged(v); dispatch({ type: 'SET_PUNTA_START', payload: v }) }}
              allDates={allDates}
              mergedData={mergedData}
              fileCount={loadedFiles.length}
              detectedYears={detectedYears}
              userRates={userRates}
              feriadosMap={feriadosMap}
              maxV={maxV}
              evMode={evMode}
              evConfig={evConfig}
              stats={stats}
              comparison={comparison}
              chartData={chartData}
              onCellHover={handleCellHover}
              onCellLeave={handleCellLeave}
            />
          </>
        ) : (
          <EmptyState />
        )}
      </section>

      <Tooltip state={tooltip} />
    </main>
  )
}

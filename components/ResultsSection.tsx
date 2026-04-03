import type { MergedData, YearRates, TooltipState, ComputedStats, ComputedComparison } from '@/lib/types'
import type { ChartData } from '@/lib/chartData'
import DateRangeInfo from './DateRangeInfo'
import Heatmap from './Heatmap'
import HeatmapLegend from './HeatmapLegend'
import StatsCards from './StatsCards'
import CompareSection from './CompareSection'
import ChartsSection from './ChartsSection'

interface Props {
  activeTab: 'heatmap' | 'charts'
  puntaStart: number
  puntaAnalysis: { ps: 17 | 18 | 19; best: number }[]
  onPuntaChange: (v: 17 | 18 | 19) => void
  allDates: string[]
  mergedData: MergedData
  fileCount: number
  detectedYears: number[]
  userRates: Record<number, Partial<YearRates>>
  feriadosMap: Record<string, string>
  maxV: number
  evMode: boolean
  stats: ComputedStats
  comparison: ComputedComparison
  chartData: ChartData
  onCellHover: (state: TooltipState) => void
  onCellLeave: () => void
}

export default function ResultsSection({
  activeTab,
  puntaStart,
  puntaAnalysis,
  onPuntaChange,
  allDates,
  mergedData,
  fileCount,
  detectedYears,
  userRates,
  feriadosMap,
  maxV,
  evMode,
  stats,
  comparison,
  chartData,
  onCellHover,
  onCellLeave,
}: Props) {
  const dateFrom = allDates[0] ?? '?'
  const dateTo = allDates[allDates.length - 1] ?? '?'

  return (
    <div className="w-full flex flex-col items-center">
      {/* Date range info — centered, 860px max */}
      <div className="w-full max-w-content">
        <DateRangeInfo
          dateFrom={dateFrom}
          dateTo={dateTo}
          dayCount={allDates.length}
          fileCount={fileCount}
          years={detectedYears}
        />
      </div>

      {activeTab === 'heatmap' ? (
        /* Heatmap card — intrinsic width, centered */
        <div className="bg-surface rounded-[14px] px-5 py-6 pb-4 border border-[rgba(255,255,255,0.06)] shadow-[0_24px_64px_rgba(0,0,0,0.55)] overflow-x-auto max-w-[calc(100vw-40px)]">
          <div className="flex justify-center">
            <Heatmap
              allDates={allDates}
              mergedData={mergedData}
              userRates={userRates}
              feriadosMap={feriadosMap}
              maxV={maxV}
              evMode={evMode}
              puntaStart={puntaStart}
              onCellHover={onCellHover}
              onCellLeave={onCellLeave}
            />
          </div>
          <div className="max-w-content mx-auto">
            <HeatmapLegend maxV={maxV} puntaStart={puntaStart} />
            <StatsCards stats={stats} />
          </div>
        </div>
      ) : (
        <ChartsSection chartData={chartData} />
      )}

      {/* Punta selector — just before comparison */}
      <div className="w-full max-w-content mt-8">
        {(() => {
          const optimalPs = puntaAnalysis.reduce((a, b) => b.best < a.best ? b : a).ps
          const fmt = (n: number) => n >= 1000 ? `$${(n / 1000).toFixed(1)}k` : `$${n.toFixed(0)}`
          return (
            <div className="flex items-center justify-center gap-3 font-mono text-[12px] mb-5">
              <span className="text-text-dim">Horario punta:</span>
              <div className="flex gap-1 bg-card border border-[rgba(255,255,255,0.06)] rounded-lg p-[3px]">
                {puntaAnalysis.map(({ ps, best }) => {
                  const active = puntaStart === ps
                  const optimal = ps === optimalPs
                  return (
                    <button
                      key={ps}
                      onClick={() => onPuntaChange(ps)}
                      className="flex flex-col items-center px-4 py-[6px] rounded-md font-mono cursor-pointer border-none transition-all"
                      style={active
                        ? { background: 'linear-gradient(135deg,#ff6b2b,#e63946)', color: '#fff' }
                        : { background: 'transparent', color: '#6b7280' }
                      }
                    >
                      <span className="text-[11px] font-bold">{ps}–{ps + 3}h</span>
                      <span className={`text-[9px] mt-[1px] ${active ? 'text-white/70' : 'text-text-dim'}`}>
                        {optimal ? '★ ' : ''}{fmt(best)}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
          )
        })()}
      </div>

      {/* Comparison — centered, 860px max */}
      <div className="w-full max-w-content">
        <CompareSection
          comparison={comparison}
          stats={stats}
          dayCount={allDates.length}
          isMultiYear={detectedYears.length > 1}
          puntaStart={puntaStart}
          monthlyCosts={chartData.monthlyCosts}
        />
      </div>
    </div>
  )
}

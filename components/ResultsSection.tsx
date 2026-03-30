import type { MergedData, YearRates, TooltipState, ComputedStats, ComputedComparison } from '@/lib/types'
import DateRangeInfo from './DateRangeInfo'
import Heatmap from './Heatmap'
import HeatmapLegend from './HeatmapLegend'
import StatsCards from './StatsCards'
import CompareSection from './CompareSection'

interface Props {
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
  onCellHover: (state: TooltipState) => void
  onCellLeave: () => void
}

export default function ResultsSection({
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

      {/* Heatmap card — intrinsic width, centered by the flex parent */}
      <div className="bg-surface rounded-[14px] px-5 py-6 pb-4 border border-[rgba(255,255,255,0.06)] shadow-[0_24px_64px_rgba(0,0,0,0.55)] overflow-x-auto max-w-[calc(100vw-40px)]">
        <div className="flex justify-center">
          <Heatmap
            allDates={allDates}
            mergedData={mergedData}
            userRates={userRates}
            feriadosMap={feriadosMap}
            maxV={maxV}
            evMode={evMode}
            onCellHover={onCellHover}
            onCellLeave={onCellLeave}
          />
        </div>
        <div className="max-w-content mx-auto">
          <HeatmapLegend maxV={maxV} />
          <StatsCards stats={stats} />
        </div>
      </div>

      {/* Comparison — centered, 860px max */}
      <div className="w-full max-w-content">
        <CompareSection
          comparison={comparison}
          stats={stats}
          dayCount={allDates.length}
          isMultiYear={detectedYears.length > 1}
        />
      </div>
    </div>
  )
}

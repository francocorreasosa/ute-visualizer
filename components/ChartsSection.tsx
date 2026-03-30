import type { ChartData } from '@/lib/chartData'
import CargaPromedio from './charts/CargaPromedio'
import PerfilDow from './charts/PerfilDow'
import CostoAcumulado from './charts/CostoAcumulado'
import Rolling7Dias from './charts/Rolling7Dias'
import ConsumoPorDiaMes from './charts/ConsumoPorDiaMes'

interface Props {
  chartData: ChartData
}

export default function ChartsSection({ chartData }: Props) {
  const { hourProfile, dowProfile, cumulativeCosts, rollingDays, monthSeries } = chartData

  return (
    <div className="w-full max-w-content flex flex-col gap-5">
      {/* Row 1: 2 col */}
      <div className="grid grid-cols-2 gap-5 max-[640px]:grid-cols-1">
        <CargaPromedio data={hourProfile} />
        <PerfilDow data={dowProfile} />
      </div>

      {/* Multi-month cumulative — only shown when ≥ 2 months */}
      {monthSeries.length >= 2 && (
        <ConsumoPorDiaMes data={monthSeries} />
      )}

      {/* Cumulative cost + rolling avg */}
      <div className="grid grid-cols-2 gap-5 max-[640px]:grid-cols-1">
        <CostoAcumulado data={cumulativeCosts} />
        <Rolling7Dias data={rollingDays} />
      </div>
    </div>
  )
}

interface Props {
  maxV: number
}

export default function HeatmapLegend({ maxV }: Props) {
  return (
    <>
      <div className="flex items-center justify-center gap-2 mt-[18px] font-mono text-[10.5px] text-text-dim">
        <span>0 kWh</span>
        <div
          className="w-[180px] h-[10px] rounded-[5px]"
          style={{
            background:
              'linear-gradient(90deg,#0c1222,#0e3d5e,#0891b2,#f59e0b,#ef4444,#dc2626)',
          }}
        />
        <span>{maxV.toFixed(1)} kWh</span>
      </div>

      <div className="flex gap-4 justify-center mt-[14px] flex-wrap font-mono text-[11px]">
        <div className="flex items-center gap-[6px]">
          <div className="w-[10px] h-[10px] rounded-[2px] bg-green" />
          <span className="text-green">Valle 00–06</span>
        </div>
        <div className="flex items-center gap-[6px]">
          <div className="w-[10px] h-[10px] rounded-[2px] bg-blue" />
          <span className="text-blue">Llano 07–16, 21–23</span>
        </div>
        <div className="flex items-center gap-[6px]">
          <div className="w-[10px] h-[10px] rounded-[2px] bg-red" />
          <span className="text-red">Punta 17–20</span>
        </div>
      </div>

      <p className="text-center mt-[6px] font-mono text-[10px] text-text-muted">
        Fines de semana y feriados: sin tarifa Punta (17–20 pasa a Llano / Fuera de Punta)
      </p>
    </>
  )
}

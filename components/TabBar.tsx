'use client'

interface Props {
  activeTab: 'heatmap' | 'charts'
  onChange: (tab: 'heatmap' | 'charts') => void
}

export default function TabBar({ activeTab, onChange }: Props) {
  return (
    <div className="flex gap-1 bg-card border border-[rgba(255,255,255,0.06)] rounded-xl p-1 mb-6 w-fit mx-auto">
      {(['heatmap', 'charts'] as const).map((tab) => {
        const active = activeTab === tab
        return (
          <button
            key={tab}
            onClick={() => onChange(tab)}
            className={[
              'px-5 py-2 rounded-lg font-mono text-[12px] font-bold transition-all cursor-pointer border-none',
              active
                ? 'text-white shadow-[0_2px_10px_rgba(255,107,43,0.25)]'
                : 'text-text-dim hover:text-white bg-transparent',
            ].join(' ')}
            style={active ? { background: 'linear-gradient(135deg,#ff6b2b,#e63946)' } : {}}
          >
            {tab === 'heatmap' ? '⬛ Heatmap' : '📊 Gráficas'}
          </button>
        )
      })}
    </div>
  )
}

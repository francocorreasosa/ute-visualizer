'use client'

import { useState } from 'react'
import FeriadoChip from './FeriadoChip'

interface Props {
  feriadosMap: Record<string, string>
  onAdd: (date: string, name: string) => void
  onRemove: (dateStr: string) => void
}

export default function FeriadosSection({ feriadosMap, onAdd, onRemove }: Props) {
  const [newDate, setNewDate] = useState('')
  const [newName, setNewName] = useState('')

  const sorted = Object.keys(feriadosMap).sort()

  function handleAdd() {
    if (!newDate) return
    onAdd(newDate, newName || 'Feriado')
    setNewDate('')
    setNewName('')
  }

  return (
    <div className="w-full max-w-content mb-5">
      <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
        <h3 className="font-mono text-[11px] uppercase tracking-[1.5px] text-[#e879f9]">
          🎭 Feriados UTE (sin tarifa Punta)
        </h3>
        <div className="flex items-center gap-[6px]">
          <input
            type="date"
            value={newDate}
            onChange={(e) => setNewDate(e.target.value)}
            className="bg-slate-dark border border-slate-border rounded-md px-[10px] py-1 text-text-data font-mono text-[11px] focus:outline-none focus:border-[#e879f9]"
          />
          <input
            type="text"
            placeholder="Nombre"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="bg-slate-dark border border-slate-border rounded-md px-[10px] py-1 text-text-data font-mono text-[11px] w-[140px] focus:outline-none focus:border-[#e879f9]"
          />
          <button
            onClick={handleAdd}
            className="bg-slate-border rounded-md px-[10px] py-1 text-text-data font-mono text-[11px] cursor-pointer hover:bg-slate-hover"
          >
            + Agregar
          </button>
        </div>
      </div>
      <div className="flex flex-wrap gap-[6px] font-mono text-[11px]">
        {sorted.map((ds) => (
          <FeriadoChip key={ds} dateStr={ds} name={feriadosMap[ds]} onRemove={() => onRemove(ds)} />
        ))}
      </div>
    </div>
  )
}

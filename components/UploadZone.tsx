'use client'

import { useRef, useState } from 'react'
import type { LoadedFile } from '@/lib/types'
import FileChip from './FileChip'

interface Props {
  loadedFiles: LoadedFile[]
  onFilesDropped: (files: FileList) => void
  onRemoveFile: (index: number) => void
  onClearAll: () => void
  onLoadDemo: () => void
}

export default function UploadZone({
  loadedFiles,
  onFilesDropped,
  onRemoveFile,
  onClearAll,
  onLoadDemo,
}: Props) {
  const [isDragOver, setIsDragOver] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  return (
    <>
      <div
        className={`my-5 mb-6 w-full max-w-content border-2 border-dashed rounded-[14px] px-6 py-7 text-center cursor-pointer transition-colors duration-200 relative ${
          isDragOver
            ? 'border-orange bg-[rgba(255,107,43,0.04)]'
            : 'border-border-dim bg-surface hover:border-orange hover:bg-[rgba(255,107,43,0.04)]'
        }`}
        onDragOver={(e) => {
          e.preventDefault()
          setIsDragOver(true)
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={(e) => {
          e.preventDefault()
          setIsDragOver(false)
          if (e.dataTransfer.files.length > 0) onFilesDropped(e.dataTransfer.files)
        }}
        onClick={() => inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".csv"
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files.length > 0) {
              onFilesDropped(e.target.files)
              e.target.value = ''
            }
          }}
        />
        <div className="text-[36px] mb-2">📂</div>
        <div className="font-mono text-[13px] text-text-muted">
          Arrastrá tus <b className="text-orange">CSVs de UTE</b> acá (se acumulan)
        </div>
        <div className="font-mono text-[10.5px] text-text-dim mt-[6px]">
          Formato: &quot;Fecha Hora;Energia Activa Entrante kWh;...&quot; · Podés cargar varios archivos · Soporte multi-año
        </div>

        {loadedFiles.length > 0 && (
          <div
            className="mt-[10px] flex flex-wrap gap-[6px] justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            {loadedFiles.map((f, i) => (
              <FileChip key={i} file={f} onRemove={() => onRemoveFile(i)} />
            ))}
            {loadedFiles.length > 1 && (
              <button
                className="bg-transparent border border-slate-border rounded-md px-[10px] py-1 font-mono text-[10.5px] text-red cursor-pointer hover:bg-[rgba(239,68,68,0.1)] mt-2"
                onClick={onClearAll}
              >
                Limpiar todo
              </button>
            )}
          </div>
        )}
      </div>

      <div className="text-center mb-5">
        <button
          className="bg-orange text-white font-mono text-[11px] font-semibold px-[14px] py-[6px] rounded-md cursor-pointer hover:opacity-90 transition-opacity"
          onClick={(e) => {
            e.stopPropagation()
            onLoadDemo()
          }}
        >
          ▶ Cargar ejemplo (Feb 2026)
        </button>
      </div>
    </>
  )
}

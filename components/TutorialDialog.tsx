'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import Image from 'next/image'

interface Props {
  onClose: () => void
}

const STEPS = [
  {
    img: '/tutorial/1.png',
    title: 'Ir a Mis Servicios',
    desc: 'Ingresá al portal de UTE. En el menú lateral, hacé click en "Mis Servicios".',
  },
  {
    img: '/tutorial/2.png',
    title: 'Curva de Consumo',
    desc: 'En el panel de opciones, seleccioná "Curva de Consumo Potencia Máxima".',
  },
  {
    img: '/tutorial/3.png',
    title: 'Configurar el período',
    desc: 'Elegí el rango de fechas. En "Período" seleccioná "1 hora" — este formato es el que soporta el visualizador.',
  },
  {
    img: '/tutorial/4.png',
    title: 'Descargar el CSV',
    desc: 'Confirmá que el período sea "1 hora" y hacé click en "Descargar". Luego arrastrá el archivo acá.',
  },
]

export default function TutorialDialog({ onClose }: Props) {
  const [step, setStep] = useState(0)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowRight') setStep((s) => Math.min(s + 1, STEPS.length - 1))
      if (e.key === 'ArrowLeft') setStep((s) => Math.max(s - 1, 0))
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  if (!mounted) return null

  const current = STEPS[step]

  return createPortal(
    <div
      className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative bg-[#151a28] border border-border-dim rounded-2xl shadow-[0_24px_60px_rgba(0,0,0,0.8)] w-full max-w-lg mx-4 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <span className="font-mono text-[11px] text-text-dim uppercase tracking-widest">
            Cómo descargar el CSV de UTE
          </span>
          <button
            onClick={onClose}
            className="text-text-dim hover:text-white transition-colors font-mono text-[18px] leading-none cursor-pointer"
          >
            ×
          </button>
        </div>

        {/* Screenshot */}
        <div className="mx-5 rounded-lg overflow-hidden border border-border-dim bg-[#0c1020]">
          <Image
            src={current.img}
            alt={current.title}
            width={800}
            height={450}
            className="w-full h-auto object-contain"
            unoptimized
          />
        </div>

        {/* Step info */}
        <div className="px-5 pt-4 pb-2">
          <div className="font-mono text-[13px] font-semibold text-orange mb-1">
            Paso {step + 1} — {current.title}
          </div>
          <div className="font-mono text-[12px] text-text-muted leading-relaxed">
            {current.desc}
          </div>
        </div>

        {/* Footer: dots + nav */}
        <div className="flex items-center justify-between px-5 py-4">
          <div className="flex gap-[6px]">
            {STEPS.map((_, i) => (
              <button
                key={i}
                onClick={() => setStep(i)}
                className={`w-[7px] h-[7px] rounded-full transition-colors cursor-pointer ${
                  i === step ? 'bg-orange' : 'bg-border-dim hover:bg-text-dim'
                }`}
              />
            ))}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setStep((s) => Math.max(s - 1, 0))}
              disabled={step === 0}
              className="font-mono text-[11px] px-3 py-[5px] rounded-md border border-border-dim text-text-muted hover:border-orange hover:text-orange transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-default"
            >
              ← Anterior
            </button>
            {step < STEPS.length - 1 ? (
              <button
                onClick={() => setStep((s) => s + 1)}
                className="font-mono text-[11px] px-3 py-[5px] rounded-md bg-orange text-white hover:opacity-90 transition-opacity cursor-pointer"
              >
                Siguiente →
              </button>
            ) : (
              <button
                onClick={onClose}
                className="font-mono text-[11px] px-3 py-[5px] rounded-md bg-orange text-white hover:opacity-90 transition-opacity cursor-pointer"
              >
                ¡Listo!
              </button>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}

import { useReducer } from 'react'
import type { AppState, Action } from '@/lib/types'
import { INITIAL_FERIADOS_MAP } from '@/lib/constants'

const initialState: AppState = {
  mergedData: {},
  loadedFiles: [],
  detectedYears: [],
  userRates: {},
  feriadosMap: { ...INITIAL_FERIADOS_MAP },
  evMode: false,
  evConfig: {
    enabled: false,
    monthlyKm: 1000,
    batteryKwh: 40,
    rangeKm: 300,
    chargingKw: 7,
    chargeStart: 22,
    chargeEnd: 6,
    efficiency: 90,
  },
  puntaStart: 17,
  tooltip: { visible: false, x: 0, y: 0, content: null },
}

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'MERGE_DATA': {
      const { data, file, years } = action.payload
      const newMergedData = { ...state.mergedData }
      for (const [dk, hours] of Object.entries(data)) {
        if (!newMergedData[dk]) newMergedData[dk] = {}
        for (const [h, v] of Object.entries(hours)) {
          newMergedData[dk][Number(h)] = v
        }
      }
      const newYears = [...new Set([...state.detectedYears, ...years])].sort()
      return {
        ...state,
        mergedData: newMergedData,
        loadedFiles: [...state.loadedFiles, file],
        detectedYears: newYears,
      }
    }

    case 'REMOVE_FILE':
      // Merge is destructive: removing any file resets all data
      return {
        ...state,
        mergedData: {},
        loadedFiles: [],
        detectedYears: [],
        userRates: {},
      }

    case 'CLEAR_ALL':
      return {
        ...state,
        mergedData: {},
        loadedFiles: [],
        detectedYears: [],
        userRates: {},
      }

    case 'SET_RATE': {
      const { year, field, value } = action.payload
      return {
        ...state,
        userRates: {
          ...state.userRates,
          [year]: { ...(state.userRates[year] ?? {}), [field]: value },
        },
      }
    }

    case 'ADD_FERIADO':
      return {
        ...state,
        feriadosMap: { ...state.feriadosMap, [action.payload.date]: action.payload.name },
      }

    case 'REMOVE_FERIADO': {
      const next = { ...state.feriadosMap }
      delete next[action.payload]
      return { ...state, feriadosMap: next }
    }

    case 'SET_EV_MODE':
      return { ...state, evMode: action.payload }

    case 'SET_EV_CONFIG':
      return { ...state, evConfig: { ...state.evConfig, ...action.payload } }

    case 'SET_PUNTA_START':
      return { ...state, puntaStart: action.payload }

    case 'SHOW_TOOLTIP':
      return { ...state, tooltip: action.payload }

    case 'HIDE_TOOLTIP':
      return { ...state, tooltip: { ...state.tooltip, visible: false } }

    default:
      return state
  }
}

export function useAppState() {
  return useReducer(reducer, initialState)
}

export type MergedData = Record<string, Record<number, number>>

export interface LoadedFile {
  name: string
  dateFrom: string
  dateTo: string
  days: number
}

export interface YearRates {
  t3_valle: number
  t3_llano: number
  t3_punta: number
  t2_punta: number
  t2_fp: number
  t1_e1: number
  t1_e2: number
  t1_e3: number
}

export interface Triple3Rates {
  valle: number
  llano: number
  punta: number
}

export interface Triple2Rates {
  punta: number
  fp: number
}

export interface TariffResult {
  name: string
  rate: number
}

export interface DateInfo {
  year: number
  dow: number
  dn: string
  day: number
  mn: string
  isWknd: boolean
  isFeriado: boolean
  feriadoName: string
  isOffPeak: boolean
}

export interface TooltipContent {
  dateStr: string
  hour: number
  kwh: number | null
  kwhRaw: number | null
  tariff3Name: string
  tariff3Rate: number
  tariff2Name: string
  tariff2Rate: number
  tariff1Rate: number
  tariff1Name: string  // "1° esc.", "2° esc.", "3° esc."
  feriadoName: string
  dayType: string
  year: number
  dn: string
  day: number
  mn: string
}

export interface TooltipState {
  visible: boolean
  x: number
  y: number
  content: TooltipContent | null
}

export interface AppState {
  mergedData: MergedData
  loadedFiles: LoadedFile[]
  detectedYears: number[]
  userRates: Record<number, Partial<YearRates>>
  feriadosMap: Record<string, string>
  evMode: boolean
  puntaStart: 17 | 18 | 19
  tooltip: TooltipState
}

export type Action =
  | { type: 'MERGE_DATA'; payload: { data: MergedData; file: LoadedFile; years: number[] } }
  | { type: 'REMOVE_FILE'; payload: number }
  | { type: 'CLEAR_ALL' }
  | { type: 'SET_RATE'; payload: { year: number; field: keyof YearRates; value: number } }
  | { type: 'ADD_FERIADO'; payload: { date: string; name: string } }
  | { type: 'REMOVE_FERIADO'; payload: string }
  | { type: 'SET_EV_MODE'; payload: boolean }
  | { type: 'SET_PUNTA_START'; payload: 17 | 18 | 19 }
  | { type: 'SHOW_TOOLTIP'; payload: TooltipState }
  | { type: 'HIDE_TOOLTIP' }

export interface BandCosts {
  Valle: number
  Llano: number
  Punta: number
}

export interface BandCosts2 {
  Punta: number
  'Fuera de Punta': number
}

export interface BandCostsSimple {
  e1: number
  e2: number
  e3: number
}

export interface BandKwhSimple {
  e1: number
  e2: number
  e3: number
}

export interface BandKwh {
  Valle: number
  Llano: number
  Punta: number
}

export interface BandKwh2 {
  Punta: number
  'Fuera de Punta': number
}

export interface ComputedStats {
  totalKwh: number
  valle: { kwh: number; pct: number }
  llano: { kwh: number; pct: number }
  punta: { kwh: number; pct: number }
}

export interface ComputedComparison {
  g3: number
  g2: number
  g1: number
  c3: BandCosts
  c2: BandCosts2
  c1: BandCostsSimple
  k3: BandKwh
  k2: BandKwh2
  k1: BandKwhSimple
}

export interface ComputeResult {
  allDates: string[]
  maxV: number
  stats: ComputedStats
  comparison: ComputedComparison
}

export interface ParseResult {
  data: MergedData
  dateFrom: string
  dateTo: string
  days: number
  years: number[]
}

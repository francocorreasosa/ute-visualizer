declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void
  }
}

function track(event: string, params?: Record<string, unknown>) {
  window.gtag?.('event', event, params)
}

export const analytics = {
  fileUploaded: (days: number, years: number[]) =>
    track('file_uploaded', { days, years_count: years.length, years: years.join(',') }),

  demoLoaded: () =>
    track('demo_loaded'),

  tabChanged: (tab: 'heatmap' | 'charts') =>
    track('tab_changed', { tab }),

  evSimulatorToggled: (enabled: boolean) =>
    track('ev_simulator_toggled', { enabled }),

  puntaStartChanged: (hour: 17 | 18 | 19) =>
    track('punta_start_changed', { hour }),

  chartViewed: (chart: string) =>
    track('chart_viewed', { chart }),
}

import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: '#07090f',
        surface: '#0f1219',
        card: '#111827',
        'border-dim': '#2d3548',
        'border-subtle': 'rgba(255,255,255,0.06)',
        orange: '#ff6b2b',
        green: '#22c55e',
        blue: '#3b82f6',
        red: '#ef4444',
        purple: '#8b5cf6',
        amber: '#f59e0b',
        'text-primary': '#c8cdd8',
        'text-muted': '#6b7280',
        'text-dim': '#4b5563',
        'text-data': '#e0e4f0',
        'slate-dark': '#1e293b',
        'slate-border': '#334155',
        'slate-hover': '#475569',
      },
      fontFamily: {
        sans: ['var(--font-dm-sans)', 'sans-serif'],
        mono: ['var(--font-jetbrains-mono)', 'monospace'],
      },
      maxWidth: {
        content: '860px',
      },
    },
  },
  plugins: [],
}

export default config

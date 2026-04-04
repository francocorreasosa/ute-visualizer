import type { Metadata } from 'next'
import { DM_Sans, JetBrains_Mono } from 'next/font/google'
import Script from 'next/script'
import './globals.css'
import ContributorsSection from '@/components/ContributorsSection'

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  weight: ['400', '500', '700'],
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  weight: ['400', '500', '600', '700'],
})

export const metadata: Metadata = {
  title: 'Heatmap UTE - Análisis Tarifario',
  description: 'Análisis de consumo eléctrico y comparación tarifaria UTE Uruguay',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <Script src="https://www.googletagmanager.com/gtag/js?id=G-5BS6P4X2B4" strategy="afterInteractive" />
      <Script id="gtag-init" strategy="afterInteractive">{`
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', 'G-5BS6P4X2B4');
      `}</Script>
      <body className={`${dmSans.variable} ${jetbrainsMono.variable} font-sans bg-bg text-text-primary`}>
        {children}
        <div className="flex justify-center px-5 pb-9">
          <div className="w-full max-w-content">
            <ContributorsSection />
          </div>
        </div>
      </body>
    </html>
  )
}

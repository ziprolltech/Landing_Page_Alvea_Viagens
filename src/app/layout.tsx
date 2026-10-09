import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/Navbar'
import Footer from '@/components/layout/Footer'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
  weight: ['300', '400', '500', '600', '700', '800', '900'],
})

export const metadata: Metadata = {
  /* The browser tab always reads "Alvea Viagens": pages do not set their own title. */
  title: 'Alvea Viagens',
  icons: {
    icon:     [{ url: '/favicon-alvea.png', type: 'image/png' }],
    shortcut: '/favicon-alvea.png',
    apple:    '/favicon-alvea.png',
  },
  description:
    'Passagens aéreas, milhas e oportunidades exclusivas para você viajar mais pagando menos.',
  keywords: [
    'milhas aéreas',
    'passagens aéreas',
    'emitir passagem',
    'comprar milhas',
    'viagens premium',
    'alvea viagens',
  ],
  openGraph: {
    title: 'Alvea Viagens — Transformamos Milhas em Experiências Inesquecíveis',
    description:
      'Passagens aéreas, milhas e oportunidades exclusivas para você viajar mais pagando menos.',
    type: 'website',
    locale: 'pt_BR',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={inter.variable}>
      <body className="antialiased">
        {/* Fixed sky gradient — shows on all pages beneath any page-specific background */}
        <div
          className="fixed inset-0 pointer-events-none"
          style={{
            zIndex: -10,
            background:
              'linear-gradient(180deg, #020810 0%, #03101E 8%, #061826 18%, #0A2340 33%, #112D52 50%, #173965 66%, #1F4674 80%, #285383 90%, #305C8C 100%)',
          }}
        />
        <Navbar />
        <div className="relative">
          {children}
        </div>
        <Footer />
      </body>
    </html>
  )
}

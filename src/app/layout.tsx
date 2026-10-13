import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/Navbar'
import Footer from '@/components/layout/Footer'
import Analytics from '@/components/analytics/Analytics'
import ConsentBanner from '@/components/analytics/ConsentBanner'
import JsonLd from '@/components/seo/JsonLd'
import { pageMetadata } from '@/lib/seo/page-metadata'
import { SITE_URL, SITE_NAME, SITE_DESCRIPTION } from '@/lib/config/site'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
  weight: ['300', '400', '500', '600', '700', '800', '900'],
})

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  applicationName: SITE_NAME,
  /* The browser tab always reads "Alvea Viagens": pages do not set their own title. */
  title: 'Alvea Viagens',
  /* Same artwork as public/favicon-alvea.png, resized (scripts/build-brand-images.mjs):
     the original is 1.5 MB, too heavy to be downloaded by every visitor. */
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '48x48' },
      { url: '/icons/icon-48.png',  type: 'image/png', sizes: '48x48'   },
      { url: '/icons/icon-192.png', type: 'image/png', sizes: '192x192' },
    ],
    apple: [{ url: '/icons/apple-touch-icon.png', sizes: '180x180' }],
  },
  keywords: [
    'milhas aéreas',
    'passagens aéreas',
    'emitir passagem',
    'comprar milhas',
    'viagens premium',
    'alvea viagens',
  ],
  /* Home: description, canonical, Open Graph and Twitter card. Every other page
     replaces these through pageMetadata(). */
  ...pageMetadata({
    path: '/',
    shareTitle: 'Alvea Viagens — Transformamos milhas em experiências inesquecíveis',
    description: SITE_DESCRIPTION,
  }),
  robots: { index: true, follow: true },
  formatDetection: { telephone: false },
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
        <JsonLd />
        <Navbar />
        <div className="relative">
          {children}
        </div>
        <Footer />
        <ConsentBanner />
        <Analytics />
      </body>
    </html>
  )
}

import { pageMetadata } from '@/lib/seo/page-metadata'

/* The page itself is a client component, so its metadata lives here. */
export const metadata = pageMetadata({
  path: '/destinos',
  shareTitle: 'Destinos | Alvea Viagens',
  description:
    'Escolha seu destino na Europa, Américas, Ásia, África ou Oceania e solicite à Alvea Viagens a cotação da sua passagem aérea pelo WhatsApp.',
})

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}

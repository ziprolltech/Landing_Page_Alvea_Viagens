import { pageMetadata } from '@/lib/seo/page-metadata'

/* The page itself is a client component, so its metadata lives here. */
export const metadata = pageMetadata({
  path: '/atendimento',
  shareTitle: 'Atendimento | Alvea Viagens',
  description:
    'Fale com a Alvea Viagens pelo WhatsApp ou por e-mail e peça sua cotação de passagens aéreas, emissão com milhas ou planejamento de viagem.',
})

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}

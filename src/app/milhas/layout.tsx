import { pageMetadata } from '@/lib/seo/page-metadata'

/* The page itself is a client component, so its metadata lives here. */
export const metadata = pageMetadata({
  path: '/milhas',
  shareTitle: 'Milhas | Alvea Viagens',
  description:
    'Venda de milhas e gestão de milhas com a Alvea Viagens: envie suas informações e nossa equipe avalia a melhor forma de aproveitar seus pontos.',
})

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}

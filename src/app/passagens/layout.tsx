import { pageMetadata } from '@/lib/seo/page-metadata'

/* The page itself is a client component, so its metadata lives here. */
export const metadata = pageMetadata({
  path: '/passagens',
  shareTitle: 'Passagens | Alvea Viagens',
  description:
    'Passagens aéreas nacionais e internacionais emitidas com milhas pela Alvea Viagens.',
  index: false,
})

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}

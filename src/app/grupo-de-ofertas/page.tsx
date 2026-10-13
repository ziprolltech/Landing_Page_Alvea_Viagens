import { existsSync } from 'node:fs'
import path from 'node:path'
import { pageMetadata } from '@/lib/seo/page-metadata'
import OffersGroupContent from '@/components/grupo-ofertas/OffersGroupContent'
import { OFFERS_GROUP_VIDEO_FILE } from '@/lib/config/links'

export const metadata = pageMetadata({
  path: '/grupo-de-ofertas',
  shareTitle: 'Grupo de Ofertas | Alvea Viagens',
  description:
    'Receba promoções e oportunidades de viagem da Alvea Viagens diretamente no WhatsApp.',
})

export default function GrupoDeOfertasPage() {
  // The video is optional: the player is rendered only when the file is present,
  // so a missing file never produces a broken player or a failed request.
  const hasVideo = existsSync(path.join(process.cwd(), OFFERS_GROUP_VIDEO_FILE))

  return <OffersGroupContent hasVideo={hasVideo} />
}

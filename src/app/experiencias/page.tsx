import { pageMetadata } from '@/lib/seo/page-metadata'
import JourneyExperience from '@/components/experiencias/JourneyExperience'

export const metadata = pageMetadata({
  path: '/experiencias',
  shareTitle: 'ALVEA JOURNEY — Uma viagem antes da viagem',
  description:
    'ALVEA JOURNEY: uma viagem antes da viagem. Role a página e embarque em uma experiência interativa pelo mundo, pelos destinos e pelo jeito Alvea de pensar cada viagem.',
})

export default function ExperienciasPage() {
  return <JourneyExperience />
}

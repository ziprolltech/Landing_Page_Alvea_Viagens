import type { Metadata } from 'next'
import JourneyExperience from '@/components/experiencias/JourneyExperience'

export const metadata: Metadata = {
  description:
    'ALVEA JOURNEY: uma viagem antes da viagem. Role a página e embarque em uma experiência interativa pelo mundo, pelos destinos e pelo jeito Alvea de pensar cada viagem.',
  openGraph: {
    title: 'ALVEA JOURNEY — Uma viagem antes da viagem',
    description:
      'Uma experiência interativa de viagem: embarque, decolagem, destinos, cruzeiros e o jeito Alvea de pensar o caminho.',
    type: 'website',
    locale: 'pt_BR',
  },
}

export default function ExperienciasPage() {
  return <JourneyExperience />
}

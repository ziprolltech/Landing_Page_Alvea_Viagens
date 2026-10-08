'use client'

import { useRef } from 'react'
import { useScroll } from 'framer-motion'
import JourneyHero        from './JourneyHero'
import AirportScene       from './AirportScene'
import TakeoffScene       from './TakeoffScene'
import WorldMapScene      from './WorldMapScene'
import DestinationsScene  from './DestinationsScene'
import BeyondSkyScene     from './BeyondSkyScene'
import CruiseScene        from './CruiseScene'
import ProcessScene       from './ProcessScene'
import MilesScene         from './MilesScene'
import JourneyFinale      from './JourneyFinale'
import JourneyProgress    from './JourneyProgress'
import JourneySound       from './JourneySound'

/* ALVEA JOURNEY — "Uma viagem antes da viagem."

   Ten scenes in document order; each one owns a stretch of ordinary vertical
   scroll and renders a sticky, viewport-sized stage driven by that stretch's
   progress (see scene.tsx). The page scrolls natively at all times.

   This wrapper must not get `overflow: hidden/auto` — that would stop the
   sticky stages from pinning. Each stage clips its own content instead, so
   nothing can cause a horizontal scrollbar. */

export default function JourneyExperience() {
  const ref = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })

  return (
    <main ref={ref} className="relative bg-sky-deep">
      <JourneyHero />
      <AirportScene />
      <TakeoffScene />
      <WorldMapScene />
      <DestinationsScene />
      <BeyondSkyScene />
      <CruiseScene />
      <ProcessScene />
      <MilesScene />
      <JourneyFinale />
      <JourneyProgress progress={scrollYProgress} />
      <JourneySound progress={scrollYProgress} />
    </main>
  )
}

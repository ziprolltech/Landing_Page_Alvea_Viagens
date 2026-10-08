'use client'

import Image from 'next/image'
import { motion, useReducedMotion, useTransform, type MotionValue } from 'framer-motion'
import {
  CITIES, JOURNEY_ASSETS, MAP_HEIGHT, MAP_WIDTH, ORIGIN, chapter, routeControl, routePath,
  type City,
} from '@/data/experiencias'
import { CloudDeck, DECK_HANDOFF } from './atmosphere'
import { Kicker, Scene, useAppear, useFx, useScene } from './scene'

/* 04 — O mundo.
   The scene opens on the last frame of the take-off: the cloud deck, seen from
   above. The clouds part and the world is underneath, drawn in points of light.

   One aircraft flies São Paulo → Paris for most of the scene and *draws* that
   route behind it. The other routes leave São Paulo one after another, each
   with a soft halo, and each city answers with a single pulse when its route
   arrives. Everything is tied to the scroll, so it all un-draws on the way back.

   At the end the camera pushes in towards Paris — the first destination of the
   next scene.

   Desktop: the whole map fits and only breathes a little.
   Mobile:  the map is 2.3× the screen width; the camera follows the aircraft
            across the Atlantic, then carries on east. The pan is driven by one
            CSS variable (--t) so the distance can differ per breakpoint. */

const CHAPTER = chapter('o-mundo')

const PARIS = CITIES.find((c) => c.name === 'Paris') as City
const OTHERS = CITIES.filter((c) => c !== PARIS)

/* The flight */
const FLIGHT_FROM = 0.2
const FLIGHT_TO   = 0.62

/* Each other route is drawn inside its own slice of the scene's progress */
const FIRST = 0.16
const LAST  = 0.84
const SLICE = (LAST - FIRST) / OTHERS.length
const slot = (index: number): [number, number] => [FIRST + index * SLICE, FIRST + index * SLICE + SLICE * 1.7]

function Route({ city, from, to, progress }: { city: City; from: number; to: number; progress: MotionValue<number> }) {
  const pathLength = useTransform(progress, [from, to], [0, 1])
  const opacity    = useTransform(progress, [from, from + 0.03], [0, 1])
  const d = routePath(city)
  return (
    <motion.g style={{ opacity }}>
      {/* halo: a wide, faint copy of the same stroke — glow without a filter */}
      <motion.path d={d} fill="none" stroke="#ECC96A" strokeOpacity={0.13} strokeWidth={4.2} strokeLinecap="round" style={{ pathLength }} />
      <motion.path d={d} fill="none" stroke="url(#journey-route)" strokeWidth={1.1} strokeLinecap="round" style={{ pathLength }} />
    </motion.g>
  )
}

const LABEL_POSITION: Record<City['anchor'], string> = {
  right:  'left-full top-1/2 -translate-y-1/2 ml-2.5',
  left:   'right-full top-1/2 -translate-y-1/2 mr-2.5',
  top:    'bottom-full left-1/2 -translate-x-1/2 mb-2',
  bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
}

function CityMarker({ city, appearAt, progress, reduced, origin = false }: {
  city: City; appearAt: number; progress: MotionValue<number>; reduced: boolean; origin?: boolean
}) {
  const opacity = useTransform(progress, [appearAt - 0.03, appearAt], [0, 1])
  const scale   = useFx(progress, [appearAt - 0.03, appearAt], [0.4, 1], reduced, 1)
  /* arrival pulse — one ring, opening with the scroll */
  const ringOpacity = useTransform(progress, [appearAt - 0.005, appearAt + 0.012, appearAt + 0.075], [0, 0.75, 0])
  const ringScale   = useFx(progress, [appearAt, appearAt + 0.075], [0.6, 3.4], reduced, 1.8)
  return (
    <motion.div
      className="group absolute pointer-events-auto"
      style={{
        left: `${((city.x / MAP_WIDTH) * 100).toFixed(3)}%`,
        top:  `${((city.y / MAP_HEIGHT) * 100).toFixed(3)}%`,
        opacity,
      }}
    >
      <motion.span
        className="absolute h-3 w-3 rounded-full border border-gold-light"
        style={{ x: '-50%', y: '-50%', scale: ringScale, opacity: ringOpacity }}
        aria-hidden="true"
      />
      <motion.span className="absolute" style={{ x: '-50%', y: '-50%', scale }}>
        <span
          className={`block rounded-full transition-transform duration-300 group-hover:scale-150 ${origin ? 'h-2.5 w-2.5 bg-white' : 'h-2 w-2 bg-gold-light'}`}
          style={{ boxShadow: origin ? '0 0 0 4px rgba(255,255,255,0.14), 0 0 18px rgba(255,255,255,0.7)' : '0 0 0 4px rgba(212,168,83,0.16), 0 0 16px rgba(236,201,106,0.8)' }}
        />
      </motion.span>
      <span
        className={`absolute whitespace-nowrap text-[11px] sm:text-[12px] font-semibold uppercase tracking-[0.16em] transition-colors duration-300 group-hover:text-white ${
          origin ? 'text-white' : 'text-white/75'
        } ${city.mobileLabel ? '' : 'hidden lg:block'} ${LABEL_POSITION[city.anchor]}`}
      >
        {city.name}
      </span>
    </motion.div>
  )
}

/* Point and heading on the São Paulo → Paris arc */
function onParisRoute(t: number) {
  const c = routeControl(PARIS)
  const u = 1 - t
  const x  = u * u * ORIGIN.x + 2 * u * t * c.x + t * t * PARIS.x
  const y  = u * u * ORIGIN.y + 2 * u * t * c.y + t * t * PARIS.y
  const dx = 2 * u * (c.x - ORIGIN.x) + 2 * t * (PARIS.x - c.x)
  const dy = 2 * u * (c.y - ORIGIN.y) + 2 * t * (PARIS.y - c.y)
  return { x, y, angle: (Math.atan2(dy, dx) * 180) / Math.PI }
}

const PARIS_ORIGIN = `${((PARIS.x / MAP_WIDTH) * 100).toFixed(2)}% ${((PARIS.y / MAP_HEIGHT) * 100).toFixed(2)}%`

export default function WorldMapScene() {
  const reduced = useReducedMotion() ?? false
  const { ref, progress } = useScene()

  /* Hand-over from the take-off: the same cloud deck, opening */
  const deckOpacity = useTransform(progress, [0, 0.13], [DECK_HANDOFF.opacity, 0])
  const deckScale   = useFx(progress, [0, 0.14], [DECK_HANDOFF.scale, 1.5], reduced, DECK_HANDOFF.scale)

  const mapOpacity = useTransform(progress, [0.02, 0.13, 0.93, 1], [0, 1, 1, 0])
  /* settles as the clouds open; pushes in on Paris at the very end */
  const mapScale   = useFx(progress, [0, 0.16, 0.9, 1], [1.14, 1, 1, 1.32], reduced, 1)
  /* Camera pan (mobile). Kept under reduced motion too: it is how the eastern
     half of the map comes into view on a phone. */
  const pan        = useTransform(progress, [0.1, FLIGHT_TO, 0.9], [0, 0.33, 1])

  /* Aircraft on the Paris route */
  const flight       = useTransform(progress, [FLIGHT_FROM, FLIGHT_TO], [0, 1])
  const planeLeft    = useTransform(flight, (t) => `${((onParisRoute(t).x / MAP_WIDTH) * 100).toFixed(3)}%`)
  const planeTop     = useTransform(flight, (t) => `${((onParisRoute(t).y / MAP_HEIGHT) * 100).toFixed(3)}%`)
  const planeRotate  = useTransform(flight, (t) => Math.round(onParisRoute(t).angle * 10) / 10)
  /* under reduced motion nothing travels across the map: the route still draws, without the aircraft */
  const planeOpacity = useTransform(
    progress,
    [FLIGHT_FROM - 0.02, FLIGHT_FROM + 0.02, FLIGHT_TO, FLIGHT_TO + 0.05],
    [0, reduced ? 0 : 1, reduced ? 0 : 1, 0],
  )

  const kicker = useAppear(progress, [0.05, 0.13, 0.86, 0.93], reduced)
  const title  = useAppear(progress, [0.07, 0.16, 0.86, 0.93], reduced)
  const note   = useAppear(progress, [0.68, 0.77, 0.86, 0.93], reduced)

  return (
    <Scene sceneRef={ref} progress={progress} id={CHAPTER.id} label="O mundo" screens={CHAPTER.screens}>
      {/* Map */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        style={{ opacity: mapOpacity }}
      >
        {/* Atmosphere */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 75% 60% at 50% 52%, rgba(26,95,160,0.16) 0%, transparent 72%)' }}
          aria-hidden="true"
        />

        <motion.div
          className="relative shrink-0 w-[230vw] lg:w-[min(94vw,1500px)] mt-[10svh] [--pan-from:44vw] [--pan-to:-78vw] lg:[--pan-from:0vw] lg:[--pan-to:0vw]"
          style={{
            aspectRatio: `${MAP_WIDTH} / ${MAP_HEIGHT}`,
            scale: mapScale,
            transformOrigin: PARIS_ORIGIN,
            '--t': pan,
            x: 'calc(var(--pan-from) + (var(--pan-to) - var(--pan-from)) * var(--t))',
          } as React.ComponentProps<typeof motion.div>['style']}
        >
          {/* The edges of the world fade into the dark — a page, not a panel */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={JOURNEY_ASSETS.worldDots}
            alt="Mapa-múndi estilizado em pontos"
            width={MAP_WIDTH}
            height={MAP_HEIGHT}
            loading="lazy"
            decoding="async"
            className="absolute inset-0 h-full w-full opacity-50"
            style={{
              maskImage: 'radial-gradient(ellipse 58% 66% at 50% 46%, #000 52%, transparent 100%)',
              WebkitMaskImage: 'radial-gradient(ellipse 58% 66% at 50% 46%, #000 52%, transparent 100%)',
            }}
          />

          {/* Routes */}
          <svg
            viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`}
            className="absolute inset-0 h-full w-full overflow-visible"
            aria-hidden="true"
          >
            <defs>
              <linearGradient id="journey-route" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%"   stopColor="#D4A853" stopOpacity="0.35" />
                <stop offset="55%"  stopColor="#ECC96A" stopOpacity="0.95" />
                <stop offset="100%" stopColor="#FFF3C9" stopOpacity="1" />
              </linearGradient>
            </defs>
            {OTHERS.map((city, index) => (
              <Route key={city.name} city={city} from={slot(index)[0]} to={slot(index)[1]} progress={progress} />
            ))}
            {/* drawn by the aircraft itself */}
            <Route city={PARIS} from={FLIGHT_FROM} to={FLIGHT_TO} progress={progress} />
          </svg>

          {/* Cities */}
          <div className="absolute inset-0 pointer-events-none">
            <CityMarker city={ORIGIN} appearAt={0.12} progress={progress} reduced={reduced} origin />
            {OTHERS.map((city, index) => (
              <CityMarker key={city.name} city={city} appearAt={slot(index)[1]} progress={progress} reduced={reduced} />
            ))}
            <CityMarker city={PARIS} appearAt={FLIGHT_TO} progress={progress} reduced={reduced} />
          </div>

          {/* Aircraft */}
          <motion.div
            className="absolute pointer-events-none"
            style={{ left: planeLeft, top: planeTop, opacity: planeOpacity }}
            aria-hidden="true"
          >
            <motion.div
              className="w-[clamp(46px,5vw,84px)]"
              style={{ x: '-50%', y: '-50%', rotate: planeRotate }}
            >
              <Image
                src={JOURNEY_ASSETS.plane}
                alt=""
                width={1672}
                height={941}
                sizes="84px"
                className="h-auto w-full"
              />
            </motion.div>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* The clouds the take-off left us above */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{ opacity: deckOpacity, scale: deckScale }}
        aria-hidden="true"
      >
        <CloudDeck />
      </motion.div>

      {/* Copy */}
      <div className="absolute inset-x-0 top-[12svh] z-10 flex flex-col items-center gap-4 px-6 text-center">
        <Kicker number={CHAPTER.number} label={CHAPTER.label} style={kicker} />
        <motion.h2
          style={title}
          className="max-w-3xl font-black leading-[1.04] tracking-[-0.03em] text-white text-[clamp(28px,4.6vw,64px)]"
        >
          Daqui de cima, <span className="text-gold-gradient">tudo é caminho.</span>
        </motion.h2>
      </div>

      <motion.p
        style={note}
        className="absolute inset-x-0 bottom-[9svh] px-6 text-center text-[13px] sm:text-[15px] tracking-[0.02em] text-white/55"
      >
        Onze cidades. Infinitas formas de chegar.
      </motion.p>
    </Scene>
  )
}

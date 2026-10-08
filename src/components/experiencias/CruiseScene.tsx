'use client'

import Image from 'next/image'
import { motion, useReducedMotion, useTransform, type MotionValue } from 'framer-motion'
import { CRUISE_REGIONS, CRUISE_ROUTE, JOURNEY_ASSETS, chapter } from '@/data/experiencias'
import { OCEAN } from './BeyondSkyScene'
import { Kicker, NAVY, Scene, useAppear, useFx, useScene } from './scene'

/* 07 — Cruzeiros, from above.

   The camera travels with the ship. It sails into frame and then holds near
   the middle while the sea streams past underneath it — the water moves, not
   just the ship — so it reads as a vessel under way rather than a picture
   sliding over a background.

   What ties the ship to the water:
   · a patch of sunlit sea around it, matching the daylight on its decks;
   · a soft shadow in the water along the hull instead of a floating drop-shadow;
   · a wake drawn as a wake: churned foam astern, spreading and breaking up,
     plus the two long arms of the bow wave. It is a still SVG (rasterised once)
     that simply travels with the ship.

   The "sea stage" is laid out along the ship's course. On large screens the
   course runs left → right. On small screens the same stage is turned a quarter
   turn, so the ship sails up a portrait frame at full length instead of
   shrinking to a sliver; the words take the other side.

   Everything here is inspiration: no prices, dates, or itineraries on sale.

   Hand-over: opens on flat OCEAN (the sky scene's last frame); ends on NAVY. */

const CHAPTER = chapter('cruzeiros')

/* Where each region sits on large screens (percent of the stage) */
const REGION_SPOTS = [
  { left: '9%',  top: '29%' },
  { left: '66%', top: '26%' },
  { left: '14%', top: '71%' },
  { left: '71%', top: '69%' },
  { left: '41%', top: '81%' },
]

const REGIONS_FROM = 0.4
const REGIONS_STEP = 0.075

const SWELL   = 'repeating-linear-gradient(176deg, rgba(170,215,245,0) 0px, rgba(170,215,245,0) 22px, rgba(170,215,245,0.55) 23px, rgba(170,215,245,0) 25px)'
const CHOP    = 'repeating-linear-gradient(184deg, rgba(200,232,255,0) 0px, rgba(200,232,255,0) 9px, rgba(200,232,255,0.4) 10px, rgba(200,232,255,0) 11px)'

function Region({ name, index, progress, reduced }: {
  name: string; index: number; progress: MotionValue<number>; reduced: boolean
}) {
  const start = REGIONS_FROM + index * REGIONS_STEP
  const appear = useAppear(progress, [start, start + 0.06, 0.9, 0.96], reduced, 20)
  return (
    <motion.li
      style={{ ...appear, left: REGION_SPOTS[index].left, top: REGION_SPOTS[index].top }}
      className="group flex items-center gap-3 lg:absolute"
    >
      <span
        className="h-1.5 w-1.5 shrink-0 rounded-full bg-gold-light transition-transform duration-300 group-hover:scale-[1.8]"
        style={{ boxShadow: '0 0 0 4px rgba(212,168,83,0.16), 0 0 14px rgba(236,201,106,0.7)' }}
        aria-hidden="true"
      />
      <span className="font-black uppercase tracking-[0.06em] text-white/90 transition-colors duration-300 group-hover:text-white text-[clamp(15px,2.3vw,34px)]">
        {name}
      </span>
    </motion.li>
  )
}

/* The wake, in the ship's own coordinates: the hull spans x 1600 → 2600 (bow at
   2600), centred on y 465. Drawn once; never animated on its own. */
function Wake() {
  return (
    <svg
      viewBox="0 0 2600 930"
      className="absolute right-0 top-1/2 w-[260%] max-w-none -translate-y-1/2"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="journey-wake" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%"   stopColor="#DDF1FF" stopOpacity="0" />
          <stop offset="55%"  stopColor="#E6F5FF" stopOpacity="0.11" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.4" />
        </linearGradient>
        <linearGradient id="journey-wake-core" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%"   stopColor="#FFFFFF" stopOpacity="0" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.5" />
        </linearGradient>
        <linearGradient id="journey-bow-wave" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%"   stopColor="#DDF1FF" stopOpacity="0" />
          <stop offset="60%"  stopColor="#E6F5FF" stopOpacity="0.09" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.34" />
        </linearGradient>
        {/* breaks the straight edges up into foam */}
        <filter id="journey-foam" x="-4%" y="-30%" width="108%" height="160%">
          <feTurbulence type="fractalNoise" baseFrequency="0.011 0.045" numOctaves="2" seed="7" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="46" xChannelSelector="R" yChannelSelector="G" />
          <feGaussianBlur stdDeviation="6" />
        </filter>
        <filter id="journey-spray" x="-4%" y="-30%" width="108%" height="160%">
          <feTurbulence type="fractalNoise" baseFrequency="0.016 0.05" numOctaves="2" seed="3" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="40" xChannelSelector="R" yChannelSelector="G" />
          <feGaussianBlur stdDeviation="5" />
        </filter>
      </defs>

      {/* churned water astern */}
      <g filter="url(#journey-foam)">
        <path d="M 1680 418 L 60 318 L 60 612 L 1680 512 Z" fill="url(#journey-wake)" />
        <path d="M 1690 446 L 620 426 L 620 504 L 1690 484 Z" fill="url(#journey-wake-core)" />
      </g>

      {/* the two arms of the bow wave */}
      <g filter="url(#journey-spray)" fill="none" strokeLinecap="round">
        <path d="M 2520 408 Q 1500 300 240 60"  stroke="url(#journey-bow-wave)" strokeWidth="9" />
        <path d="M 2520 522 Q 1500 630 240 870" stroke="url(#journey-bow-wave)" strokeWidth="9" />
        <path d="M 2440 398 Q 1800 330 1000 236" stroke="url(#journey-bow-wave)" strokeWidth="24" strokeOpacity="0.3" />
        <path d="M 2440 532 Q 1800 600 1000 694" stroke="url(#journey-bow-wave)" strokeWidth="24" strokeOpacity="0.3" />
      </g>
    </svg>
  )
}

export default function CruiseScene() {
  const reduced = useReducedMotion() ?? false
  const { ref, progress } = useScene()

  /* Water comes in over the flat ocean colour, then streams past the ship */
  const waterIn = useTransform(progress, [0, 0.09], [0, 1])
  const swell   = useFx(progress, [0, 1], ['0%', '-42%'], reduced, '0%')
  const chop    = useFx(progress, [0, 1], ['0%', '-27%'], reduced, '0%')

  /* Ship: sails in, then the camera holds it (percent of the course length) */
  const shipX       = useFx(progress, [0.04, 0.3, 0.92], ['-88%', '-8%', '7%'], reduced, '0%')
  const shipOpacity = useTransform(progress, [0.04, 0.1, 0.9, 0.97], [0, 1, 1, 0])

  /* Copy */
  const kicker   = useAppear(progress, [0.05, 0.12, 0.34, 0.42], reduced)
  const title    = useAppear(progress, [0.07, 0.16, 0.34, 0.42], reduced, 36)
  const subtitle = useAppear(progress, [0.11, 0.2, 0.34, 0.42], reduced)
  const route    = useAppear(progress, [0.72, 0.8, 0.9, 0.96], reduced)
  const routeDraw = useTransform(progress, [0.74, 0.88], [0, 1])

  /* Hand-over to the dark of the next scene */
  const nightfall = useTransform(progress, [0.9, 1], [0, 1])

  return (
    <Scene sceneRef={ref} progress={progress} id={CHAPTER.id} label="Cruzeiros" screens={CHAPTER.screens} background={OCEAN}>
      <motion.div className="absolute inset-0 pointer-events-none" style={{ opacity: waterIn }} aria-hidden="true">
        {/* The sea stage, laid out along the ship's course (turned on small screens) */}
        <div className="absolute left-1/2 top-1/2 h-[100vw] w-[100svh] -translate-x-1/2 -translate-y-1/2 -rotate-90 lg:h-full lg:w-full lg:rotate-0">
          {/* Daylight on the water where the ship is; the frame falls off to deep sea */}
          <div
            className="absolute inset-0"
            style={{ background: 'radial-gradient(ellipse 58% 62% at 50% 50%, rgba(38,128,190,0.5) 0%, rgba(18,84,140,0.26) 46%, rgba(4,33,59,0) 78%)' }}
          />

          {/* Surface, streaming astern at two speeds */}
          <div
            className="absolute inset-0 overflow-hidden"
            style={{
              maskImage: 'radial-gradient(ellipse 78% 74% at 50% 50%, #000 24%, transparent 88%)',
              WebkitMaskImage: 'radial-gradient(ellipse 78% 74% at 50% 50%, #000 24%, transparent 88%)',
            }}
          >
            <motion.div className="absolute inset-y-0 left-0 w-[190%] opacity-[0.17]" style={{ x: swell, backgroundImage: SWELL }} />
            <motion.div className="absolute inset-y-0 left-0 w-[160%] opacity-[0.10]" style={{ x: chop, backgroundImage: CHOP }} />
          </div>

          {/* Ship + wake */}
          <motion.div className="absolute inset-0" style={{ x: shipX, opacity: shipOpacity }}>
            <div className="absolute left-[46%] top-[78%] w-[min(54%,1020px)] -translate-x-1/2 -translate-y-1/2 lg:left-1/2 lg:top-1/2 lg:w-[min(64%,1020px)]">
              <Wake />
              {/* the hull's shadow in the water */}
              <div
                className="absolute inset-x-[-3%] top-[-40%] h-[200%]"
                style={{ background: 'radial-gradient(ellipse 50% 46% at 50% 56%, rgba(1,10,22,0.6) 0%, rgba(1,10,22,0.28) 48%, transparent 76%)' }}
              />
              {/* aerated water along the sides */}
              <div
                className="absolute inset-x-[2%] top-[-18%] h-[136%]"
                style={{ background: 'radial-gradient(ellipse 50% 50% at 50% 50%, rgba(150,220,235,0.22) 0%, transparent 72%)' }}
              />
              <Image
                src={JOURNEY_ASSETS.ship}
                alt=""
                width={1696}
                height={263}
                sizes="(max-width: 1023px) 60vh, 1020px"
                className="relative h-auto w-full"
              />
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Title */}
      <div className="absolute inset-x-0 top-[10svh] flex flex-col items-center gap-4 px-6 text-center lg:top-[12svh]">
        <Kicker number={CHAPTER.number} label="No mar" style={kicker} />
        <motion.h2
          style={title}
          className="font-black uppercase leading-[0.9] tracking-[-0.02em] text-white text-[clamp(46px,11vw,170px)]"
        >
          Cruzeiros
        </motion.h2>
        <motion.p style={subtitle} className="text-[clamp(17px,2.2vw,30px)] font-light text-white/80">
          O mundo visto de outro ângulo.
        </motion.p>
      </div>

      {/* Regions — scattered around the ship on large screens, a list beside it on small ones */}
      <ul className="absolute inset-x-0 bottom-[20svh] flex flex-col items-start gap-3 px-7 lg:inset-0 lg:block lg:px-0">
        {CRUISE_REGIONS.map((name, index) => (
          <Region key={name} name={name} index={index} progress={progress} reduced={reduced} />
        ))}
      </ul>

      {/* Illustrative route */}
      <motion.div
        style={route}
        className="absolute inset-x-0 bottom-[7svh] flex flex-col items-center gap-2.5 px-6 text-center"
      >
        <div className="flex items-center gap-3 text-[11px] sm:text-[12px] font-semibold uppercase tracking-[0.24em] text-white/80">
          {CRUISE_ROUTE.map((stop, index) => (
            <span key={stop} className="flex items-center gap-3">
              {index > 0 && (
                <span className="relative block h-px w-8 sm:w-14 overflow-hidden bg-white/15" aria-hidden="true">
                  <motion.span className="absolute inset-0 origin-left bg-gold-light" style={{ scaleX: routeDraw }} />
                </span>
              )}
              {stop}
            </span>
          ))}
        </div>
        <p className="text-[11px] text-white/45">Rota ilustrativa, apenas para inspirar — não é um itinerário à venda.</p>
      </motion.div>

      {/* Nightfall */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{ opacity: nightfall, background: NAVY }}
        aria-hidden="true"
      />
    </Scene>
  )
}

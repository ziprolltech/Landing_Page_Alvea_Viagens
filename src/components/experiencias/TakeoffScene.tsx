'use client'

import Image from 'next/image'
import { motion, useReducedMotion, useTransform } from 'framer-motion'
import { JOURNEY_ASSETS, chapter } from '@/data/experiencias'
import { CloudDeck, DECK_HANDOFF } from './atmosphere'
import { Kicker, Scene, useAppear, useFx, useScene } from './scene'

/* 03 — Decolagem, seen from directly above. The aircraft is the subject from
   the first frame to the last; the world around it does the moving.

   0.00 → 0.16  Line-up. The aircraft at rest on the centre-line, edge lights on.
   0.16 → 0.46  Acceleration. The centre-line runs under it faster and faster
                (distance ∝ progress^2.4) and the edge lights stretch into streaks.
   0.46 → 0.66  Rotation and climb. The shadow lets go and softens; the ground —
                runway, airfield, the lights of the city — falls away and slides
                back, getting smaller: that is the altitude.
   0.58 → 0.77  The cloud layer. It reaches the camera first (a white veil, over
                the aircraft), then drops below it.
   0.72 → 0.90  Open sky. Clean light, the cloud deck receding underneath.
   0.88 → 1.00  Cruising altitude: the sky deepens to navy and the aircraft pulls
                ahead, out of frame.

   Hand-over: the last frame is navy with the cloud deck at DECK_HANDOFF. The
   world map opens on the same frame and parts those clouds.

   Cost: everything animated is transform or opacity, except the centre-line
   (background-position on a strip the width of the runway). No animated blur.

   This is a different shot from the Home page's ScrollPlane (a fly-over across
   the layout); only the aircraft artwork is shared. */

const CHAPTER = chapter('decolagem')

/* Lights of the city around the airfield: one element, many box-shadows, laid
   out in a 300vw × 300vh field. Seeded, so server and client agree. */
function makeCityLights(): string {
  let s = 41
  const next = () => {
    s = (s * 1664525 + 1013904223) % 4294967296
    return s / 4294967296
  }
  const lights: string[] = []
  const towns = Array.from({ length: 11 }, () => ({ x: 14 + next() * 272, y: 14 + next() * 272, r: 9 + next() * 24 }))
  for (const town of towns) {
    const count = 9 + Math.floor(next() * 12)
    for (let i = 0; i < count; i++) {
      const angle = next() * Math.PI * 2
      const reach = next() * next() * town.r
      const x = town.x + Math.cos(angle) * reach
      const y = town.y + Math.sin(angle) * reach * 0.7
      const warm = next() > 0.35
      const alpha = (0.3 + next() * 0.5).toFixed(2)
      const spread = next() > 0.82 ? 1 : 0
      if (Math.abs(x - 150) < 15) continue // keep the runway corridor clear
      lights.push(`${x.toFixed(1)}vw ${y.toFixed(1)}vh 0 ${spread}px rgba(${warm ? '255,214,150' : '205,225,255'},${alpha})`)
    }
  }
  return lights.join(', ')
}
const CITY_LIGHTS = makeCityLights()

const EDGE_LIGHT  = 'radial-gradient(circle, rgba(236,201,106,0.95) 0 2.5px, rgba(236,201,106,0.22) 3.5px, transparent 8px)'
const EDGE_STREAK = 'linear-gradient(180deg, transparent 0%, rgba(236,201,106,0.85) 50%, transparent 100%)'

export default function TakeoffScene() {
  const reduced = useReducedMotion() ?? false
  const { ref, progress } = useScene()

  /* Ground */
  const groundOpacity = useTransform(progress, [0, 0.07, 0.66, 0.8], [0, 1, 1, 0])
  const groundScale   = useFx(progress, [0.46, 0.82], [1, 0.34], reduced, 1)
  const groundY       = useFx(progress, [0.46, 0.82], ['0%', '12%'], reduced, '0%')
  const stripes       = useTransform(progress, (p) => (reduced ? '0px' : `${Math.round(Math.min(p, 0.62) ** 2.4 * 16000)}px`))
  const streaks       = useTransform(progress, [0.16, 0.42, 0.6, 0.7], [0, 0.9, 0.9, 0])

  /* Aircraft (artwork points right → rotated to fly up the screen) */
  /* under reduced motion it cannot fly out of frame, so it fades before the closing line */
  const planeOpacity = useTransform(progress, reduced ? [0, 0.07, 0.78, 0.84] : [0, 0.07, 0.92, 0.97], [0, 1, 1, 0])
  const planeScale   = useFx(progress, [0, 0.46, 0.8, 0.97], [0.8, 0.84, 1.16, 1.0], reduced, 1)
  const planeY       = useFx(progress, [0, 0.46, 0.8, 0.96], ['14svh', '8svh', '-3svh', '-82svh'], reduced, '0svh')
  /* Shadow: a sharp one on the tarmac, a soft one once airborne — cross-faded
     rather than animating a blur radius */
  const groundShadow = useTransform(progress, [0, 0.07, 0.44, 0.52], [0, 0.55, 0.55, 0])
  const airShadow    = useTransform(progress, [0.44, 0.5, 0.68], [0, 0.38, 0])
  const airOffset    = useFx(progress, [0.44, 0.68], ['0px', '96px'], reduced, '24px')
  const airScale     = useFx(progress, [0.44, 0.68], [1, 0.62], reduced, 0.9)

  /* Sky and cloud */
  const skyOpacity  = useTransform(progress, [0.52, 0.72, 0.88, 1], [0, 1, 1, 0])
  const veilOpacity = useTransform(progress, [0.58, 0.67, 0.77], [0, 0.92, 0])
  const veilScale   = useFx(progress, [0.58, 0.77], [2.6, 1.5], reduced, 1.6)
  const deckOpacity = useTransform(progress, [0.66, 0.75, 1], [0, 1, DECK_HANDOFF.opacity])
  const deckScale   = useFx(progress, [0.66, 1], [1.7, DECK_HANDOFF.scale], reduced, DECK_HANDOFF.scale)
  const sunOpacity  = useTransform(progress, [0.72, 0.8, 0.9, 0.97], [0, 1, 1, 0])

  /* Copy */
  const kicker = useAppear(progress, [0.02, 0.08, 0.24, 0.32], reduced)
  const lineA  = useAppear(progress, [0.05, 0.12, 0.24, 0.32], reduced)
  const lineB  = useAppear(progress, [0.84, 0.9, 0.955, 0.995], reduced, 34)

  return (
    <Scene sceneRef={ref} progress={progress} id={CHAPTER.id} label="Decolagem" screens={CHAPTER.screens}>
      {/* The ground: three screens wide and tall, so it can shrink into the distance */}
      <motion.div
        className="absolute inset-[-100%] pointer-events-none"
        style={{ opacity: groundOpacity, scale: groundScale, y: groundY }}
        aria-hidden="true"
      >
        <div className="absolute left-0 top-0 h-[2px] w-[2px] rounded-full" style={{ boxShadow: CITY_LIGHTS }} />
        <div
          className="absolute inset-0"
          style={{ background: 'radial-gradient(ellipse 24% 30% at 50% 50%, rgba(13,36,71,0.6) 0%, transparent 72%)' }}
        />

        {/* Runway — finite, so its ends come into view as the aircraft climbs */}
        <div
          className="absolute left-1/2 top-[30%] h-[40%] w-[clamp(150px,26vw,330px)] -translate-x-1/2"
          style={{
            background: 'linear-gradient(90deg, #0B1626 0%, #101E33 12%, #101E33 88%, #0B1626 100%)',
            boxShadow:  '0 0 0 1px rgba(255,255,255,0.05), 0 0 120px rgba(26,95,160,0.18)',
          }}
        >
          <div className="absolute inset-y-0 left-[7%] w-[2px] bg-white/30" />
          <div className="absolute inset-y-0 right-[7%] w-[2px] bg-white/30" />
          {/* Threshold markings at both ends */}
          {['top-[1.5%]', 'bottom-[1.5%]'].map((edge) => (
            <div
              key={edge}
              className={`absolute inset-x-[14%] h-[3%] ${edge}`}
              style={{ backgroundImage: 'repeating-linear-gradient(90deg, rgba(255,255,255,0.7) 0 7%, transparent 7% 12.4%)' }}
            />
          ))}
          {/* Centre-line dashes + edge lights, sliding with the aircraft's speed */}
          <motion.div
            className="absolute inset-x-0 inset-y-[6%]"
            style={{
              backgroundImage: ['linear-gradient(180deg, rgba(255,255,255,0.82) 0 46%, transparent 46% 100%)', EDGE_LIGHT, EDGE_LIGHT].join(', '),
              backgroundSize: '5px 150px, 18px 75px, 18px 75px',
              backgroundPositionX: '50%, 1.5%, 98.5%',
              backgroundPositionY: stripes,
              backgroundRepeat: 'repeat-y',
            }}
          />
          {/* At speed the edge lights read as streaks */}
          <motion.div
            className="absolute inset-x-0 inset-y-[6%]"
            style={{
              opacity: streaks,
              backgroundImage: [EDGE_STREAK, EDGE_STREAK].join(', '),
              backgroundSize: '3px 75px, 3px 75px',
              backgroundPositionX: '3.6%, 96.4%',
              backgroundPositionY: stripes,
              backgroundRepeat: 'repeat-y',
            }}
          />
        </div>
      </motion.div>

      {/* The air between the camera and the ground, thickening with altitude */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          opacity: skyOpacity,
          background: 'linear-gradient(180deg, #0B2A4D 0%, #17518A 40%, #3E86C4 78%, #7DB6E2 100%)',
        }}
        aria-hidden="true"
      />
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          opacity: sunOpacity,
          background: 'radial-gradient(ellipse 60% 50% at 78% 8%, rgba(255,244,214,0.38) 0%, rgba(255,244,214,0.10) 40%, transparent 70%)',
        }}
        aria-hidden="true"
      />

      {/* Cloud deck, below the aircraft once it is through */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{ opacity: deckOpacity, scale: deckScale }}
        aria-hidden="true"
      >
        <CloudDeck />
      </motion.div>

      {/* Aircraft + its shadows */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        style={{ opacity: planeOpacity, y: planeY, scale: planeScale }}
        aria-hidden="true"
      >
        <div className="relative w-[clamp(320px,44vw,560px)] -rotate-90">
          <motion.div className="absolute inset-0" style={{ opacity: groundShadow, x: '5px', y: '5px', filter: 'blur(5px)' }}>
            <Image src={JOURNEY_ASSETS.plane} alt="" width={1672} height={941} sizes="(max-width: 640px) 60vw, 560px" className="h-auto w-full brightness-0" />
          </motion.div>
          <motion.div className="absolute inset-0" style={{ opacity: airShadow, x: airOffset, y: airOffset, scale: airScale, filter: 'blur(20px)' }}>
            <Image src={JOURNEY_ASSETS.plane} alt="" width={1672} height={941} sizes="(max-width: 640px) 60vw, 560px" className="h-auto w-full brightness-0" />
          </motion.div>
          <Image
            src={JOURNEY_ASSETS.plane}
            alt=""
            width={1672}
            height={941}
            sizes="(max-width: 640px) 60vw, 560px"
            className="relative h-auto w-full"
          />
        </div>
      </motion.div>

      {/* The cloud layer at the camera: over everything, aircraft included */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{ opacity: veilOpacity, scale: veilScale }}
        aria-hidden="true"
      >
        <div className="absolute inset-[-25%]" style={{ background: 'rgba(232,242,255,0.62)' }} />
        <CloudDeck dense />
      </motion.div>

      {/* Copy */}
      <div className="absolute inset-x-0 top-[13svh] flex flex-col items-center gap-5 px-6 text-center">
        <Kicker number={CHAPTER.number} label={CHAPTER.label} style={kicker} />
        <motion.p style={lineA} className="max-w-xl text-[clamp(19px,2.4vw,32px)] font-light leading-snug text-white/85">
          Potência. Velocidade. O chão começa a ficar para trás.
        </motion.p>
      </div>
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{ opacity: lineB.opacity, background: 'radial-gradient(ellipse 60% 42% at 50% 50%, rgba(5,13,26,0.42) 0%, transparent 72%)' }}
        aria-hidden="true"
      />
      <div className="absolute inset-0 flex items-center justify-center px-6 text-center">
        <motion.h2
          style={lineB}
          className="max-w-4xl font-black leading-[1.02] tracking-[-0.03em] text-white text-[clamp(30px,5.4vw,78px)]"
        >
          E, de repente, <span className="text-gold-gradient">o mundo inteiro</span> cabe na janela.
        </motion.h2>
      </div>
    </Scene>
  )
}

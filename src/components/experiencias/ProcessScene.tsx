'use client'

import { Plane } from 'lucide-react'
import { motion, useReducedMotion, useTransform, type MotionValue } from 'framer-motion'
import { PROCESS_STEPS, chapter } from '@/data/experiencias'
import { Kicker, Scene, useAppear, useFx, useScene } from './scene'

/* 08 — Como a Alvea pensa sua viagem.
   Dark stage, nothing else on it. "Você escolhe o destino." arrives alone;
   then "Nós pensamos no caminho." arrives under it in gold while the first
   line steps back — and the two hold the screen together for a long beat. It
   is the statement of the page, so it gets the most room and the most time.

   Then the route: a dashed line, like a route on a chart, with five stops. A
   small aircraft flies it, the gold line follows, and each step lights up as
   the aircraft reaches it. Across on large screens, down on small ones. */

const CHAPTER = chapter('o-caminho')

const LINE_FROM = 0.5
const LINE_TO   = 0.92
const stepAt = (index: number) => LINE_FROM + ((LINE_TO - LINE_FROM) * index) / (PROCESS_STEPS.length - 1)

function Step({ text, index, progress, reduced }: {
  text: string; index: number; progress: MotionValue<number>; reduced: boolean
}) {
  const at = stepAt(index)
  const opacity = useTransform(progress, [at - 0.05, at], [0.22, 1])
  const y       = useFx(progress, [at - 0.05, at], [14, 0], reduced, 0)
  const dot     = useTransform(progress, [at - 0.03, at], [0, 1])

  return (
    <li className="relative flex gap-5 lg:flex-1 lg:flex-col lg:gap-6">
      {/* Stop on the line */}
      <span className="relative mt-1.5 flex h-3 w-3 shrink-0 items-center justify-center lg:mt-0" aria-hidden="true">
        <span className="absolute h-3 w-3 rounded-full border border-white/25 bg-[#050D1A]" />
        <motion.span
          className="absolute h-3 w-3 rounded-full bg-gold-light"
          style={{ opacity: dot, scale: dot, boxShadow: '0 0 0 5px rgba(212,168,83,0.16), 0 0 18px rgba(236,201,106,0.8)' }}
        />
      </span>
      <motion.div style={{ opacity, y }} className="lg:pr-6">
        <p className="text-gold-gradient font-black leading-none text-[clamp(22px,2.6vw,38px)]">
          {String(index + 1).padStart(2, '0')}
        </p>
        <p className="mt-2 text-[clamp(16px,1.5vw,22px)] font-medium leading-snug text-white">{text}</p>
      </motion.div>
    </li>
  )
}

export default function ProcessScene() {
  const reduced = useReducedMotion() ?? false
  const { ref, progress } = useScene()

  /* hand-over: opens on the navy the cruise closed on, then goes darker */
  const frame = useTransform(progress, [0, 0.08, 0.94, 1], [0, 1, 1, 0])

  /* The statement */
  const kicker    = useAppear(progress, [0.02, 0.06, 0.36, 0.42], reduced)
  const statement = useAppear(progress, [0.03, 0.09, 0.36, 0.43], reduced, 40)
  const stepBack  = useTransform(progress, [0.15, 0.22], [1, 0.42])
  const lineB     = useAppear(progress, [0.15, 0.22, 2, 3], reduced, 30)

  /* The route */
  const stageOpacity = useTransform(progress, [0.42, 0.48, 0.97, 1], [0, 1, 1, 0])
  const draw         = useTransform(progress, [LINE_FROM, LINE_TO], [0, 1])
  const travelled    = useTransform(progress, [LINE_FROM, LINE_TO], ['0%', '100%'])
  const heading      = useAppear(progress, [0.43, 0.49, 2, 3], reduced)

  return (
    <Scene sceneRef={ref} progress={progress} id={CHAPTER.id} label="Como a Alvea pensa sua viagem" screens={CHAPTER.screens}>
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          opacity: frame,
          background: 'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(13,36,71,0.5) 0%, rgba(3,10,20,0.6) 75%, #030A14 100%)',
        }}
        aria-hidden="true"
      />

      {/* The statement */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-8 px-6 text-center">
        <Kicker number={CHAPTER.number} label="O caminho" style={kicker} />
        <motion.h2
          style={statement}
          className="font-black leading-[1.02] tracking-[-0.035em] text-[clamp(34px,6.6vw,112px)]"
        >
          <motion.span style={{ opacity: stepBack }} className="block text-white">
            Você escolhe o destino.
          </motion.span>
          <motion.span style={lineB} className="mt-[0.12em] block text-gold-gradient">
            Nós pensamos no caminho.
          </motion.span>
        </motion.h2>
      </div>

      {/* The five steps on a travel line */}
      <motion.div
        className="absolute inset-0 flex flex-col justify-center px-7 sm:px-12 lg:pl-16 lg:pr-60 xl:pl-20 xl:pr-64"
        style={{ opacity: stageOpacity }}
      >
        <motion.p
          style={heading}
          className="mb-10 lg:mb-16 text-[11px] sm:text-[12px] font-semibold uppercase tracking-[0.3em] text-white/50"
        >
          Como pensamos a sua viagem
        </motion.p>

        <div className="relative">
          {/* Line — horizontal on large screens */}
          <div
            className="absolute left-0 right-[20%] top-[6px] hidden h-px lg:block"
            style={{ backgroundImage: 'repeating-linear-gradient(90deg, rgba(255,255,255,0.3) 0 7px, transparent 7px 14px)' }}
            aria-hidden="true"
          >
            <motion.div className="absolute inset-0 origin-left" style={{ scaleX: draw, background: 'linear-gradient(90deg, #D4A853, #ECC96A)' }} />
            <motion.div className="absolute top-0" style={{ left: travelled }}>
              <span className="absolute -translate-x-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-[#030A14] border border-gold/40">
                <Plane size={14} className="text-gold-light rotate-45" />
              </span>
            </motion.div>
          </div>
          {/* Line — vertical on small screens */}
          <div
            className="absolute bottom-[58px] left-[5.5px] top-3 w-px lg:hidden"
            style={{ backgroundImage: 'repeating-linear-gradient(180deg, rgba(255,255,255,0.3) 0 7px, transparent 7px 14px)' }}
            aria-hidden="true"
          >
            <motion.div className="absolute inset-0 origin-top" style={{ scaleY: draw, background: 'linear-gradient(180deg, #D4A853, #ECC96A)' }} />
            <motion.div className="absolute left-0" style={{ top: travelled }}>
              <span className="absolute -translate-x-1/2 -translate-y-1/2 flex h-7 w-7 items-center justify-center rounded-full bg-[#030A14] border border-gold/40">
                <Plane size={12} className="text-gold-light rotate-[135deg]" />
              </span>
            </motion.div>
          </div>

          <ol className="relative flex flex-col gap-7 lg:flex-row lg:gap-0">
            {PROCESS_STEPS.map((text, index) => (
              <Step key={text} text={text} index={index} progress={progress} reduced={reduced} />
            ))}
          </ol>
        </div>
      </motion.div>
    </Scene>
  )
}

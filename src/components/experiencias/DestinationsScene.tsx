'use client'

import Image from 'next/image'
import { motion, useReducedMotion, useTransform, type MotionValue } from 'framer-motion'
import { JOURNEY_DESTINATIONS, chapter, type JourneyDestination } from '@/data/experiencias'
import { Kicker, Scene, useAppear, useFx, useScene } from './scene'

/* 05 — Escolha seu destino.
   A question in the dark. Then a window — the shape of an aircraft window —
   appears with Paris in it and opens until the destination is the whole
   screen. From there, five destinations as full-screen moments. They are not a
   carousel: the scroll is the only control. Each destination owns a slice of
   the scene's progress; its photograph cross-fades in while slowly settling
   (parallax), its words rise over it, and a light colour grade gives each place
   its own air. The counter and the tick marks follow along. Scrolling back
   walks through them in reverse.

   The window is a clip-path on the stage, driven by one CSS variable (--o), so
   its proportions can differ per breakpoint in CSS. Under reduced motion it is
   simply open. */

const CHAPTER = chapter('destinos')
const COUNT = JOURNEY_DESTINATIONS.length

const INTRO_END = 0.11
const OUTRO     = 0.97
/* The first destination also hosts the window opening, so it gets extra room */
const OPENING   = 0.06
const SLICE     = (OUTRO - INTRO_END - OPENING) / COUNT
const FADE      = 0.035
const WINDOW_OPEN = 0.175

function slice(index: number) {
  const start = index === 0 ? INTRO_END : INTRO_END + OPENING + index * SLICE
  return { start, end: INTRO_END + OPENING + (index + 1) * SLICE }
}

function Destination({ destination, index, progress, reduced }: {
  destination: JourneyDestination; index: number; progress: MotionValue<number>; reduced: boolean
}) {
  const { start, end } = slice(index)
  const last = index === COUNT - 1

  /* The first one is already there when the window opens */
  const opacity = useTransform(
    progress,
    [start - FADE, start + FADE, end - FADE, end + FADE],
    [index === 0 ? 1 : 0, 1, 1, last ? 1 : 0],
  )
  /* Photograph: starts slightly enlarged and shifted, settles as it is viewed */
  const imageScale = useFx(progress, [start - FADE, end + FADE], [1.16, 1.02], reduced, 1.02)
  const imageY     = useFx(progress, [start - FADE, end + FADE], ['3%', '-3%'], reduced, '0%')
  /* Words: arrive a beat after the image, leave a beat before it */
  const textFrom = index === 0 ? WINDOW_OPEN : start + 0.01
  const text = useAppear(progress, [textFrom, textFrom + FADE + 0.01, end - FADE - 0.02, end - 0.005], reduced, 40)

  return (
    <motion.div className="absolute inset-0" style={{ opacity }}>
      <motion.div className="absolute inset-[-4%]" style={{ scale: imageScale, y: imageY }}>
        <Image
          src={destination.image}
          alt={destination.alt}
          fill
          sizes="100vw"
          quality={72}
          className="object-cover"
        />
      </motion.div>

      {/* Atmosphere */}
      <div className="absolute inset-0" style={{ background: destination.grade }} aria-hidden="true" />

      {/* Contrast: darker at the bottom-left, where the words sit */}
      <div
        className="absolute inset-0"
        style={{
          background: [
            'linear-gradient(180deg, rgba(5,13,26,0.55) 0%, rgba(5,13,26,0.10) 30%, rgba(5,13,26,0.20) 55%, rgba(5,13,26,0.88) 100%)',
            'linear-gradient(90deg, rgba(5,13,26,0.60) 0%, rgba(5,13,26,0) 60%)',
          ].join(', '),
        }}
        aria-hidden="true"
      />

      <motion.div
        className="absolute inset-x-0 bottom-0 px-6 pb-[11svh] sm:px-12 lg:px-20"
        style={text}
      >
        <p
          className="flex items-center gap-3 text-[11px] sm:text-[12px] font-semibold uppercase tracking-[0.34em]"
          style={{ color: destination.accent }}
        >
          <span className="h-px w-8" style={{ background: destination.accent }} aria-hidden="true" />
          {destination.region}
        </p>
        <h3 className="mt-3 font-black uppercase leading-[0.9] tracking-[-0.035em] text-white text-[clamp(52px,12vw,190px)]">
          {destination.city}
        </h3>
        <p className="mt-3 text-[12px] sm:text-[13px] font-medium uppercase tracking-[0.3em] text-white/60">
          {destination.country}
        </p>
        <p className="mt-5 max-w-[22ch] text-[clamp(18px,2.2vw,30px)] font-light leading-snug text-white/90 sm:max-w-xl">
          {destination.line}
        </p>
      </motion.div>
    </motion.div>
  )
}

function Tick({ index, progress }: { index: number; progress: MotionValue<number> }) {
  const { start, end } = slice(index)
  const fill = useTransform(progress, [start, end], ['0%', '100%'])
  return (
    <span className="relative block h-[2px] w-7 sm:w-10 overflow-hidden rounded-full bg-white/20">
      <motion.span className="absolute inset-y-0 left-0 bg-gold-light" style={{ width: fill }} />
    </span>
  )
}

export default function DestinationsScene() {
  const reduced = useReducedMotion() ?? false
  const { ref, progress } = useScene()

  const kicker   = useAppear(progress, [0.0, 0.025, 0.065, 0.085], reduced)
  const question = useAppear(progress, [0.008, 0.035, 0.065, 0.09], reduced, 34)

  const stageOpacity = useTransform(progress, [0.08, 0.1, OUTRO, 1], [0, 1, 1, 0])
  /* 0 = aircraft window (held for a beat), 1 = full screen */
  const open         = useFx(progress, [0.115, WINDOW_OPEN], [0, 1], reduced, 1)
  const hudOpacity   = useTransform(progress, [WINDOW_OPEN, WINDOW_OPEN + FADE, OUTRO - 0.02, OUTRO], [0, 1, 1, 0])

  /* "01" … "05" — the only number on screen changes with the active slice */
  const counter = useTransform(progress, (p) => {
    const index = Math.min(COUNT - 1, Math.max(0, Math.floor((p - INTRO_END - OPENING) / SLICE)))
    return String(index + 1).padStart(2, '0')
  })

  return (
    <Scene sceneRef={ref} progress={progress} id={CHAPTER.id} label="Escolha seu destino" screens={CHAPTER.screens}>
      {/* The question */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 px-6 text-center">
        <Kicker number={CHAPTER.number} label={CHAPTER.label} style={kicker} />
        <motion.h2
          style={question}
          className="max-w-5xl font-black leading-[1.02] tracking-[-0.03em] text-white text-[clamp(34px,6.6vw,96px)]"
        >
          Para onde você iria se pudesse <span className="text-gold-gradient">embarcar amanhã?</span>
        </motion.h2>
      </div>

      {/* The destinations */}
      <motion.div
        className="absolute inset-0 [--ix:30%] [--iy:28%] [--ir:84px] lg:[--ix:38%] lg:[--iy:19%] lg:[--ir:170px]"
        style={{
          opacity: stageOpacity,
          '--o': open,
          clipPath: 'inset(calc(var(--iy) * (1 - var(--o))) calc(var(--ix) * (1 - var(--o))) round calc(var(--ir) * (1 - var(--o))))',
        } as React.ComponentProps<typeof motion.div>['style']}
      >
        {JOURNEY_DESTINATIONS.map((destination, index) => (
          <Destination
            key={destination.city}
            destination={destination}
            index={index}
            progress={progress}
            reduced={reduced}
          />
        ))}
      </motion.div>

      {/* Counter + ticks */}
      <motion.div
        className="absolute right-6 top-[13svh] flex flex-col items-end gap-3 sm:right-12 lg:right-20"
        style={{ opacity: hudOpacity }}
        aria-hidden="true"
      >
        <p className="font-mono text-[13px] tracking-[0.2em] text-white/80">
          <motion.span className="text-gold-light">{counter}</motion.span>
          <span className="mx-2 text-white/35">/</span>
          {String(COUNT).padStart(2, '0')}
        </p>
        <div className="flex gap-1.5">
          {JOURNEY_DESTINATIONS.map((destination, index) => (
            <Tick key={destination.city} index={index} progress={progress} />
          ))}
        </div>
      </motion.div>
    </Scene>
  )
}

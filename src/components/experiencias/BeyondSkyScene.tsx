'use client'

import { motion, useReducedMotion, useTransform } from 'framer-motion'
import { chapter } from '@/data/experiencias'
import { Kicker, Scene, useAppear, useFx, useScene } from './scene'

/* 06 — Além do céu.
   One camera move: looking out at open sky, then tilting down until the sea
   fills the frame. The sea is a single layer whose top edge is the horizon; the
   scroll raises that edge from below the frame to above it, while the sky
   drifts up more slowly behind it. Nothing is swapped — the sky is literally
   pushed out by the water.

     navy → open sky → horizon enters → sea rises → surface texture → deep water

   Two sentences: the first in the sky, the second once the sea has taken over.

   Hand-over: the last frame is the flat ocean colour the cruise scene starts
   on (OCEAN), and that scene brings its own water in from there.

   Reduced motion: the horizon does not travel; the sea fades in over the sky. */

export const OCEAN = '#04213B'
const CHAPTER = chapter('alem-do-ceu')

/* Fine ripples near the horizon, broader swell closer to the camera */
const RIPPLE = 'repeating-linear-gradient(180deg, rgba(210,235,255,0) 0px, rgba(210,235,255,0) 5px, rgba(210,235,255,0.5) 6px, rgba(210,235,255,0) 7px)'
const SWELL  = 'repeating-linear-gradient(178deg, rgba(170,215,245,0) 0px, rgba(170,215,245,0) 22px, rgba(170,215,245,0.55) 23px, rgba(170,215,245,0) 25px)'

export default function BeyondSkyScene() {
  const reduced = useReducedMotion() ?? false
  const { ref, progress } = useScene()

  /* Sky */
  const skyOpacity = useTransform(progress, [0, 0.14], [0, 1])
  const skyY       = useFx(progress, [0.2, 0.74], ['0%', '-26%'], reduced, '0%')

  /* Sea: its top edge is the horizon */
  const seaY     = useFx(progress, [0.2, 0.74], ['100%', '0%'], reduced, '0%')
  const seaFade  = useTransform(progress, [0.3, 0.7], [0, 1])
  const swellY   = useFx(progress, [0.2, 1], ['0px', '-150px'], reduced, '0px')
  const depth    = useTransform(progress, [0.86, 1], [0, 1])

  const kicker = useAppear(progress, [0.05, 0.12, 0.36, 0.44], reduced)
  const lineA  = useAppear(progress, [0.08, 0.16, 0.36, 0.44], reduced, 34)
  const lineB  = useAppear(progress, [0.66, 0.76, 0.93, 0.985], reduced, 34)

  return (
    <Scene sceneRef={ref} progress={progress} id={CHAPTER.id} label="Além do céu" screens={CHAPTER.screens}>
      {/* Open sky, brightest at the horizon */}
      <motion.div
        className="absolute inset-x-0 top-0 bottom-[-30%] pointer-events-none"
        style={{
          opacity: skyOpacity,
          y: skyY,
          background: 'linear-gradient(180deg, #0A2340 0%, #154A80 30%, #3F86C2 62%, #86BCE4 88%, #BBDDF3 100%)',
        }}
        aria-hidden="true"
      />

      {/* The sea */}
      <motion.div
        className="absolute inset-x-0 top-0 h-full pointer-events-none"
        style={{ y: seaY, opacity: reduced ? seaFade : 1 }}
        aria-hidden="true"
      >
        {/* haze just above the horizon */}
        <div
          className="absolute inset-x-0 bottom-full h-[18svh]"
          style={{ background: 'linear-gradient(180deg, rgba(214,236,252,0) 0%, rgba(214,236,252,0.42) 100%)' }}
        />
        {/* water: pale and flat at the horizon, deep towards the camera */}
        <div
          className="absolute inset-0"
          style={{ background: `linear-gradient(180deg, #4C8FC4 0%, #1F6198 5%, #0E4373 20%, #082E52 52%, ${OCEAN} 100%)` }}
        />
        {/* the horizon line */}
        <div
          className="absolute inset-x-0 top-0 h-px"
          style={{ background: 'linear-gradient(90deg, rgba(255,255,255,0.15), rgba(255,255,255,0.8) 50%, rgba(255,255,255,0.15))' }}
        />
        {/* light on the water, under the sun */}
        <div
          className="absolute inset-0"
          style={{ background: 'radial-gradient(ellipse 26% 58% at 50% 0%, rgba(255,255,255,0.26) 0%, rgba(200,230,255,0.08) 46%, transparent 72%)' }}
        />
        {/* surface texture */}
        <div
          className="absolute inset-x-0 top-0 h-[34%] opacity-[0.22]"
          style={{
            backgroundImage: RIPPLE,
            maskImage: 'linear-gradient(180deg, #000 0%, transparent 100%)',
            WebkitMaskImage: 'linear-gradient(180deg, #000 0%, transparent 100%)',
          }}
        />
        <div
          className="absolute inset-0 overflow-hidden opacity-[0.16]"
          style={{
            maskImage: 'linear-gradient(180deg, transparent 8%, #000 42%, #000 100%)',
            WebkitMaskImage: 'linear-gradient(180deg, transparent 8%, #000 42%, #000 100%)',
          }}
        >
          <motion.div className="absolute inset-x-0 top-0 h-[130%]" style={{ y: swellY, backgroundImage: SWELL }} />
        </div>
      </motion.div>

      {/* Deep water — the frame the cruise scene starts on */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{ opacity: depth, background: OCEAN }}
        aria-hidden="true"
      />

      {/* Copy */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 px-6 text-center">
        <Kicker number={CHAPTER.number} label={CHAPTER.label} style={kicker} />
        <motion.h2
          style={lineA}
          className="max-w-4xl font-black leading-[1.04] tracking-[-0.03em] text-white text-[clamp(30px,5.4vw,78px)] [text-shadow:0_2px_36px_rgba(5,13,26,0.4)]"
        >
          Nem toda viagem começa em um aeroporto.
        </motion.h2>
      </div>
      <div className="absolute inset-0 flex items-center justify-center px-6 text-center">
        <motion.p
          style={lineB}
          className="max-w-4xl font-black leading-[1.02] tracking-[-0.03em] text-[clamp(36px,7vw,104px)] text-gold-gradient"
        >
          Algumas começam no mar.
        </motion.p>
      </div>
    </Scene>
  )
}

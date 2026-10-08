'use client'

import { motion, useReducedMotion, useTransform } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { chapter } from '@/data/experiencias'
import { EASE, Scene, StarField, makeStars, useFx, useScene } from './scene'

/* 01 — O chamado.
   A night sky with a faint horizon. The title enters once on load (the only
   time-based animation of the scene, on its own wrapper); as the visitor starts
   to scroll, the whole block drifts up, grows slightly and dissolves — the
   camera moving forward into the journey. */

const STARS = makeStars(70, 7)
const CHAPTER = chapter('o-chamado')

export default function JourneyHero() {
  const reduced = useReducedMotion() ?? false
  const { ref, progress } = useScene()

  /* Scroll-linked (outer wrapper) */
  const blockOpacity = useTransform(progress, [0.1, 0.72], [1, 0])
  const blockScale   = useFx(progress, [0, 0.8], [1, 1.14], reduced, 1)
  const blockY       = useFx(progress, [0, 0.8], ['0%', '-12%'], reduced, '0%')
  const hintOpacity  = useTransform(progress, [0, 0.12], [1, 0])
  const starsY       = useFx(progress, [0, 1], ['0%', '-8%'], reduced, '0%')
  /* hand-over: the scene ends on plain navy, the frame the airport opens on */
  const starsOpacity = useTransform(progress, [0.62, 1], [1, 0])
  const horizon      = useTransform(progress, [0, 0.85], [1, 0])

  /* Entrance on load (inner elements) */
  const container = {
    hidden: {},
    show:   { transition: { staggerChildren: reduced ? 0.05 : 0.22, delayChildren: 0.25 } },
  }
  const item = {
    hidden: { opacity: 0, y: reduced ? 0 : 24, filter: reduced ? 'blur(0px)' : 'blur(8px)' },
    show:   { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: reduced ? 0.4 : 1.2, ease: EASE } },
  }

  return (
    <Scene sceneRef={ref} progress={progress} id={CHAPTER.id} label="O chamado" screens={CHAPTER.screens}>
      {/* Sky */}
      <motion.div className="absolute inset-0" style={{ y: starsY, opacity: starsOpacity }}>
        <StarField stars={STARS} />
      </motion.div>

      {/* Horizon glow — fades with scroll so the scene ends on plain navy */}
      <motion.div className="absolute inset-0 pointer-events-none" style={{ opacity: horizon }} aria-hidden="true">
        <div
          className="absolute inset-x-0 bottom-0 h-[55%]"
          style={{ background: 'radial-gradient(ellipse 85% 100% at 50% 118%, rgba(31,77,140,0.55) 0%, rgba(13,36,71,0.28) 42%, transparent 72%)' }}
        />
        <div
          className="absolute inset-x-[18%] bottom-0 h-px"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(236,201,106,0.55), transparent)' }}
        />
        <div
          className="absolute left-1/2 bottom-0 h-40 w-[70%] -translate-x-1/2"
          style={{ background: 'radial-gradient(ellipse at 50% 100%, rgba(212,168,83,0.16) 0%, transparent 70%)', filter: 'blur(20px)' }}
        />
      </motion.div>

      {/* Title block */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center px-6"
        style={{ opacity: blockOpacity, scale: blockScale, y: blockY }}
      >
        <motion.div
          className="flex max-w-5xl flex-col items-center text-center"
          variants={container}
          initial="hidden"
          animate="show"
        >
          <motion.p
            variants={item}
            className="text-[11px] sm:text-[12px] font-semibold uppercase tracking-[0.42em] text-gold"
          >
            Experiências
          </motion.p>

          <motion.h1
            variants={item}
            className="mt-6 font-black leading-[0.92] tracking-[-0.035em] text-white text-[clamp(52px,12.5vw,176px)]"
          >
            ALVEA <span className="text-gold-gradient">JOURNEY</span>
          </motion.h1>

          <motion.p
            variants={item}
            className="mt-6 text-[clamp(18px,2.2vw,30px)] font-light tracking-[0.02em] text-white/85"
          >
            Uma viagem antes da viagem.
          </motion.p>

          <motion.div variants={item} className="mt-10 flex flex-col gap-2 text-[15px] sm:text-[17px] leading-relaxed text-white/55">
            <p>Existem viagens que começam no momento do embarque.</p>
            <p>E existem viagens que começam muito antes.</p>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Scroll hint */}
      <motion.div
        className="absolute inset-x-0 bottom-9 flex flex-col items-center gap-2 text-white/55"
        style={{ opacity: hintOpacity }}
      >
        <motion.span
          className="text-[11px] font-medium uppercase tracking-[0.3em]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.6, duration: 1 }}
        >
          Role para começar
        </motion.span>
        <motion.span
          aria-hidden="true"
          initial={{ opacity: 0 }}
          animate={reduced ? { opacity: 1 } : { opacity: 1, y: [0, 6, 0] }}
          transition={reduced ? { delay: 1.6 } : { opacity: { delay: 1.6, duration: 1 }, y: { duration: 2.2, repeat: Infinity, ease: 'easeInOut' } }}
        >
          <ChevronDown size={18} className="text-gold" />
        </motion.span>
      </motion.div>
    </Scene>
  )
}

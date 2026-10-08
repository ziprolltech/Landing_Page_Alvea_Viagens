'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, MessageCircle } from 'lucide-react'
import { motion, useReducedMotion, useTransform } from 'framer-motion'
import { JOURNEY_ASSETS, SPECIALIST_MESSAGE, chapter } from '@/data/experiencias'
import { buildWhatsAppUrl } from '@/lib/config/links'
import { GOLD_GRADIENT, Kicker, Scene, StarField, makeStars, useAppear, useFx, useScene } from './scene'

/* 10 — O próximo destino.
   Back in the sky, far above: the curve of the Earth below, an aircraft small
   in the distance crossing the frame. Two questions, then the invitation, and
   the Alvea signature to close. The calls to action stay on screen until the
   very end — nothing is hidden while still focusable. */

const STARS = makeStars(60, 23)
const CHAPTER = chapter('proximo')

export default function JourneyFinale() {
  const reduced = useReducedMotion() ?? false
  const { ref, progress } = useScene()

  /* The world getting small */
  const earthScale = useFx(progress, [0, 1], [1.5, 0.92], reduced, 1)
  const earthY     = useFx(progress, [0, 1], ['18%', '0%'], reduced, '0%')
  const skyOpacity = useTransform(progress, [0, 0.12], [0, 1])

  /* The aircraft, far away */
  const planeX       = useFx(progress, [0.05, 0.95], ['-60vw', '60vw'], reduced, '0vw')
  const planeY       = useFx(progress, [0.05, 0.95], ['8svh', '-10svh'], reduced, '0svh')
  /* under reduced motion it cannot cross the sky, and would sit on the words: hidden */
  const planeOpacity = useTransform(progress, [0.05, 0.14, 0.86, 0.95], [0, reduced ? 0 : 0.9, reduced ? 0 : 0.9, 0])

  /* Words */
  /* Words — with a beat of empty sky between "E agora..." and the question */
  const kicker = useAppear(progress, [0.06, 0.12, 0.25, 0.31], reduced)
  const lineA  = useAppear(progress, [0.08, 0.15, 0.24, 0.3], reduced, 34)
  const lineB  = useAppear(progress, [0.4, 0.5, 2, 3], reduced, 34)
  const sub    = useAppear(progress, [0.52, 0.6, 2, 3], reduced)
  const ctas   = useAppear(progress, [0.6, 0.68, 2, 3], reduced)
  const ctaPointer = useTransform(progress, (p) => (p > 0.62 ? 'auto' : 'none'))
  const signature  = useAppear(progress, [0.76, 0.86, 2, 3], reduced)

  return (
    <Scene sceneRef={ref} progress={progress} id={CHAPTER.id} label="O próximo destino" screens={CHAPTER.screens}>
      {/* Night sky */}
      <motion.div className="absolute inset-0" style={{ opacity: skyOpacity }}>
        <StarField stars={STARS} />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 80% 55% at 50% 0%, rgba(13,36,71,0.6) 0%, transparent 70%)' }}
          aria-hidden="true"
        />
      </motion.div>

      {/* The curve of the Earth */}
      <motion.div
        className="absolute left-1/2 top-[74%] aspect-square w-[170vw] max-w-none pointer-events-none lg:w-[120vw]"
        style={{ x: '-50%', scale: earthScale, y: earthY, opacity: skyOpacity }}
        aria-hidden="true"
      >
        <div
          className="h-full w-full rounded-full"
          style={{
            background: 'radial-gradient(circle at 50% 0%, #1B4F86 0%, #0D2C52 22%, #071A33 46%, #050D1A 70%)',
            boxShadow:  '0 -2px 0 rgba(170,215,255,0.55), 0 -22px 70px rgba(70,150,230,0.35), 0 -60px 160px rgba(26,95,160,0.25)',
          }}
        />
      </motion.div>

      {/* Aircraft in the distance */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        style={{ x: planeX, y: planeY, opacity: planeOpacity }}
        aria-hidden="true"
      >
        <div className="relative w-[clamp(84px,10vw,150px)] -rotate-[9deg] -mt-[30svh]">
          {/* contrail */}
          <div
            className="absolute right-[78%] top-1/2 h-px w-[340%]"
            style={{ background: 'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.4) 100%)' }}
          />
          <Image
            src={JOURNEY_ASSETS.plane}
            alt=""
            width={1672}
            height={941}
            sizes="150px"
            className="h-auto w-full"
          />
        </div>
      </motion.div>

      {/* "E agora..." */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 px-6 text-center">
        <Kicker number={CHAPTER.number} label={CHAPTER.label} style={kicker} />
        <motion.p
          style={lineA}
          className="font-black leading-none tracking-[-0.03em] text-white text-[clamp(40px,8vw,120px)]"
        >
          E agora...
        </motion.p>
      </div>

      {/* The invitation */}
      <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
        <motion.h2
          style={lineB}
          className="max-w-5xl font-black leading-[1.0] tracking-[-0.03em] text-white text-[clamp(32px,6.2vw,92px)]"
        >
          Qual será o seu <span className="text-gold-gradient">próximo destino?</span>
        </motion.h2>

        <motion.p style={sub} className="mt-6 max-w-[30ch] text-[15px] sm:max-w-2xl sm:text-[18px] font-light leading-relaxed text-white/70">
          Talvez sua próxima viagem já esteja mais perto do que você imagina.
        </motion.p>

        <motion.div
          style={{ ...ctas, pointerEvents: ctaPointer }}
          className="mt-9 flex w-full max-w-md flex-col items-stretch gap-3.5 sm:max-w-none sm:w-auto sm:flex-row sm:items-center"
        >
          <Link
            href="/destinos"
            className="btn-shimmer cta-glow group inline-flex min-h-[54px] items-center justify-center gap-2.5 rounded-full px-9 text-[15px] font-semibold text-sky-deep transition-transform duration-300 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80"
            style={{ background: GOLD_GRADIENT }}
          >
            Planejar minha viagem
            <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true" />
          </Link>
          <a
            href={buildWhatsAppUrl(SPECIALIST_MESSAGE)}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Falar com um especialista pelo WhatsApp (abre em nova aba)"
            className="inline-flex min-h-[54px] items-center justify-center gap-2.5 rounded-full border border-white/20 bg-white/[0.05] px-8 text-[15px] font-semibold text-white/90 backdrop-blur-sm transition-colors duration-300 hover:border-gold/50 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/70"
          >
            <MessageCircle size={16} aria-hidden="true" />
            Falar com um especialista
          </a>
        </motion.div>

        {/* Signature */}
        <motion.div style={signature} className="mt-12 flex flex-col items-center gap-3">
          <Image
            src={JOURNEY_ASSETS.logo}
            alt=""
            width={152}
            height={152}
            sizes="64px"
            className="h-14 w-auto object-contain"
          />
          <p className="text-[13px] font-semibold uppercase tracking-[0.42em] text-white">Alvea Viagens</p>
          <p className="text-[13px] font-light italic text-white/60">Uma viagem antes da viagem.</p>
        </motion.div>
      </div>
    </Scene>
  )
}

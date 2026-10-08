'use client'

import { motion, useReducedMotion, useTransform, type MotionValue } from 'framer-motion'
import { VALUE_CHAIN, chapter } from '@/data/experiencias'
import { Kicker, Scene, useAppear, useFx, useScene } from './scene'

/* 09 — Viagem inteligente.
   The idea behind Alvea as one transformation, not a list: a single word sits
   in the middle of the screen and turns into the next one as the visitor
   scrolls — Dinheiro, Milhas, Pontos, Oportunidades — rolling like a line on a
   departures board, until it lands on the one that matters, in gold: VIAGEM.
   Underneath, a short route with five stops fills in step with it.

   The scene then flies *through* the word and comes out in the night sky of the
   final chapter.

   No figures, prices or promised savings appear here.

   Reduced motion: the words cross-fade in place and the last one simply fades. */

const CHAPTER = chapter('milhas')

const WORDS_FROM = 0.4
const WORDS_TO   = 0.84
const STEP = (WORDS_TO - WORDS_FROM) / (VALUE_CHAIN.length - 1)
const at = (index: number) => WORDS_FROM + index * STEP
const LAST = VALUE_CHAIN.length - 1

function Word({ word, index, progress, reduced }: {
  word: string; index: number; progress: MotionValue<number>; reduced: boolean
}) {
  const c = at(index)
  const last = index === LAST
  /* in while the previous one leaves; the last one stays */
  const opacity = useTransform(progress, [c - 0.07, c - 0.03, c + 0.04, c + 0.08], [0, 1, 1, last ? 1 : 0])
  const y       = useFx(progress, [c - 0.07, c - 0.03, c + 0.04, c + 0.08], ['78%', '0%', '0%', last ? '0%' : '-78%'], reduced, '0%')
  return (
    <motion.span
      style={{ opacity, y }}
      className={`absolute inset-0 flex items-center justify-center font-black uppercase leading-none tracking-[-0.03em] ${last ? 'text-gold-gradient text-[1.75em] lg:text-[1em]' : 'text-white'}`}
      aria-hidden="true"
    >
      {word}
    </motion.span>
  )
}

function Stop({ word, index, progress }: { word: string; index: number; progress: MotionValue<number> }) {
  const c = at(index)
  const lit = useTransform(progress, [c - 0.04, c], [0, 1])
  const label = useTransform(progress, [c - 0.04, c], [0.35, 1])
  return (
    <li className="absolute top-0 flex -translate-x-1/2 flex-col items-center gap-3" style={{ left: `${(index / LAST) * 100}%` }}>
      <span className="relative flex h-2.5 w-2.5 items-center justify-center">
        <span className="absolute h-2 w-2 rounded-full border border-white/30 bg-[#050D1A]" />
        <motion.span
          className="absolute h-2.5 w-2.5 rounded-full bg-gold-light"
          style={{ opacity: lit, scale: lit, boxShadow: '0 0 0 4px rgba(212,168,83,0.16), 0 0 14px rgba(236,201,106,0.8)' }}
        />
      </span>
      <motion.span
        style={{ opacity: label }}
        className="hidden whitespace-nowrap text-[10px] font-semibold uppercase tracking-[0.22em] text-white sm:block"
      >
        {word}
      </motion.span>
    </li>
  )
}

export default function MilesScene() {
  const reduced = useReducedMotion() ?? false
  const { ref, progress } = useScene()

  const frame  = useTransform(progress, [0, 0.08, 0.92, 1], [0, 1, 1, 0])
  const kicker = useAppear(progress, [0.03, 0.08, 0.26, 0.32], reduced)
  const lineA  = useAppear(progress, [0.04, 0.1, 0.17, 0.22], reduced, 34)
  const lineB  = useAppear(progress, [0.2, 0.26, 0.31, 0.36], reduced, 34)

  /* The transformation */
  const stageOpacity = useTransform(progress, [0.33, 0.39, 0.93, 1], [0, 1, 1, 0])
  const routeOpacity = useTransform(progress, [0.34, 0.4, 0.88, 0.93], [0, 1, 1, 0])
  const routeFill    = useTransform(progress, [WORDS_FROM, WORDS_TO], [0, 1])
  const glow         = useTransform(progress, [WORDS_FROM, WORDS_TO, 0.93, 1], [0, 1, 1, 0])
  /* Payoff: VIAGEM grows as it lands — then the camera goes through it */
  const payoff       = useFx(progress, [WORDS_TO - 0.03, 0.9, 1], [1, 1.14, 4.2], reduced, 1)

  return (
    <Scene sceneRef={ref} progress={progress} id={CHAPTER.id} label="Viagem inteligente" screens={CHAPTER.screens}>
      {/* A warmth that builds as the word gets closer to "Viagem" */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{ opacity: glow, background: 'radial-gradient(ellipse 58% 46% at 50% 48%, rgba(212,168,83,0.14) 0%, rgba(212,168,83,0.04) 46%, transparent 72%)' }}
        aria-hidden="true"
      />
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{ opacity: frame, background: 'radial-gradient(ellipse 70% 55% at 50% 50%, rgba(13,36,71,0.45) 0%, transparent 74%)' }}
        aria-hidden="true"
      />

      {/* Sentence 1 */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 px-6 text-center">
        <Kicker number={CHAPTER.number} label={CHAPTER.label} style={kicker} />
        <motion.h2
          style={lineA}
          className="max-w-5xl font-black leading-[1.02] tracking-[-0.03em] text-white text-[clamp(30px,5.6vw,82px)]"
        >
          Viajar bem não é apenas encontrar um destino.
        </motion.h2>
      </div>

      {/* Sentence 2 */}
      <div className="absolute inset-0 flex items-center justify-center px-6 text-center">
        <motion.p
          style={lineB}
          className="max-w-5xl font-black leading-[1.02] tracking-[-0.03em] text-gold-gradient text-[clamp(34px,6.4vw,96px)]"
        >
          É saber como chegar até ele.
        </motion.p>
      </div>

      {/* One word becoming the next */}
      <motion.div
        className="absolute inset-0 flex flex-col items-center justify-center px-5"
        style={{ opacity: stageOpacity }}
      >
        {/* read as a sequence by assistive technology; the rolling words are decorative */}
        <p className="sr-only">{VALUE_CHAIN.join(' → ')}</p>

        <motion.div
          className="relative h-[2.1em] w-full overflow-hidden text-[clamp(36px,10vw,164px)] lg:h-[1.2em]"
          style={{ scale: payoff }}
        >
          {VALUE_CHAIN.map((word, index) => (
            <Word key={word} word={word} index={index} progress={progress} reduced={reduced} />
          ))}
        </motion.div>

        {/* The route it travels */}
        <motion.div className="relative mt-10 h-12 w-[min(78vw,640px)] sm:mt-14" style={{ opacity: routeOpacity }} aria-hidden="true">
          <div
            className="absolute inset-x-0 top-[4.5px] h-px"
            style={{ backgroundImage: 'repeating-linear-gradient(90deg, rgba(255,255,255,0.28) 0 6px, transparent 6px 12px)' }}
          />
          <motion.div
            className="absolute inset-x-0 top-[4.5px] h-px origin-left"
            style={{ scaleX: routeFill, background: 'linear-gradient(90deg, #D4A853, #ECC96A)' }}
          />
          <ol>
            {VALUE_CHAIN.map((word, index) => (
              <Stop key={word} word={word} index={index} progress={progress} />
            ))}
          </ol>
        </motion.div>
      </motion.div>
    </Scene>
  )
}

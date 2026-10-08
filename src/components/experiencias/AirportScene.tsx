'use client'

import { motion, useReducedMotion, useTransform } from 'framer-motion'
import { DEPARTURES, chapter } from '@/data/experiencias'
import { Kicker, Scene, useAppear, useFx, useScene } from './scene'

/* 02 — Embarque.
   Not an airport interface — a mood: a departures board coming out of the dark,
   and guide lights on the floor running towards the gate as the visitor walks
   (scrolls) forward. */

const CHAPTER = chapter('embarque')

export default function AirportScene() {
  const reduced = useReducedMotion() ?? false
  const { ref, progress } = useScene()

  /* Departures board */
  const boardOpacity = useTransform(progress, [0.02, 0.18, 0.5, 0.66], [0, 1, 1, 0])
  const boardScale   = useFx(progress, [0, 0.66], [0.9, 1.08], reduced, 1)
  const boardY       = useFx(progress, [0, 0.66], ['6%', '-10%'], reduced, '0%')
  const boardTilt    = useFx(progress, [0, 0.66], [14, 2], reduced, 0)

  /* Floor guide lights — the "walking" cue */
  const floorOpacity = useTransform(progress, [0.05, 0.3, 0.86, 1], [0, 1, 1, 0])
  const floorShift   = useFx(progress, [0, 1], ['0px', '520px'], reduced, '0px')

  /* hand-over: opens and closes on plain navy */
  const frame = useTransform(progress, [0, 0.1, 0.9, 1], [0, 1, 1, 0])

  /* Copy */
  const kicker = useAppear(progress, [0.5, 0.6, 0.9, 0.98], reduced)
  const line   = useAppear(progress, [0.56, 0.68, 0.9, 0.98], reduced, 34)

  return (
    <Scene sceneRef={ref} progress={progress} id={CHAPTER.id} label="Embarque" screens={CHAPTER.screens}>
      {/* Terminal glow */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{ opacity: frame, background: 'radial-gradient(ellipse 70% 55% at 50% 38%, rgba(26,95,160,0.16) 0%, transparent 70%)' }}
        aria-hidden="true"
      />

      {/* Floor: two rails of guide lights converging on the gate ahead */}
      <motion.div
        className="absolute inset-x-0 bottom-0 h-[44%] overflow-hidden pointer-events-none [--rail:30deg] sm:[--rail:46deg] lg:[--rail:63deg]"
        style={{
          opacity: floorOpacity,
          maskImage: 'linear-gradient(180deg, transparent 0%, #000 45%, #000 100%)',
          WebkitMaskImage: 'linear-gradient(180deg, transparent 0%, #000 45%, #000 100%)',
        }}
        aria-hidden="true"
      >
        {[-1, 1].map((side) => (
          <motion.div
            key={side}
            className="absolute left-1/2 top-0 h-[140vmax] w-10"
            style={{
              /* steeper on narrow screens, so the rails stay inside the frame */
              transform: `translateX(-50%) rotate(calc(var(--rail) * ${side}))`,
              transformOrigin: '50% 0%',
              backgroundImage: 'radial-gradient(circle, rgba(255,236,170,1) 0 3px, rgba(236,201,106,0.35) 5px, transparent 13px)',
              backgroundSize: '40px 92px',
              backgroundPositionX: '50%',
              backgroundPositionY: floorShift,
              backgroundRepeat: 'repeat-y',
            }}
          />
        ))}
      </motion.div>

      {/* Departures board */}
      <div className="absolute inset-0 flex items-center justify-center px-5 [perspective:1400px]">
        <motion.div
          className="w-full max-w-[720px] -mt-[8svh]"
          style={{ opacity: boardOpacity, scale: boardScale, y: boardY, rotateX: boardTilt }}
        >
          <div
            className="rounded-2xl p-5 sm:p-7"
            style={{
              background: 'linear-gradient(180deg, rgba(10,22,40,0.92) 0%, rgba(5,13,26,0.92) 100%)',
              border:     '1px solid rgba(212,168,83,0.18)',
              boxShadow:  '0 50px 120px rgba(0,0,0,0.65), 0 0 90px rgba(26,95,160,0.14)',
            }}
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.3em] text-white/50">Partidas</span>
              <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.3em] text-gold">Alvea Journey</span>
            </div>

            <ul className="mt-1 font-mono text-[12px] sm:text-[14px] tabular-nums">
              {DEPARTURES.map((row) => (
                <li
                  key={row.destination}
                  className="grid grid-cols-[52px_1fr_44px_auto] sm:grid-cols-[70px_1fr_60px_110px] items-center gap-3 border-b border-white/5 py-2.5 text-white/45"
                >
                  <span>{row.time}</span>
                  <span className="uppercase tracking-[0.14em] text-white/70">{row.destination}</span>
                  <span>{row.gate}</span>
                  <span className="text-right uppercase tracking-[0.12em] text-[10px] sm:text-[11px]">{row.status}</span>
                </li>
              ))}
              <li className="grid grid-cols-[52px_1fr_44px_auto] sm:grid-cols-[70px_1fr_60px_110px] items-center gap-3 py-3 text-gold">
                <span>AGORA</span>
                <span className="uppercase tracking-[0.14em] font-semibold text-gold-light">Seu destino</span>
                <span>A1</span>
                <span className="text-right uppercase tracking-[0.12em] text-[10px] sm:text-[11px] font-semibold">Embarque</span>
              </li>
            </ul>
          </div>
        </motion.div>
      </div>

      {/* Copy */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 px-6 text-center">
        <Kicker number={CHAPTER.number} label={CHAPTER.label} style={kicker} />
        <motion.h2
          style={line}
          className="max-w-4xl font-black leading-[1.02] tracking-[-0.03em] text-white text-[clamp(34px,6.4vw,92px)]"
        >
          Todo destino começa com <span className="text-gold-gradient">uma decisão.</span>
        </motion.h2>
      </div>
    </Scene>
  )
}

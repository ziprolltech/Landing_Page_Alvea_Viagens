'use client'

import { useRef } from 'react'
import { motion, useMotionValue, useScroll, useTransform, type MotionValue } from 'framer-motion'
import { CHAPTERS } from '@/data/experiencias'

/* Shared scaffolding for the ALVEA JOURNEY scenes.

   How a scene works
   ─────────────────
   Each scene is a tall <section> (N viewports of scroll) with a sticky,
   viewport-sized stage inside. While the section is pinned, its scroll
   progress goes 0 → 1, and every visual property of the scene is a pure
   function of that number (Framer Motion `useScroll` + `useTransform`).
   Nothing is time-triggered, so scrolling back replays the scene backwards
   and jumping anywhere lands on the right frame.

   The browser scrolls natively the whole time: no wheel/touch listeners, no
   scroll-jacking, no manual requestAnimationFrame.

   One continuous shot
   ───────────────────
   Every section except the first is pulled up by one viewport (negative
   margin), so its stage is pinned exactly when the previous one reaches
   progress 1. Earlier scenes are stacked above later ones, so the next stage
   slides into place *behind* the current one, unseen; at progress 1 the
   current stage is switched off (visibility) and the next one is simply
   there. No empty stretch, no seam travelling up the screen.
   For this to read as a cut-less film, a scene's last frame must equal the
   next scene's first frame — see the "hand-over" notes in each scene.

   Reduced motion
   ──────────────
   `useFx` is for movement (translate / scale / rotate / blur): under
   prefers-reduced-motion it returns a fixed value. Opacity changes use plain
   `useTransform` and stay, so the story still unfolds as simple cross-fades. */

export const EASE = [0.22, 1, 0.36, 1] as const
export const NAVY = '#050D1A'
export const GOLD_GRADIENT = 'linear-gradient(135deg, #D4A853 0%, #ECC96A 50%, #E8824A 100%)'

export function useScene() {
  const ref = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })
  return { ref, progress: scrollYProgress }
}

export function useFx<T extends string | number>(
  progress: MotionValue<number>,
  input:    number[],
  output:   T[],
  reduced:  boolean,
  still:    T,
): MotionValue<T> {
  const live  = useTransform(progress, input, output) as MotionValue<T>
  const fixed = useMotionValue<T>(still)
  return reduced ? fixed : live
}

/* Fade in between a→b, hold until c, fade out by d — with a small rise/exit */
export function useAppear(
  progress: MotionValue<number>,
  range:    [number, number, number, number],
  reduced:  boolean,
  distance = 26,
) {
  const opacity = useTransform(progress, range, [0, 1, 1, 0])
  const y       = useFx(progress, range, [distance, 0, 0, -distance], reduced, 0)
  return { opacity, y }
}

/* ── Scene frame ────────────────────────────────────────────────────────── */

interface SceneProps {
  sceneRef:    React.RefObject<HTMLElement>
  progress:    MotionValue<number>
  id:          string
  label:       string
  screens:     number
  background?: string
  children:    React.ReactNode
}

export function Scene({ sceneRef, progress, id, label, screens, background = NAVY, children }: SceneProps) {
  const index = CHAPTERS.findIndex((c) => c.id === id)
  const last  = index === CHAPTERS.length - 1
  /* Off once finished, so the next stage (already pinned underneath) shows.
     The last scene stays: it scrolls away into the footer like any section. */
  const visibility = useTransform(progress, (p) => (!last && p >= 0.9995 ? 'hidden' : 'visible'))
  return (
    <section
      ref={sceneRef}
      id={id}
      aria-label={label}
      className="relative pointer-events-none [&:not(:first-child)]:-mt-[100svh]"
      style={{ height: `${screens * 100}svh`, zIndex: CHAPTERS.length - index }}
    >
      <motion.div
        className="sticky top-0 h-[100svh] w-full overflow-hidden pointer-events-auto"
        style={{ background, visibility }}
      >
        {children}
      </motion.div>
    </section>
  )
}

/* ── Chapter kicker: "02 — EMBARQUE" ─────────────────────────────────────── */

export function Kicker({ number, label, style }: {
  number: string
  label:  string
  style?: React.ComponentProps<typeof motion.p>['style']
}) {
  return (
    <motion.p
      style={style}
      className="flex items-center gap-3 text-[11px] sm:text-[12px] font-semibold uppercase tracking-[0.28em] text-gold"
    >
      <span>{number}</span>
      <span className="h-px w-8 bg-gold/60" aria-hidden="true" />
      <span>{label}</span>
    </motion.p>
  )
}

/* ── Deterministic star field (same on server and client) ─────────────────── */

export interface Star { left: number; top: number; size: number; delay: number; opacity: number }

export function makeStars(count: number, seed: number): Star[] {
  let s = seed
  const next = () => {
    s = (s * 1664525 + 1013904223) % 4294967296
    return s / 4294967296
  }
  return Array.from({ length: count }, () => ({
    left:    +(next() * 100).toFixed(2),
    top:     +(next() * 100).toFixed(2),
    size:    +(1 + next() * 1.6).toFixed(2),
    delay:   +(next() * 4).toFixed(2),
    opacity: +(0.25 + next() * 0.55).toFixed(2),
  }))
}

export function StarField({ stars, className = '' }: { stars: Star[]; className?: string }) {
  return (
    <div className={`absolute inset-0 pointer-events-none ${className}`} aria-hidden="true">
      {stars.map((star, i) => (
        <span
          key={i}
          className="absolute rounded-full bg-white animate-star-twinkle"
          style={{
            left: `${star.left}%`,
            top: `${star.top}%`,
            width: star.size,
            height: star.size,
            opacity: star.opacity,
            animationDelay: `${star.delay}s`,
          }}
        />
      ))}
    </div>
  )
}

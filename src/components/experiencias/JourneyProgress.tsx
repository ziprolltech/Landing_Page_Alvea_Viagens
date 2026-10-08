'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { motion, useMotionValueEvent, useReducedMotion, useTransform, type MotionValue } from 'framer-motion'
import { CHAPTERS, pinned } from '@/data/experiencias'

/* Discreet progress for the journey.
   Desktop: ten dots on the right edge; the current chapter turns gold and shows
            its number and name. Each dot is a real button that scrolls to its
            chapter (native smooth scroll — the page is never hijacked).
   Mobile:  a 2px gold line across the very top of the screen.

   Rendered through a portal on <body>: template.tsx leaves a `filter` on its
   wrapper, which would otherwise turn `position: fixed` into absolute. */

/* The whole journey scrolls for the sum of the chapters' pinned lengths
   (sections overlap by one viewport — see scene.tsx). */
const TOTAL = CHAPTERS.reduce((sum, c) => sum + pinned(c), 0)

/* Where each chapter starts, in the same units as the page progress */
const STARTS = CHAPTERS.map((_, i) =>
  CHAPTERS.slice(0, i).reduce((sum, c) => sum + pinned(c), 0) / TOTAL,
)

/* A dot lands a little way into its chapter, where its first image is already
   on screen, instead of on the cut itself. */
const LAND_AT = 0.12

function goToChapter(id: string, index: number, instant: boolean) {
  const section = document.getElementById(id)
  if (!section) return
  const top = section.getBoundingClientRect().top + window.scrollY
  const pin = section.offsetHeight - window.innerHeight
  window.scrollTo({ top: top + (index === 0 ? 0 : pin * LAND_AT), behavior: instant ? 'instant' : 'smooth' })
}

function indexAt(progress: number): number {
  let index = 0
  for (let i = 0; i < STARTS.length; i++) if (progress >= STARTS[i] - 0.002) index = i
  return index
}

export default function JourneyProgress({ progress }: { progress: MotionValue<number> }) {
  const [mounted, setMounted] = useState(false)
  const [active,  setActive]  = useState(0)
  const reduced = useReducedMotion() ?? false
  useEffect(() => { setMounted(true) }, [])

  useMotionValueEvent(progress, 'change', (value) => {
    const next = indexAt(value)
    setActive((current) => (current === next ? current : next))
  })

  /* Fades out as the journey ends, so it never sits over the footer */
  const visibility = useTransform(progress, [0, 0.004, 0.985, 1], [0, 1, 1, 0])
  const pointer    = useTransform(progress, (p) => (p > 0.004 && p < 0.985 ? 'auto' : 'none'))

  if (!mounted) return null

  return createPortal(
    <>
      {/* Desktop: dots */}
      <motion.nav
        aria-label="Capítulos da experiência"
        className="fixed right-5 top-1/2 z-40 hidden -translate-y-1/2 lg:block xl:right-7"
        style={{ opacity: visibility, pointerEvents: pointer }}
      >
        <ol className="flex flex-col items-end gap-1">
          {CHAPTERS.map((chapter, index) => {
            const current = index === active
            return (
              <li key={chapter.id}>
                <button
                  type="button"
                  onClick={() => goToChapter(chapter.id, index, reduced)}
                  aria-label={`Ir para o capítulo ${chapter.number}: ${chapter.label}`}
                  aria-current={current ? 'step' : undefined}
                  className="group flex h-6 items-center justify-end gap-3 rounded-full pl-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/70"
                >
                  <span
                    className={`whitespace-nowrap text-[10px] font-semibold uppercase tracking-[0.2em] transition-opacity duration-300 ${
                      current ? 'opacity-100 text-gold' : 'opacity-0 text-white/70 group-hover:opacity-100 group-focus-visible:opacity-100'
                    }`}
                  >
                    {chapter.number} · {chapter.label}
                  </span>
                  <span
                    className={`block rounded-full transition-all duration-300 ${
                      current
                        ? 'h-2 w-2 bg-gold-light shadow-[0_0_0_4px_rgba(212,168,83,0.18),0_0_14px_rgba(236,201,106,0.8)]'
                        : index < active
                          ? 'h-1.5 w-1.5 bg-gold/55'
                          : 'h-1.5 w-1.5 bg-white/30 group-hover:bg-white/70'
                    }`}
                    aria-hidden="true"
                  />
                </button>
              </li>
            )
          })}
        </ol>
      </motion.nav>

      {/* Mobile: line */}
      <motion.div
        className="fixed inset-x-0 top-0 z-[60] h-[2px] bg-white/10 pointer-events-none lg:hidden"
        style={{ opacity: visibility }}
        aria-hidden="true"
      >
        <motion.div
          className="h-full origin-left"
          style={{ scaleX: progress, background: 'linear-gradient(90deg, #D4A853, #ECC96A)' }}
        />
      </motion.div>
    </>,
    document.body,
  )
}

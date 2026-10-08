'use client'

import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import Image from 'next/image'
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion'

/*
  ScrollPlane — scroll-driven airplane fly-over.

  Wraps a homepage section (children). The scroll progress of that wrapper
  drives an airplane that crosses the viewport diagonally, bottom-left to
  top-right, in front of the content. Scrolling back reverses the flight,
  because every value is a pure function of scroll position — no timers.

  The plane lives in a fixed, viewport-sized layer portalled to <body>:
  • template.tsx leaves a `filter` on its wrapper, which would turn any
    `position: fixed` descendant into an absolutely-positioned one;
  • <main> is `overflow-hidden`, which would disable `position: sticky`.
  The layer adds no scroll height, clips the off-screen plane itself (no
  horizontal scrollbar), ignores pointer events, and sits at z-30 — above
  page content, below the navbar (z-50) and its drawer (z-40/50).

  Travel uses viewport-width units on both axes, so the flight angle is the
  same on every screen size and matches the plane's heading.
*/

interface Props {
  children: React.ReactNode
}

export default function ScrollPlane({ children }: Props) {
  const targetRef    = useRef<HTMLDivElement>(null)
  const reduceMotion = useReducedMotion()

  /* Portals need document — render the layer only after mount (no SSR output, no hydration diff) */
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])

  /* 0 → section top reaches 85% of the viewport · 1 → section bottom reaches 15% */
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ['start 0.85', 'end 0.15'],
  })

  const x       = useTransform(scrollYProgress, [0.08, 0.9], ['-55vw', '105vw'])
  const y       = useTransform(scrollYProgress, [0.08, 0.9], ['14vw', '-26vw'])
  const rotate  = useTransform(scrollYProgress, [0.08, 0.5, 0.9], [-18, -14, -11])
  const scale   = useTransform(scrollYProgress, [0.08, 0.5, 0.9], [0.9, 1, 1.06])
  const opacity = useTransform(scrollYProgress, [0.1, 0.24, 0.74, 0.88], [0, 1, 1, 0])

  /* Reduced motion: no travel — the plane only fades in and out, parked and discreet */
  const calmOpacity = useTransform(scrollYProgress, [0.2, 0.4, 0.6, 0.8], [0, 0.5, 0.5, 0])

  return (
    <div ref={targetRef} className="relative">
      {children}

      {mounted && createPortal(
        <div
          aria-hidden="true"
          className="fixed inset-0 z-30 overflow-hidden pointer-events-none"
        >
          {reduceMotion ? (
            <motion.div
              className="absolute right-[6%] top-[18%] w-[clamp(120px,22vw,300px)]"
              style={{ opacity: calmOpacity, rotate: -14 }}
            >
              <PlaneImage />
            </motion.div>
          ) : (
            <motion.div
              className="absolute left-0 top-[46%] w-[clamp(240px,60vw,820px)] will-change-transform"
              style={{ x, y, rotate, scale, opacity }}
            >
              {/* Twin contrails — anchored to the engine centrelines of plane-scroll.png
                  (1672×941: engines at y≈334 and y≈628, exhaust at x≈950). Drawn before
                  the image, so they sit behind the aircraft and emerge from under the wing. */}
              <Contrail top="35.5%" />
              <Contrail top="66.7%" />
              <PlaneImage />
            </motion.div>
          )}
        </div>,
        document.body,
      )}
    </div>
  )
}

/* All measurements are percentages of the plane box, so the trail scales with the
   aircraft and inherits its transform. Narrow and denser at the engine, widening
   and fading towards the tail. */
function Contrail({ top }: { top: string }) {
  return (
    <div
      className="absolute right-[43.2%] h-[4.6%] w-[72%] -translate-y-1/2"
      style={{ top, filter: 'blur(clamp(0.6px, 0.12vw, 2px))' }}
    >
      <div
        className="h-full w-full"
        style={{
          clipPath:   'polygon(0 0, 100% 40%, 100% 60%, 0 100%)',
          background: 'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.08) 30%, rgba(255,255,255,0.26) 72%, rgba(255,255,255,0.5) 100%)',
        }}
      />
    </div>
  )
}

function PlaneImage() {
  return (
    <Image
      src="/images/plane-scroll.png"
      alt=""
      width={1672}
      height={941}
      sizes="(max-width: 1366px) 60vw, 820px"
      loading="eager"
      draggable={false}
      className="relative w-full h-auto select-none"
    />
  )
}

'use client'

import { useEffect, useRef } from 'react'

/* ──────────────────────────────────────────────────────────────
   Airplane SVG — minimalist side-view facing right
   The group origin is at (0,0); GSAP MotionPath shifts it.
────────────────────────────────────────────────────────────── */
function AirplaneSVG() {
  return (
    <g>
      {/* Outer glow halo */}
      <circle cx="0" cy="0" r="22" fill="rgba(212,168,83,0.10)" />
      <circle cx="0" cy="0" r="14" fill="rgba(255,255,255,0.06)" />

      {/* Fuselage */}
      <ellipse cx="4" cy="0" rx="20" ry="5" fill="white" opacity="0.95" />
      {/* Nose cone */}
      <ellipse cx="22" cy="0" rx="6" ry="3.5" fill="white" />

      {/* Main wings (top & bottom) */}
      <polygon points="-2,-5 12,-5 6,-22 -4,-22" fill="white" opacity="0.92" />
      <polygon points="-2,5  12,5  6,22  -4,22"  fill="white" opacity="0.92" />

      {/* Wing leading edge highlight */}
      <line x1="-4" y1="-22" x2="12" y2="-5" stroke="rgba(212,168,83,0.5)" strokeWidth="0.8" />
      <line x1="-4" y1="22"  x2="12" y2="5"  stroke="rgba(212,168,83,0.5)" strokeWidth="0.8" />

      {/* Tail fins */}
      <polygon points="-14,-5 -22,-13 -18,-5" fill="white" opacity="0.85" />
      <polygon points="-14,5  -22,13  -18,5"  fill="white" opacity="0.85" />

      {/* Vertical tail */}
      <polygon points="-16,-5 -22,-11 -14,-5" fill="white" opacity="0.7" />

      {/* Engine glow */}
      <circle cx="6" cy="-14" r="2.5" fill="rgba(212,168,83,0.7)" />
      <circle cx="6" cy="14"  r="2.5" fill="rgba(212,168,83,0.7)" />
    </g>
  )
}

/* ──────────────────────────────────────────────────────────────
   Main component
   Uses GSAP MotionPath to animate the plane along an SVG path.
   Dynamic import keeps SSR clean.
────────────────────────────────────────────────────────────── */
export default function AviationTrail() {
  const planeRef = useRef<SVGGElement>(null)
  const ctxRef   = useRef<{ revert: () => void } | null>(null)

  useEffect(() => {
    let cancelled = false

    const init = async () => {
      const gsap             = (await import('gsap')).default
      const { MotionPathPlugin } = await import('gsap/MotionPathPlugin')
      if (cancelled) return

      gsap.registerPlugin(MotionPathPlugin)

      ctxRef.current = gsap.context(() => {
        gsap.set(planeRef.current, { opacity: 0 })

        gsap.to(planeRef.current, {
          motionPath: {
            path:        '#alvea-flight-path',
            align:       '#alvea-flight-path',
            autoRotate:  true,
            alignOrigin: [0.5, 0.5],
            start:       0,
            end:         1,
          },
          duration:    22,
          ease:        'none',
          repeat:      -1,
          repeatDelay: 2,
          onStart() {
            gsap.to(planeRef.current, { opacity: 1, duration: 1.5 })
          },
          onRepeat() {
            gsap.set(planeRef.current, { opacity: 0 })
            setTimeout(() => {
              if (!cancelled) gsap.to(planeRef.current, { opacity: 1, duration: 1.5 })
            }, 400)
          },
        })
      })
    }

    init()
    return () => {
      cancelled = true
      ctxRef.current?.revert()
    }
  }, [])

  return (
    <div
      className="absolute inset-x-0 top-0 pointer-events-none overflow-hidden"
      style={{ height: '260px', zIndex: 10 }}
    >
      <svg
        width="100%"
        height="260"
        viewBox="0 0 1920 260"
        preserveAspectRatio="xMidYMid meet"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Plane engine glow filter */}
          <filter id="plane-glow" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>

          {/* Trail gradient */}
          <linearGradient id="trail-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%"   stopColor="rgba(212,168,83,0)" />
            <stop offset="70%"  stopColor="rgba(212,168,83,0.4)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0.7)" />
          </linearGradient>

          {/* Soft glow behind dashes */}
          <filter id="path-glow" x="-5%" y="-200%" width="110%" height="500%">
            <feGaussianBlur stdDeviation="3" />
          </filter>

          {/* Mask to fade path at edges */}
          <linearGradient id="path-fade" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%"   stopColor="white" stopOpacity="0" />
            <stop offset="8%"   stopColor="white" stopOpacity="1" />
            <stop offset="92%"  stopColor="white" stopOpacity="1" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </linearGradient>
          <mask id="path-mask">
            <rect x="0" y="0" width="1920" height="260" fill="url(#path-fade)" />
          </mask>
        </defs>

        {/* ── Flight path glow (blurred duplicate) ── */}
        <path
          d="M -200,175 C 120,110 280,200 520,140 C 760,80 940,190 1200,120 C 1460,50 1640,170 2120,95"
          fill="none"
          stroke="rgba(212,168,83,0.15)"
          strokeWidth="4"
          filter="url(#path-glow)"
          mask="url(#path-mask)"
        />

        {/* ── Main dashed flight path ── */}
        <path
          id="alvea-flight-path"
          d="M -200,175 C 120,110 280,200 520,140 C 760,80 940,190 1200,120 C 1460,50 1640,170 2120,95"
          fill="none"
          stroke="rgba(212,168,83,0.22)"
          strokeWidth="1.5"
          strokeDasharray="10 18"
          mask="url(#path-mask)"
        />

        {/* ── Animated airplane group ── */}
        <g
          ref={planeRef}
          filter="url(#plane-glow)"
          style={{ transformOrigin: '0px 0px' }}
        >
          <AirplaneSVG />
        </g>
      </svg>
    </div>
  )
}

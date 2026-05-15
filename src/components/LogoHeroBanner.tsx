'use client'

import Image from 'next/image'

/*
  LogoHeroBanner — clean, static presentation of the brand photo.

  All excessive animations have been removed. The image is displayed
  as-is, with only a minimal atmospheric sky tint layered over the
  upper sky region (top ~58%) for color cohesion with the rest of
  the site. No moving elements.
*/
export default function LogoHeroBanner() {
  return (
    <div
      className="relative w-full overflow-hidden rounded-3xl"
      style={{
        boxShadow: [
          '0 32px 80px rgba(0,0,0,0.55)',
          '0 0 0 1px rgba(255,255,255,0.07)',
        ].join(', '),
      }}
    >
      {/* ── Static brand image ── */}
      <Image
        src="/logo.png"
        alt="Alvea Viagens — Experiência Premium em Viagens"
        width={600}
        height={660}
        priority
        draggable={false}
        className="w-full h-auto block"
      />

      {/* ── Atmospheric sky tint — top portion only ──
          Blends the sky region into the site's deep-blue palette.
          The couple and foreground elements are completely unaffected.
      ── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: [
            /* Top sky: very subtle deep-blue overlay for palette cohesion */
            'linear-gradient(180deg, rgba(3,10,20,0.22) 0%, rgba(5,13,26,0.08) 42%, transparent 60%)',
            /* Bottom edge: subtle vignette to ground the image */
            'linear-gradient(0deg, rgba(5,13,26,0.18) 0%, transparent 25%)',
          ].join(', '),
        }}
      />

      {/* ── Premium inner border ── */}
      <div
        className="absolute inset-0 pointer-events-none rounded-3xl"
        style={{
          boxShadow: [
            'inset 0 0 0 1px rgba(255,255,255,0.08)',
            'inset 0 1px 0 rgba(255,255,255,0.10)',
          ].join(', '),
        }}
      />
    </div>
  )
}

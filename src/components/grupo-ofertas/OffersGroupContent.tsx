'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import {
  Plane, Coins, BellRing, Handshake, MessageCircle, ArrowRight, Play, Maximize2, Minimize2,
} from 'lucide-react'
import GlassCard from '@/components/ui/GlassCard'
import {
  WHATSAPP_GROUP_URL,
  isWhatsAppGroupConfigured,
  OFFERS_GROUP_VIDEO_SRC,
} from '@/lib/config/links'

/* ── Content ────────────────────────────────────────────────────────────── */

const OFFERINGS = [
  {
    icon:  Plane,
    title: 'Promoções de passagens',
    desc:  'Oportunidades encontradas pela nossa equipe.',
  },
  {
    icon:  Coins,
    title: 'Oportunidades em milhas',
    desc:  'Condições e oportunidades relacionadas ao mercado de milhas.',
  },
  {
    icon:  BellRing,
    title: 'Novas ofertas',
    desc:  'Acompanhe as oportunidades compartilhadas ao longo do dia.',
  },
  {
    icon:  Handshake,
    title: 'Suporte da Alvea',
    desc:  'Encontrou uma oportunidade? Nossa equipe pode ajudar.',
  },
]

const STEPS = [
  {
    number: '01',
    title:  'Entre no grupo',
    desc:   'Clique no botão e entre gratuitamente.',
  },
  {
    number: '02',
    title:  'Acompanhe as ofertas',
    desc:   'Receba oportunidades diretamente no WhatsApp.',
  },
  {
    number: '03',
    title:  'Aproveite a oportunidade',
    desc:   'Encontrou algo interessante? Fale com a Alvea para verificar a emissão.',
  },
]

const EASE = [0.22, 1, 0.36, 1] as const
const GOLD_GRADIENT = 'linear-gradient(135deg, #D4A853 0%, #ECC96A 50%, #E8824A 100%)'

/* ── Group CTA ──────────────────────────────────────────────────────────────
   Links to WHATSAPP_GROUP_URL (src/lib/config/links.ts) in a new tab.
   If that value ever stops being an https:// link, it renders as an inert
   button so nobody is sent to a broken URL. */

function GroupCTA({ reduce }: { reduce: boolean }) {
  const className =
    'btn-shimmer cta-glow inline-flex items-center justify-center gap-2.5 px-9 py-4 rounded-full text-[15px] font-semibold text-sky-deep'
  const hover = reduce ? undefined : { scale: 1.04, y: -2 }
  const tap   = reduce ? undefined : { scale: 0.97 }
  const transition = { type: 'spring' as const, stiffness: 400, damping: 22 }

  const content = (
    <>
      <MessageCircle size={17} strokeWidth={2} aria-hidden="true" />
      Entrar no Grupo de Ofertas
      <ArrowRight size={16} strokeWidth={2} aria-hidden="true" />
    </>
  )

  if (!isWhatsAppGroupConfigured) {
    return (
      <motion.button
        type="button"
        aria-disabled="true"
        title="O link do grupo será disponibilizado em breve"
        className={className}
        style={{ background: GOLD_GRADIENT }}
        whileHover={hover}
        whileTap={tap}
        transition={transition}
      >
        {content}
      </motion.button>
    )
  }

  return (
    <motion.a
      href={WHATSAPP_GROUP_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Entrar no Grupo de Ofertas da Alvea Viagens no WhatsApp (abre em nova aba)"
      className={className}
      style={{ background: GOLD_GRADIENT }}
      whileHover={hover}
      whileTap={tap}
      transition={transition}
    >
      {content}
    </motion.a>
  )
}

/* ── Eyebrow badge (same visual language as the other pages) ─────────────── */

function Eyebrow({ children, icon }: { children: React.ReactNode; icon?: React.ReactNode }) {
  return (
    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-gold/25 bg-gold/10 backdrop-blur-sm">
      {icon ?? <span className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse-soft" />}
      <span className="text-gold text-[11px] font-semibold tracking-[0.12em] uppercase">{children}</span>
    </div>
  )
}

/* ── Vertical video showcase (9:16) ─────────────────────────────────────────
   Width drives the size; `aspect-[9/16]` derives the height, so the frame is
   always exactly 9:16: 360px max on mobile, 320px on tablet, 338px (≈590px
   tall) on desktop.

   Fullscreen is custom: the 9:16 *container* goes fullscreen, not the <video>.
   Inside it the video is sized to the largest 9:16 box that fits the screen and
   centred on a dark navy background, so a vertical video is never stretched or
   cropped on a landscape display. The native fullscreen button is hidden where
   the browser allows it (controlsList) and replaced by the button in the top
   corner; where it cannot be hidden, `[&:fullscreen]:object-contain` keeps the
   ratio in native fullscreen too. */

type FullscreenVideo = HTMLVideoElement & { webkitEnterFullscreen?: () => void }

function VideoShowcase({ hasVideo }: { hasVideo: boolean }) {
  const [failed, setFailed] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const frameRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<FullscreenVideo>(null)
  const showVideo = hasVideo && !failed

  /* Keeps state in sync however fullscreen ends (button, Esc, browser UI) */
  useEffect(() => {
    const onChange = () => setIsFullscreen(document.fullscreenElement === frameRef.current)
    document.addEventListener('fullscreenchange', onChange)
    return () => document.removeEventListener('fullscreenchange', onChange)
  }, [])

  function toggleFullscreen() {
    if (document.fullscreenElement) {
      void document.exitFullscreen()
      return
    }
    const frame = frameRef.current
    if (frame?.requestFullscreen) {
      frame.requestFullscreen().catch(() => {})
      return
    }
    /* iPhone Safari has no element fullscreen — use its native video fullscreen,
       which always preserves the video's own aspect ratio */
    videoRef.current?.webkitEnterFullscreen?.()
  }

  return (
    <div className="relative mx-auto w-[min(100%,360px)] md:w-[320px] lg:w-[338px]">
      {/* Discreet gold glow behind the frame */}
      <div
        className="absolute -inset-8 rounded-[56px] pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 62% 55% at 50% 50%, rgba(212,168,83,0.16) 0%, transparent 70%)',
          filter: 'blur(30px)',
        }}
        aria-hidden="true"
      />
      {/* Cool light from the upper corner, for depth */}
      <div
        className="absolute -top-10 -right-12 h-40 w-40 rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(26,95,160,0.28) 0%, transparent 70%)',
          filter: 'blur(26px)',
        }}
        aria-hidden="true"
      />

      {/* Glass frame */}
      <div
        className="relative rounded-[30px] p-2 backdrop-blur-md"
        style={{
          background: 'linear-gradient(155deg, rgba(255,255,255,0.11) 0%, rgba(255,255,255,0.03) 45%, rgba(212,168,83,0.09) 100%)',
          border:     '1px solid rgba(212,168,83,0.22)',
          boxShadow:  '0 44px 110px rgba(0,0,0,0.62), 0 0 0 1px rgba(255,255,255,0.05) inset',
        }}
      >
        <div
          ref={frameRef}
          className={
            isFullscreen
              ? 'relative flex items-center justify-center overflow-hidden'
              : 'relative aspect-[9/16] w-full overflow-hidden rounded-[23px]'
          }
          style={{
            background: isFullscreen
              ? 'radial-gradient(ellipse 70% 60% at 50% 50%, #0A1628 0%, #050D1A 55%, #030A14 100%)'
              : '#030A14',
          }}
        >
          {showVideo ? (
            <>
              <video
                ref={videoRef}
                className={
                  isFullscreen
                    ? 'block flex-none max-w-none object-contain'
                    : 'absolute inset-0 h-full w-full object-cover [&:fullscreen]:object-contain'
                }
                style={
                  isFullscreen
                    ? {
                        width:       'min(100vw, calc(100vh * 9 / 16))',
                        height:      'min(100vh, calc(100vw * 16 / 9))',
                        aspectRatio: '9 / 16',
                      }
                    : undefined
                }
                src={OFFERS_GROUP_VIDEO_SRC}
                controls
                controlsList="nofullscreen"
                playsInline
                preload="metadata"
                aria-label="Vídeo de apresentação do Grupo de Ofertas da Alvea Viagens"
                onError={() => setFailed(true)}
              />
              <button
                type="button"
                onClick={toggleFullscreen}
                aria-label={isFullscreen ? 'Sair da tela cheia' : 'Ver o vídeo em tela cheia'}
                aria-pressed={isFullscreen}
                className={`absolute z-10 flex h-9 w-9 items-center justify-center rounded-full text-white/90 transition-colors duration-200 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/70 ${
                  isFullscreen ? 'right-5 top-5' : 'right-3 top-3'
                }`}
                style={{
                  background:           'rgba(3,10,20,0.55)',
                  border:               '1px solid rgba(255,255,255,0.18)',
                  backdropFilter:       'blur(8px)',
                  WebkitBackdropFilter: 'blur(8px)',
                }}
              >
                {isFullscreen
                  ? <Minimize2 size={16} strokeWidth={2} aria-hidden="true" />
                  : <Maximize2 size={16} strokeWidth={2} aria-hidden="true" />}
              </button>
            </>
          ) : (
            <div
              className="absolute inset-0 flex flex-col items-center justify-center gap-5 px-6 text-center"
              style={{
                background:
                  'radial-gradient(ellipse 85% 45% at 50% 42%, rgba(26,95,160,0.24) 0%, transparent 70%), linear-gradient(170deg, #0A1628 0%, #050D1A 55%, #030A14 100%)',
              }}
              role="img"
              aria-label="Espaço reservado para o vídeo de apresentação do Grupo de Ofertas"
            >
              <div
                className="flex h-16 w-16 items-center justify-center rounded-full"
                style={{
                  background: 'rgba(212,168,83,0.10)',
                  border:     '1px solid rgba(212,168,83,0.30)',
                  boxShadow:  '0 0 40px rgba(212,168,83,0.16)',
                }}
              >
                <Play size={24} strokeWidth={1.8} className="text-gold translate-x-[2px]" aria-hidden="true" />
              </div>
              <div>
                <p className="text-white text-[15px] font-semibold leading-snug">
                  Conheça o Grupo de Ofertas
                </p>
                <p className="text-white/50 text-[12.5px] mt-1.5">
                  Vídeo de apresentação em breve
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/* ── Page content ───────────────────────────────────────────────────────── */

export default function OffersGroupContent({ hasVideo }: { hasVideo: boolean }) {
  const reduce = useReducedMotion() ?? false

  /* Reduced motion: no travel or scaling — only short fades remain */
  const rise = (distance: number) => (reduce ? 0 : distance)

  /* Hero sequence: badge → headline → subheadline → CTA → video */
  const heroContainer = {
    hidden: {},
    show:   { transition: { staggerChildren: reduce ? 0.05 : 0.14, delayChildren: 0.15 } },
  }
  const heroItem = {
    hidden: { opacity: 0, y: rise(22) },
    show:   { opacity: 1, y: 0, transition: { duration: reduce ? 0.3 : 0.8, ease: EASE } },
  }
  const heroVideo = {
    hidden: { opacity: 0, y: rise(20), scale: reduce ? 1 : 0.96 },
    show:   { opacity: 1, y: 0, scale: 1, transition: { duration: reduce ? 0.3 : 0.9, ease: EASE } },
  }

  const gridContainer = {
    hidden: {},
    show:   { transition: { staggerChildren: reduce ? 0 : 0.1 } },
  }
  const gridItem = {
    hidden: { opacity: 0, y: rise(24) },
    show:   { opacity: 1, y: 0, transition: { duration: reduce ? 0.3 : 0.65, ease: EASE } },
  }

  const sectionHeading = {
    hidden: { opacity: 0, y: rise(18) },
    show:   { opacity: 1, y: 0, transition: { duration: reduce ? 0.3 : 0.7, ease: EASE } },
  }

  const inView = { once: true, margin: '-80px 0px' } as const

  return (
    <main className="relative min-h-screen pt-32 pb-24 px-6 overflow-hidden">

      {/* Ambient orbs */}
      <div
        className="absolute top-16 left-1/2 -translate-x-1/2 w-[900px] h-[420px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, rgba(26,95,160,0.10) 0%, transparent 70%)', filter: 'blur(70px)' }}
        aria-hidden="true"
      />
      <div
        className="absolute top-[38%] right-0 w-[480px] h-[560px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, rgba(212,168,83,0.05) 0%, transparent 70%)', filter: 'blur(70px)' }}
        aria-hidden="true"
      />
      <div
        className="absolute bottom-40 left-0 w-[480px] h-[480px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, rgba(26,95,160,0.07) 0%, transparent 70%)', filter: 'blur(65px)' }}
        aria-hidden="true"
      />

      <div className="relative max-w-6xl mx-auto">

        {/* ── Hero: copy + CTA (left) · vertical video (right) ──
            Single column below lg, in the order badge → headline → text → CTA → video. */}
        <motion.section
          className="grid grid-cols-1 items-center gap-14 lg:grid-cols-[minmax(0,1fr)_auto] lg:gap-20"
          variants={heroContainer}
          initial="hidden"
          animate="show"
          aria-labelledby="grupo-ofertas-title"
        >
          <div className="flex flex-col items-center text-center gap-6 lg:items-start lg:text-left">
            <motion.div variants={heroItem}>
              <Eyebrow icon={<Plane size={12} className="text-gold" strokeWidth={2} aria-hidden="true" />}>
                Ofertas Exclusivas
              </Eyebrow>
            </motion.div>

            <motion.h1
              id="grupo-ofertas-title"
              variants={heroItem}
              className="text-4xl sm:text-5xl lg:text-[56px] font-black text-white leading-[1.07] tracking-[-0.025em]"
            >
              Seu próximo destino pode estar{' '}
              <span className="text-gold-gradient">mais perto do que você imagina.</span>
            </motion.h1>

            <motion.p
              variants={heroItem}
              className="max-w-xl text-white/60 text-[16px] sm:text-[17px] leading-relaxed font-light"
            >
              Entre no grupo de ofertas da Alvea Viagens e receba promoções, oportunidades
              e condições especiais diretamente no WhatsApp.
            </motion.p>

            <motion.div variants={heroItem} className="flex flex-col items-center gap-3 mt-2 lg:items-start">
              <GroupCTA reduce={reduce} />
              <p className="text-white/40 text-[12.5px] lg:pl-2">
                {isWhatsAppGroupConfigured
                  ? 'Entrada gratuita · direto no seu WhatsApp'
                  : 'O link do grupo será disponibilizado em breve'}
              </p>
            </motion.div>
          </div>

          <motion.div variants={heroVideo} className="lg:pr-4">
            <VideoShowcase hasVideo={hasVideo} />
          </motion.div>
        </motion.section>

        {/* ── O que o grupo oferece ── */}
        <section className="mt-24 lg:mt-32" aria-labelledby="o-que-oferece-title">
          <motion.div
            className="flex flex-col items-center text-center gap-5 mb-12"
            variants={sectionHeading}
            initial="hidden"
            whileInView="show"
            viewport={inView}
          >
            <Eyebrow>O que você recebe</Eyebrow>
            <h2
              id="o-que-oferece-title"
              className="text-3xl md:text-4xl lg:text-5xl font-black text-white leading-[1.08] tracking-[-0.02em]"
            >
              O que você encontra <span className="text-gold-gradient">no grupo.</span>
            </h2>
          </motion.div>

          <motion.ul
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
            variants={gridContainer}
            initial="hidden"
            whileInView="show"
            viewport={inView}
          >
            {OFFERINGS.map((item) => {
              const Icon = item.icon
              return (
                <motion.li key={item.title} variants={gridItem} className="list-none">
                  <GlassCard hover={!reduce} className="p-7 h-full flex flex-col gap-4">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-gold/15">
                      <Icon size={22} className="text-gold" strokeWidth={1.8} aria-hidden="true" />
                    </div>
                    <h3 className="text-white text-[17px] font-bold">{item.title}</h3>
                    <p className="text-white/60 text-[14px] leading-relaxed">{item.desc}</p>
                  </GlassCard>
                </motion.li>
              )
            })}
          </motion.ul>
        </section>

        {/* ── Como funciona ── */}
        <section className="mt-24 lg:mt-32" aria-labelledby="como-funciona-title">
          <motion.div
            className="flex flex-col items-center text-center gap-5 mb-12"
            variants={sectionHeading}
            initial="hidden"
            whileInView="show"
            viewport={inView}
          >
            <Eyebrow>Como funciona</Eyebrow>
            <h2
              id="como-funciona-title"
              className="text-3xl md:text-4xl lg:text-5xl font-black text-white leading-[1.08] tracking-[-0.02em]"
            >
              Três passos para <span className="text-gold-gradient">acompanhar as ofertas.</span>
            </h2>
          </motion.div>

          <motion.ol
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
            variants={gridContainer}
            initial="hidden"
            whileInView="show"
            viewport={inView}
          >
            {STEPS.map((step) => (
              <motion.li key={step.number} variants={gridItem} className="list-none">
                <GlassCard hover={!reduce} className="p-8 h-full flex flex-col gap-4">
                  <span className="text-gold-gradient text-[40px] font-black leading-none tracking-tight" aria-hidden="true">
                    {step.number}
                  </span>
                  <h3 className="text-white text-[19px] font-bold">{step.title}</h3>
                  <p className="text-white/60 text-[14.5px] leading-relaxed">{step.desc}</p>
                </GlassCard>
              </motion.li>
            ))}
          </motion.ol>
        </section>

        {/* ── CTA final ── */}
        <motion.section
          className="relative mt-24 lg:mt-32 overflow-hidden rounded-3xl px-6 py-16 sm:py-20 text-center"
          style={{
            background: 'linear-gradient(160deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 60%, rgba(212,168,83,0.05) 100%)',
            border:     '1px solid rgba(212,168,83,0.16)',
          }}
          initial={{ opacity: 0, y: rise(26) }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={inView}
          transition={{ duration: reduce ? 0.3 : 0.8, ease: EASE }}
          aria-labelledby="cta-final-title"
        >
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: 'radial-gradient(ellipse 65% 60% at 50% 50%, rgba(212,168,83,0.09) 0%, transparent 70%)' }}
            aria-hidden="true"
          />
          <div className="relative flex flex-col items-center gap-6 max-w-2xl mx-auto">
            <Eyebrow>Comece agora</Eyebrow>
            <h2
              id="cta-final-title"
              className="text-3xl md:text-4xl lg:text-5xl font-black text-white leading-[1.08] tracking-[-0.02em]"
            >
              Não perca a próxima <span className="text-gold-gradient">oportunidade.</span>
            </h2>
            <p className="text-white/60 text-[16px] sm:text-[17px] leading-relaxed font-light">
              Entre no grupo da Alvea Viagens e acompanhe nossas ofertas diretamente no WhatsApp.
            </p>
            <div className="mt-2">
              <GroupCTA reduce={reduce} />
            </div>
          </div>
        </motion.section>

      </div>
    </main>
  )
}

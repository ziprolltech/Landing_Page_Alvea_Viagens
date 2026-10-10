'use client'

import { useRef } from 'react'
import Link from 'next/link'
import { motion, useScroll, useTransform } from 'framer-motion'
import { Ticket, Star, ShieldCheck, TrendingUp, ArrowRight, Coins } from 'lucide-react'

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.11, delayChildren: 0.35 } },
}

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } },
}

const fadeIn = {
  hidden: { opacity: 0 },
  show:   { opacity: 1, transition: { duration: 1, ease: 'easeOut' } },
}

function TrustBadge({ icon: Icon, value, label }: { icon: React.ElementType; value: string; label: string }) {
  return (
    <motion.div
      variants={fadeUp}
      className="flex items-center gap-3 px-5 py-3 rounded-2xl border border-white/10 bg-white/[0.04] lg:backdrop-blur-sm"
    >
      <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-gold/15 shrink-0">
        <Icon size={16} className="text-gold" />
      </div>
      <div>
        <p className="text-white text-[15px] font-bold leading-tight">{value}</p>
        <p className="text-white/50 text-[11px] tracking-wide">{label}</p>
      </div>
    </motion.div>
  )
}

function Orb({ className }: { className: string }) {
  /* below `lg` the soft edge comes from a mask instead of an 80px blur filter */
  return <div className={`absolute rounded-full blur-[80px] max-lg:blur-none max-lg:[-webkit-mask-image:radial-gradient(closest-side,#000_20%,transparent)] max-lg:[mask-image:radial-gradient(closest-side,#000_20%,transparent)] pointer-events-none ${className}`} />
}

export default function Hero() {
  const ref = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })

  const heroY    = useTransform(scrollYProgress, [0, 1], ['0%', '18%'])
  const heroOpac = useTransform(scrollYProgress, [0, 0.6], [1, 0])
  const titleY   = useTransform(scrollYProgress, [0, 1], ['0%', '-10%'])

  return (
    <section
      ref={ref}
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden pt-20 pb-16"
    >
      <Orb className="w-[600px] h-[600px] bg-sky-bright/18 top-[-8%]  left-[-14%]"  />
      <Orb className="w-[480px] h-[480px] bg-gold/8        top-[18%]  right-[-8%]"  />
      <Orb className="w-[650px] h-[650px] bg-sky-horizon/12 bottom-0  left-[22%]"   />

      {/* Cinematic bottom vignette */}
      <div
        className="absolute bottom-0 inset-x-0 h-48 pointer-events-none z-10"
        style={{ background: 'linear-gradient(0deg, #030A14 0%, transparent 100%)' }}
      />

      <motion.div
        className="relative z-20 max-w-6xl mx-auto px-6 w-full"
        style={{ y: heroY, opacity: heroOpac }}
      >
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="flex flex-col items-center text-center gap-8"
        >
          {/* Eyebrow badge */}
          <motion.div
            variants={fadeIn}
            className="flex items-center gap-2 px-4 py-1.5 rounded-full border border-gold/22 bg-gold/8 lg:backdrop-blur-sm"
          >
            <Star size={11} className="text-gold fill-gold" />
            <span className="text-gold text-[11px] font-semibold tracking-[0.12em] uppercase">
              Experiência Premium em Viagens
            </span>
            <Star size={11} className="text-gold fill-gold" />
          </motion.div>

          {/* Main headline */}
          <motion.div variants={fadeUp} style={{ y: titleY }} className="max-w-4xl">
            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-[80px] font-black leading-[1.05] tracking-[-0.03em]">
              <span className="text-white">Transformamos milhas em </span>
              <br className="hidden sm:block" />
              <span className="text-gold-gradient">experiências inesquecíveis.</span>
            </h1>
          </motion.div>

          {/* Decorative divider */}
          <motion.div variants={fadeIn} className="flex items-center gap-4 w-full max-w-xs">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent to-gold/35" />
            <div className="w-1.5 h-1.5 rounded-full bg-gold/55" />
            <div className="flex-1 h-px bg-gradient-to-l from-transparent to-gold/35" />
          </motion.div>

          {/* Subheadline */}
          <motion.p
            variants={fadeUp}
            className="max-w-xl text-white/58 text-[17px] leading-relaxed font-light"
          >
            Passagens aéreas, milhas e oportunidades exclusivas para você{' '}
            <span className="text-white/82 font-medium">viajar mais pagando menos.</span>
          </motion.p>

          {/* CTA — Emitir Passagem → /destinos */}
          <motion.div variants={fadeUp} className="flex justify-center w-full mt-2">
            <Link href="/destinos" className="group block w-full sm:w-[460px] rounded-full">
              <motion.span
                className="btn-shimmer cta-glow relative flex items-center justify-center gap-2.5 w-full px-8 py-4 rounded-full text-[14px] font-bold tracking-wide text-sky-deep shadow-gold-lg"
                style={{ background: 'linear-gradient(135deg, #D4A853 0%, #ECC96A 55%, #E8824A 100%)' }}
                whileHover={{ scale: 1.06, y: -2 }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: 'spring', stiffness: 380, damping: 18 }}
              >
                <Ticket size={15} strokeWidth={2.5} />
                Emitir Passagem
                <span className="inline-flex transition-transform duration-200 group-hover:translate-x-1">
                  <ArrowRight size={14} strokeWidth={2.5} />
                </span>
              </motion.span>
            </Link>
          </motion.div>

          {/* Trust badges */}
          <motion.div
            variants={container}
            className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 w-full max-w-3xl"
          >
            <TrustBadge icon={TrendingUp}  value="1k+"    label="Passagens emitidas"   />
            <TrustBadge icon={ShieldCheck}  value="100%"   label="Transações seguras"   />
            <TrustBadge icon={Star}         value="4.9/5"  label="Avaliação dos clientes" />
            <TrustBadge icon={Coins}        value="R$10M+" label="Milhas economizadas"  />
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-20"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2.2, duration: 0.8 }}
        style={{ opacity: heroOpac }}
      >
        <span className="text-white/28 text-[10px] tracking-[0.22em] uppercase">Rolar</span>
        <motion.div
          className="w-px h-8 bg-gradient-to-b from-gold/55 to-transparent"
          animate={{ scaleY: [1, 1.45, 1], opacity: [0.45, 1, 0.45] }}
          transition={{ duration: 1.9, repeat: Infinity, ease: 'easeInOut' }}
        />
      </motion.div>
    </section>
  )
}

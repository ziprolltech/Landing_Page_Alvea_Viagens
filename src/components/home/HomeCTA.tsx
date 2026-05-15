'use client'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Ticket, ArrowRight, Phone } from 'lucide-react'

export default function HomeCTA() {
  return (
    <section className="relative py-24 lg:py-32 px-6 overflow-hidden">
      {/* Background */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(180deg, #030A14 0%, #050D1A 50%, #030A14 100%)',
        }}
      />

      {/* Gold radial glow center */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 70% 55% at 50% 50%, rgba(212,168,83,0.08) 0%, transparent 70%)',
        }}
      />

      {/* Blue edge glows */}
      <div
        className="absolute top-0 left-0 w-[400px] h-[400px] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse, rgba(26,95,160,0.10) 0%, transparent 70%)',
          filter: 'blur(70px)',
        }}
      />
      <div
        className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse, rgba(26,95,160,0.10) 0%, transparent 70%)',
          filter: 'blur(70px)',
        }}
      />

      <div className="relative max-w-3xl mx-auto text-center flex flex-col items-center gap-8">
        {/* Eyebrow with decorative lines */}
        <div className="flex items-center gap-4">
          <div
            className="h-px w-16 md:w-24"
            style={{ background: 'linear-gradient(90deg, transparent, rgba(212,168,83,0.4))' }}
          />
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-gold/22 bg-gold/8 backdrop-blur-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse-soft" />
            <span className="text-gold text-[11px] font-semibold tracking-[0.12em] uppercase">
              Comece Agora
            </span>
          </div>
          <div
            className="h-px w-16 md:w-24"
            style={{ background: 'linear-gradient(90deg, rgba(212,168,83,0.4), transparent)' }}
          />
        </div>

        {/* Heading */}
        <h2 className="text-4xl md:text-5xl lg:text-[56px] font-black text-white leading-[1.06] tracking-[-0.025em]">
          Pronto para <span className="text-gold-gradient">decolar?</span>
        </h2>

        {/* Subtitle */}
        <p className="text-white/52 text-[17px] leading-relaxed font-light max-w-xl">
          Fale com nossos especialistas e transforme suas milhas em uma viagem inesquecível ainda hoje.
        </p>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mt-2">
          <Link href="/atendimento">
            <motion.button
              className="btn-shimmer cta-glow flex items-center gap-2.5 px-8 py-3.5 rounded-full text-[14px] font-semibold text-sky-deep"
              style={{
                background: 'linear-gradient(135deg, #D4A853 0%, #ECC96A 50%, #E8824A 100%)',
              }}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            >
              <Ticket size={16} strokeWidth={2} />
              Emitir Passagem
              <ArrowRight size={15} strokeWidth={2} />
            </motion.button>
          </Link>

          <Link href="/atendimento">
            <motion.button
              className="flex items-center gap-2.5 px-8 py-3.5 rounded-full text-[14px] font-semibold text-white/80 hover:text-white border border-white/15 hover:border-gold/30 bg-white/[0.04] backdrop-blur-sm transition-colors duration-200"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            >
              <Phone size={15} strokeWidth={2} />
              Falar com Especialista
            </motion.button>
          </Link>
        </div>
      </div>
    </section>
  )
}

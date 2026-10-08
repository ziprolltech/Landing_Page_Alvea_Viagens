'use client'

import { useCallback, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { Banknote, Target, CheckCircle2, ArrowRight, Star } from 'lucide-react'
import GlassCard from '@/components/ui/GlassCard'
import SellMilesModal from '@/components/milhas/SellMilesModal'
import ManagementModal from '@/components/milhas/ManagementModal'

type ModalId = 'venda' | 'gestao'

const SERVICES: {
  id:       ModalId
  icon:     typeof Banknote
  title:    string
  desc:     string
  features: string[]
  cta:      string
}[] = [
  {
    id:    'venda',
    icon:  Banknote,
    title: 'Venda de Milhas',
    desc:  'Tem milhas acumuladas e quer transformá-las em dinheiro? Envie suas informações e nossa equipe avaliará sua oferta.',
    features: [
      'Avaliação da sua quantidade de milhas',
      'Análise do programa de fidelidade',
      'Processo simples e acompanhado pela equipe',
      'Negociação diretamente com a Alvea',
    ],
    cta: 'Vender Minhas Milhas',
  },
  {
    id:    'gestao',
    icon:  Target,
    title: 'Gestão de Milhas',
    desc:  'Você acumula pontos e milhas, mas não sabe qual é a melhor estratégia para aproveitar tudo isso? A Alvea pode analisar seu perfil, seus objetivos e seus programas para orientar as melhores decisões.',
    features: [
      'Estratégia personalizada',
      'Orientação de acordo com seus objetivos',
      'Análise dos seus programas e pontos',
      'Estratégias para viajar, acumular, vender ou aproveitar melhor suas milhas',
      'Acompanhamento especializado',
    ],
    cta: 'Conhecer a Gestão',
  },
]

const EASE = [0.22, 1, 0.36, 1] as const
const GOLD_GRADIENT = 'linear-gradient(135deg, #D4A853 0%, #ECC96A 50%, #E8824A 100%)'

export default function MilhasPage() {
  const reduce = useReducedMotion() ?? false
  const [openModal, setOpenModal] = useState<ModalId | null>(null)
  const closeModal = useCallback(() => setOpenModal(null), [])

  /* Reduced motion: no travel — only short fades remain */
  const rise = (distance: number) => (reduce ? 0 : distance)

  const container = {
    hidden: {},
    show:   { transition: { staggerChildren: reduce ? 0.05 : 0.13, delayChildren: 0.12 } },
  }
  const item = {
    hidden: { opacity: 0, y: rise(22) },
    show:   { opacity: 1, y: 0, transition: { duration: reduce ? 0.3 : 0.75, ease: EASE } },
  }

  return (
    <main className="relative min-h-screen pt-28 pb-24 px-6 overflow-hidden">
      {/* Ambient orbs */}
      <div
        className="absolute top-20 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse, rgba(26,95,160,0.09) 0%, transparent 70%)',
          filter: 'blur(70px)',
        }}
        aria-hidden="true"
      />
      <div
        className="absolute bottom-60 left-0 w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse, rgba(212,168,83,0.05) 0%, transparent 70%)',
          filter: 'blur(65px)',
        }}
        aria-hidden="true"
      />

      <motion.div
        className="relative max-w-6xl mx-auto"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {/* ── Header: badge → headline → subheadline ── */}
        <header className="text-center flex flex-col items-center gap-5 max-w-3xl mx-auto mb-14">
          <motion.div
            variants={item}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-gold/25 bg-gold/10 backdrop-blur-sm"
          >
            <Star size={11} className="text-gold fill-gold" aria-hidden="true" />
            <span className="text-gold text-[11px] font-semibold tracking-[0.12em] uppercase">Milhas</span>
            <Star size={11} className="text-gold fill-gold" aria-hidden="true" />
          </motion.div>

          <motion.h1
            variants={item}
            className="text-4xl md:text-5xl lg:text-[58px] font-black text-white leading-[1.06] tracking-[-0.025em]"
          >
            Maximize o valor <span className="text-gold-gradient">das suas milhas</span>
          </motion.h1>

          <motion.p variants={item} className="text-white/60 text-[17px] leading-relaxed font-light">
            Estratégias inteligentes para transformar suas milhas em mais oportunidades.
          </motion.p>
        </header>

        {/* ── Two services, equal weight ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {SERVICES.map((service) => {
            const Icon = service.icon
            return (
              <motion.div key={service.id} variants={item} className="h-full">
                <GlassCard hover={!reduce} className="p-7 sm:p-9 h-full flex flex-col gap-6 border-gold/20">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-gold/15">
                    <Icon size={26} className="text-gold" strokeWidth={1.8} aria-hidden="true" />
                  </div>

                  <div className="flex flex-col gap-2.5">
                    <h2 className="text-white text-[24px] font-bold">{service.title}</h2>
                    <p className="text-white/60 text-[15px] leading-relaxed">{service.desc}</p>
                  </div>

                  <ul className="flex flex-col gap-3">
                    {service.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2.5">
                        <CheckCircle2 size={16} className="text-gold/70 shrink-0 mt-[3px]" strokeWidth={2} aria-hidden="true" />
                        <span className="text-white/70 text-[14px] leading-snug">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <motion.button
                    type="button"
                    onClick={() => setOpenModal(service.id)}
                    aria-haspopup="dialog"
                    className="btn-shimmer mt-auto flex min-h-[50px] w-full items-center justify-center gap-2 rounded-full px-6 text-[14px] font-semibold text-sky-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
                    style={{ background: GOLD_GRADIENT }}
                    whileHover={reduce ? undefined : { scale: 1.03, y: -1 }}
                    whileTap={reduce ? undefined : { scale: 0.97 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 22 }}
                  >
                    {service.cta}
                    <ArrowRight size={15} strokeWidth={2.2} aria-hidden="true" />
                  </motion.button>
                </GlassCard>
              </motion.div>
            )
          })}
        </div>
      </motion.div>

      {/* ── Questionnaires ── */}
      <AnimatePresence>
        {openModal === 'venda'  && <SellMilesModal  key="venda"  onClose={closeModal} />}
        {openModal === 'gestao' && <ManagementModal key="gestao" onClose={closeModal} />}
      </AnimatePresence>
    </main>
  )
}

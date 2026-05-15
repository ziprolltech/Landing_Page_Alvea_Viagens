'use client'
import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { Award, TrendingUp, Users, ShieldCheck } from 'lucide-react'
import GlassCard from '@/components/ui/GlassCard'

const BENEFITS = [
  {
    icon: Award,
    title: 'Especialistas em Milhas',
    desc: 'Time dedicado com anos de experiência no mercado de milhas aéreas e emissão de passagens.',
  },
  {
    icon: TrendingUp,
    title: 'Melhor Custo-Benefício',
    desc: 'Negociações exclusivas garantem o máximo valor para cada milha, economizando até 70%.',
  },
  {
    icon: Users,
    title: 'Atendimento Humanizado',
    desc: 'Cada viagem é única. Nossos especialistas oferecem atenção personalizada do início ao fim.',
  },
  {
    icon: ShieldCheck,
    title: '100% Seguro e Garantido',
    desc: 'Todas as transações são verificadas e garantidas pela nossa equipe.',
  },
]

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
}

export default function Benefits() {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-80px 0px' })

  return (
    <section className="relative py-24 lg:py-32 px-6 bg-sky-abyss overflow-hidden">
      {/* Ambient orbs */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse, rgba(26,95,160,0.08) 0%, transparent 70%)',
          filter: 'blur(60px)',
        }}
      />
      <div
        className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse, rgba(212,168,83,0.05) 0%, transparent 70%)',
          filter: 'blur(55px)',
        }}
      />

      <div className="relative max-w-7xl mx-auto">
        {/* Section heading */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-gold/22 bg-gold/8 backdrop-blur-sm mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse-soft" />
            <span className="text-gold text-[11px] font-semibold tracking-[0.12em] uppercase">
              Nossos Diferenciais
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-white leading-[1.08] tracking-[-0.02em]">
            Por que escolher a <span className="text-gold-gradient">Alvea?</span>
          </h2>
        </div>

        {/* Cards grid */}
        <motion.div
          ref={ref}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
        >
          {BENEFITS.map((benefit) => {
            const Icon = benefit.icon
            return (
              <motion.div key={benefit.title} variants={itemVariants}>
                <GlassCard className="p-8 flex gap-6 items-start h-full">
                  {/* Icon */}
                  <div className="shrink-0 w-12 h-12 rounded-xl flex items-center justify-center bg-gold/15">
                    <Icon size={24} className="text-white" strokeWidth={1.8} />
                  </div>
                  {/* Text */}
                  <div className="flex flex-col gap-2">
                    <h3 className="text-white text-[17px] font-bold">{benefit.title}</h3>
                    <p className="text-white/52 text-[14px] leading-relaxed">{benefit.desc}</p>
                  </div>
                </GlassCard>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}

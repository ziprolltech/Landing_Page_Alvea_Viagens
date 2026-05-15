'use client'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Coins, Banknote, Users, BarChart3, CheckCircle2, ArrowRight } from 'lucide-react'
import PageHeader from '@/components/ui/PageHeader'
import SectionReveal from '@/components/ui/SectionReveal'
import GlassCard from '@/components/ui/GlassCard'

const SERVICES = [
  {
    icon: Coins,
    iconBg: 'bg-gold/15',
    title: 'Compra de Milhas',
    desc: 'Adquira milhas com as melhores taxas do mercado para emitir suas passagens com máximo custo-benefício.',
    features: ['Programas LATAM Pass', 'Smiles Gol', 'TudoAzul', 'Outros programas'],
    cta: 'Comprar Milhas',
    accent: 'border-gold/20',
  },
  {
    icon: Banknote,
    iconBg: 'bg-sky-bright/15',
    title: 'Venda de Milhas',
    desc: 'Converta suas milhas acumuladas em dinheiro com segurança, agilidade e as melhores taxas do mercado.',
    features: ['Avaliação gratuita', 'Pagamento em 24h', 'Processo 100% seguro', 'Suporte completo'],
    cta: 'Vender Milhas',
    accent: 'border-sky-bright/20',
  },
  {
    icon: Users,
    iconBg: 'bg-gold/12',
    title: 'Consultoria Especializada',
    desc: 'Nossos especialistas analisam seu perfil e definem a estratégia de milhas ideal para seus objetivos.',
    features: ['Análise gratuita do perfil', 'Plano personalizado', 'Acompanhamento contínuo', 'Resultados comprovados'],
    cta: 'Agendar Consultoria',
    accent: 'border-gold/20',
  },
  {
    icon: BarChart3,
    iconBg: 'bg-sky-bright/12',
    title: 'Estratégias Inteligentes',
    desc: 'Planejamento avançado para maximizar o rendimento dos seus programas de milhas e fidelidade.',
    features: ['Acúmulo estratégico', 'Resgate otimizado', 'Múltiplos programas', 'Atualização constante'],
    cta: 'Conhecer Estratégias',
    accent: 'border-sky-bright/20',
  },
]

const STATS = [
  { value: '100k+', label: 'Milhas negociadas' },
  { value: 'R$5M+', label: 'em economia gerada' },
  { value: '98%',   label: 'satisfação dos clientes' },
]

export default function MilhasPage() {
  return (
    <main className="relative min-h-screen pt-28 pb-24 px-6">
      {/* Ambient orbs */}
      <div
        className="absolute top-20 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse, rgba(26,95,160,0.09) 0%, transparent 70%)',
          filter: 'blur(70px)',
        }}
      />
      <div
        className="absolute bottom-60 left-0 w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse, rgba(212,168,83,0.05) 0%, transparent 70%)',
          filter: 'blur(65px)',
        }}
      />

      <div className="max-w-7xl mx-auto">
        {/* Page header */}
        <SectionReveal className="mb-16">
          <PageHeader
            tag="Milhas"
            title={
              <>
                Maximize o valor{' '}
                <span className="text-gold-gradient">das suas milhas</span>
              </>
            }
            subtitle="Estratégias personalizadas para cada perfil de viajante."
          />
        </SectionReveal>

        {/* Service cards */}
        <SectionReveal delay={0.1}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {SERVICES.map((service) => {
              const Icon = service.icon
              return (
                <GlassCard key={service.title} className={`p-8 flex flex-col gap-6 border ${service.accent}`}>
                  {/* Icon */}
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${service.iconBg}`}>
                    <Icon size={26} className="text-white" strokeWidth={1.7} />
                  </div>

                  {/* Title + desc */}
                  <div className="flex flex-col gap-2">
                    <h3 className="text-white text-[22px] font-bold">{service.title}</h3>
                    <p className="text-white/55 text-[15px] leading-relaxed">{service.desc}</p>
                  </div>

                  {/* Features */}
                  <ul className="flex flex-col gap-2.5">
                    {service.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2.5">
                        <CheckCircle2 size={15} className="text-gold/60 shrink-0" strokeWidth={2} />
                        <span className="text-white/60 text-[14px]">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  <Link href="/atendimento" className="mt-auto">
                    <motion.button
                      className="btn-shimmer flex items-center justify-center gap-2 w-full py-3 rounded-full text-[13.5px] font-semibold text-sky-deep"
                      style={{ background: 'linear-gradient(135deg, #D4A853 0%, #ECC96A 50%, #E8824A 100%)' }}
                      whileHover={{ scale: 1.03, y: -1 }}
                      whileTap={{ scale: 0.97 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                    >
                      {service.cta}
                      <ArrowRight size={14} strokeWidth={2.2} />
                    </motion.button>
                  </Link>
                </GlassCard>
              )
            })}
          </div>
        </SectionReveal>

        {/* Stats section */}
        <SectionReveal delay={0.15} className="mt-14">
          <div
            className="rounded-2xl border border-white/8 p-8 md:p-10"
            style={{ background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(12px)' }}
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-4 divide-y md:divide-y-0 md:divide-x divide-white/8">
              {STATS.map((stat) => (
                <div key={stat.label} className="flex flex-col items-center gap-2 text-center pt-6 md:pt-0 first:pt-0">
                  <span className="text-gold text-4xl font-black tracking-tight">{stat.value}</span>
                  <span className="text-white/45 text-[14px]">{stat.label}</span>
                </div>
              ))}
            </div>
          </div>
        </SectionReveal>

        {/* Final CTA */}
        <SectionReveal delay={0.18} className="mt-14 text-center">
          <Link href="/atendimento">
            <motion.button
              className="btn-shimmer cta-glow inline-flex items-center gap-2.5 px-10 py-3.5 rounded-full text-[14px] font-semibold text-sky-deep"
              style={{ background: 'linear-gradient(135deg, #D4A853 0%, #ECC96A 50%, #E8824A 100%)' }}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            >
              Fale com um especialista
              <ArrowRight size={15} />
            </motion.button>
          </Link>
        </SectionReveal>
      </div>
    </main>
  )
}

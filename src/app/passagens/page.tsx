'use client'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Plane, Globe, Star, Crown, Tag, Zap, MapPin, Calendar, CheckCircle2, ArrowRight } from 'lucide-react'
import PageHeader from '@/components/ui/PageHeader'
import SectionReveal from '@/components/ui/SectionReveal'
import GlassCard from '@/components/ui/GlassCard'

const SERVICES = [
  {
    icon: Plane,
    title: 'Passagens Nacionais',
    desc: 'Voos para qualquer destino do Brasil com as melhores estratégias de emissão por milhas.',
  },
  {
    icon: Globe,
    title: 'Passagens Internacionais',
    desc: 'Acesso aos melhores destinos internacionais com condições exclusivas e suporte especializado.',
  },
  {
    icon: Star,
    title: 'Classe Executiva',
    desc: 'Viaje em grande estilo com assentos executivos emitidos com milhas a preços imbatíveis.',
  },
  {
    icon: Crown,
    title: 'Primeira Classe',
    desc: 'A experiência máxima em aviação com serviço premium de ponta a ponta, emitida com milhas.',
  },
  {
    icon: Tag,
    title: 'Ofertas Exclusivas',
    desc: 'Promoções únicas e oportunidades especiais para viagens planejadas com antecedência.',
  },
  {
    icon: Zap,
    title: 'Emissões Estratégicas',
    desc: 'Emissão planejada para maximizar benefícios e reduzir o custo de cada viagem ao mínimo.',
  },
]

const TRUST_ITEMS = [
  'Sem filas ou ligações',
  'Resposta em até 2h',
  'Emissão confirmada',
  'Suporte pós-emissão',
]

export default function PassagensPage() {
  return (
    <main className="relative min-h-screen pt-28 pb-24 px-6">
      {/* Ambient orbs */}
      <div
        className="absolute top-20 right-1/4 w-[600px] h-[400px] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse, rgba(26,95,160,0.08) 0%, transparent 70%)',
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
            tag="Passagens"
            title={
              <>
                Emissões inteligentes{' '}
                <span className="text-gold-gradient">para viajar melhor</span>
              </>
            }
            subtitle="Passagens nacionais e internacionais com as melhores estratégias de milhas."
          />
        </SectionReveal>

        {/* Visual search panel */}
        <SectionReveal delay={0.08}>
          <div
            className="rounded-2xl border border-white/10 p-6 md:p-8 mb-14"
            style={{ background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(16px)' }}
          >
            <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center">
              {/* Origin */}
              <div className="flex-1 flex items-center gap-3 px-4 py-3.5 rounded-xl border border-white/10 bg-white/[0.04]">
                <MapPin size={16} className="text-white/30 shrink-0" />
                <span className="text-white/30 text-[14px]">Origem</span>
              </div>

              {/* Destination */}
              <div className="flex-1 flex items-center gap-3 px-4 py-3.5 rounded-xl border border-white/10 bg-white/[0.04]">
                <MapPin size={16} className="text-white/30 shrink-0" />
                <span className="text-white/30 text-[14px]">Destino</span>
              </div>

              {/* Date */}
              <div className="flex-1 flex items-center gap-3 px-4 py-3.5 rounded-xl border border-white/10 bg-white/[0.04]">
                <Calendar size={16} className="text-white/30 shrink-0" />
                <span className="text-white/30 text-[14px]">Data</span>
              </div>

              {/* Button */}
              <Link href="/atendimento">
                <motion.button
                  className="btn-shimmer flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl text-[14px] font-semibold text-sky-deep whitespace-nowrap"
                  style={{ background: 'linear-gradient(135deg, #D4A853 0%, #ECC96A 50%, #E8824A 100%)' }}
                  whileHover={{ scale: 1.04, y: -1 }}
                  whileTap={{ scale: 0.97 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                >
                  Consultar
                </motion.button>
              </Link>
            </div>
            <p className="text-white/25 text-[12px] text-center mt-4">
              Pesquisa realizada por especialistas humanos, não robôs.
            </p>
          </div>
        </SectionReveal>

        {/* Service cards */}
        <SectionReveal delay={0.12}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {SERVICES.map((service) => {
              const Icon = service.icon
              return (
                <GlassCard key={service.title} className="p-6 flex flex-col gap-4">
                  {/* Icon */}
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center bg-gold/12">
                    <Icon size={20} className="text-white" strokeWidth={1.8} />
                  </div>
                  <h3 className="text-white text-[18px] font-bold">{service.title}</h3>
                  <p className="text-white/55 text-[14px] leading-relaxed">{service.desc}</p>
                </GlassCard>
              )
            })}
          </div>
        </SectionReveal>

        {/* Trust strip */}
        <SectionReveal delay={0.15} className="mt-10">
          <div
            className="rounded-2xl border border-white/8 px-6 py-5"
            style={{ background: 'rgba(255,255,255,0.02)', backdropFilter: 'blur(8px)' }}
          >
            <div className="flex flex-wrap gap-4 md:gap-8 justify-center">
              {TRUST_ITEMS.map((item) => (
                <div key={item} className="flex items-center gap-2">
                  <CheckCircle2 size={15} className="text-gold/60 shrink-0" strokeWidth={2} />
                  <span className="text-white/55 text-[14px]">{item}</span>
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
              Emitir minha passagem agora
              <ArrowRight size={15} />
            </motion.button>
          </Link>
        </SectionReveal>
      </div>
    </main>
  )
}

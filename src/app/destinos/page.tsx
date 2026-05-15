'use client'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import PageHeader from '@/components/ui/PageHeader'
import SectionReveal from '@/components/ui/SectionReveal'

const DESTINATIONS = [
  {
    name: 'Paris',
    country: 'França',
    desc: 'A cidade mais romântica do mundo',
    miles: '45.000',
    photo: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=800&q=80',
    color: 'from-indigo-900 to-purple-900',
  },
  {
    name: 'Dubai',
    country: 'Emirados Árabes',
    desc: 'Luxo e modernidade sem limites',
    miles: '60.000',
    photo: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=800&q=80',
    color: 'from-amber-900 to-orange-900',
  },
  {
    name: 'Orlando',
    country: 'Estados Unidos',
    desc: 'Magia e aventura para a família',
    miles: '40.000',
    photo: 'https://images.unsplash.com/photo-1575089976121-8ed7b2a54265?auto=format&fit=crop&w=800&q=80',
    color: 'from-sky-900 to-blue-900',
  },
  {
    name: 'Lisboa',
    country: 'Portugal',
    desc: 'Charme europeu à beira do Atlântico',
    miles: '38.000',
    photo: 'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?auto=format&fit=crop&w=800&q=80',
    color: 'from-orange-900 to-rose-900',
  },
  {
    name: 'Maldivas',
    country: 'República das Maldivas',
    desc: 'Paraíso de águas cristalinas',
    miles: '75.000',
    photo: 'https://images.unsplash.com/photo-1573843981267-be1999ff37cd?auto=format&fit=crop&w=800&q=80',
    color: 'from-teal-900 to-cyan-900',
  },
  {
    name: 'Nova York',
    country: 'Estados Unidos',
    desc: 'A cidade que nunca dorme',
    miles: '42.000',
    photo: 'https://images.unsplash.com/photo-1485871981521-5b1fd3805eee?auto=format&fit=crop&w=800&q=80',
    color: 'from-slate-900 to-blue-900',
  },
  {
    name: 'Roma',
    country: 'Itália',
    desc: 'Eternidade em cada monumento',
    miles: '44.000',
    photo: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=800&q=80',
    color: 'from-stone-900 to-amber-900',
  },
  {
    name: 'Cancún',
    country: 'México',
    desc: 'Mar caribenho e cultura milenar',
    miles: '35.000',
    photo: 'https://images.unsplash.com/photo-1552074284-5e88ef1aef18?auto=format&fit=crop&w=800&q=80',
    color: 'from-emerald-900 to-teal-900',
  },
]

function DestinationCard({ dest }: { dest: typeof DESTINATIONS[0] }) {
  return (
    <motion.div
      className="group relative overflow-hidden rounded-2xl cursor-pointer"
      style={{ aspectRatio: '4/3' }}
      whileHover={{ scale: 1.03 }}
      transition={{ type: 'spring', stiffness: 300, damping: 22 }}
    >
      {/* Gradient fallback */}
      <div className={`absolute inset-0 bg-gradient-to-br ${dest.color}`} />

      {/* Photo */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={dest.photo}
        alt={dest.name}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
      />

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />

      {/* Gold corner glow on hover */}
      <div
        className="absolute top-0 right-0 w-36 h-36 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at top right, rgba(212,168,83,0.25) 0%, transparent 70%)',
        }}
      />

      {/* Bottom content */}
      <div className="absolute bottom-0 left-0 right-0 p-5 flex flex-col gap-1.5">
        <span className="text-gold text-[10px] font-semibold tracking-widest uppercase">
          {dest.country}
        </span>
        <h3 className="text-white text-[20px] font-black leading-tight">{dest.name}</h3>
        <p className="text-white/65 text-[12px]">{dest.desc}</p>

        {/* Miles + arrow (visible on hover) */}
        <div className="flex items-center justify-between mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 translate-y-2 group-hover:translate-y-0">
          <span className="text-white/70 text-[12px]">
            A partir de <span className="text-gold font-semibold">{dest.miles} milhas</span>
          </span>
          <ArrowRight size={16} className="text-gold" />
        </div>
      </div>
    </motion.div>
  )
}

export default function DestinosPage() {
  return (
    <main className="relative min-h-screen pt-28 pb-24 px-6">
      {/* Ambient orbs */}
      <div
        className="absolute top-20 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse, rgba(26,95,160,0.08) 0%, transparent 70%)',
          filter: 'blur(70px)',
        }}
      />
      <div
        className="absolute bottom-40 right-0 w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse, rgba(212,168,83,0.05) 0%, transparent 70%)',
          filter: 'blur(65px)',
        }}
      />

      <div className="max-w-7xl mx-auto">
        {/* Page header */}
        <SectionReveal className="mb-16">
          <PageHeader
            tag="Destinos"
            title={
              <>
                Descubra destinos{' '}
                <span className="text-gold-gradient">extraordinários</span>
              </>
            }
            subtitle="Viaje para os lugares mais desejados do mundo com condições exclusivas."
          />
        </SectionReveal>

        {/* Destination cards grid */}
        <SectionReveal delay={0.1}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {DESTINATIONS.map((dest) => (
              <DestinationCard key={dest.name} dest={dest} />
            ))}
          </div>
        </SectionReveal>

        {/* Bottom CTA */}
        <SectionReveal delay={0.15} className="mt-16 text-center">
          <p className="text-white/42 text-[15px] mb-6">
            Não encontrou o destino que procura? Podemos ajudá-lo a chegar a qualquer lugar do mundo.
          </p>
          <Link href="/atendimento">
            <motion.button
              className="btn-shimmer cta-glow inline-flex items-center gap-2.5 px-10 py-3.5 rounded-full text-[14px] font-semibold text-sky-deep"
              style={{ background: 'linear-gradient(135deg, #D4A853 0%, #ECC96A 50%, #E8824A 100%)' }}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            >
              Consultar disponibilidade
              <ArrowRight size={15} />
            </motion.button>
          </Link>
        </SectionReveal>
      </div>
    </main>
  )
}

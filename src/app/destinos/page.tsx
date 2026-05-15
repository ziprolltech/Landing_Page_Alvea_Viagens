'use client'

import { useState, useRef } from 'react'
import { motion, AnimatePresence, useInView } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import PageHeader   from '@/components/ui/PageHeader'
import SectionReveal from '@/components/ui/SectionReveal'
import BookingModal  from '@/components/booking/BookingModal'

/* ── Types ─────────────────────────────────────────────────────────────── */
type Destination = {
  name:    string
  country: string
  desc:    string
  miles:   string
  photo:   string
  color:   string
}

type Continent = {
  name:         string
  cols:         string
  destinations: Destination[]
}

/* ── All destinations organised by continent ───────────────────────────── */
const CONTINENTS: Continent[] = [
  {
    name: 'Europa',
    cols: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
    destinations: [
      {
        name: 'Paris', country: 'França',
        desc: 'A cidade mais romântica do mundo', miles: '45.000',
        photo: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1400&q=90',
        color: 'from-indigo-900 to-purple-900',
      },
      {
        name: 'Roma', country: 'Itália',
        desc: 'Eternidade em cada monumento', miles: '44.000',
        photo: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=1400&q=90',
        color: 'from-stone-900 to-amber-900',
      },
      {
        name: 'Lisboa', country: 'Portugal',
        desc: 'Charme europeu à beira do Atlântico', miles: '38.000',
        photo: 'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?auto=format&fit=crop&w=1400&q=90',
        color: 'from-orange-900 to-rose-900',
      },
      {
        name: 'Londres', country: 'Reino Unido',
        desc: 'Tradição e modernidade lado a lado', miles: '46.000',
        photo: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=1400&q=90',
        color: 'from-slate-900 to-blue-900',
      },
      {
        name: 'Santorini', country: 'Grécia',
        desc: 'O pôr do sol mais famoso do mundo', miles: '50.000',
        photo: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=1400&q=90',
        color: 'from-blue-900 to-cyan-900',
      },
      {
        name: 'Barcelona', country: 'Espanha',
        desc: 'Arte, arquitetura e vida mediterrânea', miles: '43.000',
        photo: 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?auto=format&fit=crop&w=1400&q=90',
        color: 'from-yellow-900 to-red-900',
      },
      {
        name: 'Amsterdã', country: 'Holanda',
        desc: 'Canais, tulipas e cultura vibrante', miles: '47.000',
        photo: 'https://images.unsplash.com/photo-1512470876302-972faa2aa9a4?auto=format&fit=crop&w=1400&q=90',
        color: 'from-teal-900 to-green-900',
      },
      {
        name: 'Veneza', country: 'Itália',
        desc: 'A cidade mais única do planeta', miles: '45.000',
        photo: 'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?auto=format&fit=crop&w=1400&q=90',
        color: 'from-cyan-900 to-blue-900',
      },
    ],
  },
  {
    name: 'América',
    cols: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
    destinations: [
      {
        name: 'Nova York', country: 'Estados Unidos',
        desc: 'A cidade que nunca dorme', miles: '42.000',
        photo: 'https://images.unsplash.com/photo-1490644658840-3f2e3f8c5625?auto=format&fit=crop&w=1400&q=90',
        color: 'from-slate-900 to-blue-900',
      },
      {
        name: 'Orlando', country: 'Estados Unidos',
        desc: 'Magia e aventura para a família', miles: '40.000',
        photo: 'https://images.unsplash.com/photo-1575089976121-8ed7b2a54265?auto=format&fit=crop&w=1400&q=90',
        color: 'from-sky-900 to-blue-900',
      },
      {
        name: 'Cancún', country: 'México',
        desc: 'Mar caribenho e cultura milenar', miles: '35.000',
        photo: 'https://images.unsplash.com/photo-1552074284-5e88ef1aef18?auto=format&fit=crop&w=1400&q=90',
        color: 'from-emerald-900 to-teal-900',
      },
      {
        name: 'Toronto', country: 'Canadá',
        desc: 'Cosmopolita, diversa e acolhedora', miles: '44.000',
        photo: 'https://images.unsplash.com/photo-1517090186835-e348b621c9ca?auto=format&fit=crop&w=1400&q=90',
        color: 'from-sky-900 to-slate-900',
      },
      {
        name: 'Buenos Aires', country: 'Argentina',
        desc: 'O Paris da América do Sul', miles: '30.000',
        photo: 'https://images.unsplash.com/photo-1589909202802-8f4aadce1849?auto=format&fit=crop&w=1400&q=90',
        color: 'from-rose-900 to-blue-900',
      },
      {
        name: 'Punta Cana', country: 'República Dominicana',
        desc: 'Praias paradisíacas do Caribe', miles: '32.000',
        photo: 'https://images.unsplash.com/photo-1504701954957-2010ec3bcec1?auto=format&fit=crop&w=1400&q=90',
        color: 'from-teal-900 to-sky-900',
      },
      {
        name: 'Los Angeles', country: 'Estados Unidos',
        desc: 'Sol, cultura e entretenimento', miles: '42.000',
        photo: 'https://images.unsplash.com/photo-1580655653885-65763b2597d0?auto=format&fit=crop&w=1400&q=90',
        color: 'from-orange-900 to-red-900',
      },
      {
        name: 'Miami', country: 'Estados Unidos',
        desc: 'Praias, arte e vida noturna', miles: '38.000',
        photo: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1400&q=90',
        color: 'from-cyan-900 to-blue-900',
      },
    ],
  },
  {
    name: 'Ásia',
    cols: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    destinations: [
      {
        name: 'Tóquio', country: 'Japão',
        desc: 'Tradição milenar e tecnologia do futuro', miles: '80.000',
        photo: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=1400&q=90',
        color: 'from-rose-900 to-slate-900',
      },
      {
        name: 'Bangkok', country: 'Tailândia',
        desc: 'Templos dourados e sabores únicos', miles: '70.000',
        photo: 'https://images.unsplash.com/photo-1508009603885-50cf7c8dd0d5?auto=format&fit=crop&w=1400&q=90',
        color: 'from-amber-900 to-orange-900',
      },
      {
        name: 'Singapura', country: 'Singapura',
        desc: 'O futuro existe e está aqui', miles: '75.000',
        photo: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&w=1400&q=90',
        color: 'from-blue-900 to-teal-900',
      },
      {
        name: 'Bali', country: 'Indonésia',
        desc: 'A ilha dos deuses e da serenidade', miles: '68.000',
        photo: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1400&q=90',
        color: 'from-emerald-900 to-green-900',
      },
      {
        name: 'Seul', country: 'Coreia do Sul',
        desc: 'Modernidade, K-culture e gastronomia', miles: '78.000',
        photo: 'https://images.unsplash.com/photo-1517154421773-0855edd8b96a?auto=format&fit=crop&w=1400&q=90',
        color: 'from-purple-900 to-blue-900',
      },
      {
        name: 'Maldivas', country: 'República das Maldivas',
        desc: 'Paraíso de águas cristalinas', miles: '75.000',
        photo: 'https://images.unsplash.com/photo-1573843981267-be1999ff37cd?auto=format&fit=crop&w=1400&q=90',
        color: 'from-teal-900 to-cyan-900',
      },
    ],
  },
  {
    name: 'Oriente Médio',
    cols: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    destinations: [
      {
        name: 'Dubai', country: 'Emirados Árabes Unidos',
        desc: 'Luxo e modernidade sem limites', miles: '60.000',
        photo: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1400&q=90',
        color: 'from-amber-900 to-orange-900',
      },
      {
        name: 'Doha', country: 'Qatar',
        desc: 'A pérola do Golfo Pérsico', miles: '62.000',
        photo: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=1400&q=90',
        color: 'from-sky-900 to-blue-900',
      },
      {
        name: 'Abu Dhabi', country: 'Emirados Árabes Unidos',
        desc: 'Grandiosidade, arte e cultura árabe', miles: '62.000',
        photo: 'https://images.unsplash.com/photo-1534308143481-c55f00be8bd7?auto=format&fit=crop&w=1400&q=90',
        color: 'from-amber-900 to-yellow-900',
      },
    ],
  },
  {
    name: 'Oceania',
    cols: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    destinations: [
      {
        name: 'Sydney', country: 'Austrália',
        desc: 'Opera House, praias e vida ao ar livre', miles: '90.000',
        photo: 'https://images.unsplash.com/photo-1506374322094-6021fc3926f1?auto=format&fit=crop&w=1400&q=90',
        color: 'from-sky-900 to-blue-900',
      },
      {
        name: 'Melbourne', country: 'Austrália',
        desc: 'Cultura, gastronomia e arte urbana', miles: '90.000',
        photo: 'https://images.unsplash.com/photo-1514395462421-8292ba098e95?auto=format&fit=crop&w=1400&q=90',
        color: 'from-purple-900 to-blue-900',
      },
      {
        name: 'Auckland', country: 'Nova Zelândia',
        desc: 'Natureza deslumbrante e hospitalidade', miles: '95.000',
        photo: 'https://images.unsplash.com/photo-1507699622108-4be3abd695ad?auto=format&fit=crop&w=1400&q=90',
        color: 'from-teal-900 to-slate-900',
      },
    ],
  },
]

/* ── Destination card ───────────────────────────────────────────────────── */
function DestinationCard({ dest, onOpen }: { dest: Destination; onOpen: () => void }) {
  return (
    <motion.div
      className="group relative overflow-hidden rounded-2xl cursor-pointer"
      style={{ aspectRatio: '4/3' }}
      whileHover={{ scale: 1.03 }}
      transition={{ type: 'spring', stiffness: 300, damping: 22 }}
      onClick={onOpen}
    >
      {/* Gradient fallback */}
      <div className={`absolute inset-0 bg-gradient-to-br ${dest.color}`} />

      {/* Photo */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={dest.photo}
        alt={dest.name}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        loading="lazy"
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

/* ── Continent section header ───────────────────────────────────────────── */
function ContinentHeader({ name, count }: { name: string; count: number }) {
  return (
    <div className="flex flex-col gap-2.5 mb-10">
      <h2 className="text-[38px] md:text-[50px] lg:text-[58px] font-black text-white tracking-[-0.025em] leading-none">
        {name}
      </h2>
      <div className="flex items-center gap-4">
        <div
          className="h-[2px] w-14 rounded-full shrink-0"
          style={{ background: 'linear-gradient(90deg, #D4A853, rgba(212,168,83,0))' }}
        />
        <span className="text-white/30 text-[11.5px] font-medium tracking-[0.14em] uppercase">
          {count} destino{count !== 1 ? 's' : ''}
        </span>
      </div>
    </div>
  )
}

/* ── Animation variants ─────────────────────────────────────────────────── */
const gridVariants = {
  hidden: {},
  show:   { transition: { staggerChildren: 0.07, delayChildren: 0.12 } },
}

const cardVariants = {
  hidden: { opacity: 0, y: 24, filter: 'blur(2px)' },
  show:   { opacity: 1, y: 0,  filter: 'blur(0px)', transition: { duration: 0.62, ease: [0.22, 1, 0.36, 1] } },
}

const headerVariants = {
  hidden: { opacity: 0, y: 18 },
  show:   { opacity: 1, y: 0,  transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] } },
}

/* ── Continent section ──────────────────────────────────────────────────── */
function ContinentSection({
  continent, onOpen,
}: {
  continent: Continent
  onOpen: (dest: Destination) => void
}) {
  const ref      = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-60px 0px' })

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? 'show' : 'hidden'}
    >
      <motion.div variants={headerVariants}>
        <ContinentHeader name={continent.name} count={continent.destinations.length} />
      </motion.div>

      <motion.div
        className={`grid ${continent.cols} gap-5`}
        variants={gridVariants}
      >
        {continent.destinations.map((dest) => (
          <motion.div key={dest.name} variants={cardVariants}>
            <DestinationCard dest={dest} onOpen={() => onOpen(dest)} />
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  )
}

/* ── Continent divider ──────────────────────────────────────────────────── */
function ContinentDivider() {
  return (
    <div className="flex items-center gap-5 my-20 lg:my-28">
      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/8 to-transparent" />
      <div className="flex items-center gap-1.5">
        <div className="w-1 h-1 rounded-full bg-gold/25" />
        <div className="w-1.5 h-1.5 rounded-full bg-gold/40" />
        <div className="w-1 h-1 rounded-full bg-gold/25" />
      </div>
      <div className="flex-1 h-px bg-gradient-to-l from-transparent via-white/8 to-transparent" />
    </div>
  )
}

/* ── Page ───────────────────────────────────────────────────────────────── */
export default function DestinosPage() {
  const [selectedDest, setSelectedDest] = useState<Destination | null>(null)

  return (
    <>
      <main className="relative min-h-screen pt-28 pb-24 px-6">

        {/* Ambient orbs */}
        <div
          className="absolute top-20 left-1/2 -translate-x-1/2 w-[900px] h-[400px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(ellipse, rgba(26,95,160,0.07) 0%, transparent 70%)', filter: 'blur(70px)' }}
        />
        <div
          className="absolute top-[60%] right-0 w-[500px] h-[600px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(ellipse, rgba(212,168,83,0.045) 0%, transparent 70%)', filter: 'blur(70px)' }}
        />
        <div
          className="absolute top-[120%] left-0 w-[500px] h-[500px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(ellipse, rgba(26,95,160,0.06) 0%, transparent 70%)', filter: 'blur(65px)' }}
        />

        <div className="max-w-7xl mx-auto">

          {/* Page header */}
          <SectionReveal className="mb-20">
            <PageHeader
              tag="Destinos"
              title={<>Descubra destinos <span className="text-gold-gradient">extraordinários</span></>}
              subtitle="Viaje para os lugares mais desejados do mundo com condições exclusivas."
            />
          </SectionReveal>

          {/* Continent sections */}
          {CONTINENTS.map((continent, index) => (
            <div key={continent.name}>
              <ContinentSection continent={continent} onOpen={setSelectedDest} />
              {index < CONTINENTS.length - 1 && <ContinentDivider />}
            </div>
          ))}

          {/* Bottom CTA */}
          <SectionReveal delay={0.1} className="mt-24 text-center">
            <p className="text-white/38 text-[15px] mb-6">
              Não encontrou o destino que procura?{' '}
              <span className="text-white/55">Podemos levá-lo a qualquer lugar do mundo.</span>
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

      {/* Booking modal — rendered outside main to sit above everything */}
      <AnimatePresence>
        {selectedDest && (
          <BookingModal
            key="booking-modal"
            destination={selectedDest}
            onClose={() => setSelectedDest(null)}
          />
        )}
      </AnimatePresence>
    </>
  )
}

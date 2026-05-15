'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X, Calendar, Users, Plane, ChevronRight, ChevronLeft,
  MessageCircle, Clock,
} from 'lucide-react'

/* ── Types ─────────────────────────────────────────────────────────────── */

export type DestinationForModal = {
  name:    string
  country: string
  photo:   string
  miles:   string
  color:   string
}

interface BookingModalProps {
  destination: DestinationForModal
  onClose:     () => void
}

type BookingState = {
  departureDate: string
  returnDate:    string
  passengers:    string
  flightClass:   string
}

/* ── Static data ────────────────────────────────────────────────────────── */

const PASSENGERS = [
  { value: '1',       label: '1 passageiro',  sub: 'Viagem solo'        },
  { value: '2',       label: '2 passageiros', sub: 'Casal ou dupla'    },
  { value: 'familia', label: 'Família',        sub: '3 ou mais pessoas' },
  { value: 'grupo',   label: 'Grupo',          sub: '6+ passageiros'   },
]

const CLASSES = [
  { value: 'economica',         label: 'Econômica',         sub: 'Melhor custo-benefício'     },
  { value: 'economica-premium', label: 'Econômica Premium', sub: 'Mais espaço e conforto'     },
  { value: 'executiva',         label: 'Executiva',         sub: 'Poltronas reclináveis'      },
  { value: 'primeira-classe',   label: 'Primeira Classe',   sub: 'Experiência incomparável'   },
]

const MOCK_FLIGHTS = [
  {
    airline:  'LATAM Airlines',
    code:     'LA',
    depart:   '11:30',
    arrive:   '06:15',
    stops:    '1 escala',
    duration: '12h 45min',
    price:    'R$ 4.280',
    miles:    '~32.000 milhas',
    saving:   '35%',
  },
  {
    airline:  'TAP Air Portugal',
    code:     'TP',
    depart:   '14:10',
    arrive:   '08:55',
    stops:    '1 escala',
    duration: '13h 20min',
    price:    'R$ 3.950',
    miles:    '~28.000 milhas',
    saving:   '40%',
  },
]

const TOTAL_STEPS = 4

/* ── Animation variants ─────────────────────────────────────────────────── */

const overlayAnim = {
  hidden: { opacity: 0 },
  show:   { opacity: 1, transition: { duration: 0.28 } },
  exit:   { opacity: 0, transition: { duration: 0.22 } },
}

const modalAnim = {
  hidden: { opacity: 0, scale: 0.94, y: 28 },
  show:   { opacity: 1, scale: 1,    y: 0,  transition: { duration: 0.42, ease: [0.22, 1, 0.36, 1] } },
  exit:   { opacity: 0, scale: 0.96, y: 14, transition: { duration: 0.22 } },
}

const stepAnim = {
  enter:  (dir: number) => ({ opacity: 0, x: dir > 0 ? 28 : -28, filter: 'blur(3px)' }),
  center: { opacity: 1, x: 0, filter: 'blur(0px)', transition: { duration: 0.32, ease: [0.22, 1, 0.36, 1] } },
  exit:   (dir: number) => ({ opacity: 0, x: dir > 0 ? -28 : 28, filter: 'blur(3px)', transition: { duration: 0.22 } }),
}

const INPUT_CLASS = [
  'w-full bg-white/[0.06] border border-white/[0.12]',
  'rounded-xl px-4 py-3.5 text-white placeholder-white/30',
  'focus:outline-none focus:border-gold/40 focus:bg-white/[0.09]',
  'transition-all duration-200 text-[15px]',
].join(' ')

/* ── Helpers ────────────────────────────────────────────────────────────── */

function today() {
  return new Date().toISOString().split('T')[0]
}

/* ── Main component ─────────────────────────────────────────────────────── */

export default function BookingModal({ destination, onClose }: BookingModalProps) {
  const [step,      setStep]      = useState(1)
  const [dir,       setDir]       = useState(1)
  const [booking,   setBooking]   = useState<BookingState>({
    departureDate: '',
    returnDate:    '',
    passengers:    '',
    flightClass:   '',
  })
  const [searching, setSearching] = useState(false)

  /* Lock body scroll while open */
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  /* Clean up search timeout if modal unmounts early */
  useEffect(() => {
    let t: ReturnType<typeof setTimeout> | undefined
    if (searching) {
      t = setTimeout(() => {
        setSearching(false)
        setDir(1)
        setStep(5)
      }, 1800)
    }
    return () => clearTimeout(t)
  }, [searching])

  const activeKey = searching ? 'searching' : `step${step}`

  const canProceed =
    step === 1 ? !!booking.departureDate :
    step === 2 ? !!booking.returnDate    :
    step === 3 ? !!booking.passengers    :
    step === 4 ? !!booking.flightClass   : true

  function next() {
    if (!canProceed) return
    if (step === TOTAL_STEPS) { setSearching(true); return }
    setDir(1)
    setStep(s => s + 1)
  }

  function back() {
    setDir(-1)
    setStep(s => s - 1)
  }

  function set<K extends keyof BookingState>(key: K, val: string) {
    setBooking(b => ({ ...b, [key]: val }))
  }

  const paxLabel   = PASSENGERS.find(p => p.value === booking.passengers)?.label ?? ''
  const classLabel = CLASSES.find(c => c.value === booking.flightClass)?.label ?? ''

  const waMessage = encodeURIComponent(
    `Olá! Quero viajar para *${destination.name}*.\n` +
    `• Ida: ${booking.departureDate}\n` +
    `• Volta: ${booking.returnDate}\n` +
    `• Passageiros: ${paxLabel}\n` +
    `• Classe: ${classLabel}\n\n` +
    `Gostaria de saber as melhores opções com milhas!`
  )
  const waHref = `https://wa.me/5511999999999?text=${waMessage}`

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4"
      style={{
        backdropFilter:         'blur(24px)',
        WebkitBackdropFilter:   'blur(24px)',
        background:             'rgba(5,13,26,0.88)',
      }}
      variants={overlayAnim}
      initial="hidden"
      animate="show"
      exit="exit"
      onClick={onClose}
    >
      <motion.div
        className="relative w-full sm:max-w-[500px] overflow-hidden rounded-t-3xl sm:rounded-3xl"
        style={{
          background:           'rgba(7,16,34,0.97)',
          backdropFilter:       'blur(48px)',
          WebkitBackdropFilter: 'blur(48px)',
          border:               '1px solid rgba(212,168,83,0.18)',
          boxShadow:            '0 48px 140px rgba(0,0,0,0.85), 0 0 0 1px rgba(212,168,83,0.05) inset',
          maxHeight:            '92vh',
        }}
        variants={modalAnim}
        initial="hidden"
        animate="show"
        exit="exit"
        onClick={e => e.stopPropagation()}
      >

        {/* ── Hero image ── */}
        <div className="relative h-44 sm:h-52 overflow-hidden shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={destination.photo}
            alt={destination.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-transparent to-[#07101E]/98" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center transition-transform duration-150 hover:scale-105"
            style={{ background: 'rgba(0,0,0,0.55)', border: '1px solid rgba(255,255,255,0.16)' }}
          >
            <X size={15} className="text-white" />
          </button>

          {/* Destination info */}
          <div className="absolute bottom-4 left-5 right-5 flex items-end justify-between">
            <div>
              <p
                className="text-[10px] font-semibold tracking-widest uppercase"
                style={{ color: '#D4A853' }}
              >
                {destination.country}
              </p>
              <h2 className="text-white text-[22px] font-black leading-tight">{destination.name}</h2>
            </div>
            <div
              className="px-2.5 py-1 rounded-full text-[11px] font-semibold shrink-0 mb-0.5"
              style={{
                background: 'rgba(212,168,83,0.14)',
                border:     '1px solid rgba(212,168,83,0.28)',
                color:      '#D4A853',
              }}
            >
              {destination.miles} milhas
            </div>
          </div>
        </div>

        {/* ── Progress bar ── */}
        {step <= TOTAL_STEPS && (
          <div className="px-5 pt-4 flex gap-1.5 shrink-0">
            {Array.from({ length: TOTAL_STEPS }, (_, i) => (
              <div
                key={i}
                className="flex-1 h-[3px] rounded-full overflow-hidden"
                style={{ background: 'rgba(255,255,255,0.07)' }}
              >
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: 'linear-gradient(90deg, #D4A853, #ECC96A)' }}
                  animate={{ width: i < step ? '100%' : '0%' }}
                  transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
                />
              </div>
            ))}
          </div>
        )}

        {/* ── Scrollable step content ── */}
        <div className="overflow-y-auto" style={{ maxHeight: 'calc(92vh - 13rem)' }}>
          <AnimatePresence mode="wait" custom={dir}>
            <motion.div
              key={activeKey}
              custom={dir}
              variants={stepAnim}
              initial="enter"
              animate="center"
              exit="exit"
              className="px-5 pt-4 pb-2"
            >

              {/* Step 1 — Departure date */}
              {activeKey === 'step1' && (
                <StepShell step={1} icon={<Calendar size={13} />} title="Data de ida" sub="Quando você pretende partir?">
                  <input
                    type="date"
                    value={booking.departureDate}
                    min={today()}
                    onChange={e => set('departureDate', e.target.value)}
                    className={INPUT_CLASS}
                    style={{ colorScheme: 'dark' }}
                  />
                </StepShell>
              )}

              {/* Step 2 — Return date */}
              {activeKey === 'step2' && (
                <StepShell step={2} icon={<Calendar size={13} />} title="Data de volta" sub="Quando você pretende retornar?">
                  <input
                    type="date"
                    value={booking.returnDate}
                    min={booking.departureDate || today()}
                    onChange={e => set('returnDate', e.target.value)}
                    className={INPUT_CLASS}
                    style={{ colorScheme: 'dark' }}
                  />
                </StepShell>
              )}

              {/* Step 3 — Passengers */}
              {activeKey === 'step3' && (
                <StepShell step={3} icon={<Users size={13} />} title="Quantos passageiros irão?" sub="Selecione o número de viajantes">
                  <div className="grid grid-cols-2 gap-2.5">
                    {PASSENGERS.map(opt => (
                      <OptionBtn
                        key={opt.value}
                        label={opt.label}
                        sub={opt.sub}
                        selected={booking.passengers === opt.value}
                        onClick={() => set('passengers', opt.value)}
                      />
                    ))}
                  </div>
                </StepShell>
              )}

              {/* Step 4 — Flight class */}
              {activeKey === 'step4' && (
                <StepShell step={4} icon={<Plane size={13} />} title="Classe desejada" sub="Em qual classe você prefere viajar?">
                  <div className="flex flex-col gap-2.5">
                    {CLASSES.map(opt => (
                      <OptionBtn
                        key={opt.value}
                        label={opt.label}
                        sub={opt.sub}
                        selected={booking.flightClass === opt.value}
                        onClick={() => set('flightClass', opt.value)}
                        horizontal
                      />
                    ))}
                  </div>
                </StepShell>
              )}

              {/* Searching state */}
              {activeKey === 'searching' && (
                <div className="py-14 flex flex-col items-center gap-5">
                  <div className="relative w-14 h-14">
                    <div
                      className="absolute inset-0 rounded-full"
                      style={{ border: '1.5px solid rgba(212,168,83,0.15)' }}
                    />
                    <motion.div
                      className="absolute inset-0 rounded-full"
                      style={{ border: '1.5px solid transparent', borderTopColor: '#D4A853' }}
                      animate={{ rotate: 360 }}
                      transition={{ duration: 0.9, repeat: Infinity, ease: 'linear' }}
                    />
                    <Plane
                      size={20}
                      className="absolute inset-0 m-auto"
                      style={{ color: '#D4A853' }}
                      strokeWidth={1.5}
                    />
                  </div>
                  <div className="text-center">
                    <p className="text-white font-semibold text-[16px] mb-1.5">Buscando disponibilidade…</p>
                    <p className="text-white/40 text-[13px]">Analisando as melhores rotas</p>
                  </div>
                </div>
              )}

              {/* Step 5 — Results placeholder */}
              {activeKey === 'step5' && (
                <div className="pb-2">
                  <div className="mb-5">
                    <p className="text-white/40 text-[10.5px] font-medium tracking-widest uppercase mb-1">
                      Resultados para
                    </p>
                    <h3 className="text-white font-bold text-[18px] mb-0.5">
                      {destination.name} — Ida e volta
                    </h3>
                    <p className="text-white/35 text-[12px] leading-relaxed">
                      {booking.departureDate} → {booking.returnDate}
                      {paxLabel    && ` · ${paxLabel}`}
                      {classLabel  && ` · ${classLabel}`}
                    </p>
                  </div>

                  <div className="flex flex-col gap-3.5 mb-5">
                    {MOCK_FLIGHTS.map((f, i) => (
                      <FlightCard key={i} flight={f} waHref={waHref} />
                    ))}
                  </div>

                  {/* Mileage advantage banner */}
                  <div
                    className="rounded-2xl p-4 text-center mb-4"
                    style={{
                      background: 'linear-gradient(135deg, rgba(212,168,83,0.09), rgba(232,130,74,0.06))',
                      border:     '1px solid rgba(212,168,83,0.18)',
                    }}
                  >
                    <p
                      className="text-[11px] font-semibold tracking-widest uppercase mb-1.5"
                      style={{ color: '#D4A853' }}
                    >
                      Vantagem Alvea Viagens
                    </p>
                    <p className="text-white text-[13.5px] leading-relaxed">
                      A emissão estratégica com milhas pode reduzir seu custo em até{' '}
                      <span className="font-bold" style={{ color: '#D4A853' }}>60%</span>
                    </p>
                    <p className="text-white/35 text-[12px] mt-1.5">
                      Consulte nosso especialista para a melhor emissão
                    </p>
                  </div>
                </div>
              )}

            </motion.div>
          </AnimatePresence>
        </div>

        {/* ── Footer CTA ── */}
        {!searching && (
          <div
            className="px-5 pb-5 pt-3 shrink-0"
            style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
          >
            {step === 5 ? (
              <a href={waHref} target="_blank" rel="noopener noreferrer">
                <motion.button
                  className="btn-shimmer cta-glow w-full flex items-center justify-center gap-2.5 py-3.5 rounded-full text-[14px] font-semibold"
                  style={{
                    background: 'linear-gradient(135deg, #D4A853 0%, #ECC96A 50%, #E8824A 100%)',
                    color:      '#050D1A',
                  }}
                  whileHover={{ scale: 1.02, y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                >
                  <MessageCircle size={15} strokeWidth={2} />
                  Falar no WhatsApp — Melhores preços
                </motion.button>
              </a>
            ) : (
              <div className="flex items-center gap-3">
                {step > 1 && step <= TOTAL_STEPS && (
                  <motion.button
                    className="w-11 h-11 rounded-full flex items-center justify-center shrink-0"
                    style={{
                      background: 'rgba(255,255,255,0.06)',
                      border:     '1px solid rgba(255,255,255,0.09)',
                    }}
                    onClick={back}
                    whileHover={{ scale: 1.06 }}
                    whileTap={{ scale: 0.94 }}
                  >
                    <ChevronLeft size={17} className="text-white/55" />
                  </motion.button>
                )}
                <motion.button
                  className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-full text-[14px] font-semibold"
                  style={{
                    background: canProceed
                      ? 'linear-gradient(135deg, #D4A853 0%, #ECC96A 50%, #E8824A 100%)'
                      : 'rgba(255,255,255,0.07)',
                    color:  canProceed ? '#050D1A' : 'rgba(255,255,255,0.28)',
                    cursor: canProceed ? 'pointer' : 'default',
                    transition: 'background 0.2s, color 0.2s',
                  }}
                  onClick={next}
                  whileHover={canProceed ? { scale: 1.02, y: -1 } : {}}
                  whileTap={canProceed ? { scale: 0.97 } : {}}
                  transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                >
                  {step === TOTAL_STEPS ? (
                    <><Plane size={14} strokeWidth={2} /> Buscar disponibilidade</>
                  ) : (
                    <>Continuar <ChevronRight size={14} /></>
                  )}
                </motion.button>
              </div>
            )}
          </div>
        )}
      </motion.div>
    </motion.div>
  )
}

/* ── Sub-components ─────────────────────────────────────────────────────── */

function StepShell({
  step, icon, title, sub, children,
}: {
  step: number
  icon: React.ReactNode
  title: string
  sub: string
  children: React.ReactNode
}) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-1.5">
        <div
          className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: 'rgba(212,168,83,0.14)', border: '1px solid rgba(212,168,83,0.22)' }}
        >
          <span style={{ color: '#D4A853' }}>{icon}</span>
        </div>
        <h3 className="text-white font-bold text-[16.5px]">{title}</h3>
        <span className="ml-auto text-white/28 text-[12px] shrink-0">{step} / {TOTAL_STEPS}</span>
      </div>
      <p className="text-white/40 text-[13px] mb-4">{sub}</p>
      {children}
    </div>
  )
}

function OptionBtn({
  label, sub, selected, onClick, horizontal = false,
}: {
  label: string
  sub: string
  selected: boolean
  onClick: () => void
  horizontal?: boolean
}) {
  return (
    <motion.button
      className={`text-left rounded-xl px-4 py-3 ${horizontal ? 'flex items-center gap-3' : 'flex flex-col gap-0.5'}`}
      style={{
        background: selected ? 'rgba(212,168,83,0.11)' : 'rgba(255,255,255,0.04)',
        border:     `1px solid ${selected ? 'rgba(212,168,83,0.32)' : 'rgba(255,255,255,0.09)'}`,
        transition: 'background 0.15s, border-color 0.15s',
      }}
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
    >
      <span
        className="font-semibold text-[13.5px]"
        style={{ color: selected ? '#D4A853' : 'white' }}
      >
        {label}
      </span>
      <span className="text-white/38 text-[11.5px]">{sub}</span>
    </motion.button>
  )
}

function FlightCard({
  flight, waHref,
}: {
  flight: (typeof MOCK_FLIGHTS)[number]
  waHref: string
}) {
  return (
    <div
      className="rounded-2xl p-4"
      style={{ background: 'rgba(255,255,255,0.035)', border: '1px solid rgba(255,255,255,0.08)' }}
    >
      {/* Airline header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[11px] font-black"
            style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.65)' }}
          >
            {flight.code}
          </div>
          <span className="text-white/60 text-[13px] font-medium">{flight.airline}</span>
        </div>
        <div className="flex items-center gap-1 text-white/32 text-[11.5px]">
          <Clock size={10} />
          {flight.duration}
        </div>
      </div>

      {/* Flight path */}
      <div className="flex items-center gap-3 mb-3">
        <div className="text-center shrink-0">
          <p className="text-white font-bold text-[19px] leading-none">{flight.depart}</p>
          <p className="text-white/32 text-[10px] mt-0.5">GRU</p>
        </div>
        <div className="flex-1 flex flex-col items-center gap-1">
          <div className="w-full flex items-center gap-1.5">
            <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.10)' }} />
            <Plane size={11} style={{ color: 'rgba(212,168,83,0.55)' }} />
            <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.10)' }} />
          </div>
          <p className="text-white/28 text-[10px]">{flight.stops}</p>
        </div>
        <div className="text-center shrink-0">
          <p className="text-white font-bold text-[19px] leading-none">{flight.arrive}</p>
          <p className="text-white/32 text-[10px] mt-0.5">destino</p>
        </div>
      </div>

      {/* Price row */}
      <div
        className="flex items-center justify-between rounded-xl px-3 py-2.5 mb-3"
        style={{ background: 'rgba(212,168,83,0.07)', border: '1px solid rgba(212,168,83,0.11)' }}
      >
        <div>
          <p className="text-white/36 text-[10px] uppercase tracking-wide">Preço referência</p>
          <p className="text-white font-bold text-[16px]">{flight.price}</p>
        </div>
        <div className="text-right">
          <p className="text-white/36 text-[10px] uppercase tracking-wide">Vantagem em milhas</p>
          <p className="font-bold text-[13.5px]" style={{ color: '#D4A853' }}>{flight.miles}</p>
        </div>
      </div>

      {/* WhatsApp CTA per card */}
      <a href={waHref} target="_blank" rel="noopener noreferrer">
        <motion.button
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold"
          style={{
            background: 'rgba(37,211,102,0.10)',
            border:     '1px solid rgba(37,211,102,0.18)',
            color:      '#25D366',
          }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
        >
          <MessageCircle size={13} />
          Falar no WhatsApp
        </motion.button>
      </a>
    </div>
  )
}

'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X, Calendar, Users, Plane, ChevronRight, ChevronLeft,
  MessageCircle, AlertCircle, RefreshCw, MapPin, Check,
} from 'lucide-react'
import AirportAutocomplete from './AirportAutocomplete'
import FlightCard from './FlightCard'
import FlightFilters, { DEFAULT_FILTERS } from './FlightFilters'
import type { FilterState } from './FlightFilters'
import SelectedFlightBanner from './SelectedFlightBanner'
import TripSummary from './TripSummary'
import type { FlightOffer, FlightSlice, CabinClass } from '@/lib/types/flights'
import { buildWhatsAppUrl } from '@/lib/config/links'
import { buildTripRequestMessage } from '@/lib/destinos/whatsapp-message'

/* ── Public types ───────────────────────────────────────────────────────────── */

export type DestinationForModal = {
  name:     string
  country:  string
  photo:    string
  miles:    string
  color:    string
  iataCode: string
}

interface BookingModalProps {
  destination: DestinationForModal
  onClose:     () => void
}

/* ── Internal types ─────────────────────────────────────────────────────────── */

type BookingState = {
  originAirport: string
  departureDate: string
  returnDate:    string
  passengers:    string
  flightClass:   string
}

type FlightPhase = 'outbound' | 'return' | 'summary'

/* ── Static data ────────────────────────────────────────────────────────────── */

const PASSENGERS = [
  { value: '1',       label: '1 passageiro',  sub: 'Viagem solo'        },
  { value: '2',       label: '2 passageiros', sub: 'Casal ou dupla'    },
  { value: 'familia', label: 'Família',        sub: '3 ou mais pessoas' },
  { value: 'grupo',   label: 'Grupo',          sub: '6+ passageiros'   },
]

const CLASSES = [
  { value: 'economica',         label: 'Econômica',         sub: 'Melhor custo-benefício'   },
  { value: 'economica-premium', label: 'Econômica Premium', sub: 'Mais espaço e conforto'   },
  { value: 'executiva',         label: 'Executiva',         sub: 'Poltronas reclináveis'    },
  { value: 'primeira-classe',   label: 'Primeira Classe',   sub: 'Experiência incomparável' },
]

const PASSENGER_MAP: Record<string, { adults: number; children?: number }> = {
  '1':       { adults: 1 },
  '2':       { adults: 2 },
  'familia': { adults: 2, children: 2 },
  'grupo':   { adults: 6 },
}

const CABIN_MAP: Record<string, CabinClass> = {
  'economica':         'economy',
  'economica-premium': 'premium_economy',
  'executiva':         'business',
  'primeira-classe':   'first',
}

const TOTAL_STEPS = 5

/* Live flight search — temporarily OFF (2026-10).
   The prices returned by the current flight API differ too much from what
   customers find elsewhere, so for now the form ends in Alvea's WhatsApp with
   the request already written, and no flight API is called.

   Everything the search needs is still here and untouched: performSearch(),
   the results / return / summary phases below, /api/flights/search and the
   provider layer under src/lib. To bring the search back (with the same or a
   new provider), set this to true. */
const FLIGHT_SEARCH_ENABLED: boolean = false

/* ── Helpers ────────────────────────────────────────────────────────────────── */

function today() {
  return new Date().toISOString().split('T')[0]
}

function extractIata(label: string): string {
  const m = label.match(/\(([A-Z]{3})\)/)
  return m ? m[1] : label.trim().toUpperCase().slice(0, 3)
}

function fmtDate(iso: string): string {
  if (!iso) return ''
  const [y, mo, d] = iso.split('-')
  return `${d}/${mo}/${y}`
}

/* ── Flight-phase helper functions (pure, defined at module level) ───────────── */

function buildOutboundKey(o: FlightOffer): string {
  return `${o.airlineCode}|${o.flightNumber}|${o.departureTime}|${o.arrivalTime}`
}

function buildReturnKey(s: FlightSlice): string {
  return `${s.airlineCode}|${s.flightNumber}|${s.departureTime}|${s.arrivalTime}`
}

// Collapses offers to one per unique outbound flight, keeping cheapest combo price.
function getUniqueOutboundOffers(all: FlightOffer[]): FlightOffer[] {
  const seen = new Map<string, FlightOffer>()
  for (const o of all) {
    const key = buildOutboundKey(o)
    const ex  = seen.get(key)
    if (!ex || o.price < ex.price) seen.set(key, o)
  }
  return [...seen.values()]
}

// Returns all return-flight offers paired with the given outbound, one per unique return.
function getReturnOffersFor(all: FlightOffer[], selected: FlightOffer): FlightOffer[] {
  const obKey = buildOutboundKey(selected)
  const seen  = new Map<string, FlightOffer>()
  for (const o of all) {
    if (buildOutboundKey(o) !== obKey || !o.returnSlice) continue
    const key = buildReturnKey(o.returnSlice)
    const ex  = seen.get(key)
    if (!ex || o.price < ex.price) seen.set(key, o)
  }
  return [...seen.values()]
}

function applyFilters(list: FlightOffer[], f: FilterState, forReturn = false): FlightOffer[] {
  let r = list

  if (f.stops.length > 0) {
    r = r.filter(o => {
      const s = forReturn ? (o.returnSlice?.stops ?? 0) : o.stops
      return f.stops.some(n => n >= 2 ? s >= 2 : s === n)
    })
  }

  if (f.period.length > 0) {
    r = r.filter(o => {
      const dt   = forReturn ? (o.returnSlice?.departureTime ?? '') : o.departureTime
      const h    = parseInt((dt.split('T')[1] ?? '').split(':')[0] ?? '0', 10)
      const p    = h < 6 ? 'night' : h < 12 ? 'morning' : h < 18 ? 'afternoon' : 'evening'
      return f.period.includes(p as FilterState['period'][number])
    })
  }

  const sorted = [...r]
  switch (f.sort) {
    case 'price':
      sorted.sort((a, b) => a.price - b.price)
      break
    case 'duration':
      sorted.sort((a, b) => {
        const da = forReturn ? (a.returnSlice?.durationMinutes ?? 0) : a.durationMinutes
        const db = forReturn ? (b.returnSlice?.durationMinutes ?? 0) : b.durationMinutes
        return da - db
      })
      break
    case 'earliest':
      sorted.sort((a, b) => {
        const ta = forReturn ? (a.returnSlice?.departureTime ?? '') : a.departureTime
        const tb = forReturn ? (b.returnSlice?.departureTime ?? '') : b.departureTime
        return ta.localeCompare(tb)
      })
      break
    case 'latest':
      sorted.sort((a, b) => {
        const ta = forReturn ? (a.returnSlice?.departureTime ?? '') : a.departureTime
        const tb = forReturn ? (b.returnSlice?.departureTime ?? '') : b.departureTime
        return tb.localeCompare(ta)
      })
      break
  }
  return sorted
}

/* ── Animation variants ─────────────────────────────────────────────────────── */

const overlayAnim = {
  hidden: { opacity: 0 },
  show:   { opacity: 1, transition: { duration: 0.28 } },
  exit:   { opacity: 0, transition: { duration: 0.22 } },
}

const modalAnim = {
  hidden: { opacity: 0, scale: 0.93, y: 32 },
  show:   { opacity: 1, scale: 1,    y: 0,  transition: { duration: 0.44, ease: [0.22, 1, 0.36, 1] } },
  exit:   { opacity: 0, scale: 0.96, y: 16, transition: { duration: 0.22 } },
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

/* ── Main component ─────────────────────────────────────────────────────────── */

export default function BookingModal({ destination, onClose }: BookingModalProps) {
  const [step,      setStep]      = useState(1)
  const [dir,       setDir]       = useState(1)
  const [booking,   setBooking]   = useState<BookingState>({
    originAirport: '',
    departureDate: '',
    returnDate:    '',
    passengers:    '',
    flightClass:   '',
  })
  /* "Somente ida": the return date is not asked for */
  const [oneWay,         setOneWay]         = useState(false)
  const [searching,      setSearching]      = useState(false)
  const [offers,         setOffers]         = useState<FlightOffer[]>([])
  const [apiError,       setApiError]       = useState<string | null>(null)
  const [flightPhase,    setFlightPhase]    = useState<FlightPhase | null>(null)
  const [selectedOffer,  setSelectedOffer]  = useState<FlightOffer | null>(null)
  const [matchedOffer,   setMatchedOffer]   = useState<FlightOffer | null>(null)
  const [filters,        setFilters]        = useState<FilterState>(DEFAULT_FILTERS)

  const searchInProgress  = useRef(false)
  const lastSearchKey     = useRef('')
  const cachedOffers      = useRef<FlightOffer[]>([])
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  // Scroll the modal content area back to the top on forward phase transitions.
  useEffect(() => {
    if (flightPhase === 'return' || flightPhase === 'summary') {
      scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, [flightPhase])

  // Derived: activeKey drives AnimatePresence transitions
  const activeKey = searching ? 'searching' : flightPhase ?? `step${step}`

  const canProceed =
    step === 1 ? !!booking.originAirport :
    step === 2 ? !!booking.departureDate :
    step === 3 ? oneWay || !!booking.returnDate :
    step === 4 ? !!booking.passengers    :
    step === 5 ? !!booking.flightClass   : true

  const paxLabel   = PASSENGERS.find(p => p.value === booking.passengers)?.label ?? ''
  const classLabel = CLASSES.find(c => c.value === booking.flightClass)?.label ?? ''

  // ── Flight-phase derived lists (memoized) ──────────────────────────────────

  const uniqueOutbound = useMemo(() => getUniqueOutboundOffers(offers), [offers])

  const returnOffers = useMemo(
    () => selectedOffer ? getReturnOffersFor(offers, selectedOffer) : [],
    [offers, selectedOffer],
  )

  const filteredOutbound = useMemo(
    () => applyFilters(uniqueOutbound, filters, false),
    [uniqueOutbound, filters],
  )

  const filteredReturn = useMemo(
    () => applyFilters(returnOffers, filters, true),
    [returnOffers, filters],
  )

  // ── Search ─────────────────────────────────────────────────────────────────

  async function performSearch() {
    if (searchInProgress.current) return
    searchInProgress.current = true

    const originIata = extractIata(booking.originAirport)
    const pax        = PASSENGER_MAP[booking.passengers] ?? { adults: 1 }
    const cabin      = CABIN_MAP[booking.flightClass] ?? 'economy'
    const key        = [
      originIata,
      destination.iataCode,
      booking.departureDate,
      booking.returnDate,
      booking.passengers,
      booking.flightClass,
    ].join('|')

    if (key === lastSearchKey.current && cachedOffers.current.length > 0) {
      setOffers(cachedOffers.current)
      setApiError(null)
      setSearching(false)
      setDir(1)
      setFlightPhase('outbound')
      searchInProgress.current = false
      return
    }

    try {
      const res = await fetch('/api/flights/search', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          origin:        originIata,
          destination:   destination.iataCode,
          departureDate: booking.departureDate,
          returnDate:    booking.returnDate,
          adults:        pax.adults,
          ...(pax.children ? { children: pax.children } : {}),
          cabinClass:    cabin,
        }),
      })

      const data = await res.json() as { offers?: FlightOffer[]; message?: string }

      if (res.ok && data.offers) {
        cachedOffers.current  = data.offers
        lastSearchKey.current = key
        setOffers(data.offers)
        setApiError(null)
      } else {
        setApiError(data.message ?? 'Erro ao buscar voos. Tente novamente.')
        setOffers([])
      }
    } catch {
      setApiError('Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.')
      setOffers([])
    } finally {
      setSearching(false)
      setDir(1)
      setFlightPhase('outbound')
      searchInProgress.current = false
    }
  }

  // ── Form navigation ────────────────────────────────────────────────────────

  function next() {
    if (!canProceed) return
    if (step === TOTAL_STEPS) {
      if (FLIGHT_SEARCH_ENABLED) {
        setSearching(true)
        performSearch()
        return
      }
      requestByWhatsApp()
      return
    }
    setDir(1)
    setStep(s => s + 1)
  }

  /* Form → WhatsApp: opens Alvea's WhatsApp with the request written out.
     Nothing is sent: the visitor reviews the text and presses "Enviar" there. */
  function requestByWhatsApp() {
    /* "2 passageiros" reads as "2"; "Família" and "Grupo" keep their description */
    const pax = PASSENGERS.find(p => p.value === booking.passengers)
    const passengers = !pax ? '' : /^\d+$/.test(pax.value) ? pax.value : `${pax.label} (${pax.sub})`
    const message = buildTripRequestMessage({
      originLabel:     booking.originAirport,
      destinationName: destination.name,
      destinationIata: destination.iataCode,
      departureDate:   booking.departureDate,
      returnDate:      oneWay ? '' : booking.returnDate,
      oneWay,
      passengers,
      flightClass:     classLabel,
    })
    window.open(buildWhatsAppUrl(message), '_blank', 'noopener,noreferrer')
  }

  function back() {
    if (step <= 1) return
    setDir(-1)
    setStep(s => s - 1)
  }

  function retry() {
    lastSearchKey.current = ''
    setApiError(null)
    setOffers([])
    setSearching(true)
    performSearch()
  }

  function editSearch() {
    setApiError(null)
    setOffers([])
    setFlightPhase(null)
    setSelectedOffer(null)
    setMatchedOffer(null)
    setFilters(DEFAULT_FILTERS)
    setDir(-1)
    setStep(1)
  }

  /* Choosing "Somente ida" clears any return date already picked */
  function toggleOneWay() {
    if (!oneWay) setBooking(b => ({ ...b, returnDate: '' }))
    setOneWay(v => !v)
  }

  function set<K extends keyof BookingState>(key: K, val: string) {
    setBooking(b => ({ ...b, [key]: val }))
  }

  // ── Flight phase handlers ──────────────────────────────────────────────────

  function handleSelectOutbound(offer: FlightOffer) {
    setSelectedOffer(offer)
    setFilters(DEFAULT_FILTERS)
    setDir(1)
    setFlightPhase('return')
  }

  function handleSelectReturn(offer: FlightOffer) {
    setMatchedOffer(offer)
    setDir(1)
    setFlightPhase('summary')
  }

  function backToOutbound() {
    setFilters(DEFAULT_FILTERS)
    setDir(-1)
    setFlightPhase('outbound')
  }

  function backToReturn() {
    setMatchedOffer(null)
    setDir(-1)
    setFlightPhase('return')
  }

  // ── WhatsApp fallback (no offers / error state) ────────────────────────────

  const waFallback = encodeURIComponent(
    `Olá! Quero viajar para *${destination.name}*.\n` +
    `• Origem: ${booking.originAirport}\n` +
    `• Ida: ${booking.departureDate}\n` +
    `• Volta: ${booking.returnDate}\n` +
    `• Passageiros: ${paxLabel}\n` +
    `• Classe: ${classLabel}\n\n` +
    `Gostaria de saber as melhores opções com milhas!`
  )
  const waFallbackHref = `https://api.whatsapp.com/send?phone=5516997315748&text=${waFallback}`

  if (typeof document === 'undefined') return null

  const content = (
    <motion.div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{
        backdropFilter:       'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        background:           'rgba(5,13,26,0.90)',
      }}
      variants={overlayAnim}
      initial="hidden"
      animate="show"
      exit="exit"
      onClick={onClose}
    >
      <motion.div
        className="relative w-full sm:max-w-[500px] overflow-hidden rounded-3xl flex flex-col max-h-[95vh] sm:max-h-[92vh] supports-[height:100dvh]:max-h-[95dvh] supports-[height:100dvh]:sm:max-h-[92dvh]"
        style={{
          background:           'rgba(7,16,34,0.97)',
          backdropFilter:       'blur(48px)',
          WebkitBackdropFilter: 'blur(48px)',
          border:               '1px solid rgba(212,168,83,0.18)',
          boxShadow:            '0 48px 140px rgba(0,0,0,0.88), 0 0 0 1px rgba(212,168,83,0.05) inset',
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
          <img src={destination.photo} alt={destination.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-transparent to-[#07101E]/98" />

          <button
            onClick={onClose}
            aria-label="Fechar"
            className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center transition-transform duration-150 hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60"
            style={{ background: 'rgba(0,0,0,0.55)', border: '1px solid rgba(255,255,255,0.16)' }}
          >
            <X size={15} className="text-white" />
          </button>

          <div className="absolute bottom-4 left-5 right-5 flex items-end justify-between">
            <div>
              <p className="text-[10px] font-semibold tracking-widest uppercase" style={{ color: '#D4A853' }}>
                {destination.country}
              </p>
              <h2 className="text-white text-[22px] font-black leading-tight">{destination.name}</h2>
            </div>
            <div
              className="px-2.5 py-1 rounded-full text-[11px] font-semibold shrink-0 mb-0.5"
              style={{ background: 'rgba(212,168,83,0.14)', border: '1px solid rgba(212,168,83,0.28)', color: '#D4A853' }}
            >
              {destination.miles} milhas
            </div>
          </div>
        </div>

        {/* ── Progress bar (form steps only) ── */}
        {flightPhase === null && step <= TOTAL_STEPS && (
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

        {/* ── Phase label (outbound / return / summary) ── */}
        {flightPhase && flightPhase !== 'summary' && (
          <div className="px-5 pt-3 shrink-0">
            <p
              className="text-[9.5px] font-semibold tracking-[0.14em] uppercase"
              style={{ color: 'rgba(212,168,83,0.55)' }}
            >
              {flightPhase === 'outbound'
                ? 'Passo 1 de 2 — Selecione o voo de ida'
                : 'Passo 2 de 2 — Selecione o voo de volta'}
            </p>
          </div>
        )}

        {/* ── Sticky filter bar (outbound + return with results) ── */}
        {(activeKey === 'outbound' || activeKey === 'return') && !apiError && offers.length > 0 && (
          <div
            className="px-5 py-2 shrink-0"
            style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
          >
            <FlightFilters
              filters={filters}
              onChange={setFilters}
              resultCount={activeKey === 'outbound' ? filteredOutbound.length : filteredReturn.length}
            />
          </div>
        )}

        {/* ── Step / phase content ── */}
        <div ref={scrollContainerRef} className="overflow-y-auto flex-1 min-h-0">
          <AnimatePresence mode="wait" custom={dir}>
            <motion.div
              key={activeKey}
              custom={dir}
              variants={stepAnim}
              initial="enter"
              animate="center"
              exit="exit"
              className="px-5 pt-4 pb-4"
            >

              {/* ── Step 1 — Origin airport ── */}
              {activeKey === 'step1' && (
                <StepShell step={1} icon={<MapPin size={13} />} title="De onde você deseja sair?" sub="Digite sua cidade ou código de aeroporto">
                  <AirportAutocomplete
                    value={booking.originAirport}
                    onChange={val => set('originAirport', val)}
                  />
                  {booking.originAirport && (
                    <motion.p
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-[12px] mt-3 flex items-center gap-1.5"
                      style={{ color: '#D4A853' }}
                    >
                      <MapPin size={11} />
                      {booking.originAirport}
                    </motion.p>
                  )}
                </StepShell>
              )}

              {/* ── Step 2 — Departure date ── */}
              {activeKey === 'step2' && (
                <StepShell step={2} icon={<Calendar size={13} />} title="Data de ida" sub="Quando você pretende partir?">
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

              {/* ── Step 3 — Return date ── */}
              {activeKey === 'step3' && (
                <StepShell step={3} icon={<Calendar size={13} />} title="Data de volta" sub="Quando você pretende retornar?">
                  <input
                    type="date"
                    value={booking.returnDate}
                    min={booking.departureDate || today()}
                    onChange={e => set('returnDate', e.target.value)}
                    disabled={oneWay}
                    className={INPUT_CLASS}
                    style={{ colorScheme: 'dark', opacity: oneWay ? 0.35 : 1, cursor: oneWay ? 'not-allowed' : undefined }}
                  />

                  {/* One-way trip: no return date */}
                  <motion.button
                    type="button"
                    role="checkbox"
                    aria-checked={oneWay}
                    onClick={toggleOneWay}
                    className="mt-3 w-full flex items-center gap-3 text-left rounded-xl px-4 py-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/50"
                    style={{
                      background: oneWay ? 'rgba(212,168,83,0.11)' : 'rgba(255,255,255,0.04)',
                      border:     `1px solid ${oneWay ? 'rgba(212,168,83,0.32)' : 'rgba(255,255,255,0.09)'}`,
                      transition: 'background 0.15s, border-color 0.15s',
                    }}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span
                      className="w-[18px] h-[18px] rounded-md flex items-center justify-center shrink-0"
                      style={{
                        background: oneWay ? 'linear-gradient(135deg, #D4A853, #ECC96A)' : 'transparent',
                        border:     `1px solid ${oneWay ? 'rgba(212,168,83,0.9)' : 'rgba(255,255,255,0.28)'}`,
                        transition: 'background 0.15s, border-color 0.15s',
                      }}
                      aria-hidden="true"
                    >
                      {oneWay && <Check size={12} strokeWidth={3} style={{ color: '#050D1A' }} />}
                    </span>
                    <span className="font-semibold text-[13.5px]" style={{ color: oneWay ? '#D4A853' : 'white' }}>
                      Somente ida
                    </span>
                  </motion.button>
                </StepShell>
              )}

              {/* ── Step 4 — Passengers ── */}
              {activeKey === 'step4' && (
                <StepShell step={4} icon={<Users size={13} />} title="Quantos passageiros irão?" sub="Selecione o número de viajantes">
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

              {/* ── Step 5 — Flight class ── */}
              {activeKey === 'step5' && (
                <StepShell step={5} icon={<Plane size={13} />} title="Classe desejada" sub="Em qual classe você prefere viajar?">
                  <div className="flex flex-col gap-1.5 sm:gap-2.5">
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

              {/* ── Searching skeleton ── */}
              {activeKey === 'searching' && (
                <div className="pt-4 pb-3 flex flex-col items-center gap-6">
                  <div className="flex flex-col items-center gap-3.5 pt-2">
                    <div className="relative w-12 h-12">
                      <div
                        className="absolute inset-0 rounded-full"
                        style={{ border: '1.5px solid rgba(212,168,83,0.12)' }}
                      />
                      <motion.div
                        className="absolute inset-0 rounded-full"
                        style={{ border: '1.5px solid transparent', borderTopColor: '#D4A853' }}
                        animate={{ rotate: 360 }}
                        transition={{ duration: 0.85, repeat: Infinity, ease: 'linear' }}
                      />
                      <Plane
                        size={17}
                        className="absolute inset-0 m-auto"
                        style={{ color: '#D4A853' }}
                        strokeWidth={1.5}
                      />
                    </div>
                    <div className="text-center">
                      <p className="text-white font-semibold text-[15px] mb-1">Buscando os melhores voos…</p>
                      <p className="text-white/38 text-[12.5px]">Consultando disponibilidade em tempo real</p>
                    </div>
                  </div>
                  <div className="w-full flex flex-col gap-3.5">
                    {[0, 1, 2].map(i => <SkeletonCard key={i} delay={i * 0.18} />)}
                  </div>
                </div>
              )}

              {/* ── Outbound list ── */}
              {activeKey === 'outbound' && (
                <div className="pb-2">

                  {/* Search summary */}
                  <div className="mb-4">
                    {offers.length > 0 && !apiError ? (
                      <div className="flex items-baseline gap-2 flex-wrap">
                        <span className="text-white font-bold text-[18px] leading-tight">
                          {extractIata(booking.originAirport)}
                          <span className="text-white/30 font-normal mx-2">→</span>
                          {destination.iataCode}
                        </span>
                      </div>
                    ) : (
                      <p className="text-white font-bold text-[17px]">{destination.name}</p>
                    )}
                    <p className="text-white/28 text-[11.5px] mt-1">
                      {fmtDate(booking.departureDate)} – {fmtDate(booking.returnDate)}
                      {paxLabel && ` · ${paxLabel}`}
                      {classLabel && ` · ${classLabel}`}
                    </p>
                  </div>

                  {/* Error state */}
                  {apiError && (
                    <div
                      className="rounded-2xl p-5 mb-4"
                      style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.08)' }}
                    >
                      <div className="flex flex-col items-center text-center gap-3.5">
                        <div
                          className="rounded-full flex items-center justify-center"
                          style={{ background: 'rgba(212,168,83,0.10)', border: '1px solid rgba(212,168,83,0.20)', width: 52, height: 52 }}
                        >
                          <AlertCircle size={22} style={{ color: 'rgba(212,168,83,0.75)' }} strokeWidth={1.5} />
                        </div>
                        <div>
                          <p className="text-white font-semibold text-[15px] mb-1.5">Não foi possível buscar os voos</p>
                          <p className="text-white/45 text-[13px] leading-relaxed">{apiError}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Empty state */}
                  {!apiError && offers.length === 0 && (
                    <div className="py-4 text-center">
                      <div className="relative mx-auto mb-5" style={{ width: 80, height: 80 }}>
                        <div
                          className="absolute inset-0 rounded-full"
                          style={{ background: 'radial-gradient(circle, rgba(212,168,83,0.22), transparent 70%)', filter: 'blur(14px)' }}
                        />
                        <div
                          className="relative w-full h-full rounded-full flex items-center justify-center"
                          style={{ background: 'rgba(212,168,83,0.08)', border: '1px solid rgba(212,168,83,0.18)' }}
                        >
                          <Plane size={30} style={{ color: 'rgba(212,168,83,0.60)' }} strokeWidth={1.5} />
                        </div>
                      </div>
                      <p className="text-white font-bold text-[17px] mb-2">Nenhum voo disponível</p>
                      <p className="text-white/40 text-[13px] leading-relaxed mx-auto" style={{ maxWidth: 280 }}>
                        Não encontramos voos para essa rota e datas selecionadas.
                        Tente com datas alternativas ou fale com nosso especialista.
                      </p>
                    </div>
                  )}

                  {/* Outbound cards */}
                  {!apiError && filteredOutbound.length > 0 && (
                    <div className="flex flex-col gap-4">
                      {filteredOutbound.map((offer, i) => (
                        <FlightCard
                          key={offer.id}
                          airline={offer.airline}
                          airlineCode={offer.airlineCode}
                          airlineLogo={offer.airlineLogo}
                          flightNumber={offer.flightNumber}
                          origin={offer.origin}
                          destination={offer.destination}
                          departureTime={offer.departureTime}
                          arrivalTime={offer.arrivalTime}
                          departureDate={offer.departureDate}
                          arrivalDate={offer.arrivalDate}
                          duration={offer.duration}
                          stops={offer.stops}
                          price={offer.price}
                          currency={offer.currency}
                          priceSectionTitle="Viagem completa"
                          priceLabel="A partir de"
                          priceCaption="Valor total de ida e volta"
                          cabinLabel={classLabel}
                          ctaLabel="Selecionar voo de ida →"
                          onSelect={() => handleSelectOutbound(offer)}
                          index={i}
                        />
                      ))}
                    </div>
                  )}

                  {/* Filtered-to-empty state */}
                  {!apiError && offers.length > 0 && filteredOutbound.length === 0 && (
                    <div className="py-8 text-center">
                      <p className="text-white/50 text-[13.5px]">Nenhum voo corresponde aos filtros selecionados.</p>
                      <button
                        className="mt-3 text-[12px] underline"
                        style={{ color: 'rgba(212,168,83,0.70)' }}
                        onClick={() => setFilters(DEFAULT_FILTERS)}
                      >
                        Limpar filtros
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* ── Return list ── */}
              {activeKey === 'return' && selectedOffer && (
                <div className="pb-2">

                  {/* Selected outbound banner */}
                  <SelectedFlightBanner offer={selectedOffer} onClear={backToOutbound} />

                  {/* Section label */}
                  <div className="mb-4">
                    <div className="flex items-baseline gap-2">
                      <span className="text-white font-bold text-[18px] leading-tight">
                        {destination.iataCode}
                        <span className="text-white/30 font-normal mx-2">→</span>
                        {extractIata(booking.originAirport)}
                      </span>
                    </div>
                    <p className="text-white/28 text-[11.5px] mt-1">
                      {fmtDate(booking.returnDate)} · {paxLabel} · {classLabel}
                    </p>
                  </div>

                  {/* Return cards */}
                  {filteredReturn.length > 0 ? (
                    <div className="flex flex-col gap-4">
                      {filteredReturn.map((offer, i) => {
                        const ret = offer.returnSlice!
                        return (
                          <FlightCard
                            key={offer.id}
                            airline={ret.airline}
                            airlineCode={ret.airlineCode}
                            airlineLogo={ret.airlineLogo}
                            flightNumber={ret.flightNumber}
                            origin={ret.origin}
                            destination={ret.destination}
                            departureTime={ret.departureTime}
                            arrivalTime={ret.arrivalTime}
                            departureDate={ret.departureDate}
                            arrivalDate={ret.arrivalDate}
                            duration={ret.duration}
                            stops={ret.stops}
                            price={offer.price}
                            currency={offer.currency}
                            priceSectionTitle="Itinerário selecionado"
                            priceLabel="Valor total da viagem"
                            priceCaption="Valor total de ida e volta"
                            ctaLabel="Selecionar voo de volta →"
                            onSelect={() => handleSelectReturn(offer)}
                            index={i}
                          />
                        )
                      })}
                    </div>
                  ) : (
                    <div className="py-8 text-center">
                      <p className="text-white/50 text-[13.5px]">Nenhum voo de volta corresponde aos filtros.</p>
                      <button
                        className="mt-3 text-[12px] underline"
                        style={{ color: 'rgba(212,168,83,0.70)' }}
                        onClick={() => setFilters(DEFAULT_FILTERS)}
                      >
                        Limpar filtros
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* ── Trip summary ── */}
              {activeKey === 'summary' && matchedOffer && (
                <TripSummary
                  offer={matchedOffer}
                  paxLabel={paxLabel}
                  classLabel={classLabel}
                  originAirport={booking.originAirport}
                  destinationName={destination.name}
                />
              )}

            </motion.div>
          </AnimatePresence>
        </div>

        {/* ── Footer CTA ── */}
        {!searching && (
          <div className="px-5 pb-5 pt-3 shrink-0" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>

            {/* Flight-phase footers */}
            {flightPhase === 'outbound' && (
              apiError ? (
                <div className="flex items-center gap-3">
                  <motion.button
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-full text-[13.5px] font-semibold"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)', color: 'rgba(255,255,255,0.55)' }}
                    onClick={editSearch}
                    whileHover={{ scale: 1.02, backgroundColor: 'rgba(255,255,255,0.08)' }}
                    whileTap={{ scale: 0.97 }}
                    transition={{ duration: 0.18 }}
                  >
                    <ChevronLeft size={15} />
                    Editar pesquisa
                  </motion.button>
                  <motion.button
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-full text-[13.5px] font-semibold"
                    style={{ background: 'linear-gradient(135deg, #D4A853 0%, #ECC96A 50%, #E8824A 100%)', color: '#050D1A' }}
                    onClick={retry}
                    whileHover={{ scale: 1.02, y: -1 }}
                    whileTap={{ scale: 0.97 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                  >
                    <RefreshCw size={13} />
                    Tentar novamente
                  </motion.button>
                </div>
              ) : offers.length === 0 ? (
                <div className="flex items-center gap-3">
                  <motion.button
                    className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-full text-[13.5px] font-semibold"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)', color: 'rgba(255,255,255,0.55)' }}
                    onClick={editSearch}
                    whileHover={{ scale: 1.02, backgroundColor: 'rgba(255,255,255,0.08)' }}
                    whileTap={{ scale: 0.97 }}
                    transition={{ duration: 0.18 }}
                  >
                    <ChevronLeft size={15} />
                    Alterar pesquisa
                  </motion.button>
                  <a href={waFallbackHref} target="_blank" rel="noopener noreferrer" className="flex-1">
                    <motion.button
                      className="w-full flex items-center justify-center gap-2 py-3.5 rounded-full text-[13.5px] font-semibold"
                      style={{ background: 'linear-gradient(135deg, #D4A853 0%, #ECC96A 50%, #E8824A 100%)', color: '#050D1A' }}
                      whileHover={{ scale: 1.02, y: -1 }}
                      whileTap={{ scale: 0.98 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                    >
                      <MessageCircle size={14} strokeWidth={2} />
                      Falar com especialista
                    </motion.button>
                  </a>
                </div>
              ) : (
                <motion.button
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-full text-[13.5px] font-semibold"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)', color: 'rgba(255,255,255,0.50)' }}
                  onClick={editSearch}
                  whileHover={{ scale: 1.01, backgroundColor: 'rgba(255,255,255,0.07)' }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.18 }}
                >
                  <ChevronLeft size={15} />
                  Editar pesquisa
                </motion.button>
              )
            )}

            {flightPhase === 'return' && (
              <div className="flex items-center gap-3">
                <motion.button
                  className="w-11 h-11 rounded-full flex items-center justify-center shrink-0"
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.09)' }}
                  onClick={backToOutbound}
                  whileHover={{ scale: 1.06 }}
                  whileTap={{ scale: 0.94 }}
                >
                  <ChevronLeft size={17} className="text-white/55" />
                </motion.button>
                <motion.button
                  className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-full text-[13.5px] font-semibold"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)', color: 'rgba(255,255,255,0.50)' }}
                  onClick={editSearch}
                  whileHover={{ scale: 1.01, backgroundColor: 'rgba(255,255,255,0.07)' }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.18 }}
                >
                  Editar pesquisa
                </motion.button>
              </div>
            )}

            {flightPhase === 'summary' && (
              <motion.button
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-full text-[13.5px] font-semibold"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)', color: 'rgba(255,255,255,0.50)' }}
                onClick={backToReturn}
                whileHover={{ scale: 1.01, backgroundColor: 'rgba(255,255,255,0.07)' }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.18 }}
              >
                <ChevronLeft size={15} />
                Alterar voo de volta
              </motion.button>
            )}

            {/* Form steps footer */}
            {flightPhase === null && (
              <div className="flex items-center gap-3">
                {step > 1 && step <= TOTAL_STEPS && (
                  <motion.button
                    className="w-11 h-11 rounded-full flex items-center justify-center shrink-0"
                    style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.09)' }}
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
                    color:      canProceed ? '#050D1A' : 'rgba(255,255,255,0.28)',
                    cursor:     canProceed ? 'pointer' : 'default',
                    transition: 'background 0.2s, color 0.2s',
                  }}
                  onClick={next}
                  whileHover={canProceed ? { scale: 1.02, y: -1 } : {}}
                  whileTap={canProceed ? { scale: 0.97 } : {}}
                  transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                >
                  {step === TOTAL_STEPS
                    ? <><Plane size={14} strokeWidth={2} /> Solicitar pelo WhatsApp</>
                    : <>Continuar <ChevronRight size={14} /></>
                  }
                </motion.button>
              </div>
            )}

          </div>
        )}
      </motion.div>
    </motion.div>
  )

  return createPortal(content, document.body)
}

/* ── Sub-components ─────────────────────────────────────────────────────────── */

function StepShell({
  step, icon, title, sub, children,
}: {
  step:     number
  icon:     React.ReactNode
  title:    string
  sub:      string
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
  label:       string
  sub:         string
  selected:    boolean
  onClick:     () => void
  horizontal?: boolean
}) {
  return (
    <motion.button
      className={`text-left rounded-xl px-4 ${horizontal ? 'w-full py-2 sm:py-3 flex flex-col gap-0.5 sm:flex-row sm:items-center sm:gap-3' : 'py-3 flex flex-col gap-0.5'}`}
      style={{
        background: selected ? 'rgba(212,168,83,0.11)' : 'rgba(255,255,255,0.04)',
        border:     `1px solid ${selected ? 'rgba(212,168,83,0.32)' : 'rgba(255,255,255,0.09)'}`,
        transition: 'background 0.15s, border-color 0.15s',
      }}
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
    >
      <span className="font-semibold text-[13.5px]" style={{ color: selected ? '#D4A853' : 'white' }}>
        {label}
      </span>
      <span className="text-white/38 text-[11.5px]">{sub}</span>
    </motion.button>
  )
}

/* ── SkeletonCard ────────────────────────────────────────────────────────────── */

function SkeletonCard({ delay }: { delay: number }) {
  return (
    <div
      className="relative rounded-[20px] overflow-hidden p-5"
      style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)' }}
    >
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.055) 50%, transparent 100%)', zIndex: 1 }}
        initial={{ x: '-100%' }}
        animate={{ x: '200%' }}
        transition={{ duration: 1.8, repeat: Infinity, ease: 'linear', delay }}
      />
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl shrink-0" style={{ background: 'rgba(255,255,255,0.07)' }} />
          <div className="flex flex-col gap-2">
            <div className="h-3 w-28 rounded-full" style={{ background: 'rgba(255,255,255,0.07)' }} />
            <div className="h-2 w-16 rounded-full" style={{ background: 'rgba(255,255,255,0.04)' }} />
          </div>
        </div>
        <div className="h-6 w-20 rounded-full" style={{ background: 'rgba(255,255,255,0.05)' }} />
      </div>
      <div className="flex items-center gap-3 mb-2.5">
        <div className="h-[38px] w-[60px] rounded-lg shrink-0" style={{ background: 'rgba(255,255,255,0.07)' }} />
        <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.07)' }} />
        <div className="h-[38px] w-[60px] rounded-lg shrink-0" style={{ background: 'rgba(255,255,255,0.07)' }} />
      </div>
      <div className="flex justify-between mb-3">
        <div className="flex flex-col gap-1.5">
          <div className="h-2.5 w-10 rounded-full" style={{ background: 'rgba(255,255,255,0.04)' }} />
          <div className="h-2.5 w-8 rounded-full" style={{ background: 'rgba(255,255,255,0.05)' }} />
          <div className="h-2 w-14 rounded-full" style={{ background: 'rgba(255,255,255,0.03)' }} />
        </div>
        <div className="flex flex-col gap-1.5 items-end">
          <div className="h-2.5 w-10 rounded-full" style={{ background: 'rgba(255,255,255,0.04)' }} />
          <div className="h-2.5 w-8 rounded-full" style={{ background: 'rgba(255,255,255,0.05)' }} />
          <div className="h-2 w-14 rounded-full" style={{ background: 'rgba(255,255,255,0.03)' }} />
        </div>
      </div>
      <div className="flex justify-center mb-4">
        <div className="h-5 w-28 rounded-full" style={{ background: 'rgba(255,255,255,0.04)' }} />
      </div>
      <div
        className="rounded-2xl p-4 mb-4"
        style={{ background: 'rgba(212,168,83,0.04)', border: '1px solid rgba(212,168,83,0.08)' }}
      >
        <div className="h-2.5 w-16 rounded-full mb-2.5" style={{ background: 'rgba(255,255,255,0.05)' }} />
        <div className="h-8 w-32 rounded-lg mb-2" style={{ background: 'rgba(255,255,255,0.07)' }} />
        <div className="h-2.5 w-44 rounded-full" style={{ background: 'rgba(255,255,255,0.04)' }} />
      </div>
      <div className="h-11 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)' }} />
    </div>
  )
}

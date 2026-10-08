'use client'

import { motion } from 'framer-motion'
import { Clock, Plane } from 'lucide-react'
import { formatDuration } from '@/lib/utils/format-duration'
import { AIRPORTS } from '@/data/airports'

/* ── Props ────────────────────────────────────────────────────────────────── */

export interface FlightCardProps {
  // Flight identity
  airline:       string
  airlineCode:   string
  airlineLogo:   string | null
  flightNumber:  string
  // Route
  origin:        string
  destination:   string
  departureTime: string
  arrivalTime:   string
  departureDate: string  // YYYY-MM-DD
  arrivalDate:   string  // YYYY-MM-DD
  duration:      string  // raw ISO 8601
  stops:         number
  // Price (always total round-trip from Duffel)
  price:              number
  currency:           string
  priceSectionTitle?: string  // e.g. "VIAGEM COMPLETA" shown above priceLabel
  priceLabel?:        string  // defaults to "A partir de"
  priceCaption?:      string  // small muted line below price; defaults to "Preço total da viagem · sujeito à disponibilidade"
  // CTA
  cabinLabel?:   string
  ctaLabel:      string
  onSelect:      () => void
  // Animation
  index:         number
}

/* ── Helpers ──────────────────────────────────────────────────────────────── */

function extractTime(isoDatetime: string): string {
  return (isoDatetime.split('T')[1] ?? '').substring(0, 5)
}

const MONTHS_SHORT = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez']

function fmtDateShort(iso: string): string {
  if (!iso) return ''
  const [, mo, d] = iso.split('-')
  return `${parseInt(d, 10)} ${MONTHS_SHORT[parseInt(mo, 10) - 1] ?? ''}`
}

function getCity(iataCode: string): string {
  return AIRPORTS.find(a => a.code === iataCode)?.city ?? ''
}

/* ── Component ────────────────────────────────────────────────────────────── */

export default function FlightCard({
  airline, airlineCode, airlineLogo, flightNumber,
  origin, destination, departureTime, arrivalTime,
  departureDate, arrivalDate, duration, stops,
  price, currency, priceSectionTitle, priceLabel = 'A partir de', priceCaption,
  cabinLabel, ctaLabel, onSelect, index,
}: FlightCardProps) {
  const isDirect   = stops === 0
  const stopsLabel = isDirect ? 'Direto' : `${stops} escala${stops > 1 ? 's' : ''}`
  const priceNum   = new Intl.NumberFormat('pt-BR').format(Math.floor(price))
  const currSym    = currency === 'BRL' ? 'R$' : currency

  const depTime = extractTime(departureTime)
  const arrTime = extractTime(arrivalTime)
  const depDate = fmtDateShort(departureDate)
  const arrDate = fmtDateShort(arrivalDate)
  const depCity = getCity(origin)
  const arrCity = getCity(destination)

  return (
    <motion.div
      className="rounded-[20px] overflow-hidden"
      style={{
        background: 'rgba(255,255,255,0.035)',
        border:     '1px solid rgba(255,255,255,0.09)',
        boxShadow:  '0 4px 20px rgba(0,0,0,0.18)',
      }}
      initial={{ opacity: 0, y: 22, filter: 'blur(6px)' }}
      animate={{ opacity: 1, y: 0,  filter: 'blur(0px)' }}
      transition={{ duration: 0.44, delay: Math.min(index * 0.08, 0.48), ease: [0.22, 1, 0.36, 1] }}
      whileHover={{
        y: -4,
        boxShadow: '0 18px 52px rgba(0,0,0,0.42), 0 0 0 1px rgba(212,168,83,0.20)',
        transition: { duration: 0.24, ease: [0.22, 1, 0.36, 1] },
      }}
    >
      <div className="p-5">

        {/* ── Header: airline logo + name + cabin badge ── */}
        <div className="flex items-start justify-between mb-5">
          <div className="flex items-center gap-3 min-w-0">
            {airlineLogo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={airlineLogo}
                alt={airline}
                className="w-10 h-10 rounded-xl object-contain shrink-0"
                style={{ background: 'rgba(255,255,255,0.08)' }}
              />
            ) : (
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-[10px] font-black shrink-0"
                style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.55)' }}
              >
                {airlineCode}
              </div>
            )}
            <div className="min-w-0">
              <p className="text-white font-semibold text-[13.5px] leading-tight truncate">{airline}</p>
              <p className="text-white/32 text-[11px] mt-0.5">{flightNumber}</p>
            </div>
          </div>

          {cabinLabel && (
            <div
              className="px-2.5 py-1 rounded-full text-[10px] font-semibold tracking-wide shrink-0 ml-2"
              style={{
                background: 'rgba(212,168,83,0.10)',
                border:     '1px solid rgba(212,168,83,0.22)',
                color:      '#D4A853',
              }}
            >
              {cabinLabel}
            </div>
          )}
        </div>

        {/* ── Flight path: times + animated plane ── */}
        <div className="flex items-center gap-3 mb-2">
          <p className="text-white font-black text-[30px] sm:text-[34px] leading-none tracking-tight tabular-nums shrink-0">
            {depTime}
          </p>

          <div className="flex-1 flex items-center" style={{ height: 28 }}>
            <div
              className="flex-1 h-px"
              style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.14) 60%)' }}
            />
            <motion.div
              className="mx-1.5 rounded-full flex items-center justify-center shrink-0"
              style={{ width: 28, height: 28, background: 'rgba(212,168,83,0.12)', border: '1px solid rgba(212,168,83,0.26)' }}
              animate={{ y: [0, -2.5, 0] }}
              transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
            >
              <Plane size={12} strokeWidth={1.5} style={{ color: '#D4A853' }} />
            </motion.div>
            <div
              className="flex-1 h-px"
              style={{ background: 'linear-gradient(90deg, rgba(255,255,255,0.14) 40%, transparent)' }}
            />
          </div>

          <p className="text-white font-black text-[30px] sm:text-[34px] leading-none tracking-tight tabular-nums shrink-0">
            {arrTime}
          </p>
        </div>

        {/* ── Date + IATA + city ── */}
        <div className="flex justify-between mb-2">
          <div>
            <p className="text-white/30 text-[10px] font-medium tabular-nums">{depDate}</p>
            <p className="text-white/42 text-[11px] font-bold tracking-widest uppercase mt-0.5">{origin}</p>
            {depCity && (
              <p className="text-white/26 text-[9.5px] mt-0.5" style={{ maxWidth: 80 }}>{depCity}</p>
            )}
          </div>
          <div className="text-right">
            <p className="text-white/30 text-[10px] font-medium tabular-nums">{arrDate}</p>
            <p className="text-white/42 text-[11px] font-bold tracking-widest uppercase mt-0.5">{destination}</p>
            {arrCity && (
              <p className="text-white/26 text-[9.5px] mt-0.5 ml-auto" style={{ maxWidth: 80 }}>{arrCity}</p>
            )}
          </div>
        </div>

        {/* ── Duration + stops badge ── */}
        <div className="flex items-center justify-center gap-2.5 mb-5">
          <div className="flex items-center gap-1 text-white/38 text-[11px]">
            <Clock size={10} strokeWidth={2} />
            <span>{formatDuration(duration)}</span>
          </div>
          <div className="w-1 h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.18)' }} />
          <div
            className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold"
            style={isDirect ? {
              background: 'rgba(52,211,153,0.10)',
              border:     '1px solid rgba(52,211,153,0.22)',
              color:      '#34D399',
            } : {
              background: 'rgba(251,191,36,0.10)',
              border:     '1px solid rgba(251,191,36,0.22)',
              color:      '#FBBF24',
            }}
          >
            {stopsLabel}
          </div>
        </div>

        {/* ── Price section ── */}
        <div
          className="rounded-2xl px-4 py-4 mb-4"
          style={{
            background: 'linear-gradient(135deg, rgba(212,168,83,0.10), rgba(212,168,83,0.04))',
            border:     '1px solid rgba(212,168,83,0.14)',
          }}
        >
          {priceSectionTitle && (
            <p
              className="text-[9px] font-bold tracking-[0.16em] uppercase mb-1"
              style={{ color: 'rgba(212,168,83,0.46)' }}
            >
              {priceSectionTitle}
            </p>
          )}
          <p
            className="text-[9.5px] font-semibold tracking-[0.13em] uppercase mb-1.5"
            style={{ color: 'rgba(212,168,83,0.65)' }}
          >
            {priceLabel}
          </p>
          <div className="flex items-baseline gap-1.5 mb-1.5">
            <span className="font-semibold text-[14px]" style={{ color: 'rgba(255,255,255,0.45)' }}>
              {currSym}
            </span>
            <span className="text-white font-black text-[30px] leading-none tracking-tight">
              {priceNum}
            </span>
          </div>
          <p className="text-[10.5px]" style={{ color: 'rgba(255,255,255,0.26)' }}>
            {priceCaption ?? 'Preço total da viagem · sujeito à disponibilidade'}
          </p>
        </div>

        {/* ── Selection CTA ── */}
        <motion.button
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-[13px] font-semibold"
          style={{
            background: 'linear-gradient(135deg, rgba(212,168,83,0.16), rgba(212,168,83,0.08))',
            border:     '1px solid rgba(212,168,83,0.28)',
            color:      '#D4A853',
          }}
          onClick={onSelect}
          whileHover={{ scale: 1.02, filter: 'brightness(1.12)' }}
          whileTap={{ scale: 0.98 }}
          transition={{ duration: 0.18 }}
        >
          {ctaLabel}
        </motion.button>

      </div>
    </motion.div>
  )
}

'use client'

import { motion } from 'framer-motion'
import { ChevronLeft, Clock, CheckCircle2 } from 'lucide-react'
import type { FlightOffer } from '@/lib/types/flights'
import { formatDuration } from '@/lib/utils/format-duration'

/* ── Helpers ──────────────────────────────────────────────────────────────── */

function extractTime(isoDatetime: string): string {
  return (isoDatetime.split('T')[1] ?? '').substring(0, 5)
}

/* ── Props ────────────────────────────────────────────────────────────────── */

interface SelectedFlightBannerProps {
  offer:    FlightOffer
  onClear:  () => void
}

/* ── Component ────────────────────────────────────────────────────────────── */

export default function SelectedFlightBanner({ offer, onClear }: SelectedFlightBannerProps) {
  const depTime    = extractTime(offer.departureTime)
  const arrTime    = extractTime(offer.arrivalTime)
  const isDirect   = offer.stops === 0
  const stopsLabel = isDirect ? 'Direto' : `${offer.stops} escala${offer.stops > 1 ? 's' : ''}`

  return (
    <motion.div
      className="rounded-2xl px-4 py-3 mb-4"
      style={{
        background: 'linear-gradient(135deg, rgba(52,211,153,0.07), rgba(52,211,153,0.03))',
        border:     '1px solid rgba(52,211,153,0.18)',
      }}
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.30, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Top row: label + change button */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <CheckCircle2 size={12} style={{ color: '#34D399' }} strokeWidth={2} />
          <span
            className="text-[10px] font-semibold tracking-[0.11em] uppercase"
            style={{ color: '#34D399' }}
          >
            Voo de ida selecionado
          </span>
        </div>
        <motion.button
          className="flex items-center gap-1 text-[10.5px] font-semibold"
          style={{ color: 'rgba(255,255,255,0.38)' }}
          onClick={onClear}
          whileHover={{ color: 'rgba(255,255,255,0.65)' }}
          whileTap={{ scale: 0.95 }}
          transition={{ duration: 0.14 }}
        >
          <ChevronLeft size={11} />
          Alterar
        </motion.button>
      </div>

      {/* Flight summary row */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Airline logo or code */}
        {offer.airlineLogo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={offer.airlineLogo}
            alt={offer.airline}
            className="w-6 h-6 rounded-md object-contain shrink-0"
            style={{ background: 'rgba(255,255,255,0.08)' }}
          />
        ) : (
          <div
            className="w-6 h-6 rounded-md flex items-center justify-center text-[8px] font-black shrink-0"
            style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.55)' }}
          >
            {offer.airlineCode}
          </div>
        )}

        <span className="text-white font-semibold text-[12px]">{offer.airline}</span>
        <span style={{ color: 'rgba(255,255,255,0.28)' }}>·</span>
        <span className="text-white/40 text-[11px]">{offer.flightNumber}</span>
        <span style={{ color: 'rgba(255,255,255,0.18)' }}>·</span>

        <span className="text-white font-bold text-[13px] tabular-nums">{depTime}</span>
        <span style={{ color: 'rgba(255,255,255,0.28)' }}>→</span>
        <span className="text-white font-bold text-[13px] tabular-nums">{arrTime}</span>
        <span style={{ color: 'rgba(255,255,255,0.18)' }}>·</span>

        <div className="flex items-center gap-1 text-white/38 text-[11px]">
          <Clock size={9} strokeWidth={2} />
          <span>{formatDuration(offer.duration)}</span>
        </div>
        <span style={{ color: 'rgba(255,255,255,0.18)' }}>·</span>

        <span
          className="text-[10px] font-semibold"
          style={{ color: isDirect ? '#34D399' : '#FBBF24' }}
        >
          {stopsLabel}
        </span>
      </div>
    </motion.div>
  )
}

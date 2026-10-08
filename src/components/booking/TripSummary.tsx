'use client'

import { motion } from 'framer-motion'
import { MessageCircle, Plane, Clock } from 'lucide-react'
import type { FlightOffer, FlightSlice } from '@/lib/types/flights'
import { formatDuration } from '@/lib/utils/format-duration'
import { EMOJI } from '@/lib/utils/wa-emojis'
import { AIRPORTS } from '@/data/airports'

/* ── Props ────────────────────────────────────────────────────────────────── */

interface TripSummaryProps {
  offer:         FlightOffer  // matched offer — contains outbound + returnSlice + total price
  paxLabel:      string
  classLabel:    string
  originAirport: string       // full label from booking (e.g. "Guarulhos (GRU)")
  destinationName: string
}

/* ── Helpers ──────────────────────────────────────────────────────────────── */

function extractTime(iso: string): string {
  return (iso.split('T')[1] ?? '').substring(0, 5)
}

function fmtDate(iso: string): string {
  if (!iso) return ''
  const [y, mo, d] = iso.split('-')
  return `${d}/${mo}/${y}`
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

function stopsLabel(stops: number): string {
  return stops === 0 ? 'Direto' : `${stops} escala${stops > 1 ? 's' : ''}`
}

/* ── Slice row: compact one-line flight summary ───────────────────────────── */

function SliceRow({ slice, title }: { slice: FlightSlice; title: string }) {
  const dep     = extractTime(slice.departureTime)
  const arr     = extractTime(slice.arrivalTime)
  const depDate = fmtDateShort(slice.departureDate)
  const arrDate = fmtDateShort(slice.arrivalDate)
  const depCity = getCity(slice.origin)
  const arrCity = getCity(slice.destination)
  const isDirect = slice.stops === 0

  return (
    <div className="rounded-[18px] p-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>

      {/* Section header */}
      <div className="flex items-center gap-2 mb-3.5">
        <div
          className="w-5 h-5 rounded-md flex items-center justify-center shrink-0"
          style={{ background: 'rgba(212,168,83,0.14)', border: '1px solid rgba(212,168,83,0.22)' }}
        >
          <Plane size={10} strokeWidth={2} style={{ color: '#D4A853' }} />
        </div>
        <span
          className="text-[10px] font-semibold tracking-[0.13em] uppercase"
          style={{ color: 'rgba(212,168,83,0.75)' }}
        >
          {title}
        </span>
      </div>

      {/* Airline */}
      <div className="flex items-center gap-2.5 mb-3">
        {slice.airlineLogo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={slice.airlineLogo}
            alt={slice.airline}
            className="w-8 h-8 rounded-lg object-contain shrink-0"
            style={{ background: 'rgba(255,255,255,0.07)' }}
          />
        ) : (
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[9px] font-black shrink-0"
            style={{ background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.50)' }}
          >
            {slice.airlineCode}
          </div>
        )}
        <div>
          <p className="text-white font-semibold text-[13px] leading-tight">{slice.airline}</p>
          <p className="text-white/30 text-[10.5px]">{slice.flightNumber}</p>
        </div>
      </div>

      {/* Times + path */}
      <div className="flex items-center gap-2.5 mb-1.5">
        <p className="text-white font-black text-[26px] leading-none tracking-tight tabular-nums shrink-0">{dep}</p>
        <div className="flex-1 flex items-center" style={{ height: 22 }}>
          <div className="flex-1 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.12) 60%)' }} />
          <div
            className="mx-1.5 rounded-full flex items-center justify-center shrink-0"
            style={{ width: 22, height: 22, background: 'rgba(212,168,83,0.10)', border: '1px solid rgba(212,168,83,0.22)' }}
          >
            <Plane size={10} strokeWidth={1.5} style={{ color: '#D4A853' }} />
          </div>
          <div className="flex-1 h-px" style={{ background: 'linear-gradient(90deg, rgba(255,255,255,0.12) 40%, transparent)' }} />
        </div>
        <p className="text-white font-black text-[26px] leading-none tracking-tight tabular-nums shrink-0">{arr}</p>
      </div>

      {/* Dates + IATA */}
      <div className="flex justify-between mb-2.5">
        <div>
          <p className="text-white/42 text-[10.5px] font-bold tracking-widest uppercase">{slice.origin}</p>
          <p className="text-white/26 text-[9.5px]">{depDate}{depCity ? ` · ${depCity}` : ''}</p>
        </div>
        <div className="text-right">
          <p className="text-white/42 text-[10.5px] font-bold tracking-widest uppercase">{slice.destination}</p>
          <p className="text-white/26 text-[9.5px]">{arrDate}{arrCity ? ` · ${arrCity}` : ''}</p>
        </div>
      </div>

      {/* Duration + stops */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1 text-white/35 text-[10.5px]">
          <Clock size={9} strokeWidth={2} />
          <span>{formatDuration(slice.duration)}</span>
        </div>
        <span style={{ color: 'rgba(255,255,255,0.16)' }}>·</span>
        <span
          className="text-[10px] font-semibold"
          style={{ color: isDirect ? '#34D399' : '#FBBF24' }}
        >
          {stopsLabel(slice.stops)}
        </span>
      </div>
    </div>
  )
}

/* ── WhatsApp message builder ─────────────────────────────────────────────── */

function buildWaMessage(
  offer:           FlightOffer,
  ret:             FlightSlice,
  paxLabel:        string,
  classLabel:      string,
): string {
  const currSym    = offer.currency === 'BRL' ? 'R$' : offer.currency
  const priceNum   = new Intl.NumberFormat('pt-BR').format(Math.floor(offer.price))
  const originCity = getCity(offer.origin)
  const destCity   = getCity(offer.destination)
  const origLabel  = originCity ? `${originCity} (${offer.origin})` : offer.origin
  const destLabel  = destCity ? `${destCity} (${offer.destination})` : offer.destination

  const obDep  = extractTime(offer.departureTime)
  const obArr  = extractTime(offer.arrivalTime)
  const retDep = extractTime(ret.departureTime)
  const retArr = extractTime(ret.arrivalTime)

  // Price section — show breakdown when Duffel provides tax_amount
  let priceSection: string
  if (offer.taxAmount != null) {
    const baseNum = new Intl.NumberFormat('pt-BR').format(Math.floor(offer.baseAmount))
    const taxNum  = new Intl.NumberFormat('pt-BR').format(Math.floor(offer.taxAmount))
    priceSection =
      `Preço base: ${currSym} ${baseNum}\n` +
      `Taxas: ${currSym} ${taxNum}\n` +
      `──────────────\n` +
      `*TOTAL: ${currSym} ${priceNum}*\n\n`
  } else {
    priceSection = `*${currSym} ${priceNum}*\n\n`
  }

  // Fare conditions — appended only when available
  const condParts: string[] = []
  if (offer.changeAllowed === true) {
    condParts.push(offer.changePenalty
      ? `Alteração com taxa de ${currSym} ${new Intl.NumberFormat('pt-BR').format(Math.floor(offer.changePenalty))}`
      : 'Alteração permitida')
  } else if (offer.changeAllowed === false) {
    condParts.push('Sem alteração')
  }
  if (offer.refundAllowed === true)  condParts.push('Reembolsável')
  else if (offer.refundAllowed === false) condParts.push('Não reembolsável')
  const condLine = condParts.length > 0
    ? `${EMOJI.info} _Tarifa: ${condParts.join(' · ')}_\n\n`
    : ''

  return (
    `${EMOJI.plane} *Olá!*\n\n` +
    `Acabei de realizar uma pesquisa no site da *Alvea Viagens* e gostaria de verificar a possibilidade de emitir as passagens abaixo utilizando *milhas*, caso seja mais vantajoso.\n\n` +
    `━━━━━━━━━━━━━━━━━━\n` +
    `${EMOJI.clipboard} *RESUMO DA PESQUISA*\n` +
    `━━━━━━━━━━━━━━━━━━\n\n` +
    `${EMOJI.takeoff} *Origem:*\n${origLabel}\n\n` +
    `${EMOJI.landing} *Destino:*\n${destLabel}\n\n` +
    `${EMOJI.calendar} *Data de ida:*\n${fmtDate(offer.departureDate)}\n\n` +
    `${EMOJI.calendar} *Data de volta:*\n${fmtDate(ret.departureDate)}\n\n` +
    `${EMOJI.people} *Passageiros:*\n${paxLabel}\n\n` +
    `${EMOJI.seat} *Classe:*\n${classLabel}\n\n` +
    `━━━━━━━━━━━━━━━━━━\n` +
    `${EMOJI.takeoff} *VOO DE IDA SELECIONADO*\n` +
    `━━━━━━━━━━━━━━━━━━\n\n` +
    `${EMOJI.office} *Companhia aérea:*\n${offer.airline}\n\n` +
    `${EMOJI.numbers} *Número do voo:*\n${offer.flightNumber}\n\n` +
    `${EMOJI.takeoff} *Saída:*\n${obDep} · ${fmtDate(offer.departureDate)}\n\n` +
    `${EMOJI.landing} *Chegada:*\n${obArr} · ${fmtDate(offer.arrivalDate)}\n\n` +
    `${EMOJI.stopwatch} *Duração:*\n${formatDuration(offer.duration)}\n\n` +
    `${EMOJI.stop} *Escalas:*\n${stopsLabel(offer.stops)}\n\n` +
    `━━━━━━━━━━━━━━━━━━\n` +
    `${EMOJI.landing} *VOO DE VOLTA SELECIONADO*\n` +
    `━━━━━━━━━━━━━━━━━━\n\n` +
    `${EMOJI.office} *Companhia aérea:*\n${ret.airline}\n\n` +
    `${EMOJI.numbers} *Número do voo:*\n${ret.flightNumber}\n\n` +
    `${EMOJI.takeoff} *Saída:*\n${retDep} · ${fmtDate(ret.departureDate)}\n\n` +
    `${EMOJI.landing} *Chegada:*\n${retArr} · ${fmtDate(ret.arrivalDate)}\n\n` +
    `${EMOJI.stopwatch} *Duração:*\n${formatDuration(ret.duration)}\n\n` +
    `${EMOJI.stop} *Escalas:*\n${stopsLabel(ret.stops)}\n\n` +
    `━━━━━━━━━━━━━━━━━━\n` +
    `${EMOJI.money} *VALOR DA VIAGEM*\n` +
    `━━━━━━━━━━━━━━━━━━\n\n` +
    priceSection +
    `✓ Ida incluída\n` +
    `✓ Volta incluída\n` +
    `✓ Classe: ${classLabel}\n` +
    `✓ Passageiros: ${paxLabel}\n` +
    `✓ Cia. aérea: ${offer.airline}\n\n` +
    condLine +
    `━━━━━━━━━━━━━━━━━━\n\n` +
    `${EMOJI.speech} Aguardo o orçamento.\n\n` +
    `Muito obrigado! ${EMOJI.smile}\n\n` +
    `━━━━━━━━━━━━━━━━━━`
  )
}

/* ── Main component ───────────────────────────────────────────────────────── */

export default function TripSummary({
  offer, paxLabel, classLabel, originAirport, destinationName,
}: TripSummaryProps) {
  const ret = offer.returnSlice!
  const currSym  = offer.currency === 'BRL' ? 'R$' : offer.currency
  const priceNum = new Intl.NumberFormat('pt-BR').format(Math.floor(offer.price))

  const waMsg  = encodeURIComponent(buildWaMessage(offer, ret, paxLabel, classLabel))
  const waHref = `https://api.whatsapp.com/send?phone=5516997315748&text=${waMsg}`

  // Build a FlightSlice-like object from the outbound offer fields for SliceRow
  const outboundAsSlice: FlightSlice = {
    airline:       offer.airline,
    airlineCode:   offer.airlineCode,
    airlineLogo:   offer.airlineLogo,
    flightNumber:  offer.flightNumber,
    origin:        offer.origin,
    destination:   offer.destination,
    departureTime: offer.departureTime,
    arrivalTime:   offer.arrivalTime,
    departureDate: offer.departureDate,
    arrivalDate:   offer.arrivalDate,
    duration:      offer.duration,
    durationMinutes: offer.durationMinutes,
    stops:         offer.stops,
    segments:      [],  // not needed for display
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
      className="pb-2"
    >
      {/* Header */}
      <div className="mb-4">
        <p
          className="text-[10px] font-semibold tracking-[0.13em] uppercase mb-1"
          style={{ color: 'rgba(255,255,255,0.30)' }}
        >
          Resumo da viagem
        </p>
        <p className="text-white font-bold text-[17px] leading-tight">
          {originAirport.match(/\(([A-Z]{3})\)/)?.[1] ?? offer.origin}
          <span className="text-white/28 font-normal mx-2">→</span>
          {destinationName}
        </p>
        <p className="text-white/28 text-[11.5px] mt-0.5">
          {fmtDate(offer.departureDate)} – {fmtDate(ret.departureDate)}
          {paxLabel && ` · ${paxLabel}`}
          {classLabel && ` · ${classLabel}`}
        </p>
      </div>

      {/* Outbound slice */}
      <SliceRow slice={outboundAsSlice} title="Voo de ida" />

      {/* Divider */}
      <div className="flex items-center gap-3 my-3">
        <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />
        <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.20)' }}>+</span>
        <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />
      </div>

      {/* Return slice */}
      <SliceRow slice={ret} title="Voo de volta" />

      {/* Total price */}
      <div
        className="rounded-2xl px-4 py-4 mt-4 mb-3"
        style={{
          background: 'linear-gradient(135deg, rgba(212,168,83,0.12), rgba(212,168,83,0.04))',
          border:     '1px solid rgba(212,168,83,0.18)',
        }}
      >
        <p
          className="text-[9.5px] font-semibold tracking-[0.14em] uppercase mb-1.5"
          style={{ color: 'rgba(212,168,83,0.65)' }}
        >
          Valor total da viagem
        </p>
        <div className="flex items-baseline gap-1.5 mb-2.5">
          <span className="font-semibold text-[14px]" style={{ color: 'rgba(255,255,255,0.45)' }}>
            {currSym}
          </span>
          <span className="text-white font-black text-[30px] leading-none tracking-tight">
            {priceNum}
          </span>
        </div>

        {/* Price breakdown — only when Duffel provides tax_amount */}
        {offer.taxAmount != null && (
          <div className="mb-2.5 pt-2.5" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="flex justify-between text-[10.5px] mb-1">
              <span style={{ color: 'rgba(255,255,255,0.38)' }}>Preço base</span>
              <span style={{ color: 'rgba(255,255,255,0.55)' }}>
                {currSym} {new Intl.NumberFormat('pt-BR').format(Math.floor(offer.baseAmount))}
              </span>
            </div>
            <div className="flex justify-between text-[10.5px] mb-2">
              <span style={{ color: 'rgba(255,255,255,0.38)' }}>Taxas</span>
              <span style={{ color: 'rgba(255,255,255,0.55)' }}>
                {currSym} {new Intl.NumberFormat('pt-BR').format(Math.floor(offer.taxAmount))}
              </span>
            </div>
            <div
              className="flex justify-between text-[10.5px] pt-1.5"
              style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
            >
              <span className="font-semibold" style={{ color: 'rgba(255,255,255,0.55)' }}>Total</span>
              <span className="font-bold text-white">{currSym} {priceNum}</span>
            </div>
          </div>
        )}

        {/* Inclui checklist */}
        <div className="flex items-center flex-wrap gap-x-3 gap-y-0.5">
          {(['Ida', 'Volta', 'Taxas da companhia'] as const).map(item => (
            <span key={item} className="flex items-center gap-1 text-[10px]" style={{ color: 'rgba(52,211,153,0.75)' }}>
              ✓ {item}
            </span>
          ))}
        </div>
      </div>

      {/* Fare conditions */}
      {(offer.refundAllowed !== null || offer.changeAllowed !== null) && (
        <div className="flex flex-wrap gap-2 mb-4">
          {offer.changeAllowed === true && (
            <span
              className="px-2.5 py-1 rounded-full text-[10px] font-semibold"
              style={{ background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.18)', color: '#34D399' }}
            >
              {offer.changePenalty
                ? `Alteração · ${currSym} ${new Intl.NumberFormat('pt-BR').format(Math.floor(offer.changePenalty))}`
                : 'Alteração permitida'}
            </span>
          )}
          {offer.changeAllowed === false && (
            <span
              className="px-2.5 py-1 rounded-full text-[10px] font-semibold"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.38)' }}
            >
              Sem alteração
            </span>
          )}
          {offer.refundAllowed === true && (
            <span
              className="px-2.5 py-1 rounded-full text-[10px] font-semibold"
              style={{ background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.18)', color: '#34D399' }}
            >
              Reembolsável
            </span>
          )}
          {offer.refundAllowed === false && (
            <span
              className="px-2.5 py-1 rounded-full text-[10px] font-semibold"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.38)' }}
            >
              Não reembolsável
            </span>
          )}
        </div>
      )}

      {/* WhatsApp CTA */}
      <a href={waHref} target="_blank" rel="noopener noreferrer">
        <motion.button
          className="btn-shimmer cta-glow w-full flex items-center justify-center gap-2.5 py-3.5 rounded-full text-[14px] font-semibold"
          style={{ background: 'linear-gradient(135deg, #D4A853 0%, #ECC96A 50%, #E8824A 100%)', color: '#050D1A' }}
          whileHover={{ scale: 1.02, y: -1 }}
          whileTap={{ scale: 0.98 }}
          transition={{ type: 'spring', stiffness: 400, damping: 20 }}
        >
          <MessageCircle size={15} strokeWidth={2} />
          Solicitar emissão com milhas
        </motion.button>
      </a>

      {/* Alvea advantage note */}
      <p className="text-center text-[11px] mt-3" style={{ color: 'rgba(255,255,255,0.22)' }}>
        Emissão estratégica pode reduzir seu custo em até{' '}
        <span style={{ color: '#D4A853', fontWeight: 600 }}>60%</span>
      </p>
    </motion.div>
  )
}

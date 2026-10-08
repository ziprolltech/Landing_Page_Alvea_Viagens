// ─── WhatsApp message for the trip-request form (/destinos) ───────────────────
// Pure helper: the answers of the booking form in, message text out. Nothing is
// sent or stored — the text only pre-fills the WhatsApp message box, and the
// visitor still has to press "Enviar" there.
//
// This is what the form does while the live flight search is switched off
// (see FLIGHT_SEARCH_ENABLED in BookingModal.tsx).

import { EMOJI } from '@/lib/utils/wa-emojis'

export interface TripRequest {
  /* origin as chosen in the autocomplete, e.g. "São Paulo (GRU)" */
  originLabel:     string
  destinationName: string
  destinationIata: string
  /* ISO dates exactly as picked: yyyy-mm-dd */
  departureDate:   string
  returnDate:      string
  /* true when the visitor chose "Somente ida": there is no return date */
  oneWay?:         boolean
  /* labels of the options the visitor selected */
  passengers:      string
  flightClass:     string
}

/* "São Paulo (GRU)" → "GRU — São Paulo". Anything else is used as typed. */
function airportLine(label: string): string {
  const match = label.trim().match(/^(.*?)\s*\(([A-Z]{3})\)$/)
  return match && match[1] ? `${match[2]} — ${match[1]}` : label.trim()
}

/* yyyy-mm-dd → dd/mm/yyyy, as text: no Date object, so no timezone shift */
function date(iso: string): string {
  const [year, month, day] = iso.split('-')
  return year && month && day ? `${day}/${month}/${year}` : iso
}

export function buildTripRequestMessage(trip: TripRequest): string {
  return (
    `${EMOJI.plane} *Solicitação de viagem — Alvea Viagens*\n\n` +
    `Olá! Gostaria de solicitar uma cotação de passagem aérea.\n\n` +
    `${EMOJI.pin} *Origem:* ${airportLine(trip.originLabel)}\n` +
    `${EMOJI.pin} *Destino:* ${trip.destinationIata} — ${trip.destinationName}\n\n` +
    (trip.oneWay
      ? `${EMOJI.calendar} *Tipo de viagem:* Somente ida\n\n` +
        `${EMOJI.calendar} *Ida:* ${date(trip.departureDate)}\n\n`
      : `${EMOJI.calendar} *Ida:* ${date(trip.departureDate)}\n` +
        `${EMOJI.calendar} *Volta:* ${date(trip.returnDate)}\n\n`) +
    `${EMOJI.people} *Passageiros:* ${trip.passengers}\n` +
    `${EMOJI.seat} *Classe:* ${trip.flightClass}\n\n` +
    `Gostaria de receber as melhores opções disponíveis. ${EMOJI.smile}`
  )
}

// ─── Duffel flight provider ───────────────────────────────────────────────────
// THIS FILE IS SERVER-SIDE ONLY.
// Responsible for: calling Duffel, normalizing raw responses into FlightOffer[].
// It knows Duffel's API shape — no other layer should.

import { duffelRequest, DuffelApiError, DuffelNetworkError } from '@/lib/duffel/client'
import type {
  CabinClass,
  DuffelOffer,
  DuffelOfferRequestResponse,
  DuffelPassenger,
  DuffelSegment,
  DuffelSlice,
  FlightOffer,
  FlightSearchRequest,
  FlightSegmentSummary,
  FlightSlice,
  IFlightProvider,
} from '@/lib/types/flights'

// ─── Duration helpers ─────────────────────────────────────────────────────────

// Parses ISO 8601 duration to total minutes for sorting/comparison.
// Uses the same full regex as formatDuration so days are included correctly.
// P[n]D = n × 1440 min; T[n]H = n × 60 min; [n]M = n min.
function parseDurationMinutes(iso: string): number {
  const match = iso.match(/^P(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?)?$/)
  if (!match) return 0
  const days    = parseInt(match[1] ?? '0', 10)
  const hours   = parseInt(match[2] ?? '0', 10)
  const minutes = parseInt(match[3] ?? '0', 10)
  return days * 1440 + hours * 60 + minutes
}

function extractDate(isoDatetime: string): string {
  return isoDatetime.substring(0, 10)
}

// ─── Segment normalizer ───────────────────────────────────────────────────────

function normalizeSegment(seg: DuffelSegment): FlightSegmentSummary {
  return {
    airline: seg.operating_carrier.name,
    airlineCode: seg.operating_carrier.iata_code,
    flightNumber: `${seg.operating_carrier.iata_code}${seg.operating_carrier_flight_number}`,
    origin: seg.origin.iata_code,
    destination: seg.destination.iata_code,
    departureTime: seg.departing_at,
    arrivalTime: seg.arriving_at,
    duration: seg.duration,
    durationMinutes: parseDurationMinutes(seg.duration),
  }
}

// ─── Slice normalizer ─────────────────────────────────────────────────────────

function normalizeSlice(slice: DuffelSlice): FlightSlice {
  const segments = slice.segments.map(normalizeSegment)
  const durationMinutes = parseDurationMinutes(slice.duration)
  const firstSeg = slice.segments[0]
  const lastSeg  = slice.segments[slice.segments.length - 1]
  return {
    airline:       firstSeg.operating_carrier.name,
    airlineCode:   firstSeg.operating_carrier.iata_code,
    airlineLogo:   firstSeg.operating_carrier.logo_symbol_url,
    flightNumber:  `${firstSeg.operating_carrier.iata_code}${firstSeg.operating_carrier_flight_number}`,
    origin:        slice.origin.iata_code,
    destination:   slice.destination.iata_code,
    departureTime: firstSeg.departing_at,
    arrivalTime:   lastSeg.arriving_at,
    departureDate: extractDate(firstSeg.departing_at),
    arrivalDate:   extractDate(lastSeg.arriving_at),
    duration:      slice.duration,
    durationMinutes,
    stops:         slice.segments.length - 1,
    segments,
  }
}

// ─── Offer normalizer ─────────────────────────────────────────────────────────

// Duffel does not include cabin_class on individual offers — it is set at the
// offer_request level. We pass it in explicitly so normalizeOffer can stamp
// each result with the correct cabin without reading it from raw Duffel data.
function normalizeOffer(offer: DuffelOffer, cabinClass: CabinClass): FlightOffer {
  const outbound = offer.slices[0]
  const inbound = offer.slices[1] ?? null

  const firstSegment = outbound.segments[0]
  const outboundNormalized = normalizeSlice(outbound)
  const returnSlice = inbound ? normalizeSlice(inbound) : null

  const totalDurationMinutes =
    outboundNormalized.durationMinutes + (returnSlice?.durationMinutes ?? 0)

  return {
    id: offer.id,
    provider: 'duffel',
    airline: firstSegment.operating_carrier.name,
    airlineCode: firstSegment.operating_carrier.iata_code,
    airlineLogo: firstSegment.operating_carrier.logo_symbol_url,
    flightNumber: `${firstSegment.operating_carrier.iata_code}${firstSegment.operating_carrier_flight_number}`,
    origin: outbound.origin.iata_code,
    destination: outbound.destination.iata_code,
    departureTime: firstSegment.departing_at,
    arrivalTime: outbound.segments[outbound.segments.length - 1].arriving_at,
    departureDate: extractDate(firstSegment.departing_at),
    arrivalDate: extractDate(outbound.segments[outbound.segments.length - 1].arriving_at),
    duration: outbound.duration,
    durationMinutes: outboundNormalized.durationMinutes,
    stops: outbound.segments.length - 1,
    price:         parseFloat(offer.total_amount),
    currency:      offer.total_currency,
    baseAmount:    parseFloat(offer.base_amount),
    taxAmount:     offer.tax_amount != null ? parseFloat(offer.tax_amount) : null,
    cabin:         cabinClass,
    refundAllowed: offer.conditions?.refund_before_departure?.allowed ?? null,
    changeAllowed: offer.conditions?.change_before_departure?.allowed ?? null,
    changePenalty: offer.conditions?.change_before_departure?.penalty_amount != null
      ? parseFloat(offer.conditions.change_before_departure.penalty_amount)
      : null,
    returnSlice,
    totalDurationMinutes,
  }
}

// ─── Deduplication ────────────────────────────────────────────────────────────
// Duffel returns many offers for the same physical (outbound, return) pair that
// differ only in fare family, baggage rules, or refundability. We collapse them
// to one offer per unique (outbound + return) combination, keeping the cheapest.
// The frontend further deduplicates outbound flights for the outbound list, then
// deduplicates return flights for the return list — each step keeping cheapest.

function buildDeduplicationKey(offer: FlightOffer): string {
  const ret = offer.returnSlice
  return [
    offer.airlineCode,
    offer.flightNumber,
    offer.departureTime,
    offer.arrivalTime,
    ret?.airlineCode   ?? '',
    ret?.flightNumber  ?? '',
    ret?.departureTime ?? '',
    ret?.arrivalTime   ?? '',
  ].join('|')
}

function deduplicateOffers(offers: FlightOffer[]): FlightOffer[] {
  const seen = new Map<string, FlightOffer>()
  for (const offer of offers) {
    const key = buildDeduplicationKey(offer)
    const existing = seen.get(key)
    if (!existing || offer.price < existing.price) {
      seen.set(key, offer)
    }
  }
  return [...seen.values()]
}

// ─── Passenger builder ────────────────────────────────────────────────────────

function buildPassengers(request: FlightSearchRequest): DuffelPassenger[] {
  const passengers: DuffelPassenger[] = []
  for (let i = 0; i < request.adults; i++) {
    passengers.push({ type: 'adult' })
  }
  for (let i = 0; i < (request.children ?? 0); i++) {
    passengers.push({ type: 'child' })
  }
  for (let i = 0; i < (request.infants ?? 0); i++) {
    passengers.push({ type: 'infant_without_seat' })
  }
  return passengers
}

// ─── Cabin class mapping ──────────────────────────────────────────────────────

const DUFFEL_CABIN_MAP: Record<CabinClass, string> = {
  economy: 'economy',
  premium_economy: 'premium_economy',
  business: 'business',
  first: 'first',
}

// ─── Provider implementation ──────────────────────────────────────────────────

class DuffelFlightProvider implements IFlightProvider {
  async searchFlights(
    request: FlightSearchRequest
  ): Promise<{ offerId: string; offers: FlightOffer[] }> {
    const passengers = buildPassengers(request)

    const requestBody = {
      data: {
        slices: [
          {
            origin: request.origin,
            destination: request.destination,
            departure_date: request.departureDate,
          },
          {
            origin: request.destination,
            destination: request.origin,
            departure_date: request.returnDate,
          },
        ],
        passengers,
        cabin_class: DUFFEL_CABIN_MAP[request.cabinClass],
        return_offers: true,
      },
    }

    let response: { data: DuffelOfferRequestResponse }

    try {
      response = await duffelRequest<DuffelOfferRequestResponse>({
        method: 'POST',
        path: '/air/offer_requests',
        body: requestBody,
      })
    } catch (err) {
      // Re-map specific Duffel error codes so the service layer can produce
      // user-friendly Portuguese messages without knowing Duffel internals.
      if (err instanceof DuffelApiError) {
        const code = err.code.toLowerCase()
        if (code.includes('airport') || code.includes('iata')) {
          throw new DuffelProviderError('INVALID_AIRPORT', err.message, err.status)
        }
        if (code.includes('auth') || err.status === 401 || err.status === 403) {
          throw new DuffelProviderError('AUTH_ERROR', err.message, err.status)
        }
        if (err.status === 429) {
          throw new DuffelProviderError('RATE_LIMIT', err.message, err.status)
        }
        throw new DuffelProviderError('PROVIDER_ERROR', err.message, err.status)
      }
      if (err instanceof DuffelNetworkError) {
        if (err.message.includes('timed out')) {
          throw new DuffelProviderError('TIMEOUT', err.message, 408)
        }
        throw new DuffelProviderError('PROVIDER_ERROR', err.message, 503)
      }
      throw err
    }

    const rawOffers = response.data.offers ?? []

    const offerId = response.data.id

    const normalized = rawOffers.map((raw) => normalizeOffer(raw, request.cabinClass))
    const offers = deduplicateOffers(normalized)

    // Sort by price ascending (cheapest first).
    offers.sort((a, b) => a.price - b.price)

    return { offerId, offers }
  }
}

// ─── Exported error class ─────────────────────────────────────────────────────

export class DuffelProviderError extends Error {
  constructor(
    public readonly errorCode: string,
    message: string,
    public readonly httpStatus: number
  ) {
    super(message)
    this.name = 'DuffelProviderError'
  }
}

// ─── Singleton export ─────────────────────────────────────────────────────────

export const duffelProvider = new DuffelFlightProvider()

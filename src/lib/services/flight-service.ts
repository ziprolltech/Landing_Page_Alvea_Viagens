// ─── Flight service ───────────────────────────────────────────────────────────
// THIS FILE IS SERVER-SIDE ONLY.
// Orchestrates flight search: validates input, selects a provider, handles
// errors, and returns normalized results. The API route is a thin wrapper
// around this service — all business logic lives here.

import { duffelProvider, DuffelProviderError } from '@/lib/providers/duffel-provider'
import type {
  ApiErrorCode,
  CabinClass,
  FlightSearchRequest,
  FlightSearchResponse,
  IFlightProvider,
} from '@/lib/types/flights'

// ─── Validation ───────────────────────────────────────────────────────────────

const IATA_REGEX = /^[A-Z]{3}$/
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/
const VALID_CABIN_CLASSES: CabinClass[] = ['economy', 'premium_economy', 'business', 'first']
const MAX_PASSENGERS = 9

export interface ValidationError {
  field: string
  message: string
}

export function validateSearchRequest(raw: unknown): {
  valid: true
  request: FlightSearchRequest
} | {
  valid: false
  errors: ValidationError[]
} {
  const errors: ValidationError[] = []

  if (typeof raw !== 'object' || raw === null) {
    return { valid: false, errors: [{ field: 'body', message: 'Request body must be a JSON object' }] }
  }

  const body = raw as Record<string, unknown>

  // ── origin ────────────────────────────────────────────────────────────────
  if (typeof body.origin !== 'string' || body.origin.trim() === '') {
    errors.push({ field: 'origin', message: 'Origin is required' })
  } else if (!IATA_REGEX.test(body.origin.toUpperCase())) {
    errors.push({ field: 'origin', message: 'Origin must be a 3-letter IATA code (e.g. GRU)' })
  }

  // ── destination ───────────────────────────────────────────────────────────
  if (typeof body.destination !== 'string' || body.destination.trim() === '') {
    errors.push({ field: 'destination', message: 'Destination is required' })
  } else if (!IATA_REGEX.test(body.destination.toUpperCase())) {
    errors.push({ field: 'destination', message: 'Destination must be a 3-letter IATA code (e.g. LIS)' })
  }

  // ── same origin/destination ───────────────────────────────────────────────
  if (
    typeof body.origin === 'string' &&
    typeof body.destination === 'string' &&
    body.origin.toUpperCase() === body.destination.toUpperCase()
  ) {
    errors.push({ field: 'destination', message: 'Origin and destination must be different airports' })
  }

  // ── departureDate ─────────────────────────────────────────────────────────
  const today = new Date().toISOString().substring(0, 10)

  if (typeof body.departureDate !== 'string' || !DATE_REGEX.test(body.departureDate)) {
    errors.push({ field: 'departureDate', message: 'Departure date must be in YYYY-MM-DD format' })
  } else if (body.departureDate < today) {
    errors.push({ field: 'departureDate', message: 'Departure date must be today or in the future' })
  }

  // ── returnDate ────────────────────────────────────────────────────────────
  if (typeof body.returnDate !== 'string' || !DATE_REGEX.test(body.returnDate)) {
    errors.push({ field: 'returnDate', message: 'Return date must be in YYYY-MM-DD format' })
  } else if (
    typeof body.departureDate === 'string' &&
    DATE_REGEX.test(body.departureDate) &&
    body.returnDate <= body.departureDate
  ) {
    errors.push({ field: 'returnDate', message: 'Return date must be after departure date' })
  }

  // ── adults ────────────────────────────────────────────────────────────────
  const adults = typeof body.adults === 'number' ? body.adults : parseInt(String(body.adults), 10)
  if (!Number.isInteger(adults) || adults < 1) {
    errors.push({ field: 'adults', message: 'At least 1 adult passenger is required' })
  }

  // ── children ─────────────────────────────────────────────────────────────
  const children = body.children !== undefined
    ? (typeof body.children === 'number' ? body.children : parseInt(String(body.children), 10))
    : 0
  if (!Number.isInteger(children) || children < 0) {
    errors.push({ field: 'children', message: 'Children count must be 0 or more' })
  }

  // ── infants ───────────────────────────────────────────────────────────────
  const infants = body.infants !== undefined
    ? (typeof body.infants === 'number' ? body.infants : parseInt(String(body.infants), 10))
    : 0
  if (!Number.isInteger(infants) || infants < 0) {
    errors.push({ field: 'infants', message: 'Infants count must be 0 or more' })
  }

  // ── total passenger count ─────────────────────────────────────────────────
  if (errors.length === 0) {
    const total = adults + children + infants
    if (total > MAX_PASSENGERS) {
      errors.push({
        field: 'passengers',
        message: `Total passengers (${total}) exceeds the maximum of ${MAX_PASSENGERS}`,
      })
    }
  }

  // ── infants cannot exceed adults (each infant must be on an adult's lap) ──
  if (infants > adults) {
    errors.push({
      field: 'infants',
      message: 'Number of infants cannot exceed the number of adults',
    })
  }

  // ── cabinClass ────────────────────────────────────────────────────────────
  if (!VALID_CABIN_CLASSES.includes(body.cabinClass as CabinClass)) {
    errors.push({
      field: 'cabinClass',
      message: `Cabin class must be one of: ${VALID_CABIN_CLASSES.join(', ')}`,
    })
  }

  if (errors.length > 0) {
    return { valid: false, errors }
  }

  return {
    valid: true,
    request: {
      origin: (body.origin as string).toUpperCase(),
      destination: (body.destination as string).toUpperCase(),
      departureDate: body.departureDate as string,
      returnDate: body.returnDate as string,
      adults,
      children: children > 0 ? children : undefined,
      infants: infants > 0 ? infants : undefined,
      cabinClass: body.cabinClass as CabinClass,
    },
  }
}

// ─── Error mapping ────────────────────────────────────────────────────────────
// Translates provider-level errors to user-facing Portuguese messages and
// the API-level error codes the frontend understands.

interface MappedError {
  message: string   // Portuguese — safe to show to users
  code: ApiErrorCode
  status: number
}

function mapProviderError(err: DuffelProviderError): MappedError {
  switch (err.errorCode) {
    case 'INVALID_AIRPORT':
      return {
        message: 'Um dos aeroportos informados não foi encontrado. Verifique os códigos IATA.',
        code: 'INVALID_AIRPORT',
        status: 422,
      }
    case 'AUTH_ERROR':
      return {
        message: 'Erro de configuração do serviço de busca. Entre em contato conosco.',
        code: 'AUTH_ERROR',
        status: 503,
      }
    case 'RATE_LIMIT':
      return {
        message: 'Muitas buscas em seguida. Aguarde alguns segundos e tente novamente.',
        code: 'RATE_LIMIT',
        status: 429,
      }
    case 'TIMEOUT':
      return {
        message: 'A busca demorou mais do que o esperado. Tente novamente.',
        code: 'TIMEOUT',
        status: 504,
      }
    default:
      return {
        message: 'Não foi possível buscar voos neste momento. Tente novamente em breve.',
        code: 'PROVIDER_ERROR',
        status: 502,
      }
  }
}

// ─── Provider registry ────────────────────────────────────────────────────────
// To add a new provider: import it, add it to this map, and update the
// provider selection logic in searchFlights below.

const providers: Record<string, IFlightProvider> = {
  duffel: duffelProvider,
}

function selectProvider(): { name: string; provider: IFlightProvider } {
  // Future: could be driven by environment variable or feature flag.
  const name = 'duffel'
  return { name, provider: providers[name] }
}

// ─── Main search function ─────────────────────────────────────────────────────

export async function searchFlights(
  request: FlightSearchRequest
): Promise<FlightSearchResponse> {
  const { name: providerName, provider } = selectProvider()
  const startTime = Date.now()

  console.log(`[flight-service] search started`, {
    provider: providerName,
    origin: request.origin,
    destination: request.destination,
    departureDate: request.departureDate,
    returnDate: request.returnDate,
    adults: request.adults,
    children: request.children ?? 0,
    infants: request.infants ?? 0,
    cabinClass: request.cabinClass,
  })

  try {
    const { offerId, offers } = await provider.searchFlights(request)
    const elapsed = Date.now() - startTime

    console.log(`[flight-service] search completed`, {
      provider: providerName,
      offerId,
      resultCount: offers.length,
      elapsedMs: elapsed,
    })

    return {
      offers,
      searchId: offerId,
      provider: 'duffel',
      timestamp: new Date().toISOString(),
      count: offers.length,
    }
  } catch (err) {
    const elapsed = Date.now() - startTime

    if (err instanceof DuffelProviderError) {
      console.error(`[flight-service] provider error`, {
        provider: providerName,
        errorCode: err.errorCode,
        httpStatus: err.httpStatus,
        elapsedMs: elapsed,
      })
      const mapped = mapProviderError(err)
      throw new FlightServiceError(mapped.message, mapped.code, mapped.status)
    }

    console.error(`[flight-service] unexpected error`, {
      provider: providerName,
      error: err instanceof Error ? err.message : String(err),
      elapsedMs: elapsed,
    })

    throw new FlightServiceError(
      'Erro inesperado ao buscar voos. Tente novamente.',
      'INTERNAL_ERROR',
      500
    )
  }
}

// ─── Service error class ──────────────────────────────────────────────────────

export class FlightServiceError extends Error {
  constructor(
    message: string,
    public readonly code: ApiErrorCode,
    public readonly httpStatus: number
  ) {
    super(message)
    this.name = 'FlightServiceError'
  }
}

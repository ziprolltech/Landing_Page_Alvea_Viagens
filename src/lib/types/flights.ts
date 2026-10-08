// ─── Shared normalized flight types ──────────────────────────────────────────
// All layers of the backend return these types. The frontend consumes only this
// interface — it never sees raw Duffel shapes.

export type CabinClass = 'economy' | 'premium_economy' | 'business' | 'first'

export type FlightProvider = 'duffel'

// ─── Request ──────────────────────────────────────────────────────────────────

export interface FlightSearchRequest {
  origin: string       // IATA code (e.g. "GRU")
  destination: string  // IATA code (e.g. "LIS")
  departureDate: string  // YYYY-MM-DD
  returnDate: string     // YYYY-MM-DD
  adults: number
  children?: number
  infants?: number
  cabinClass: CabinClass
}

// ─── Normalized offer types ───────────────────────────────────────────────────

export interface FlightSegmentSummary {
  airline: string
  airlineCode: string
  flightNumber: string
  origin: string       // IATA code
  destination: string  // IATA code
  departureTime: string  // ISO datetime (e.g. "2025-12-01T11:30:00")
  arrivalTime: string
  duration: string       // raw ISO 8601 (e.g. "PT5H30M") — format with formatDuration() for display
  durationMinutes: number
}

export interface FlightSlice {
  // First-segment airline info — needed to display return flight cards without
  // reading deep into segments[] on the frontend.
  airline: string
  airlineCode: string
  airlineLogo: string | null
  flightNumber: string
  // Route
  origin: string
  destination: string
  departureTime: string
  arrivalTime: string
  departureDate: string   // YYYY-MM-DD extracted from departureTime
  arrivalDate: string     // YYYY-MM-DD extracted from arrivalTime
  duration: string        // raw ISO 8601 — format with formatDuration() for display
  durationMinutes: number
  stops: number
  segments: FlightSegmentSummary[]
}

export interface FlightOffer {
  id: string
  provider: FlightProvider
  // Outbound journey (first slice)
  airline: string
  airlineCode: string
  airlineLogo: string | null
  flightNumber: string
  origin: string
  destination: string
  departureTime: string
  arrivalTime: string
  departureDate: string   // YYYY-MM-DD extracted from departureTime
  arrivalDate: string     // YYYY-MM-DD extracted from arrivalTime
  duration: string
  durationMinutes: number
  stops: number
  // Pricing
  price: number
  currency: string
  // Fare pricing breakdown (from Duffel base_amount / tax_amount)
  baseAmount:    number       // pre-tax base fare
  taxAmount:     number | null // taxes; null when Duffel does not provide it
  // Cabin
  cabin: CabinClass
  // Fare conditions (null = airline did not report)
  refundAllowed: boolean | null
  changeAllowed: boolean | null
  changePenalty: number | null  // rebooking fee in `currency`; null = free or unknown
  // Return journey (for round trips)
  returnSlice: FlightSlice | null
  // Sortable total duration (outbound + return)
  totalDurationMinutes: number
}

export interface FlightSearchResponse {
  offers: FlightOffer[]
  searchId: string      // The Duffel offer_request id for reference
  provider: FlightProvider
  timestamp: string     // ISO datetime of when the search was performed
  count: number
}

// ─── API error shape returned to the frontend ─────────────────────────────────

export type ApiErrorCode =
  | 'VALIDATION_ERROR'
  | 'INVALID_AIRPORT'
  | 'INVALID_DATE'
  | 'NO_RESULTS'
  | 'PROVIDER_ERROR'
  | 'AUTH_ERROR'
  | 'RATE_LIMIT'
  | 'TIMEOUT'
  | 'INTERNAL_ERROR'

export interface ApiErrorResponse {
  error: string       // User-friendly message in Portuguese
  code: ApiErrorCode
}

// ─── Provider interface (extensibility) ──────────────────────────────────────
// New providers (Amadeus, TravelPayouts, etc.) must implement this interface.

export interface IFlightProvider {
  searchFlights(request: FlightSearchRequest): Promise<{ offerId: string; offers: FlightOffer[] }>
}

// ─── Raw Duffel API types (subset we actually consume) ───────────────────────
// Used only inside duffel-provider.ts. Never exported to the frontend.

export interface DuffelPassenger {
  type: 'adult' | 'child' | 'infant_without_seat'
}

export interface DuffelPlace {
  iata_code: string
  name: string
  city_name: string | null
}

export interface DuffelCarrier {
  name: string
  iata_code: string
  logo_symbol_url: string | null
  logo_lockup_url: string | null
}

export interface DuffelStop {
  iata_code: string
  duration: string
}

export interface DuffelSegment {
  operating_carrier: DuffelCarrier
  operating_carrier_flight_number: string
  origin: DuffelPlace
  destination: DuffelPlace
  departing_at: string
  arriving_at: string
  duration: string
  stops: DuffelStop[]
}

export interface DuffelSlice {
  id: string
  origin: DuffelPlace
  destination: DuffelPlace
  duration: string
  segments: DuffelSegment[]
}

export interface DuffelOffer {
  id: string
  total_amount: string
  total_currency: string
  base_amount: string
  base_currency: string
  tax_amount: string | null
  tax_currency: string | null
  slices: DuffelSlice[]
  passengers: DuffelPassenger[]
  conditions: {
    refund_before_departure: { allowed: boolean; penalty_amount: string | null } | null
    change_before_departure: { allowed: boolean; penalty_amount: string | null } | null
  } | null
}

export interface DuffelOfferRequestResponse {
  id: string
  offers: DuffelOffer[]
  slices: Array<{
    origin: DuffelPlace
    destination: DuffelPlace
    departure_date: string
  }>
  passengers: DuffelPassenger[]
  cabin_class: string
  created_at: string
}

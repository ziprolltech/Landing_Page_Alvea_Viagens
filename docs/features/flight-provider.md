# Feature: Flight Provider Backend

**Status:** Implemented and preserved, but **not called by the site since 2026-10-08**: the `/destinos` form currently ends in WhatsApp (`FLIGHT_SEARCH_ENABLED = false` in `BookingModal.tsx`) because the returned prices were too far from Google Flights. This backend stays in place to be reused or to receive a new provider.
**Related docs:** [features/flight-search-planning.md](./flight-search-planning.md), [integrations.md](../integrations.md), [technical-decisions.md](../technical-decisions.md)

---

## Purpose

A secure, provider-agnostic flight search backend that sits between the frontend and Duffel. The frontend never communicates with Duffel directly — it only calls our own Next.js API route, which runs exclusively on the server.

---

## Architecture

```
Frontend (BookingModal)
        ↓  POST /api/flights/search  (our own route)
        ↓
src/app/api/flights/search/route.ts    ← thin HTTP layer (parse, validate, respond)
        ↓
src/lib/services/flight-service.ts     ← business logic, logging, error mapping
        ↓
src/lib/providers/duffel-provider.ts   ← Duffel-specific: builds request, normalizes response
        ↓
src/lib/duffel/client.ts               ← raw HTTP to Duffel API (reads DUFFEL_API_KEY)
        ↓
Duffel API  (https://api.duffel.com)
```

**Principle:** Each layer knows only about the layer directly below it. The API route does not know Duffel exists. The service does not know what HTTP calls are made. The provider does not know what the API route returns to the client.

---

## File Map

| File | Role | Layer |
|---|---|---|
| `src/lib/types/flights.ts` | All shared TypeScript types and interfaces | Types |
| `src/lib/duffel/client.ts` | Raw HTTP client for Duffel API | Transport |
| `src/lib/providers/duffel-provider.ts` | Calls Duffel, normalizes response | Provider |
| `src/lib/services/flight-service.ts` | Validates input, selects provider, logs, maps errors | Service |
| `src/app/api/flights/search/route.ts` | Next.js POST handler — parses request, returns JSON | API |

---

## Security

### API Key Protection

- `DUFFEL_API_KEY` is read only inside `src/lib/duffel/client.ts`
- `client.ts` throws immediately if imported in a browser context (`typeof window !== 'undefined'`)
- The API key is never returned in any response body
- The API key is never logged
- The Next.js API route is server-side only — it is never bundled into client JavaScript

### Secret Isolation

The call chain that touches the API key is entirely inside `src/lib/duffel/`:

```
client.ts reads process.env.DUFFEL_API_KEY
    ↓
Set as Authorization header
    ↓
HTTP request to Duffel
    ↓
Raw response parsed
    ↓
Key is never referenced again
```

No other file has any awareness of the key's value or format.

### Error sanitization

Duffel error messages, codes, and internal details are never returned to the frontend. All errors pass through `flight-service.ts`'s `mapProviderError()` function, which converts them to fixed Portuguese user-facing strings before the API route returns them.

---

## Normalized Flight Model

All flight data returned by the API conforms to the `FlightOffer` interface defined in `src/lib/types/flights.ts`. This is the canonical shape — regardless of provider.

```typescript
interface FlightOffer {
  id: string               // Duffel offer ID
  provider: 'duffel'
  airline: string          // e.g. "LATAM Airlines"
  airlineCode: string      // e.g. "LA"
  airlineLogo: string | null
  flightNumber: string     // e.g. "LA3001"
  origin: string           // IATA (e.g. "GRU")
  destination: string      // IATA (e.g. "LIS")
  departureTime: string    // ISO datetime
  arrivalTime: string      // ISO datetime
  departureDate: string    // YYYY-MM-DD
  arrivalDate: string      // YYYY-MM-DD
  duration: string         // "12h 45m"
  durationMinutes: number  // for sorting
  stops: number            // 0 = non-stop
  price: number            // total price as float
  currency: string         // e.g. "BRL"
  cabin: CabinClass
  returnSlice: FlightSlice | null   // inbound journey for round trips
  totalDurationMinutes: number      // outbound + return for sort
}
```

---

## Request / Response

### POST `/api/flights/search`

**Request body:**
```json
{
  "origin": "GRU",
  "destination": "LIS",
  "departureDate": "2025-12-01",
  "returnDate": "2025-12-15",
  "adults": 2,
  "children": 0,
  "infants": 0,
  "cabinClass": "economy"
}
```

**Success response (200):**
```json
{
  "offers": [...],
  "searchId": "orq_0000AhPaYMvFJXY3LHmjx4",
  "provider": "duffel",
  "timestamp": "2025-12-01T14:32:00.000Z",
  "count": 12
}
```

**Error response:**
```json
{
  "error": "Um dos aeroportos informados não foi encontrado.",
  "code": "INVALID_AIRPORT"
}
```

### HTTP Status Codes

| Code | Meaning |
|---|---|
| 200 | Success — offers returned |
| 404 | Success but no flights found for these parameters |
| 422 | Validation error — invalid input fields |
| 429 | Rate limited — too many requests |
| 500 | Internal server error |
| 502 | Provider error (Duffel returned an error) |
| 504 | Timeout — Duffel took too long |

---

## Input Validation

The service validates every field before calling Duffel:

| Field | Rule |
|---|---|
| `origin` | 3-letter uppercase IATA code |
| `destination` | 3-letter uppercase IATA code, must differ from origin |
| `departureDate` | YYYY-MM-DD, today or future |
| `returnDate` | YYYY-MM-DD, strictly after departureDate |
| `adults` | Integer ≥ 1 |
| `children` | Integer ≥ 0 |
| `infants` | Integer ≥ 0, cannot exceed adults |
| `passengers total` | ≤ 9 (Duffel limit) |
| `cabinClass` | One of: economy, premium_economy, business, first |

---

## Logging

Server-side logging uses `console.log` / `console.error` (visible in Next.js server output and in Vercel/Railway logs).

**What is logged:**
- Search request (sanitized: no personal data, no API key)
- Search result count and elapsed time
- Provider errors (error code and HTTP status only)
- Unexpected errors (message only, no stack trace in production)

**What is never logged:**
- `DUFFEL_API_KEY` or any API key
- Full raw Duffel responses (could contain PII or pricing strategies)
- Customer email, phone, or payment data

---

## Adding a New Provider

To add Amadeus (or any other flight API):

1. Create `src/lib/providers/amadeus-provider.ts` implementing `IFlightProvider`
2. `searchFlights()` must return `{ offerId: string; offers: FlightOffer[] }`
3. All response normalization happens inside the provider — the service gets only `FlightOffer[]`
4. Register the provider in the `providers` registry inside `flight-service.ts`
5. Update the `selectProvider()` function to support the new provider (e.g., via env flag)
6. Add to the `FlightProvider` union type in `types/flights.ts`

The API route, service validation, and frontend are completely unaffected.

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `DUFFEL_API_KEY` | Yes | Duffel API key (test starts with `duffel_test_`) |
| `DUFFEL_ENV` | No | `'test'` or `'production'` (informational, not used in code) |

For development: set in `.env.local` (already done).
For production: set in Vercel/Railway environment dashboard — never commit to git.

---

## Current Limitations (Phase 1)

- The frontend (`BookingModal.tsx`) still uses mock flights. Phase 2 will wire the modal to this API.
- `DUFFEL_ENV` is not used in code — it is informational only. The environment is determined by the API key prefix (`duffel_test_` vs `duffel_live_`).
- Offers are sorted by price ascending. Future: allow client to sort by duration or stops.
- No caching. Each search hits Duffel directly. Future: cache results by `searchId` in Redis/Upstash for a short TTL.
- No offer selection or booking. Duffel offer booking (`POST /air/orders`) is not yet implemented.

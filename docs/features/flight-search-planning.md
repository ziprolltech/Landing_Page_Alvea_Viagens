# Feature: Flight Search Planning (Duffel API)

**Status:** Planned — not yet implemented
**Related docs:** [integrations.md](../integrations.md), [future-roadmap.md](../future-roadmap.md), [known-issues.md](../known-issues.md), [features/booking-modal.md](./booking-modal.md)

---

## Purpose

This document plans the integration of real flight search into the existing booking modal. Currently, the modal ends with mock flight results. This integration would replace them with live availability and pricing from the Duffel API.

---

## Current State

After the user completes Step 5 (cabin class selection) in `BookingModal.tsx`:
- A 1.5s simulated search animation plays
- Two hardcoded mock flights appear (LATAM and TAP Air Portugal)
- Each has a "Falar no WhatsApp" button that generates a pre-filled message

The WhatsApp conversion works correctly today. The mock flights are a placeholder demonstrating the intended UX.

---

## Target State

After integration:
- The 1.5s simulated search becomes a real API call to Duffel
- Real flight offers (5–10 results) are returned and displayed
- Each offer shows: airline, flight number, times, stops, duration, price, miles estimate
- The "Falar no WhatsApp" message includes the real flight number and price
- A loading skeleton replaces the spinner for a more polished waiting experience

---

## Duffel API Overview

Duffel is a flight distribution API that aggregates inventory from multiple airlines. Key endpoints:

| Endpoint | Purpose |
|---|---|
| `POST /air/offer_requests` | Initiate a flight search (returns an `offer_request_id`) |
| `GET /air/offers?offer_request_id=...` | Retrieve available flight offers |
| `POST /air/orders` | Book a flight (future — beyond current scope) |

Duffel uses a "partial offer" model — the search returns offers asynchronously. A polling loop or webhook may be needed for complete results.

---

## Data Mapping: BookingState → Duffel

### Origin/Destination

The `originAirport` field in `BookingState` is stored as `"City Name (IATA)"` (e.g., `"São Paulo (GRU)"`). The IATA code must be extracted:

```typescript
const extractIATA = (airportString: string): string => {
  const match = airportString.match(/\(([A-Z]{3})\)$/)
  return match ? match[1] : ''
}
```

The destination IATA code is not currently in the `Destination` type. **This must be added before integration can proceed.** See [known-issues.md](../known-issues.md#destination-iatacode-missing-from-type-blocks-duffel-integration).

### Passengers

```typescript
const mapPassengers = (passengers: string) => {
  switch (passengers) {
    case '1':        return [{ type: 'adult' }]
    case '2':        return [{ type: 'adult' }, { type: 'adult' }]
    case 'Família':  return [{ type: 'adult' }, { type: 'adult' }, { type: 'child' }, { type: 'child' }]
    case 'Grupo':    return Array(6).fill({ type: 'adult' })  // default to 6 for groups
  }
}
```

**Note:** "Família" and "Grupo" passenger counts are assumptions. Collect actual counts if precision is required — the current UI does not ask for exact numbers beyond these categories.

### Cabin Class

```typescript
const mapCabinClass = (flightClass: string) => {
  switch (flightClass) {
    case 'Econômica':          return 'economy'
    case 'Econômica Premium':  return 'premium_economy'
    case 'Executiva':          return 'business'
    case 'Primeira Classe':    return 'first'
  }
}
```

### Full Request Body

```typescript
const offerRequest = {
  slices: [
    {
      origin:         extractIATA(bookingState.originAirport),
      destination:    destination.iataCode,  // needs to be added to Destination type
      departure_date: bookingState.departureDate,
    },
    {
      origin:         destination.iataCode,
      destination:    extractIATA(bookingState.originAirport),
      departure_date: bookingState.returnDate,
    },
  ],
  passengers:   mapPassengers(bookingState.passengers),
  cabin_class:  mapCabinClass(bookingState.flightClass),
}
```

---

## Implementation Steps

### Step 1: Add `iataCode` to Destination type

In `src/app/destinos/page.tsx`:
```typescript
type Destination = {
  // ... existing fields
  iataCode: string   // IATA code of the primary airport for this destination
}
```

Fill in the code for each destination entry. For cities with multiple airports (e.g., New York: JFK/EWR/LGA), use the most common international one (JFK for New York).

### Step 2: Create the API route

`src/app/api/flights/search/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const body = await req.json()
  
  const response = await fetch('https://api.duffel.com/air/offer_requests', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.DUFFEL_API_KEY}`,
      'Duffel-Version': 'v2',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ data: body }),
  })
  
  const data = await response.json()
  return NextResponse.json(data)
}
```

The API key must be server-side only (`DUFFEL_API_KEY`, no `NEXT_PUBLIC_` prefix).

### Step 3: Update BookingModal

Replace the `setTimeout` mock search with a real fetch:

```typescript
const searchFlights = async () => {
  setIsSearching(true)
  try {
    const res = await fetch('/api/flights/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(buildDuffelRequest(bookingState, destination)),
    })
    const data = await res.json()
    setFlightResults(data.data.offers || [])
  } catch (err) {
    setFlightError(true)
  } finally {
    setIsSearching(false)
    setShowResults(true)
  }
}
```

### Step 4: Render real offers

Map Duffel offer objects to the flight card UI. Key fields from a Duffel offer:
- `offer.slices[0].segments[0].operating_carrier.name` — airline name
- `offer.slices[0].segments[0].departing_at` — departure datetime
- `offer.slices[0].segments[0].arriving_at` — arrival datetime
- `offer.total_amount` + `offer.total_currency` — price
- `offer.slices[0].segments.length - 1` — number of stops

### Step 5: Update WhatsApp message

Include the real flight number and booking reference in the message:
```
Vi o voo *{airline} {flightNumber}* por *R${price}*.
```

---

## Error Handling

Add error states for:
- API timeout (Duffel can be slow on first search)
- No results found
- API error (5xx from Duffel)

**Fallback:** If Duffel fails, show the mock flights with a "Resultados aproximados" disclaimer and offer the WhatsApp CTA anyway. Never show a blank screen.

---

## Environment Variables

```bash
# .env.local
DUFFEL_API_KEY=duffel_live_xxxxxxxxxxxxxxxxxxxxxxxx
```

Use `duffel_test_...` for development/testing. Duffel provides a test environment with simulated airline responses.

---

## Estimated Effort

| Task | Estimate |
|---|---|
| Add `iataCode` to all destinations | 2–3 hours |
| API route + Duffel integration | 4–6 hours |
| BookingModal state + UI updates | 3–4 hours |
| Real offer rendering + formatting | 3–4 hours |
| Error handling + fallbacks | 2 hours |
| Testing with Duffel test environment | 2–3 hours |
| **Total** | **~2 business days** |

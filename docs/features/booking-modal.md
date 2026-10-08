# Feature: Booking Modal

**Component:** `src/components/booking/BookingModal.tsx`
**Triggered from:** `src/app/destinos/page.tsx` (destination card click)
**Related docs:** [booking-flow.md](../booking-flow.md), [components.md](../components.md), [known-issues.md](../known-issues.md), [features/flight-provider.md](./flight-provider.md)

---

## Purpose

The booking modal is the **primary conversion component**. It collects the user's travel preferences across 5 steps, performs a live flight search via the Duffel API, and exits by opening WhatsApp with a pre-filled message containing both the booking context and specific flight details. It is the bridge between casual browsing and an active lead conversation with a specialist.

---

## Architecture

```
destinos/page.tsx
    → selectedDestination state (null | Destination)
    → <BookingModal destination={...} onClose={...} />
        → ReactDOM.createPortal → document.body (z-index 9999)
            → Backdrop (fixed, full screen, blurred)
            → Modal panel (rounded, glassmorphism)
                → Header (destination photo + name + iataCode)
                → Progress bar (5 segments, gold gradient)
                → Step content (AnimatePresence direction-aware slide)
                    → Step 1: <AirportAutocomplete />
                    → Step 2: Date input (departure)
                    → Step 3: Date input (return)
                    → Step 4: Passenger selector (grid)
                    → Step 5: Cabin class selector (list)
                    → Searching state (spinner + 3 skeleton cards)
                    → Step 6: Results / Empty / Error
                → Footer CTA (context-aware per step/state)
```

---

## User Flow

1. User clicks a destination card on `/destinos` → modal opens
2. Steps 1–5: user fills in origin airport, departure date, return date, passengers, cabin class
3. Step 5 "Buscar disponibilidade" → `performSearch()` fires → searching state appears
4. During search: gold spinner + "Buscando os melhores voos…" + 3 animated skeleton cards
5. On success with results → `RealFlightCard` list (staggered 80ms entrance)
6. On success with no results → empty state illustration + "Alterar pesquisa" / "Falar com especialista"
7. On API error → calm amber alert card + "Editar pesquisa" / "Tentar novamente"
8. Each flight card has "Solicitar emissão com milhas" → WhatsApp opens with pre-filled message containing full booking + flight details

---

## State Machine

```typescript
// Core state
step:      number         // 1–5 (form), 6 (results)
dir:       1 | -1         // animation direction
searching: boolean        // true while fetch is in flight
offers:    FlightOffer[]  // results from API
apiError:  string | null  // error message to display

// Immutable refs (no re-render on change)
searchInProgress: useRef<boolean>       // dedup guard
lastSearchKey:    useRef<string>        // cache key
cachedOffers:     useRef<FlightOffer[]> // last successful result
```

`activeKey` drives AnimatePresence:
- `'step1'` … `'step5'` → form steps
- `'searching'` → loading state (overrides step)
- `'step6'` → results/error/empty

---

## Technical Implementation

### Portal Rendering

The modal renders via `ReactDOM.createPortal(content, document.body)`. Mandatory because destination cards have `overflow: hidden` (photo zoom animation). Without a portal, the modal would be clipped.

**Z-index stack:**
- Modal backdrop: 9999
- Airport dropdown: 99999 (above the modal)

### Frontend → API Value Mapping

Frontend passenger/cabin values are different from what the Duffel API expects. The mapping happens inside `performSearch()`:

| Frontend | API |
|---|---|
| `'1'` | `{ adults: 1 }` |
| `'2'` | `{ adults: 2 }` |
| `'familia'` | `{ adults: 2, children: 2 }` |
| `'grupo'` | `{ adults: 6 }` |

| Frontend class | API cabin |
|---|---|
| `'economica'` | `'economy'` |
| `'economica-premium'` | `'premium_economy'` |
| `'executiva'` | `'business'` |
| `'primeira-classe'` | `'first'` |

### IATA Code Extraction

`AirportAutocomplete` returns labels in `"City (IATA)"` format (e.g., `"São Paulo (GRU)"`). The `extractIata()` helper extracts the code:

```typescript
function extractIata(label: string): string {
  const m = label.match(/\(([A-Z]{3})\)/)
  return m ? m[1] : label.trim().toUpperCase().slice(0, 3)
}
```

### Caching & Deduplication

- `searchInProgress` ref: prevents submitting a new search while one is in flight
- `lastSearchKey` ref: string composed of `origin|destination|departure|return|passengers|class`
- `cachedOffers` ref: stores the last successful `FlightOffer[]`
- If the same search parameters are submitted again, the cached result is returned immediately (no API call)
- On retry, `lastSearchKey` is cleared to force a fresh API call

### Body Scroll Lock

```javascript
useEffect(() => {
  document.body.style.overflow = 'hidden'
  return () => { document.body.style.overflow = '' }
}, [])
```

### WhatsApp Messages

**General footer CTA** (generic, no specific flight):
```
Olá! Quero viajar para *{destination.name}*.
• Origem: {originAirport}
• Ida: {departureDate}
• Volta: {returnDate}
• Passageiros: {paxLabel}
• Classe: {classLabel}

Gostaria de saber as melhores opções com milhas!
```

**Per-card CTA** (specific flight):
```
Olá! Quero solicitar a emissão por milhas para o seguinte voo:

✈ {airline} – {flightNumber}
📍 {origin} → {destination}
📅 Ida: {departureDate formatted} às {departureTime}
📅 Volta: {returnDate formatted}
⏱ Duração: {duration} · {stops}
💺 Classe: {classLabel}
👥 Passageiros: {paxLabel}
💰 Preço referência: {currency} {price}

Aguardo orientações sobre a melhor emissão com milhas!
```

Both are URI-encoded and appended to `https://wa.me/5516997315748?text=`.

---

## Sub-Components

| Component | Purpose |
|---|---|
| `StepShell` | Header + counter for each form step |
| `OptionBtn` | Selectable option card (passenger/cabin selectors) |
| `SkeletonCard` | Animated shimmer placeholder matching `RealFlightCard` layout |
| `RealFlightCard` | Premium flight result card with times, path, price, CTA |

---

## Visual Design (Phase 2B)

### RealFlightCard layout

```
┌─────────────────────────────────────────────────────────┐
│ [Logo 40px]  Airline Name           [Cabin Badge]       │
│              Flight Number                              │
│                                                         │
│  09:20      ─────── ✈ (floats) ────────     22:15      │
│  GRU                                        CDG         │
│                                                         │
│                  ⏱ 11h45 · [Direto]                    │
│                                                         │
│  ┌─────────────── Gold Price Box ──────────────────┐    │
│  │  A PARTIR DE                                    │    │
│  │  R$  4.352  (30px black)                        │    │
│  │  Encontrado hoje · Sujeito à disponibilidade    │    │
│  └─────────────────────────────────────────────────┘    │
│                                                         │
│  [   ✉ Solicitar emissão com milhas   ] (green)         │
└─────────────────────────────────────────────────────────┘
```

### Card interaction
- Initial entrance: `opacity: 0, y: 22, blur: 6px → opacity: 1, y: 0, blur: 0` with 80ms stagger
- Hover: `y: -4px` + `boxShadow: 0 18px 52px rgba(0,0,0,0.42), 0 0 0 1px rgba(212,168,83,0.20)`
- Hover transition: 240ms ease

### Stops badges
- Direct: emerald green tint — `rgba(52,211,153,0.10)` border + `#34D399` text
- 1+ stops: amber tint — `rgba(251,191,36,0.10)` border + `#FBBF24` text

### SkeletonCard shimmer
- Structural sections match `RealFlightCard` layout exactly
- Single `motion.div` shimmer overlay (`x: '-100%' → '200%'`) traverses the whole card
- 1.8s linear repeat with staggered `delay` per card

---

## Files Involved

| File | Role |
|---|---|
| `src/components/booking/BookingModal.tsx` | The modal, all steps, all states |
| `src/components/booking/AirportAutocomplete.tsx` | Origin airport search (Step 1) |
| `src/app/destinos/page.tsx` | Opens/closes modal; provides `iataCode` on destination |
| `src/lib/types/flights.ts` | `FlightOffer`, `CabinClass` types used in results |
| `src/app/api/flights/search/route.ts` | API endpoint called by `performSearch()` |

---

## Dependencies

- **Framer Motion** — modal enter/exit, step transitions, card stagger, skeleton shimmer, plane float
- **ReactDOM** — portal rendering to `document.body`
- **Lucide React** — X, ChevronLeft/Right, Plane, Calendar, Users, Clock, MessageCircle, AlertCircle, RefreshCw, MapPin

---

## What Must NOT Change

- The 5-step form structure (steps 1–5)
- The `performSearch()` function and its API call format
- The caching and deduplication logic
- The WhatsApp message format and phone number
- The portal rendering approach
- The body scroll lock pattern
- The `extractIata()` function
- The `PASSENGER_MAP` and `CABIN_MAP` mappings

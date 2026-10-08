# Booking Flow

The booking flow is the primary conversion mechanism of the site. It transforms a visitor's browsing intent into a warm, context-rich WhatsApp lead containing full booking context and both selected flights (outbound + return).

> **Current state (2026-10-08): live flight search is switched off.**
> The five-step form on `/destinos` no longer calls the flight API. On the last step, "Buscar disponibilidade" validates as before and opens Alvea's WhatsApp with the request already written (origin, destination, dates, passengers, class); the visitor presses "Enviar" there. No results, loading or error screens are shown.
>
> Why: the prices returned by the current flight API differ too much from what customers find on Google Flights. A new provider will be added when a reliable source of prices is found.
>
> Nothing was deleted. The switch is `FLIGHT_SEARCH_ENABLED` in `src/components/booking/BookingModal.tsx` (currently `false`); `performSearch()`, the results / return / summary phases, `/api/flights/search` and the provider layer are intact. Setting it to `true` restores the flow described in the rest of this document, which is kept as the reference for that future state.
>
> The message is built by `buildTripRequestMessage()` in `src/lib/destinos/whatsapp-message.ts` and the link by the shared `buildWhatsAppUrl()` (`src/lib/config/links.ts`).

---

## Complete Customer Journey

```
User browses homepage or destinations page
           ↓
Clicks a destination card
           ↓
BookingModal opens (animated slide-up from bottom on mobile, centered on desktop)
           ↓
Progress bar appears (5 segments, form steps only)
           ↓
Step 1: Origin Airport
  User types city or IATA code
  AirportAutocomplete shows tiered dropdown results
  User selects airport → stored as "São Paulo (GRU)" format
           ↓
Step 2: Departure Date  (HTML date picker, minimum: today)
           ↓
Step 3: Return Date  (minimum: departure date)
           ↓
Step 4: Number of Passengers  (button grid: 1 | 2 | Família | Grupo)
           ↓
Step 5: Flight Class  (Econômica | Econômica Premium | Executiva | Primeira Classe)
           ↓
"Buscar disponibilidade" → loading state
  Gold spinner + "Buscando os melhores voos…" + 3 skeleton cards
           ↓
POST /api/flights/search (real Duffel API call)
           ↓
  ┌─── Success with results ──────────────────────────────────────────────────┐
  │                                                                           │
  │  PHASE: OUTBOUND  (Passo 1 de 2)                                         │
  │  ─────────────────────────────────────────────────────────────────────── │
  │  FlightFilters bar: sort · stops · departure period (no airline filter)   │
  │  Unique outbound FlightCards (one per physical outbound flight,           │
  │  cheapest round-trip price shown as "A partir de")                        │
  │  "Selecionar voo de ida →" on each card                                  │
  │  Footer: "Editar pesquisa" (returns to Step 1)                           │
  │                                                                           │
  │           ↓ user selects outbound                                         │
  │                                                                           │
  │  PHASE: RETURN  (Passo 2 de 2)                                           │
  │  ─────────────────────────────────────────────────────────────────────── │
  │  SelectedFlightBanner (compact outbound recap + "Alterar")               │
  │  FlightFilters bar (reset to defaults)                                   │
  │  Return FlightCards for that outbound (price = full round-trip total)    │
  │  "Selecionar voo de volta →" on each card                               │
  │  Footer: ← (back to outbound) | "Editar pesquisa"                       │
  │                                                                           │
  │           ↓ user selects return                                           │
  │                                                                           │
  │  PHASE: SUMMARY                                                           │
  │  ─────────────────────────────────────────────────────────────────────── │
  │  TripSummary: outbound SliceRow + return SliceRow + total price box      │
  │  "Solicitar emissão com milhas" → WhatsApp with full dual-flight message │
  │  Footer: "← Alterar voo de volta"                                        │
  │                                                                           │
  └───────────────────────────────────────────────────────────────────────────┘

  ┌─── Any non-200 response (including "no flights", HTTP 404) ────────┐
  │  Alert card "Não foi possível buscar os voos" + generic message   │
  │  Buttons: "Editar pesquisa" | "Tentar novamente"                  │
  └───────────────────────────────────────────────────────────────────┘

  ┌─── Empty state (designed, currently unreachable) ──────────────────┐
  │  "Nenhum voo disponível" illustration + message                   │
  │  Buttons: "Alterar pesquisa" | "Falar com especialista" (WhatsApp)│
  └───────────────────────────────────────────────────────────────────┘
```

> **Real behavior vs. design (October 2026 audit).** The API reports "no flights" as HTTP 404 `NO_RESULTS`, and the modal treats every non-OK response as an error, so the empty state never renders. In addition the modal reads `data.message` while the API sends `{ error, code }`, so the text shown is always the fallback "Erro ao buscar voos. Tente novamente." — never the specific Portuguese message from the server.

The flow is **round-trip only**. There is no one-way search.

---

## Step-by-Step Detail

### Step 1 — Origin Airport

**Component:** `AirportAutocomplete`

The user types their city name, airport name, or IATA code. The search is:
- Accent-insensitive (`São Paulo` matches when typing `sao paulo`)
- Tiered priority: exact IATA → IATA prefix → city prefix → name prefix → city contains → name contains → Fuse.js fuzzy
- Shows up to 7 results in a dropdown portal (renders via `createPortal` to escape modal overflow)

**Output format:** `"São Paulo (GRU)"` — stored as the `originAirport` field in `BookingState`.

**Extraction at search time:** `extractIata("São Paulo (GRU)")` → `"GRU"` via regex `/\(([A-Z]{3})\)/`.

### Step 2 — Departure Date

HTML `<input type="date">`. Minimum is today's date. Stored as `YYYY-MM-DD`.

### Step 3 — Return Date

Same as Step 2. The `min` attribute is dynamically set to the `departureDate` value from Step 2.

Mismatch: the picker allows the **same day** as departure, but the server requires the return date to be strictly after departure, so a same-day return ends in the generic error screen. "Today" is computed in UTC on both sides, so after 21:00 Brasília time the minimum date is already tomorrow.

### Step 4 — Passengers

Four buttons presented in a 2×2 grid:

| Label | API mapping |
|---|---|
| 1 passageiro | `{ adults: 1 }` |
| 2 passageiros | `{ adults: 2 }` |
| Família | `{ adults: 2, children: 2 }` |
| Grupo | `{ adults: 6 }` |

Selected button gets gold border and background.

Children are sent without ages, infants cannot be selected, and "Grupo" (labelled "6+ passageiros") always searches exactly 6 adults. The price returned is the total for all passengers in the mapping.

### Step 5 — Flight Class

Four options in a vertical list:

| Label | API value |
|---|---|
| Econômica | `economy` |
| Econômica Premium | `premium_economy` |
| Executiva | `business` |
| Primeira Classe | `first` |

Selected option gets gold border + background highlight.

### Searching State

After the user selects class and taps "Buscar disponibilidade":
- `performSearch()` is called
- A gold spinner (`rotate: 360, repeat: Infinity`) appears
- Status text: "Buscando os melhores voos…"
- Three `SkeletonCard` placeholders animate below (structural layout with shimmer overlay)
- `POST /api/flights/search` runs server-side via the Duffel provider

### Flight Phases (after search)

The modal uses a `flightPhase: 'outbound' | 'return' | 'summary' | null` state variable.  
The `activeKey` driving `AnimatePresence` is: `searching | flightPhase | step${step}`.

**Phase: outbound**
- Header: route label (GRU → MCO), date range, pax, class
- `FlightFilters` bar (sticky above scroll area)
- `FlightCard` list — one per unique outbound flight, showing cheapest paired total as "A partir de"
- Clicking "Selecionar voo de ida →" calls `handleSelectOutbound(offer)` → stores `selectedOffer`, resets filters, advances to `return` phase
- Empty + error states render here

**Phase: return**
- `SelectedFlightBanner` (compact recap of selected outbound, "Alterar" → back to outbound)
- `FlightFilters` bar (fresh defaults, applies to return slice fields)
- `FlightCard` list — one per unique return flight paired with the selected outbound, price = full round-trip total (labels: "Itinerário selecionado" / "Valor total da viagem" / "Valor total de ida e volta"; the text "Total ida + volta" is not used anywhere)
- Clicking "Selecionar voo de volta →" calls `handleSelectReturn(offer)` → stores `matchedOffer`, advances to `summary`

### How state carries between phases

| State | Meaning |
|---|---|
| `offers` | Every `FlightOffer` returned by the API. Each one is a complete round trip (outbound fields + `returnSlice`) with one total price. |
| `selectedOffer` | The offer behind the outbound card the user clicked. It only identifies the outbound flight (via `buildOutboundKey`); its price is the cheapest combination, not necessarily the final one. |
| `returnOffers` (memo) | Offers whose outbound key equals `selectedOffer`'s, one per unique return flight, cheapest kept. |
| `matchedOffer` | The offer behind the return card the user clicked: the exact Duffel offer for (chosen outbound + chosen return). `TripSummary` and the WhatsApp message read everything from it, including the price. |
| `filters` | Shared by both lists; reset to defaults when an outbound is chosen and when going back to the outbound list. |

All of it lives in `BookingModal` (`useState`); nothing is persisted, and closing the modal discards the search.

**Phase: summary**
- `TripSummary` component
- Renders two `SliceRow` cards (outbound + return)
- Total price from `matchedOffer.price` (Duffel `total_amount`, full round-trip)
- "Solicitar emissão com milhas" → WhatsApp CTA with complete dual-flight message

**Empty (no flights found):** Coded inside the outbound phase — glowing plane illustration + "Nenhum voo disponível" + "Alterar pesquisa" + "Falar com especialista" buttons — but unreachable today (see the note at the top of this file).

**Error:** Rendered inside outbound phase — alert card titled "Não foi possível buscar os voos" with the generic fallback text. "Editar pesquisa" + "Tentar novamente" buttons. This is also what a no-result search shows.

---

## Caching and Deduplication

```typescript
// Deduplication — prevents double-submitting while a fetch is in flight
searchInProgress: useRef<boolean>

// Cache key — composed of all 6 search parameters
lastSearchKey: useRef<string>  // "GRU|CDG|2026-08-01|2026-08-10|1|economy"

// Cached result — returned immediately on identical search
cachedOffers: useRef<FlightOffer[]>
```

If the same 6 parameters are submitted again (e.g., user goes back and clicks "Buscar" again), the cached result is shown instantly without a new API call. On "Tentar novamente", the cache is cleared to force a fresh API call.

---

## WhatsApp Message Generation

### Pricing model

Every Duffel Offer is an **atomic round-trip package**. `total_amount` covers both slices together **and all passengers in the search** — there is no per-slice or per-passenger price. `base_amount` and `tax_amount` are also returned at the offer level. Verified in the October 2026 audit against a live test-mode search (base 486.45 + tax 87.56 = total 574.01).

**Currency and formatting (current behavior):**
- The currency is whatever Duffel returns in `total_currency`. With the configured test key that is **USD**. There is no conversion to BRL.
- Display: `R$` when the currency is `BRL`, otherwise the raw code, followed by `Intl.NumberFormat('pt-BR')` of `Math.floor(amount)` — e.g. `USD 574`. Cents are truncated, and base and tax are truncated separately.
- No label says that the total is for all passengers.
- Some offers arrive with a null flight number from Duffel and are displayed as e.g. `TPnull` (cards and WhatsApp message).

**How prices are displayed:**

| Step | Label | Value |
|---|---|---|
| Step 1 (outbound list) | "VIAGEM COMPLETA · A partir de" | Cheapest `total_amount` among all combos that include this outbound |
| Step 2 (return list) | "ITINERÁRIO SELECIONADO · Valor total da viagem" | `total_amount` of this specific (outbound, return) offer |
| Trip Summary | "Valor total da viagem" | `matchedOffer.price` = `total_amount`; breakdown shown when `taxAmount != null` |

### CTA location: `TripSummary`

After both flights are selected, a single "Solicitar emissão com milhas" CTA inside `TripSummary` opens WhatsApp with a complete message covering both legs, a price breakdown, and fare conditions.

The message is composed in `buildWaMessage()` inside `TripSummary.tsx` and encoded once with `encodeURIComponent()`.
Emoji constants come from `src/lib/utils/wa-emojis.ts` (built with `String.fromCodePoint()` to avoid 4-byte UTF-8 corruption via redirect services).
URL uses `https://api.whatsapp.com/send?phone=5516997315748&text=…` (direct endpoint — not `wa.me`, which corrupts supplementary-plane emoji). Opens in a new tab.

**Full message template:**

```
✈️ *Olá!*

Acabei de realizar uma pesquisa no site da *Alvea Viagens* e gostaria
de verificar a possibilidade de emitir as passagens abaixo utilizando
*milhas*, caso seja mais vantajoso.

━━━━━━━━━━━━━━━━━━
📋 *RESUMO DA PESQUISA*
━━━━━━━━━━━━━━━━━━

🛫 *Origem:*
São Paulo (GRU)

🛬 *Destino:*
Orlando (MCO)

📅 *Data de ida:*      ← fmtDate(offer.departureDate)
15/12/2025

📅 *Data de volta:*    ← fmtDate(returnSlice.departureDate)
22/12/2025

👥 *Passageiros:*
2 passageiros

💺 *Classe:*
Econômica

━━━━━━━━━━━━━━━━━━
🛫 *VOO DE IDA SELECIONADO*
━━━━━━━━━━━━━━━━━━

🏢 *Companhia aérea:*
LATAM Airlines

🔢 *Número do voo:*
LA8100

🛫 *Saída:*
08:15 · 15/12/2025

🛬 *Chegada:*
14:30 · 15/12/2025

⏱️ *Duração:*
9h 15min

🛑 *Escalas:*
Direto

━━━━━━━━━━━━━━━━━━
🛬 *VOO DE VOLTA SELECIONADO*
━━━━━━━━━━━━━━━━━━

🏢 *Companhia aérea:*
American Airlines

🔢 *Número do voo:*
AA932

🛫 *Saída:*
16:45 · 22/12/2025

🛬 *Chegada:*
04:20 · 23/12/2025

⏱️ *Duração:*
11h 35min

🛑 *Escalas:*
1 escala

━━━━━━━━━━━━━━━━━━
💰 *VALOR DA VIAGEM*
━━━━━━━━━━━━━━━━━━

← When taxAmount is available (most airlines):
Preço base: USD 560
Taxas: USD 103
──────────────
*TOTAL: USD 663*

← When taxAmount is null (some airlines):
*USD 663*

✓ Ida incluída
✓ Volta incluída
✓ Classe: Econômica
✓ Passageiros: 2 passageiros
✓ Cia. aérea: LATAM Airlines

← Fare conditions line (omitted when both fields are null):
ℹ️ _Tarifa: Alteração com taxa de USD 120 · Não reembolsável_

━━━━━━━━━━━━━━━━━━

💬 Aguardo o orçamento.

Muito obrigado! 😊

━━━━━━━━━━━━━━━━━━
```

**Fallback message:** A simpler message built in `BookingModal` (search parameters only, dates in raw `YYYY-MM-DD`) is attached to the "Falar com especialista" button of the empty state via `waFallbackHref` (also `api.whatsapp.com/send`). The error state has no WhatsApp button, and since the empty state is unreachable today, this message is effectively never sent.

**Section purposes:**

| Section | Purpose |
|---|---|
| Intro paragraph | Sets context — found via site, wants miles pricing as alternative |
| RESUMO DA PESQUISA | Full requirements: route, dates, pax, class |
| VOO DE IDA / VOLTA | Exact selected flights: airline, number, times, duration, stops |
| VALOR DA VIAGEM | Cash price with optional breakdown, inclui checklist, fare conditions |
| Closing | Professional, warm tone; invites specialist to respond |

**Why this structure converts:** The specialist receives everything in one message. The price breakdown (fare + taxes) provides an anchor for the miles offer. The fare conditions inform the specialist about flexibility, which affects which miles program to use.

### General footer CTA (results header)

When no specific flight is selected (the "Falar com especialista" empty-state button — the results-view footer has no WhatsApp button):

```
Olá! Quero viajar para *[Destination Name]*.
• Origem: [originAirport]
• Ida: [departureDate]
• Volta: [returnDate]
• Passageiros: [paxLabel]
• Classe: [classLabel]

Gostaria de saber as melhores opções com milhas!
```

This is a shorter message for users who want to talk to a specialist without committing to a specific flight.

---

## Navigation Within the Modal

- **Forward:** "Continuar" / "Buscar disponibilidade" button. Disabled until current step has a value.
- **Back:** Chevron-left button (visible from Step 2 onward).
- **Close:** X button in the top-right corner of the hero image. Also: clicking the backdrop closes the modal. The Escape key does not close it, and focus is not trapped inside.
- **Step transitions:** Direction-aware slide (forward = slides content left, backward = slides right). Framer Motion `AnimatePresence` with `custom` direction prop.

---

## Body Scroll Lock

While the modal is open:
```javascript
document.body.style.overflow = 'hidden'
```

On close (cleanup function):
```javascript
document.body.style.overflow = ''
```

Restores to empty string (not `'auto'`) to respect the page's default stylesheet behavior.

---

## Portal Architecture

`BookingModal` uses `ReactDOM.createPortal(content, document.body)`:

1. Destination cards have `overflow: hidden` (photo zoom effect) — without a portal, the modal is clipped.
2. Renders at z-index 9999, above all other page content.

`AirportAutocomplete` also uses a portal for its dropdown (z-index 10001 — above the modal itself) because the modal also uses `overflow: hidden`.

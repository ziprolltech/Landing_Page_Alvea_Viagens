# Full Project State Audit — October 2026

**Audit date:** 2026-10-06
**Scope:** read-only audit of the whole repository. No code, config, or dependency was changed. Only files under `docs/` were updated afterwards.
**Rule applied:** the code is the source of truth. Where docs and code disagreed, the code was recorded as the real state and the docs were corrected.

**How things were verified**

| Method | What it covered |
|---|---|
| Full read of every file under `src/` and all root config files | Structure, pages, components, backend |
| `npm ls`, `npm outdated`, `npm audit` (no `fix`) | Installed versions and vulnerabilities |
| `npx tsc --noEmit --incremental false`, `npx eslint src` | Type and lint state |
| Requests against the local dev server (`GET /`, `POST /api/flights/search`) | Headers, validation, error shape |
| One real search through the API (GRU → LIS, 1 adult, economy, Duffel **test** key) | Currency, counts, field coverage |
| Compiled dev CSS (`.next/static/css/app/layout.css`) | Which Tailwind classes are really generated |
| HTTP check of all 28 destination photo URLs | Broken images, download weight |

**Not verified:** `next build` was not run (it would have overwritten the `.next` folder of the running dev server). Visual content of photos was not inspected — only that the URLs in the code load.

---

## 1. Executive Summary

| Area | Status |
|---|---|
| Frontend | Working in dev. 5 pages render. Several dead/decorative controls and a silent styling defect (see 4.1). |
| Backend | One API route, working. No rate limiting, no cache, no security headers. |
| Duffel | Connected end to end, **test key only**. Prices come back in **USD**. |
| Airport search | Working, fully local, 147 airports. Not usable by keyboard. |
| WhatsApp | Booking flow uses `api.whatsapp.com/send`. Footer and contact page still use `wa.me`. |
| Destinations | 28 destinations, all photos load. The five updated photos are in the code. |
| Documentation | Was significantly out of date (Duffel described as "not connected", mock flights, wrong counts). Updated in this audit. |
| Security | API key correctly server-only. 17 `npm audit` findings (1 critical, 14 high), mostly Next.js 15.3.3. |
| Performance | ~4.4 MB of logo PNGs, ~11 MB of destination photos at full quality, no image optimization on destination cards. |
| Repository | Only 2 commits. Almost all work since May 2026 (the whole Duffel integration, `src/lib`, `src/app/api`, `docs/`) is **uncommitted**. |

---

## 2. Stack (installed versions)

Read from `package.json`, `package-lock.json`, and `npm ls`.

| Package | Declared | Installed | Latest available |
|---|---|---|---|
| Node.js (local runtime) | — | 24.15.0 | — |
| npm | — | 11.12.1 | — |
| next | ^15.3.3 | 15.3.3 | 15.5.27 (same major) / 16.3.8 |
| react / react-dom | ^18.3.1 | 18.3.1 | 19.3.0 |
| typescript | ^5 | 5.9.3 | 7.0.2 |
| tailwindcss | ^3.4.17 | 3.4.19 | 4.3.3 |
| framer-motion | ^11.18.2 | 11.18.2 | 14.0.0 |
| gsap | ^3.12.7 | 3.15.0 | — |
| fuse.js | ^7.3.0 | 7.3.0 | 7.5.0 |
| lucide-react | ^0.511.0 | 0.511.0 | 1.52.0 |
| eslint | ^9.39.4 | 9.39.4 | 10.12.0 |
| eslint-config-next | ^15.3.3 | 15.3.3 | 16.3.8 |
| postcss | ^8.5.1 | 8.5.14 | 8.5.29 |
| autoprefixer | ^10.4.20 | 10.5.0 | 10.6.1 |
| @types/node / react / react-dom | ^20 / ^18 / ^18 | 20.19.41 / 18.3.28 / 18.3.7 | — |

Notes:
- No `engines` field and no `.nvmrc` — the Node version is not pinned.
- `@emnapi/runtime@1.10.0` is reported as **extraneous** in `node_modules`.
- All runtime dependencies are used: `framer-motion` (everywhere), `gsap` (only `AviationTrail.tsx`, dynamically imported), `fuse.js` (only `AirportAutocomplete.tsx`), `lucide-react`. No unused dependency found.
- There is no test framework and no test file in the project.

---

## 3. Structure

```
src/
├── app/
│   ├── layout.tsx              Root layout: Inter font, metadata, fixed sky gradient, Navbar, Footer
│   ├── template.tsx            Page transition (fade + 14px rise + blur, 0.58s)
│   ├── globals.css             Tokens, .glass, .text-gold-gradient, .btn-shimmer, .cta-glow, focus ring, reduced motion
│   ├── page.tsx                /            (server component)
│   ├── destinos/page.tsx       /destinos    (client) — destination data lives inline here
│   ├── milhas/page.tsx         /milhas      (client)
│   ├── passagens/page.tsx      /passagens   (client)
│   ├── atendimento/page.tsx    /atendimento (client)
│   └── api/flights/search/route.ts   POST /api/flights/search
├── components/
│   ├── Navbar.tsx, Hero.tsx, CloudBackground.tsx, AviationTrail.tsx, LogoHeroBanner.tsx
│   ├── home/        Benefits.tsx, HomeCTA.tsx
│   ├── ui/          GlassCard.tsx, PageHeader.tsx, SectionReveal.tsx
│   ├── layout/      Footer.tsx
│   └── booking/     BookingModal.tsx, AirportAutocomplete.tsx, FlightCard.tsx,
│                    FlightFilters.tsx, SelectedFlightBanner.tsx, TripSummary.tsx
├── data/airports.ts            147 airports (static)
└── lib/
    ├── duffel/client.ts        HTTP client, reads DUFFEL_API_KEY
    ├── providers/duffel-provider.ts   Request building, normalization, dedup, sort
    ├── services/flight-service.ts     Validation, provider selection, error mapping, logging
    ├── types/flights.ts        Shared types (normalized + raw Duffel)
    └── utils/                  format-duration.ts, wa-emojis.ts
public/                         logo.png, logo-navbar.png, logo-footer.png
```

Things that do **not** exist: custom hooks folder, context providers, global state, middleware, `not-found.tsx`, `error.tsx`, `loading.tsx`, `favicon.ico` / `icon.*`, `robots.txt`, `sitemap`, OpenGraph image, analytics, tests.

---

## 4. Design System (as implemented)

**Colors** (`tailwind.config.ts`): `sky-abyss #030A14`, `sky-deep #050D1A`, `sky-dark #0A1628`, `sky-mid #0D2447`, `sky-bright #1A5FA0`, `sky-horizon #1F4D8C`, `gold #D4A853`, `gold-light #ECC96A`, `gold-dim #A0782E`, `orange-soft #E8824A`. Status colors used inline in the booking flow: emerald `#34D399` (direct / allowed), amber `#FBBF24` (stops).

**Typography:** Inter (300–900) via `next/font/google`, CSS variable `--font-inter`. Headlines `font-black` with negative tracking; eyebrows 11px uppercase with wide tracking. Many sizes are arbitrary pixel values (`text-[13.5px]`, `text-[9.5px]`, …).

**Gradients:** gold CTA `linear-gradient(135deg, #D4A853, #ECC96A, #E8824A)`; page background fixed gradient in `layout.tsx`.

**Glass:** `.glass` utility (navbar, blur 22px) and `GlassCard` (`border-white/10 bg-white/[0.04] backdrop-blur-sm`).

**Buttons:** gold pill primary (`rounded-full`, `.btn-shimmer`, `.cta-glow`), glass pill secondary, gold-outline `rounded-xl` inside flight cards.

**Radius:** `rounded-2xl` cards, `rounded-[20px]` flight cards, `rounded-3xl` modal, `rounded-full` pills.

**Breakpoints:** Tailwind defaults (`sm 640`, `md 768`, `lg 1024`). Navbar switches at `md`.

**Motion:** standard ease `[0.22, 1, 0.36, 1]`; springs `stiffness 300–400`.

### 4.1 Inconsistencies found

1. **Non-standard opacity modifiers produce no CSS.** Tailwind 3 only generates `/N` modifiers for values in its opacity scale (multiples of 5). The code uses `/6 /8 /12 /18 /22 /26 /28 /32 /38 /42 /52 /58 /82` about 60 times (`text-white/52`, `bg-gold/8`, `border-gold/22`, `border-white/8`, `text-white/38`, …). Verified against the compiled CSS: none of these classes exist, while `text-white/40` and `text-white/65` do. Effect: the element silently falls back — muted text renders pure white, tinted backgrounds are missing, and borders fall back to Tailwind's default border color instead of translucent gold/white. Affects the eyebrow badges, `PageHeader` subtitle, Hero, Benefits, HomeCTA, flight cards, and the contact form.
2. **`scrollbar-hide`** is used three times in `FlightFilters.tsx` but is not defined anywhere (no plugin, no CSS). No effect.
3. Brand colors are repeated as inline hex/rgba in `style={}` across booking components instead of theme tokens.
4. Statistics disagree between sections: "até 70%" (Benefits) vs "até 60%" (TripSummary); `R$10M+` (Hero) vs `R$5M+` (Milhas).
5. Country naming differs between datasets: "Emirados Árabes Unidos / Qatar / Holanda" (destinations) vs "Emirados Árabes / Catar / Países Baixos" (airports).

---

## 5. Branding

| Asset | Path | Real file | Rendered as |
|---|---|---|---|
| Brand image ("Quem Somos") | `public/logo.png` | 1024×1536 PNG, 2.05 MB | `next/image` 600×660, `priority` |
| Navbar logo | `public/logo-navbar.png` | 2048×2048 PNG, 1.08 MB | `next/image`, 54px high (44px in drawer) |
| Footer logo | `public/logo-footer.png` | 2048×2048 PNG, 1.08 MB | `next/image`, 96px high |

- `logo-navbar.png` and `logo-footer.png` are **byte-identical** (same SHA-1).
- `public/logo.jpeg` was deleted from the working tree (the deletion is not committed).
- **No favicon** and no OpenGraph image exist.
- Font: Inter only.

---

## 6. Pages

| Route | Type | Sections | CTAs → target |
|---|---|---|---|
| `/` | Server | Hero (clouds + GSAP plane + headline + trust badges) · Benefits (4 cards, 2 columns) · Quem Somos (text + 3 stats + brand image) · HomeCTA | Hero "Emitir Passagem" / "Comprar Milhas" → **nothing** (buttons without handler) · HomeCTA both buttons → `/atendimento` |
| `/destinos` | Client | PageHeader · 5 continent sections (28 cards) · bottom CTA | Card → `BookingModal` · "Consultar disponibilidade" → `/atendimento` |
| `/milhas` | Client | PageHeader · 4 service cards · 3 stats · CTA | Card buttons ("Comprar Milhas", "Vender Milhas", "Agendar Consultoria", "Conhecer Estratégias") and "Fale com um especialista" → `/atendimento` |
| `/passagens` | Client | PageHeader · decorative search panel · 6 service cards · trust strip · CTA | "Consultar" and "Emitir minha passagem agora" → `/atendimento` |
| `/atendimento` | Client | PageHeader · 3 contact cards · form | WhatsApp → `wa.me` · e-mail → `mailto:` · "Agendar conversa" → `/atendimento` (itself) · form → local success state only |
| `POST /api/flights/search` | API | — | — |

Shared: `Navbar` (fixed, glass after 24px scroll, right drawer on mobile), `Footer` (3 columns), page transition via `template.tsx`, `SectionReveal` scroll fade-up.

Integrations per page: only `/destinos` talks to a backend (through `BookingModal`). The contact form sends nothing.

---

## 7. Destinations

Data is inline in `src/app/destinos/page.tsx` (`CONTINENTS`). **28 destinations.** All photos are Unsplash URLs with `?auto=format&fit=crop&w=1400&q=90`, rendered with raw `<img loading="lazy">` (not `next/image`). All 28 URLs return HTTP 200.

Card behavior (all cards): 4:3 ratio, gradient fallback behind the photo, hover scale 1.03 + photo zoom + gold corner glow, miles line and arrow revealed on hover only. Click opens `BookingModal` with the destination.

| Continent | Destination | Country | IATA | Miles | Unsplash photo id |
|---|---|---|---|---|---|
| Europa | Paris | França | CDG | 45.000 | 1502602898657-3e91760cbb34 |
| | Roma | Itália | FCO | 44.000 | 1552832230-c0197dd311b5 |
| | Lisboa | Portugal | LIS | 38.000 | 1555881400-74d7acaacd8b |
| | Londres | Reino Unido | LHR | 46.000 | 1513635269975-59663e0ac1ad |
| | Santorini | Grécia | JTR | 50.000 | 1570077188670-e3a8d69ac5ff |
| | Barcelona | Espanha | BCN | 43.000 | 1539037116277-4db20889f2d4 |
| | Amsterdã | Holanda | AMS | 47.000 | 1512470876302-972faa2aa9a4 |
| | Veneza | Itália | VCE | 45.000 | 1523906834658-6e24ef2386f9 |
| América | Nova York | Estados Unidos | JFK | 42.000 | 1490644658840-3f2e3f8c5625 |
| | **Orlando** | Estados Unidos | MCO | 40.000 | 1620055155785-2fc4acd747cb |
| | Cancún | México | CUN | 35.000 | 1552074284-5e88ef1aef18 |
| | **Toronto** | Canadá | YYZ | 44.000 | 1509118796018-30cc4ce216f1 |
| | Buenos Aires | Argentina | EZE | 30.000 | 1589909202802-8f4aadce1849 |
| | **Punta Cana** | República Dominicana | PUJ | 32.000 | 1692017827893-f97d95397b49 |
| | Los Angeles | Estados Unidos | LAX | 42.000 | 1580655653885-65763b2597d0 |
| | Miami | Estados Unidos | MIA | 38.000 | 1507525428034-b723cf961d3e |
| Ásia | Tóquio | Japão | NRT | 80.000 | 1540959733332-eab4deabeeaf |
| | Bangkok | Tailândia | BKK | 70.000 | 1563492065599-3520f775eeed |
| | Singapura | Singapura | SIN | 75.000 | 1525625293386-3f8f99389edd |
| | Bali | Indonésia | DPS | 68.000 | 1537996194471-e657df975ab4 |
| | Seul | Coreia do Sul | ICN | 78.000 | 1538485399081-7191377e8241 |
| | Maldivas | República das Maldivas | MLE | 75.000 | 1573843981267-be1999ff37cd |
| Oriente Médio | Dubai | Emirados Árabes Unidos | DXB | 60.000 | 1512453979798-5ea266f8880c |
| | **Doha** | Qatar | DOH | 62.000 | 1765046919689-7316a0d13df9 |
| | **Abu Dhabi** | Emirados Árabes Unidos | AUH | 62.000 | 1590075865003-e48277faa558 |
| Oceania | Sydney | Austrália | SYD | 90.000 | 1506374322094-6021fc3926f1 |
| | Melbourne | Austrália | MEL | 90.000 | 1506973035872-a4ec16b8e8d9 |
| | Auckland | Nova Zelândia | AKL | 95.000 | 1507699622108-4be3abd695ad |

**The five updated images (Orlando, Toronto, Punta Cana, Doha, Abu Dhabi):** the `photo:` values in the code are the replaced URLs recorded in the changelog entry "Destination Card Images — Landmark Photography", the modification is present in the working tree, and all five load. What the photos depict was not visually checked in this audit. The change is **not committed** to git.

Gaps: `JTR` (Santorini) and `MLE` (Maldivas) are not in `airports.ts`, so flight cards, the trip summary, and the WhatsApp message show no city name for those two destinations (only the IATA code).

---

## 8. Airport Autocomplete

| Question | Answer |
|---|---|
| Where is the data | `src/data/airports.ts`, exported `AIRPORTS: Airport[]` |
| How many airports | **147** (38 Brazil, 12 USA, the rest across 59 other countries). No duplicate codes. |
| Record shape | `{ code, airport, city, country }` — all strings, names in Portuguese |
| When the search runs | On every keystroke, synchronously (`useMemo` on `query`). No debounce, no loading state. Minimum 2 characters. |
| Algorithm | Tiered: exact IATA (0) → IATA prefix (1) → city prefix (2) → airport-name prefix (3) → city contains (4) → airport-name contains (5). Each airport is ranked at its best tier. Top 7. |
| Fuse.js | Fallback only, used when tiers 0–5 return nothing. Keys `_nc` (code, weight 4), `_ns` (city, 2), `_na` (airport name, 1); `threshold 0.25`, `minMatchCharLength 2`, `ignoreLocation true`. Index is built once at module load. |
| Accent handling | `toLowerCase().normalize('NFD')` + strip combining marks, pre-computed per record |
| Result row | Gold IATA badge · airport name · "city • country" |
| Selected value | `"City (IATA)"`, e.g. `São Paulo (GRU)`; the IATA is later extracted with `/\(([A-Z]{3})\)/` |
| Dropdown | Portal to `document.body`, `position: fixed`, z-index **10001** |
| External API calls | **None.** |
| AirportDB | **Not present** anywhere in code, config, env, or docs |
| API Ninjas | **Not present** anywhere in code, config, env, or docs |
| Airport-related env vars | **None** |
| Legacy API code | None found. The only non-Duffel provider names are in one comment in `flights.ts` ("Amadeus, TravelPayouts") as examples of future providers. |

Limitations: selection is `onMouseDown` only — there is no arrow-key navigation, no Enter-to-select, and no ARIA combobox roles, so step 1 cannot be completed with the keyboard. The dropdown position is measured only while typing and does not follow scroll or resize.

---

## 9. Flight Search / Duffel

```
BookingModal.performSearch()                          (browser)
   │  POST /api/flights/search   { origin, destination, departureDate, returnDate, adults, children?, cabinClass }
   ▼
src/app/api/flights/search/route.ts                   (server)
   │  parse JSON → validateSearchRequest() → searchFlights()
   ▼
src/lib/services/flight-service.ts
   │  selectProvider() → 'duffel' (hardcoded) · logs · maps provider errors to Portuguese
   ▼
src/lib/providers/duffel-provider.ts
   │  builds 2-slice offer request → normalize → deduplicate → sort by price
   ▼
src/lib/duffel/client.ts
   │  POST https://api.duffel.com/air/offer_requests   (Duffel-Version: v2, Bearer key)
   ▼
Duffel API
```

| Topic | Real state |
|---|---|
| API key | Read only in `src/lib/duffel/client.ts` via `process.env.DUFFEL_API_KEY`, on each request. The module throws if imported in a browser. No `NEXT_PUBLIC_` variable exists. **Server-only: confirmed.** |
| Key mode | The configured key is a **test** key. |
| Timeout | 30 s via `AbortController` |
| Request | One offer request with two slices (outbound + return), `return_offers: true`, `cabin_class`, passengers by type (`adult`, `child`, `infant_without_seat`) |
| Validation (server) | IATA `^[A-Z]{3}$` for both ends, different airports, `YYYY-MM-DD` dates, departure ≥ today (UTC), **return strictly after departure**, adults ≥ 1, children/infants ≥ 0, total ≤ 9, infants ≤ adults, cabin in the 4 allowed values. Messages are in **English**. |
| HTTP statuses | 400 invalid JSON · 422 validation · 404 `NO_RESULTS` · 429 / 502 / 503 / 504 provider errors · 500 unexpected · 405 for non-POST |
| Error body | `{ error: string, code: ApiErrorCode }` — Duffel's own messages are never forwarded |
| Rate limiting | **None** on the route. Only Duffel's own 429 is mapped to a friendly message. |
| Cache (server) | **None.** Every request hits Duffel. |
| Cache (client) | One entry per open modal (`lastSearchKey` + `cachedOffers` refs). Lost when the modal closes. |
| Double-submit guard | `searchInProgress` ref in the modal |
| Normalization | `FlightOffer` = outbound fields flattened at top level + `returnSlice: FlightSlice`. Airline, logo and flight number come from the **first segment's operating carrier**. `stops = segments − 1`. Dates are the first 10 characters of the local datetime. |
| Segments | Kept in `returnSlice.segments`. The outbound's segments are **not** exposed. No UI shows per-segment or layover details. |
| Deduplication (server) | Key: `airlineCode \| flightNumber \| departureTime \| arrivalTime` of the outbound **plus the same four fields of the return**. Keeps the cheapest fare per physical (outbound, return) pair. |
| Deduplication (client) | Outbound list: one card per outbound key, cheapest total. Return list: one card per return key among offers sharing the selected outbound. |
| Sorting | Server: price ascending. Client: by the selected sort pill. |
| Prices | `price = total_amount`, `baseAmount = base_amount`, `taxAmount = tax_amount` (nullable), `currency = total_currency` |
| Fare conditions | `refundAllowed`, `changeAllowed`, `changePenalty` from `conditions.*_before_departure` (nullable) |
| Baggage | **Not read, not shown** |
| Cabin | Not read from Duffel; stamped from the request |
| Logging | `console.log/warn/error` with route, dates, passenger counts, cabin, result count, timing. No key, no personal data. |

**Sample run (test mode, GRU → LIS, 2026-12-01 / 2026-12-10, 1 adult, economy):** HTTP 200 in 3.6 s · 84 offers after dedup · 21 unique outbound flights · currency **USD** for all · `taxAmount` present on 84/84 · fare conditions unknown (`null`) on 50/84 · response ≈ 118 KB · includes the synthetic "Duffel Airways" test carrier.

---

## 10. Booking Flow (real)

1. **Form** — 5 steps: origin → departure date → return date → passengers → class.
2. **Search** — spinner + 3 skeleton cards while `POST /api/flights/search` runs.
3. **Outbound** ("Passo 1 de 2") — filter bar + one card per unique outbound flight.
4. **Return** ("Passo 2 de 2") — selected-outbound banner + filter bar + return cards.
5. **Summary** — `TripSummary` with both legs, total, conditions.
6. **WhatsApp** — "Solicitar emissão com milhas".

So yes: search → outbound → return → summary → WhatsApp. The flow is **round-trip only**; there is no one-way option.

**State (all `useState`/`useRef` inside `BookingModal`, nothing persisted):**

| State | Holds | Set by |
|---|---|---|
| `step` (1–5), `dir` | Form position and animation direction | `next()`, `back()`, `editSearch()` |
| `booking` | `originAirport`, `departureDate`, `returnDate`, `passengers`, `flightClass` (all strings) | form inputs |
| `searching` | Loading flag | `next()` on step 5, `retry()` |
| `offers` | Full `FlightOffer[]` from the API | `performSearch()` |
| `apiError` | Error text or `null` | `performSearch()` |
| `flightPhase` | `null` \| `'outbound'` \| `'return'` \| `'summary'` | phase handlers |
| `selectedOffer` | The offer clicked in the outbound list. Used only to identify the outbound flight; its price is the cheapest combination, not the final one. | `handleSelectOutbound()` |
| `matchedOffer` | The offer clicked in the return list — the exact Duffel offer for (selected outbound + chosen return). **This is the source of the final price.** | `handleSelectReturn()` |
| `filters` | `FilterState`; reset when moving outbound → return and on back-to-outbound | `FlightFilters` |

Derived with `useMemo`: `uniqueOutbound`, `returnOffers`, `filteredOutbound`, `filteredReturn`. The view shown is `activeKey = searching ? 'searching' : flightPhase ?? 'step' + step`.

Closing the modal discards everything.

**Passenger mapping:** `1` → 1 adult · `2` → 2 adults · `familia` → 2 adults + 2 children · `grupo` → 6 adults (label says "6+").
**Cabin mapping:** `economica` → `economy` · `economica-premium` → `premium_economy` · `executiva` → `business` · `primeira-classe` → `first`.

### Price handling — confirmed

The search sends **one** Duffel offer request containing both slices, so each offer is a complete round trip and `total_amount` is the **total for outbound + return, for all passengers in the search**. The sample run confirms `base_amount + tax_amount = total_amount` (486.45 + 87.56 = 574.01). There is no per-leg price and no per-passenger price anywhere in the app.

---

## 11. Filters

| Filter | Exists | Notes |
|---|---|---|
| Ordenar | Yes | Preço (default) · Duração · Mais cedo · Mais tarde — single select |
| Escalas | Yes | Direto · 1 parada · 2+ — multi-select |
| Partida (period) | Yes | Madrugada (<6h) · Manhã (<12h) · Tarde (<18h) · Noite — multi-select, based on departure hour |
| Companhia aérea | **Removed** | No `airlines` field in `FilterState`, no prop, no JSX, no branch in `applyFilters`, no `outboundAirlines`/`returnAirlines`. **No dead code left in `src/`.** |

In the return phase the same filters apply to the return slice. A result counter ("N voos") sits next to the sort pills. "Limpar filtros" appears when filters hide everything.

---

## 12. Flight Cards

`FlightCard` (outbound and return lists) shows:

| Element | Source / format |
|---|---|
| Airline logo | Duffel `logo_symbol_url` (SVG from `assets.duffel.com`) via `<img>`; falls back to the airline code |
| Airline name, flight number | First segment's operating carrier |
| Cabin badge | Outbound cards only (`cabinLabel`); return cards omit it |
| Times | `HH:MM` cut from the local ISO datetime (30–34px, tabular) |
| Dates | `1 Dez` style (Portuguese short months) |
| IATA + city | City looked up in `airports.ts`; blank if the code is not there |
| Duration | `formatDuration()` |
| Stops badge | "Direto" (emerald) / "N escala(s)" (amber) |
| Price box | Section title · label · currency + integer price · caption |
| CTA | "Selecionar voo de ida →" / "Selecionar voo de volta →" |
| Baggage | **Not shown** (not available in the data) |

Animation: staggered fade/blur-in (delay capped at 0.48 s), hover lift, plane icon floating loop. Layout is a single column inside a 500px-max modal (bottom sheet on mobile).

**`formatDuration()`** (`src/lib/utils/format-duration.ts`), regex `^P(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?)?$`:

| Input | Output |
|---|---|
| `PT2H15M` | `2h 15min` |
| `P1DT6H15M` | `1d 6h 15min` |
| `PT45M` | `45 min` |
| `PT8H` | `8h` |
| `P1DT9H` (seen in the sample run) | `1d 9h` |
| `PT0M` | `0 min` |
| unrecognized | returned unchanged |

`parseDurationMinutes()` in the provider uses the same regex, so sorting by duration handles multi-day values.

---

## 13. Prices

| Question | Answer |
|---|---|
| Currency returned by Duffel | Whatever `total_currency` says. With the current test key: **USD**. |
| Conversion to BRL | **None.** No exchange-rate logic exists. |
| Where currency is formatted | Inline in `FlightCard.tsx` and `TripSummary.tsx`: symbol is `R$` if the currency is `BRL`, otherwise the raw code (`USD`); number is `Intl.NumberFormat('pt-BR')` of `Math.floor(price)`. Result today: `USD 574`. |
| Rounding | Cents are **truncated**, not rounded (574.01 and 574.99 both show 574). Base and tax are floored separately, so "Preço base + Taxas" can be 1 below "Total". |
| "A partir de" | Outbound cards (`priceLabel`), under the title "Viagem completa", caption "Valor total de ida e volta". Also on destination cards for the static miles estimate. |
| "Total ida + volta" | **This exact text does not exist in the code.** Return cards show "Itinerário selecionado" / "Valor total da viagem" / "Valor total de ida e volta". |
| Trip Summary | "Valor total da viagem" + price; breakdown (Preço base / Taxas / Total) when `taxAmount` is not null; checklist "✓ Ida ✓ Volta ✓ Taxas da companhia"; condition badges |
| WhatsApp | "VALOR DA VIAGEM" block: `Preço base` / `Taxas` / `*TOTAL: USD 574*` (or just the total when tax is null), then a ✓ list and an optional fare-conditions line |

Nothing states that the total covers **all passengers**, so for 2+ passengers it can be read as a per-person price.

---

## 14. WhatsApp

| Location | Endpoint | Pre-filled text |
|---|---|---|
| `TripSummary.tsx` — "Solicitar emissão com milhas" | `https://api.whatsapp.com/send?phone=…&text=…` | Full message |
| `BookingModal.tsx` — "Falar com especialista" (no-results state) | `https://api.whatsapp.com/send?phone=…&text=…` | Short message (destination + search parameters) |
| `Footer.tsx` — phone link and icon | `https://wa.me/…` | None |
| `atendimento/page.tsx` — WhatsApp card | `https://wa.me/…` | None |

- **Confirmed:** every link that carries a message uses `api.whatsapp.com/send`. The three `wa.me` links carry no text.
- Number: `5516997315748` (the public business number, also printed on the site), hardcoded in the four files above — there is no shared constant.
- Encoding: the whole message goes through `encodeURIComponent` once.
- Emojis: built at runtime with `String.fromCodePoint()` in `src/lib/utils/wa-emojis.ts` (15 constants). The `✓` and box-drawing characters are literals.
- Full message contents: greeting and intent → **Resumo da pesquisa** (origin "City (IATA)", destination, departure date, return date, passengers, class) → **Voo de ida** (airline, flight number, departure and arrival time + date, duration, stops) → **Voo de volta** (same fields) → **Valor da viagem** (base, taxes, total, ✓ list, fare conditions) → closing.
- The WhatsApp links open in a new tab with `rel="noopener noreferrer"` (the contact-page card has no `target`/`rel`).

---

## 15. Security

| Item | State |
|---|---|
| `DUFFEL_API_KEY` | configured · server-only · test mode |
| `DUFFEL_ENV` | configured · **not read by any code** |
| `.env.local` | git-ignored, not tracked |
| `.env.local.example` | **misleading** — says no API keys are required and lists no variable |
| Secrets in client bundle | none found (no `NEXT_PUBLIC_*`, key only in a server module guarded against browser import) |
| Frontend/backend separation | correct — the browser only calls `/api/flights/search` |
| Input validation | present server-side for every field |
| Errors shown to users | sanitized; provider messages are not forwarded |
| Rate limiting | **missing** — anyone can call the route repeatedly and consume the Duffel quota |
| CORS | not configured (framework default; non-browser clients are not restricted) |
| Security headers | **none** configured (no CSP, `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, HSTS). `X-Powered-By: Next.js` is sent. |
| Logs | no secrets, no personal data |
| Contact form | collects name, e-mail, phone — nothing is transmitted or stored |
| `npm audit` | **17 vulnerabilities: 1 critical, 14 high, 2 moderate** |

`npm audit` detail: almost all advisories are against **next 15.3.3** (cache poisoning, SSRF, middleware bypass, DoS, and remote-code-execution advisories for Windows-hosted servers and the image optimizer), plus `postcss`, `sharp`, `source-map-js`, `postcss-selector-parser`. npm reports them as fixable with `npm audit fix` without a major upgrade (next 15.5.x is within the declared `^15.3.3` range). Nothing was fixed or updated in this audit.

---

## 16. Performance

- **Logos:** 4.4 MB of PNG in `public/`. The navbar and footer logos are 2048×2048 sources displayed at 54–96px (and duplicated on disk). `next/image` resizes them at runtime, but the sources are far larger than needed.
- **Destination photos:** 28 raw `<img>` tags requesting `w=1400&q=90` for cards that render ~300–600px wide. Total ≈ **11 MB** if all load (190–820 KB each). Lazy loading limits the initial hit. `next.config.ts` allows `images.unsplash.com` for `next/image`, but `next/image` is not used for them.
- **Modal hero:** re-requests the same 1400px photo (cached by then).
- **Search payload:** ≈118 KB JSON per search, all offers rendered at once (no pagination/virtualization); every card runs an infinite animation.
- **City lookup:** `AIRPORTS.find()` runs per card per render (147 items — negligible).
- **Duplicated helpers:** `extractTime` (3 files), `getCity` (3 files, one unused), `fmtDate` (2), `fmtDateShort` + `MONTHS_SHORT` (2), `stopsLabel` logic (3), `INPUT_CLASS` (2), `NAV_LINKS` (2), gold gradient string (many).
- **Requests:** no duplicate or unnecessary network calls found. No server cache, so repeated identical searches from different visitors each hit Duffel.
- **Animation cost:** hero stacks dozens of large blurred layers plus `backdrop-filter` in several places; 9 font weights of Inter are loaded.
- **Client components:** `/milhas`, `/passagens`, and `/atendimento` are fully client-rendered only to animate buttons.
- **Build:** `tsc` passes. **ESLint reports 3 errors** (`no-unused-vars`: `getCity` in `BookingModal.tsx`; `originAirport` and `destinationName` in `buildWaMessage` in `TripSummary.tsx`). `next build` lints by default and `next.config.ts` does not disable it, so the production build is expected to fail until these are resolved — not executed in this audit.

---

## 17. Accessibility

| Area | State |
|---|---|
| `aria-label` | Present on: modal close, mobile menu open/close, 3 footer social icons. Missing on: round back buttons in the modal, flight/option/filter buttons' state. |
| Menu toggle | Label stays "Abrir menu" when open; no `aria-expanded` |
| Modal | No `role="dialog"`, no `aria-modal`, no focus trap, no focus return, **no Escape to close** |
| Autocomplete | No combobox/listbox roles; **mouse/touch only** — keyboard users cannot pick an airport and therefore cannot pass step 1 |
| Toggle buttons (filters, passengers, class) | No `aria-pressed` |
| Focus | Global `:focus-visible` gold ring exists. Inputs use `focus:outline-none` with only a faint border change. |
| Labels | Contact form uses `<label>` without `htmlFor`/`id` (not associated). Modal date and airport inputs have no label. |
| Destination cards | Clickable `<div>` — not focusable, no role, no key handler. The miles line is hover-only (invisible on touch). |
| Buttons inside links | `<Link>`/`<a>` wrapping `<motion.button>` in many CTAs (invalid nesting, double tab stop) |
| Dead buttons | Hero "Emitir Passagem" and "Comprar Milhas" are focusable and do nothing |
| Alt text | Logos, destination photos, and airline logos have `alt` |
| Reduced motion | CSS animations are disabled under `prefers-reduced-motion`. Framer Motion and GSAP animations are **not** (no `useReducedMotion`). |
| Contrast | Much text is intended at 22–40% white on dark and 9.5–11px, below WCAG AA. (Where the invalid opacity classes fall back to pure white, contrast is accidentally higher.) |
| Language | `<html lang="pt-BR">` set |

---

## 18. Environment Variables

| Variable | Used in | Side | Documented in `.env.local.example` |
|---|---|---|---|
| `DUFFEL_API_KEY` | `src/lib/duffel/client.ts` | backend | **No** |
| `DUFFEL_ENV` | nowhere (present in `.env.local` only) | — | No |

No other `process.env` reference exists in `src/`. `RESEND_API_KEY` and `NEXT_PUBLIC_GA_ID` appear only in docs as future ideas.

---

## 19. Problems Found

### 🔴 Critical
1. **Next.js 15.3.3 has known critical/high vulnerabilities** (17 `npm audit` findings). Must be addressed before any public deployment.
2. **Production build is expected to fail on lint** (3 `no-unused-vars` errors). Needs confirmation with `npm run build`.
3. **Almost all work is uncommitted.** 14 untracked paths (including `src/lib/`, `src/app/api/`, all new booking components, `docs/`) and 13 modified files; last commit is from 2026-05-15. A disk problem or bad checkout would lose the entire Duffel integration.

### 🟠 Important
4. **API error messages never reach the user.** The API returns `{ error, code }`; `BookingModal` reads `data.message`. Every failure shows the generic "Erro ao buscar voos. Tente novamente."
5. **"No flights" is shown as an error.** The API answers `NO_RESULTS` with 404, which the modal treats as a failure. The designed empty state ("Nenhum voo disponível" + "Falar com especialista" WhatsApp button) is unreachable, so a no-result search ends with only "Editar pesquisa" / "Tentar novamente".
6. **Flight numbers can render as `TPnull`.** Duffel returns `operating_carrier_flight_number: null` for some segments (18 of 84 offers in the sample run, all TAP). The value is concatenated unchecked and appears on cards and in the WhatsApp message.
7. **Contact form discards submissions** while telling the user "Mensagem enviada!".
8. **Hero CTAs do nothing** ("Emitir Passagem", "Comprar Milhas").
9. **Prices are in USD** for a Brazilian audience, with no conversion and no note; and cents are truncated.
10. **Total price is for all passengers** but is not labelled as such.
11. **~60 Tailwind opacity classes generate no CSS** (section 4.1) — the site does not look the way the code intends.
12. **No rate limiting** on `/api/flights/search`.
13. **Same-day return** is allowed by the date picker (`min = departure date`) but rejected by the server (return must be after departure) — and because of issue 4 the user only sees the generic error.
14. **Keyboard users cannot complete step 1** of the booking flow.
15. **Only a Duffel test key is configured**; results include synthetic test data.

### 🟡 Medium
16. `.env.local.example` says no keys are needed.
17. No favicon, no OG image, no `not-found`/`error` pages, no `robots`/`sitemap`.
18. No security headers.
19. Heavy images (section 16).
20. "Today" is computed in UTC on both client and server — after 21:00 in Brazil the minimum selectable date jumps to tomorrow.
21. Modal lacks dialog semantics, focus trap, and Escape.
22. `children` are sent to Duffel as `type: 'child'` without ages; "Grupo (6+)" always searches exactly 6 adults; infants cannot be selected.
23. Server validation messages are in English.
24. `JTR` and `MLE` missing from `airports.ts`.
25. Layovers/segments, baggage, and the marketing carrier are not shown.
26. Framer Motion and GSAP ignore `prefers-reduced-motion`.
27. `/atendimento` "Agendar conversa" links to the page it is on.

### 🟢 Low
28. Unused code: `getCity` in `BookingModal.tsx`; two unused parameters in `buildWaMessage`; `particleDrift` and `planeFly`/`.plane-on-path` in `globals.css`; unused Tailwind tokens (`sky-gradient`, `hero-radial`, `drift-right*`); `ApiErrorCode 'INVALID_DATE'` never produced; `DuffelStop` unused.
29. `scrollbar-hide` class has no definition.
30. Duplicated helpers and constants (section 16); WhatsApp number hardcoded in 4 files.
31. `logo-navbar.png` and `logo-footer.png` are the same file.
32. `tsconfig.tsbuildinfo` is tracked in git although `*.tsbuildinfo` is ignored; `public/logo.jpeg` deletion uncommitted.
33. `DUFFEL_ENV` is defined but unused; `@emnapi/runtime` is extraneous.
34. Inconsistent marketing numbers and country names (section 4.1).
35. Mixed `wa.me` / `api.whatsapp.com` endpoints (harmless today because the `wa.me` links carry no text).
36. `tailwind.config.ts` content glob includes `./src/pages/**`, which does not exist.
37. Menu button label does not change when the drawer is open.

---

## 20. Documentation Drift

### Documented, but not true in the code (before this audit)

| Doc | Claim | Reality |
|---|---|---|
| `integrations.md`, `features/flight-provider.md`, `project-overview.md`, `future-roadmap.md`, `features/flight-search-planning.md`, `development-guidelines.md` | Duffel frontend "not yet connected"; modal shows mock flights | Fully connected; no mock data exists |
| `integrations.md`, `README.md`, `features/whatsapp-integration.md`, `features/booking-modal.md`, `destinations.md` | All WhatsApp links use `wa.me` | Message links use `api.whatsapp.com/send`; `wa.me` only for 3 plain links |
| `integrations.md` | "No variables required" | `DUFFEL_API_KEY` is required |
| `README.md`, `architecture.md`, `technical-decisions.md`, `future-roadmap.md`, `project-overview.md`, `features/airport-autocomplete.md` | 160+ airports | 147 |
| `pages.md`, `destinations.md` | Europe lists Madri, Milão, Praga, Viena, …; Asia includes Dubai; 25+ | 28 destinations, 8 in Europe (see section 7) |
| `pages.md` | `Destination` type without `iataCode`; bottom CTA → WhatsApp; milhas CTA "Saiba mais"; `/milhas` and `/passagens` are not client components | `iataCode` exists; CTA → `/atendimento`; four distinct labels; both are client components |
| `pages.md` | Contact form validates and shows inline errors, animated checkmark, `AnimatePresence` | Only native `required`; no custom validation or error UI; Send icon; no `AnimatePresence` |
| `architecture.md` | "No server actions, no API routes"; dedup key of 7 outbound fields; images use `next/image` | One API route; key is 4 outbound + 4 return fields; destination, modal, and airline images use `<img>` |
| `technical-decisions.md` #13 | Same 7-field key; price labelled "VALOR DE REFERÊNCIA" | See above; that label no longer exists |
| `components.md` | `applyFilters` handles airline; `outboundAirlines`/`returnAirlines` memos | Removed |
| `components.md` | Hero icons Sparkles/ChevronDown/Award; Benefits 4 columns with `SectionReveal`; several components "not client" | Different icons; 2 columns with its own `useInView`; they are client components |
| `booking-flow.md` | Filter bar has airline pills; return price label "Total ida + volta"; dropdown z-index 99999; reachable empty state; Portuguese API error shown | No airline pills; label is "Valor total da viagem"; z-index 10001; empty state unreachable; generic error only |
| `README.md`, `future-roadmap.md`, `animations.md` | GSAP 3.12.7, Tailwind 3.4.17 | Installed 3.15.0 and 3.4.19 |
| `README.md` | Logo files are 600×660, 152×68, 192×96 | Those are render sizes; files are 1024×1536 and 2048×2048 |
| `README.md`, `development-guidelines.md` | No console logs; all images via `next/image`; lint passes | 6 server log calls; raw `<img>` in 5 places; lint has 3 errors |
| `features/flight-provider.md` | Example currency `BRL` | Returns `USD` with the current key |

### In the code, but not documented (before this audit)

- The opacity-class defect, the unreachable empty state, the swallowed error message, `TPnull` flight numbers.
- Price truncation (`Math.floor`) and the fact that totals are for all passengers.
- Server validation rules in full (same-day return rejected, infants ≤ adults, max 9).
- `DUFFEL_ENV` unused; test-mode key; `.env.local.example` contradiction.
- Absence of rate limiting, security headers, favicon, error pages, tests.
- `logo-navbar.png` = `logo-footer.png`; real image dimensions and weights.
- Uncommitted state of the repository.

Docs **not** updated in this audit (lower priority, still contain some of the stale claims above): `ai-context.md`, `project-overview.md`, `destinations.md`, `animations.md`, `design-system.md`, `branding.md`, `assets.md`, and everything under `docs/features/`. Treat this audit file as authoritative where they disagree.

---

## 21. Recommended Roadmap (from the current code only)

### 🔴 Necessary
1. Commit the current working tree (after reviewing that `.env.local` stays ignored).
2. Run `npm run build` to confirm the lint failure, then clear the 3 lint errors.
3. Update Next.js within 15.x and re-run `npm audit`.
4. Fix the error contract between API and modal (`error` vs `message`) and make `NO_RESULTS` reach the empty state.
5. Guard against null flight numbers.
6. Decide the currency strategy (BRL from Duffel, conversion, or an explicit "USD" note) and label totals as "all passengers".
7. Make the contact form deliver somewhere — or replace it with a WhatsApp hand-off — so leads are not lost.
8. Wire or remove the two dead Hero buttons.

### 🟠 Recommended
9. Replace the invalid opacity classes (valid scale values or `/[0.52]` syntax) and review the visual result page by page.
10. Add rate limiting and basic security headers; correct `.env.local.example`.
11. Keyboard support and ARIA for the autocomplete; dialog semantics, focus trap, and Escape for the modal.
12. Align the date rules (client `min` vs server "after departure") and compute "today" in the user's/Brazil's timezone.
13. Optimize images: smaller logo sources, `next/image` or smaller Unsplash sizes for cards.
14. Add favicon, OG image, `not-found`, `error`, `robots`, `sitemap`.
15. Add `JTR` and `MLE` to `airports.ts`.
16. Obtain a Duffel live key and define the production environment.

### 🟢 Future improvements
17. Show layovers/segments, baggage, and marketing carrier.
18. Flexible passenger counts (children ages, infants, real group sizes); one-way trips.
19. Centralize shared helpers and constants (WhatsApp number, formatters, gradient).
20. Respect `prefers-reduced-motion` in Framer Motion and GSAP.
21. Server-side caching of identical searches; pagination of results.
22. Analytics for conversion events; automated tests for the provider, validation, and formatters.
23. Bring the remaining docs (`features/*`, `project-overview.md`, etc.) in line with this audit.

# Architecture

## Framework: Next.js 15 App Router

The project uses the **Next.js App Router** (`src/app/`), not the Pages Router. This means:

- Every folder inside `src/app/` that contains a `page.tsx` becomes a route.
- `layout.tsx` wraps all pages and is rendered once (persistent shell).
- `template.tsx` wraps each page individually and re-mounts on navigation (used for page transitions).
- Server Components are the default; client components must explicitly opt in with `"use client"`.

---

## Route Structure

| URL | File | Type |
|---|---|---|
| `/` | `src/app/page.tsx` | Page (home) |
| `/passagens` | `src/app/passagens/page.tsx` | Page |
| `/milhas` | `src/app/milhas/page.tsx` | Page |
| `/destinos` | `src/app/destinos/page.tsx` | Page |
| `/atendimento` | `src/app/atendimento/page.tsx` | Page |
| `POST /api/flights/search` | `src/app/api/flights/search/route.ts` | API route (server only) |

`/` is a Server Component. The other four pages start with `"use client"`.

There is no `not-found.tsx`, `error.tsx`, `loading.tsx`, middleware, favicon/icon file, `robots`, or `sitemap`.

---

## Shell Files

### `src/app/layout.tsx` — Root Layout
- Loaded once for the entire application.
- Sets up Google Inter font via `next/font/google`, attaching it as CSS variable `--font-inter`.
- Defines all page-level SEO metadata (title, description, keywords, OpenGraph, language).
- Renders: fixed background gradient → `<Navbar>` → page content → `<Footer>`.
- Sets `<html lang="pt-BR">`.

### `src/app/template.tsx` — Page Transition Wrapper
- Re-renders on every route change (unlike layout which persists).
- Wraps page content in a Framer Motion `motion.div` with fade-up entrance animation.
- Animation: `opacity 0 → 1`, `y 14px → 0`, `filter blur(5px) → blur(0)` over 0.58s.

### `src/app/globals.css` — Global Styles
- CSS custom properties (brand color tokens).
- Global resets and base styles.
- Custom scrollbar (gold-themed).
- Utility classes: `.glass`, `.text-gold-gradient`, `.btn-shimmer`, `.cta-glow`, `.nav-link-underline`.
- Keyframe definitions: `planeFly`, `particleDrift`, `glowPulse`.

---

## Component Organization

```
src/components/
├── Navbar.tsx              ← Global navigation (used in layout.tsx)
├── Hero.tsx                ← Homepage hero section
├── CloudBackground.tsx     ← Animated sky background for hero
├── AviationTrail.tsx       ← GSAP airplane SVG animation
├── LogoHeroBanner.tsx      ← Brand logo display (homepage "Quem Somos")
│
├── home/                   ← Components used only on the homepage
│   ├── Benefits.tsx        ← "Por que escolher a Alvea?" section
│   └── HomeCTA.tsx         ← Bottom call-to-action section
│
├── ui/                     ← Generic reusable primitives
│   ├── GlassCard.tsx       ← Glassmorphism card container
│   ├── PageHeader.tsx      ← Consistent page hero header
│   └── SectionReveal.tsx   ← Scroll-triggered fade-up wrapper
│
├── booking/                ← Booking flow components
│   ├── BookingModal.tsx    ← Multi-step booking modal (portal); owns all booking state
│   ├── AirportAutocomplete.tsx ← Airport search (tiered match + Fuse.js fallback)
│   ├── FlightCard.tsx      ← Flight card for outbound and return lists
│   ├── FlightFilters.tsx   ← Sort / stops / departure-period bar + FilterState types
│   ├── SelectedFlightBanner.tsx ← Recap of the chosen outbound flight
│   └── TripSummary.tsx     ← Final summary, price box, WhatsApp message builder
│
└── layout/
    └── Footer.tsx          ← Global footer (used in layout.tsx)
```

### Categorization Logic
- **Global** (`Navbar`, `Footer`): Rendered in `layout.tsx`, appear on every page.
- **`home/`**: Sections specific to the homepage, not reused elsewhere.
- **`ui/`**: Pure presentational primitives. No business logic. Highly reusable.
- **`booking/`**: Stateful flow components. `BookingModal` manages a local state machine: 5 form steps → searching → outbound → return → summary.
- **Top-level components** (`Hero`, `CloudBackground`, etc.): Used on the homepage but substantial enough to not belong in `home/`.

---

## Backend Layer (Flight Search)

A server-side flight search backend is implemented and **connected to the frontend** (`BookingModal` calls it). It uses a layered architecture to isolate the Duffel API key and normalize flight data before it reaches the browser.

```
src/lib/
├── types/
│   └── flights.ts           ← Shared TypeScript types (FlightOffer, FlightSearchRequest, etc.)
├── duffel/
│   └── client.ts            ← Raw HTTP client for Duffel (reads DUFFEL_API_KEY, 30s timeout)
├── providers/
│   └── duffel-provider.ts   ← Duffel-specific: builds request, normalizes response, deduplicates
├── services/
│   └── flight-service.ts    ← Business logic: validates input, selects provider, maps errors, logs
└── utils/
    ├── format-duration.ts   ← ISO 8601 duration → "2h 15min" (used by client components)
    └── wa-emojis.ts         ← WhatsApp-safe emoji constants (used by TripSummary)

src/app/api/flights/search/
└── route.ts                 ← POST /api/flights/search (Next.js API route)
```

**The frontend never communicates with Duffel directly.** It calls `/api/flights/search`, which is server-side only. The Duffel API key lives exclusively in `src/lib/duffel/client.ts` and is never exposed.

**Data pipeline inside `duffel-provider.ts`:**

```
POST /air/offer_requests → raw DuffelOffer[] (e.g. 500 offers)
        ↓
Normalize: DuffelOffer[] → FlightOffer[]  (1-to-1 map)
        ↓
Deduplicate: collapse same-flight fare variants → keep cheapest  (O(n) Map pass)
        ↓
Sort: price ascending
        ↓
Return unique FlightOffer[] to service layer (e.g. 87 offers)
```

Deduplication key (as implemented in `buildDeduplicationKey`): `airlineCode|flightNumber|departureTime|arrivalTime` of the outbound **plus** the same four fields of the return slice. One offer is kept per physical (outbound, return) pair — the cheapest. The frontend then collapses the list again: one card per unique outbound, and, after an outbound is chosen, one card per unique return. See [technical-decisions.md — Decision 13](./technical-decisions.md).

**Request lifecycle**

```
BookingModal.performSearch()  →  POST /api/flights/search
  route.ts            parse JSON (400) → validateSearchRequest (422) → searchFlights
  flight-service.ts   provider = 'duffel' (hardcoded) → map provider errors to Portuguese
  duffel-provider.ts  one offer request with 2 slices → normalize → dedup → sort by price
  duffel/client.ts    POST https://api.duffel.com/air/offer_requests (Duffel-Version: v2)
  ←  200 { offers, searchId, provider, timestamp, count }
  ←  404 NO_RESULTS · 429 · 502 · 503 · 504 · 500   as { error, code }
```

Not implemented on the server: rate limiting, caching, CORS configuration, security headers.

See [features/flight-provider.md](./features/flight-provider.md) for more detail (that file predates the frontend connection).

## Data Layer (Frontend)

There is no database. The only network call made by the frontend is the `fetch('/api/flights/search')` inside `BookingModal`.

### Local Data
- `src/data/airports.ts` — 147 airport records typed as `Airport[]` (`code`, `airport`, `city`, `country`).
  - Searched by `AirportAutocomplete.tsx`.
  - Also used by `FlightCard.tsx` and `TripSummary.tsx` to turn an IATA code into a city name.
  - Imported as a static module; no runtime fetching.

### Page-level Data
- Destination data (destination cards with names, descriptions, photos, miles estimates) is defined **inline in `src/app/destinos/page.tsx`** as a typed constant array.
- Service cards and content on `/milhas` and `/passagens` are also hardcoded inline.

### No Global State
There is no Redux, Zustand, Context, or similar global state. The only stateful component is:
- `BookingModal.tsx` — uses `useState` for the form data, current step, search results (`offers`), `apiError`, `flightPhase`, `selectedOffer` (chosen outbound), `matchedOffer` (final outbound+return offer), and `filters`; `useRef` for the double-submit guard and a one-entry result cache. Nothing is persisted — closing the modal discards it all.
- `AirportAutocomplete.tsx` — query text, dropdown open state, input position.
- `src/app/destinos/page.tsx` — the selected destination (which opens the modal).
- `Navbar.tsx` — uses `useState` for mobile drawer open/close and `useEffect` + `useState` for scroll detection.
- `src/app/atendimento/page.tsx` — uses `useState` for form fields and success state.

---

## Data Flow

```
Local data (airports.ts, inline constants)
        ↓
Props passed down to child components
        ↓
User interactions (clicks, input) update local useState
        ↓
UI reflects state changes
        ↓
Conversion actions (WhatsApp link, form submit) triggered
```

The one exception to this local-only flow is flight search: `BookingModal` → `POST /api/flights/search` → Duffel (see Backend Layer above). There are no server actions.

---

## Routing & Navigation

Navigation is handled by Next.js `<Link>` component throughout. No client-side router is invoked manually.

The `Navbar` uses `usePathname()` from `next/navigation` to highlight the active route with a gold underline.

External links in the footer and the booking flow open in new tabs (`target="_blank"`, `rel="noopener noreferrer"`). The contact-method links on `/atendimento` do not set `target`.

---

## Image Strategy

- **Local assets** (`public/logo*.png`): rendered with `next/image` in `Navbar`, `Footer`, and `LogoHeroBanner`.
- **Destination images**: Unsplash URLs (`?auto=format&fit=crop&w=1400&q=90`) rendered with a raw `<img loading="lazy">` in `destinos/page.tsx` and again in the `BookingModal` header. They are **not** optimized by Next.js. `next.config.ts` allows `images.unsplash.com` in `remotePatterns`, but nothing uses it yet.
- **Airline logos**: SVG URLs from `assets.duffel.com`, rendered with raw `<img>` in `FlightCard`, `SelectedFlightBanner`, and `TripSummary`.
- The intended rule is "use `next/image`"; the five raw `<img>` usages above are current exceptions (each carries an `eslint-disable` comment).

---

## TypeScript Configuration

- **Path alias:** `@/*` → `src/*`. Use `@/components/...`, `@/data/...`, etc.
- **Strict mode** enabled.
- **JSON imports** enabled (`resolveJsonModule: true`).
- No custom type declaration files currently exist.

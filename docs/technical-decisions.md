# Technical Decisions

This document explains the significant engineering and design decisions made in the project, and the reasoning behind each. Understanding the WHY prevents future sessions from accidentally reversing intentional choices.

---

## 1. Next.js App Router (not Pages Router)

**Decision:** Use Next.js 15 with the App Router architecture.

**Why:** The App Router provides:
- Cleaner separation between layout (persistent shell) and page content via `layout.tsx` vs `page.tsx`
- `template.tsx` for per-route animations that wouldn't be possible with the Pages Router's `_app.tsx` pattern
- Better TypeScript ergonomics with file-based routing
- Future-proof: App Router is the direction Next.js is investing in

**Trade-off:** App Router requires explicit `"use client"` directives on components that use browser APIs or React state. This is a minor inconvenience but enforces good habits about minimizing client-side JavaScript.

---

## 2. Local Airport Dataset (not an API)

**Decision:** Use a hardcoded TypeScript file (`src/data/airports.ts`, 147 airports as of October 2026) instead of calling an external airport data API.

**Why:**
- **Zero latency:** Results appear instantly as the user types. No network round-trip.
- **Zero cost:** Airport data APIs (Amadeus, AviationStack) have usage limits and costs. The local dataset is free forever.
- **Zero API key management:** No secrets, no rate limiting, no error handling for network failures.
- **No dependency on external uptime:** Works offline and in any network condition.
- **Coverage is sufficient:** 160 airports covers 100% of the destinations Alvea Viagens currently serves. Adding new airports is a one-line edit to the TS file.

**Trade-off:** Airport data can become stale (IATA codes rarely change, but airport names and new airports do). This is acceptable — the dataset only needs to cover destinations the agency actually sells, not every airport in the world.

---

## 3. Fuse.js Fuzzy Search as Fallback Only

**Decision:** Use a tiered search algorithm where Fuse.js is only invoked when tiers 0–5 return zero results.

**Why:** Fuse.js fuzzy matching, while powerful, has unpredictable ranking behavior for short queries. Typing "gru" should immediately return São Paulo/Guarulhos at the top — not fuzzy-match "Grudziądz" in Poland. The tiered approach ensures:

1. Exact and prefix matches always win (most common user behavior)
2. Fuzzy matching is a safety net for misspellings, not the primary algorithm

**How tiers are implemented:**
```
Tier 0: code === query          (exact IATA code)
Tier 1: code.startsWith(query)  (partial IATA)
Tier 2: city.startsWith(query)  (city name prefix)
Tier 3: airport.startsWith(q)   (airport name prefix)
Tier 4: city.includes(query)    (city name anywhere)
Tier 5: airport.includes(query) (airport name anywhere)
Tier 6: Fuse.js fuzzy          (only if 0-5 return nothing)
```

---

## 4. Portal-Based Dropdown and Modal Rendering

**Decision:** Both `AirportAutocomplete`'s dropdown and `BookingModal` render via `ReactDOM.createPortal` to `document.body`.

**Why:** The destination card components have `overflow: hidden` applied to clip the photo zoom effect on hover. Without portals:
- The modal would be visually clipped by the card container
- The airport dropdown would be cut off by the modal's own overflow

Portals solve this by rendering outside the DOM tree where overflow is constrained. The elements appear above everything via `position: fixed` and high z-index.

**Consequence:** Components rendered via portal must manage their own event listeners and cleanup (e.g., the body scroll lock in BookingModal).

---

## 5. Modal-First Booking Flow (Not a Separate Page)

**Decision:** The booking flow is a modal overlay, not a new page route.

**Why:**
- The destination is already selected when the modal opens — the user shouldn't lose context by navigating away
- A modal keeps the destination photo visible in the header, maintaining emotional connection to the chosen destination
- WhatsApp redirect (the exit point) works cleanly from a modal
- Avoids creating 25+ dynamic routes for each destination

**Trade-off:** The multi-step form state lives in memory (component state). Refreshing the page resets it. This is acceptable for a 5-step flow — no user would expect state to persist across refreshes for a search form.

---

## 6. GSAP for the Airplane Animation

**Decision:** Use GSAP (with MotionPathPlugin) for the airplane animation instead of Framer Motion.

**Why:** GSAP's `MotionPath` plugin is the industry standard for animating elements along SVG paths. It handles:
- `autoRotate` — the plane smoothly banks as it follows the curve's tangent
- Path offset control (start at -100px, end at 1920px)
- Reliable 60fps performance even on complex paths

Framer Motion does not have a native MotionPath equivalent. Reproducing this behavior in pure Framer Motion would require custom code and would likely not handle `autoRotate` correctly.

**Why both libraries:** Framer Motion handles all UI animations (page transitions, cards, modals, section reveals). GSAP is used only for this one specific path animation. This keeps GSAP's bundle size as a targeted addition, not a global dependency.

---

## 7. WhatsApp as Primary Conversion (Not a Built-in Checkout)

**Decision:** All booking flows end in a WhatsApp message, not an in-app checkout or payment form.

**Why:**
- **Business model:** Alvea Viagens is a high-touch, consultative service. The specialist needs to speak with the client to understand preferences, verify availability, negotiate pricing, and arrange payment. Automation cannot replace this.
- **Trust:** Brazilian consumers in the premium travel segment have high trust in WhatsApp-based transactions. They often prefer it over filling out web forms.
- **Speed to market:** A WhatsApp integration requires zero backend infrastructure. A real booking/payment system would require months of development, legal compliance, and security auditing.
- **Flexibility:** The specialist can immediately handle edge cases (client wants a specific airline, has special needs, wants to compare options) that a rigid booking flow cannot anticipate.

**Future consideration:** Once volume justifies it, a proper booking API (Duffel) and payment processing can be added. The current modal flow already collects all necessary data and would require minimal changes to route to an actual API instead of WhatsApp.

---

## 8. Static Destination Data (Not a CMS or Database)

**Decision:** Destination data is hardcoded in `destinos/page.tsx` as a TypeScript constant.

**Why:**
- The destination list changes infrequently (new destinations are added perhaps monthly)
- No CMS overhead or subscription cost
- TypeScript type safety on the data structure
- Instant rendering — no async data fetching at page load

**When to reconsider:** If the business wants marketing staff to update destinations without developer involvement, migrate to a headless CMS (Sanity, Contentful, or even a simple Supabase table). The `Destination` type in the file is the schema you'd replicate.

---

## 9. Glassmorphism + Dark Palette (Not a Light Theme)

**Decision:** The entire site uses a dark sky palette with glassmorphism surfaces. No light mode.

**Why:**
- Consistent with luxury/premium travel aesthetic (airline lounges, premium apps like Apple's dark UI)
- Creates a distinctive visual identity that stands out from generic white travel agency sites
- The hero sky scene only works on a dark background — light mode would require an entirely different visual direction
- Implementation simplicity: one palette, no theming system needed

**This is a brand-level decision, not a technical one.** Do not add light mode without explicit approval from the brand owner.

---

## 11. Provider Pattern for Flight Search

**Decision:** Implement flight search as a provider abstraction (`IFlightProvider`) rather than calling Duffel directly from the API route.

**Why:**
- **Replaceability:** Duffel is a commercial service with pricing, rate limits, and potential downtime. If we need to switch to Amadeus, TravelPayouts, or a direct airline API, we change one file (`duffel-provider.ts`) and register a new provider in `flight-service.ts`. The API route, validation, and frontend are unaffected.
- **Testability:** The service can be tested with a mock provider that returns known data, without any HTTP calls to Duffel.
- **Clean boundaries:** Duffel's raw response shapes (over 40 nested fields) are never seen outside `duffel-provider.ts`. Every other layer works with our clean `FlightOffer` type.

**Trade-off:** Slightly more files than a direct Duffel call in the route. The indirection pays off the moment a second provider is considered.

---

## 12. Raw `fetch` Instead of `@duffel/api` SDK

**Decision:** Use the native `fetch` API with hand-written TypeScript types instead of installing Duffel's official `@duffel/api` npm package.

**Why:**
- **No additional dependency:** The project is already small and focused. Adding the Duffel SDK (~200KB) for what is essentially a handful of typed `fetch` calls adds unnecessary weight.
- **Transparency:** The HTTP call is explicit and readable. The timeout, headers, and error parsing are all visible in `client.ts`.
- **Flexibility:** We only consume a small subset of the Duffel API (`/air/offer_requests`). The SDK would give us access to the full API including orders and payments — surface area we do not need and should not expose.
- **Control:** We implement our own timeout (30s via `AbortController`) and error class hierarchy, which gives the service layer predictable error types to work with.

**Trade-off:** We maintain our own Duffel type definitions (`DuffelOffer`, `DuffelSlice`, etc.) in `src/lib/types/flights.ts`. If Duffel changes their response format, we need to update our types manually. This is acceptable given the narrow API surface we use.

---

## 10. Tailwind CSS with Custom Theme Tokens

**Decision:** Use Tailwind's `extend` in `tailwind.config.ts` to add brand-specific tokens (sky-deep, gold, etc.) rather than writing custom CSS for colors.

**Why:**
- Brand colors become Tailwind utilities (`text-gold`, `bg-sky-dark`, `shadow-gold-lg`)
- Consistent usage throughout the codebase via utility classes
- Tailwind's purge/tree-shaking removes unused utilities automatically

**Trade-off:** Custom Tailwind tokens must be documented (this file) because they are not obvious to new developers looking only at `tailwind.config.ts` without context.

---

## 13. Server-Side Offer Deduplication Before Returning to Frontend

**Decision:** Deduplicate normalized `FlightOffer[]` inside `duffel-provider.ts` before the array is returned to the service layer.

**Why deduplication is necessary:**
Duffel's `POST /air/offer_requests` endpoint returns every available fare for a flight — economy saver, economy flexible, economy refundable, with-baggage, without-baggage, etc. A single physical flight (same airline, same flight number, same departure and arrival times) can appear 10–20 times in the raw response. Since Alvea Viagens displays flights to help customers select one before requesting a mileage quotation — not to compare fare families directly — these duplicates add visual noise without informational value.

**How the uniqueness key is built:**
Two offers are considered identical when these eight fields match simultaneously — four for the outbound and the same four for the return slice (updated in Phase 3, when round-trip selection was added):
```
airlineCode | flightNumber | departureTime | arrivalTime | ret.airlineCode | ret.flightNumber | ret.departureTime | ret.arrivalTime
```
`departureTime`/`arrivalTime` are full local datetimes, so the date is included. Origin and destination are not part of the key because every offer in a response shares them. The frontend applies two further collapses (`getUniqueOutboundOffers`, `getReturnOffersFor`) for the two selection lists.
Fields intentionally excluded from the key: fare family name, fare conditions, cabin brand, baggage rules, refundability, change rules, Duffel offer ID, booking references.

**Why the cheapest duplicate is kept:**
The price shown on each card (labelled "A partir de" on outbound cards and "Valor total da viagem" on return cards — the earlier "VALOR DE REFERÊNCIA" label no longer exists) is a reference cash price the specialist uses as an anchor for the miles quotation. Keeping the cheapest fare sets the most favourable anchor for the customer and accurately represents the market floor for that flight. The specialist is free to quote based on any fare in their GDS.

**Implementation:**
- `buildDeduplicationKey(offer)` — pure function producing the `|`-joined key string
- `deduplicateOffers(offers)` — single `Map<string, FlightOffer>` pass (O(n)); replaces any existing entry only when the incoming offer's price is lower
- Runs after normalization and before price sort, so the final array is both deduplicated and ordered cheapest-first

**Trade-off:** If a customer specifically wants a flexible/refundable fare, they will not see it on the card — only the cheapest offer for that flight is shown. This is acceptable because the user's next step is a WhatsApp conversation where the specialist can present all available fare options.

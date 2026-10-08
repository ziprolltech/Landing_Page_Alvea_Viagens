# Known Issues

Technical troubleshooting guide. Documents problems encountered during development, their root causes, and how they were resolved (or why they remain open).

---

## Issue Template

```
### [Issue Name]

**Status:** Resolved | Open | Monitoring | Accepted (Known Limitation)

**Description:** What happens and when.

**Root Cause:** Why it happens.

**Resolution:** What was done to fix it, or the workaround.

**Files Involved:** Which files are affected.

**Notes:** Additional context.
```

---

---

### Airport Dropdown Clipped by Modal Overflow

**Status:** Resolved

**Description:** The `AirportAutocomplete` dropdown (the suggestion list that appears when typing an airport) was being visually cut off — the dropdown appeared but only the top portion was visible before being clipped.

**Root Cause:** `BookingModal.tsx` uses `overflow: hidden` on its container to properly clip the hero image and maintain rounded corners on the modal panel. When the dropdown rendered inside the modal's DOM tree, it was subject to this clipping.

**Resolution:** The dropdown is rendered via `ReactDOM.createPortal(dropdown, document.body)`. The dropdown escapes the modal's DOM tree entirely and renders as a direct child of `<body>`, using `position: fixed` with coordinates calculated from `getBoundingClientRect()`. Z-index is set to 99999 to ensure it appears above the modal (which is already at 9999).

**Files Involved:**
- `src/components/booking/AirportAutocomplete.tsx` (portal implementation)
- `src/components/booking/BookingModal.tsx` (the overflow context that caused the issue)

**Notes:** This same pattern was the reason `BookingModal` itself uses a portal — the destination cards also have `overflow: hidden` for the photo zoom effect. Both modals and dropdowns need portals to escape overflow clipping.

---

### Background Page Scrolls While Modal Is Open

**Status:** Resolved

**Description:** When `BookingModal` was open, the background page (the destinations grid) continued to respond to scroll input. Users on touch devices or using a mouse wheel would unintentionally scroll the page behind the modal.

**Root Cause:** By default, scroll events propagate to the document regardless of whether an overlay is visible.

**Resolution:** `BookingModal` applies a scroll lock on mount and removes it on unmount:

```javascript
// On modal open
document.body.style.overflow = 'hidden'

// On modal close (cleanup)
document.body.style.overflow = ''
```

This is handled inside a `useEffect` with a cleanup function.

**Files Involved:**
- `src/components/booking/BookingModal.tsx`

**Notes:** The `overflow = ''` cleanup (restoring to empty string rather than `'auto'`) is intentional — it restores the body to its default stylesheet behavior rather than forcing a specific value that might conflict with global CSS.

---

### Airport Search Returning Poor Results for Short Queries

**Status:** Resolved

**Description:** During early development, short airport queries like "sp" or "rio" returned unexpected results. Fuse.js was returning fuzzy matches that prioritized wrong airports when the query matched multiple entries at different quality levels.

**Root Cause:** Fuse.js fuzzy matching treats all results with equal algorithmic weight when queries are short. "Rio" could match cities containing "Rio" but also airports with names containing "rio" in unexpected positions.

**Resolution:** Implemented a **tiered priority search** that runs Fuse.js only as a last resort. The 6 deterministic tiers (exact code, code prefix, city prefix, airport name prefix, city contains, airport name contains) handle the vast majority of queries with predictable, correct ordering. Fuse.js is invoked only when all 6 tiers return zero results (e.g., a misspelled query like "garuolhos").

See [features/airport-autocomplete.md](./features/airport-autocomplete.md) for the complete tier documentation.

**Files Involved:**
- `src/components/booking/AirportAutocomplete.tsx`

---

### Accent Characters Breaking Airport Search

**Status:** Resolved

**Description:** Searching for "sao paulo" (no accent) failed to match "São Paulo" in the dataset. Searching for "ribeirao" failed to match "Ribeirão Preto". This was a critical issue for Brazilian users who often type without accents on mobile keyboards.

**Root Cause:** Standard string comparison (`includes`, `startsWith`) is case and accent sensitive by default in JavaScript.

**Resolution:** All strings are normalized before comparison using Unicode NFD decomposition followed by diacritic removal:

```javascript
const normalize = (str: string) =>
  str.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
```

Both the search query and the airport dataset fields are normalized at search time. The dataset also stores pre-normalized fields (`_nc`, `_ns`, `_na`) to avoid re-normalizing on every keystroke.

**Files Involved:**
- `src/components/booking/AirportAutocomplete.tsx`

---

### Next.js Development Server 404 on Chunk Files After Structural Changes

**Status:** Monitoring (Common Next.js behavior, not a project bug)

**Description:** After large structural changes (moving files, renaming directories, adding new pages), the Next.js development server occasionally serves 404 errors for JavaScript chunk files. The browser console shows errors like `Failed to load resource: /_next/static/chunks/...`.

**Root Cause:** Next.js caches chunk manifests in `.next/`. When the file structure changes significantly, the cache can become stale — the browser holds references to chunk paths that no longer exist.

**Resolution:** Stop the development server, delete the `.next/` folder, and restart:

```bash
# Stop the dev server (Ctrl+C)
Remove-Item -Recurse -Force .next
npm run dev
```

**Files Involved:** `.next/` build cache directory

**Notes:** This is not a bug in the project code. It is normal Next.js behavior during active development. It does not occur in production builds. If it occurs frequently, it may indicate that the project structure is changing too rapidly — consider making structural changes in batches and clearing the cache once rather than repeatedly.

---

### Contact Form Does Not Send Emails

**Status:** Resolved differently (2026-10-07) — the form no longer pretends to send. "Solicitar Atendimento" now validates the five fields and opens WhatsApp with a pre-filled message that the visitor sends manually. No e-mail/backend delivery was added. The text below describes the previous behavior.

**Description:** The contact form on `/atendimento` collects user data and shows a success animation, but does not actually send an email or create any lead record. The form is entirely frontend-only.

**Root Cause:** No backend API route has been created for form submission. The `handleSubmit` function in `src/app/atendimento/page.tsx` only validates client-side and sets a success state — it makes no HTTP request.

**Resolution:** None yet. This is a planned feature. See [future-roadmap.md](./future-roadmap.md) for the implementation plan.

**Files Involved:**
- `src/app/atendimento/page.tsx` (form handler)
- `src/app/api/contact/route.ts` (does not exist yet — needs to be created)

**Notes:** The current behavior is not completely broken from a UX perspective — users who fill the form can also reach the agency via the WhatsApp button on the same page. However, leads submitted via the form are currently lost. **Priority: High.** See [integrations.md](./integrations.md) for the recommended implementation (Next.js API route + Resend).

---

### BookingModal Shows Mock Flight Results (Not Real Data)

**Status:** Resolved — Phase 2A complete

**Description:** After completing the 5-step booking flow, the results screen shows two hardcoded fake flights (LATAM and TAP Air Portugal) rather than real available flights for the selected route and dates.

**Root Cause:** The Duffel flight search API had not been integrated. The mock data was added as a UX placeholder.

**Resolution:** Phase 2A implemented. `BookingModal.tsx` now calls `POST /api/flights/search`, maps frontend passenger/cabin values to the backend API format, and renders real `FlightOffer[]` results with staggered entrance animations. Includes skeleton loading state, empty state, and error state with retry/edit controls. Each flight card has a per-flight "Solicitar emissão por milhas" WhatsApp CTA with pre-filled booking context.

**Files Modified:**
- `src/components/booking/BookingModal.tsx` — replaced mock flights with real API integration
- `src/app/destinos/page.tsx` — added `iataCode: string` to `Destination` type and all 28 destination entries

---

### Tailwind v4 Incompatibility (Future Risk)

**Status:** Monitoring

**Description:** The project uses Tailwind CSS v3.4.17. Tailwind v4 introduces breaking changes to the configuration format (CSS-based config instead of `tailwind.config.ts`), utility naming, and plugin API. Upgrading without planning will break the entire design system.

**Root Cause:** Not yet a problem. Relevant only when considering a Tailwind upgrade.

**Resolution:** Do not upgrade Tailwind to v4 without a dedicated migration session. The migration requires:
1. Rewriting `tailwind.config.ts` in the new CSS-based format
2. Auditing all custom utilities and animations
3. Checking that all custom shadow, gradient, and color tokens are preserved
4. Full visual regression testing

**Files Involved:**
- `tailwind.config.ts` (needs full rewrite for v4)
- `src/app/globals.css` (may need updates for v4 CSS variable handling)

**Notes:** There is no urgency to upgrade. Tailwind v3 is stable and supported. Upgrade only when v4 offers a specific feature the project needs.

---

### Destination `iataCode` Missing from Type (Blocks Duffel Integration)

**Status:** Resolved

**Description:** The `Destination` type in `src/app/destinos/page.tsx` did not include an `iataCode` field, blocking Duffel flight search integration.

**Root Cause:** The type was originally designed for display-only use.

**Resolution:** Added `iataCode: string` to the `Destination` type and to all 28 destination entries in the `CONTINENTS` data array. Also added `iataCode: string` to `DestinationForModal` in `BookingModal.tsx`. Multi-airport cities (London, New York) use the primary hub: LHR and JFK respectively.

**Files Modified:**
- `src/app/destinos/page.tsx`
- `src/components/booking/BookingModal.tsx`

---

## Open Issues from the October 2026 Audit

All entries below are **Status: Open**, found on 2026-10-06 by reading and exercising the current code. Nothing was fixed. Evidence and the full list (37 items, with severity) are in [project-state-audit-2026-10.md](./project-state-audit-2026-10.md) §19.

### API Error Message Never Reaches the User

**Description:** Any failed search shows "Erro ao buscar voos. Tente novamente." regardless of the cause.
**Root Cause:** `/api/flights/search` returns `{ error, code }`; `BookingModal.performSearch()` reads `data.message`, which is always undefined.
**Files Involved:** `src/components/booking/BookingModal.tsx`, `src/app/api/flights/search/route.ts`

### "No Flights" Is Shown as an Error; Empty State Unreachable

**Description:** A search with zero results shows the error card with "Editar pesquisa" / "Tentar novamente". The designed empty state ("Nenhum voo disponível" + "Falar com especialista" WhatsApp button) never appears.
**Root Cause:** The route answers zero results with HTTP 404 `NO_RESULTS`; the modal treats every non-OK response as an error. The empty state requires `apiError === null && offers.length === 0`, which cannot happen.
**Files Involved:** `src/app/api/flights/search/route.ts`, `src/components/booking/BookingModal.tsx`

### Flight Numbers Displayed as "TPnull"

**Description:** Some flights show the airline code followed by the word "null" on cards and in the WhatsApp message (18 of 84 offers in a GRU → LIS test search, all TAP).
**Root Cause:** Duffel can return `operating_carrier_flight_number: null`; `normalizeSegment`/`normalizeSlice`/`normalizeOffer` concatenate it without a check.
**Files Involved:** `src/lib/providers/duffel-provider.ts`

### Tailwind Opacity Modifiers That Generate No CSS

**Description:** About 60 class usages such as `text-white/52`, `bg-gold/8`, `border-gold/22`, `border-white/8`, `text-white/38` have no effect. Muted text renders pure white, tinted backgrounds and Hero orbs are missing, and translucent borders fall back to the default border color.
**Root Cause:** Tailwind 3 only generates opacity modifiers present in its opacity scale (multiples of 5). Verified in the compiled CSS.
**Files Involved:** most components and pages (Hero, Benefits, HomeCTA, PageHeader, page.tsx, booking components, atendimento)

### Production Build Expected to Fail on Lint

**Description:** `npx eslint src` reports 3 `@typescript-eslint/no-unused-vars` errors. `next build` runs ESLint and is not configured to ignore it. Not yet confirmed by running the build.
**Files Involved:** `src/components/booking/BookingModal.tsx` (`getCity`), `src/components/booking/TripSummary.tsx` (`originAirport`, `destinationName` in `buildWaMessage`)

### Dependency Vulnerabilities

**Description:** `npm audit` reports 17 vulnerabilities (1 critical, 14 high, 2 moderate), mostly against `next@15.3.3`, plus `postcss`, `sharp`, `source-map-js`, `postcss-selector-parser`. npm reports them as fixable without a major upgrade.

### Hero CTA Buttons Do Nothing

**Status:** Resolved (2026-10-06) — "Comprar Milhas" was removed and "Emitir Passagem" is now the single Hero CTA, linking to `/destinos`.

**Description (original):** "Emitir Passagem" and "Comprar Milhas" in the homepage hero have no `onClick` and are not links.
**Files Involved:** `src/components/Hero.tsx`

### Same-Day Return Accepted by the Picker, Rejected by the Server

**Description:** The return date picker allows the departure date itself; the server requires the return to be strictly later and responds 422, which the user sees as the generic error.
**Files Involved:** `src/components/booking/BookingModal.tsx`, `src/lib/services/flight-service.ts`

### Booking Step 1 Cannot Be Completed with the Keyboard

**Description:** Airport suggestions can only be chosen with mouse/touch (`onMouseDown`). There is no arrow/Enter handling or combobox markup, and "Continuar" stays disabled until a suggestion is selected.
**Files Involved:** `src/components/booking/AirportAutocomplete.tsx`

### No Rate Limiting on the Flight Search Endpoint

**Description:** `/api/flights/search` can be called without limit; each call consumes Duffel quota. There is also no server-side cache.
**Files Involved:** `src/app/api/flights/search/route.ts`

### Prices in USD, Truncated, Without Passenger Context

**Description:** Results are shown as e.g. `USD 574` (cents dropped with `Math.floor`), with no conversion to BRL and no indication that the total covers all passengers.
**Files Involved:** `src/components/booking/FlightCard.tsx`, `src/components/booking/TripSummary.tsx`

### `.env.local.example` Contradicts the Code

**Description:** The example file says no API keys are required, but flight search needs `DUFFEL_API_KEY`. `DUFFEL_ENV` exists in `.env.local` and is not read anywhere.

### Most of the Project Is Uncommitted

**Description:** The repository has 2 commits (last on 2026-05-15). The Duffel integration, `src/lib/`, `src/app/api/`, the new booking components, and `docs/` exist only in the working tree.

---

## Adding New Issues

When you encounter a problem during development:

1. Reproduce it to confirm it is real
2. Identify the root cause before fixing
3. Add an entry here **before** implementing the fix
4. After fixing, update the entry status to "Resolved" and document what was done
5. Add the fix to `changelog.md`

This prevents the same problem from being re-investigated in future sessions.

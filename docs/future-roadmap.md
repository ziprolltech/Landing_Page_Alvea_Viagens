# Future Roadmap

---

## Status Key

| Symbol | Meaning |
|---|---|
| ✅ | Completed |
| 🔄 | In Progress |
| 📋 | Planned (defined requirements) |
| 💡 | Idea (not yet scoped) |

---

## ✅ Completed

### Core Pages
- [x] Homepage with animated hero (clouds, airplane, parallax)
- [x] Destinations page with 28 international destinations (5 continents)
- [x] Miles page with 4 service cards
- [x] Tickets/Passagens page with search panel and services
- [x] Contact/Atendimento page with contact methods and form

### Core Features
- [x] Responsive design (mobile, tablet, desktop)
- [x] BookingModal with 5-step flow
- [x] Airport autocomplete (147 airports, tiered search, accent-insensitive)
- [x] WhatsApp pre-filled message generation
- [x] Duffel flight search — backend (`/api/flights/search`, provider pattern, validation, error mapping)
- [x] Duffel flight search — frontend (real results in `BookingModal`, no mock data)
- [x] Destination IATA codes (all 28 destinations)
- [x] Round-trip selection: outbound → return → trip summary
- [x] Flight filters (sort, stops, departure period)
- [x] Price breakdown (base + taxes) and fare conditions in summary and WhatsApp message
- [x] ISO 8601 duration formatting, including multi-day durations
- [x] Page transition animations
- [x] Scroll-reveal animations (SectionReveal)
- [x] Glassmorphism design system
- [x] Fixed navbar with scroll-state glass effect
- [x] Mobile navigation drawer
- [x] SEO metadata (title, description, OpenGraph)
- [x] Custom scrollbar styling

---

## Priorities from the October 2026 audit

Derived only from the state of the code on 2026-10-06. Details and evidence: [project-state-audit-2026-10.md](./project-state-audit-2026-10.md).

### 🔴 Necessary
1. **Commit the working tree.** Only 2 commits exist; the whole Duffel integration, `src/lib/`, `src/app/api/`, and `docs/` are uncommitted.
2. **Confirm and fix the build.** ESLint reports 3 `no-unused-vars` errors (`BookingModal.tsx`, `TripSummary.tsx`), which should fail `npm run build`.
3. **Update Next.js within 15.x.** `npm audit` reports 17 vulnerabilities (1 critical, 14 high), mostly against next 15.3.3.
4. **Fix the API/modal error contract.** The modal reads `data.message`, the API sends `error`; "no results" (404) is shown as a failure, so the empty state with the WhatsApp fallback never appears.
5. **Guard null flight numbers** (shown as e.g. `TPnull`).
6. **Decide the currency strategy** (results are USD, cents truncated) and label totals as covering all passengers.
7. ~~**Make the contact form deliver**~~ — done 2026-10-07 via WhatsApp hand-off (pre-filled message, sent manually by the visitor). Original note: (see Contact Form Backend below) — it currently discards submissions while confirming success.
8. ~~**Wire or remove the Hero buttons** "Emitir Passagem" / "Comprar Milhas"~~ — done 2026-10-06: single "Emitir Passagem" CTA → `/destinos`.

### 🟠 Recommended
9. Replace the ~60 Tailwind opacity modifiers that generate no CSS (`/8`, `/12`, `/22`, `/38`, `/52`, …) and review the visual result.
10. Add rate limiting and security headers for `/api/flights/search`; correct `.env.local.example`.
11. Keyboard and ARIA support in the airport autocomplete; dialog semantics, focus trap, and Escape in the modal.
12. Align date rules (picker allows same-day return, server rejects it) and compute "today" in Brazil time instead of UTC.
13. Image weight: smaller logo sources (currently 4.4 MB of PNG), optimized destination photos (currently 1400px/q90 raw `<img>`).
14. Add favicon, OpenGraph image, `not-found`, `error`, `robots`, `sitemap`.
15. Add `JTR` and `MLE` to `airports.ts`.
16. Obtain a Duffel live key and define the production environment.

### 🟢 Future improvements
17. Show layovers/segments, baggage, and marketing carrier.
18. Flexible passenger selection (child ages, infants, real group sizes) and one-way trips.
19. Centralize duplicated helpers and constants (WhatsApp number, date/time formatters, gold gradient).
20. Respect `prefers-reduced-motion` in Framer Motion and GSAP animations.
21. Server-side caching of identical searches; pagination of results.
22. Automated tests for validation, the provider, and the formatters.
23. Bring the remaining docs (`docs/features/*`, `project-overview.md`, `destinations.md`, …) in line with the audit.

---

## 📋 Planned

### Contact Form Backend

**Priority:** High
**Effort:** Small (1–2 days)

Implement an API route to actually send the contact form data. The frontend is complete; only the backend handler is missing.

**Implementation plan:**
1. Create `src/app/api/contact/route.ts`
2. Accept POST with form fields
3. Validate server-side
4. Send email via Resend API to `alveaviagens@gmail.com`
5. Return `{ success: true }` or error

**Required:** `RESEND_API_KEY` in `.env.local`

---

### Duffel API — Real Flight Search ✅

Completed in July 2026 (see changelog and the Completed list above). Remaining Duffel-related work is listed under "Priorities from the October 2026 audit".

---

### Analytics

**Priority:** Medium
**Effort:** Small (half day)

Add basic event tracking to measure conversion:
- WhatsApp link clicks (by page and context)
- Booking modal opens (by destination)
- Contact form submissions
- Page views

**Options:** Google Analytics 4, Plausible (privacy-friendly), or Fathom.

---

### Destination Search & Filter

**Priority:** Medium
**Effort:** Medium (2–3 days)

Add a search bar and filter panel to the destinations page:
- Filter by continent (currently shown as sections — add tab navigation)
- Filter by budget (miles range: economy, business, first)
- Free-text search by destination name

This would require extracting the destination data to its own file (`src/data/destinations.ts`) for cleaner code.

---

### Blog / Content Section

**Priority:** Low
**Effort:** Medium (3–5 days)

A travel blog builds SEO and provides value to visitors. Implementation options:
- Static MDX files in `src/content/` — simple, no CMS needed
- Headless CMS (Sanity or Contentful) — allows non-developer content updates

SEO keywords to target: "como usar milhas aéreas", "passagem executiva barata", "emitir passagem com milhas", etc.

---

### User Accounts / Saved Searches

**Priority:** Low
**Effort:** Large (2–4 weeks with backend)

Allow users to:
- Save preferred airports
- View past inquiries
- Receive price drop notifications

Requires: Authentication (NextAuth.js), database (Supabase), and notification system.

---

## 💡 Ideas (Not Yet Scoped)

### Miles Calculator

An interactive tool where users input their miles balance and desired destination and see what class of travel they could afford.

### Price Alert Subscribe

Users enter a destination and budget → receive WhatsApp or email notification when miles drop to an achievable range.

### Testimonials Section

A rotating carousel of client testimonials with travel photos. Currently the site has no social proof from real clients (only aggregate stats).

### Live Chat Widget

Integrate a WhatsApp chat bubble (e.g., via WA.me widget or Tidio) that appears on all pages after 30 seconds.

### Partner Airlines Page

A page showcasing the airline programs Alvea works with (LATAM, TAP, Avianca, etc.) with program-specific information.

### Portuguese Language SEO Landing Pages

Dedicated SEO-optimized pages for high-intent keywords:
- `/emitir-passagem-executiva` — "emit business class ticket"
- `/comprar-milhas-latam` — "buy LATAM miles"
- `/viajar-para-europa-com-milhas` — "travel to Europe with miles"

---

## Dependency Upgrade Notes

Installed versions and `npm outdated` as of 2026-10-06. Nothing was upgraded during the audit.

| Package | Installed | Available | Notes |
|---|---|---|---|
| Next.js | 15.3.3 | 15.5.27 (in range) / 16.3.8 | **Has known critical/high advisories — update within 15.x first** |
| eslint-config-next | 15.3.3 | 15.5.27 / 16.3.8 | Keep in step with Next.js |
| React / React DOM | 18.3.1 | 19.3.0 | Major upgrade; evaluate together with Next.js 16 |
| Framer Motion | 11.18.2 | 14.0.0 | Major upgrade; keep in sync with React version |
| GSAP | 3.15.0 | — | Up to date within range |
| Tailwind CSS | 3.4.19 | 4.3.3 | v4 is a breaking change — plan migration separately |
| Fuse.js | 7.3.0 | 7.5.0 | Minor |
| Lucide React | 0.511.0 | 1.52.0 | Major |
| TypeScript | 5.9.3 | 7.0.2 | Major |
| ESLint | 9.39.4 | 10.12.0 | Major |
| PostCSS | 8.5.14 | 8.5.29 | Patch; has advisories fixed in later 8.5.x |

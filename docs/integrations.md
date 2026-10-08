# Integrations

---

## Current Integrations

### WhatsApp (Active)

**Type:** Link-based (no API)
**Status:** Fully implemented

WhatsApp is the primary conversion channel. The site does not use the WhatsApp Business API — it uses plain links.

**Link formats (two are in use):**
```
https://api.whatsapp.com/send?phone=5516997315748&text=URL_ENCODED_MESSAGE   ← every link that carries a message
https://wa.me/5516997315748                                                  ← plain links without text
```

`api.whatsapp.com/send` is used for pre-filled messages because the `wa.me` redirect corrupted emoji (see changelog, 2026-07-16). The number is hardcoded in each file below; there is no shared constant.

**Where used:**
| Location | Trigger | Endpoint | Message |
|---|---|---|---|
| `TripSummary.tsx` | "Solicitar emissão com milhas" | `api.whatsapp.com/send` | Full message: search summary, outbound flight, return flight, price, fare conditions |
| `BookingModal.tsx` | "Falar com especialista" (no-results state — currently unreachable, see audit) | `api.whatsapp.com/send` | Short message: destination + search parameters |
| `Footer.tsx` | Phone link and WhatsApp icon | `wa.me` | None |
| `atendimento/page.tsx` | WhatsApp contact card | `wa.me` | None |

All other CTAs ("Falar com Especialista", "Emitir Passagem", …) link to `/atendimento`, not to WhatsApp.

Messages are encoded once with `encodeURIComponent`. Emoji come from `src/lib/utils/wa-emojis.ts` (`String.fromCodePoint`).

**Note on `target="_blank"`:** The booking and footer links open in a new tab with `rel="noopener noreferrer"`. The contact-page card link has neither attribute.

---

### Email (Link-Based, Active)

**Type:** `mailto:` link (no API)
**Status:** Active (opens device email client)

Email links are present in the footer and atendimento page:
```html
<a href="mailto:alveaviagens@gmail.com">alveaviagens@gmail.com</a>
```

The contact form on `/atendimento` is **frontend-only** — it does not currently send emails. It only shows a success state after client-side validation.

---

### Instagram (Link, Active)

**Type:** External link
**Status:** Active

Instagram icon in the footer links to `https://www.instagram.com/alveaviagens/` (new tab).

---

### Duffel API — Flight Search (Active, test mode)

**Type:** Server-side REST integration (raw `fetch`, no SDK)
**Status:** Implemented end to end and connected to `BookingModal`. Running on a **test** API key.

```
BookingModal  →  POST /api/flights/search  →  flight-service  →  duffel-provider  →  duffel/client  →  api.duffel.com
```

| Aspect | Current behavior |
|---|---|
| Endpoint called | `POST https://api.duffel.com/air/offer_requests`, header `Duffel-Version: v2`, `return_offers: true` |
| Request | One offer request with two slices (outbound + return), passengers by type, cabin class |
| Key | `DUFFEL_API_KEY`, read only in `src/lib/duffel/client.ts`; the module throws if loaded in a browser |
| Timeout | 30 s |
| Validation | Server-side in `validateSearchRequest` (IATA format, different airports, date format, departure ≥ today, return after departure, 1–9 passengers, infants ≤ adults, cabin class) |
| Normalization | `FlightOffer` with outbound fields at top level + `returnSlice`; airline and flight number from the first segment's operating carrier |
| Deduplication | Cheapest offer per physical (outbound, return) pair |
| Sorting | Price ascending |
| Price fields | `price` (`total_amount`), `baseAmount`, `taxAmount` (nullable), `currency` |
| Fare conditions | `refundAllowed`, `changeAllowed`, `changePenalty` (nullable) |
| Errors | Mapped to `{ error, code }` with Portuguese text; Duffel messages are not forwarded |
| Rate limiting | None of our own (Duffel's 429 is mapped to a friendly message) |
| Caching | None on the server; one-entry cache in the open modal |
| Currency | As returned by Duffel — **USD** with the current key; no BRL conversion |
| Not used | Baggage, segment/layover display, marketing carrier, offer expiry, orders, payments |

Observed in the audit (GRU → LIS, test mode): 84 offers in 3.6 s, all in USD, including Duffel's synthetic test airline; some offers carry a null flight number.

Going to production requires a live key (`duffel_live_…`) set in the hosting environment.

See [features/flight-provider.md](./features/flight-provider.md) and [project-state-audit-2026-10.md](./project-state-audit-2026-10.md) §9.

---

> **Flight search (Duffel) — paused on 2026-10-08.** The integration is intact but the site does not call it: the `/destinos` form ends in WhatsApp for now. A new flight provider is planned once a reliable source of prices is found; `FLIGHT_SEARCH_ENABLED` in `BookingModal.tsx` is the switch.

## Planned Integrations

### Contact Form Backend

**Priority:** High
**Status:** Not started

The contact form at `/atendimento` collects:
- Nome, Email, Telefone, Destino, Mensagem

Currently does nothing with this data (no API call, no email, no CRM).

**Options for implementation:**
1. **Resend / Nodemailer via Next.js API route** — Create `app/api/contact/route.ts` that accepts POST, validates fields, and sends an email to `alveaviagens@gmail.com`.
2. **Formspree / EmailJS** — Third-party form-handling service. Quickest to implement, no backend code needed.
3. **Supabase** — Store submissions in a database table, optionally trigger an email notification.

**Recommended approach:** Next.js API route + Resend (clean, no third-party dependency, matches existing architecture).

---

### Duffel — remaining work

**Status:** Search is live (see "Duffel API — Flight Search" above). Phases 1 (backend), 2 (frontend), 3 (round-trip selection) and 3.5 (price breakdown, fare conditions) are done. Mock flights no longer exist.

Open items:
- Live API key and production environment configuration
- Currency strategy (results are in USD; no BRL conversion)
- Rate limiting and server-side caching for `/api/flights/search`
- Aligning the error contract with the modal (`error` vs `message`, `NO_RESULTS` as 404)
- Null flight numbers from Duffel
- Baggage and layover details (not consumed yet)

Booking, payment, and order management through Duffel are **not** implemented and not planned in code — conversion happens over WhatsApp.

---

### Airport Autocomplete API (Considered, Rejected)

**Status:** Explicitly chosen NOT to use

The airport autocomplete was implemented with a local `airports.ts` dataset (147 airports) instead of an external API (e.g., Amadeus, AviationStack). See [technical-decisions.md](./technical-decisions.md) for the rationale.

Verified in the October 2026 audit: there is no AirportDB, API Ninjas, or any other airport API code, configuration, or environment variable in the project, and no leftover code from one.

---

### Google Analytics / Analytics Platform

**Priority:** Medium
**Status:** Not started

No analytics are currently implemented. When added:
- Use `next/script` in `layout.tsx` to load the GA script
- Or use a privacy-first alternative (Plausible, Fathom) for GDPR compliance
- Track conversion events: WhatsApp link clicks, booking modal opens, form submissions

---

### CRM Integration

**Priority:** Low
**Status:** Idea stage

Future possibilities:
- **HubSpot Free CRM** — collect form submissions directly into HubSpot contacts
- **Pipedrive** — pipeline management for travel inquiries
- **Notion API** — simple database of leads if no dedicated CRM is needed

---

## Environment Variables

Current (values never belong in docs or git):

| Variable | Read in | Side | State |
|---|---|---|---|
| `DUFFEL_API_KEY` | `src/lib/duffel/client.ts` | backend only | configured in `.env.local` (test key) — **required** for flight search |
| `DUFFEL_ENV` | nowhere | — | present in `.env.local`, not read by any code |

`.env.local` is git-ignored. `.env.local.example` is out of date: it states that no API keys are required and lists no variable.

No `NEXT_PUBLIC_*` variable exists.

Possible future additions:
```bash
RESEND_API_KEY=         # For contact form email delivery
NEXT_PUBLIC_GA_ID=      # For Google Analytics
```

**Rule:** `NEXT_PUBLIC_` prefix exposes variables to the browser. API keys must NEVER have this prefix — keep them server-side only.

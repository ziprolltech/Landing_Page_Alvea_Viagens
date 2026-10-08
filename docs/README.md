# Alvea Viagens — Landing Page

> **Primary entry point for any new Claude Code session.** Read this file first, then consult the specific `/docs` files relevant to the task at hand.

---

## What is Alvea Viagens?

Alvea Viagens is a **premium Brazilian travel agency** specializing in airline tickets, airline miles management, and curated international travel experiences. The business is positioned in the luxury/premium segment, emphasizing personal consultation, trust, and expertise over volume.

The website is a **Next.js 15 landing page** whose primary conversion goal is to move visitors into a WhatsApp conversation with a travel specialist. CTAs route to the contact page (`/atendimento`); the booking flow on `/destinos` runs a real flight search (Duffel) and ends in a pre-filled WhatsApp message (`api.whatsapp.com/send`, number `5516997315748`).

> **Current state:** see [project-state-audit-2026-10.md](./project-state-audit-2026-10.md) — the full audit of October 2026, including open problems. Where any other doc disagrees with it, the audit (and the code) wins.

---

## Technology Stack

Installed versions as of the October 2026 audit (`npm ls`):

| Layer | Technology | Version |
|---|---|---|
| Runtime | Node.js (local, not pinned) | 24.15.0 |
| Framework | Next.js (App Router) | 15.3.3 |
| Language | TypeScript | 5.9.3 |
| UI Library | React | 18.3.1 |
| Styling | Tailwind CSS | 3.4.19 |
| Animations | Framer Motion | 11.18.2 |
| Animations | GSAP | 3.15.0 |
| Icons | Lucide React | 0.511.0 |
| Fuzzy Search | Fuse.js | 7.3.0 |
| Flight data | Duffel API (raw `fetch`, no SDK) | API v2 |
| Fonts | Google Inter (300–900) | — |

---

## Folder Organization

```
Landing-Page-AlveaViagens/
├── docs/                        ← Project knowledge base (this folder)
├── src/
│   ├── app/                     ← Next.js App Router pages + layout
│   │   ├── layout.tsx           ← Root layout (fonts, metadata, Navbar, Footer)
│   │   ├── template.tsx         ← Page-transition wrapper (Framer Motion)
│   │   ├── globals.css          ← Global CSS variables, utilities, keyframes
│   │   ├── page.tsx             ← Home page (/)
│   │   ├── passagens/page.tsx   ← Tickets page (/passagens)
│   │   ├── milhas/page.tsx      ← Miles page (/milhas)
│   │   ├── destinos/page.tsx    ← Destinations page (/destinos)
│   │   ├── atendimento/page.tsx ← Contact/consultation page (/atendimento)
│   │   └── api/flights/search/route.ts ← POST /api/flights/search (server only)
│   ├── components/
│   │   ├── Navbar.tsx           ← Fixed navigation header
│   │   ├── Hero.tsx             ← Homepage hero section
│   │   ├── CloudBackground.tsx  ← Photorealistic cloud animation
│   │   ├── AviationTrail.tsx    ← GSAP airplane path animation
│   │   ├── LogoHeroBanner.tsx   ← Brand hero image display
│   │   ├── home/                ← Home-page-specific sections
│   │   │   ├── Benefits.tsx     ← "Por que escolher a Alvea?" section
│   │   │   └── HomeCTA.tsx      ← Bottom CTA section
│   │   ├── ui/                  ← Reusable primitive components
│   │   │   ├── GlassCard.tsx    ← Glassmorphism card wrapper
│   │   │   ├── PageHeader.tsx   ← Standard page hero header
│   │   │   └── SectionReveal.tsx← Scroll-triggered fade-up wrapper
│   │   ├── booking/             ← Booking flow components
│   │   │   ├── BookingModal.tsx ← 5 form steps → search → outbound → return → summary
│   │   │   ├── AirportAutocomplete.tsx ← Tiered airport search
│   │   │   ├── FlightCard.tsx   ← Flight card (outbound and return lists)
│   │   │   ├── FlightFilters.tsx ← Sort / stops / departure-period bar
│   │   │   ├── SelectedFlightBanner.tsx ← Chosen outbound recap
│   │   │   └── TripSummary.tsx  ← Final summary + WhatsApp message
│   │   └── layout/
│   │       └── Footer.tsx       ← Site footer
│   ├── data/
│   │   └── airports.ts          ← Local airport database (147 airports)
│   └── lib/                     ← Server-side flight search
│       ├── duffel/client.ts     ← Duffel HTTP client (reads DUFFEL_API_KEY)
│       ├── providers/duffel-provider.ts ← Request, normalization, dedup, sort
│       ├── services/flight-service.ts   ← Validation, error mapping, logging
│       ├── types/flights.ts     ← Shared flight types
│       └── utils/               ← format-duration.ts, wa-emojis.ts
├── public/
│   ├── logo.png                 ← Brand image, 1024×1536 (rendered 600×660)
│   ├── logo-navbar.png          ← Navbar logo, 2048×2048 (rendered 54px high)
│   └── logo-footer.png          ← Footer logo, 2048×2048 (rendered 96px high; same file as navbar)
├── .env.local                   ← DUFFEL_API_KEY (git-ignored, required for flight search)
├── next.config.ts               ← Next.js config (remote image allowlist)
├── tailwind.config.ts           ← Custom theme (sky/gold palette, animations)
├── tsconfig.json                ← TypeScript config (strict, path alias @/*)
├── postcss.config.mjs           ← PostCSS (tailwind + autoprefixer)
└── package.json                 ← Dependencies and scripts
```

---

## How to Start the Project

```bash
# Install dependencies
npm install

# Development server (hot reload)
npm run dev

# Production build
npm run build

# Serve production build
npm start

# Lint
npm run lint
```

The development server runs at `http://localhost:3000` by default.

**Environment:** flight search needs `DUFFEL_API_KEY` in `.env.local` (server-only). Without it the search returns a configuration error; the rest of the site works. `.env.local.example` currently does not list this variable.

**Known state (October 2026):** `npx tsc --noEmit` passes; `npx eslint src` reports 3 `no-unused-vars` errors, so `npm run build` is expected to fail until they are fixed. There are no automated tests.

---

## Development Philosophy

**Premium first.** Every visual decision should reinforce the luxury travel positioning. The dark sky/gold palette, glassmorphism, and subtle animations communicate trust and exclusivity before a word is read.

**Conversion-focused.** Every page section exists to move users toward a WhatsApp conversation or the contact form. No dead ends.

**Local-first.** The airport autocomplete runs entirely from a local TypeScript dataset — no API keys, no latency, no cost per search. The only external service is Duffel, called from the server for flight search.

**Component composition.** Reusable primitives (`GlassCard`, `PageHeader`, `SectionReveal`) keep pages consistent and easy to extend.

---

## Coding Standards

- **TypeScript strict mode** — all props and data types must be explicitly typed.
- **No `any`** — use proper interfaces or union types.
- **Path alias `@/*`** maps to `src/*`. Always use it over relative paths.
- **No console logs** in client code. (The server-side flight service and API route log search parameters, counts, and timings on purpose.)
- **Framer Motion** for UI transitions; **GSAP** for complex SVG/path animations.
- **Tailwind utility-first** with custom theme tokens. Avoid inline `style` unless dynamic values are required.
- **No comments** unless the WHY is non-obvious from the code itself.

---

## Key Contacts / Business Info

| Field | Value |
|---|---|
| WhatsApp | +55 (16) 99731-5748 |
| Email | alveaviagens@gmail.com |
| Business Hours | Not published (removed from the site on 2026-10-07 — service is on demand) |
| Language | Portuguese (pt-BR) |
| Locale | pt_BR |

---

## Documentation Reading Order

Every new developer or AI assistant must read the documentation in this order. Skipping steps leads to misunderstandings, accidental regressions, and violated brand decisions.

| Step | File | Why |
|---|---|---|
| 1 | [ai-context.md](./ai-context.md) | Project DNA — brand, objectives, what must never change |
| 2 | [README.md](./README.md) | Stack, folder structure, how to run |
| 3 | [project-overview.md](./project-overview.md) | Business model, audience, conversion strategy |
| 4 | [architecture.md](./architecture.md) | App Router, data flow, component organization |
| 5 | [development-guidelines.md](./development-guidelines.md) | Mandatory rules for all code changes |
| 6 | `docs/features/<relevant-feature>.md` | Deep-dive on the specific feature being worked on |
| 7+ | Remaining docs as needed | design-system, components, animations, etc. |

This order ensures the brand philosophy and architectural constraints are understood before any implementation detail is encountered.

---

## Documentation Index

### Core Documentation

| File | Contents |
|---|---|
| [ai-context.md](./ai-context.md) | AI onboarding guide — project DNA and what must never change |
| [project-overview.md](./project-overview.md) | Business context, goals, conversion strategy |
| [architecture.md](./architecture.md) | App Router structure, data flow, routing |
| [design-system.md](./design-system.md) | Colors, typography, spacing, effects |
| [pages.md](./pages.md) | Every page: layout, sections, interactions |
| [components.md](./components.md) | Every component: props, behavior, usage |
| [animations.md](./animations.md) | All animations: how they work, why they exist |
| [destinations.md](./destinations.md) | Destination data, cards, modal behavior |
| [booking-flow.md](./booking-flow.md) | Complete booking journey step by step |
| [branding.md](./branding.md) | Logo usage, brand assets, identity rules |
| [assets.md](./assets.md) | All assets: location, purpose, constraints |
| [integrations.md](./integrations.md) | WhatsApp, email, planned APIs |
| [technical-decisions.md](./technical-decisions.md) | Engineering decisions and rationale |
| [future-roadmap.md](./future-roadmap.md) | Planned features and improvements |
| [changelog.md](./changelog.md) | Project history |
| [development-guidelines.md](./development-guidelines.md) | Rules for all future development |
| [known-issues.md](./known-issues.md) | Troubleshooting guide: open and resolved issues |
| [project-state-audit-2026-10.md](./project-state-audit-2026-10.md) | Full project state audit (October 2026): real state, problems, drift, roadmap |

### Feature Documentation (`docs/features/`)

| File | Contents |
|---|---|
| [features/airport-autocomplete.md](./features/airport-autocomplete.md) | Tiered search, Fuse.js, accent normalization |
| [features/booking-modal.md](./features/booking-modal.md) | 5-step flow, portal, step transitions (predates the audit — may be stale) |
| [features/destinations.md](./features/destinations.md) | Cards, continent sections, data structure |
| [features/hero-section.md](./features/hero-section.md) | Clouds, airplane, parallax, headline structure |
| [features/navbar.md](./features/navbar.md) | Scroll state, mobile drawer, active route |
| [features/footer.md](./features/footer.md) | Layout, social links, contact info |
| [features/animations.md](./features/animations.md) | Animation library decisions and patterns |
| [features/whatsapp-integration.md](./features/whatsapp-integration.md) | Link format, message generation, all touchpoints |
| [features/instagram-integration.md](./features/instagram-integration.md) | Footer link, future use cases |
| [features/contact-system.md](./features/contact-system.md) | Contact page form, validation, planned backend |
| [features/logo-system.md](./features/logo-system.md) | Three logos, usage context, placement rules |
| [features/scroll-effects.md](./features/scroll-effects.md) | Parallax, SectionReveal, scroll indicator |
| [features/flight-search-planning.md](./features/flight-search-planning.md) | Duffel API plan, data mapping, implementation steps |
| [features/flight-provider.md](./features/flight-provider.md) | Duffel backend architecture (Phase 1 — implemented) |

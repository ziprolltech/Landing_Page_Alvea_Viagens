# AI Context — Alvea Viagens

> **Read this first.** This file is the authoritative briefing for any AI assistant starting a session on this project. It explains what the project is, what it values, and what must never be changed without explicit instruction.

---

## What This Project Is

Alvea Viagens is a **premium Brazilian travel agency** that sells airline tickets and manages airline miles for high-value clients. The website is a Next.js 15 landing page designed to convert visitors into WhatsApp leads — there is no checkout, no user accounts, no backend database. Every CTA on the site ultimately routes to a human travel specialist.

The business is positioned in the **luxury segment**. The product is not cheap tickets — it is expert knowledge, personal service, and strategic access to miles programs that can put clients in business class for a fraction of the retail price.

---

## The Primary Business Objective

**Move visitors from the browser into a WhatsApp conversation.**

That is the entire purpose of the site. All design decisions, copy, animations, and interaction flows exist to accomplish this one goal. When you are evaluating any change, ask: "Does this help a visitor feel confident enough to click a CTA?" If yes, it is probably right. If no, reconsider.

See [project-overview.md](./project-overview.md) for the full conversion funnel.

---

## The Premium Brand Philosophy

The brand communicates **luxury and trust before it communicates information**. A visitor should feel the quality of the experience within the first second of seeing the page — before reading a word of copy.

This is achieved through:
- A cinematic, animated sky scene (clouds + airplane trail) as the hero backdrop
- A dark navy/black palette that reads as "premium" in travel contexts (business lounges, night flights, executive apps)
- Gold as the sole accent color — measured, not excessive
- Glassmorphism surfaces (frosted glass on dark backgrounds) — associated with premium product design
- Generous whitespace, never crowded
- Smooth, unhurried animations that respect the user's attention

**The aesthetic is not a stylistic preference — it is the brand.** Do not simplify, flatten, or "modernize" it unless explicitly asked.

---

## Expected User Experience

A visitor arrives and should feel:

1. **Instant trust** — The professional visual quality signals expertise before copy is read.
2. **Aspiration** — The animated sky, airplane trail, and destination photography evoke the feeling of travel.
3. **Clarity** — The value proposition is stated immediately in the hero headline.
4. **Low friction** — CTAs are obvious. The booking flow is guided and never leaves the page context.
5. **Warmth** — The WhatsApp endpoint feels like reaching a human expert, not submitting to a form.

A visitor should never feel lost, confused about how to proceed, or uncertain about the quality of the service.

---

## Architecture Philosophy

**Simplicity through discipline.** The project has no backend, no database, no authentication, no CMS. This is intentional — not a limitation. The stack is:

- **Next.js App Router** for clean routing and persistent layout shell
- **React client components** only where browser state is required
- **Local data** (airports.ts, inline destination arrays) instead of API dependencies
- **No global state** — local `useState` in the components that need it
- **Portal rendering** for modals and dropdowns to escape overflow constraints

The architecture is straightforward. Do not add complexity unless a concrete requirement demands it. See [architecture.md](./architecture.md) for full details.

---

## Design Philosophy

Five principles guide every visual decision:

**1. Dark-first.** The entire site lives on dark backgrounds (sky-deep `#050D1A` → sky-dark `#0A1628`). No light sections. No light mode. The dark palette is the brand.

**2. Gold = action.** Gold (`#D4A853`) signals interactivity, emphasis, and brand identity. Every button, active state, hover glow, and text highlight uses gold. It has meaning — use it sparingly so it retains that meaning.

**3. Depth through blur.** Background elements are blurred. Foreground content is sharp. This layering creates perceived depth without complex 3D techniques.

**4. Motion communicates quality.** Animations are subtle, smooth, and purposeful. They are never distracting. The airplane flies slowly. Clouds drift imperceptibly. Cards lift gently on hover. This restraint is what makes the quality feel real.

**5. Glassmorphism is the surface language.** Cards, panels, and nav backgrounds use backdrop-blur + low-opacity dark background + thin border. This is the visual vocabulary of the entire site. New surfaces should follow this pattern.

See [design-system.md](./design-system.md) for the complete token reference.

---

## Coding Philosophy

- **TypeScript strict mode.** All types explicit. No `any`.
- **Framer Motion for UI.** Page transitions, hover effects, scroll reveals, modal enters/exits.
- **GSAP only for SVG path animation.** The airplane MotionPath is the only use of GSAP.
- **Tailwind utility-first.** Custom tokens defined in `tailwind.config.ts`. No ad-hoc inline styles for static values.
- **Path alias `@/*`.** Always `@/components/...`, never `../../components/...`.
- **No comments unless the WHY is non-obvious.** Well-named identifiers document themselves.
- **No dead code.** Remove unused imports, types, and files when a feature changes.

See [development-guidelines.md](./development-guidelines.md) for the full ruleset.

---

## Component Philosophy

Components are organized by category and responsibility:

| Category | Path | Rule |
|---|---|---|
| Global shell | `src/components/` root + `layout/` | Used in layout.tsx — appear on every page |
| Home sections | `src/components/home/` | Specific to homepage, not reused |
| Primitives | `src/components/ui/` | Pure presentational, no business logic |
| Booking flow | `src/components/booking/` | Stateful flow components |

**Before creating a new component**, check if `GlassCard`, `PageHeader`, or `SectionReveal` already covers the need. Extend with a prop before creating a parallel component.

See [components.md](./components.md) for every component documented with props and behavior.

---

## Documentation Philosophy

The `/docs` folder is a **living knowledge base**, not a one-time artifact. It must stay synchronized with the code. A doc that describes something that no longer exists is worse than no doc.

**Reading order for a new session:**
1. `ai-context.md` ← this file
2. `README.md`
3. `project-overview.md`
4. `architecture.md`
5. `development-guidelines.md`
6. The relevant feature file in `docs/features/`
7. Remaining docs as needed

**Writing order after any change:**
- Update the feature file in `docs/features/`
- Update `changelog.md`
- Update `known-issues.md` if a problem was encountered or resolved
- Update `future-roadmap.md` if a planned item was completed

---

## What Must NEVER Be Changed Without Explicit Instruction

These are not preferences — they are load-bearing decisions for the brand and architecture.

### Visual Identity
- **Dark sky palette** — Do not add light backgrounds to any section
- **Gold as the only accent** — Do not introduce other accent colors
- **Glassmorphism surfaces** — Do not replace with flat or solid backgrounds
- **Premium typography** — Do not change the Inter font or its weight scale

### Hero Section
- **CloudBackground** — Do not remove or simplify the cloud animation
- **AviationTrail** — Do not remove the airplane animation
- **Parallax scroll effect** — Do not remove the scroll-driven depth
- **Headline copy and structure** — Do not change brand copy without approval

### Booking Flow
- **5-step modal structure** — Do not reduce or reorder steps without approval
- **WhatsApp as the exit point** — Do not add payment or checkout without explicit scope
- **Pre-filled message format** — Do not change what data is sent to WhatsApp

### Architecture
- **App Router** — Do not migrate to Pages Router
- **Local airport dataset** — Do not replace with a paid API without explicit decision
- **Portal rendering** for BookingModal and AirportAutocomplete dropdown — Do not remove (would break overflow clipping)
- **No global state** — Do not introduce Redux, Zustand, or Context without a concrete reason

### Component Organization
- **Directory structure** — Do not move components between directories without updating all imports and docs
- **Primitive components** (`GlassCard`, `PageHeader`, `SectionReveal`) — Do not delete; pages depend on them

### Language
- **All UI text must be Portuguese (pt-BR)** — Never introduce English strings in the user interface

---

## When You Are Uncertain

If a task is ambiguous or might touch something in the "never change" list above, **ask before implementing**. It is always better to pause for clarification than to undo a change that broke the brand identity or architecture.

If you encounter a bug or inconsistency not described in [known-issues.md](./known-issues.md), document it there before attempting a fix.

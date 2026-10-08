# Development Guidelines

Rules for all future development on the Alvea Viagens project. Every Claude Code session must read this file before making any changes.

---

## 1. Read Documentation Before Making Changes

**Rule:** Before modifying any code, read the relevant `/docs` files.

- Unfamiliar with a component? Read [components.md](./components.md).
- About to change a color? Read [design-system.md](./design-system.md).
- Adding a new page? Read [pages.md](./pages.md) and [architecture.md](./architecture.md).
- Touching the booking flow? Read [booking-flow.md](./booking-flow.md).

The documentation exists to prevent redundant work and accidental regressions. Use it.

---

## 2. Never Redesign Without Explicit Instruction

**Rule:** Do not redesign, restructure, or visually change any existing section unless the user explicitly asks for it.

- "Fix the mobile nav" → fix the specific issue, don't redesign the navbar
- "Add a new section below the hero" → add the section, don't rearrange existing sections
- "Update the CTA button label" → change the label only, don't change the button style

If you notice something that looks like it *could* be improved, mention it as a suggestion — don't implement it unilaterally.

---

## 3. Preserve the Premium Visual Identity

The dark sky + gold palette, glassmorphism, and subtle animations are the brand. They are not decoration to be simplified.

**Never:**
- Switch to a light background for any section
- Remove backdrop-blur from glass cards
- Replace gold accent colors with generic blues or grays
- Simplify the hero by removing the cloud or airplane animations
- Use flat design patterns that contradict the glassmorphism system

**When in doubt:** More subtle, more premium. Less is more when "less" is still dark, glassy, and gold-accented.

---

## 4. Preserve Component Organization

Components live where they live for a reason. See [architecture.md](./architecture.md).

- Global components → `src/components/` root or `src/components/layout/`
- Homepage-only → `src/components/home/`
- Reusable primitives → `src/components/ui/`
- Booking flow → `src/components/booking/`

Do not create a new top-level component file when a component clearly belongs in a subdirectory. Do not create a new subdirectory without a clear category reason.

---

## 5. Preserve Animations

Animations are core to the user experience. Do not:

- Remove the airplane animation from the hero
- Remove the cloud background from the hero
- Remove scroll-reveal animations from sections
- Remove the page transition in `template.tsx`
- Reduce animation durations to the point where they feel abrupt

You may optimize animations (e.g., `will-change`, reduced-motion media query support), but do not remove them.

**Adding new animations:** Follow the established patterns. Use Framer Motion for UI/scroll animations, GSAP only for SVG path animations. Define new CSS keyframes in `tailwind.config.ts` (for reusable utilities) or `globals.css` (for one-off animations). Do not add inline `style` keyframes.

---

## 6. Preserve Responsiveness

Every change must be tested at:
- Mobile (320px–640px)
- Tablet (640px–1024px)
- Desktop (1024px+)

Use Tailwind's responsive prefixes (`sm:`, `md:`, `lg:`). Do not hardcode pixel widths that break on mobile. Do not add `overflow: hidden` to containers without checking it doesn't clip content on small screens.

---

## 7. Keep Code Clean and Modular

- **One component per file.** No file should export more than one primary component.
- **No inline styles for static values.** If a value is static (not dynamically computed), use a Tailwind class. Reserve `style={}` for dynamic values (e.g., `style={{ width: calculatedWidth + 'px' }}`).
- **No magic numbers.** If a number appears in more than one place, extract it as a constant.
- **No dead code.** If you remove a feature, remove its imports, types, and component files too.
- **No console.log in production code.** Remove all debug logs before considering a change complete. *Existing exception:* `flight-service.ts` and the API route log structured operational events on the server (search parameters, result count, timing, error codes — never secrets or personal data).

---

## 8. Avoid Duplicate Components

Before creating a new component:
1. Check if `GlassCard` can satisfy the need
2. Check if `PageHeader` can be reused
3. Check if `SectionReveal` covers the animation need

If existing primitives need to be slightly extended, add a prop — don't create a parallel component that duplicates the base.

---

## 9. Follow Existing Architecture

- **All pages** use the App Router pattern: `src/app/[route]/page.tsx`
- **All client components** start with `"use client"` directive
- **All images** use `next/image` (`Image` component), never raw `<img>`
- **All internal links** use `next/link` (`Link` component), never `<a href="...">`
- **All imports** use the `@/` path alias (e.g., `import { GlassCard } from '@/components/ui/GlassCard'`)
- **All icons** come from `lucide-react`

### Known deviations in the current code (October 2026 audit)

These exist today. Do not copy them into new code, and do not "fix" them as a side effect of unrelated work — raise them first.

| Rule | Where the code deviates |
|---|---|
| Images via `next/image` | Raw `<img>` for destination photos (`destinos/page.tsx`, `BookingModal.tsx`) and airline logos (`FlightCard`, `SelectedFlightBanner`, `TripSummary`) |
| Internal links via `Link` only | Many CTAs nest a `<motion.button>` inside `<Link>`/`<a>` (invalid interactive nesting) |
| Icons from `lucide-react` | The WhatsApp icon in `Footer.tsx` is an inline SVG |
| No inline styles for static values | Booking components use inline `style` with hardcoded brand colors extensively |
| No dead code | Unused `getCity` (`BookingModal.tsx`), unused parameters in `buildWaMessage` (`TripSummary.tsx`), unused keyframes/tokens |
| Lint must pass | `npx eslint src` currently reports 3 errors |
| Tailwind opacity modifiers | Only values on Tailwind's opacity scale (multiples of 5) generate CSS. About 60 usages such as `text-white/52`, `bg-gold/8`, `border-gold/22` produce nothing. Use a scale value or the arbitrary form (`text-white/[0.52]`). |
| Accessibility baseline (§14) | Modal without dialog semantics or Escape; autocomplete not keyboard-operable; destination cards are clickable `div`s; unassociated form labels |

---

## 10. Keep TypeScript Strongly Typed

- No `any` types. Use proper interfaces or union types.
- All component props must be explicitly typed with an interface.
- All function return types should be inferable (TypeScript can infer most — only add explicit return types when the function is complex or exported).
- Data types must match their schema (e.g., `Airport`, `Destination` interfaces).
- When adding a new data type, add it at the top of the relevant file or in a shared types file.

---

## 11. Never Remove Existing Functionality

**Rule:** Unless explicitly told to remove a feature, keep it.

- The contact form validation should stay as-is when you add a backend handler
- The mock flights in BookingModal were replaced by the real Duffel search in July 2026 — do not reintroduce mock data in the UI
- The airport autocomplete tiers should not be simplified even if they seem redundant

If you are uncertain whether a behavior is intentional or a bug, ask before removing it.

---

## 12. Update Documentation With Every Change

This is mandatory, not optional.

When you make any change to the project, update the relevant `/docs` file(s):

| Type of Change | Documentation to Update |
|---|---|
| New component | `components.md` |
| Modified component behavior | `components.md` |
| New page | `pages.md`, `architecture.md` |
| New animation | `animations.md` |
| New integration | `integrations.md` |
| New design token (color, spacing) | `design-system.md` |
| New asset | `assets.md` |
| New technical decision | `technical-decisions.md` |
| Completed roadmap item | `future-roadmap.md` (mark ✅) |
| Any significant change | `changelog.md` (add entry) |

The goal is that the `/docs` folder always reflects the current state of the codebase. A document that describes a component that no longer exists, or omits a component that does, is worse than no documentation.

---

## 13. Testing Checklist Before Reporting Done

Before telling the user a change is complete:

- [ ] The feature works on desktop (Chrome)
- [ ] The feature works on mobile (simulated 375px)
- [ ] No TypeScript errors (`npm run build` passes)
- [ ] No ESLint errors (`npm run lint` passes)
- [ ] Animations still work (hero, cards, modal)
- [ ] Navbar still works (mobile drawer, scroll state)
- [ ] BookingModal still works end-to-end
- [ ] Documentation updated for the change

---

## 14. Accessibility Requirements

**Rule:** All new interactive elements must meet these baseline accessibility requirements:

### Focus visibility
- Never use `focus:outline-none` alone. Always pair it with a visible alternative: `focus:border-gold/40`, `focus-visible:ring-2`, or similar.
- The global `:focus-visible` rule in `globals.css` provides a gold ring for all elements that don't override it. Do not fight this rule.

### ARIA labels
- Any button or link without visible text (icon-only, close buttons, social icon buttons) **must** have `aria-label`.
- Form `<label>` elements must be present or `aria-label` applied directly to inputs.

### Icon stroke consistency
Follow the stroke width table in [design-system.md](./design-system.md). Do not use `strokeWidth={1.7}` or other arbitrary values — they create subtle visual weight mismatches across the icon set.

### Reduced motion
- Do not add new CSS keyframe animations without adding a suppression rule in the `@media (prefers-reduced-motion: reduce)` block in `globals.css`.
- Looping/decorative animations (shimmer, glows, floats) must be suppressible.

---

## 15. Brazilian Portuguese Content

All user-facing text is in **Portuguese (pt-BR)**. When adding:
- New button labels → Portuguese
- New section titles → Portuguese
- New error messages → Portuguese
- Form placeholders → Portuguese

Never mix English into the UI. If a technical term has no good Portuguese equivalent, use the Portuguese convention for that domain (e.g., "check-in" is commonly used in PT-BR).

---

## 16. Mandatory Pre-Implementation Workflow

Before writing a single line of code for any new feature or change, complete this checklist:

**Step 1 — Read context**
- [ ] Read [ai-context.md](./ai-context.md) — confirm the change does not violate any "never change" rule
- [ ] Read [architecture.md](./architecture.md) — confirm where new code belongs

**Step 2 — Read the relevant feature documentation**
- [ ] Open the corresponding file in `docs/features/` (e.g., `features/booking-modal.md` if touching the modal)
- [ ] If the feature has no docs file yet, create one before implementing

**Step 3 — Understand the existing implementation**
- [ ] Read the source files involved (not just the docs — read the actual code)
- [ ] Check [known-issues.md](./known-issues.md) for any relevant open issues

**Step 4 — Implement**
- [ ] Code the change following all guidelines in this document

**Step 5 — Update documentation (mandatory, not optional)**
- [ ] Update the corresponding feature file in `docs/features/`
- [ ] Add an entry to [changelog.md](./changelog.md)
- [ ] Update [known-issues.md](./known-issues.md) if a problem was encountered or resolved
- [ ] Mark completed items in [future-roadmap.md](./future-roadmap.md) if applicable
- [ ] Update [components.md](./components.md) if component props or behavior changed
- [ ] Update [integrations.md](./integrations.md) if a new integration was added

**A task is NOT complete until both the code and documentation have been updated.**

---

## 16. Contact Information Is Canonical

The WhatsApp number, email, and business hours must be kept synchronized across:
- `src/components/layout/Footer.tsx`
- `src/app/atendimento/page.tsx`
- `src/components/booking/BookingModal.tsx`

If the business contact details change, update all three files at once. A stale phone number in the footer is a conversion-killing bug.

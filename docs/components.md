# Components

Every component in the project is documented here. Organized by category matching the folder structure.

---

## Global Layout Components

### `Navbar.tsx`
**Path:** `src/components/Navbar.tsx`
**Rendered in:** `src/app/layout.tsx` (every page)
**Client component:** Yes (`"use client"`)

**Purpose:** Fixed navigation header that provides primary site navigation and the main CTA.

**State:**
- `scrolled: boolean` — true when `window.scrollY > 24`. Controls glass effect activation.
- `mobileOpen: boolean` — controls mobile drawer open/closed state. Reset on route change.

**Behavior:**
- Starts transparent over the hero. After scrolling 24px, applies the `.glass` utility (blur + gold-tinted bottom border) and `shadow-glass`.
- Below `lg` (1024px — raised from `md` on 2026-10-07, when the sixth link was added), a hamburger button toggles a 300px right-sliding drawer with all nav links and the CTA. Its `aria-label` is always "Abrir menu".
- Active route is detected via `usePathname()` (exact match). Active link gets gold text + a gold dot (mobile) or a gold gradient underline (desktop).

**Navigation Links:**
```
Início        → /
Destinos      → /destinos
Milhas        → /milhas
Grupo de Ofertas → /grupo-de-ofertas   (replaced "Passagens → /passagens" on 2026-10-06; the /passagens page still exists)
Experiências  → /experiencias          (added 2026-10-07)
Atendimento   → /atendimento
```

**CTA Button:** "Falar com Especialista" (phone icon) → `/atendimento`

**Assets used:** `logo-navbar.png` (152×68)

**Dependencies:** `lucide-react` (Menu, X, Phone icons), `next/navigation`, `next/image`, `framer-motion`

---

### `Footer.tsx`
**Path:** `src/components/layout/Footer.tsx`
**Rendered in:** `src/app/layout.tsx` (every page)
**Client component:** No (static)

**Purpose:** Site footer with brand info, quick links, and contact channels.

**Layout (3 columns on desktop, stacked on mobile):**

| Column | Content |
|---|---|
| Left | Logo + tagline + copyright (dynamic year) |
| Center | Quick links: Início, Destinos, Milhas, Grupo de Ofertas, Experiências, Atendimento (same order as the navbar) |
| Right | Email, WhatsApp, hours, social icons |

**Social icons (with hover tooltips):** Instagram, WhatsApp, Email

**Links:** e-mail `mailto:`, WhatsApp `https://wa.me/5516997315748` (phone text and icon, no pre-filled message), Instagram `https://www.instagram.com/alveaviagens/`.

**Assets used:** `logo-footer.png` (rendered 96px high; the file is 2048×2048 and identical to `logo-navbar.png`)

**Styling:** Inline glass effect (`backdrop-filter: blur(20px)`), gold-tinted top border.

---

## Hero & Background Components

### `Hero.tsx`
**Path:** `src/components/Hero.tsx`
**Used in:** `src/app/page.tsx`
**Client component:** Yes (scroll-driven animations)

**Purpose:** The homepage hero section. The primary first impression of the brand.

**Content Sections:**
1. Eyebrow badge: "Experiência Premium em Viagens" (star icons, gold border)
2. H1 headline: "Transformamos milhas em" + gold gradient "experiências inesquecíveis."
3. Decorative divider (gradient lines + gold dot)
4. Subheadline paragraph
5. Single CTA: "Emitir Passagem" (gold fill, ticket icon + arrow), a `next/link` to `/destinos`. Full width on mobile, 460px from `sm`, centred. The former second button "Comprar Milhas" was removed on 2026-10-06.
6. Trust badges strip (4 cards: 50k+ Passagens emitidas, 100% Transações seguras, 4.9/5 Avaliação dos clientes, R$10M+ Milhas economizadas)
7. Scroll indicator ("Rolar" label + pulsing vertical line)

**Animations:**
- Entry: Framer Motion staggered fade-up (0.35s initial delay, 0.11s between children)
- Scroll parallax: `scrollYProgress` drives `useTransform` on the container (down 18%, fading to 0 by 60%) and the title (up 10%)
- Scroll indicator: line scaling/pulsing loop, fades with the hero

**Orbs (ambient glow, pointer-events: none):**
- Left: 600px `bg-sky-bright/18`
- Right: 480px `bg-gold/8`
- Bottom-left: 650px `bg-sky-horizon/12`

> These three opacity values (`/18`, `/8`, `/12`) are not in Tailwind 3's opacity scale, so the classes generate no CSS and the orbs are not painted. The same applies to other non-multiple-of-5 opacity modifiers across the site — see [project-state-audit-2026-10.md](./project-state-audit-2026-10.md) §4.1.

**Dependencies:** `framer-motion`, `lucide-react` (Ticket, Star, ShieldCheck, TrendingUp, ArrowRight, Coins)

---

### `CloudBackground.tsx`
**Path:** `src/components/CloudBackground.tsx`
**Used in:** `src/app/page.tsx` (hero section)
**Client component:** Yes (`"use client"` — uses `useScroll`/`useTransform` for parallax)

**Purpose:** Photorealistic cloud backdrop for the hero section using stacked, heavily-blurred `div` elements.

**Technique:** Dozens of absolutely-positioned `div` elements with enormous `border-radius` and extreme `filter: blur()` values are layered to simulate volumetric clouds. Colors range from pure white (sunlit tops) to blue-gray (shadow undersides) to haze tones (atmospheric depth).

**Layer Zones:**
| Zone | Vertical position | Role |
|---|---|---|
| Cirrus | 10–22% | High-altitude thin wisps |
| Left formation | 14–35% | Main cloud body (left) |
| Right formation | 12–34% | Main cloud body (right) |
| Center-right | 19–36% | Mid-distance depth |
| Lower shadows | 44–48% | Base shadow under main clouds |
| Atmospheric haze | 54–68% | Horizon softness |

**Blob properties:**
- Width: 260–1400px
- Height: 88–250px
- Blur: 28–178px
- Opacity: 0.01–0.12 (very subtle — cumulative effect creates density)
- Animation: `float-a` to `float-d` (7–11s subtle drift)

**Additional layers:**
- Photographic sky gradient (180deg, dark blue top → lighter horizon)
- Directional sunlight scatter (upper-right, cold blue-white)
- Horizon warm glow (bottom 32%)
- Subtle gold warmth (animated left-center pulse)
- **Star field:** 45 stars, top 38% of viewport, `star-twinkle` animation

**Parallax:** Two layers (far 0–22%, near 0–40%) scroll at different rates and fade out at 72% scroll depth. Implemented via `useTransform` on `useScroll`.

**Dependencies:** `framer-motion`

---

### `AviationTrail.tsx`
**Path:** `src/components/AviationTrail.tsx`
**Used in:** `src/app/page.tsx` (hero section, absolute positioned)
**Client component:** Yes (GSAP)

**Purpose:** An SVG airplane that flies along a curved Bézier path across the hero section.

**SVG Airplane Anatomy:**
- Fuselage: White ellipse with a cone nose
- Wings: Top and bottom polygons with gold edge highlights
- Tail: Vertical and horizontal fins
- Engines: Two gold glow circles
- Halo: Two concentric circles (22px / 14px radius)

**Animation (GSAP MotionPath):**
- Duration: 22 seconds per pass
- Path: Cubic Bézier curve across the full 1920px canvas width
- Repeat: Infinite with 2s delay between cycles
- Auto-rotate: The plane smoothly rotates to follow the path tangent
- Opacity: Fades in over 1.5s at the start of each cycle

**SVG Filters & Gradients (via `<defs>`):**
| ID | Type | Effect |
|---|---|---|
| `plane-glow` | feGaussianBlur | Soft glow around plane |
| `trail-gradient` | linearGradient | transparent → gold → white along path |
| `path-glow` | feGaussianBlur | Blur on the dashed trail |
| `path-fade` | linearGradient mask | Fades trail at start and end (0–8%, 92–100%) |

**Trail Elements:**
- Glow path: `rgba(212,168,83,0.15)`, 4px stroke, blurred
- Dashed path: `rgba(212,168,83,0.22)`, 1.5px, 10px dashes with 4px gaps

**Container:** `position: absolute`, 260px height, full width, `z-index: 10` (above clouds, below hero text).

**Dependencies:** `gsap`, `gsap/MotionPathPlugin`

---

### `LogoHeroBanner.tsx`
**Path:** `src/components/LogoHeroBanner.tsx`
**Used in:** `src/app/page.tsx` ("Quem Somos" section, right column)
**Client component:** Yes (`"use client"`, although it has no state or animation)

**Purpose:** Displays the brand logo image with premium atmospheric framing.

**Visual Layers (stacked via absolute positioning):**
1. Brand image: `logo.png` via `next/image` (`width={600} height={660}`, `priority`, `w-full h-auto`); the source file is 1024×1536
2. Atmospheric tint overlay: semi-transparent dark gradient over the top 60%
3. Bottom vignette: dark fade on the bottom 25%
4. Premium inner border: `box-shadow: inset 0 0 0 1px rgba(212,168,83,0.12)`
5. Outer frame: Large outer shadow (0 32px 80px) + 1px white/5 border

**Dependencies:** `next/image`

---

## Home Section Components

### `home/Benefits.tsx`
**Path:** `src/components/home/Benefits.tsx`
**Used in:** `src/app/page.tsx`
**Client component:** Yes (`"use client"`)

**Purpose:** "Por que escolher a Alvea?" section with 4 benefit cards. Eyebrow: "Nossos Diferenciais".

**Benefits:**
| Icon | Title | Summary |
|---|---|---|
| Award | Especialistas em Milhas | Deep expertise in miles programs |
| TrendingUp | Melhor Custo-Benefício | Save up to 70% vs retail |
| Users | Atendimento Humanizado | Personal specialist, not a chatbot |
| ShieldCheck | 100% Seguro e Garantido | Verified and guaranteed emissions |

**Animation:** Its own `useInView` (once, `-80px` margin) drives a Framer Motion variant stagger (`staggerChildren: 0.12`, each card fades up over 0.7s). It does not use `SectionReveal`.

**Layout:** `grid-cols-1 md:grid-cols-2` (2×2 on desktop), each card a `GlassCard` with icon left and text right.

**Dependencies:** `lucide-react`, `framer-motion`, `GlassCard`

---

### `home/ScrollPlane.tsx`
**Path:** `src/components/home/ScrollPlane.tsx`
**Used in:** `src/app/page.tsx` — wraps `<Benefits />`
**Client component:** Yes (`"use client"`); the homepage itself stays a Server Component and passes `Benefits` in as `children`

**Purpose:** Scroll-driven airplane that crosses the viewport diagonally, in front of the content, while the user scrolls from the Hero through the Benefits section. Reverses when scrolling back. Decorative only.

**Props:**
```typescript
interface Props {
  children: React.ReactNode   // the section whose scroll progress drives the flight
}
```

**Structure:**
- A `relative` wrapper `div` (the `useScroll` target) containing `children` unchanged.
- A `fixed inset-0 z-30 overflow-hidden pointer-events-none` layer with `aria-hidden="true"`, portalled to `document.body` after mount, containing the plane (`next/image`, `alt=""`) and two thin contrail gradients.

**Behavior:**
- `useScroll({ target, offset: ['start 0.85', 'end 0.15'] })` → `useTransform` for `x`, `y`, `rotate`, `scale`, `opacity`. No timers or manual listeners.
- Image width `clamp(240px, 60vw, 820px)` (visible aircraft ≈ 82% of that, ~670px max); travel in `vw` on both axes.
- `useReducedMotion()` → static, smaller, half-opacity plane that only fades.
- Adds no page height; never produces horizontal overflow; sits below the navbar and its drawer.

**Asset:** `public/images/plane-scroll.png` (realistic top-view airliner supplied by the project owner, 1672×941, transparent background, displayed without any filter or shadow). To swap the artwork, replace that file and adjust `width`/`height` in `PlaneImage` if the aspect ratio changes; the image must point to the right.

**Dependencies:** `framer-motion`, `next/image`, `react-dom` (`createPortal`)

Full animation details: [animations.md](./animations.md) — "Scroll-Driven Airplane Fly-Over".

---

### `home/HomeCTA.tsx`
**Path:** `src/components/home/HomeCTA.tsx`
**Used in:** `src/app/page.tsx`
**Client component:** Yes (`"use client"`)

**Purpose:** Bottom-of-homepage call-to-action section with two buttons.

**Content:**
- Eyebrow: "Comece Agora" (decorative lines left and right)
- H2: "Pronto para decolar?"
- Subtitle paragraph
- Button 1 (gold): "Emitir Passagem" → `/destinos`
- Button 2 (glass): "Falar com Especialista" → `/atendimento`

**Background:** Dark `sky-gradient` with radial gold glow overlay (`bg-[radial-gradient(ellipse_...)]`).

---

## UI Primitive Components

### `ui/GlassCard.tsx`
**Path:** `src/components/ui/GlassCard.tsx`

**Purpose:** Reusable glassmorphism card container. Used throughout the site as the base for benefit cards, service cards, stat cards, etc.

**Props:**
```typescript
interface Props {
  children: React.ReactNode
  className?: string
  hover?: boolean    // default: true — enables hover lift animation
  onClick?: () => void
}
```

**Base Styles:**
- `border border-white/10`
- `bg-white/[0.04]`
- `backdrop-blur-sm`
- `rounded-2xl`

**Hover Animation (Framer Motion, spring physics):**
- Scale: `1.025`
- Y translate: `-5px`
- Border color: `rgba(212,168,83,0.3)` (gold tint appears on hover)
- Spring: `stiffness: 300, damping: 22`

Set `hover={false}` to disable the hover effect (e.g., for info-only cards that shouldn't feel clickable).

---

### `ui/PageHeader.tsx`
**Path:** `src/components/ui/PageHeader.tsx`

**Purpose:** Standardized page hero header. Used at the top of every inner page (`/destinos`, `/milhas`, `/passagens`, `/atendimento`).

**Props:**
```typescript
interface Props {
  tag: string              // Small badge text (e.g., "Destinos Internacionais")
  title: React.ReactNode   // Accepts JSX for gradient spans
  subtitle: string
}
```

**Layout:** Centered, `max-w-3xl`, with vertical padding.

**Tag badge:** Gold background, star icons left and right, uppercase tracking.

**Title:** `text-[58px] font-black` on desktop, scales down on mobile. Accepts `<span>` children with gradient classes for highlighted words.

**Subtitle:** `text-[17px] font-light text-white/52`

---

### `ui/SectionReveal.tsx`
**Path:** `src/components/ui/SectionReveal.tsx`

**Purpose:** Scroll-triggered entrance animation wrapper. Wraps any content to make it fade-up when scrolled into view.

**Props:**
```typescript
interface Props {
  children: React.ReactNode
  className?: string
  delay?: number    // Framer Motion delay in seconds (default: 0)
  once?: boolean    // Only animate once (default: true)
}
```

**Animation:**
- Trigger: When element is 80px above the viewport bottom
- Initial state: `opacity: 0, y: 30px`
- Animated state: `opacity: 1, y: 0`
- Duration: 0.75s
- Ease: `[0.22, 1, 0.36, 1]` (fast start, ease-out — snappy but smooth)

**Usage pattern:**
```tsx
<SectionReveal delay={0.2}>
  <GlassCard>...</GlassCard>
</SectionReveal>
```

---

## Miles Page Components

All under `src/components/milhas/`, used only by `src/app/milhas/page.tsx`. All are client components.

### `milhas/MilesModal.tsx`

**Purpose:** Shared shell for both questionnaires. Owns everything that is not form content.

**Props:** `titleId`, `title`, `subtitle`, `stepLabels: string[]`, `step` (zero-based), `direction` (1 / -1), `size?: 'md' | 'lg'` (600 / 720px), `onClose`, `footer`, `children` (content of the current step).

**Behavior:**
- Portal to `document.body`, `z-[9999]`, blurred navy backdrop; clicking the backdrop closes.
- `role="dialog"`, `aria-modal="true"`, `aria-labelledby`; close button with `aria-label="Fechar"`.
- **Esc closes**; **Tab is trapped** inside the dialog; focus moves into the dialog on open and **returns to the trigger** on close; body scroll is locked while open.
- Header with "Etapa N de M · label" (`aria-live`) and a segmented progress bar (`role="progressbar"`).
- Step content scrolls inside the panel and resets to the top on each step.
- Also exports the footer buttons: `BackButton`, `ContinueButton`, and `WhatsAppButton` (a real `<a target="_blank">`, so no pop-up blocker is involved).

**Dependencies:** `framer-motion`, `lucide-react`, `react-dom`

### `milhas/FormFields.tsx`

**Purpose:** Form primitives for the questionnaires.

- `TextField` — labelled input or textarea (`multiline`), 50px minimum height, `aria-invalid` + `aria-describedby` when it has an error, "(opcional)" marker.
- `ChoiceGroup` — `<fieldset>`/`<legend>` with one real `<input type="radio">` or `<input type="checkbox">` (`multiple`) per option, visually replaced by a card with a **square check box on the left for both kinds** (a deliberate design choice; the underlying input keeps the correct semantics). Props: `name`, `legend`, `options`, `value`, `onChange`, `multiple?`, `required?` (shows an "Obrigatória" tag), `error?`.
  - Grid: `grid-cols-1 sm:grid-cols-2` with `auto-rows-fr`, so every card of a group has the same width and the height of the tallest one (min 58px); check box and text start at the same offsets in every card; an odd last option keeps a single cell.
  - Multiple-choice groups show "Você pode selecionar mais de uma opção."
  - Selection is shown by the check mark, gold border, tinted background, and a very soft glow; keyboard focus shows a gold ring. Used only by the Gestão questionnaire.
- Errors render under the field in gold with `role="alert"`.

### `milhas/SellMilesModal.tsx`

**Purpose:** "Venda de Milhas" questionnaire — 3 steps (Seus dados → Suas milhas → Revisão e envio). Collects only Nome, WhatsApp, Companhia/programa, and Quantidade. Holds answers and per-step validation in local state; the last step shows a summary and the `WhatsAppButton` "Enviar para a Alvea".

### `milhas/ProgramCombobox.tsx`

**Purpose:** Searchable single-select for the airline/programme in the sale questionnaire (used only there).

**Props:** `id`, `label`, `placeholder`, `options: string[]`, `otherOption: string`, `value`, `onChange`, `error?`.

**Behavior:**
- A trigger button shows the current choice; opening it reveals a search box and a list **inline** under the trigger (max 240px, own scroll), so nothing is clipped by the modal and it works well on mobile.
- Search is case- and accent-insensitive ("contains"). `otherOption` is always listed last, whatever is typed, and a hint appears when it is the only result.
- Keyboard: ↑/↓ move, Enter selects, Tab closes, **Esc closes only the list** (not the modal). Focus goes to the search box on open and back to the trigger on select.
- ARIA: trigger `aria-haspopup="listbox"` / `aria-expanded`; search `role="combobox"` with `aria-activedescendant`; list `role="listbox"` with `role="option"` items; the selected item also shows a check mark.
- Opens with a quick fade + `0.98→1` scale (`0.18s`); fade only under reduced motion.

### `milhas/ManagementModal.tsx`

**Purpose:** "Gestão de Milhas" — 7 steps: explanation of the service, "Seus dados" (Nome, E-mail, Telefone), the official 17 questions in four steps, and "Revisão e envio", ending in the `WhatsAppButton` "Enviar para a Alvea". States no prices, percentages, or guaranteed results.

- Renders the questions from `QUESTIONS` / `QUESTION_STEPS` (`src/lib/milhas/management-questionnaire.ts`) — no question text is written in the component.
- State: `contact`, `answers` (`Record<questionId, string | string[]>`), `errors`, `step`, `direction`. Answers survive moving back and forth; nothing is persisted.
- Validation per step on "Continuar"; on failure the first message is scrolled into view.
- Multiple answers are stored in the official option order; an `exclusive` option ("Não" in question 2) cannot be combined with the others.
- Review step: `ReviewSection` (with "Editar" → jumps to that step) and `ReviewRow` (unanswered optional questions show "Não respondida").
- `StepHeading` animates the step title, then its description.

### `lib/milhas/management-questionnaire.ts`
**Path:** `src/lib/milhas/management-questionnaire.ts`

The official questionnaire as data: `QUESTIONS` (17 entries: `id`, `number`, `text`, `short`, `type` `single | multiple | text`, `options`, `required`, `exclusive`, `placeholder`), `QUESTION_STEPS` (which question numbers belong to each form step), `questionsBetween()`, `isAnswered()`, and the `Answers` type. **Wording is Alvea's official text — do not edit it for style or spelling.**

### `lib/milhas/whatsapp-messages.ts`
**Path:** `src/lib/milhas/whatsapp-messages.ts`

Pure functions, no React:
- `buildSellMilesMessage(answers)` — sale message (Nome, WhatsApp, Companhia/Programa, Quantidade).
- `buildManagementMessage(contact, answers)` — iterates `QUESTIONS`, so the message always mirrors the questionnaire: "MEUS DADOS" (Nome, E-mail, Telefone) then "MEU PERFIL" with one "N. short label" block per answered question; multiple answers as bullets.
- Blank answers produce an empty string, which is how unanswered fields disappear from both messages.
- `formatMiles` (`"100000"` → `"100.000"`), `formatPhone` (`"16999998888"` → `"(16) 99999-8888"`), `isValidPhone` (10–11 digits), `isValidEmail`, `digitsOnly`.

Related: `WHATSAPP_NUMBER` and `buildWhatsAppUrl()` in `src/lib/config/links.ts`; two emoji added to `src/lib/utils/wa-emojis.ts` (`person`, `phone`) — existing entries untouched.

---

## Offers Group Components

### `grupo-ofertas/OffersGroupContent.tsx`
**Path:** `src/components/grupo-ofertas/OffersGroupContent.tsx`
**Used in:** `src/app/grupo-de-ofertas/page.tsx`
**Client component:** Yes (`"use client"`)

**Purpose:** Entire UI of the `/grupo-de-ofertas` landing page.

**Props:**
```typescript
{ hasVideo: boolean }   // true when public/videos/grupo-ofertas.mp4 exists (checked on the server)
```

**Internal pieces (same file):**

| Name | Purpose |
|---|---|
| `GroupCTA` | "Entrar no Grupo de Ofertas" button. `<a target="_blank">` when `WHATSAPP_GROUP_URL` is a real link; inert `<button aria-disabled>` otherwise |
| `Eyebrow` | Gold pill badge used above the H1 and section headings |
| `VideoShowcase` | Vertical 9:16 glass frame (360 / 320 / 338px wide) with a discreet gold glow; renders the `<video>` or the placeholder. Owns the custom fullscreen: a corner button calls `requestFullscreen()` on the 9:16 container, `fullscreenchange` drives an `isFullscreen` state, and in that state the video is sized to the largest centred 9:16 box that fits the screen |

**Reused:** `GlassCard` (step and benefit cards), global utilities `.btn-shimmer`, `.cta-glow`, `.text-gold-gradient`, and the standard ease `[0.22, 1, 0.36, 1]`. `PageHeader` and `SectionReveal` are not used because the hero is a two-column composition with a staged sequence and every animation here honours reduced motion.

**Accessibility:** one `h1`, `h2` per section, `h3` per card; sections labelled with `aria-labelledby`; steps are an `<ol>`, benefits a `<ul>`; decorative icons and orbs are `aria-hidden`; the external link announces that it opens in a new tab; the video has native controls and an `aria-label`. Only opacity values on Tailwind's scale are used.

**Dependencies:** `framer-motion`, `lucide-react` (Plane, Coins, BellRing, Handshake, MessageCircle, ArrowRight, Play), `GlassCard`, `@/lib/config/links`

### `lib/config/links.ts`
**Path:** `src/lib/config/links.ts`

Central place for the offers-group links: `WHATSAPP_GROUP_URL` (the official invite link, `https://chat.whatsapp.com/BzUhRCfOMebDQ95Uzk22j6` — change the group here only), `isWhatsAppGroupConfigured`, `OFFERS_GROUP_VIDEO_SRC`, `OFFERS_GROUP_VIDEO_FILE`. The booking/contact WhatsApp number is still hardcoded in its original files and was not moved here.

---

## Experiences Components (ALVEA JOURNEY)

All in `src/components/experiencias/`, all client components, used only by `/experiencias`. Content and asset paths come from `src/data/experiencias.ts`; the components hold layout and motion only.

### `experiencias/scene.tsx`
Shared building blocks.

| Export | Purpose |
|---|---|
| `useScene()` | Returns `{ ref, progress }`: `useScroll` on the section with offset `['start start', 'end end']`, so `progress` runs 0 → 1 while the stage is pinned |
| `useFx(progress, input, output, reduced, still)` | `useTransform` for *movement* (translate, scale, rotate, blur). Returns the fixed `still` value when reduced motion is on |
| `useAppear(progress, [in0, in1, out0, out1], reduced, distance?)` | Opacity in/out plus a small rise; the rise is dropped under reduced motion |
| `Scene` | The `<section>` (height = `screens × 100svh`, pulled up by one viewport so sections overlap, `z-index` descending by chapter) and its `sticky top-0 h-[100svh] overflow-hidden` stage, which is set to `visibility: hidden` at progress 1 so the next stage — already pinned underneath — shows without a seam. Takes the scene `progress` |
| `Kicker` | Chapter number + label line ("02 — EMBARQUE") |
| `StarField` / `makeStars` | Deterministic star positions (seeded, identical on server and client) |
| `NAVY` | Base background colour of the journey |

### `experiencias/atmosphere.tsx`
`CloudDeck` — a still cloud layer seen from above, made only of radial gradients (no blur, no image); `dense` closes its centre. `DECK_HANDOFF` holds the opacity and scale both the take-off (last frame) and the map (first frame) use, which is what makes that cut invisible.

### Scenes

| File | Chapter | Notes |
|---|---|---|
| `JourneyExperience.tsx` | — | Composes the ten scenes inside `<main>` (no `overflow`, so `sticky` works) and feeds whole-page progress to `JourneyProgress` |
| `JourneyHero.tsx` | 01 | The page `h1`; star field; scroll cue |
| `AirportScene.tsx` | 02 | Departures board (`DEPARTURES`) with a slight 3D tilt; two rails of guide lights whose angle is set by `--rail` (30° / 46° / 63° at base / `sm` / `lg`) |
| `TakeoffScene.tsx` | 03 | A ground layer three screens wide (finite runway, threshold markings, seeded city lights as box-shadows) that shrinks and slides back on climb; aircraft (`plane-scroll.png` rotated to fly up the screen) with two cross-faded shadows; cloud veil over the aircraft, then `CloudDeck` below it; sky and sun layers |
| `WorldMapScene.tsx` | 04 | Opens on `CloudDeck`. `world-dots.svg` (edges masked out) plus an SVG overlay in the same coordinates; each route is two strokes (halo + line); city markers with a scroll-linked pulse ring; the aircraft flies the Paris arc and that route is drawn by its progress; scale pushes in on Paris at the end |
| `DestinationsScene.tsx` | 05 | `JOURNEY_DESTINATIONS`; one full-bleed `next/image` per destination with its `grade` overlay and `accent`; the stage is clipped to an aircraft-window shape that opens (`clip-path` from the CSS variable `--o`; `--ix`, `--iy`, `--ir` set per breakpoint); counter "01 / 05" |
| `BeyondSkyScene.tsx` | 06 | Sky layer and one sea layer whose top edge is the horizon, raised by the scroll; exports `OCEAN` (the colour both this scene ends on and the cruise starts on) |
| `CruiseScene.tsx` | 07 | A "sea stage" laid out along the ship course (rotated −90° below `lg`); water layers moved by `transform`; `ship.webp` with a hull shadow and an SVG `Wake` (static, `feTurbulence` + displacement); `CRUISE_REGIONS`; `CRUISE_ROUTE` with an on-screen "rota ilustrativa" note |
| `ProcessScene.tsx` | 08 | The two-line statement in one `h2` (second line gold; the first dims when it arrives), then `PROCESS_STEPS` on a dashed route (horizontal from `lg`, vertical below). Right padding from `lg` keeps the last step clear of the progress label |
| `MilesScene.tsx` | 09 | `VALUE_CHAIN` as one rolling word in a clipped window, the last one in gold and scaled up to fly through; a five-stop route underneath; an `sr-only` sentence carries the sequence for assistive technology |
| `JourneyFinale.tsx` | 10 | Headline, the two CTAs, logo, planet horizon |
| `JourneyProgress.tsx` | — | Rendered through a portal on `<body>` (the page-transition wrapper keeps a `filter`, which would break `position: fixed`). Desktop: ten `<button>` dots with `aria-label` and `aria-current="step"`; mobile: a 2px line. Fades out before the footer |

### Sound

| File | Purpose |
|---|---|
| `experiencias/JourneySound.tsx` | The sound control (portal on `<body>`): invitation that shrinks to a round button, `aria-pressed`, live region. Builds the engine inside the first click, feeds it from the journey scroll progress, disposes of it on unmount |
| `lib/experiencias/sound-score.ts` | Per-chapter levels of each sound bed, the cue list, `locate()`, `mixAt()`, `cuesBetween()`, `scoreSeams()` |
| `lib/experiencias/sound-engine.ts` | `JourneySoundEngine` — Web Audio mixer: ten synthesised environments in near/mid/far layers, two generated reverbs, a global open/enclosed filter and presence level, randomly scheduled live events, cues, optional recordings, limiter, `dispose()` |
| `data/experiencias-audio.ts` | `SOUND_FILES` — recordings that replace synthesised beds (empty) |

Details: `docs/experiencias-sound.md`.

### `data/experiencias.ts`
**Path:** `src/data/experiencias.ts`

`CHAPTERS` (id, number, label, `screens`), `JOURNEY_ASSETS`, `DEPARTURES`, map data (`MAP_WIDTH`, `MAP_HEIGHT`, `project()`, cities, routes), `JOURNEY_DESTINATIONS`, `CRUISE_REGIONS`, `CRUISE_ROUTE`, `PROCESS_STEPS`, `VALUE_CHAIN`, `SPECIALIST_MESSAGE`, and `pinned()` (scroll length a chapter is pinned for). Each destination also carries `grade` and `accent`. To change copy, order, scroll length, or an image, edit this file only.

### Assets

| Path | What | Source |
|---|---|---|
| `public/images/experiencias/destinations/{paris,punta-cana,toquio,dubai,nova-york}.webp` | 1920×1200 destination photos (143–484 KB) | The Unsplash photos already used on `/destinos`, stored locally |
| `public/images/experiencias/cruise/ship.webp` | 1696×263 top-down ship, transparent (70 KB) | AI-generated image (Canva) |
| `public/images/experiencias/world/world-dots.svg` | Dotted world map, viewBox 1000×394.4 (188 KB) | Generated from Natural Earth (public domain) |
| `public/images/plane-scroll.png` | Aircraft | Existing asset, shared with the Home page |

---

## Booking Components

### `booking/BookingModal.tsx`
**Path:** `src/components/booking/BookingModal.tsx`

**Purpose:** The primary conversion component. Orchestrates a two-phase flight search flow (outbound selection → return selection → trip summary) and exits to WhatsApp with a complete dual-flight pre-filled message.

**Props:**
```typescript
interface BookingModalProps {
  destination: DestinationForModal   // { name, country, photo, miles, color, iataCode }
  onClose: () => void
}
```

**State:**
```typescript
BookingState     // originAirport, departureDate, returnDate, passengers, flightClass
flightPhase      // 'outbound' | 'return' | 'summary' | null
selectedOffer    // FlightOffer | null  — chosen outbound
matchedOffer     // FlightOffer | null  — final (outbound+return) offer with total price
filters          // FilterState — from FlightFilters; reset on phase transition
```

**activeKey (drives AnimatePresence):** `searching | flightPhase | step${step}`

**Step / Phase Flow:**

| activeKey | Content |
|---|---|
| `step1–5` | Form steps (origin, dates, pax, class) |
| `searching` | Spinner + 3 SkeletonCards |
| `outbound` | FlightFilters bar · FlightCard list · "Selecionar voo de ida →" |
| `return` | SelectedFlightBanner · FlightFilters · FlightCard list · "Selecionar voo de volta →" |
| `summary` | TripSummary (both slices + total price + WhatsApp CTA) |

**Module-level helper functions:**
```typescript
buildOutboundKey(offer)             // "LA|LA8100|2025-12-15T08:15|2025-12-15T14:30"
buildReturnKey(slice)               // same pattern for return
getUniqueOutboundOffers(all)        // 1 per unique outbound, cheapest price
getReturnOffersFor(all, selected)   // all return options for selected outbound
applyFilters(list, filters, ret?)   // stops + departure period filter, then sort
extractIata(label)                  // "São Paulo (GRU)" → "GRU"
```

`getCity()` is also defined at module level but is unused (ESLint error).

**useMemo derivatives:**
- `uniqueOutbound` — unique outbound offers from the raw API list
- `returnOffers` — return offers paired with `selectedOffer`
- `filteredOutbound / filteredReturn` — after applying `filters`

**Search request:** `POST /api/flights/search` with `{ origin, destination, departureDate, returnDate, adults, children?, cabinClass }`. Passenger options map to `1 → 1 adult`, `2 → 2 adults`, `familia → 2 adults + 2 children`, `grupo → 6 adults`. Infants are never sent.

**Known defects (October 2026 audit):**
- On failure the modal reads `data.message`, but the API returns `{ error, code }`, so the specific Portuguese message is never shown — the user always sees "Erro ao buscar voos. Tente novamente."
- The API answers "no results" with HTTP 404, which lands in the error branch. The empty state ("Nenhum voo disponível" + "Falar com especialista" WhatsApp button) is therefore unreachable.
- No `role="dialog"`, focus trap, or Escape-to-close.

**Sub-components (inline):**

| Name | Purpose |
|---|---|
| `StepShell` | Header row (icon + title + step counter) for form steps |
| `OptionBtn` | Selectable button used in steps 4 and 5 |
| `SkeletonCard` | Shimmer placeholder during search loading |

**External sub-components:**
- `FlightCard` — reusable card for outbound and return lists
- `FlightFilters` — filter/sort bar; provides `FilterState`, `DEFAULT_FILTERS`
- `SelectedFlightBanner` — compact outbound recap during return phase
- `TripSummary` — final summary + WhatsApp CTA

**Caching:**
- `searchInProgress: useRef<boolean>` — prevents concurrent submits
- `lastSearchKey: useRef<string>` — `"GRU|MCO|2025-12-15|2025-12-22|2|economy"`
- `cachedOffers: useRef<FlightOffer[]>` — same search params → instant result

**Portal:** `ReactDOM.createPortal` to `document.body`. Z-index 9999.

**Body scroll lock:** `document.body.style.overflow = 'hidden'` while open.

**Animation:** Direction-aware slide. `AnimatePresence mode="wait"` with `custom` direction prop. Stagger on flight cards capped at `Math.min(index * 0.08, 0.48)` (6 cards max).

**Progress bar:** 5-segment bar. Only visible when `flightPhase === null`.

---

### `booking/FlightCard.tsx`
**Path:** `src/components/booking/FlightCard.tsx`

**Purpose:** Reusable flight card used for both outbound and return lists. Accepts flat flight-info props (no FlightOffer coupling) and an `onSelect` callback.

**Props:** `airline`, `airlineCode`, `airlineLogo`, `flightNumber`, `origin`, `destination`, `departureTime`, `arrivalTime`, `departureDate`, `arrivalDate`, `duration` (raw ISO), `stops`, `price`, `currency`, `priceSectionTitle?`, `priceLabel?`, `priceCaption?`, `cabinLabel?`, `ctaLabel`, `onSelect`, `index` (for stagger animation).

**Price section props:**

| Prop | Default | Usage |
|---|---|---|
| `priceSectionTitle?` | none | Header above `priceLabel` (e.g. "VIAGEM COMPLETA") |
| `priceLabel?` | `"A partir de"` | Larger label directly above the price number |
| `priceCaption?` | `"Preço total da viagem · sujeito à disponibilidade"` | Small muted line below price |

**Outbound calls** (Step 1): `priceSectionTitle="Viagem completa"` · `priceLabel="A partir de"` · `priceCaption="Valor total de ida e volta"`
**Return calls** (Step 2): `priceSectionTitle="Itinerário selecionado"` · `priceLabel="Valor total da viagem"` · `priceCaption="Valor total de ida e volta"`

**Key behaviours:**
- Animated plane icon in the flight path floats with `y: [0, -2.5, 0]` loop
- Stagger delay: `Math.min(index * 0.08, 0.48)` — capped so > 6 results don't delay more than 480ms
- Calls `formatDuration()` for ISO 8601 duration display (`PT2H15M` → `2h 15min`, `P1DT6H15M` → `1d 6h 15min`)
- Price is `Intl.NumberFormat('pt-BR')` of `Math.floor(price)` (cents truncated), prefixed by `R$` when the currency is `BRL`, otherwise by the currency code (currently `USD`)
- City names under the IATA codes come from `airports.ts`; blank when the code is not in the dataset
- Airline logo is a raw `<img>` from Duffel's `logo_symbol_url`, with the airline code as fallback
- `cabinLabel` is passed only for outbound cards
- Baggage is not shown (not present in the data)

---

### `booking/FlightFilters.tsx`
**Path:** `src/components/booking/FlightFilters.tsx`

**Purpose:** Compact filter + sort bar rendered above the outbound and return lists. Exports shared types used throughout the booking flow.

**Exports:**
```typescript
type Period = 'morning' | 'afternoon' | 'evening' | 'night'
type SortKey = 'price' | 'duration' | 'earliest' | 'latest'
interface FilterState { stops: number[]; period: Period[]; sort: SortKey }
const DEFAULT_FILTERS: FilterState
```

**Filter rows:**
1. Sort: 4 pills (Preço · Duração · Mais cedo · Mais tarde) — single select
2. Escalas: 3 pills (Direto · 1 parada · 2+) — multi toggle
3. Partida: 4 period pills (Madrugada · Manhã · Tarde · Noite) — multi toggle, chronological order (hour < 6, < 12, < 18, else)

A result counter ("N voos") is shown at the end of the sort row. There is **no airline filter** — it was removed on 2026-07-16 and no related code remains. The rows use a `scrollbar-hide` class that is not defined anywhere (no effect).

---

### `booking/SelectedFlightBanner.tsx`
**Path:** `src/components/booking/SelectedFlightBanner.tsx`

**Purpose:** Compact green-tinted banner displayed at the top of the return list, confirming the selected outbound flight. Includes an "Alterar" button that navigates back to the outbound list.

**Props:** `offer: FlightOffer`, `onClear: () => void`

**Displays:** Airline logo/code, airline name, flight number, departure time → arrival time, duration, stops badge.

---

### `booking/TripSummary.tsx`
**Path:** `src/components/booking/TripSummary.tsx`

**Purpose:** Final trip summary. Renders two `SliceRow` sections (outbound + return), a total price box with optional breakdown, fare condition badges, and the WhatsApp CTA.

**Props:** `offer: FlightOffer` (the matched offer with both slices + total price + breakdown + conditions), `paxLabel`, `classLabel`, `originAirport`, `destinationName`.

**`SliceRow`** (internal sub-component): Renders airline logo, times, flight path, dates, IATA codes, duration + stops badge for a single `FlightSlice`.

**Price section:**
- Header: "Valor total da viagem"
- Price number (`offer.price`)
- Price breakdown (Preço base + Taxas + Total) — shown only when `offer.taxAmount != null`
- Always-visible "Inclui" checklist: ✓ Ida · ✓ Volta · ✓ Taxas da companhia

**Fare conditions badges** (rendered only when at least one field is non-null):
- `changeAllowed === true` → emerald "Alteração permitida" (or "Alteração · {currSym} {penalty}" when `changePenalty` is set)
- `changeAllowed === false` → muted "Sem alteração"
- `refundAllowed === true` → emerald "Reembolsável"
- `refundAllowed === false` → muted "Não reembolsável"

**`buildWaMessage()`**: Builds the complete WhatsApp message with four sections:
- `RESUMO DA PESQUISA` (search context)
- `VOO DE IDA SELECIONADO` (outbound flight details)
- `VOO DE VOLTA SELECIONADO` (return flight details)
- `VALOR DA VIAGEM` — price breakdown when available, ✓ inclui checklist (Ida, Volta, Classe, Passageiros, Cia. aérea), fare condition line when available

Imports EMOJI from `src/lib/utils/wa-emojis.ts`. Uses `api.whatsapp.com/send` URL.

Notes: `buildWaMessage()` receives `originAirport` and `destinationName` but does not use them (ESLint errors) — origin and destination in the message come from the offer's IATA codes plus the city from `airports.ts`. The outbound `SliceRow` is built from the offer's top-level fields with an empty `segments` array. All amounts use `Math.floor`.

---

### `booking/AirportAutocomplete.tsx`
**Path:** `src/components/booking/AirportAutocomplete.tsx`

**Purpose:** Accent-insensitive, tiered airport search input used in Step 1 of BookingModal.

**Props:**
```typescript
interface AirportAutocompleteProps {
  value: string
  onChange: (value: string) => void   // Returns "City Name (IATA)" format
}
```

**Search Algorithm (6 tiers, in priority order):**
```
Tier 0: Exact IATA code match         "GRU" → GRU
Tier 1: IATA startsWith               "GR" → GRU
Tier 2: City startsWith               "Rio" → GIG, SDU
Tier 3: Airport name startsWith       "Guard" → GRU
Tier 4: City contains                 "de janeiro"
Tier 5: Airport name contains         "guarulhos"
Tier 6: Fuse.js fuzzy fallback        (only when tiers 0–5 return 0 results)
```

**Normalization:** All strings are pre-normalized with `NFD + replace(/[̀-ͯ]/g, "")` so that "sao paulo" matches "São Paulo" seamlessly.

**When it runs:** synchronously on every keystroke (`useMemo`), from 2 characters. No debounce, no network request, no loading state.

**Fuse.js config:** keys `_nc` (code, weight 4), `_ns` (city, weight 2), `_na` (airport name, weight 1); `threshold: 0.25`, `minMatchCharLength: 2`, `ignoreLocation: true`. Index built once at module load.

**Dropdown:** Rendered via `ReactDOM.createPortal` to `document.body` (position: fixed, z-index 10001) to escape the modal's `overflow: hidden` constraint.

**Result item format:**
- Left: Gold IATA badge (3-letter code)
- Right, line 1: Airport name
- Right, line 2: City • Country

**Max results displayed:** 7

**Dataset:** 147 airports.

**Limitation:** selection is bound to `onMouseDown` only. There is no arrow-key navigation, Enter-to-select, or ARIA combobox markup, so the field cannot be completed with the keyboard.

**Dependencies:** `fuse.js`, `react-dom`, `src/data/airports.ts`

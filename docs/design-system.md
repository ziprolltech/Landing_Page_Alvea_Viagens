# Design System

The visual identity is built around a **premium night-sky aesthetic** with gold accents — evoking executive lounges, long-haul flights at altitude, and luxury travel. Every design decision reinforces this positioning.

---

## Color Palette

All colors are defined in `tailwind.config.ts` as custom tokens and mirrored as CSS variables in `src/app/globals.css`.

### Sky Blues (Background Hierarchy)

| Token | Hex | CSS Variable | Usage |
|---|---|---|---|
| `sky-abyss` | `#030A14` | — | Deepest backgrounds, body |
| `sky-deep` | `#050D1A` | `--sky-deep` | Root background gradient start |
| `sky-dark` | `#0A1628` | `--sky-dark` | Section backgrounds |
| `sky-mid` | `#0D2447` | `--sky-mid` | Subtle UI surfaces, dividers |
| `sky-bright` | `#1A5FA0` | — | Ambient glow orbs (blue) |
| `sky-horizon` | `#1F4D8C` | — | Gradient ends, deep blue highlights |

The sky colors form a depth hierarchy. The darkest shades go at the furthest back (root background), progressively lighter shades come forward to create perceived depth.

### Gold Accents (Brand Identity)

| Token | Hex | CSS Variable | Usage |
|---|---|---|---|
| `gold` | `#D4A853` | `--gold` | Primary buttons, borders, text highlights |
| `gold-light` | `#ECC96A` | `--gold-light` | Gradient midpoints, hover highlights |
| `gold-dim` | `#A0782E` | — | Scrollbar thumb, subtle inactive states |
| `orange-soft` | `#E8824A` | `--orange-soft` | Gradient endpoints, warm accents |

Gold is the brand's signature color. It appears on: CTA buttons, active nav indicators, card borders on hover, text gradients, icon accents, scrollbar, and glow effects.

### Utility Colors

- **White** (`#FFFFFF`): Primary text on dark backgrounds.
- **White/52** (`rgba(255,255,255,0.52)`): Secondary text, subtitles.
- **White/8–12** (`rgba(255,255,255,0.08–0.12)`): Glass borders, card backgrounds.
- **Glass Background**: `rgba(8, 18, 36, 0.55)` — dark semi-transparent surface for glass cards.

---

## Typography

### Font Family
**Inter** (Google Fonts), weights 300–900. Applied via CSS variable `--font-inter` set in `layout.tsx`.

```css
font-family: var(--font-inter), system-ui, sans-serif;
```

### Scale

| Use Case | Size | Weight | Tracking |
|---|---|---|---|
| H1 (hero headline) | 80px / `[80px]` | 900 (black) | `-0.03em` |
| H2 (section heading) | 58px / `[58px]` | 900 (black) | `-0.02em` |
| H3 (card title) | 36px / `4xl` | 800 (extrabold) | default |
| Page title | 48–58px | 900 (black) | `-0.02em` |
| Body | 16–17px | 300–400 (light) | default |
| Caption / Badge | 11–13px | 600 (semibold) | `0.12em` uppercase |
| Button label | 14–15px | 600 (semibold) | `0.06em` |

### Responsive Typography

Headlines scale down on mobile:
- Desktop H1: `text-[80px]`
- Tablet H1: `text-5xl` (48px)
- Mobile H1: `text-3xl` (30px) or `text-4xl` (36px)

### Gold Gradient Text

Applied with the `.text-gold-gradient` utility class:
```css
background: linear-gradient(135deg, #D4A853, #ECC96A 50%, #E8824A);
-webkit-background-clip: text;
-webkit-text-fill-color: transparent;
```

Used for emphasized words in headlines and the section subtitles.

---

## Spacing System

Tailwind's default 4px base unit. Key intervals used in the project:

| Pattern | Value | Usage |
|---|---|---|
| `py-24` / `py-32` | 96px / 128px | Vertical section padding |
| `gap-6` / `gap-8` | 24px / 32px | Grid/flex gaps |
| `p-6` / `p-8` | 24px / 32px | Card inner padding |
| `px-6` | 24px | Horizontal container padding |
| `mb-4` / `mb-6` | 16px / 24px | Element stacking margins |

---

## Border Radius

| Token | Value | Usage |
|---|---|---|
| `rounded-3xl` | 24px | Large containers, modals |
| `rounded-2xl` | 16px | Cards, main panels |
| `rounded-xl` | 12px | Input fields, small panels |
| `rounded-lg` | 8px | Badges, tags, small buttons |
| `rounded-full` | 50% | Circular icons, avatar placeholders |

---

## Glassmorphism

Glassmorphism is the core surface treatment. It creates the impression of frosted glass over the dark sky background.

### `.glass` Utility Class
```css
background: rgba(8, 18, 36, 0.55);
border: 1px solid rgba(212, 168, 83, 0.12);   /* gold-tinted glass edge */
backdrop-filter: blur(22px) saturate(1.4);
-webkit-backdrop-filter: blur(22px) saturate(1.4);
```

### `GlassCard` Component
Uses a lighter variant:
- Background: `bg-white/[0.04]`
- Border: `border-white/10`
- Backdrop: `backdrop-blur-sm`

On hover (when `hover` prop is true):
- Border transitions to `rgba(212,168,83,0.3)` — a gold tint
- Scale: `1.025`
- Y offset: `-5px`

---

## Gradients

### Background Gradients (Tailwind custom)

**`sky-gradient`**: Main page background
```css
linear-gradient(175deg, #030A14 0%, #050D1A 30%, #0A1628 60%, #0D2447 80%, #1F4D8C 100%)
```

**`gold-gradient`**: Button fills, accent elements
```css
linear-gradient(135deg, #D4A853 0%, #ECC96A 50%, #E8824A 100%)
```

**`hero-radial`**: Hero section ambient glow
```css
radial-gradient(ellipse 80% 60% at 50% 50%, rgba(26,95,160,0.5) 0%, transparent 70%)
```

### Inline Gradients
Many sections use inline `style` for radial or directional glow overlays. These are always subtle (low opacity) and layered over the dark background.

---

## Shadows

### Custom Tailwind Shadows

| Token | Value | Usage |
|---|---|---|
| `shadow-gold` | `0 0 30px rgba(212,168,83,0.4)` | Subtle gold glow on cards |
| `shadow-gold-lg` | `0 0 30px rgba(212,168,83,0.4), 0 0 70px rgba(212,168,83,0.2)` | Strong gold glow |
| `shadow-blue` | `0 0 30px rgba(26,95,160,0.5)` | Blue glow on icons |
| `shadow-glass` | `0 8px 32px rgba(0,0,0,0.4)` | Elevation shadow on glass cards |

---

## Animations

See [animations.md](./animations.md) for detailed documentation of every animation.

### Animation Timing (Canonical Reference)

| Category | Duration | Examples |
|---|---|---|
| Hover / micro-interaction | 220–250ms | Nav underline (230ms), button hover (240ms) |
| Card entrance / step slides | ~320ms | BookingModal step transitions, card stagger |
| Fade / state change | ~300ms | Modal backdrop, step exit blur |
| Modal / page enter | ~400ms | Modal scale+y, page template fade |
| Ambient / looping | 1.8s–22s | Skeleton shimmer, plane float, cloud floats |

**Ease curve:** `cubic-bezier(0.22, 1, 0.36, 1)` — fast acceleration with smooth deceleration. Do not use `ease-in-out` for UI elements; reserve it for ambient ambient loops.

**Spring physics:** Used for interactive button hovers (`stiffness: 380–400, damping: 18–22`). Spring does not use a duration parameter.

---

## Accessibility

### Focus Rings

A global `:focus-visible` rule in `globals.css` provides a gold focus ring for keyboard navigation:

```css
:focus-visible {
  outline: 2px solid rgba(212,168,83,0.65);
  outline-offset: 3px;
  border-radius: 6px;
}
```

This applies to all interactive elements (buttons, links) that do not override `outline` with a more specific selector. Form inputs use `focus:border-gold/40` instead (more appropriate for text fields).

### `prefers-reduced-motion`

Decorative CSS animations (shimmer, glow, floats) are disabled via `@media (prefers-reduced-motion: reduce)` in `globals.css`. See [animations.md](./animations.md) for the complete suppression list.

### ARIA Labels

Interactive elements that lack visible text labels must carry `aria-label`:
- BookingModal close button: `aria-label="Fechar"`
- Navbar mobile toggle: `aria-label="Abrir menu"`
- Navbar drawer close: `aria-label="Fechar menu"`
- Footer social icons: `aria-label` on each anchor

### Icon Stroke Widths

Consistent stroke widths prevent visual weight inconsistency across icons:

| Context | `strokeWidth` | Examples |
|---|---|---|
| Decorative / large | `1.5` | Plane float badge, empty state illustration |
| Standard UI icons | `1.8` | Card icons, footer social, service icons |
| Action / small | `2` | CTA arrows, navigation chevrons, clock |
| Navbar / emphasis | `2.5` | Phone, Menu, nav action icons |

---

### Summary of Tailwind Custom Animations

| Name | Duration | Usage |
|---|---|---|
| `float-a` | 7s | Cloud blob floating |
| `float-b` | 9s | Cloud blob floating (offset) |
| `float-c` | 11s | Cloud blob floating (slow) |
| `float-d` | 8s | Cloud blob floating (variant) |
| `shimmer` | 4s linear infinite | Button shimmer overlay |
| `pulse-soft` | 3s | Soft opacity/scale pulse |
| `star-twinkle` | 4s | Star opacity twinkle |
| `drift-right` | 60s | Slow horizontal background drift |
| `drift-right-slow` | 90s | Very slow horizontal drift |

---

## Responsive Behavior

### Breakpoints (Tailwind defaults)
- **Default (mobile)**: < 640px
- **`sm:`**: 640px+
- **`md:`**: 768px+
- **`lg:`**: 1024px+

### Grid Patterns
```
Mobile:  grid-cols-1
sm:      grid-cols-2
lg:      grid-cols-3 or grid-cols-4
```

### Navigation
- From `lg` (1024px): Horizontal link bar + CTA button
- Below `lg`: Hamburger icon → right-slide drawer

### Typography Scaling
All display text uses responsive size variants. The hero H1 at 80px desktop drops to 30px on mobile.

### Touch Targets
All interactive elements maintain minimum 44px height (`py-3` to `py-4`) to satisfy touch accessibility standards.

---

## Scroll Storytelling (ALVEA JOURNEY)

Conventions used by `/experiencias`, to keep any future chapter consistent:

- **Palette:** the site navy and gold only. Stage backgrounds: `#050D1A` (base), `#030A14` (the darkest chapter), a blue ocean gradient for the sea chapters. Gold is reserved for the chapter kicker, one emphasised phrase per headline, and active states.
- **Type:** Inter, weight 900 for statements, sized with `clamp()` (largest: `clamp(40px, 9vw, 136px)`); weight 300 for supporting lines; kickers are 11–12px uppercase with wide tracking ("02 — EMBARQUE").
- **One idea per screen.** A chapter shows a single sentence or a single image at a time; text never competes with a moving subject.
- **Point of view:** the journey is seen from above (runway, map, ocean), using the brand aircraft artwork.
- **Opacity classes:** Tailwind scale only (multiples of 5).
- **Honesty:** anything that could read as an offer carries an on-screen "ilustrativo" note; no prices or figures at all.
- **Continuity:** chapters hand over on identical frames (see `animations.md`, "One continuous shot"); no decorative layer is static on a first or last frame.
- **Destination accents:** each destination may carry one soft accent colour (region label and a 32px rule) and a low-alpha colour grade over its photograph. These are the only non-brand colours on the page.

---

## Visual Hierarchy Rules

1. **Depth through blur**: Background elements (clouds, orbs) are heavily blurred. Foreground content is sharp.
2. **Depth through opacity**: Background decorative elements have very low opacity (0.01–0.12). Text and CTAs are full opacity.
3. **Gold = action**: Gold color signals interactivity. Every button, active link, and hover state uses gold.
4. **Spacing = breathing room**: Generous vertical padding between sections reinforces the premium feel. Never crowd content.
5. **White text on dark**: All body text is white or white/52. Never dark text on dark background.

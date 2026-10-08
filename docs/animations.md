# Animations

All animations in the project are documented here: where they are defined, how they work, and why they exist.

---

## Animation Timing Standard

All transitions and animations follow a consistent timing system:

| Category | Duration | Use Case |
|---|---|---|
| Hover / micro | 220–250ms | Button hover, link underline, icon states |
| Cards | ~320ms | Card entrance, step slide transitions |
| Fades | ~300ms | Opacity-only transitions, state changes |
| Modal / page | ~400ms | Modal entrance, page transitions |
| Ambient / looping | 1.8s–22s | Skeleton shimmer, plane float, cloud floats |

Ease curve used throughout: `[0.22, 1, 0.36, 1]` (fast in, smooth deceleration).

---

## `prefers-reduced-motion` Support

Decorative CSS animations are suppressed for users who have enabled the system-level reduced motion preference. Defined in `src/app/globals.css`:

```css
@media (prefers-reduced-motion: reduce) {
  .btn-shimmer::after,  /* button shimmer sweep */
  .cta-glow,            /* pulsing gold glow */
  .plane-on-path,       /* GSAP path animation target */
  .animate-float-a/b/c/d,   /* cloud blob floats */
  .animate-pulse-soft,       /* eyebrow dot pulse */
  .animate-star-twinkle,     /* star opacity flicker */
  .animate-drift-right/slow  /* slow background drift */ {
    animation: none !important;
  }
}
```

**Note:** Framer Motion animations (modal entry, step slides, card hover) are not suppressed by this rule. They can be eliminated by passing `useReducedMotion()` into motion components — tracked as a future improvement. Components that already do this: `ScrollPlane` (see "Scroll-Driven Airplane Fly-Over" below), the Offers Group page, and every scene of `/experiencias` (see "ALVEA JOURNEY" below).

---

## Animation Libraries

| Library | Use Case |
|---|---|
| Framer Motion 11.18.2 | UI transitions, scroll-driven animations, page enters, hover effects |
| GSAP 3.12.7 + MotionPathPlugin | Complex SVG path animation (airplane trajectory) |
| CSS Keyframes (Tailwind) | Background cloud floats, button shimmer, star twinkle |
| CSS Keyframes (globals.css) | Glow pulses, plane SVG opacity, particles |

---

## Page Transition Animation

**File:** `src/app/template.tsx`

Every route change triggers a fresh entrance animation via the `template.tsx` wrapper.

```
Initial:  opacity: 0 | y: +14px | filter: blur(5px)
Animate:  opacity: 1 | y: 0px   | filter: blur(0px)
Duration: 0.58s
Ease:     [0.22, 1, 0.36, 1]  ← cubic-bezier, fast acceleration then smooth deceleration
```

**Why it exists:** Abrupt page loads feel cheap. This transition makes navigation feel fluid and polished, reinforcing the premium brand experience.

---

## Hero Scroll Animations

**File:** `src/components/Hero.tsx`

Uses Framer Motion `useScroll` and `useTransform` to drive parallax effects as the user scrolls down.

### Entry Animation (Staggered Fade-Up)

All hero content enters on mount:
- Initial: `opacity: 0, y: 20px`
- Animate: `opacity: 1, y: 0`
- First child delay: 0.35s
- Each subsequent child: +0.11s stagger
- Duration per item: ~0.7s
- Ease: `[0.22, 1, 0.36, 1]`

Order of appearance: eyebrow badge → headline → divider → subheadline → CTA buttons → trust badges.

### Scroll Parallax

| Element | Transform | Effect |
|---|---|---|
| Hero container | `scrollY 0→600` → `y 0→-18%` | Entire hero moves up as you scroll |
| H1 Title | `scrollY 0→400` → `y 0→-10%` | Title moves up slightly faster than container |
| CTA + trust area | `scrollY 0→300` → `opacity 1→0` | Fades out before it leaves view |

### Scroll Indicator

- A chevron-down icon at the bottom of the hero
- Bounces via `animate={{ y: [0, 8, 0] }}` (0s→0.6s→1.2s loop)
- Opacity pulses in sync: `[1, 0.4, 1]`
- Fades out completely as user starts scrolling: `scrollY 0→120` → `opacity 1→0`

---

## Cloud Animations

**File:** `src/components/CloudBackground.tsx`

### Cloud Blob Floats (CSS)

Each cloud blob is assigned one of four float animations. These are defined in `tailwind.config.ts`:

| Animation | Duration | Movement |
|---|---|---|
| `float-a` | 7s | Subtle Y drift + opacity pulse |
| `float-b` | 9s | Slightly wider drift, offset timing |
| `float-c` | 11s | Slower, wider |
| `float-d` | 8s | Scale variation |

All blobs move only 2–4px. The motion is imperceptible individually — collectively it makes the cloud mass feel alive.

**Why deliberately slow and subtle:** Fast cloud animations look cartoonish and break immersion. The goal is photorealistic clouds that feel like a live sky photograph.

### Cloud Parallax (Framer Motion)

Two parallax layers respond to `scrollY`:

| Layer | Y range | Fade-out |
|---|---|---|
| Far clouds (top 0–22%) | `scrollY 0→500` → `y 0→-40px` | `opacity 1→0` at scroll 72% |
| Near clouds (top 0–40%) | `scrollY 0→500` → `y 0→-80px` | `opacity 1→0` at scroll 72% |

The near layer moves faster than the far layer, creating depth through differential scrolling.

### Star Twinkle (CSS)

45 stars are distributed across the top 38% of the hero. Each is assigned `animation: star-twinkle Xs` with randomized duration (3–6s) and delay (0–5s).

```css
@keyframes star-twinkle {
  0%, 100% { opacity: 0.15; transform: scale(1); }
  50%       { opacity: 0.6;  transform: scale(1.2); }
}
```

Stars fade out when cloud layers become prominent (via the parallax + opacity transforms above).

---

## Airplane Animation (GSAP)

**File:** `src/components/AviationTrail.tsx`

### MotionPath Flight

The airplane follows a cubic Bézier curve drawn as an SVG `<path>`:

```
M -100,120 C 400,60 900,200 1920,80
```

This creates a gentle arc from left-off-screen to right-off-screen at 260px height.

**GSAP Timeline:**
```javascript
gsap.to(planeRef, {
  motionPath: { path: pathRef, align: pathRef, autoRotate: true },
  duration: 22,
  ease: 'none',
  repeat: -1,
  repeatDelay: 2,
})
// Fade in at start of each cycle
gsap.fromTo(planeRef, { opacity: 0 }, { opacity: 1, duration: 1.5 })
```

- `autoRotate: true` means the plane SVG rotates to match the path tangent — it banks slightly as it curves.
- `ease: 'none'` keeps velocity constant (no easing would make it feel unnatural since the path already curves).
- The 2s `repeatDelay` gives a brief pause between passes.

### Trail SVG

Two path elements trace the flight path:
1. **Glow path:** Thick (4px), rgba(212,168,83,0.15), heavily blurred via `filter: url(#path-glow)`.
2. **Dashed path:** Thin (1.5px), rgba(212,168,83,0.22), `stroke-dasharray: 10 4`.

Both paths use `mask: url(#path-fade)` which fades the trail to transparent at its start and end (0–8% and 92–100% of path length).

**Why GSAP instead of Framer Motion:** GSAP's `MotionPath` plugin is the industry standard for SVG path animation. It handles `autoRotate` and variable-speed easing along arbitrary paths in a way that would require significant custom code in Framer Motion.

---

## Scroll-Driven Airplane Fly-Over (Framer Motion)

**File:** `src/components/home/ScrollPlane.tsx`
**Used in:** `src/app/page.tsx`, wrapping `<Benefits />` (between the Hero and "Quem Somos")
**Asset:** `public/images/plane-scroll.png` (1672×941 PNG with alpha, ~630 KB, rendered with `next/image`) — realistic top-down airliner, nose pointing right, supplied by the project owner. The plane occupies about 82% of the image width; the rest is transparent margin. It is shown as-is: no CSS filter, shadow, mask, or extra rotation on the image.

As the user scrolls from the Hero into the Benefits section, an airplane enters from the bottom-left, crosses the viewport diagonally in front of the content, and leaves at the top-right. Scrolling back up flies it backwards along the same path. It is separate from the GSAP airplane in the Hero (`AviationTrail`), which is time-based.

### How it is linked to scroll

There is no timer, no `scroll` listener, and no `requestAnimationFrame` in the component. `useScroll` tracks the wrapper around Benefits and every visual property is a `useTransform` of that single progress value, so position is a pure function of scroll position — which is what makes it reversible.

```ts
useScroll({ target: wrapperRef, offset: ['start 0.85', 'end 0.15'] })
// progress 0 → Benefits top reaches 85% of the viewport height
// progress 1 → Benefits bottom reaches 15% of the viewport height
```

| Property | Progress range | Values |
|---|---|---|
| `x` | 0.08 → 0.90 | `-55vw` → `105vw` |
| `y` | 0.08 → 0.90 | `14vw` → `-26vw` |
| `rotate` | 0.08 / 0.50 / 0.90 | `-18°` / `-14°` / `-11°` |
| `scale` | 0.08 / 0.50 / 0.90 | `0.9` / `1` / `1.06` |
| `opacity` | 0.10 / 0.24 / 0.74 / 0.88 | `0` / `1` / `1` / `0` |

Resulting timeline: fully off-screen below ~10% and above ~88%; entering 10–25%; crossing 25–74%; leaving 74–88%.

Both axes travel in `vw`, so the climb angle is the same on every screen (about 14°) and matches the plane's rotation. Only `transform` and `opacity` are animated.

### Layering and overflow

The plane is rendered through `createPortal` into a `fixed inset-0` layer on `<body>`:

- `z-30` — above page content, **below** the navbar (`z-50`) and the mobile drawer (`z-40`/`z-50`).
- `pointer-events-none` and `aria-hidden="true"` — purely decorative; cards underneath stay hoverable and clickable.
- `overflow-hidden` on the layer itself clips the plane while it is outside the viewport, so it never creates a horizontal scrollbar. No global `overflow` rule was added or relied upon.
- The layer adds **no scroll height** — the page is exactly as long as before.
- It only exists while the homepage is mounted; navigating away removes it.

Why a portal and not `sticky`: `<main>` on the homepage is `overflow-hidden` (which disables `position: sticky` inside it), and `template.tsx` leaves a `filter` on its wrapper (which makes `position: fixed` descendants behave as absolute). Portalling to `<body>` sidesteps both without changing existing structure.

### Responsive sizing

Image width: `clamp(240px, 60vw, 820px)` — 240px at 390px wide, ~460px at 768px, 820px from ~1367px up. Because of the transparent margins in the file, the visible aircraft is about 82% of that: ~197px, ~375px, and ~670px. Travel distances scale with the viewport because they are in `vw`.

### Contrails

Two trails (`Contrail` in the same file) are children of the plane's `motion.div`, rendered before the image, so they inherit its x/y/rotate/scale/opacity and sit behind the aircraft. Every measurement is a percentage of the plane box, taken from the engine positions in `plane-scroll.png` (1672×941):

| Property | Value | Meaning |
|---|---|---|
| `top` | `35.5%` / `66.7%` | Engine centrelines (y≈334 and y≈628), centred with `-translate-y-1/2` |
| `right` | `43.2%` | Trail starts at the engine exhaust (x≈950) and is hidden by the engine and wing until the trailing edge |
| `width` | `72%` | Extends back just past the tail |
| `height` | `4.6%` | Width of the trail at its far end |
| `clip-path` | `polygon(0 0, 100% 40%, 100% 60%, 0 100%)` | Narrow at the engine (20% of the height), widening towards the tail |
| `background` | white, alpha `0.5` at the engine → `0.26` → `0.08` → `0` | Denser start, fading out |
| `filter` | `blur(clamp(0.6px, 0.12vw, 2px))` | Soft edge (on the trail only, not the image) |

If the artwork is replaced, re-measure the engines and update `top` and `right`.

### Reduced motion

`useReducedMotion()` switches to a calm variant: no travel, rotation change, or scaling. A smaller plane (`clamp(120px, 22vw, 300px)`) stays parked in the upper-right and only fades in to 50% opacity and back out as the section passes.

### SSR

The layer is rendered only after mount (`mounted` state), so the server output contains just the wrapper `div` and its children — no `window` access during render and no hydration difference.

### Dev-only console notes

In development Framer Motion logs "Please ensure that the container has a non-static position…" (triggered by any `useScroll({ target })` against the default page scroller; the measured offsets were verified correct), and Next.js may log that the plane image was detected as LCP when it is the largest image on screen. Neither appears in production builds.

---

## Section Reveal Animations

**File:** `src/components/ui/SectionReveal.tsx`

All content sections throughout the site use `SectionReveal` for scroll-triggered entrances.

```
Initial:  opacity: 0, y: +30px
Animate:  opacity: 1, y: 0
Trigger:  Intersection Observer, 80px margin (fires 80px before entering viewport)
Duration: 0.75s
Ease:     [0.22, 1, 0.36, 1]
Once:     true (does not re-animate on scroll back up, by default)
```

The `delay` prop staggers children in a grid. For example, Benefits cards use 0.1, 0.2, 0.3, 0.4s delays to create a cascade effect.

**Why `once: true`:** Re-animating on scroll-up is visually distracting. The user has already seen the element; it should stay visible.

---

## GlassCard Hover Animation

**File:** `src/components/ui/GlassCard.tsx`

All cards with `hover={true}` (the default) animate on hover:

```
Scale:  1.0 → 1.025
Y:      0 → -5px
Border: white/10 → rgba(212,168,83,0.3)
```

Spring physics: `stiffness: 300, damping: 22` — fast response, no overshoot.

The gold border appearing on hover reinforces the brand identity and signals interactivity.

---

## Navbar Animations

**File:** `src/components/Navbar.tsx`

### Scroll State
`scrollY > 24` triggers glass effect. This is a CSS class change (not a motion animation) but visually transitions via `transition: background-color 0.3s, backdrop-filter 0.3s`.

### Mobile Drawer
Framer Motion `AnimatePresence`:
- Drawer: `x: '100%' → 0` (right-slide in, 0.35s)
- Backdrop: `opacity: 0 → 1`
- Nav links inside drawer: Staggered fade-up with 0.06s between items

### Nav Link Underline
`.nav-link-underline` class in globals.css creates an animated underline via pseudo-element:
```css
::after {
  content: '';
  width: 0 → 100%;
  height: 1.5px;
  background: gold-gradient;
  transition: width 0.23s ease;
}
:hover::after { width: 100%; }
```

---

## Button Effects

### Shimmer (`.btn-shimmer`)

Defined in `globals.css`. Applied to primary CTA buttons.

```css
::before {
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent);
  animation: shimmer 4s linear infinite;
}

@keyframes shimmer {
  0%   { transform: translateX(-150%) skewX(-20deg); }
  100% { transform: translateX(350%) skewX(-20deg); }
}
```

A soft white light sweeps across the button every 4 seconds. Subtle enough to not be distracting but adds liveliness.

### CTA Glow (`.cta-glow`)

```css
animation: glowPulse 2s ease-in-out infinite;

@keyframes glowPulse {
  0%, 100% { box-shadow: 0 0 20px rgba(212,168,83,0.3), ... }
  50%       { box-shadow: 0 0 35px rgba(212,168,83,0.5), ... }
}
```

The primary gold button breathes a warm glow, drawing the eye.

---

## Miles Page Animations (Framer Motion)

**Files:** `src/app/milhas/page.tsx`, `src/components/milhas/MilesModal.tsx` · **Page:** `/milhas`

Ease `[0.22, 1, 0.36, 1]` throughout. No bounce, loops, or parallax.

| Element | Trigger | Animation |
|---|---|---|
| Page: badge → H1 → subheadline → card 1 → card 2 | On mount | One stagger sequence (`0.13s` apart, `0.12s` initial delay); each `opacity 0→1`, `y 22px→0`, `0.75s` |
| Service cards | Hover | `GlassCard` lift (scale 1.025, y −5) and gold border (existing behavior) |
| Card CTA | Hover / tap | `scale 1.03, y −1` / `scale 0.97` (spring 400/22) |
| Modal backdrop | Open / close | `opacity 0→1` in `0.28s` / `0.2s` out |
| Modal panel | Open / close | `opacity 0→1`, `scale 0.96→1`, `y 16px→0`, `0.4s`; exit `scale 0.97`, `0.2s` |
| Step change | Continuar / Voltar | `AnimatePresence mode="wait"`: current step fades and slides 28px out, next slides in from the other side (direction-aware), `0.32s` in / `0.22s` out |
| Progress bar segments | Step change | Width `0→100%`, `0.38s` |
| Gestão: step heading | Step shown | Title, then description (`0.08s` apart); each `opacity 0→1`, `y 10px→0`, `0.35s` |
| Gestão: question block (`ChoiceGroup`) | Step shown | Question text first, then its cards in a cascade (`0.04s` apart, `0.05s` initial delay); each `opacity 0→1`, `y 8px→0`, `0.3s` |
| Gestão: selecting an option | Click / Space | Check box pulses `scale 1→1.16→1` (`0.28s`), the check mark fades and scales in (`0.18s`), border turns gold, background tints, and a very soft gold glow appears (CSS transition `0.2s`) |
| Venda: programme list | Open / close | `opacity 0→1`, `scale 0.98→1`, `y −4px→0`, `0.18s` |

**Reduced motion:** `useReducedMotion()` removes every translation and scale (page, modal, steps, headings, option cards, check-box pulse), removes the card cascade, makes the progress bar change instantly, disables card and CTA hover motion, and keeps only short fades (`0.1–0.3s`). The form stays fully functional.

---

## Offers Group Page Animations (Framer Motion)

**File:** `src/components/grupo-ofertas/OffersGroupContent.tsx` · **Page:** `/grupo-de-ofertas`

All easing uses `[0.22, 1, 0.36, 1]`. Nothing bounces, loops, or uses parallax. (The page transition from `template.tsx` and the global `.btn-shimmer` / `.cta-glow` button effects also apply, as on every page.)

| Element | Trigger | Animation |
|---|---|---|
| Hero: badge → H1 → subheadline → CTA | On mount | Staggered (`0.14s` apart, `0.15s` initial delay); each `opacity 0→1`, `y 22px→0`, `0.8s` |
| Vertical video frame (5th item of the same hero sequence) | On mount, after the CTA | `opacity 0→1`, `scale 0.96→1`, `y 20px→0`, `0.9s` |
| Section headings (badge + H2) | Enters viewport (once) | `opacity 0→1`, `y 18px→0`, `0.7s` |
| Benefit cards (4) | Enters viewport (once) | Stagger `0.1s`; each `opacity 0→1`, `y 24px→0`, `0.65s` |
| "Como funciona" cards (3) | Enters viewport (once) | Same as above |
| Final CTA panel | Enters viewport (once) | `opacity 0→1`, `y 26px→0`, `0.8s` |
| Group CTA button | Hover / tap | `scale 1.04, y -2` / `scale 0.97` (spring 400/22) |
| Cards | Hover | `GlassCard` lift (existing behavior) |

Viewport trigger: `once: true`, margin `-80px 0px`.

**Reduced motion:** `useReducedMotion()` removes every translation and the video scale, shortens the remaining fades to `0.3s`, cuts the stagger (hero `0.05s`, grids `0`), and disables the CTA and card hover motion. Only brief opacity fades remain.

---

## ALVEA JOURNEY — Scroll-Driven Experience (Framer Motion)

**Files:** `src/components/experiencias/*` · **Page:** `/experiencias`

### One mechanism

Every animation on the page is a function of scroll position: `useScroll({ target: section, offset: ['start start', 'end end'] })` gives each chapter a `progress` of 0 → 1, and `useTransform` maps it to style values. There are no timelines, no `whileInView`, no springs, and no time-based tweens in the scenes, so:

- **Scrolling back replays everything in reverse** — the same scroll position always produces the same frame.
- **Scroll is never hijacked.** No `preventDefault`, no snapping, no custom wheel handling; the browser scrolls natively. The only programmatic scroll is `scrollIntoView({ behavior: 'smooth' })` when a progress dot is clicked.
- **GSAP is not used on this page**, so no two libraries write to the same property.

Pinning is plain CSS (`position: sticky`); nothing is pinned by JavaScript.

### One continuous shot

Sections overlap by one viewport and earlier chapters are stacked above later ones. The next stage arrives behind the current one and the current one is hidden at progress 1, so there is no empty stretch and no seam between chapters. The rule that makes it work: **a chapter's last frame equals the next chapter's first frame** (plain navy, flat ocean blue, or — between take-off and map — the same cloud deck at the same opacity and scale). Any new decorative layer must therefore be faded in and out with the scene; nothing may be static on a first or last frame.

### Per chapter

| Chapter | What moves | Driven by |
|---|---|---|
| 01 Hero | Title and lines fade and lift away; stars drift slightly | `useTransform` → opacity, `y`, `scale` |
| 02 Embarque | Board fades in, straightens (`rotateX 14° → 2°`) and grows; floor lights run towards the viewer | opacity, `scale`, `y`, `rotateX`; `background-position-y` |
| 03 Decolagem | Centre-line distance ∝ `progress^2.4`; edge lights turn into streaks; ground shrinks (`scale 1 → 0.34`) and slides back on climb; two shadows cross-fade; cloud veil passes over the aircraft, deck drops below; sky fades in, then deepens to navy | `background-position-y` (one strip), `scale`, `y`, opacity |
| 04 O mundo | Cloud deck parts; routes draw with a halo; a pulse ring opens at each city; the aircraft flies the Paris arc for ~40% of the scene and draws its route; push-in on Paris at the end | SVG `pathLength`; opacity; `scale`; `left`/`top`/`rotate` computed from the curve |
| 05 Destinos | An aircraft-window clip opens to full screen; five photos cross-fade with a slow zoom; name and line rise per destination | `clip-path` via a CSS variable; opacity, `scale`, `y` |
| 06 Além do céu | The sea layer (top edge = horizon) rises through the frame; the sky drifts up behind it; swell moves | `y` (transform), opacity |
| 07 Cruzeiros | Ship sails in, then holds while the water streams past at two speeds; regions appear one by one; route line fills | `x` (transform), `scaleX`, opacity |
| 08 O caminho | First line arrives, dims as the gold line arrives under it, both hold; dashed route fills; a small aircraft rides it; each step lights up on arrival | opacity, `y`, `scaleX`/`scaleY`, `left`/`top` |
| 09 Viagem inteligente | One word rolls into the next in a clipped window; route fills; VIAGEM grows, then the camera flies through it (`scale → 4.2`) | opacity, `y`, `scale`, `scaleX` |
| 10 Próximo destino | Headline and CTAs rise; planet horizon lifts | opacity, `y` |
| Progress | Dot state follows page progress; mobile line is `scaleX: progress` | `useMotionValueEvent` → React state; `scaleX` |

Outside the scroll link, only the global button effects (`.btn-shimmer`, `.cta-glow`) and CSS hover transitions run.

### Reduced motion

`useReducedMotion()` is read in every scene. `useFx` then returns a fixed value for every translation, scale, and rotation, and `useAppear` drops its rise. What remains is opacity tied to scroll (content still appears and gives way in order), the map pan on small screens (needed to see the eastern half), and line/route drawing. Aircraft that could no longer leave the frame are faded out (take-off) or hidden (map, finale) so they never sit under text. Progress dots jump instantly.

**Tested 2026-10-07** by forcing `matchMedia('(prefers-reduced-motion)')` and the CSS media rule in the browser, at 1366 and 390px: no element of the take-off changed transform between progress 0.3 and 0.7 (0 of 35), no animation was running, every chapter stayed legible and in order.

### Performance

- Animated properties are `transform`, `opacity`, CSS variables feeding a transform or `clip-path`, and `background-position` on one narrow strip (the runway centre-line); no layout properties are animated except `left`/`top` on two small markers. **No blur is animated**; the `filter: blur` values that remain are static. Sea and cloud movement use `transform`, and clouds are gradients rather than blurred elements.
- Each stage is `overflow-hidden` and only the pinned stage is on screen; images use `next/image` with `sizes`, and all assets are local.
- Motion values update outside React; the only scroll-driven React state is the active chapter index, which changes ten times over the whole page.
- Frame rate on real devices has not been measured.

### Sound

The optional soundscape is driven by the same scroll progress as the visuals (`useMotionValueEvent` on the journey progress — no extra listener). The sound control has one entrance (fade + 12px rise, 0.9s; fade only under reduced motion) and a CSS label transition (`max-width`/opacity, off under reduced motion). See `experiencias-sound.md`.

### SSR / dev notes

- Values that end up in the server HTML are rounded (map positions to 3 decimals, rotation to 0.1°) so server and client strings match.
- In development Framer Motion logs "Please ensure that the container has a non-static position…". It is a dev-only hint and harmless here.

---

## Booking Modal Animations

**File:** `src/components/booking/BookingModal.tsx`

### Backdrop
`opacity: 0 → 1` on mount, `0` on unmount. Duration 0.3s.

### Modal Panel
`y: 60px → 0, opacity: 0 → 1` on mount. Duration 0.45s, ease `[0.22, 1, 0.36, 1]`.

### Step Transitions (Direction-Aware Slide)
Each step slides in/out based on forward/back navigation direction.

```
Forward (next): 
  Exit current:  x: 0 → -40px, opacity 1→0
  Enter next:    x: +40px → 0, opacity 0→1

Back (previous):
  Exit current:  x: 0 → +40px, opacity 1→0
  Enter previous: x: -40px → 0, opacity 0→1
```

`AnimatePresence` with `mode="wait"` ensures the exiting step fully leaves before the entering step appears.

### Searching State

After Step 5 confirmation:
- A spinner (`animate: { rotate: 360 }`, `transition: repeat: Infinity, duration: 0.8s`) replaces step content
- After 1.5s setTimeout, transitions to Results view

### Form Success (Atendimento Page)

`AnimatePresence` swaps the form for a success card:
- Checkmark scales from `scale: 0` to `1.1` to `1.0` (spring bounce)
- Success card fades and slides up

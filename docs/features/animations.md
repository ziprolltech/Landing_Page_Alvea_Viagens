# Feature: Animations

**Related docs:** [animations.md](../animations.md) (full technical reference), [design-system.md](../design-system.md)

---

## Purpose

Animations serve three functions in this project:

1. **Brand communication** — The cinematic sky and airplane communicate travel before any copy is read.
2. **Quality signaling** — Smooth, unhurried motion communicates craftsmanship and premium positioning.
3. **User orientation** — Scroll reveals, step transitions, and hover effects guide attention and confirm interactions.

Animations are not decoration. They are brand-level decisions.

---

## Animation Library Decisions

### Framer Motion — UI animations

Used for all component-level animations:
- Page transitions (`template.tsx`)
- Hero entry stagger
- Scroll parallax (via `useScroll` + `useTransform`)
- Section reveal (`SectionReveal.tsx`)
- Card hover (`GlassCard.tsx`)
- Modal enter/exit (`BookingModal.tsx`)
- Step transitions (`BookingModal.tsx`)
- Mobile drawer (`Navbar.tsx`)

**Why Framer Motion:** Native React integration, declarative API, spring physics, scroll-driven animations, and `AnimatePresence` for mount/unmount. It is the best-in-class solution for React UI animation.

### GSAP — SVG path animation

Used only for `AviationTrail.tsx`.

**Why GSAP:** The `MotionPathPlugin` handles SVG path following with `autoRotate` (the plane banks to match the curve tangent). This requires direct SVG DOM manipulation that Framer Motion cannot replicate cleanly.

**Rule:** Do not use GSAP for anything other than the airplane. All other animations use Framer Motion or CSS.

### CSS Keyframes — background animations

Used in `tailwind.config.ts` and `globals.css` for:
- Cloud blob float (`float-a` through `float-d`)
- Star twinkle (`star-twinkle`)
- Button shimmer (`shimmer`)
- CTA glow pulse (`glowPulse`)
- Horizontal background drift (`drift-right`, `drift-right-slow`)

**Why CSS:** These animations run continuously with no JS involvement. CSS animations are composited by the GPU and do not block the main thread. Using Framer Motion for indefinitely looping background effects would waste React rendering cycles.

---

## Animation Catalog

### Page Transition
- **Where:** `src/app/template.tsx`
- **Trigger:** Every route change
- **Motion:** `opacity 0→1, y +14→0, blur 5→0` over 0.58s
- **Ease:** `[0.22, 1, 0.36, 1]` (fast start, smooth deceleration)

### Hero Entry (Staggered Fade-Up)
- **Where:** `src/components/Hero.tsx`
- **Trigger:** Component mount
- **Motion:** Each child: `opacity 0→1, y +20→0`, 0.11s stagger, 0.35s initial delay

### Hero Scroll Parallax
- **Where:** `src/components/Hero.tsx` (useScroll + useTransform)
- **Trigger:** User scrolling
- **Motion:** Container moves up 18%, title moves up 10%, CTAs fade out

### Cloud Float (CSS)
- **Where:** `tailwind.config.ts` (`float-a` through `float-d`), `CloudBackground.tsx`
- **Trigger:** Always running
- **Motion:** 2–4px subtle Y drift, 7–11s loops, opacity ±10%

### Cloud Parallax
- **Where:** `src/components/CloudBackground.tsx` (useScroll + useTransform)
- **Trigger:** User scrolling
- **Motion:** Near layer moves -80px, far layer moves -40px; both fade at 72% scroll

### Star Twinkle (CSS)
- **Where:** `tailwind.config.ts` (`star-twinkle`), `CloudBackground.tsx`
- **Trigger:** Always running
- **Motion:** `opacity 0.15→0.6, scale 1→1.2`, randomized 3–6s duration

### Airplane (GSAP MotionPath)
- **Where:** `src/components/AviationTrail.tsx`
- **Trigger:** Component mount, repeats infinitely
- **Motion:** Follows cubic Bézier curve, 22s duration, auto-rotates, 2s repeat delay

### Section Reveal (Scroll-triggered)
- **Where:** `src/components/ui/SectionReveal.tsx`
- **Trigger:** Element enters viewport (80px margin)
- **Motion:** `opacity 0→1, y +30→0`, 0.75s, optional delay prop for stagger

### GlassCard Hover
- **Where:** `src/components/ui/GlassCard.tsx`
- **Trigger:** Mouse hover
- **Motion:** `scale 1→1.025, y 0→-5px`, border color to gold tint, spring physics

### Modal Enter/Exit
- **Where:** `src/components/booking/BookingModal.tsx`
- **Trigger:** `selectedDestination` state change
- **Motion:** Backdrop `opacity 0→0.6`, panel `y +60→0, opacity 0→1`

### Step Transitions (Direction-Aware)
- **Where:** `src/components/booking/BookingModal.tsx`
- **Trigger:** Next/back button click
- **Motion:** Forward: exit left, enter right. Back: exit right, enter left. 0.25s duration.

### Button Shimmer (CSS)
- **Where:** `globals.css` (`.btn-shimmer`), primary CTA buttons
- **Trigger:** Always running
- **Motion:** White light stripe sweeps left-to-right, 4s loop

### CTA Glow Pulse (CSS)
- **Where:** `globals.css` (`.cta-glow`), primary CTA buttons
- **Trigger:** Always running
- **Motion:** Gold box-shadow pulses 20px→35px, 2s ease-in-out loop

### Nav Link Underline
- **Where:** `globals.css` (`.nav-link-underline`)
- **Trigger:** Hover
- **Motion:** `width 0→100%` pseudo-element underline, 0.25s ease

### Mobile Drawer Slide
- **Where:** `src/components/Navbar.tsx`
- **Trigger:** Hamburger click
- **Motion:** Drawer `x 100%→0`, backdrop `opacity 0→0.5`, links stagger 0.06s

### Form Success Checkmark
- **Where:** `src/app/atendimento/page.tsx`
- **Trigger:** Form submission
- **Motion:** Checkmark `scale 0→1.1→1`, success card fade-up

---

## Adding a New Animation

**For a one-time animation on a UI element:** Use Framer Motion `motion.div` with `initial`, `animate`, and optional `exit` props.

**For a scroll-triggered reveal:** Wrap in `<SectionReveal delay={n}>` — this covers 95% of cases.

**For a continuous background effect:** Define a CSS keyframe in `tailwind.config.ts` (`theme.extend.keyframes`) and register it as an animation (`theme.extend.animation`). Apply via Tailwind class `animate-your-name`.

**For a complex SVG path animation:** Use GSAP MotionPath, following the pattern in `AviationTrail.tsx`.

**Never:** Add animation via inline `style` with JavaScript `setInterval`. This will cause performance issues and React warnings.

---

## Performance Rules

- All animated elements should use GPU-composited properties: `transform` (translate, scale, rotate) and `opacity`. Avoid animating `width`, `height`, `margin`, `padding`, or `top/left/right/bottom`.
- Use `will-change: transform` on elements with continuous animations if performance is an issue (but measure first — `will-change` has its own memory cost).
- Add `pointer-events: none` to decorative animated elements (cloud orbs, background drifts) so they don't interfere with mouse interactions.
- Cloud blobs and stars already have `pointer-events: none` — do not remove this.

---

## Accessibility Consideration (Future)

The `prefers-reduced-motion` media query should be respected:
```css
@media (prefers-reduced-motion: reduce) {
  /* Disable cloud floats, star twinkle, airplane, parallax */
}
```

This is a planned improvement. Currently, all animations run regardless of user preference.

# Feature: Scroll Effects

**Related docs:** [animations.md](../animations.md), [features/hero-section.md](./hero-section.md)

---

## Purpose

Scroll-driven effects serve two roles:

1. **Immersive depth** — The hero parallax makes the sky feel three-dimensional, as if the user is moving through altitude layers.
2. **Guided attention** — Section reveal animations guide the user's eye through content as they scroll, reinforcing the hierarchy of information.

---

## Scroll Effects Inventory

### 1. Hero Container Parallax

**Where:** `src/components/Hero.tsx`
**Library:** Framer Motion `useScroll` + `useTransform`

```typescript
const { scrollY } = useScroll()
const containerY = useTransform(scrollY, [0, 600], ['0%', '-18%'])
```

As the user scrolls 0→600px, the entire hero section moves upward by 18% of its height. This makes the hero "recede" as the user scrolls past, reinforcing the vertical depth illusion.

### 2. Hero Title Parallax

**Where:** `src/components/Hero.tsx`

```typescript
const titleY = useTransform(scrollY, [0, 400], ['0%', '-10%'])
```

The H1 title moves at a slightly different rate than the container — this differential movement (2-layer parallax within the hero) creates additional depth.

### 3. CTA + Trust Badges Fade

**Where:** `src/components/Hero.tsx`

```typescript
const ctaOpacity = useTransform(scrollY, [0, 300], [1, 0])
```

The CTA buttons and trust badges fade out as the user starts scrolling. This cleans up the screen as content below becomes the focus, without the hero content awkwardly persisting.

### 4. Scroll Indicator Fade

**Where:** `src/components/Hero.tsx`

```typescript
const indicatorOpacity = useTransform(scrollY, [0, 120], [1, 0])
```

The bouncing chevron-down arrow fades out quickly as soon as the user begins scrolling — it has served its purpose (prompting the first scroll).

### 5. Cloud Far Layer Parallax

**Where:** `src/components/CloudBackground.tsx`

```typescript
const { scrollY } = useScroll()
const cloudFarY = useTransform(scrollY, [0, 500], [0, -40])
const cloudFarOpacity = useTransform(scrollY, [0, window.innerHeight * 0.72], [1, 0])
```

The far cloud layer (top 0–22% of hero) moves up 40px over 500px of scroll and fades out at 72% of the viewport height scrolled.

### 6. Cloud Near Layer Parallax

**Where:** `src/components/CloudBackground.tsx`

```typescript
const cloudNearY = useTransform(scrollY, [0, 500], [0, -80])
const cloudNearOpacity = useTransform(scrollY, [0, window.innerHeight * 0.72], [1, 0])
```

The near cloud layer moves faster (80px vs 40px) — the differential speed between far and near layers creates the 3D depth effect. Both layers fade at the same scroll threshold.

### 7. Section Reveal (Scroll-Triggered Entrance)

**Where:** `src/components/ui/SectionReveal.tsx`
**Library:** Framer Motion `whileInView`

```typescript
<motion.div
  initial={{ opacity: 0, y: 30 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true, margin: '-80px' }}
  transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1], delay }}
>
```

Every content section below the hero uses `SectionReveal`. The `margin: '-80px'` means the animation triggers 80px before the element actually enters the viewport — content appears to "meet" the user as they scroll.

`once: true` ensures elements only animate in once, never re-animate when scrolling back up.

---

## Scroll Indicator

**Where:** `src/components/Hero.tsx`

The bouncing chevron-down at the bottom of the hero:

```typescript
// Bounce animation
animate={{ y: [0, 8, 0] }}
transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}

// Opacity pulse
animate={{ opacity: [1, 0.4, 1] }}
transition={{ duration: 1.2, repeat: Infinity }}
```

Both bounce and opacity pulse share the same 1.2s duration, so they stay in sync. The element fades out via `indicatorOpacity` transform as soon as scrolling begins.

---

## Technical Notes

### `useScroll` and SSR

`useScroll` is a Framer Motion hook that reads `window.scrollY`. It is safe to use in client components (`"use client"`) — Next.js handles the SSR/hydration boundary correctly.

The `window.innerHeight` reference in `CloudBackground.tsx` is called inside `useTransform`, which runs client-side only. If a future refactor makes it SSR-incompatible, wrap it in a `useEffect` that reads `window.innerHeight` after mount.

### Performance

All scroll transforms operate on `transform` (Y translation) and `opacity`. These are GPU-composited properties — the browser does not trigger layout or paint when they change. This is why 60fps scroll animations are achievable even with multiple simultaneous transforms.

**Do not** drive scroll animations on `top`, `left`, `height`, or any layout-affecting property.

### `useTransform` Input Range

The input range `[0, 600]` means:
- At `scrollY = 0` (top of page): output is the first value
- At `scrollY = 600px`: output is the second value
- **Clamping:** Values are clamped at the boundaries by default (going past 600px doesn't go past the second output)

---

## Adding a New Scroll Effect

For a **scroll-triggered entrance** (most common case):
```tsx
<SectionReveal delay={0.1}>
  <YourComponent />
</SectionReveal>
```

For a **scroll-driven transform** (parallax, fade, etc.):
```typescript
import { useScroll, useTransform, motion } from 'framer-motion'

const { scrollY } = useScroll()
const myTransform = useTransform(scrollY, [startScroll, endScroll], [startValue, endValue])

return <motion.div style={{ y: myTransform }}>...</motion.div>
```

---

## Future Improvements

- **`prefers-reduced-motion`** — Disable parallax and section reveal animations for users who have requested reduced motion. The content should still appear; only the motion effect is suppressed.
- **Horizontal scroll sections** — A horizontal-scrolling destinations preview could use `useScroll` with `containerRef` to pin the section and drive horizontal translation.
- **Scroll-triggered counter animations** — The stat numbers (50k+, R$10M+) could count up when they first enter the viewport for additional visual impact.

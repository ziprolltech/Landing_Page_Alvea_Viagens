# Feature: Hero Section

**Components involved:**
- `src/components/Hero.tsx` — headline, CTAs, trust badges
- `src/components/CloudBackground.tsx` — sky and cloud animation
- `src/components/AviationTrail.tsx` — airplane SVG animation
- **Composed in:** `src/app/page.tsx`

**Related docs:** [animations.md](../animations.md), [design-system.md](../design-system.md)

---

## Purpose

The hero section is the **brand's single most important visual statement**. A visitor's first impression of Alvea Viagens is formed in the first second on this screen. The hero communicates:

1. **Premium quality** — through the animated sky, depth, and cinematic composition
2. **Travel and aviation** — through the airplane and clouds, before any copy is read
3. **Value proposition** — through the headline and sub-headline
4. **Trustworthiness** — through the social proof badges below the CTAs

---

## Architecture

```
src/app/page.tsx (homepage)
└── <section> min-h-screen relative overflow-hidden
    ├── <CloudBackground />     z-0  (sky, clouds, stars)
    ├── <AviationTrail />       z-10 (airplane + trail SVG)
    └── <Hero />                z-20 (all text content + CTAs)
```

The three layers are stacked via absolute positioning and z-index. CloudBackground fills the viewport; AviationTrail floats at ~260px height; Hero content is centered in the remaining space.

---

## User Flow

1. User arrives at `https://alveaviagens.com.br`
2. Animated sky renders immediately (CSS animations, no JS required for clouds)
3. Airplane enters from the left along its Bézier path (GSAP, starts 1s after mount)
4. Hero content fades and slides up in staggered sequence (Framer Motion, starts after 0.35s)
5. User reads headline, sees trust badges
6. User clicks a CTA → "Emitir Passagem" → `/atendimento` or BookingModal
7. As user scrolls down, hero parallaxes upward and fades out

---

## Technical Implementation

### Layer 1: CloudBackground

Photorealistic sky using stacked, heavily-blurred `div` elements. No images, no canvas — pure CSS. See [features/scroll-effects.md](./scroll-effects.md#cloud-parallax) for the parallax behavior.

Key visual elements:
- Photographic sky gradient (dark blue top → lighter horizon blue)
- 50+ positioned blobs with blur 28–178px, opacity 0.01–0.12
- Directional sunlight scatter (upper-right, cold blue-white)
- 45 animated stars (top 38% of hero)
- Horizon warm glow

### Layer 2: AviationTrail

SVG airplane on a GSAP MotionPath. The airplane follows a cubic Bézier curve from off-screen left to off-screen right at ~120px height within the 260px tall SVG container. See [features/animations.md](./animations.md#gsap-airplane) for full technical details.

### Layer 3: Hero Content

**Content sequence (staggered fade-up):**

```
0.35s: Eyebrow badge ("Experiência Premium em Viagens")
0.46s: H1 headline
0.57s: Decorative divider
0.68s: Subheadline
0.79s: CTA buttons
0.90s: Trust badges
```

**H1 structure:**
```jsx
<h1>
  Transformamos milhas em{' '}
  <span className="text-gold-gradient">
    experiências inesquecíveis.
  </span>
</h1>
```

The gold gradient on the emotional words is a deliberate brand pattern — white for functional words, gold for aspirational ones.

**Trust badges (4 items in a horizontal strip):**
| Icon | Stat | Label |
|---|---|---|
| Plane | 50k+ | Emissões realizadas |
| ShieldCheck | 100% | Segurança garantida |
| Star | 4.9/5 | Avaliação dos clientes |
| TrendingUp | R$10M+ | Economizados em passagens |

**Ambient orbs (decorative, pointer-events: none):**
- Left: 600×600px, sky-bright/10 blur
- Right: 480×480px, gold/8 blur
- Bottom-left: 650×650px, sky-horizon/8 blur

These blurred circles create a sense of light emanating from depth, reinforcing the 3D sky illusion.

---

## Scroll Behavior

As the user scrolls down from the hero:

| Element | Transform |
|---|---|
| Entire hero container | `scrollY 0→600` → `y 0→-18%` (parallax up) |
| H1 title | `scrollY 0→400` → `y 0→-10%` (faster parallax) |
| CTA + badges strip | `scrollY 0→300` → `opacity 1→0` (fades out first) |
| Scroll indicator chevron | `scrollY 0→120` → `opacity 1→0` (fades immediately) |
| Cloud far layer | `scrollY 0→500` → `y 0→-40px`, `opacity 1→0` at 72% scroll |
| Cloud near layer | `scrollY 0→500` → `y 0→-80px`, `opacity 1→0` at 72% scroll |

See [features/scroll-effects.md](./scroll-effects.md) for implementation details.

---

## Files Involved

| File | Role |
|---|---|
| `src/components/Hero.tsx` | Headline, CTAs, badges, orbs, scroll parallax |
| `src/components/CloudBackground.tsx` | Sky, clouds, stars |
| `src/components/AviationTrail.tsx` | GSAP airplane animation |
| `src/app/page.tsx` | Composes the three layers |
| `tailwind.config.ts` | Cloud float animations, star twinkle |
| `src/app/globals.css` | `planeFly` keyframe (secondary SVG fade effect) |

---

## Dependencies

- **Framer Motion** — Hero entry animations, scroll transforms, cloud parallax
- **GSAP + MotionPathPlugin** — Airplane path animation
- **Lucide React** — Sparkles, Star, ChevronDown, Plane, Award, ShieldCheck icons

---

## Critical Rules

These elements must NEVER be removed or simplified without explicit instruction:
- `CloudBackground` component (the animated sky)
- `AviationTrail` component (the airplane)
- Scroll parallax on the hero container and headline
- The staggered entry animation sequence
- The 4 trust badges
- Gold gradient on the emotional words in the H1

See [ai-context.md](../ai-context.md#what-must-never-be-changed-without-explicit-instruction) for the full list.

---

## Future Improvements

- **`prefers-reduced-motion`** — Disable cloud float, airplane motion, and parallax for users who have requested reduced motion in their OS settings. The content should still be visible; only the motion would be suppressed.
- **Video background option** — A short looping aerial video could replace the CSS cloud simulation for an even more cinematic effect (with the CSS version as a fallback).
- **Mobile-specific parallax tuning** — On touch devices, scroll parallax can sometimes feel sluggish. Consider reducing or disabling the Y transform on mobile.

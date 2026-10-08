# Feature: Logo System

**Related docs:** [branding.md](../branding.md), [assets.md](../assets.md)

---

## Purpose

The logo system provides consistent brand identity across all three visual contexts where the logo appears: the navigation bar, the footer, and the homepage brand showcase. Three separate image files exist because each context demands different proportions and sizes.

---

## The Three Logos

### 1. `logo-navbar.png` — Navigation Logo

| Property | Value |
|---|---|
| File | `public/logo-navbar.png` |
| Dimensions | 152 × 68 px |
| Component | `src/components/Navbar.tsx` |
| Position | Top-left of the fixed navigation bar |
| Context | Appears on every page, always visible |

**Usage in Navbar:**
```tsx
<Image
  src="/logo-navbar.png"
  alt="Alvea Viagens"
  width={152}
  height={68}
  priority  // Load eagerly — it's in the initial viewport
/>
```

The logo links to `/` (homepage). On mobile, this same logo appears at the top of the slide-out drawer.

**Sizing rationale:** At 152×68, it is compact enough to sit in the navbar without dominating it, but large enough to be readable at all sizes.

### 2. `logo-footer.png` — Footer Logo

| Property | Value |
|---|---|
| File | `public/logo-footer.png` |
| Dimensions | 192 × 96 px |
| Component | `src/components/layout/Footer.tsx` |
| Position | Left column of the footer |
| Context | Bottom of every page |

**Usage in Footer:**
```tsx
<Image
  src="/logo-footer.png"
  alt="Alvea Viagens"
  width={192}
  height={96}
/>
```

The footer logo is wider than the navbar logo — the footer column has more horizontal space and the logo should feel anchored and substantial as the final brand impression.

### 3. `logo.png` — Hero Brand Image

| Property | Value |
|---|---|
| File | `public/logo.png` |
| Dimensions | 600 × 660 px |
| Component | `src/components/LogoHeroBanner.tsx` |
| Position | Right column of the "Quem Somos" section on the homepage |
| Context | Large brand showcase, appears once |

**Usage in LogoHeroBanner:**
```tsx
<Image
  src="/logo.png"
  alt="Alvea Viagens"
  width={600}
  height={660}
  className="object-contain"
/>
```

This is the full brand mark at large scale. It is not a navigation element — it is a visual centerpiece for the brand story section. Overlays are applied (dark tint, vignette, inner border) to integrate it with the dark background.

---

## Architecture: LogoHeroBanner

`src/components/LogoHeroBanner.tsx` wraps the hero logo with atmospheric framing:

```
<div> (relative, rounded-3xl, overflow-hidden, border + shadow)
  <Image src="/logo.png" ... />
  <div> overlay: atmosphere tint (top 60%) </div>
  <div> overlay: bottom vignette (bottom 25%) </div>
  {/* Inner border via box-shadow: inset */}
</div>
```

The framing creates the appearance of a premium print or framed photograph, suitable for the luxury brand positioning.

---

## Placement Rules

| Context | Logo File | Never substitute |
|---|---|---|
| Navigation | `logo-navbar.png` | Do not use `logo.png` (too large) or `logo-footer.png` (wrong proportions) |
| Footer | `logo-footer.png` | Do not use `logo-navbar.png` (too small for footer column) |
| Brand showcase | `logo.png` | Do not use either small logo (insufficient quality at display size) |

---

## Technical Rules

1. **Always use `next/image` (`Image` component).** Never raw `<img>` tags — the optimizer handles format, lazy loading, and srcset.
2. **Always specify `width` and `height`** matching the file's native dimensions. This prevents layout shift (CLS).
3. **Use `priority` on the navbar logo** — it is in the initial viewport on every page load.
4. **Do not scale logos beyond native dimensions** — PNG logos are not vector; scaling up causes pixelation.
5. **Do not apply CSS filters or color transforms** to logo files — the logos are designed for dark backgrounds as-is.

---

## Modifying Logos

If the brand logo is redesigned:
1. Replace the file(s) in `public/`
2. If new dimensions differ, update `width` and `height` in the `Image` components
3. Check that the new logo still reads well on dark backgrounds (the site has no light sections)
4. Test at 1x and 2x display densities (Next.js Image handles DPI automatically)

If only one logo variant needs updating (e.g., the footer logo gets a new layout), replace only that file. The three logos are independent assets.

---

## Future: SVG Logos

If the brand ever produces SVG versions of the logo:
- SVG logos can be inlined as React components (no `<img>` or `next/image` needed)
- SVG scales infinitely without pixelation
- Color can be controlled via CSS (useful for future light mode if ever required)

This would be a branding-level change requiring the logo files to be rebuilt in vector format.

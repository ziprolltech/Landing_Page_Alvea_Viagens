# Assets

---

## Local Assets (`public/`)

All files in `public/` are served at the root URL path by Next.js. Example: `public/logo.png` is accessible at `/logo.png`.

### Logo Files

| File | Path | Dimensions | Used In |
|---|---|---|---|
| `logo.png` | `public/logo.png` | 600 × 660 px | `LogoHeroBanner.tsx` |
| `logo-navbar.png` | `public/logo-navbar.png` | 152 × 68 px | `Navbar.tsx` |
| `logo-footer.png` | `public/logo-footer.png` | 192 × 96 px | `Footer.tsx` |

See [branding.md](./branding.md) for full usage rules.

**Format:** PNG with transparency (assumed — logos on dark backgrounds require transparency).
**Do not compress** these files without checking the result — logo quality is critical.

---

## External Images

### Destination Photos

All destination card images come from **Unsplash** (`images.unsplash.com`).

**Example URL format:**
```
https://images.unsplash.com/photo-1525874684015-58379d421a52?auto=format&fit=crop&w=800&q=80
```

Key query parameters:
- `auto=format` — Unsplash selects the best format (WebP where supported)
- `fit=crop` — Crops the image to fill the specified dimensions
- `w=800` — Limits width to 800px for performance
- `q=80` — 80% quality (good balance of size and quality)

**Why Unsplash:** Free, high-quality photography for commercial use under the Unsplash license. No attribution required for web use.

**Configuration:** `next.config.ts` includes `images.unsplash.com` in the `remotePatterns` allowlist so Next.js can optimize these images:

```typescript
images: {
  remotePatterns: [
    {
      protocol: 'https',
      hostname: 'images.unsplash.com',
    },
  ],
},
```

Adding images from any other external domain requires adding it to `remotePatterns` first.

---

## Font Assets

**Font:** Inter (Google Fonts)
**Loaded via:** `next/font/google` in `src/app/layout.tsx`
**Weights loaded:** 300, 400, 500, 600, 700, 800, 900
**Subsets:** Latin (covers all Portuguese characters)
**CSS variable:** `--font-inter`

Next.js automatically downloads and self-hosts the font for performance (no external font CDN request at runtime).

---

## SVG Assets (Inline)

There are no standalone `.svg` files in `public/`. SVG content is used in two places:

1. **`AviationTrail.tsx`** — The airplane SVG and its motion path are defined inline as JSX within the component.
2. **`lucide-react` icons** — All icons throughout the site are rendered as inline SVG via the Lucide React library. No icon files need to be managed.

---

## CSS Assets

| File | Path | Purpose |
|---|---|---|
| `globals.css` | `src/app/globals.css` | Global styles, CSS variables, keyframes, utility classes |

No other standalone CSS files. All other styling uses Tailwind utility classes applied directly in JSX.

---

## Build Output Assets

After running `npm run build`, Next.js generates:
- `.next/` — Compiled output (do not edit or commit this)
- Optimized image variants (WebP/AVIF) cached in `.next/cache/images/`
- Static chunks and pages in `.next/static/`

---

## Asset Checklist for New Features

When adding new images, icons, or media to the project:

- [ ] **Local images** → place in `public/`, reference as `/filename.ext`
- [ ] **Remote images** → add domain to `next.config.ts` `remotePatterns`
- [ ] **All images** → use `next/image` component, specify `width` and `height`
- [ ] **Icons** → use `lucide-react`. Check if the icon exists there before considering alternatives.
- [ ] **Fonts** → use `next/font/google`. Do not add `<link>` tags to `layout.tsx`.
- [ ] **SVG illustrations** → define inline in the component or as a `.tsx` component file; avoid `.svg` files in `public/`.

# Branding

---

## Brand Identity Summary

**Name:** Alvea Viagens
**Positioning:** Premium Brazilian travel agency specializing in miles and airline tickets
**Tagline:** "Transformamos milhas em experiências inesquecíveis"
**Language:** Portuguese (pt-BR)
**Tone:** Professional, aspirational, trustworthy. Never sales-aggressive.

---

## Logo Files

There are three logo files in the project, each serving a specific context.

### `logo.png` — Brand Hero Image
- **Location:** `public/logo.png`
- **Dimensions:** 600 × 660 px
- **Usage:** Homepage "Quem Somos" section (right column of brand showcase)
- **Component:** `LogoHeroBanner.tsx`
- **Role:** Large, prominent brand presence. Displayed with atmospheric overlays (dark tint, vignette, premium inner border).
- **Do NOT use** this image in the navbar or footer — it is too large and not proportioned for inline use.

### `logo-navbar.png` — Navigation Logo
- **Location:** `public/logo-navbar.png`
- **Dimensions:** 152 × 68 px
- **Usage:** `Navbar.tsx` — displayed in the top-left of the fixed navigation bar.
- **Size on desktop:** `width={152} height={68}`
- **Size on mobile:** Same (drawer also uses this logo)
- **Do NOT scale up** beyond its native dimensions — pixelation will occur.

### `logo-footer.png` — Footer Logo
- **Location:** `public/logo-footer.png`
- **Dimensions:** 192 × 96 px
- **Usage:** `Footer.tsx` — left column of the footer.
- **Size:** `width={192} height={96}`
- **Do NOT substitute** with the navbar logo — footer logo has different proportions optimized for the wider footer context.

---

## Logo Usage Rules

1. **Never modify the logo files.** No filters, no color overlays, no cropping, no stretching.
2. **Always use the correct logo for its context.** Navbar → navbar logo. Footer → footer logo. Hero showcase → main logo.
3. **Always use `next/image` (`Image` component)** when displaying logos. Never raw `<img>` tags.
4. **Maintain aspect ratios.** Always specify both `width` and `height` props that match the file's native dimensions.
5. **Logo on dark backgrounds only.** The brand palette is dark-first. The logos are designed for dark backgrounds. Do not place them on light or white backgrounds without checking with the brand owner.

---

## Brand Colors

The full color system is documented in [design-system.md](./design-system.md). The core brand identity colors are:

| Role | Color | Hex |
|---|---|---|
| Primary accent | Gold | `#D4A853` |
| Background | Sky deep | `#050D1A` |
| Background (mid) | Sky dark | `#0A1628` |
| Text | White | `#FFFFFF` |
| Secondary text | White/52 | `rgba(255,255,255,0.52)` |

Gold is the brand's signature accent. It communicates premium quality, trust, and warmth. It appears consistently on: buttons, active navigation states, card hover borders, text highlights, the animated glow on CTAs, and the airplane trail.

---

## Typography as Brand Identity

The brand uses **Inter** exclusively. Weight variation within Inter creates the visual hierarchy:

- **900 (Black):** Hero headlines, section titles — commands attention
- **600–700 (Semibold/Bold):** Card titles, button labels — readable authority
- **300–400 (Light/Regular):** Body text, subtitles — approachable, not loud

The tagline "Transformamos milhas em experiências inesquecíveis" always appears with:
- "milhas" in gold gradient text
- "experiências inesquecíveis" in gold gradient text
- "Transformamos" in white

This pattern of gold-on-dark for emotionally significant words is a consistent brand pattern across the site.

---

## Hero Section as Brand Statement

The homepage hero is the most important brand expression. It must:
1. Show the animated sky scene (clouds + airplane) — communicates travel and aviation.
2. Display the headline at full scale — never truncated.
3. Show the trust badges below the CTA — credibility indicators.
4. Feel premium and unhurried — animations should never be rushed or janky.

**Do not** redesign the hero section without explicit client approval. It is the primary brand impression.

---

## Premium Positioning Rules

These rules apply to all future UI work:

- **No flat design.** Glassmorphism, gradients, and depth are intentional brand features, not decorative extras.
- **No light backgrounds.** The brand palette is entirely dark. Any light-background sections would break the immersive sky aesthetic.
- **Gold is reserved for emphasis.** Don't use gold for every text element — it loses meaning. Gold = important, actionable, premium.
- **Generous whitespace.** Crowded layouts undermine the premium feel. When in doubt, add more padding.
- **Smooth over fast.** Animations should ease in and out gracefully. Snappy is good; abrupt is not.
- **Language is always Portuguese (pt-BR).** Never mix English labels into the UI.

---

## Social Proof as Brand Element

The following trust statistics appear on the homepage and should be kept consistent across any copy:

| Stat | Value |
|---|---|
| Tickets emitted | 50.000+ |
| Customer satisfaction | 98% |
| Destinations served | 120+ |
| Client savings | R$10M+ |
| Miles negotiated | 100k+ |

These are marketing claims. Do not change them without confirmation from the business owner.

---

## Tagline Variants

| Context | Tagline |
|---|---|
| Primary (headline/H1) | "Transformamos milhas em experiências inesquecíveis." |
| Short (navbar, tabs) | "Experiência Premium em Viagens" |
| Footer | "Transformamos milhas em experiências inesquecíveis" (without period) |
| Page `<title>` | "Alvea Viagens — Transformamos Milhas em Experiências Inesquecíveis" |

---

## Contact Information (Canonical)

These values appear in multiple places (Footer, Atendimento page, WhatsApp links). Keep them synchronized:

| Field | Value |
|---|---|
| WhatsApp number | `5516997315748` (for `wa.me/` links) |
| WhatsApp display | `+55 (16) 99731-5748` |
| Email | `alveaviagens@gmail.com` |
| Business hours | `Seg–Sex, 9h às 18h` |

If the contact information changes, update it in:
1. `src/components/layout/Footer.tsx`
2. `src/app/atendimento/page.tsx`
3. `src/components/booking/BookingModal.tsx` (WhatsApp URL in results)

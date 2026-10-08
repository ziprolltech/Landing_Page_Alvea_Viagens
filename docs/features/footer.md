# Feature: Footer

**Component:** `src/components/layout/Footer.tsx`
**Rendered in:** `src/app/layout.tsx`
**Related docs:** [branding.md](../branding.md), [integrations.md](../integrations.md)

---

## Purpose

The footer is the site's persistent contact anchor. It provides:
- Brand identity reinforcement (logo + tagline)
- Quick navigation to all pages
- Direct contact channels (WhatsApp, email, business hours)
- Social presence (Instagram, WhatsApp, Email icons)

It is the last element a user sees before leaving the page — a final conversion opportunity via the WhatsApp and email links.

---

## Architecture

```
layout.tsx
└── <footer> glass effect, border-top gold/12
    └── <div> max-w-7xl centered grid
        ├── Column 1: Brand
        │   ├── Logo (logo-footer.png)
        │   ├── Tagline
        │   └── Copyright (dynamic year)
        ├── Column 2: Navigation
        │   └── 5 page links
        └── Column 3: Contact
            ├── Email (mailto: link)
            ├── WhatsApp (wa.me/ link)
            ├── Business hours
            └── Social icons row
```

**Grid:** `grid-cols-1 md:grid-cols-3` — stacks vertically on mobile, 3 columns on desktop.

---

## Technical Implementation

### Dynamic Copyright Year

```typescript
© {new Date().getFullYear()} Alvea Viagens
```

The year updates automatically on each render — no manual update needed annually.

### Social Icons

Three icons with hover tooltips:
- **Instagram** → external link (opens in new tab)
- **WhatsApp** → `wa.me/5516997315748` (opens in new tab)
- **Email** → `mailto:alveaviagens@gmail.com`

Each icon has a hover state: `text-white/40 → text-gold` transition.
Tooltips appear on hover via a pseudo-element or absolute-positioned span (confirm exact implementation in the source).

### Glass Effect

```css
/* Applied to <footer> */
backdrop-filter: blur(12px);
background: rgba(5, 13, 26, 0.8);  /* sky-deep/80 */
border-top: 1px solid rgba(212, 168, 83, 0.12);  /* gold/12 */
```

The gold-tinted top border creates visual continuity with the gold accent system above.

---

## Files Involved

| File | Role |
|---|---|
| `src/components/layout/Footer.tsx` | The component |
| `src/app/layout.tsx` | Renders Footer after page content |
| `public/logo-footer.png` | Footer logo (192×96) |

---

## Canonical Contact Information

The footer displays:

| Field | Value |
|---|---|
| Email | `alveaviagens@gmail.com` |
| WhatsApp | `+55 (16) 99731-5748` |
| Business Hours | `Seg–Sex, 9h às 18h` |

**These values must stay synchronized** with `src/app/atendimento/page.tsx` and `src/components/booking/BookingModal.tsx`. If contact information changes, update all three files. See [branding.md](../branding.md#contact-information-canonical).

---

## Future Improvements

- **Newsletter signup** — A small email capture field in the footer (Mailchimp or similar) for sending travel deals.
- **Trust badges row** — Small icons for payment methods, security seals, or partner airlines above the copyright line.
- **Back-to-top button** — A small arrow in the bottom-right corner that scrolls the user back to the top (visible after scrolling down 500px+).

---

## Maintenance Notes

- The footer is a **server component** (no `"use client"` directive). Keep it that way — it has no state or browser APIs.
- The footer logo (`logo-footer.png`, 192×96) is larger than the navbar logo. Do not substitute one for the other.
- All external links (`target="_blank"`) must include `rel="noopener noreferrer"` for security.

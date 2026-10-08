# Feature: Navbar

**Component:** `src/components/Navbar.tsx`
**Rendered in:** `src/app/layout.tsx`
**Related docs:** [components.md](../components.md#navbartsx)

---

## Purpose

The navbar provides primary navigation and persistent access to the main CTA ("Falar com Especialista") on every page. It is the user's primary orientation tool and the secondary conversion touchpoint (the hero's CTAs are primary).

---

## Architecture

```
layout.tsx (server component)
└── <header> fixed top-0 w-full z-50
    ├── Logo (next/image, links to /)
    ├── Desktop nav links (hidden on mobile)
    ├── Desktop CTA button (hidden on mobile)
    ├── Mobile hamburger button (visible on mobile only)
    └── Mobile drawer (AnimatePresence → right-slide panel)
        ├── Drawer close button (X)
        ├── Logo
        └── Nav links (staggered animation)
        └── Mobile CTA button
```

---

## User Flow

### Desktop
1. User sees logo (left), nav links (center), CTA (right) on all pages
2. Active page link has a gold animated underline indicator
3. On scroll > 24px: navbar gains glass backdrop blur and gold-tinted bottom border
4. CTA click → `/atendimento`

### Mobile
1. Hamburger icon replaces the nav links + CTA
2. User taps hamburger → drawer slides in from the right (full-height overlay)
3. Backdrop dims the page behind the drawer
4. User taps a link → navigates, drawer closes automatically
5. User taps X or the backdrop → drawer closes

---

## Technical Implementation

### Scroll Detection

```typescript
const [scrolled, setScrolled] = useState(false)

useEffect(() => {
  const handleScroll = () => setScrolled(window.scrollY > 24)
  window.addEventListener('scroll', handleScroll, { passive: true })
  return () => window.removeEventListener('scroll', handleScroll)
}, [])
```

The `{ passive: true }` option is important for scroll performance — it tells the browser the handler won't call `preventDefault()`, allowing the browser to optimize scroll handling.

### Conditional Styling

```typescript
className={cn(
  'fixed top-0 w-full z-50 transition-all duration-300',
  scrolled
    ? 'bg-sky-deep/80 backdrop-blur-xl border-b border-gold/12'
    : 'bg-transparent'
)}
```

On transparent (top of page): no background — the hero sky is fully visible through the navbar area.

On scrolled: glass effect appears — dark semi-transparent background + backdrop blur + subtle gold bottom border.

### Active Route Detection

```typescript
const pathname = usePathname()

// Applied to each nav link:
const isActive = pathname === link.href
```

Active link styling:
- Desktop: Gold gradient underline via `.nav-link-underline` CSS class + `scale-x` animation
- Mobile: Gold background highlight on the link

### Mobile Drawer

```typescript
const [open, setOpen] = useState(false)
```

Framer Motion `AnimatePresence` handles mount/unmount:

**Backdrop:** `opacity: 0 → 0.5` (dark overlay over page content)
**Drawer panel:** `x: '100%' → 0` (slides in from the right, duration 0.35s)
**Nav links:** Staggered `opacity: 0 → 1, y: +12 → 0`, 0.06s between items

Closing: `open = false` → AnimatePresence triggers exit animations → components unmount.

Auto-close on navigation: A `useEffect` watches `pathname` and sets `open = false` whenever the route changes.

---

## Files Involved

| File | Role |
|---|---|
| `src/components/Navbar.tsx` | The component |
| `src/app/layout.tsx` | Renders the Navbar inside the fixed shell |
| `src/app/globals.css` | `.nav-link-underline` animated underline class |
| `public/logo-navbar.png` | Logo image (152×68) |

---

## Dependencies

- **Framer Motion** — mobile drawer animation, staggered nav links
- **next/navigation** (`usePathname`) — active route detection
- **next/image** (`Image`) — logo rendering
- **next/link** (`Link`) — navigation links
- **Lucide React** — Menu (hamburger), X (close), Phone (CTA icon)

---

## Navigation Links

| Label | Route |
|---|---|
| Início | `/` |
| Destinos | `/destinos` |
| Milhas | `/milhas` |
| Passagens | `/passagens` |
| Atendimento | `/atendimento` |

To add a new page to navigation, add an entry to the `navLinks` array in `Navbar.tsx` and create the corresponding `src/app/[slug]/page.tsx`.

---

## Future Improvements

- **Mega menu for Destinos** — On hover, show continent links and featured destinations as a dropdown panel.
- **Announcement bar** — A thin banner above the navbar for promotions ("Passagens para Europa com 40% off neste mês").
- **Sticky CTA on mobile** — A fixed bottom bar with the WhatsApp button for mobile users who don't scroll back up to tap the nav CTA.

---

## Maintenance Notes

- The navbar is a client component (`"use client"`) because it uses `usePathname`, `useState`, and `useEffect`. This is correct and intentional.
- The logo uses `width={152} height={68}` — do not change these values without checking that the new dimensions match the actual image file, or pixelation will occur.
- Do not remove the `{ passive: true }` option from the scroll listener — it is a performance optimization.
- The z-index is 50 (`z-50` = Tailwind's 9999 equivalent in the stacking context). The BookingModal is at 9999 to appear above the navbar when open.

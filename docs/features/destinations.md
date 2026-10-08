# Feature: Destinations

**Page:** `src/app/destinos/page.tsx`
**Related docs:** [destinations.md](../destinations.md), [booking-flow.md](../booking-flow.md)

---

## Purpose

The destinations page is the **product showcase** — it presents the travel experiences Alvea Viagens can arrange, organized by continent. Each destination card is a visual conversion touchpoint: clicking opens the booking modal.

---

## Architecture

```
destinos/page.tsx
    ↓
destinationsData (typed constant, inline)
    ↓
Rendered as continent sections (5 sections)
    ↓
Each section: SectionReveal > grid > DestinationCard (JSX inline, not a component)
    ↓
User clicks card
    ↓
selectedDestination state → <BookingModal />
```

Destination cards are rendered as inline JSX inside the page component, not as a separate `DestinationCard` component. This was a deliberate simplicity choice — the card markup is not reused elsewhere.

---

## User Flow

1. User navigates to `/destinos`
2. Page header animates in via page transition (`template.tsx`)
3. Continent sections reveal as user scrolls (`SectionReveal`)
4. User browses cards — hover reveals miles estimate and arrow
5. User clicks a card → `selectedDestination` state updates
6. `BookingModal` renders with destination pre-filled
7. User completes booking flow → WhatsApp conversion

---

## Technical Implementation

### Data Structure

```typescript
type Destination = {
  name:    string   // City name
  country: string   // Country name  
  desc:    string   // One-sentence attraction description
  miles:   string   // Human-readable estimate (e.g., "28.000 milhas")
  photo:   string   // Unsplash URL
  color:   string   // Tailwind gradient string for card overlay
}
```

Data is organized in 5 arrays, one per continent:
```typescript
const europa: Destination[] = [...]
const america: Destination[] = [...]
const asia: Destination[] = [...]
const orienteMedio: Destination[] = [...]
const oceania: Destination[] = [...]
```

### Card Hover Behavior

Each card uses Tailwind `group` + `group-hover:` utilities:
- Photo: `group-hover:scale-110 transition-transform duration-500`
- Miles badge: `group-hover:opacity-100 opacity-0 transition-opacity`
- Arrow icon: `group-hover:translate-x-1 transition-transform`
- Card border: `group-hover:border-gold/40`

No JavaScript or Framer Motion is used for the card hover — pure CSS transitions via Tailwind.

### Modal Integration

```typescript
const [selectedDestination, setSelectedDestination] = useState<DestinationForModal | null>(null)

// DestinationForModal is a subset of Destination:
type DestinationForModal = {
  name: string
  country: string
  photo: string
}
```

The modal only needs name, country, and photo — it does not receive `miles`, `desc`, or `color` since those are display-only on the card.

### Continent Section Headers

Each continent has a visual divider:
```
────────── • EUROPA • ──────────
```
The dot and dashes are decorative spans with gold color. The pattern is consistent across all 5 continents.

### Scroll Animation

Each continent section wraps its cards in `SectionReveal` with staggered delays. Cards within a row reveal with 0.1s intervals, creating a cascade left-to-right effect.

---

## Files Involved

| File | Role |
|---|---|
| `src/app/destinos/page.tsx` | Page, data, card rendering, modal trigger |
| `src/components/booking/BookingModal.tsx` | Opens on card click |
| `src/components/ui/SectionReveal.tsx` | Scroll-reveal animation |
| `src/components/ui/PageHeader.tsx` | Page hero header |

---

## Adding a New Destination

1. Open `src/app/destinos/page.tsx`
2. Find the correct continent array
3. Add an entry:
```typescript
{
  name:    "Florença",
  country: "Itália",
  desc:    "Arte renascentista e culinária italiana no coração da Toscana.",
  miles:   "32.000 milhas",
  photo:   "https://images.unsplash.com/photo-XXXXXXXX?auto=format&fit=crop&w=800&q=80",
  color:   "from-amber-900/70 to-orange-800/50",
}
```
4. Choose a complementary Unsplash photo (search by city name at unsplash.com, copy the photo URL)
5. Choose a `color` gradient that matches the photo's dominant tones
6. **Update the destination count** in [destinations.md](../destinations.md) if the total changes significantly

---

## Future Improvements

- **Add `iataCode` field** to `Destination` type (required for Duffel API integration)
- **Extract to `src/data/destinations.ts`** — moves data out of the page component for cleaner separation
- **Filter by continent** — Tab bar at the top to jump to a continent section
- **Search by name** — Free-text filter within the page
- **Budget filter** — Filter by miles range (economy / business / first class estimates)

---

## Maintenance Notes

- All destination photos come from Unsplash. The `next.config.ts` allowlist only permits `images.unsplash.com` — do not use images from other domains without updating the config.
- The `miles` field is a display string only. It is NOT used in any calculation. It is shown on the card and can be updated at any time without affecting the booking flow.
- The `color` field must be a valid Tailwind gradient class. If using non-standard shades, ensure they exist in the Tailwind config or use the inline style approach.
- The `desc` field should be kept to one sentence — card layout is not designed for longer descriptions.

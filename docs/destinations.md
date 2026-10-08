# Destinations

---

## Overview

The destinations system is the primary product showcase of Alvea Viagens. It presents 25+ international destinations organized by continent, each with a photo, description, and estimated miles requirement. Every destination card is a conversion touchpoint — clicking opens the booking modal.

---

## Data Structure

Destination data is defined as a typed constant array inside `src/app/destinos/page.tsx`. It is not fetched from an API.

```typescript
type Destination = {
  name:    string   // City name (e.g., "Paris")
  country: string   // Country name (e.g., "França")
  desc:    string   // One-sentence description of the destination
  miles:   string   // Estimated miles range (e.g., "28.000 milhas")
  photo:   string   // Unsplash image URL
  color:   string   // Tailwind gradient class applied as overlay on card hover
}
```

All destination data is hardcoded at build time. To add a destination, add an entry to the relevant continent array directly in `destinos/page.tsx`.

---

## Continent Organization

The page renders 5 continent sections in this order:

| Section | Key Destinations |
|---|---|
| **Europa** | Lisboa, Paris, Roma, Londres, Barcelona, Amsterdã, Madri, Milão, Praga, Viena, Atenas, Berlim, Zurique, Budapeste, Dubrovnik, Santorini, Edimburgo, Bruxelas, Estocolmo |
| **América** | Nova York, Miami, Orlando, Los Angeles, Toronto, Cancún, Cartagena, Buenos Aires, Santiago, Bogotá, Punta Cana, Havana |
| **Ásia** | Tóquio, Bangcoc, Singapura, Bali, Seul, Hong Kong, Maldivas, Pequim, Kuala Lumpur |
| **Oriente Médio** | Dubai, Doha, Abu Dhabi, Istambul, Tel Aviv |
| **Oceania** | Sydney, Melbourne, Auckland, Cairns |

---

## Destination Card Behavior

### Default State
- Photo fills the card (`object-cover`, fixed height ~280px)
- Gradient overlay at bottom reveals city name and country
- Soft box shadow
- Cursor: pointer

### Hover State
- Photo scales up: `transform: scale(1.1)` (transition 0.5s)
- Miles estimate appears from the bottom (fade-in + slide-up)
- Gold arrow icon appears to the right of the city name
- Card border highlights with a subtle gold glow

### Click
- `setSelectedDestination(destination)` updates page state
- This triggers conditional render: `{selectedDestination && <BookingModal ... />}`
- Modal opens with the destination's name, country, and photo pre-loaded

### Animation on Scroll
- Each continent section's cards use `SectionReveal` with staggered delays
- Cards in a row appear one after another (0.1s stagger per card)
- Cards only animate once (won't re-animate on scroll-up)

---

## Continent Section Layout

Each continent is rendered as a section with:

1. **Section header:** Continent name with decorative horizontal lines and a gold dot
2. **Destination grid:** Responsive grid of cards
   - Mobile: 1 column
   - sm: 2 columns
   - lg: 3 columns
   - xl: 4 columns

---

## BookingModal Integration

When a destination is selected:

```
User clicks card
      ↓
selectedDestination state set to { name, country, photo }
      ↓
BookingModal renders with destination pre-filled as the target
      ↓
User completes 5 booking steps
      ↓
"Falar no WhatsApp" button generates pre-filled WhatsApp message
      ↓
WhatsApp opens: wa.me/5516997315748?text=...
```

When modal closes:
- `onClose` callback sets `selectedDestination` to `null`
- Modal unmounts via `AnimatePresence`
- Body scroll is restored

---

## Images

All destination photos are sourced from **Unsplash** (`images.unsplash.com`). They are specified as direct Unsplash URLs in the data array and rendered via Next.js `<Image>` component.

`next.config.ts` explicitly allows `images.unsplash.com` as a remote image pattern.

**Important:** Unsplash URLs include query parameters (width, format, quality). These are optimized by Next.js at build/request time. Do not change the image URLs without testing that Next.js can still optimize them.

---

## Miles Estimates

The `miles` field is a human-readable string, not a number. Examples:
- `"28.000 milhas"` (Lisboa)
- `"45.000 milhas"` (Dubai)
- `"85.000 milhas"` (Tóquio)

These are **approximate estimates** displayed for inspiration, not real-time pricing. The actual miles cost is determined by the specialist after the WhatsApp conversation.

---

## Future: Real Destination Data

When the Duffel API or equivalent is integrated:
- The destination cards could show live price/miles estimates
- Cards could link directly to a real search result
- A search/filter bar (by continent, budget, miles range) could be added

The data structure would evolve from the current static array to an API response, but the card UI should remain unchanged.

---

## Adding a New Destination

1. Open `src/app/destinos/page.tsx`
2. Find the relevant continent array
3. Add an entry following the `Destination` type:
```typescript
{
  name:    "Nome da Cidade",
  country: "País",
  desc:    "Uma frase descrevendo a experiência.",
  miles:   "35.000 milhas",
  photo:   "https://images.unsplash.com/photo-XXXXXXXX?auto=format&fit=crop&w=800&q=80",
  color:   "from-blue-900/80 to-purple-900/60",  // Tailwind gradient for overlay
}
```
4. Find a suitable Unsplash photo and use its direct URL with `auto=format&fit=crop&w=800&q=80` params.
5. Choose a `color` gradient that complements the photo's tones.

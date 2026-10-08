# Feature: Airport Autocomplete

**Component:** `src/components/booking/AirportAutocomplete.tsx`
**Used in:** `src/components/booking/BookingModal.tsx` (Step 1)
**Related docs:** [components.md](../components.md#bookingairportautocompletetsx), [known-issues.md](../known-issues.md)


> **Updated 2026-10-08 — complete airport base.** The autocomplete no longer searches the 145 hand-written airports only. It searches **8,506 airports worldwide**, from a local file. The sections below this note describe the earlier version where they differ.
>
> | | |
> |---|---|
> | Base | `src/data/airports-world.json` — generated, do not edit by hand |
> | Generator | `node scripts/build-airports.mjs [airports.csv]` (downloads the source if no file is given) |
> | Source | OurAirports — https://ourairports.com/data/ — public domain |
> | Included | Open airports (large, medium, small) with a valid, unique IATA code, a name and a city. Left out: closed airports, heliports, seaplane bases, balloon ports, records without IATA, and unscheduled airports with no city |
> | Fields | IATA, airport name, city, country (Portuguese), ICAO (7,524 of them), search aliases |
> | Portuguese | Countries from the ISO code; the 145 airports in `src/data/airports.ts` keep their hand-written names; well-known cities are translated ("London" → "Londres"); names ending in "International/Regional/Municipal Airport" are put in Portuguese word order. Everything else reads as in the source |
> | Loading | A separate chunk (≈170 kB gzipped) fetched once **from this site** when the field first appears. `/destinos` itself grew by 1 kB. Until the chunk arrives the field answers from the hand-written list |
> | Network | No request per search; no external service. The source is contacted only when someone runs the generator |
>
> **Search order** (best tier wins; within a tier, busiest airports first; 8 results shown):
> 0 exact IATA · 1 IATA starts with, or city code ("LON", "PAR", "NYC", "SAO" …) · 2 city starts with · 3 airport name starts with (ignoring "Aeroporto …"), or the city in another spelling ("london", "tokyo") · 4 city contains · 5 name contains · 6–7 country · fuzzy (Fuse.js) only when nothing matched.
>
> To change how an airport reads, edit or add it in `src/data/airports.ts` and run the generator. To refresh the whole base, run the generator.

---

## Purpose

An accent-insensitive, instant airport search input that allows users to find airports by IATA code, city name, or airport name. Designed to work correctly for Brazilian users who frequently type without accent marks on mobile devices.

---

## Architecture

The component is a **controlled input** — it receives `value` and `onChange` as props. All search logic is self-contained.

```
User types
    ↓
Input triggers onChange handler
    ↓
Search pipeline runs (6 deterministic tiers + Fuse.js fallback)
    ↓
Top 7 results stored in state
    ↓
Dropdown rendered via ReactDOM.createPortal to document.body
    ↓
User selects result → onChange called with "City (CODE)" format
```

---

## User Flow

1. User clicks the origin airport input field in Step 1 of BookingModal
2. Component renders with an empty input and focus immediately
3. User types any part of a city name, airport name, or IATA code
4. Dropdown appears below the input showing up to 7 matches
5. Each result shows: gold IATA badge | airport name | city, country
6. User clicks (or taps) a result
7. Input is populated with "City Name (IATA)" format
8. Dropdown closes
9. BookingModal advances to Step 2 on user clicking "Próximo"

---

## Technical Implementation

### Normalization

Every string comparison is accent-insensitive. The normalization function:

```typescript
const normalize = (s: string) =>
  s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
```

This converts "São Paulo" → "sao paulo", "Ribeirão Preto" → "ribeirao preto", allowing users to type without accents and still find correct results.

Pre-normalized fields are computed for each airport entry and stored alongside the original data to avoid re-normalizing on every keystroke.

### Tiered Search Algorithm

```
Tier 0: normalizedCode === query          (exact IATA: "gru" → GRU only)
Tier 1: normalizedCode.startsWith(query)  (prefix IATA: "gr" → GRU)
Tier 2: normalizedCity.startsWith(query)  (city prefix: "sao" → GRU, VCP, CGH...)
Tier 3: normalizedAirport.startsWith(query) (airport prefix: "guard" → GRU)
Tier 4: normalizedCity.includes(query)    (city contains: "de janeiro" → GIG, SDU)
Tier 5: normalizedAirport.includes(query) (airport name contains: "guarulhos" → GRU)
Tier 6: Fuse.js fuzzy                     (only when tiers 0–5 return 0 results)
```

Results from the first non-empty tier are used. If Tier 2 returns results, Tiers 3–6 are not evaluated.

**Why this order matters:** Deterministic tiers produce predictable, sorted results. "Rio" in Tier 2 (city startsWith) immediately returns GIG and SDU in the expected order without Fuse.js's scoring ambiguity.

### Fuse.js Configuration

```javascript
{
  keys: [
    { name: '_nc', weight: 4 },   // normalized code
    { name: '_ns', weight: 2 },   // normalized city
    { name: '_na', weight: 1 },   // normalized airport name
  ],
  threshold: 0.25,         // strict matching — lower = stricter
  minMatchCharLength: 2,
  ignoreLocation: true,
  shouldSort: true,
}
```

Fuse.js is only used as a safety net for genuinely misspelled queries (e.g., "garuolhos" → GRU).

### Portal Dropdown

The dropdown renders via `ReactDOM.createPortal(content, document.body)`. The dropdown position is calculated with `getBoundingClientRect()` on the input element, then applied as `position: fixed` coordinates.

**Why a portal:** The parent `BookingModal` has `overflow: hidden`. Without a portal, the dropdown would be clipped. See [known-issues.md](../known-issues.md) for the full explanation.

### Result Selection

Selection uses `onMouseDown` instead of `onClick`. This prevents the input's `onBlur` event from firing and closing the dropdown before the click event registers. `onMouseDown` fires before `onBlur`; `onClick` fires after.

---

## Files Involved

| File | Role |
|---|---|
| `src/components/booking/AirportAutocomplete.tsx` | The component |
| `src/data/airports.ts` | The airport dataset (160+ entries) |
| `package.json` | `fuse.js` dependency |

---

## Dependencies

- **Fuse.js 7.3.0** — fuzzy search fallback
- **ReactDOM** (via `react-dom`) — portal rendering
- **`src/data/airports.ts`** — local airport database

---

## Dataset: airports.ts

**Location:** `src/data/airports.ts`
**Interface:**
```typescript
export interface Airport {
  code:    string   // IATA 3-letter code (e.g., "GRU")
  airport: string   // Full airport name (e.g., "Aeroporto Internacional de Guarulhos")
  city:    string   // City name (e.g., "São Paulo")
  country: string   // Country name (e.g., "Brasil")
}
```

**Coverage:** 160+ airports across Brazil (35), Americas (25), Europe (40), Middle East (10), Asia (18), Oceania (4), Africa (8).

**Adding airports:** Simply add entries to the array. No other changes needed — the search algorithm picks up new entries automatically.

---

## Future Improvements

- **IATA codes in destination data** — When Duffel integration is built, destinations need their own IATA code field. See [features/flight-search-planning.md](./flight-search-planning.md).
- **Keyboard navigation** — Arrow keys to navigate the dropdown, Enter to select. Currently mouse/touch only.
- **Recent searches** — Store the last 3 airports in localStorage and show them as suggestions before typing.
- **`prefers-reduced-motion`** — Dropdown appearance animation could be suppressed for accessibility.

---

## Maintenance Notes

- Do not change the tiered order without testing all airport combinations — the order is carefully tuned for Brazilian user patterns.
- Do not raise the Fuse.js `threshold` above 0.4 — results become too loose and return irrelevant airports.
- If adding a new country's airports, use native characters in the `city` and `airport` fields — the normalization function handles the accent stripping at search time.
- The dataset is intentionally not exhaustive. It covers Alvea Viagens' actual service destinations. Do not bulk-import all ~10,000 IATA airports — the dropdown would become unmanageable and Fuse.js performance would degrade.

// formatDuration — converts ISO 8601 duration strings from Duffel into
// compact, user-friendly labels.
//
// Duffel returns flight durations as ISO 8601 Period strings. The format is:
//   P[n]D T [n]H [n]M
//     │       │     └── minutes
//     │       └──────── hours  (only present if there is a time component)
//     └──────────────── days
//
// "T" is the separator between the date part (days) and the time part.
// Sub-day flights arrive as "PT..." (no day component).
// Multi-day flights arrive as "P[n]DT..." (day component before the T).
//
// Examples (inputs Duffel actually returns):
//   "PT45M"        → "45 min"
//   "PT2H15M"      → "2h 15min"
//   "PT8H"         → "8h"
//   "P1DT6H15M"    → "1d 6h 15min"
//   "P2DT"         → "2d"
//   "P3DT4H"       → "3d 4h"
//   "P1DT"         → "1d"
//   "PT0M"         → "0 min"
//   (unrecognised) → original string (safe no-op fallback)

export function formatDuration(iso: string): string {
  // Regex targets exactly the three components Duffel uses: days, hours, minutes.
  // Years and months are intentionally excluded — Duffel never emits them for
  // flight durations, and including them would add dead regex branches.
  //
  //   ^P              — period designator (mandatory)
  //   (?:(\d+)D)?     — optional days,    captured → group 1
  //   (?:             — optional time block (only present when T exists)
  //     T
  //     (?:(\d+)H)?   — optional hours,   captured → group 2
  //     (?:(\d+)M)?   — optional minutes, captured → group 3
  //   )?$
  const match = iso.match(/^P(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?)?$/)
  if (!match) return iso

  const days    = parseInt(match[1] ?? '0', 10)
  const hours   = parseInt(match[2] ?? '0', 10)
  const minutes = parseInt(match[3] ?? '0', 10)

  const parts: string[] = []
  if (days > 0)    parts.push(`${days}d`)
  if (hours > 0)   parts.push(`${hours}h`)
  if (minutes > 0) {
    // When minutes is the only component, a separating space reads more naturally
    // ("45 min"). When it follows hours or days, attach it without a space so it
    // reads as a compound unit ("2h 15min", "1d 6h 15min").
    parts.push(parts.length === 0 ? `${minutes} min` : `${minutes}min`)
  }

  // All components are zero (e.g. "PT0M") — return the minimal readable label.
  return parts.length === 0 ? '0 min' : parts.join(' ')
}

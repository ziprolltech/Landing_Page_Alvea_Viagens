/* Shared atmosphere for the ALVEA JOURNEY scenes.

   CloudDeck is a still painting of a cloud layer seen from above, made only of
   radial gradients (no blur filter, no image). Scenes animate the wrapper they
   put it in — transform and opacity — so it never repaints.

   It is shared because the take-off ends looking down at this cloud layer and
   the world map begins with the very same layer parting: two scenes, one shot. */

/* Opacity and scale of the deck at the take-off → map hand-over. Both scenes
   use these values on the cut, so the frame does not change. */
export const DECK_HANDOFF = { opacity: 0.78, scale: 1 }

const cloud = (w: number, h: number, x: number, y: number, alpha: number) =>
  `radial-gradient(ellipse ${w}% ${h}% at ${x}% ${y}%, rgba(255,255,255,${alpha}) 0%, rgba(240,247,255,${(alpha * 0.42).toFixed(2)}) 42%, rgba(240,247,255,0) 72%)`

/* Heavier around the edges, open in the middle — where the subject is */
const DECK = [
  cloud(30, 20, 14, 22, 0.55),
  cloud(36, 24, 82, 18, 0.5),
  cloud(28, 16, 50, 6, 0.42),
  cloud(34, 22, 6, 62, 0.5),
  cloud(30, 22, 94, 60, 0.55),
  cloud(40, 24, 30, 92, 0.5),
  cloud(36, 22, 72, 90, 0.5),
  cloud(20, 12, 34, 40, 0.22),
  cloud(18, 11, 68, 50, 0.2),
  cloud(22, 12, 54, 74, 0.24),
]

/* The same layer with the middle closed — the moment of flying through it */
const DENSE = [
  ...DECK,
  cloud(46, 34, 50, 46, 0.6),
  cloud(38, 26, 26, 58, 0.5),
  cloud(38, 26, 76, 34, 0.5),
]

export function CloudDeck({ dense = false }: { dense?: boolean }) {
  return (
    <div
      className="absolute inset-[-25%]"
      style={{ backgroundImage: (dense ? DENSE : DECK).join(', ') }}
      aria-hidden="true"
    />
  )
}

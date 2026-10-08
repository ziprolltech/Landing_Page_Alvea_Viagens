import { CHAPTERS, pinned } from '@/data/experiencias'

/* ALVEA JOURNEY — the sound score (second version).

   This file is the "sheet music": for every chapter it says, at each point of
   that chapter's scroll progress, how present each environment is, how open or
   enclosed the whole sound is, and how much of it there is at all. It contains
   no audio code — the engine (sound-engine.ts) only plays what this asks for.

   The question behind every number is not "which sound matches this picture"
   but "what would someone inside this journey be feeling here".

   Environments (0 … 1 each). Each is built from several layers at different
   distances — see the engine.
   ─────────────────────────────────────────────────────────────────────────
   air       high, open atmosphere                                  (far)
   pad       a tonal bed, almost part of the air — never "music"    (far)
   lift      how far the pad's pitch is raised (miles scene)
   sub       weight: a low presence felt more than heard — tension, scale
   terminal  the airport as a place: hall, people at several depths, footsteps,
             luggage, machinery, a public address far away
   cabin     inside the fuselage: enclosed air, structure, systems
   engine    the turbines
   rpm       how fast they spin (pitch and density, not loudness)
   flight    0 = engines heard on the ground (roar, body) … 1 = heard in flight
             (airy, wide)
   ground    wheels on the runway: roll, joints, vibration
   wind      air moving past
   ocean     open sea: the far water and the swell
   hull      the ship up close: water against the side, wake, structure

   Two parameters shape everything at once
   ───────────────────────────────────────
   open      0 = enclosed, muffled (behind glass, inside a cloud) … 1 = wide open
   level     overall presence. Dips are deliberate: a breath of near-silence
             before something arrives makes it arrive.

   Rules
   ─────
   · A chapter starts on exactly the values the previous one ended on
     (`scoreSeams()` must be 0): environments turn into one another, they are
     not swapped.
   · At most two environments are prominent at once.
   · Each entry is a list of [progress, value] points joined by straight lines. */

export interface Mix {
  air:      number
  pad:      number
  lift:     number
  sub:      number
  terminal: number
  cabin:    number
  engine:   number
  rpm:      number
  flight:   number
  ground:   number
  wind:     number
  ocean:    number
  hull:     number
  open:     number
  level:    number
}

export type Layer = keyof Mix
type Points = [number, number][]
type ChapterScore = Partial<Record<Layer, Points>>

export const LAYERS: Layer[] = [
  'air', 'pad', 'lift', 'sub', 'terminal', 'cabin', 'engine', 'rpm', 'flight', 'ground', 'wind', 'ocean', 'hull', 'open', 'level',
]

/* Environments that count as "prominent" when checking the mix */
export const ENVIRONMENTS: Layer[] = ['air', 'pad', 'terminal', 'cabin', 'engine', 'ground', 'wind', 'ocean', 'hull']

const DEFAULTS: Partial<Mix> = { open: 1, level: 1 }

const SCORE: Record<string, ChapterScore> = {
  /* 01 — O chamado. Not music: stillness with something under it. Air, a weight
     that grows, and only towards the end the first trace of the pad. */
  'o-chamado': {
    level: [[0, 0.8], [1, 1]],
    open:  [[0, 0.7], [1, 0.6]],
    air:   [[0, 0.16], [1, 0.22]],
    sub:   [[0, 0.25], [1, 0.5]],
    pad:   [[0, 0], [0.5, 0.05], [1, 0.2]],
  },

  /* 02 — Embarque. The terminal opens around the visitor, as a room. At the
     end the door of the aircraft closes on it: the hall is still there, but
     outside, and the cabin begins. */
  'embarque': {
    open:     [[0, 0.6], [0.15, 0.85], [0.8, 0.85], [1, 0.4]],
    terminal: [[0, 0], [0.15, 0.7], [0.82, 0.7], [1, 0.25]],
    cabin:    [[0, 0], [0.8, 0], [1, 0.3]],
    engine:   [[0, 0], [0.85, 0], [1, 0.04]],
    rpm:      [[0, 0.12], [1, 0.12]],
    air:      [[0, 0.22], [0.2, 0], [1, 0]],
    sub:      [[0, 0.5], [0.2, 0.15], [0.8, 0.15], [1, 0.3]],
    pad:      [[0, 0.2], [0.2, 0.08], [1, 0.05]],
  },

  /* 03 — Decolagem, on the picture's own timing:
       0.00–0.16 line-up        cabin, systems, tension under it
       0.16–0.44 acceleration   the roll comes in, engines spool, the weight grows
       0.44–0.46                a held breath
       0.46      rotation       the wheels let go: the ground drops out, the
                                sound opens, the wind takes over (cue: release)
       0.46–0.66 climb          engines stop sounding like a runway and start
                                sounding like flight
       0.58–0.72 cloud          denser, closer, muffled (cue: whoosh at 0.66)
       0.72      …              almost nothing
       0.77      open sky       everything opens (cue: bloom)
       0.90–1    altitude       air, a little wind, the engines far behind */
  'decolagem': {
    level:    [[0, 1], [0.42, 1], [0.455, 0.78], [0.48, 1], [0.69, 1], [0.725, 0.35], [0.77, 1], [1, 1]],
    open:     [[0, 0.4], [0.44, 0.38], [0.5, 0.72], [0.6, 0.7], [0.67, 0.45], [0.72, 0.42], [0.78, 1], [1, 1]],
    terminal: [[0, 0.25], [0.08, 0], [1, 0]],
    cabin:    [[0, 0.3], [0.1, 0.5], [0.46, 0.6], [0.6, 0.4], [0.8, 0.2], [1, 0.1]],
    sub:      [[0, 0.3], [0.16, 0.6], [0.4, 0.7], [0.46, 0.3], [0.6, 0], [1, 0]],
    engine:   [[0, 0.04], [0.12, 0.1], [0.16, 0.18], [0.3, 0.42], [0.44, 0.66], [0.5, 0.7], [0.62, 0.6], [0.78, 0.38], [0.9, 0.2], [1, 0.1]],
    rpm:      [[0, 0.12], [0.16, 0.22], [0.44, 0.95], [0.5, 1], [0.66, 0.95], [0.9, 0.8], [1, 0.72]],
    flight:   [[0, 0], [0.44, 0], [0.6, 0.7], [0.8, 1], [1, 1]],
    ground:   [[0, 0], [0.14, 0.04], [0.2, 0.2], [0.44, 0.75], [0.47, 0.5], [0.52, 0.08], [0.56, 0], [1, 0]],
    wind:     [[0, 0], [0.25, 0.04], [0.44, 0.2], [0.5, 0.4], [0.64, 0.55], [0.69, 0.6], [0.76, 0.3], [0.9, 0.22], [1, 0.14]],
    air:      [[0, 0], [0.72, 0], [0.8, 0.28], [1, 0.3]],
    pad:      [[0, 0.05], [0.1, 0], [0.74, 0], [0.86, 0.16], [1, 0.2]],
  },

  /* 04 — O mundo. Scale: the aircraft is gone from the sound within the first
     seconds; what is left is height — air, a pad that is part of it, and a
     weight far below. A trace of moving air while the flight is on its route. */
  'o-mundo': {
    cabin:  [[0, 0.1], [0.1, 0], [1, 0]],
    engine: [[0, 0.1], [0.14, 0], [1, 0]],
    rpm:    [[0, 0.72], [0.14, 0.6], [1, 0.6]],
    flight: [[0, 1], [1, 1]],
    wind:   [[0, 0.14], [0.2, 0.08], [0.62, 0.1], [0.7, 0.03], [1, 0]],
    air:    [[0, 0.3], [0.2, 0.26], [0.9, 0.22], [1, 0.2]],
    pad:    [[0, 0.2], [0.25, 0.3], [0.9, 0.3], [1, 0.26]],
    sub:    [[0, 0], [0.3, 0.2], [1, 0.2]],
  },

  /* 05 — Destinos. Discovery, not interface. The question is asked into a
     hush; after that the bed barely moves and the cues do the work. */
  'destinos': {
    level: [[0, 1], [0.03, 0.55], [0.1, 0.55], [0.13, 1], [1, 1]],
    air:   [[0, 0.2], [0.12, 0.14], [0.9, 0.16], [1, 0.28]],
    pad:   [[0, 0.26], [0.9, 0.26], [1, 0.12]],
    sub:   [[0, 0.2], [0.1, 0], [1, 0]],
    wind:  [[0, 0], [0.9, 0], [1, 0.1]],
  },

  /* 06 — Além do céu. One move, like the picture: the air thins, wind passes
     as the camera tilts, a breath between the two sentences, and the sea is
     there — first far, then the ship's own water. */
  'alem-do-ceu': {
    level: [[0, 1], [0.46, 1], [0.54, 0.7], [0.62, 1], [1, 1]],
    open:  [[0, 1], [0.5, 0.9], [1, 0.85]],
    air:   [[0, 0.28], [0.5, 0.18], [1, 0.1]],
    pad:   [[0, 0.12], [1, 0.06]],
    wind:  [[0, 0.1], [0.35, 0.4], [0.6, 0.3], [1, 0.18]],
    ocean: [[0, 0], [0.25, 0], [0.74, 0.4], [1, 0.55]],
    hull:  [[0, 0], [0.8, 0], [1, 0.15]],
  },

  /* 07 — Cruzeiros. On the water. The far sea is always there; the ship's own
     water arrives with the ship (it reaches the middle of the frame at 0.3). */
  'cruzeiros': {
    open:  [[0, 0.85], [0.2, 1], [0.9, 1], [1, 0.8]],
    air:   [[0, 0.1], [1, 0.06]],
    pad:   [[0, 0.06], [0.85, 0.06], [1, 0.18]],
    wind:  [[0, 0.18], [0.3, 0.26], [0.85, 0.24], [1, 0]],
    ocean: [[0, 0.55], [0.2, 0.85], [0.84, 0.85], [1, 0.12]],
    hull:  [[0, 0.15], [0.3, 0.7], [0.84, 0.7], [1, 0]],
  },

  /* 08 — Como a Alvea pensa. The sea is gone. The statement is said into
     near-silence, close, with weight under it; the route brings the pad back. */
  'o-caminho': {
    level: [[0, 1], [0.06, 0.5], [0.12, 0.4], [0.36, 0.4], [0.46, 1], [1, 1]],
    open:  [[0, 0.8], [0.1, 0.6], [0.45, 0.6], [0.55, 0.9], [1, 0.9]],
    ocean: [[0, 0.12], [0.08, 0], [1, 0]],
    air:   [[0, 0.06], [1, 0.06]],
    pad:   [[0, 0.18], [0.4, 0.14], [0.5, 0.34], [1, 0.34]],
    sub:   [[0, 0], [0.1, 0.3], [0.4, 0.3], [0.5, 0.15], [1, 0.15]],
  },

  /* 09 — Viagem inteligente. Starts simple and enclosed; with each word there
     is more depth, more air, more height. A held breath, then "VIAGEM". */
  'milhas': {
    level: [[0, 1], [0.79, 1], [0.825, 0.7], [0.845, 1], [1, 1]],
    open:  [[0, 0.9], [0.4, 0.55], [0.84, 1], [1, 1]],
    air:   [[0, 0.06], [0.4, 0.06], [0.84, 0.2], [1, 0.3]],
    pad:   [[0, 0.34], [0.36, 0.26], [0.84, 0.6], [0.92, 0.5], [1, 0.2]],
    lift:  [[0, 0], [0.4, 0], [0.84, 1], [0.92, 1], [1, 0]],
    sub:   [[0, 0.15], [0.4, 0.15], [0.84, 0.45], [1, 0]],
    wind:  [[0, 0], [0.9, 0], [1, 0.28]],
  },

  /* 10 — O próximo destino. Open sky; a small rise towards the question — and
     then it is taken away. The calls to action arrive in near-silence. */
  'proximo': {
    level: [[0, 1], [0.5, 1], [0.6, 0.5], [1, 0.4]],
    air:   [[0, 0.3], [0.3, 0.42], [0.42, 0.3], [0.56, 0.08], [1, 0.05]],
    wind:  [[0, 0.28], [0.3, 0.34], [0.42, 0.2], [0.56, 0.04], [1, 0.02]],
    pad:   [[0, 0.2], [0.3, 0.3], [0.4, 0.34], [0.5, 0.16], [0.58, 0], [1, 0]],
  },
}

function at(points: Points | undefined, p: number, fallback: number): number {
  if (!points) return fallback
  if (p <= points[0][0]) return points[0][1]
  for (let i = 1; i < points.length; i++) {
    const [x1, y1] = points[i]
    if (p <= x1) {
      const [x0, y0] = points[i - 1]
      return x1 === x0 ? y1 : y0 + ((y1 - y0) * (p - x0)) / (x1 - x0)
    }
  }
  return points[points.length - 1][1]
}

/* The mix for a chapter at a given progress (0 … 1) */
export function mixAt(chapterId: string, progress: number): Mix {
  const score = SCORE[chapterId] ?? {}
  const p = Math.min(1, Math.max(0, progress))
  const mix = {} as Mix
  for (const layer of LAYERS) mix[layer] = at(score[layer], p, DEFAULTS[layer] ?? 0)
  return mix
}

/* ── Cues: single gestures, placed on the picture ────────────────────────────
   release  the moment the wheels leave the runway
   bloom    the sky opening after the cloud
   whoosh   air passing — used three times in the whole journey
   swell    a soft tone that blooms and fades in the distance; `note` in Hz
   payoff   the chord under "VIAGEM": the pieces falling into place

   `back: true` cues also play (softer, reversed) when scrolling up. */

export interface Cue {
  chapter: string
  at:      number
  kind:    'release' | 'bloom' | 'whoosh' | 'swell' | 'payoff'
  gain:    number
  note?:   number
  back?:   boolean
}

/* D major pentatonic, around the pad's key */
const D3 = 146.83, E3 = 164.81, Fs3 = 185.0, A3 = 220.0, B3 = 246.94, D4 = 293.66

export const CUES: Cue[] = [
  { chapter: 'decolagem',   at: 0.465, kind: 'release', gain: 1 },
  { chapter: 'decolagem',   at: 0.66,  kind: 'whoosh',  gain: 0.8, back: true },
  { chapter: 'decolagem',   at: 0.775, kind: 'bloom',   gain: 1 },

  { chapter: 'o-mundo',     at: 0.2,   kind: 'swell',   gain: 0.5, note: A3 },   // the flight leaves São Paulo
  { chapter: 'o-mundo',     at: 0.62,  kind: 'swell',   gain: 0.6, note: D4 },   // … and reaches Paris

  { chapter: 'destinos',    at: 0.13,  kind: 'whoosh',  gain: 0.7, back: true }, // the window opens
  { chapter: 'destinos',    at: 0.19,  kind: 'swell',   gain: 0.55, note: Fs3 }, // one distant tone per place:
  { chapter: 'destinos',    at: 0.35,  kind: 'swell',   gain: 0.5, note: A3 },   // discovery, not interface
  { chapter: 'destinos',    at: 0.51,  kind: 'swell',   gain: 0.5, note: B3 },
  { chapter: 'destinos',    at: 0.67,  kind: 'swell',   gain: 0.5, note: E3 },
  { chapter: 'destinos',    at: 0.83,  kind: 'swell',   gain: 0.5, note: D3 },

  { chapter: 'o-caminho',   at: 0.5,   kind: 'swell',   gain: 0.35, note: D3 },  // the five steps
  { chapter: 'o-caminho',   at: 0.605, kind: 'swell',   gain: 0.35, note: E3 },
  { chapter: 'o-caminho',   at: 0.71,  kind: 'swell',   gain: 0.35, note: Fs3 },
  { chapter: 'o-caminho',   at: 0.815, kind: 'swell',   gain: 0.35, note: A3 },
  { chapter: 'o-caminho',   at: 0.92,  kind: 'swell',   gain: 0.45, note: D4 },

  { chapter: 'milhas',      at: 0.4,   kind: 'swell',   gain: 0.4, note: D3 },   // Dinheiro
  { chapter: 'milhas',      at: 0.51,  kind: 'swell',   gain: 0.42, note: E3 },  // Milhas
  { chapter: 'milhas',      at: 0.62,  kind: 'swell',   gain: 0.46, note: Fs3 }, // Pontos
  { chapter: 'milhas',      at: 0.73,  kind: 'swell',   gain: 0.5, note: A3 },   // Oportunidades
  { chapter: 'milhas',      at: 0.845, kind: 'payoff',  gain: 1 },               // VIAGEM
  { chapter: 'milhas',      at: 0.93,  kind: 'whoosh',  gain: 0.8, back: true }, // through the word

  { chapter: 'proximo',     at: 0.4,   kind: 'swell',   gain: 0.5, note: A3 },   // the question
]

/* ── Where the visitor is ────────────────────────────────────────────────────
   Derived from the journey's own scroll progress (the value JourneyExperience
   already gets from Framer Motion), with the same arithmetic the progress dots
   use. No extra scroll listener is involved. */

const LENGTHS = CHAPTERS.map(pinned)
const TOTAL = LENGTHS.reduce((sum, n) => sum + n, 0)

/* Journey progress at which the first chapter ends */
export const FIRST_CHAPTER_END = LENGTHS[0] / TOTAL

export interface Position {
  index:    number   // chapter index, 0-based
  id:       string
  progress: number   // 0 … 1 inside that chapter
  /* index + progress: a single number that grows through the whole journey */
  place:    number
}

export function locate(journeyProgress: number): Position {
  let rest = Math.min(1, Math.max(0, journeyProgress)) * TOTAL
  for (let index = 0; index < CHAPTERS.length; index++) {
    const length = LENGTHS[index]
    if (rest <= length || index === CHAPTERS.length - 1) {
      const progress = Math.min(1, rest / length)
      return { index, id: CHAPTERS[index].id, progress, place: index + progress }
    }
    rest -= length
  }
  return { index: 0, id: CHAPTERS[0].id, progress: 0, place: 0 }
}

const CUE_PLACES = CUES.map((cue) => CHAPTERS.findIndex((c) => c.id === cue.chapter) + cue.at)

/* Cues crossed when moving from one place to another. Long jumps (a click on
   a progress dot, a flick of the scrollbar) trigger nothing: only the
   environments follow, so a jump never fires a burst of sounds. */
export function cuesBetween(from: number, to: number): { cue: Cue; backwards: boolean }[] {
  if (from === to || Math.abs(to - from) > 0.3) return []
  const backwards = to < from
  const low = Math.min(from, to)
  const high = Math.max(from, to)
  const crossed: { cue: Cue; backwards: boolean }[] = []
  CUES.forEach((cue, i) => {
    const place = CUE_PLACES[i]
    if (place > low && place <= high && (!backwards || cue.back)) crossed.push({ cue, backwards })
  })
  return crossed
}

/* Largest difference, per parameter, between the end of each chapter and the
   start of the next. Must be 0. */
export function scoreSeams(): number {
  let worst = 0
  for (let i = 0; i < CHAPTERS.length - 1; i++) {
    const end = mixAt(CHAPTERS[i].id, 1)
    const start = mixAt(CHAPTERS[i + 1].id, 0)
    for (const layer of LAYERS) {
      /* turbine speed and character are inaudible while the turbines are silent */
      if ((layer === 'rpm' || layer === 'flight') && end.engine === 0 && start.engine === 0) continue
      worst = Math.max(worst, Math.abs(end[layer] - start[layer]))
    }
  }
  return worst
}

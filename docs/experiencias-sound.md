# ALVEA JOURNEY — Sound

The optional sound of `/experiencias`. Off every time the page is entered; when the visitor switches it on, it follows the scroll chapter by chapter.

This document describes the **second version** of the sound design (2026-10-08). The first was one sound per idea; this one builds places.

---

## At a glance

| | |
|---|---|
| Default | Silent. Nothing audio-related is created until the visitor clicks the control |
| Source of the sound | Synthesised in the browser (Web Audio API). **No audio files are shipped** |
| Driven by | The journey's existing Framer Motion scroll progress — no scroll listener of its own |
| Libraries added | None |
| Leaving the route | Engine disposed: every source stopped, event scheduler cleared, `AudioContext` closed |
| Persistence | None (no `localStorage` / `sessionStorage`); every visit starts silent |
| Cost | ≈9 kB on the route's JavaScript; no network requests |

---

## Direction

The question behind every decision is not "which sound matches this picture" but "what would someone inside this journey be feeling here".

1. **Places, not effects.** Every environment is several layers at three distances: *near* (dry, detailed, slightly to one side), *mid* (the space you are in), *far* (mostly reverb, dulled by distance).
2. **One thing turns into the next.** The terminal is still there, muffled, after the aircraft door closes; the cabin becomes wind; wind becomes air; air becomes sea breeze. Nothing is faded out to make room for something else.
3. **Open and enclosed.** A single filter over the whole mix (`open`) makes the cabin a cabin, the inside of a cloud close, and the sky after it wide.
4. **Silence is used.** Six deliberate held breaths (`level`) come right before something arrives, and the calls to action arrive in near-silence.
5. **Nothing loops.** Continuous layers drift on periods that never line up; on top of them, small events are scheduled at random and are never the same twice.
6. **Almost no music.** The pad is absent from the first seconds of the journey and from under the final calls to action, and is otherwise mixed as part of the air.

---

## Files

| File | Role |
|---|---|
| `src/components/experiencias/JourneySound.tsx` | The control and the lifecycle (unchanged in this version) |
| `src/lib/experiencias/sound-score.ts` | The "sheet music": every parameter per chapter and progress, the cue list, `locate()`. No audio code |
| `src/lib/experiencias/sound-engine.ts` | The mixer: environments, two reverbs, live events, cues, limiter |
| `src/data/experiencias-audio.ts` | `SOUND_FILES` — optional recordings that replace synthesised environments. Empty |
| `public/audio/experiencias/{airport,takeoff,flight,sky,destinations,ocean,cruise,process,miles,final,transitions}/` | Where recordings go. All empty |

---

## How it follows the scroll

```
scrollYProgress (Framer Motion, already used by the page)
      │  useMotionValueEvent — fires only while scrolling
      ▼
locate(progress)  →  { chapter id, progress inside the chapter, place }
      ▼
mixAt(chapter, progress)  →  15 parameters, 0 … 1 each
      ▼
engine.apply(mix)  →  everything glides to its target (time constant 0.4 s ≈ a 1.2 s cross-fade)
```

- The mix is a pure function of the scroll position: scrolling back walks the sound back; stopping holds the sound of that moment.
- Each chapter's score starts on exactly the values the previous one ends on (`scoreSeams()` = 0).
- A jump (progress dot, scrollbar) glides straight to the new place. Measured: jumping from the airport to the cruise, the terminal is gone and the sea is in place within one second, and no cue fires.

### Parameters

| Parameter | Meaning |
|---|---|
| `air` | High, open atmosphere (far) |
| `pad` | A tonal bed in D, mixed as part of the air; `lift` raises its pitch (miles scene) |
| `sub` | Weight: a low presence felt more than heard — tension, scale |
| `terminal` | The airport as a place |
| `cabin` | Inside the fuselage |
| `engine` | The turbines; `rpm` is how fast they spin; `flight` is their character (0 heard from the runway … 1 heard in flight) |
| `ground` | Wheels on the runway |
| `wind` | Air moving past |
| `ocean` | Open sea, away from the ship |
| `hull` | The ship up close |
| `open` | 0 enclosed and muffled … 1 wide open (650 Hz → 19 kHz low-pass over everything) |
| `level` | Overall presence; dips are the held breaths |

---

## The environments, layer by layer

| Environment | Far | Mid | Near | Live events |
|---|---|---|---|---|
| **Terminal** | Hall tone into a 4.2 s dark reverb; ventilation and escalator hum | Two crowds, left and right — formant bands moving at syllable rate, no words | — | Footsteps (4–9 steps at a walker's own pace, somewhere between close and across the hall, arriving and leaving); a suitcase rolling across from one side to the other; a public address: two soft notes and a wordless voice, reverb only |
| **Cabin** | — | Enclosed low air; the shell resonating at three frequencies | Air vents; a faint systems tone | — |
| **Engines** | Rush and whine (the "in flight" group, with some open reverb) | Roar, body, growl (the "on the runway" group) | — | — |
| **Ground** | — | Low roll with a tremor that quickens with speed; tyre texture | The soft thud of runway joints, faster as the aircraft accelerates | — |
| **Wind** | Thin upper band | The rush | Low body | Gusts leaning in from one side (sky scenes only) |
| **Air** | Wide dark band; a thin layer above it that comes and goes | — | — | — |
| **Ocean** | A wide low wash, always there | The swell on three periods (≈9 s, 14 s, 5 s) and its foam | — | — |
| **Hull** | Engines far below the deck | Water running along the side | The wake hissing | A wave meeting the hull every 2.6–6 s — rise, break, spray, and its weight against the steel, each a different size and place; now and then the structure working |

Two reverbs are generated at start-up (no impulse files): a large dark **hall** and a lighter **open space**.

---

## Chapter by chapter

| # | Chapter | What the visitor should feel | How |
|---|---|---|---|
| 01 | O chamado | Something is about to happen | Air, and a weight that grows. No pad at first — it only appears, faintly, at the end. Slightly enclosed |
| 02 | Embarque | I am in an airport | The hall opens around the visitor with people at two depths and life passing through it. At the end the sound closes in (`open` 0.85 → 0.4): the door has shut, the terminal is outside, the cabin begins |
| 03 | Decolagem | We left the ground | See below |
| 04 | O mundo | Scale | The aircraft is gone from the sound within the first 14%. Height: air, the pad inside it, weight far below, a trace of moving air while the flight is on its route, one distant tone at departure and at arrival |
| 05 | Escolha seu destino | The world is full of possibilities | The question is asked into a hush. Then a very quiet bed, one breath of air when the window opens, and one distant tone per place. No interface sounds |
| 06 | Além do céu | The sky gives way to the sea | The air thins, wind passes as the camera tilts, a breath between the two sentences, the far sea arrives, then the first of the ship's own water |
| 07 | Cruzeiros | Open water, wind on the face | The far sea, the swell, a breeze; and from the moment the ship reaches the middle of the frame, its hull: water along the side, the wake, waves breaking against it |
| 08 | Como a Alvea pensa | Care, precision | The sea is gone. The statement is said into near-silence, close (`open` 0.6), with weight under it. The pad returns with the route; one soft ascending tone per step |
| 09 | Viagem inteligente | The pieces fall into place | Starts simple and enclosed. With each word: more pad, more air, more height, the pitch rising. A held breath — then "VIAGEM": root, fifth, octave and third entering one after another |
| 10 | O próximo destino | I want to travel | Open sky, air and wind rising a little towards the question — then taken away. From the calls to action on there is almost nothing |

### Decolagem, on the picture's own timing

| Progress | Picture | Sound |
|---|---|---|
| 0.00–0.16 | Line-up | Cabin and systems, muffled; weight building underneath; engines at a whisper |
| 0.16–0.44 | Acceleration | The roll comes in and quickens (tremor and joints follow the speed); engines spool up — denser and higher, not just louder; the weight grows |
| 0.44–0.46 | — | A held breath |
| 0.465 | Rotation | **Release:** the roll drops out in a few hundredths of the scene, the whole sound opens (`open` 0.38 → 0.72), air rises and a low fifth opens under it |
| 0.46–0.66 | Climb | Engines cross from "runway" to "flight" character; wind takes over |
| 0.58–0.72 | Cloud | Wind at its densest while the sound closes in again (`open` → 0.42); a breath of air through the layer at 0.66 |
| 0.725 | — | Almost nothing (`level` 0.35) |
| 0.775 | Open sky | **Bloom:** everything opens at once, high air arrives from both sides |
| 0.90–1 | Altitude | Air, a little wind, the engines far behind |

The engines have an arc — they appear, grow, peak at rotation, change character, recede, and are gone 14% into the next chapter. They are never a constant.

### Cues

| Cue | Used | What it is |
|---|---|---|
| `release` | Rotation | Rising air and a low fifth |
| `bloom` | Sky opening | High air from both sides and a bright distant tone |
| `whoosh` | 3 times in the whole journey (cloud, the window, through "VIAGEM") | A breath of air crossing the stereo field |
| `swell` | Route, destinations, steps, words, the final question | A soft tone that blooms and fades, mostly in the reverb |
| `payoff` | "VIAGEM" | Four tones entering one after another, and air |

No clicks, beeps, hits or risers. Cues are rate-limited and do not fire on jumps.

---

## The control (UX)

Unchanged from the first version.

- **Invisible at first.** Appears once the visitor has scrolled a little (journey progress > 0.008).
- **Invitation:** speaker icon · "EXPERIÊNCIA SONORA" · "Ativar som", in a small glass pill. After 9 s (3 s if already past the first chapter) or on first use it shrinks to a round button.
- **After that:** icon only; the label ("Som ligado" / "Som desligado") returns on hover, on keyboard focus, and for 2.4 s after each toggle.
- **Position:** bottom-right inside the safe areas; below `lg` it sits 118px up and is 40px tall.
- Real `<button>` with `aria-pressed` and an `aria-label` stating the action; a polite live region announces the change; visible focus ring.
- Reduced motion: the control's own motion is disabled. The sound is unchanged — it is opt-in and is not motion.

| Action | Result |
|---|---|
| First click | Engine created inside the click, set to the current scroll position at once, master fades in over ≈1.4 s |
| Click while on | Fades out in ≈0.5 s, event scheduler stopped, `AudioContext` suspended |
| Click while off | Same engine resumes at the current scroll position |
| Tab hidden | Silenced and suspended; returns with the tab if it was on |
| Leaving the route | `dispose()`: sources stopped, scheduler cleared, `AudioContext` closed |
| Returning | Silent; nothing is built until the visitor clicks again |

---

## Asset audit (2026-10-08)

There are no audio files in the project and there never were: the first version was already fully synthesised. So the audit is of the synthesised sources.

| First version | Verdict | Now |
|---|---|---|
| Terminal: one hall tone + one murmur | **Replaced** | A place with three depths and live events |
| Turbine: one band with rising pitch | **Replaced** | Two groups with a character change, preceded by a cabin and a roll |
| Runway rumble | **Complemented** | Tremor and joints that follow the speed |
| Wind: one band | **Replaced** | Three independent bands and gusts |
| Air | **Kept**, with a second thin layer | |
| Ocean: one swell + foam | **Replaced** | Far sea + swell, and a separate hull environment with breaking waves |
| Pad | **Kept**, quieter and later; absent at the start and at the end | |
| Airport chime as a scroll cue | **Removed** | Part of the public-address event, far away |
| Whoosh per destination | **Removed** | One distant tone per place |
| — | **New** | Cabin, sub, the `open` and `level` parameters, two reverbs, `release` and `bloom` |

### What synthesis cannot do

Synthesis is good at air, wind, engines, water and tone. It is weak at things people recognise in an instant: real voices in a hall, real footsteps on a real floor, the specific sound of a real sea. The terminal and the hull are the two environments that would gain most from recordings.

---

## Replacing a synthesised environment with a recording

1. Put the file in its folder under `public/audio/experiencias/` (MP3 or AAC/M4A; 96–128 kbps stereo).
2. List it in `SOUND_FILES` in `src/data/experiencias-audio.ts`:

```ts
export const SOUND_FILES: SoundFiles = {
  terminal: '/audio/experiencias/airport/terminal.mp3',
  hull:     '/audio/experiencias/cruise/hull-wash.mp3',
}
```

3. That is all. The engine fetches it only after the visitor switches the sound on, makes its loop seamless (the last 2 s are cross-faded, equal power, into the first 2 s), and plays it under the same control — level, open/enclosed, presence, reverb send. The live events of that environment are then left to the recording. If the file fails to load a console warning is logged and that environment stays silent.

| Key | Folder / suggested file | Content | Length |
|---|---|---|---|
| `terminal` | `airport/terminal.mp3` | A large terminal from the middle of the hall: distant crowd, trolleys, footsteps, an indistinct PA. No intelligible speech, no music | 60–120 s |
| `cabin` | `takeoff/cabin.mp3` | Airliner cabin on the ground, engines idle, air conditioning. No announcements | 30–60 s |
| `engine` | `takeoff/engines.mp3` | Jet engines at **steady** high power. Not a full take-off — the score supplies the build-up; playback rate follows `rpm` | 20–40 s |
| `wind` | `flight/wind.mp3` | Steady airflow, no gust peaks | 30–60 s |
| `air` | `sky/air.mp3` | Very soft high-altitude air | 30–60 s |
| `ocean` | `ocean/open-sea.mp3` | Open sea heard from a distance: swell and wash. No gulls, no engine | 90–180 s |
| `hull` | `cruise/hull-wash.mp3` | From a ship's rail: water against the hull, wake, some wind | 90–180 s |
| `pad` | `process/pad.mp3` | A slow bed in D, no rhythm, no melody | 60–120 s |

All of them: no single event that would make the loop recognisable, normalised to about −20 LUFS, licensed for commercial use. `ground`, `sub` and the cues are always synthesised. The remaining folders (`destinations`, `miles`, `final`, `transitions`) are reserved for one-shot recordings; the engine does not read them yet.

---

## Browser limits

- Audio cannot start without a user gesture; the engine is created in the click handler.
- iOS: the hardware silent switch mutes Web Audio.
- If the Web Audio API is missing, the control is not rendered.
- A limiter sits on the output; the highest raw peak measured was 0.37 of full scale.
- The live events use a 250 ms timer while the sound is on. Browsers throttle timers in background tabs, but the sound is held while the tab is hidden anyway.

---

## Checks (development only)

`window.__journeySound` (absent from production builds): `snapshot()` — every environment plus `open` and `level`; `meter()` — output RMS, peak, context state.

### Measured on 2026-10-08 (Chrome, after the limiter, approximate A-weighting, relative)

| Point | Sounding | `open` | Level |
|---|---|---|---|
| O chamado 0.5 | air, sub, a trace of pad | 0.65 | −55 |
| Embarque 0.5 | terminal | 0.85 | −50 |
| Decolagem 0.08 | cabin, sub | 0.40 | −52 |
| Decolagem 0.30 | cabin, engines, ground, sub | 0.39 | −48 |
| Decolagem 0.44 | ground, engines, cabin | 0.38 | −45 |
| Decolagem 0.50 (after rotation) | engines, cabin, wind | 0.72 | −40 |
| Decolagem 0.64 | engines, wind | 0.56 | −38 |
| Decolagem 0.80 (open sky) | engines receding, air, wind | 1 | −41 |
| O mundo 0.5 | air, pad, sub | 1 | −46 |
| Destinos 0.42 | pad, air | 1 | −53 |
| Além do céu 0.4 | wind, air, first sea | 0.92 | −48 |
| Cruzeiros 0.5 | ocean, hull, breeze | 1 | −44 … −41 |
| O caminho 0.8 | pad | 0.9 | −55 |
| Milhas 0.45 → 0.88 | pad growing, air | 0.6 → 1 | −55 → −50 |
| Próximo 0.3 | air, wind, pad | 1 | −45 |
| Próximo 0.85 (calls to action) | almost nothing | 1 | RMS −59 dBFS |

The values after the first four were taken before a final small adjustment (pad +2 dB, air at the end of the take-off −2.5 dB, deeper breath before the open sky).

**These numbers describe balance and shape, not how it sounds. The sound has been verified by measurement only, never by ear.**

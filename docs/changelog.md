# Changelog

Chronological history of significant project changes.

---

## [Launch readiness — SEO, analytics with consent, conversion events] — 2026-10-13

**Summary:** technical SEO completed, Google Analytics 4 prepared behind a real consent banner, business events wired, operating guides written. Diagnosis and decisions: `launch-readiness-audit-2026-10.md`.

### What changed
- **SEO:** `robots.txt`, `sitemap.xml`, `metadataBase`, a canonical URL and its own description on every page, Open Graph + Twitter card with a share image, JSON-LD (`TravelAgency` + `WebSite`, verifiable data only). `/passagens` is `noindex`. Canonical host is `https://www.alveaviagens.com.br`. The tab title stays `Alvea Viagens` everywhere.
- **Icons:** the favicon artwork is served at 48/192/180 px plus `favicon.ico` instead of the 1.5 MB original (kept in `public/`).
- **404 page** in Portuguese.
- **Analytics:** GA4 loader gated by `NEXT_PUBLIC_GA_MEASUREMENT_ID` and by the visitor's consent. With no ID — the state at this deployment — nothing is loaded and no banner is shown. No Google Tag Manager.
- **Events:** `flight_request_click`, `destination_interest`, `flight_request_whatsapp`, `contact_form_submit`, `miles_form_submit`, `offer_group_click`, `whatsapp_click`, `email_click`, `instagram_click`. No personal data in any parameter.
- **Privacy fix:** the final WhatsApp button of the /milhas questionnaires no longer carries the typed name and phone in its own `href`; the full address is opened on click. Behaviour for the visitor is the same.
- **Headers:** four baseline security headers; one-day cache for `/icons`, `/images`, `/videos`.

### Files
- New: `src/lib/config/site.ts`, `src/lib/seo/page-metadata.ts`, `src/lib/analytics/*`, `src/components/analytics/*`, `src/components/seo/JsonLd.tsx`, `src/app/robots.ts`, `src/app/sitemap.ts`, `src/app/not-found.tsx`, `src/app/{atendimento,destinos,milhas,passagens}/layout.tsx`, `scripts/build-brand-images.mjs`, `public/og-image.png`, `public/favicon.ico`, `public/icons/*`
- Changed: `src/app/layout.tsx`, `next.config.ts`, the two pages with their own metadata, and the components that hold tracked links or forms (`Hero`, `HomeCTA`, `JourneyFinale`, `Footer`, `BookingModal`, `MilesModal`, `SellMilesModal`, `ManagementModal`, `atendimento/page`, `destinos/page`)
- Docs (in Portuguese, because they are step-by-step guides for the site owner): `seo.md`, `analytics.md`, `search-console.md`, `marketing-tracking.md`, `monitoring.md`, `launch-readiness-audit-2026-10.md`; `deployment.md` updated

### Verified
- `tsc`, `eslint`, `next build` clean, with and without a measurement ID.
- Generated HTML of every route checked for title, description, canonical, robots, share tags and JSON-LD.
- Consent and events exercised in headless Chrome against the local build, with every request to Google blocked: nothing loads before "Aceitar"; each action fires its event once; no typed data reaches the events; refusal stops everything.
- **Not verified:** reception of data by a real GA4 property (no ID exists yet), `flight_request_whatsapp` and `miles_form_submit` (read in code only), Search Console (not set up), any real phone.

### Depends on the owner
Create the GA4 property and set the ID in Vercel; verify the domain in Search Console and submit the sitemap; decide on a privacy policy; confirm the Vercel plan allows commercial use.

---

## [Home hero flickering when zooming on a phone] — 2026-10-10

**Report (with a screenshot from Instagram's in-app browser):** pinch-zooming at the top of the home page makes the whole first screen flicker; the gold button is drawn cut in half along a straight line — a GPU painting failure, not a layout problem. Making the clouds still (entry below) was not enough.

**Cause (likely; pinch-zoom cannot be reproduced in the desktop test browser):** the first screen combined large blur filters with things that repaint on every frame. When a phone zooms in, everything is re-rasterised at a higher scale, and blurs of 28–178px over shapes up to 1400px wide cannot be redrawn in time.

**Fix — phones only (below `lg` / touch); desktop unchanged:**

- `CloudBackground.tsx`: each cloud is drawn as the radial gradient a blurred ellipse looks like, with no `filter` at all; the two ambient glows lose their extra blur.
- `Hero.tsx`: the three large glows get their soft edge from a mask instead of an 80px blur; the badge and the four statistic cards no longer use `backdrop-filter`.
- `AviationTrail.tsx`: the flight path and the plane are drawn without SVG blur filters (the plane moves every frame).
- `globals.css`: on touch screens the gold buttons' glow is steady instead of an animated `box-shadow`, and the shimmer moves by `transform` instead of `background-position`.

Measured on the production build at 360, 390 and 430px: 0 blur filters, 0 backdrop filters and 0 SVG filters in the first screen (before: 28, 5 and 2). Side by side with the live site the hero looks the same. 1920px: clouds, backdrop filters and SVG filters as before.

---

## [Home hero flickering on phones] — 2026-10-10

**Report:** opened from the Instagram bio link on a phone, the top of the home page flickers.

**Most likely cause (not reproduced — no phone or Instagram in-app browser available):** the hero's cloud background. Each of its 23 clouds was a Framer Motion element with `will-change`, so each was its own GPU layer holding a blurred surface far larger than a phone screen (up to 1400px wide plus a 28–178px blur, times the device pixel ratio), and every one of them was updated on every frame, forever. That is more graphics memory than phones — and in-app browsers in particular — allow a page; when the budget is exceeded the browser keeps discarding and redrawing layers, which shows as flicker. No render loop, state loop or hydration error was found: the console is clean and nothing re-renders repeatedly.

**Fix** (`src/components/CloudBackground.tsx`): the clouds animate only on screens ≥1024px with a mouse (`(min-width: 1024px) and (pointer: fine)`). Everywhere else they are ordinary still elements at the same position, size, colour, blur and opacity — no `will-change`, no per-frame work. The animation was a ±1.5% scale and ±4px drift over two minutes, so the still version looks the same. Desktop is unchanged. The server renders the still version, so there is no hydration mismatch.

Verified in Chrome on the production build at 360, 390 and 430px (23 clouds, none with its own layer, same opacities) and at 1920px (23 animated clouds as before); CTA still links to `/destinos`; no console errors; `tsc`, ESLint and build pass.

---

## [Favicon, fixed tab title, CNPJ in the footer] — 2026-10-09

- **Favicon:** `public/favicon-alvea.png` (1254×1254 PNG, supplied by the client) is declared in the root layout's `metadata.icons` (icon, shortcut, apple). There was no favicon before and there is no `favicon.ico`.
- **Tab title:** always "Alvea Viagens". The root layout sets it and the two pages that overrode it (`/experiencias`, `/grupo-de-ofertas`) no longer set a `title`. Descriptions, keywords and Open Graph titles are unchanged.
- **Footer** (`src/components/layout/Footer.tsx`): "CNPJ: 59.070.673/0001-60" added once, in the bottom bar, centred under the tagline. It is the shared footer, so it shows on every page.
- **Footer links** (2026-10-08): the quick links and the two contact links are now only as wide as their text (`items-start` on their flex columns), so empty space beside them is not clickable.

---

## [Post-deploy fixes — mobile layout and hero statistic] — 2026-10-08

- **Hero statistic** (`src/components/Hero.tsx`): "50k+" → "1k+" for "Passagens emitidas", matching the "Quem Somos" block changed earlier.
- **Atendimento was wider than the phone screen** (`src/app/atendimento/page.tsx`): a decorative 700px glow was positioned directly in `<main>`, which made the page 508–543px wide on a 320–390px screen. `overflow-x: hidden` on `body` hid the scrollbar but mobile browsers still laid the page out at that width and zoomed out — hence the small content and the menu icon far from the edge. The two glows now sit inside a clipped layer (`absolute inset-0 overflow-hidden`). No other page had this problem (all measured).
- **Home "Pronto para decolar?" buttons** (`src/components/home/HomeCTA.tsx`): on phones both buttons now share one width (up to 300px) and one height (50px), with centred content; from `sm` they sit side by side as before.
- **Gold button disappearing when zooming on a phone** (`src/app/template.tsx`): the page-transition wrapper kept `filter: blur(0px)` and a transform after its entrance, so every page stayed inside one filtered layer. That is the likely cause — a filtered layer of a whole page is not repainted reliably when a phone zooms in, and the gold button repaints continuously (shimmer and glow). The wrapper now clears `filter` and `transform` when the entrance ends. **Not reproduced and not confirmed on a real phone**: the desktop test browser has no pinch-zoom.
- Verified at 320, 360, 375, 390, 430, 768 and 1366px: no horizontal overflow on any page; menu icon 29px from the right edge on Atendimento; cards inside the margins; buttons equal on phones. `tsc`, ESLint and the production build pass.

---

## [First production deployment — audit and preparation] — 2026-10-08

- **Security:** Next.js 15.3.3 → 15.5.27 and `eslint-config-next` to match (`npm audit fix`, no breaking changes). This closes the critical and high advisories reported against Next.js; one PostCSS advisory inside Next.js remains (its fix is a breaking upgrade).
- **Repository hygiene:** `tsconfig.tsbuildinfo` (a build artefact already listed in `.gitignore`) is no longer tracked. `.env.local.example` now names the two optional server-only variables.
- **Mobile layout of the trip form:** the modal is centred on phones and the class step stacks name and description (earlier the same day).
- **Docs:** `docs/deployment.md` added (repository, build, hosting, environment variables, known limits).
- **Audit result:** `tsc` 0 errors, ESLint 0 errors, production build passes; all routes respond; no broken images or assets; no console errors; one `h1` per page; no horizontal overflow; no secret in the files committed.

---

## [Destinos — "Somente ida" option and final button text] — 2026-10-08

**Summary:** The trip form on `/destinos` accepts one-way trips, and its last button now says what it does.

### Changed

- `src/components/booking/BookingModal.tsx`
  - Step 3 ("Data de volta") has a checkbox-style option **"Somente ida"** under the date field, in the same style as the other options of the form. Checking it clears any return date already picked, disables and dims the date field, and lets the visitor continue. Unchecking it brings the field back and the return date is required again. The rule that the return date cannot be earlier than the departure date is unchanged.
  - The final button reads **"Solicitar pelo WhatsApp"** instead of "Buscar disponibilidade" (text only). Earlier entries of this changelog and `booking-flow.md` still quote the old text.
- `src/lib/destinos/whatsapp-message.ts` — optional `oneWay`. For a one-way trip the dates block becomes:

```
📅 *Tipo de viagem:* Somente ida

📅 *Ida:* 15/11/2026
```

  with no "Volta" line. Round trips produce the same message as before.

### Verified (Chrome, real form)

- Round trip with both dates → message with "Ida" and "Volta", as before.
- "Somente ida" checked, no return date → continues; message has "Tipo de viagem: Somente ida" and "Ida", no "Volta", no empty or invalid date.
- Return date picked, then "Somente ida" checked → the date is cleared and the field disabled.
- Unchecked again → the step does not advance without a date.
- Going back to step 3 keeps the choice. 375px: the option fits, no horizontal overflow.
- No flight API call; `npm run build` passes (isolated copy); `tsc` and ESLint: 0 errors.

### What was NOT changed

- The other steps, the airport autocomplete, the flight-search code (still off, still in place), other WhatsApp flows, other pages.

---

## [Destinos — complete airport base for the autocomplete] — 2026-10-08

**Summary:** The airport field of the `/destinos` form searched a hand-written list of 145 airports. It now searches 8,506 airports worldwide, still entirely in the browser.

### Added

- `src/data/airports-world.json` — the base (generated; 517 kB, ≈170 kB gzipped, loaded as its own chunk).
- `scripts/build-airports.mjs` — builds it from OurAirports (public domain): filters, de-duplicates, validates, translates and orders the records. Throws if an IATA code repeats or a record is incomplete.

### Changed

- `src/components/booking/AirportAutocomplete.tsx` — the search part only. Loads the base once (dynamic import) and falls back to the hand-written list until it arrives; adds city codes, alternative city spellings and countries to the tiers; ignores "Aeroporto …" when matching the start of a name; shows 8 results instead of 7; Fuse index built only when first needed. Markup, styles and behaviour of the field are unchanged.
- `src/data/airports.ts` — entries untouched. Optional `icao` added to the `Airport` type; header comment explains the file's new role (Portuguese names for the generator, and the instant fallback list).

### Numbers

| | |
|---|---|
| Source records | 86,223 |
| Without a valid IATA code | 77,172 |
| Closed / heliport / seaplane / balloon | 253 |
| No usable city | 292 |
| **In the base** | **8,506** (236 countries and territories; 345 in Brazil; 7,524 with ICAO) |
| Duplicate IATA codes | 0 |

### Verified (Chrome, real form)

- 40 codes typed one by one — GRU CGH VCP GIG LIS MAD BCN CDG LHR FCO JFK MIA MCO LAX YYZ CUN EZE SCL LIM BOG NRT HND ICN BKK SIN DXB DOH SYD MEL AKL CNF PUJ ORY LGW EWR JNB CPT CAI NBO YVR — each is the first result.
- "PAR" → CDG, ORY, BVA; "LON" → LHR, LGW, STN, LTN; "NYC" → JFK, LGA, EWR; "guarulhos" → GRU; "são paulo" / "sao paulo" → GRU, CGH; "london" → the London airports; "heathrow" → LHR; "portugal" → LIS, OPO, FAO, FNC; "japão" → NRT, HND, KIX, ITM; "noronha" → FEN; "porto seg" → BPS; typos ("lisbo", "guarulos") still find the airport.
- Never more than 8 rows; about 10 ms per keystroke including rendering; **no network request while searching** (fetch instrumented: 0).
- Selecting an airport that was not in the old list (Porto Seguro, BPS) fills the field as "Porto Seguro (BPS)" and reaches the WhatsApp message as "BPS — Porto Seguro"; the rest of the message and the form are unchanged; no flight API call.
- `npm run build` passes (isolated copy): `/destinos` 32.1 kB / 175 kB first load (was 31.3 / 174). `tsc` and ESLint: 0 errors.

### Limits

- Outside the 145 hand-written airports and the translated cities, names are as the source has them (English or local language).
- The base is a snapshot of the source on 2026-10-08; airports that open, close or change code later need the generator to be run again.
- Small airfields with an IATA code but no scheduled flights are included (ranked last), as asked for maximum coverage.
- The destination of a trip is still the destination card chosen on the page, not an airport field — the form has a single airport field (origin).

### What was NOT changed

- The form, its steps and styles; the WhatsApp flow of the previous change; `FlightCard`, `TripSummary`; every other page.

---

## [Destinos — trip request goes to WhatsApp; live flight search switched off] — 2026-10-08

**Summary:** The booking form on `/destinos` no longer queries the flight API. After the fifth step it opens Alvea's WhatsApp with the request pre-filled. Temporary: the API's prices were too far from Google Flights. The flight-search integration is preserved for a future provider.

### Changed

- `src/components/booking/BookingModal.tsx` — new constant `FLIGHT_SEARCH_ENABLED = false`. With it off, the last step calls `requestByWhatsApp()` instead of `performSearch()`. Form, steps, validation, texts, styles and animations are unchanged; the button still reads "Buscar disponibilidade". All search code (search function, cache, result/return/summary phases, error and empty states) is still in the file and still reachable when the constant is `true`.
- `src/lib/destinos/whatsapp-message.ts` (new) — `buildTripRequestMessage()`: pure function, form answers in, message text out.
- `src/lib/utils/wa-emojis.ts` — `pin` (📍) added; existing entries untouched.

### Message

```
✈️ *Solicitação de viagem — Alvea Viagens*

Olá! Gostaria de solicitar uma cotação de passagem aérea.

📍 *Origem:* GRU — São Paulo
📍 *Destino:* CDG — Paris

📅 *Ida:* 15/11/2026
📅 *Volta:* 25/11/2026

👥 *Passageiros:* 2
💺 *Classe:* Executiva

Gostaria de receber as melhores opções disponíveis. 😊
```

- Origin: the airport picked in the autocomplete ("São Paulo (GRU)") rewritten as "GRU — São Paulo". Destination: the card's IATA code and name.
- Dates: the picked ISO dates rewritten as dd/mm/yyyy as text (no `Date` object, so no timezone shift).
- Passengers: "1" / "2", or "Família (3 ou mais pessoas)" / "Grupo (6+ passageiros)".
- Link: shared `buildWhatsAppUrl()` — `api.whatsapp.com/send`, official number from `links.ts`, text encoded once with `encodeURIComponent`. Opened in a new tab; nothing is sent automatically and nothing is stored.

### Verified (Chrome, real form, `window.open` and `fetch` instrumented)

- Each step still blocks when empty (origin, departure date, class); the return date still cannot be earlier than the departure date.
- Complete form → exactly one WhatsApp URL opened; **0 requests to `/api/flights/search`** (0 fetches of any kind); no "Buscando…" screen and no results screen; the form stays on its last step.
- Decoded message matches the answers, with the right emoji code points and accents; "Família" variant checked.
- 390px: the form opens and fits, no horizontal overflow.
- `/`, `/destinos`, `/experiencias`, `/milhas`, `/grupo-de-ofertas`, `/atendimento` respond 200. `tsc` and ESLint: 0 errors.
- The WhatsApp URL was captured, not opened: the pre-filled text inside WhatsApp itself was not observed. `npm run build` was not run for this change.

### What was NOT changed

- `/api/flights/search`, `src/lib/duffel`, `src/lib/providers`, `src/lib/services`, `src/lib/types`, the airports data and the autocomplete, `FlightCard`, `FlightFilters`, `SelectedFlightBanner`, `TripSummary`.
- Every other WhatsApp flow (Milhas, Atendimento, footer, navbar, Experiências), and every other page.

### Known leftover

- While the search is off, the older fallback link inside the results screens (which has the phone number written inline) is unreachable. It was left as is.

---

## [ALVEA JOURNEY — Sound design, second pass] — 2026-10-08

**Summary:** The sound of `/experiencias` was rebuilt for depth and dramaturgy. The first version had one sound per idea; this one builds places out of layers at three distances, lets one environment turn into the next, opens and closes the whole mix, uses silence on purpose, and adds small events that never repeat. Nothing visual changed, and the control, the activation rules and the scroll synchronisation are the same. Full description: `docs/experiencias-sound.md`.

### Changed

- `src/lib/experiencias/sound-engine.ts` — rewritten. Ten environments (air, pad, sub, terminal, cabin, engines, ground, wind, ocean, hull) built from near / mid / far layers; two generated reverbs (a large dark hall, an open space); a global open/enclosed filter and a global presence level; a 250 ms scheduler for live events (footsteps, luggage, a wordless public address, waves against the hull, the ship's structure, gusts); new cues `release` and `bloom`. Recordings can replace eight environments.
- `src/lib/experiencias/sound-score.ts` — rewritten. Fifteen parameters per chapter instead of nine; the take-off follows the picture phase by phase; six held breaths; the pad is absent at the very start and under the final calls to action.
- `src/data/experiencias-audio.ts` — keys and suggested paths updated (`pad`, `cabin`, `hull` added; `drone` renamed `pad`).
- `public/audio/experiencias/` — organised into `airport, takeoff, flight, sky, destinations, ocean, cruise, process, miles, final, transitions` (all empty).

### Removed

- The airport chime as a scroll cue (now part of a distant public-address event) and the whoosh at every change of destination (now one distant tone per place). Whooshes: 3 in the whole journey.

### Asset audit

There were no audio files to audit — the first version was already synthesised, which is where its thinness came from. Each synthesised source was kept, replaced, complemented or removed; the table is in `docs/experiencias-sound.md`. No file was downloaded and no external URL is used.

### Verified (Chrome)

- Score: seams between chapters 0; no jump larger than 0.019 per 0.1% of a chapter; at most two prominent environments everywhere except the take-off's rotation (four, by design).
- Full walk measured at 24 points: levels and the open/enclosed parameter follow the score; the rotation opens the spectrum (+4 dB A-weighted in 6% of the scene); the cruise moves between −44 and −41 as waves arrive; the final calls to action sit at −59 dBFS RMS.
- Live events are scheduled only while their environment is present and are cleared with it.
- Jump airport → cruise: terminal gone and sea in place within 1 s, no cue. Cruise → miles → cruise: correct both ways.
- On mid-journey, off, on again, leaving by the navbar and returning by the browser's back button: context suspended / closed as expected, scheduler cleared, nothing running after leaving, silent on return.
- 390 and 375px, and reduced motion at 375 and 1366px: same engine state as desktop, control works, no horizontal overflow.
- No errors (window error, unhandled rejection and `console.error` hooks) in any run.
- `npm run build` passes (isolated copy): `/experiencias` 24.4 kB, 176 kB first load. `tsc` and ESLint: 0 errors.

### Not verified

- **How it sounds.** Still verified by measurement only. Whether the terminal reads as a terminal, whether the wordless public address is convincing or odd, whether the waves feel like water — these need a listen on headphones, laptop speakers and a phone.
- Real devices, Safari and Firefox.
- The recording path, for lack of a file.

### What was NOT changed

- Anything visual; `JourneySound.tsx`; the rest of the site.

---

## [ALVEA JOURNEY — Sound experience] — 2026-10-08

**Summary:** `/experiencias` now has an optional soundscape that follows the scroll. It is off on every visit, is switched on from a small control that appears once the visitor starts to scroll, and is torn down when the route is left. No visual part of the experience changed. Full description: `docs/experiencias-sound.md`.

### Added

- `src/components/experiencias/JourneySound.tsx` — the control and the lifecycle.
- `src/lib/experiencias/sound-score.ts` — levels of each sound bed per chapter and scroll progress, cue list, `locate()`.
- `src/lib/experiencias/sound-engine.ts` — Web Audio mixer: seven synthesised beds (air, pad, terminal, turbines, rumble, wind, ocean) and four cues (whoosh, swell, chime, payoff).
- `src/data/experiencias-audio.ts` — `SOUND_FILES`, empty; lists recordings that replace synthesised beds.
- `public/audio/experiencias/` — empty folder for those recordings.
- `docs/experiencias-sound.md`.

### Changed

- `src/components/experiencias/JourneyExperience.tsx` — mounts `<JourneySound progress={scrollYProgress} />` beside the progress dots. Nothing else.

### Decisions

- **Synthesised, not recorded.** There were no audio assets in the project and none were downloaded. Every sound is generated in the browser, so the page ships no audio files, loops have no seam, and parameters follow the scroll continuously (the turbines spin up with the take-off rather than a recording being faded in). Any bed can later be replaced by a local recording by listing it in `SOUND_FILES`.
- **Scroll-driven, not event-driven.** The mix is a pure function of chapter and progress; the engine glides to it (≈1.2 s). The existing Framer Motion progress is reused; no scroll listener and no library were added.
- **No persistence.** The choice is not stored; every entry to the page starts silent.

### Verified (Chrome, 1920px unless stated)

- No `AudioContext` and no audio element exist before the click; the control is absent before scrolling and appears after it.
- After the click: context running, output present; `aria-pressed`, label and live-region text update.
- Beds measured at 17 points across the ten chapters match the score (take-off: turbines + rumble at 0.3–0.5, wind over turbines at 0.75, clean air at 0.97; ocean alone in the cruise; and so on).
- Switching on mid-journey (map) and switching back on in the cruise both start on that scene's mix.
- Switching off: master at 0 and context suspended within 2 s.
- A long jump fires no cue; a small step across a cue does.
- Leaving by the navbar and by the browser's back button: context `closed`. Returning: no control until scrolling, no engine until clicked, nothing in storage.
- Layout of the control at 375, 390, 768, 1024, 1366 and 1600px: no horizontal overflow, no text under it (closest text on phones: 6px away).
- Reduced motion (emulated): the control appears, toggles and announces its state.
- `npm run build` passes (run in an isolated copy, because the dev server was in use): `/experiencias` 21.4 kB, 173 kB first load. `tsc` and ESLint: 0 errors. The development-only `window.__journeySound` is absent from the production bundle.

### Not verified

- **How it sounds.** The automated browser has no ears: levels, balance and transitions were checked by measurement only. It needs a listen on speakers, headphones and a phone before going live; the numbers to adjust are in `sound-score.ts` and `TRIM` in `sound-engine.ts`.
- Real devices: iOS/Android audio behaviour, Safari and Firefox.
- The recording path (`SOUND_FILES`) is implemented but was not exercised — there is no file to load.

### What was NOT changed

- Texts, chapters, layout, images, animations, CTAs, navbar, footer, other pages.

---

## [ALVEA JOURNEY — Cinematic polish (stage 2)] — 2026-10-07

**Summary:** Visual audit and refinement of `/experiencias`. Same ten chapters and the same architecture (Framer Motion `useScroll` + `useTransform`, CSS `sticky`); the work went into continuity between chapters, the take-off, the map, the sky-to-sea transition, the cruise, the Alvea statement, the miles transformation and the ending. Footer quick links updated. Production build now passes.

### Continuity — one shot instead of ten sections

- Sections now overlap by one viewport and earlier chapters are stacked above later ones (`Scene` in `scene.tsx`). The next stage slides into place behind the current one and the current one is switched off at progress 1. The empty viewport of navy that used to sit between every two chapters is gone.
- Every chapter's last frame equals the next one's first frame; no decorative layer is static on a first or last frame any more.
- Take-off → map is a match cut: the take-off ends above a cloud deck and the map opens on the same deck (`atmosphere.tsx`, shared `CloudDeck` + `DECK_HANDOFF`), which then parts.
- Miles → finale: the camera goes through the word "VIAGEM" and comes out in the night sky.
- Chapter lengths retuned (`CHAPTERS` in `src/data/experiencias.ts`); total scroll ≈ 26.5 viewports, with no dead stretches.

### Scenes

- **Decolagem** — rewritten. Finite runway with threshold markings; city lights around the airfield (one element, box-shadows); centre-line distance ∝ progress^2.4; edge lights stretch into streaks at speed; on rotation the ground shrinks and slides back; the shadow is two cross-faded copies (sharp on the tarmac, soft in the air) instead of an animated blur; a cloud veil passes over the aircraft, then the deck drops below it; open sky with a hint of sun; the sky deepens to navy at altitude. The animated `filter: blur` on the runway was removed. Aircraft is larger on phones (320px minimum).
- **O mundo** — the aircraft now flies São Paulo → Paris across ~40% of the scene and draws that route itself; other routes have a soft halo (a wide faint stroke, no filter) and a softer entry; each city answers with one scroll-linked pulse ring; the map's edges fade out (mask); the camera pushes in on Paris at the end. On phones the pan follows the aircraft, then continues east.
- **Destinos** — the first destination opens through an aircraft-window-shaped clip (`clip-path` driven by one CSS variable, different proportions per breakpoint) that grows to full screen; each destination has its own colour grade and accent (`grade`, `accent` in the data).
- **Além do céu** — rewritten as one camera tilt: the sea is a single layer whose top edge is the horizon; it rises through the frame while the sky drifts up behind it. Haze above the horizon, light on the water, ripples near the horizon and swell nearer the camera.
- **Cruzeiros** — rewritten. The camera now travels with the ship (it sails in, then holds while the sea streams past at two speeds); sunlit patch of water around it; hull shadow in the water instead of a drop-shadow; the wake is a still SVG (turbulence-displaced foam astern plus the two arms of the bow wave). On small screens the whole sea stage is turned a quarter turn, so the ship sails up the portrait frame at full length, with the regions beside it. A dotted "glint" layer was tried and removed.
- **O caminho** — "Você escolhe o destino." arrives alone, then "Nós pensamos no caminho." arrives under it in gold while the first line steps back; both hold the screen for a long beat. The step line is now dashed, like a route on a chart.
- **Viagem inteligente** — rewritten. One word in the middle of the screen rolls into the next (Dinheiro → Milhas → Pontos → Oportunidades) and lands on VIAGEM in gold, over a five-stop route that fills with it. The vertical list and the ring are gone, and so is the illustrative figure (`CONCEPT_EXAMPLE` removed from the data): no number of any kind appears on the page.
- **O próximo destino** — longer, with an empty-sky beat between "E agora..." and the question; smaller, more distant aircraft with a contrail.
- **Progress dots** — land 12% into the chapter rather than on the cut; instant under reduced motion.

### Reduced motion — tested

Emulated in the browser (the page was loaded in frames with `matchMedia('(prefers-reduced-motion)')` forced to match, and the CSS `@media (prefers-reduced-motion: reduce)` rule switched on). Results at 1366 and 390px:

- Take-off, between progress 0.3 and 0.7: 0 of 35 elements changed transform.
- Running animations: 0 (star twinkle, button shimmer and glow are stopped by the existing CSS rule; the scroll-hint bob is off).
- Every chapter remains readable and in order, as cross-fades.
- Three overlaps that only existed in this mode were found and fixed: the aircraft that cannot leave the frame now fades before the take-off's closing line; the map aircraft and the finale aircraft are hidden.
- Dev-only: React logs a hydration-mismatch warning for these users (server HTML is rendered without the preference). The rendered result is correct.

### Footer

- `src/components/layout/Footer.tsx` — "Links Rápidos" is now Início, Destinos, Milhas, Grupo de Ofertas, Experiências (`/experiencias`), Atendimento. Nothing else in the footer changed. There was no "Passagens" entry left to remove.

### Build and lint

- `npm run build` failed on three long-standing `no-unused-vars` errors in booking files. They were dead code, so they were removed with no behaviour change: the unused `getCity` helper and its `AIRPORTS` import in `BookingModal.tsx`; the two unused parameters of `buildWaMessage` in `TripSummary.tsx` (and the two arguments at its single call). The WhatsApp message text is unchanged.
- After that: `npm run build` passes (11 static pages; `/experiencias` 15.4 kB, 167 kB first load); `eslint src` 0 errors; `tsc` 0 errors.
- The production build was smoke-tested with `next start`: `/experiencias` and the five other pages return 200 and the ten chapters are in the HTML.

### Performance

- Animated properties: `transform`, `opacity`, CSS variables feeding a transform or a `clip-path`, and `background-position` on one narrow strip (runway centre-line). No animated blur anywhere; the remaining `filter: blur` values are static.
- Sea and cloud movement switched from `background-position` to `transform`. Clouds are gradients, not blurred elements.
- No scroll, wheel or touch listeners of our own; one React state update per chapter change.
- Assets unchanged: 5 destination photos (143–484 kB, served through `next/image`), ship 70 kB, map 188 kB, plus the shared aircraft PNG. No new files.
- No layout-shift entries recorded on load.
- Frame rate was not measured: the automated browser tab only paints on demand.

### Verified

- Chrome at 1920px; frames at 1366 (reduced-motion run), 768, 390 and 375px. No horizontal overflow at 768, 390 or 375. 1600 and 1024 were checked in stage 1 and not re-checked after these changes.
- Reverse scroll: computed styles of the take-off are identical when reached from above and from below.
- Cut between take-off and map compared frame against frame.
- Final CTAs: `/destinos` and `api.whatsapp.com/send`. Footer links listed from the DOM.

### Not verified

- Real touch scrolling and real wheel/trackpad feel; frame rate on real devices.
- Safari and Firefox (the SVG wake filter and `clip-path` are standard, but were only seen in Chrome).

### What was NOT changed

- Home, `ScrollPlane`, Destinos, Milhas, Grupo de Ofertas, Atendimento, Duffel, forms, WhatsApp messages, Navbar. Booking files only lost the dead code described above.

---

## [ALVEA JOURNEY — Interactive Travel Experience] — 2026-10-07

**Summary:** New page `/experiencias`: a scroll-driven, ten-chapter cinematic sequence ("Uma viagem antes da viagem") ending in two CTAs. New "Experiências" tab in the navbar.

### Added

- `src/app/experiencias/page.tsx` — route and metadata.
- `src/components/experiencias/` — `scene.tsx`, `JourneyExperience.tsx`, `JourneyHero.tsx`, `AirportScene.tsx`, `TakeoffScene.tsx`, `WorldMapScene.tsx`, `DestinationsScene.tsx`, `BeyondSkyScene.tsx`, `CruiseScene.tsx`, `ProcessScene.tsx`, `MilesScene.tsx`, `JourneyFinale.tsx`, `JourneyProgress.tsx`.
- `src/data/experiencias.ts` — all chapter data, copy lists, map cities/routes, asset paths.
- `public/images/experiencias/` — `destinations/` (5 WebP photos), `cruise/ship.webp`, `world/world-dots.svg`; `airport/` and `final/` created empty.

### Changed

- `src/components/Navbar.tsx` — link "Experiências → /experiencias" between "Grupo de Ofertas" and "Atendimento". With six links the horizontal bar now starts at `lg` (1024px) instead of `md`; below that the drawer is used. Link gap is `gap-5`, `xl:gap-7`.

### How it works

- Framer Motion only: per-chapter `useScroll` + `useTransform`, pinned with CSS `sticky`. Fully reversible; no scroll hijacking; GSAP not involved.
- CTAs: "Planejar minha viagem" → `/destinos`; "Falar com um especialista" → official WhatsApp through the existing `buildWhatsAppUrl()`.
- Reduced motion: movement, scale, rotation, and blur are replaced by fixed values; scroll-linked opacity remains.
- No prices, dates, or offers; the cruise route and the miles concept are labelled illustrative on screen.

### Verified

- Chrome at 1920px, and in embedded frames at 1600, 1366, 1024, 768, 390, and 375px: all ten chapters render, no horizontal overflow, mobile layouts as designed, drawer lists "Experiências" as active.
- Reverse scroll: the computed styles of the cruise chapter are identical when reached from above and from below; jumps between distant chapters settle on the right frame.
- Progress dots scroll to their chapter and set `aria-current`; both final CTAs have the right targets; client navigation in (navbar) and out (CTA → `/destinos`) works.
- `tsc` and ESLint clean on the new files and `Navbar.tsx`; no console errors after the hydration fix (rounded map values).

### Not verified

- `prefers-reduced-motion` (could not be emulated in the test browser) — implemented, not observed.
- Real touch scrolling, real mouse-wheel/trackpad feel, and frame rate on actual devices — the automated tab only renders frames on demand.
- The WhatsApp link was checked by its `href`, not opened.
- `npm run build` was not run.

### What was NOT changed

- Home, `ScrollPlane`, Destinos, Milhas, Grupo de Ofertas, Atendimento, booking/Duffel, all forms, and the Footer (which therefore does not link to `/experiencias`).

---

## [Footer links, business hours, and contact cards] — 2026-10-07

- **Footer "Links Rápidos"** (`src/components/layout/Footer.tsx`): "Passagens" replaced by "Grupo de Ofertas" → `/grupo-de-ofertas`. The list now matches the navbar: Início, Destinos, Milhas, Grupo de Ofertas, Atendimento.
- **Business hours removed:** the line "Seg–Sex, 9h às 18h" was deleted from the footer contact column (all pages) with nothing put in its place. E-mail, phone, and the three social icons are unchanged.
- **`/atendimento`** (`src/app/atendimento/page.tsx`): the "Atendimento Personalizado" card (hours + "Agendar conversa") was removed. WhatsApp and E-mail cards remain, in a two-column grid limited to `max-w-3xl` so they align with the form; stacked on mobile. The form itself was not touched.
- Verified on `/`, `/destinos`, `/milhas`, `/grupo-de-ofertas`, `/atendimento` (served HTML): no "Seg–Sex", "Atendimento Personalizado", or "Agendar conversa" anywhere; footer contacts and form intact; `tsc` and ESLint clean. Not checked visually in a browser.
- Still present, on purpose: "resposta em até 2 horas úteis" on the E-mail card and under the form.

---

## [Atendimento form — opens WhatsApp with a pre-filled message] — 2026-10-07

**Summary:** The "Envie sua solicitação" form on `/atendimento` no longer shows a fake success screen. "Solicitar Atendimento" now validates the form and opens Alvea's WhatsApp with a message built from the answers; the visitor reviews it and presses "Enviar" there. Nothing is sent automatically and there is no backend.

### Changes

- `src/app/atendimento/page.tsx` — submit handler replaced; all five fields (Nome, E-mail, Telefone, Destino desejado, Mensagem) are required with inline messages under each field (`noValidate`, no `alert()`); labels associated with inputs; the "Mensagem enviada!" branch and its state removed. Fields, layout, and button styling unchanged.
- `src/lib/atendimento/whatsapp-message.ts` (new) — `validateContactRequest()` and `buildContactRequestMessage()`.
- `src/lib/utils/wa-emojis.ts` — `email` and `globe` constants added.
- Link built with the existing `buildWhatsAppUrl()` / `WHATSAPP_NUMBER` (`api.whatsapp.com/send`, `encodeURIComponent`), opened in a new tab.

### Verified

- Empty submit shows the five messages and opens nothing; a malformed e-mail is flagged; a complete form opens exactly one WhatsApp URL.
- The decoded message matches the specified structure with Nome, E-mail, Telefone, Destino, and Mensagem in place, correct emoji code points, and no "undefined"/"null".
- `tsc` and ESLint clean; no console errors.
- The WhatsApp URL was captured in the test instead of being opened, so the pre-filled text inside WhatsApp itself (desktop and mobile) was not observed.

### What was NOT changed

- The three contact cards above the form, Milhas forms, Grupo de Ofertas, booking WhatsApp messages, Navbar, Footer

---

## [Milhas page — Venda and Gestão with WhatsApp questionnaires] — 2026-10-06

**Summary:** Reformulated `/milhas` around two services of equal weight — **Venda de Milhas** and **Gestão de Milhas** — each opening a stepped modal questionnaire that ends in a pre-filled WhatsApp message. Only this page and its own components were changed.

> **Sale questionnaire simplified (same day)** — this supersedes the field list for "Venda de Milhas" further down in this entry:
> - Removed "Há quanto tempo possui essas milhas?", "As milhas estão disponíveis atualmente?", and "Observações" from the UI, state, validation, summary, and WhatsApp message.
> - The three programme buttons were replaced by `ProgramCombobox` (new file `src/components/milhas/ProgramCombobox.tsx`): a searchable list of 22 programmes plus "Outra companhia/programa", which reveals the required field "Qual companhia ou programa?". The typed name is what goes into the message.
> - Steps are now "Seus dados" → "Suas milhas" → "Revisão e envio". Required: nome, WhatsApp, companhia/programa (and its name when "Outra"), quantidade.
> - Message label changed to "Companhia/Programa"; the message contains only Nome, WhatsApp, Companhia/Programa, Quantidade.
> - The `pin` emoji constant, used only by a removed line, was dropped from `wa-emojis.ts`.
> - Files: `SellMilesModal.tsx`, `ProgramCombobox.tsx` (new), `whatsapp-messages.ts`, `wa-emojis.ts`. `ManagementModal.tsx`, `FormFields.tsx`, `MilesModal.tsx`, and the page were not touched.
> - Verified: removed questions absent; search for "Azul", "LATAM", "Smiles", "emir", "avios", and a nonsense term (only "Outra" remains); "Outra" shows the extra field and blocks advancing while it is empty; `100000` → `100.000`; message labels are exactly the four expected; list selection works at 390px with no overflow; `tsc` and ESLint clean; no console errors. Not verified: keyboard operation of the list with real key presses.

> **Gestão questionnaire replaced by the official 17-question form (same day)** — this supersedes the "Gestão" field list further down in this entry:
> - New data file `src/lib/milhas/management-questionnaire.ts` holds the 17 questions exactly as supplied by Alvea (wording, options, order, spellings). The form, the review, and the WhatsApp message are all generated from it.
> - Steps (7): O que é a Gestão (explanation, kept) → Seus dados (Nome, E-mail, Telefone) → Perfil de consumo (1–5) → Conhecimento e viagens (6–10) → Perfil de viagem e cartões (11–14) → Oportunidades e potencial (15–17) → Revisão e envio.
> - Required: Nome, E-mail, Telefone, and questions 11, 12, 13, 15, 17. Question 10 is free text. Questions 2, 3, and 16 accept several answers; in question 2 "Não" is exclusive.
> - `ChoiceGroup` (in `FormFields.tsx`) redesigned: square check box on every card (single and multiple), strict two-column grid with equal width and equal height per question, "Obrigatória" tag, cascade entrance, and animated selection. `TextField` gained the `email` type.
> - New review step with per-section "Editar". Final button is "Enviar para a Alvea".
> - `buildManagementMessage(contact, answers)` rewritten: "MEUS DADOS" + "MEU PERFIL" with numbered short labels, bullets for multiple answers, unanswered questions omitted. `isValidEmail` added. Emoji constants used only by the old message were removed from `wa-emojis.ts`.
> - Files: `ManagementModal.tsx`, `FormFields.tsx`, `whatsapp-messages.ts`, `wa-emojis.ts`, `management-questionnaire.ts` (new). `SellMilesModal.tsx`, `ProgramCombobox.tsx`, `MilesModal.tsx`, the page, and the cards were not changed.
> - Verified: 16 choice questions + 1 text question rendered (113 options in total), each with the expected option count; required tags on 11, 12, 13, 15, 17 only; validation of the three contact fields (empty and malformed) and of the required questions; optional step passes empty; answers kept when going back and forward; question 16 holds three selections; "Não" exclusivity in question 2; every card of a question identical in size on desktop (320px wide, two columns) and mobile (327px, one column) with the check box centred; header and footer stay fixed while the middle scrolls; review lists all 20 items; message contains only answered items with no "undefined"/"null"; Esc closes; no horizontal overflow; no console errors; `tsc` and ESLint clean. Not verified: reduced-motion rendering, keyboard-only use with real key presses, and the message as received inside WhatsApp.

### Removed from the page

- Cards "Compra de Milhas", "Consultoria Especializada", "Estratégias Inteligentes" and their CTAs
- Stats strip ("100k+ Milhas negociadas", "R$5M+", "98%") and the bottom "Fale com um especialista" CTA
- Feature lines that promised specifics ("Pagamento em 24h", etc.)

### Added

- **`src/app/milhas/page.tsx`** (rewritten) — header (badge, H1, subheadline) and two cards; opens the modals.
- **`src/components/milhas/MilesModal.tsx`** — shared modal shell: portal, dialog semantics, Esc, focus trap and focus return, scroll lock, step indicator, progress bar, animated step transitions, footer buttons.
- **`src/components/milhas/FormFields.tsx`** — `TextField` and `ChoiceGroup` (real radio/checkbox inputs, check mark + colour for selection).
- **`src/components/milhas/SellMilesModal.tsx`** — 3 steps: Nome, WhatsApp → Programa (Azul / LATAM Pass / Smiles), Quantidade, Tempo, Disponibilidade → Observações + summary + "Enviar para a Alvea".
- **`src/components/milhas/ManagementModal.tsx`** — 4 steps: explanation of the service → Nome, WhatsApp, objetivos (multiple), programas (multiple) → cartão, quantidade aproximada, frequência, objetivo de viagem → "Conte um pouco mais" + "Quero conhecer a Gestão".
- **`src/lib/milhas/whatsapp-messages.ts`** — message builders and input formatters.

### Shared files touched (additions only)

- `src/lib/config/links.ts` — new `WHATSAPP_NUMBER` (the official number already used by the site) and `buildWhatsAppUrl()`. The project had no central constant; the older flows (booking, footer, atendimento) still hardcode the number and were **not** refactored.
- `src/lib/utils/wa-emojis.ts` — eight new emoji constants appended; existing ones unchanged, so booking messages are unaffected.

### Behavior

- No backend, API, storage, or logging: answers live only in component state and in the WhatsApp link.
- Link: `https://api.whatsapp.com/send?phone=…&text=…` (not `wa.me`), text encoded once with `encodeURIComponent`, opened in a new tab through a real anchor.
- Unanswered fields are omitted from the message.
- Required: Venda — nome, WhatsApp, programa, quantidade, tempo, disponibilidade. Gestão — nome, WhatsApp, at least one objetivo. Everything else is optional.
- No prices, fees, percentages, deadlines, or guaranteed results are stated.
- `main` on this page is now `overflow-hidden`; previously its decorative orbs made the document wider than the viewport on narrow screens.

### Verified

- Two cards only; equal size on desktop; 2 columns from 768px, 1 column at 390px; no horizontal overflow at 1920, 1366, 1024, 768, 390px.
- Venda: opens, validation on steps 1 and 2 (including an incomplete phone), `abc50000x` → `50.000`, Voltar keeps answers, final link is `api.whatsapp.com/send` with `target="_blank"`, "Observações" absent when empty and present when filled.
- Gestão: opens on the explanation (7 examples, 5 steps), validation, multiple selection toggling on and off, unanswered fields absent from the message, no "undefined/null".
- Emoji in both messages decode to the intended code points.
- Esc and the close button both close; body scroll is restored.
- Mobile modal 374×684 in a 390×700 viewport; inputs and buttons 50px tall.
- `tsc --noEmit` passes; ESLint clean for all new/changed files; no console errors.
- Not verified: the message as it arrives inside WhatsApp (links were inspected, not sent), keyboard-only navigation and the focus trap with real Tab presses, and reduced-motion rendering.

### What was NOT changed

- Homepage, Hero, `ScrollPlane`, Grupo de Ofertas, Destinos, Duffel, BookingModal, autocomplete, Navbar, Footer, Atendimento, booking WhatsApp messages, global styles

---

## [Grupo de Ofertas — new page and navbar entry] — 2026-10-06

**Summary:** Added the `/grupo-de-ofertas` landing page promoting Alvea's WhatsApp offers group, and replaced the "Passagens" navbar item with "Grupo de Ofertas".

> **Revised the same day** after two new inputs from the owner — this supersedes the placeholder link, the 16:9 video card, and the section order described further down in this entry:
> - **Official group link set:** `WHATSAPP_GROUP_URL = https://chat.whatsapp.com/BzUhRCfOMebDQ95Uzk22j6` in `src/lib/config/links.ts`. Both CTAs are now real links opening in a new tab; no other WhatsApp link in the site was touched.
> - **Vertical video (9:16):** the hero became a two-column composition — badge, headline, subheadline, and CTA on the left; the video in a 9:16 glass frame on the right (282px wide ≈ 487px tall on desktop, 320px on tablet, `min(100%, 360px)` on mobile). Below 1024px it stacks as badge → headline → text → CTA → video. The separate horizontal video section was removed.
> - **Video file is in place:** `public/videos/grupo-ofertas.mp4` (1440×2560, 30 s, ~44 MB) plays in the frame with native controls and no autoplay. The 9:16 placeholder remains as the fallback when the file is missing.
> - **Copy and order:** headline "Seu próximo destino pode estar mais perto do que você imagina."; sections now run Hero → benefits → "Como funciona" → final CTA; metadata description is "Receba promoções e oportunidades de viagem da Alvea Viagens diretamente no WhatsApp."
> - **Motion:** the video frame is the fifth step of the hero sequence (`opacity 0→1`, `scale 0.96→1`, `y 20→0`, `0.9s`).
> - **Verified:** ratio 0.5625 at 390, 768, 1024, 1366, 1920px with no horizontal scrollbar; both CTAs carry the official link with `target="_blank"`; navbar active state; no console errors; `tsc` and ESLint clean for the changed files. Not verified in a browser: reduced-motion rendering, and the placeholder at 9:16 (the real file was already present).

> **Video refinements (same day):**
> - Desktop frame enlarged about 20%: `lg:w-[282px]` → `lg:w-[338px]` (≈587px tall with the frame). Tablet (320px) and mobile (`min(100%, 360px)`) unchanged. Still 34px clear of the navbar.
> - **Custom fullscreen** so the vertical video is never stretched or cropped on a landscape screen: the 9:16 container goes fullscreen and the video inside is sized `min(100vw, 100vh×9/16)` × `min(100vh, 100vw×16/9)`, `object-contain`, centred on dark navy. New corner button (enter/exit), Esc exits, native fullscreen control hidden with `controlsList="nofullscreen"`, CSS fallback for browsers that ignore it, native fallback on iPhone. Play, pause, volume, and progress are the native controls, unchanged; audio behavior unchanged.
> - Only `VideoShowcase` in `OffersGroupContent.tsx` changed.
> - Verification: sizes and ratio measured at 1920, 1366, 1024, 768, 390px. The fullscreen layout was verified by emulating the fullscreen state (container forced to the viewport, `fullscreenchange` dispatched): 532×945 centred at 1920×945, 394×700 centred at 1366/1024/768×700, 390×693 at 390×700 — ratio 0.5625 every time, and the mockup returns to normal afterwards. **Real browser fullscreen could not be exercised**: the automated Chrome window refused `requestFullscreen()`, so the button → fullscreen → Esc path still needs a manual check.

### What was added

- **`src/app/grupo-de-ofertas/page.tsx`** — Server Component. Page-specific metadata ("Grupo de Ofertas | Alvea Viagens") and a server-side check for the optional video file.
- **`src/components/grupo-ofertas/OffersGroupContent.tsx`** — Client Component with the page UI: hero, video showcase, "Como funciona" (3 steps), "O que o grupo oferece" (4 cards), final CTA. Reuses `GlassCard` and the existing global utilities.
- **`src/lib/config/links.ts`** — `WHATSAPP_GROUP_URL` (placeholder `COLOCAR_LINK_DO_GRUPO_AQUI` — the real invite link goes here) and the video path constants.
- **`public/videos/.gitkeep`** — folder ready for `public/videos/grupo-ofertas.mp4`.

### Navbar

- `src/components/Navbar.tsx` — `Passagens → /passagens` replaced by `Grupo de Ofertas → /grupo-de-ofertas` (desktop nav and mobile drawer share the same list).
- Spacing only: nav gap is `gap-5` between `md` and `lg` (still `gap-7` from `lg`), and links are `whitespace-nowrap`. Without this the longer label wrapped to two lines around 768–800px and made the navbar 5px taller.
- The `/passagens` page was not removed and the footer was not changed, so the footer still links to it.

### Behavior notes

- **Group link not configured yet:** the CTA renders as an inert button and the hero shows "O link do grupo será disponibilizado em breve". No link was invented.
- **Video not added yet:** a styled placeholder is shown; no `<video>` tag is rendered and no request is made. Adding `public/videos/grupo-ofertas.mp4` switches the same card to a player (`controls`, `playsInline`, `preload="metadata"`, no autoplay). In production this takes effect on the next build.
- No statistics or social proof were added.

### Motion

Framer Motion only: staged hero entrance, video card fade + `0.96→1` scale, staggered cards on viewport entry, final CTA fade-up. All of it is reduced to short fades under `prefers-reduced-motion`. Details in `docs/animations.md`.

### Verified

- `/grupo-de-ofertas` renders with the correct title/description; navbar link opens it and shows the active state.
- "Início", "Destinos", "Milhas", "Atendimento" still navigate correctly; `/passagens` still responds.
- Navbar stays on one line at 94px height from 768px up; mobile drawer unaffected.
- No horizontal scrollbar at 390, 768, 790, 850, 1024, 1280, 1920px; card grids collapse to one column on mobile.
- With a dummy file at the video path the `<video>` element is rendered; without it, the placeholder. The dummy file was removed.
- No console errors; `tsc --noEmit` passes; ESLint clean for all new/changed files (the 3 pre-existing errors in booking components are unchanged).
- Not verified in a browser: reduced-motion rendering (implemented via `useReducedMotion`, requires the OS setting) and playback of a real video file.

### Files created

- `src/app/grupo-de-ofertas/page.tsx`
- `src/components/grupo-ofertas/OffersGroupContent.tsx`
- `src/lib/config/links.ts`
- `public/videos/.gitkeep`

### Files modified

- `src/components/Navbar.tsx`
- `docs/pages.md`, `docs/components.md`, `docs/animations.md`, `docs/changelog.md`

### What was NOT changed

- Duffel, API route, booking flow, filters, airport autocomplete, booking WhatsApp messages
- Homepage (Hero, Benefits, Quem Somos, HomeCTA, `ScrollPlane`), `/destinos`, `/milhas`, `/atendimento`, `/passagens`, Footer
- Global styles, Tailwind config, dependencies

---

## [Scroll airplane — realistic artwork and larger size] — 2026-10-06

**Summary:** Replaced the airplane artwork of the scroll fly-over with a photorealistic top-down airliner and increased its on-screen size. The animation logic is unchanged.

### Changes

- **`public/images/plane-scroll.webp`** — replaced (same path and name). New asset: 1600×1297 WebP with real alpha, ~71 KB. Modern twin-engine wide-body seen from above, nose pointing right, white/silver with navy accents, no airline name or logo, no background or cast shadow.
  - Source: AI-generated image (Canva image generation, 1456×1088) with the background removed in Canva. Because the Canva Free plan cannot export transparent PNGs, the image was exported on a black and on a white page and the alpha channel was rebuilt locally by difference matting, then trimmed and resized to 1600px wide.
- **`src/components/home/ScrollPlane.tsx`** — size only:
  - plane width `clamp(150px, 34vw, 520px)` → `clamp(200px, 52vw, 660px)`
  - `next/image` intrinsic `height` 1333 → 1297 and `sizes` updated to match the new width

> **Superseded later the same day:** the owner supplied the final artwork as `public/images/plane-scroll.png` (1672×941). The component now points to that file, the `.webp` no longer exists, the image width is `clamp(240px, 60vw, 820px)` (visible aircraft ~670px max), and the CSS `drop-shadow` on the image was removed so the art is shown untouched. Animation logic still unchanged.

### What was NOT changed

- `useScroll` target and offsets, `useTransform` ranges (x, y, rotate, scale, opacity), reduced-motion variant, portal, fixed layer, z-index, overflow handling, contrails
- Homepage structure and every other section

### Verified

- Desktop (1920 and 1366px wide): plane 660px, crosses over the Benefits cards, heading matches the flight path, same behavior scrolling down and back up
- 768px: plane 397px · 390px: plane 201px
- No horizontal scrollbar at any of these widths; transparent edges clean on the dark background; no console errors
- `tsc --noEmit` passes; ESLint clean for the component

### Files modified

- `public/images/plane-scroll.webp`, `src/components/home/ScrollPlane.tsx`
- `docs/animations.md`, `docs/components.md`, `docs/changelog.md`

---

## [Scroll-driven airplane animation] — 2026-10-06

**Summary:** Added a scroll-linked airplane fly-over to the homepage. While the user scrolls from the Hero into the Benefits section, an airplane enters from the bottom-left, crosses the viewport diagonally in front of the content, and exits at the top-right. Scrolling back reverses it.

### What was added

- **`src/components/home/ScrollPlane.tsx`** (new client component) — wraps a section and drives the plane from that section's scroll progress with Framer Motion `useScroll` + `useTransform` (`x`, `y`, `rotate`, `scale`, `opacity`). The plane lives in a `fixed`, `pointer-events-none`, `aria-hidden` layer portalled to `<body>` at `z-30` (under the navbar), which clips its own overflow.
- **`public/images/plane-scroll.webp`** (new asset) — top-view airliner, transparent background, 1600×1333, ~54 KB. Created for this feature in the brand palette; no external URL is used.

### Integration

- `src/app/page.tsx` — `<Benefits />` is now rendered as `<ScrollPlane><Benefits /></ScrollPlane>`. The page remains a Server Component. No section was removed, reordered, or restyled, and no scroll height was added.

### Design decisions

- **Position:** tied to Benefits, so the flight works as the transition out of the Hero rather than as an extra section.
- **Portal + fixed instead of sticky:** the homepage `<main>` is `overflow-hidden` (breaks `sticky`) and `template.tsx` leaves a `filter` on its wrapper (breaks `fixed` for descendants).
- **`vw` units on both axes:** constant ~14° climb on every screen, no `window.innerWidth` read.
- **Reduced motion:** `useReducedMotion()` replaces the flight with a small, static, half-opacity plane that only fades.

### Verified

- Plane position follows scroll in both directions (1920px viewport); off-screen before ~10% and after ~88% of the range.
- No horizontal scrollbar at 1920, 1366, 768, and 390px widths; plane widths 520 / 463 / 260 / 150px.
- Element under the plane is the page content, not the plane layer (clicks pass through).
- Layer is removed when navigating to another page; `BookingModal` and the airport autocomplete on `/destinos` work as before.
- `tsc --noEmit` passes; ESLint clean for the new and changed files; no console errors or hydration warnings.
- Not verified in a browser: the reduced-motion variant (requires the OS setting) and real touch scrolling on a device.

### Files created

- `src/components/home/ScrollPlane.tsx`
- `public/images/plane-scroll.webp`

### Files modified

- `src/app/page.tsx`
- `docs/animations.md`, `docs/components.md`, `docs/changelog.md`

### What was NOT changed

- Hero, Benefits, Quem Somos, HomeCTA, Navbar, Footer, logo, texts, links, CTAs
- Global styles (`globals.css`), Tailwind config, dependencies
- Any of the open issues listed in the October 2026 audit

---

## [Full Project State Audit — October 2026] — 2026-10-06

**Summary:** Read-only audit of the entire project after a long pause, to re-establish an accurate picture of the code before development resumes. **No code, configuration, or dependency was changed.** Only documentation under `docs/` was updated so that it describes the code as it really is.

### What was done

- Read every file under `src/` and all root configuration files.
- Recorded installed versions (`npm ls`), outdated packages, and `npm audit` results — nothing fixed or upgraded.
- Ran `tsc --noEmit` (passes) and `eslint src` (3 errors).
- Exercised `POST /api/flights/search` on the local dev server, including one real test-mode search.
- Inspected the compiled CSS to see which Tailwind classes are actually generated.
- Checked that all 28 destination photo URLs load.
- Compared the docs with the code and listed the differences.

### Main findings

- The Duffel integration is complete and connected end to end (search → outbound → return → summary → WhatsApp), on a **test** key, with prices in **USD** and no BRL conversion. Each price is the Duffel offer total for the round trip and all passengers.
- The airline filter is fully removed with no leftover code. No AirportDB / API Ninjas code or variables exist. Airport search is entirely local (147 airports).
- Messages to WhatsApp use `api.whatsapp.com/send`; `wa.me` remains only on three plain links without text.
- The five updated destination photos (Orlando, Toronto, Punta Cana, Doha, Abu Dhabi) are in the code.
- Problems found include: 17 `npm audit` vulnerabilities (mostly Next.js 15.3.3); lint errors expected to break the production build; almost all work since May uncommitted; API error messages never shown to the user; "no flights" displayed as an error with the WhatsApp fallback unreachable; flight numbers rendered as `TPnull`; contact form discarding submissions; Hero CTAs without action; about 60 Tailwind opacity classes that generate no CSS; no rate limiting; booking step 1 not usable by keyboard.

Full detail, evidence, severity classification, and recommended next steps: [project-state-audit-2026-10.md](./project-state-audit-2026-10.md).

### Files created

- `docs/project-state-audit-2026-10.md`

### Documentation updated

- `docs/README.md` — installed versions, folder tree (booking components, `src/lib`, API route), environment note, real asset sizes, link to the audit
- `docs/architecture.md` — API route, request lifecycle, real deduplication key, state held by `BookingModal`, actual image strategy
- `docs/components.md` — corrected Hero, Benefits, CloudBackground, HomeCTA, Navbar, Footer; removed airline-filter references; added pricing/format details and known defects for booking components
- `docs/pages.md` — real destination list and type, real CTA targets and labels, client/server flags, real contact-form behavior
- `docs/booking-flow.md` — real error/empty behavior, state hand-off between phases, currency and formatting, corrected labels and z-index
- `docs/integrations.md` — two WhatsApp endpoints, Duffel as an active integration, environment variables
- `docs/technical-decisions.md` — real deduplication key, current price labels, airport count
- `docs/future-roadmap.md` — completed items moved, audit-based priorities added, dependency table refreshed
- `docs/development-guidelines.md` — known deviations from the rules in the current code
- `docs/known-issues.md` — open issues from the audit
- `docs/changelog.md` — this entry

### What was NOT changed

- Any file outside `docs/` — no source code, configuration, `package.json`, lockfile, or assets
- No dependency installed, removed, or updated; `npm audit fix` was not run
- No bug was fixed and no behavior was altered
- Lower-priority docs (`ai-context.md`, `project-overview.md`, `destinations.md`, `animations.md`, `design-system.md`, `branding.md`, `assets.md`, `docs/features/*`) were not rewritten and still contain some stale statements listed in the audit's "Documentation Drift" section

---

## [Phase 3.5 — UX & Trust Improvements: Pricing Clarity + Fare Conditions] — 2026-07-16

**Summary:** Exposed Duffel's `base_amount`, `tax_amount`, and `conditions` fields throughout the booking flow to eliminate pricing ambiguity and give users accurate fare-condition information.

### Background

The Duffel integration audit confirmed that each Offer already contains one indivisible round-trip price (`total_amount`) plus a base fare, tax breakdown, and refund/change conditions. None of this was reaching the UI. The result: users saw "A partir de USD 663" in Step 1 and the identical "USD 663" in Step 2, creating the impression that the return flight was free.

### Changes

**`src/lib/types/flights.ts` — 5 new fields on `FlightOffer`**
- `baseAmount: number` — pre-tax base fare from `offer.base_amount`
- `taxAmount: number | null` — taxes from `offer.tax_amount`; null when not reported
- `refundAllowed: boolean | null` — `conditions.refund_before_departure.allowed`; null if not reported
- `changeAllowed: boolean | null` — `conditions.change_before_departure.allowed`
- `changePenalty: number | null` — rebooking fee in `currency`; null if free or unknown

**`src/lib/providers/duffel-provider.ts` — `normalizeOffer`**
- Added mapping for all 5 new fields

**`src/components/booking/FlightCard.tsx` — Price section**
- Added `priceSectionTitle?: string` — section header rendered above `priceLabel` (e.g. "VIAGEM COMPLETA")
- Added `priceCaption?: string` — small muted line below price; defaults to existing fallback text

**`src/components/booking/BookingModal.tsx` — FlightCard call sites**
- Outbound cards: `priceSectionTitle="Viagem completa"` · `priceLabel="A partir de"` · `priceCaption="Valor total de ida e volta"`
- Return cards: `priceSectionTitle="Itinerário selecionado"` · `priceLabel="Valor total da viagem"` · `priceCaption="Valor total de ida e volta"`

**`src/components/booking/TripSummary.tsx` — Price section**
- Header changed from "Total ida + volta" to "Valor total da viagem"
- Price breakdown (preço base + taxas + total) shown when `offer.taxAmount != null`
- Always-visible "Inclui" checklist: ✓ Ida · ✓ Volta · ✓ Taxas da companhia
- Fare conditions badges (emerald for allowed, muted for restricted):
  - Alteração permitida / Alteração · `currSym penalty` / Sem alteração
  - Reembolsável / Não reembolsável
  - Hidden entirely when `refundAllowed === null && changeAllowed === null`

**`src/components/booking/TripSummary.tsx` — `buildWaMessage`**
- Section renamed from "VALOR DE REFERÊNCIA (IDA + VOLTA)" to "VALOR DA VIAGEM"
- Price breakdown included when `taxAmount != null`
- "✓ Inclui" checklist added (Ida, Volta, Classe, Passageiros, Cia. aérea)
- Fare conditions appended as italic line when available

### Files modified

- `src/lib/types/flights.ts`
- `src/lib/providers/duffel-provider.ts`
- `src/components/booking/FlightCard.tsx`
- `src/components/booking/BookingModal.tsx`
- `src/components/booking/TripSummary.tsx`
- `docs/changelog.md`
- `docs/booking-flow.md`
- `docs/components.md`

---

## [Scroll Reset Between Flight Steps] — 2026-07-16

**Summary:** The modal's scroll container now resets to the top when advancing from outbound → return and from return → summary, so users always begin each step at the start of the list.

### Problem

The scroll container (a single DOM element wrapping all phase content) retains its position across `AnimatePresence` transitions. A user who scrolled to the bottom of the outbound list landed halfway through the return list after selecting their outbound flight.

### Fix

- Added `scrollContainerRef` (a `useRef<HTMLDivElement>`) attached to the `overflow-y-auto flex-1 min-h-0` scroll container div.
- Added a `useEffect` watching `flightPhase`: when it becomes `'return'` or `'summary'`, calls `scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' })`.
- Only fires on forward transitions — backward navigation (e.g. "Alterar") preserves scroll so the user can continue browsing where they were.

No pixel values, no `window.scrollTo`, no layout changes.

### Files modified

- `src/components/booking/BookingModal.tsx`
- `docs/changelog.md`

---

## [Flight Filters — Airline Removal, Period Reorder, Panel Compaction] — 2026-07-16

**Summary:** Removed the airline (Cia) filter, reordered departure period pills to the natural Brazilian order, reduced filter panel height, and fixed residual sticky-panel clipping.

### Changes

**Airline filter removed (`FlightFilters.tsx`, `BookingModal.tsx`)**
- Deleted `airlines: string[]` from `FilterState` and `DEFAULT_FILTERS`
- Removed `availableAirlines` prop from `FlightFilters` and all call sites
- Removed the airline filter row JSX block
- Removed `if (f.airlines.length > 0)` branch from `applyFilters`
- Removed `outboundAirlines` and `returnAirlines` useMemo derivations

**Departure period order (`FlightFilters.tsx`)**
- Old order: Manhã → Tarde → Noite → Madrugada
- New order: Madrugada → Manhã → Tarde → Noite (chronological, natural for Brazilian users)

**Panel height reduction (`FlightFilters.tsx`, `BookingModal.tsx`)**
- Row gap reduced from `gap-2` (8 px) to `gap-1.5` (6 px) — saves 2 px per row gap
- Filter container vertical padding reduced from `py-2.5` (10 px) to `py-2` (8 px) per side
- Net result: panel is ~10 px shorter with three rows vs. the previous four-row layout

**Sticky panel clipping fix (`BookingModal.tsx`)**
- Scroll-content wrapper bottom padding increased from `pb-2` (8 px) to `pb-4` (16 px)
- Ensures the last flight card is always fully clear of the scroll container's lower edge, matching the `pt-4` top padding for symmetric whitespace

### Files modified

- `src/components/booking/FlightFilters.tsx`
- `src/components/booking/BookingModal.tsx`
- `docs/changelog.md`

---

## [Sticky Filter Panel — Last Card Clipping Fix] — 2026-07-16

**Summary:** Fixed a layout bug where the last flight card was partially hidden when scrolling to the bottom of the outbound or return results list.

### Root cause

The modal container had no flex layout, so all its children (hero, progress bar, phase label, filter bar, scroll container, footer) stacked as normal block elements. The scroll container used a hardcoded `maxHeight: calc(92vh - 13rem)` calibrated before the filter bar existed.

With the filter bar visible, the sum of all elements exceeded the modal's `maxHeight: 92vh`. The modal's `overflow: hidden` clipped the bottom of the scroll container, hiding the last cards when scrolled into that clipped region.

### Fix

Two-line change in `BookingModal.tsx`:

1. Added `flex flex-col` to the modal container — activates `shrink-0` on all fixed-height siblings.
2. Replaced `style={{ maxHeight: 'calc(92vh - 13rem)' }}` on the scroll container with `className="... flex-1 min-h-0"`.

With `flex-1 min-h-0`, the flex algorithm automatically gives the scroll container all remaining vertical space after the hero, phase label, filter bar, and footer take their natural heights. No hardcoded numbers. The calculation is correct for every combination of visible elements (form steps, searching state, outbound/return phases with or without filter bar, summary).

`min-h-0` is required because flex children default to `min-height: auto`, which prevents shrinking below content height and would break scrolling.

### Files modified

- `src/components/booking/BookingModal.tsx` — two-line fix

---

## [Phase 3 — Complete Round-Trip Flight Experience] — 2026-07-16

**Summary:** Replaced the single-step flight result list with a Google Flights-style two-step selection flow: choose outbound flight → choose return flight → view trip summary → WhatsApp CTA. Includes a reusable component library, client-side filter system, and a new WhatsApp message that includes both flight legs.

### Problem

The previous step 6 (`RealFlightCard` list) showed only the outbound flight information per card, even though Duffel returns full round-trip offers containing both slices. Users had no way to see or choose the return flight; they just selected a "cheapest outbound" deal with an invisible return.

### New flow

```
Steps 1-5 (form, unchanged)
  → Searching skeleton
  → Outbound list (filter/sort bar · FlightCard per unique outbound · "Selecionar voo de ida")
  → Return list (SelectedFlightBanner · filter/sort · FlightCard per paired return · "Selecionar voo de volta")
  → Trip summary (outbound + return SliceRow · total price · WhatsApp CTA)
```

### Backend changes (minimal — Duffel request is unchanged)

- **`FlightSlice`** (`src/lib/types/flights.ts`): Added `airline`, `airlineCode`, `airlineLogo`, `flightNumber`, `departureDate`, `arrivalDate` so return flight cards can render without deep segment access.
- **`normalizeSlice`** (`duffel-provider.ts`): Populates the new `FlightSlice` fields from `firstSeg.operating_carrier.*` and `extractDate()`.
- **`buildDeduplicationKey`** (`duffel-provider.ts`): Extended from 7 outbound fields to 8 fields including return slice `airlineCode|flightNumber|departureTime|arrivalTime`. Now keeps one offer per unique (outbound, return) pair instead of one per unique outbound. The frontend collapses outbound duplicates for the outbound list.

### New utility

- **`src/lib/utils/wa-emojis.ts`** — Centralises all `String.fromCodePoint()` emoji constants. Both `BookingModal` and `TripSummary` import from here; no duplication.

### New components

| File | Purpose |
|---|---|
| `src/components/booking/FlightCard.tsx` | Reusable card for both outbound and return display. Accepts flat flight-info props + `onSelect` callback. Stagger animation capped at 6 cards (480ms max delay). |
| `src/components/booking/FlightFilters.tsx` | Sticky filter/sort bar. Exports `FilterState`, `DEFAULT_FILTERS`. Filters: sort (price/duration/earliest/latest), stops (direct/1/2+), departure period (morning/afternoon/evening/night), airline toggle pills. |
| `src/components/booking/SelectedFlightBanner.tsx` | Compact banner shown during the return step, confirming the selected outbound with an "Alterar" button. |
| `src/components/booking/TripSummary.tsx` | Final summary — two `SliceRow` sections (outbound + return) + total price box + WhatsApp CTA. Builds the complete dual-flight WhatsApp message internally. |

### BookingModal changes

- New state: `flightPhase: 'outbound' | 'return' | 'summary' | null`, `selectedOffer`, `matchedOffer`, `filters`.
- `activeKey` extended: `step1–5` | `searching` | `outbound` | `return` | `summary`.
- `performSearch` sets `flightPhase('outbound')` instead of `setStep(6)`.
- `useMemo` for: `uniqueOutbound`, `returnOffers`, `filteredOutbound`, `filteredReturn`, `outboundAirlines`, `returnAirlines`.
- Helper functions (module-level, pure): `buildOutboundKey`, `buildReturnKey`, `getUniqueOutboundOffers`, `getReturnOffersFor`, `applyFilters`.
- Progress bar hidden in flight phases; replaced by a "Passo 1/2" label.
- Filter bar rendered above `AnimatePresence` as a sticky element.
- Footer adapts to each phase: outbound (edit search) → return (back to outbound + edit) → summary (back to return).
- WhatsApp CTA moved from individual cards to `TripSummary` only. Contains both flight legs.
- `RealFlightCard` removed; `EMOJI` constant removed (now from shared module).

### WhatsApp message — new format

The `TripSummary` WhatsApp message now includes:
- Search summary (origin → destination, dates, passengers, class)
- **VOO DE IDA SELECIONADO** — airline, flight number, departure/arrival with date, duration, stops
- **VOO DE VOLTA SELECIONADO** — same fields for the return leg
- **VALOR DE REFERÊNCIA (IDA + VOLTA)** — Duffel `total_amount` (already the full round-trip price)

### Files created

- `src/lib/utils/wa-emojis.ts`
- `src/components/booking/FlightCard.tsx`
- `src/components/booking/FlightFilters.tsx`
- `src/components/booking/SelectedFlightBanner.tsx`
- `src/components/booking/TripSummary.tsx`

### Files modified

- `src/lib/types/flights.ts` — `FlightSlice` type extended
- `src/lib/providers/duffel-provider.ts` — `normalizeSlice`, `buildDeduplicationKey`
- `src/components/booking/BookingModal.tsx` — major refactor

---

## [Destination Card Images — Landmark Photography] — 2026-07-16

**Summary:** Replaced lifestyle/people photos on five destination cards with high-quality landmark and landscape photography. Every card on the Destinations page now showcases an iconic attraction or scenery rather than a person.

### Why these were replaced

A premium travel agency's destination cards should communicate the place, not the kind of traveller who visits it. The previous images for Orlando, Toronto, Punta Cana, Doha, and Abu Dhabi contained lifestyle photos featuring people — inconsistent with the Europe and Asia sections, which already used architectural and landscape photography (Eiffel Tower, Colosseum, Sagrada Família, etc.).

### Replacements

| Destination | Previous image | New image | Source |
|---|---|---|---|
| Orlando | Lifestyle photo with people | Cinderella Castle — 50th Anniversary decorations, Magic Kingdom | Unsplash — Brian McGowan |
| Toronto | Lifestyle photo with people | CN Tower from Harbourfront waterfront, blue sky, no people | Unsplash — Sidra S |
| Punta Cana | Lifestyle photo with people | Sandy beach, palm trees, turquoise Caribbean water — no people | Unsplash |
| Doha | Generic photo | West Bay skyline at night — glowing modern skyscrapers | Unsplash |
| Abu Dhabi | Generic photo | Sheikh Zayed Grand Mosque — white marble, gold dome, blue sky | Unsplash — Nick Fewings |

### What was NOT changed

- Component structure (`DestinationCard`, `CONTINENTS` data)
- Card sizes, grid layout, hover animations
- Next.js `<Image>` configuration and remote patterns
- `color` gradients, `miles`, `desc`, `iataCode`, `name`, `country` fields
- Every other destination card (all Europe, Asia, remaining America, Oceania)

### Files modified

- `src/app/destinos/page.tsx` — five `photo:` URL values updated

---

## [ISO 8601 Duration Formatting] — 2026-07-16

**Summary:** Created `src/lib/utils/format-duration.ts` with a `formatDuration()` utility that converts ISO 8601 duration strings into compact, user-friendly labels. All duration display sites now go through this utility.

### Why Duffel returns ISO 8601

Duffel uses ISO 8601 Period format (`PnDTnHnM`) for all flight durations. This is the standard interchange format — unambiguous for machines, but unreadable for users. The P and T letters are designators, not content: `P1DT6H15M` means "1 day, 6 hours, 15 minutes". Durations shorter than one day omit the day component and appear as `PT2H15M`.

The previous code used a local `parseDurationHuman()` function whose regex (`/PT(?:(\d+)H)?(?:(\d+)M)?/`) required the string to start with `PT`. For any duration containing a day component (`P1DT...`), the regex failed to match and the raw ISO string fell through unchanged — so users saw "P1DT6H15M" in the UI and in WhatsApp messages.

### Why we convert before rendering

ISO 8601 strings are suitable for data storage and API exchange. They must never appear in the UI. The conversion happens at the display layer — not at normalization time — so raw data stays raw and the formatting logic lives in one place only.

### formatDuration() specification

Regex: `/^P(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?)?$/`
- Group 1 → days
- Group 2 → hours
- Group 3 → minutes
- Returns original string if the regex does not match (safe no-op fallback)

| Input | Output |
|---|---|
| `PT45M` | `45 min` |
| `PT2H15M` | `2h 15min` |
| `PT8H` | `8h` |
| `P1DT6H15M` | `1d 6h 15min` |
| `P2DT` | `2d` |
| `P3DT4H` | `3d 4h` |
| `P1DT` | `1d` |
| `PT0M` | `0 min` |

Minute formatting rule: when minutes is the only component, a space is added ("45 min"). When it follows hours or days, it attaches directly ("2h 15min"). This matches common flight-time notation.

### Also fixed: parseDurationMinutes for multi-day flights

`parseDurationMinutes()` in `duffel-provider.ts` used the same incomplete regex and calculated zero minutes for multi-day flights (missing the 1 440 minutes per day). Updated to use the same full regex: `days × 1 440 + hours × 60 + minutes`.

### Architecture change

`FlightOffer.duration`, `FlightSlice.duration`, and `FlightSegmentSummary.duration` now store the raw ISO 8601 string from Duffel, not a pre-formatted string. Formatting is applied at render time by calling `formatDuration(offer.duration)`. This separates data from presentation and ensures any future display site automatically handles all duration lengths correctly by calling the same utility.

### Files modified

| File | Change |
|---|---|
| `src/lib/utils/format-duration.ts` | New file — `formatDuration()` utility |
| `src/lib/providers/duffel-provider.ts` | Removed `parseDurationHuman()`; fixed `parseDurationMinutes()` for days; `.duration` fields now store raw ISO |
| `src/components/booking/BookingModal.tsx` | Imported `formatDuration`; replaced both `offer.duration` display sites |
| `src/lib/types/flights.ts` | Updated `duration` field comment to document raw ISO contract |

---

## [Initial Release] — 2025 (Estimated)

**Summary:** Full project bootstrap and initial implementation.

### What was built

**Infrastructure**
- Next.js 15 project initialized with App Router and TypeScript
- Tailwind CSS configured with full custom brand theme (sky/gold palette, animations, shadows)
- PostCSS, ESLint, path aliases configured
- `src/app/globals.css` written with CSS variables, utility classes, and keyframes

**Pages**
- `/` — Homepage
- `/destinos` — Destinations page
- `/milhas` — Miles services page
- `/passagens` — Tickets page
- `/atendimento` — Contact/consultation page

**Components**
- `Navbar.tsx` — Fixed nav with scroll detection, mobile drawer
- `Footer.tsx` — 3-column footer with social links
- `Hero.tsx` — Homepage hero with headline, CTAs, trust badges, scroll parallax
- `CloudBackground.tsx` — Photorealistic animated cloud sky
- `AviationTrail.tsx` — GSAP airplane flying along SVG path
- `LogoHeroBanner.tsx` — Premium brand logo display
- `Benefits.tsx` — "Por que a Alvea?" section
- `HomeCTA.tsx` — Homepage bottom CTA
- `GlassCard.tsx` — Reusable glassmorphism card component
- `PageHeader.tsx` — Standardized page header component
- `SectionReveal.tsx` — Scroll-triggered fade-up animation wrapper
- `BookingModal.tsx` — 5-step booking flow modal with WhatsApp conversion
- `AirportAutocomplete.tsx` — Tiered search with Fuse.js fuzzy fallback

**Data**
- `airports.ts` — Local database of 160+ airports across 6 global regions

**Animations**
- Page transitions via `template.tsx`
- Hero scroll parallax and staggered entry
- Cloud blob float animations (CSS keyframes)
- Star twinkle effect
- Airplane GSAP MotionPath animation
- Section scroll reveal
- Glassmorphism card hover effects
- Button shimmer and CTA glow animations
- Mobile drawer slide animation
- Booking modal step transition (direction-aware slide)

**Integrations**
- WhatsApp pre-filled message links (no API — deep links)
- Email `mailto:` links
- Instagram external link in footer

---

## [Documentation] — 2026-07-15

**Summary:** Complete `/docs` knowledge base created.

### What was added
- `docs/README.md` — Project entry point and index
- `docs/project-overview.md` — Business context and conversion strategy
- `docs/architecture.md` — Next.js App Router structure and data flow
- `docs/design-system.md` — Full visual system documentation
- `docs/components.md` — Every component with props and behavior
- `docs/pages.md` — Every page with layout and interactions
- `docs/animations.md` — All animations explained technically
- `docs/destinations.md` — Destination data, cards, and modal integration
- `docs/booking-flow.md` — Complete customer journey
- `docs/branding.md` — Logo usage, brand rules, identity guidelines
- `docs/assets.md` — All assets with location and usage rules
- `docs/integrations.md` — Current and planned integrations
- `docs/technical-decisions.md` — Engineering decisions with rationale
- `docs/future-roadmap.md` — Planned features and improvements
- `docs/changelog.md` — This file
- `docs/development-guidelines.md` — Rules for all future development

**Reason:** Establish a persistent knowledge base so any future Claude Code session can understand the full project without prior chat history.

**Files modified:** None (new `docs/` folder and 16 new files created)

---

## [Duffel Backend — Phase 1] — 2026-07-15

**Summary:** Implemented a complete, production-grade server-side flight search backend using the Duffel API.

### What was added

**New files:**
- `src/lib/types/flights.ts` — All shared TypeScript types: `FlightOffer`, `FlightSearchRequest`, `FlightSlice`, `FlightSearchResponse`, `ApiErrorResponse`, `IFlightProvider`, and raw Duffel types
- `src/lib/duffel/client.ts` — Server-only HTTP client for Duffel; reads `DUFFEL_API_KEY`; throws on browser import; handles timeouts, auth errors, rate limits, and invalid JSON
- `src/lib/providers/duffel-provider.ts` — Duffel provider: builds offer_request, normalizes `DuffelOffer[]` → `FlightOffer[]`, maps duration and stops, sorts by price
- `src/lib/services/flight-service.ts` — Business logic: validates all 8 input fields, selects provider, logs requests/responses, maps provider errors to Portuguese user messages
- `src/app/api/flights/search/route.ts` — `POST /api/flights/search` Next.js API route; parses body, validates, calls service, returns typed JSON with proper HTTP codes
- `docs/features/flight-provider.md` — Full feature documentation

**Updated docs:**
- `docs/architecture.md` — Added backend layer section
- `docs/integrations.md` — Updated Duffel entry to reflect Phase 1 completion
- `docs/technical-decisions.md` — Added decisions #11 (provider pattern) and #12 (raw fetch vs SDK)
- `docs/changelog.md` — This entry

### Files modified
- `docs/architecture.md` — Backend layer section added
- `docs/integrations.md` — Duffel integration section updated
- `docs/technical-decisions.md` — Two new decisions added

### What was NOT changed
- No frontend files modified (homepage, destinations, BookingModal, components, animations, styles)
- No existing documentation deleted or overwritten

### Impact
- The site continues to look and work exactly as before (frontend unchanged)
- `POST /api/flights/search` is now live and will return real Duffel results when called
- Phase 2 (connecting BookingModal to the API) can begin without any backend changes

---

## [Premium WhatsApp Message Template] — 2026-07-15

**Summary:** Replaced the per-card WhatsApp message with a premium structured template that gives the specialist complete, actionable information in a single message.

### What changed

**`src/components/booking/BookingModal.tsx` — `RealFlightCard` function only:**

- Added two derived constants:
  - `originLabel` — city name + IATA if available (e.g. `"São Paulo (GRU)"`) or IATA only if city not in database
  - `destLabel` — same pattern for the destination
- Replaced the previous inline `encodeURIComponent(...)` one-liner with a two-step approach:
  1. Build `rawMsg` as a plain string template
  2. Encode once: `const waMsg = encodeURIComponent(rawMsg)`
- The new message is organized into two sections separated by `━━━━━━━━━━━━━━━━━━` dividers:

**RESUMO DA PESQUISA** — booking search parameters:
- Origin with city name and IATA
- Destination with city name and IATA
- Departure date (DD/MM/YYYY)
- Return date (DD/MM/YYYY)
- Passengers (label, e.g. "Família")
- Class (label, e.g. "Executiva")

**VOO SELECIONADO** — the specific flight the user clicked:
- Airline name
- Flight number
- Departure time (formatted HH:MM)
- Arrival time (formatted HH:MM)
- Duration (e.g. "11h 25m")
- Stops ("Direto" or "N escala(s)")
- Cash price (currency + Intl.NumberFormat pt-BR) with a disclaimer that this is the airline's cash value and the user wants to know the miles equivalent

Closing: professional sign-off — "Aguardo o orçamento. Muito obrigado! 😊"

### Why the new template converts better

The old message was a single-line summary. The specialist still needed to ask follow-up questions. The new template provides all necessary information upfront — the specialist can immediately quote a miles offer without a back-and-forth.

### Files modified
- `src/components/booking/BookingModal.tsx` — `RealFlightCard` function (message only)

### Documentation updated
- `docs/booking-flow.md` — Full rewrite: removed stale mock-flight descriptions, added real Duffel flow, full WhatsApp template with section annotations, updated caching/dedup, updated customer journey
- `docs/components.md` — BookingModal section rewritten: updated props, state, sub-components table, helper functions, WhatsApp message description
- `docs/changelog.md` — This entry

### What was NOT changed
- The general footer `waMessage` (shown when no specific flight is selected)
- `performSearch()`, caching, deduplication
- API integration, backend, Duffel provider
- Steps 1–5 UI
- WhatsApp phone number (`5516997315748`)
- All existing computed variables (`depTime`, `arrTime`, `depCity`, `arrCity`, etc.) reused as-is

---

## [Flight Card Presentation Fix] — 2026-07-15

**Summary:** Fixed all six flight card presentation issues — ISO datetime strings now render as formatted times and dates, airport labels now include city names, and the layout was restructured to a clean two-row design.

### What changed

**`src/components/booking/BookingModal.tsx`:**

- Added `import { AIRPORTS } from '@/data/airports'` — used for IATA → city name lookup
- Added helper `extractTime(isoDatetime)` — extracts `"10:50"` from `"2026-07-15T10:50:00"` by splitting on `T` and taking the first 5 characters; does not use `Date` (avoids browser timezone conversion)
- Added helper `fmtDateShort(iso)` — formats `"2026-07-15"` → `"15 Jul"` using Portuguese short month names
- Added helper `getCity(iataCode)` — looks up the city name from the local `AIRPORTS` database; returns empty string if the airport is not found (renders nothing rather than a wrong city)
- In `RealFlightCard`: computed `depTime`, `arrTime`, `depDate`, `arrDate`, `depCity`, `arrCity` from offer data
- Restructured flight path section from single `flex items-center` row into two rows:
  - Row 1: departure time + animated plane path + arrival time (font `text-[30px] sm:text-[34px]`)
  - Row 2: date, IATA code, city name — origin left-aligned, destination right-aligned
- Fixed WhatsApp message: departure time now uses `depTime` (formatted "10:50") instead of the raw ISO string
- Updated `SkeletonCard` flight path section to mirror the new two-row layout

### Files modified
- `src/components/booking/BookingModal.tsx`

### What was NOT changed
- Backend, API, types, provider, service, route — untouched
- `performSearch()`, caching, deduplication — untouched
- `fmtDate()` helper (used for YYYY-MM-DD date input formatting) — untouched
- Steps 1–5 UI — untouched
- WhatsApp phone number and message structure — unchanged (only the time value corrected)

---

## [Phase 2C: Global UI Polish & Accessibility] — 2026-07-15

**Summary:** Global visual audit across all pages and components — fixed animation bugs, icon inconsistencies, and accessibility gaps.

### What changed

**Bug fixes:**
- `BookingModal.tsx` — Removed invalid `w-13 h-13` Tailwind class from error state icon wrapper (non-standard, `w-13` does not exist in Tailwind v3; element now relies solely on the correct inline `width: 52, height: 52`)
- `Hero.tsx` — Fixed arrow animation on CTA buttons: the `ArrowRight` icon inside each button was wrapped in `motion.span whileHover`, which only fires when the span itself is hovered — not on button hover. Replaced with a `span` using CSS `group-hover:translate-x-1 transition-transform duration-200`, which correctly responds to the parent button's hover state (both buttons already had the `group` class)

**Icon consistency:**
- `milhas/page.tsx` — `strokeWidth={1.7}` → `strokeWidth={1.8}` on service card icons (was the only file using 1.7; all other non-Navbar components use 1.8)
- `BookingModal.tsx` — Added `strokeWidth={1.5}` to the decorative `<Plane size={12}>` in the flight path badge (was defaulting to Lucide's `2`, inconsistent with other decorative plane icons at 1.5)

**Accessibility:**
- `BookingModal.tsx` — Added `aria-label="Fechar"` to the close button (icon-only button)
- `BookingModal.tsx` — Added `focus-visible:ring-2 focus-visible:ring-gold/60` focus ring to close button for keyboard navigation
- `globals.css` — Added global `:focus-visible` rule (2px gold ring, 3px offset) that applies to all interactive elements without custom focus handling
- `globals.css` — Added `@media (prefers-reduced-motion: reduce)` block suppressing: `.btn-shimmer::after`, `.cta-glow`, `.plane-on-path`, all cloud float utilities, shimmer, pulse-soft, star-twinkle, drift-right

**Animation timing:**
- `globals.css` — `.nav-link-underline::after` transition changed from `0.3s` → `0.23s` (aligning with the 220–250ms hover standard)

### Files modified
- `src/app/globals.css` — focus ring, reduced-motion block, nav underline timing
- `src/components/Hero.tsx` — arrow animation fix (CSS group-hover replaces nested motion.span whileHover)
- `src/app/milhas/page.tsx` — strokeWidth normalization
- `src/components/booking/BookingModal.tsx` — aria-label, focus ring, invalid class, decorative icon strokeWidth

### Documentation updated
- `docs/animations.md` — Animation Timing Standard table, `prefers-reduced-motion` section, nav underline timing corrected
- `docs/design-system.md` — Animation timing reference table, full Accessibility section (focus rings, ARIA labels, stroke widths, reduced motion)
- `docs/development-guidelines.md` — New Rule 14: Accessibility Requirements (focus, ARIA, stroke widths, reduced motion)
- `docs/changelog.md` — This entry

### What was NOT changed
- No backend files
- No business logic
- No API contracts
- No WhatsApp message format
- Steps 1–5 UI unchanged
- `performSearch()`, caching, deduplication untouched
- All existing animation durations and visual designs preserved

---

## [WhatsApp Message — VALOR DE REFERÊNCIA Section] — 2026-07-15

**Summary:** Extracted the cash price into its own dedicated section (`VALOR DE REFERÊNCIA`) with flanking separator lines, improving visual hierarchy in the WhatsApp message.

### What changed

**`src/components/booking/BookingModal.tsx` — `RealFlightCard` `rawMsg` only:**

- Removed `💰 *Valor encontrado em dinheiro:*` inline label that preceded the price
- Added a new `VALOR DE REFERÊNCIA` section header between `VOO SELECIONADO` content and the price:
  ```
  ━━━━━━━━━━━━━━━━━━
  💰 *VALOR DE REFERÊNCIA*
  ━━━━━━━━━━━━━━━━━━
  
  R$ 4.352
  ```
- The price now stands alone on its own line, unattached to a label, which creates stronger visual weight
- The disclaimer (`ℹ️ _Este é o valor...`) and closing separator are unchanged

**Before:**
```
🛑 *Escalas:*
Direto

💰 *Valor encontrado em dinheiro:*
R$ 4.352

ℹ️ _Este é o valor da passagem..._

━━━━━━━━━━━━━━━━━━
```

**After:**
```
🛑 *Escalas:*
Direto

━━━━━━━━━━━━━━━━━━
💰 *VALOR DE REFERÊNCIA*
━━━━━━━━━━━━━━━━━━

R$ 4.352

ℹ️ _Este é o valor da passagem..._

━━━━━━━━━━━━━━━━━━
```

### Files modified
- `src/components/booking/BookingModal.tsx` — `rawMsg` string only

### Documentation updated
- `docs/booking-flow.md` — WhatsApp template updated; section table updated
- `docs/components.md` — `RealFlightCard` WhatsApp message description updated
- `docs/changelog.md` — This entry

### What was NOT changed
- WhatsApp redirect logic, phone number, `encodeURIComponent` encoding
- `performSearch()`, caching, deduplication
- API, backend, Duffel integration
- Steps 1–5 UI
- `RESUMO DA PESQUISA` section
- `VOO SELECIONADO` section content

---

## [Duffel Frontend — Phase 2B: Premium UX] — 2026-07-15

**Summary:** Transformed the flight results experience into a premium, Google Flights–calibre interface.

### What changed

**Visual redesign (no logic changes):**

- `RealFlightCard` — complete premium redesign:
  - Large 28px bold departure/arrival times (from 19px)
  - Elegant flight path with gradient fade lines + floating plane badge (subtle `y` oscillation animation)
  - Stops/direct badge with semantic color: emerald green for "Direto", amber for stops
  - Gold price section with "A partir de" label, 30px bold price number, "Encontrado hoje" subtitle
  - Cabin class badge moved to card header (top-right)
  - Green gradient CTA: "Solicitar emissão com milhas"
  - Card hover: `y: -4px` + gold glow box-shadow (240ms ease)
  - Stagger entrance delay: 80ms per card (from 70ms)

- `SkeletonCard` — rebuilt to mirror RealFlightCard layout exactly:
  - Single shimmer overlay animation traverses the full card
  - Structural blocks match header/flight-path/price/CTA sections

- Error state: removed aggressive red, replaced with calm amber/gold-toned alert card matching brand palette

- Empty state: redesigned with large glowing Plane illustration + friendly message

- "Vantagem Alvea Viagens" banner: refined with decorative rule lines flanking the label

- Results header: concise `GRU → CDG` format with result count when offers available

### Files modified
- `src/components/booking/BookingModal.tsx` — visual redesign only (zero logic changes)
- `docs/features/booking-modal.md` — fully updated to reflect Phases 2A + 2B

### What was NOT changed
- All business logic, state management, caching, deduplication
- `performSearch()`, `next()`, `back()`, `retry()`, `editSearch()` functions
- WhatsApp message format or phone number
- API request/response handling
- Steps 1–5 UI (form steps unchanged)

---

## [Duffel Frontend — Phase 2A] — 2026-07-15

**Summary:** Connected `BookingModal.tsx` to the real Duffel flight search backend.

### What was added

**Frontend integration:**
- `BookingModal.tsx` — full rewrite of the results step:
  - Calls `POST /api/flights/search` instead of displaying mock flights
  - Maps frontend passenger values (`'1'`, `'2'`, `'familia'`, `'grupo'`) to API format
  - Maps frontend cabin values (`'economica'`, `'executiva'`, etc.) to API format (`'economy'`, `'business'`, etc.)
  - `extractIata()` helper extracts IATA code from `"City (XXX)"` label
  - In-memory cache: repeated identical searches return cached `FlightOffer[]` instantly
  - Deduplication flag: `searchInProgress` ref prevents concurrent search submissions
  - Premium loading state: gold spinner + "Buscando os melhores voos…" + 3 animated skeleton cards
  - Results: staggered `RealFlightCard` entrance (0.07s delay per card, Framer Motion)
  - Empty state: gold airplane icon + copy + "Alterar pesquisa" + "Falar com especialista"
  - Error state: red alert card + "Editar pesquisa" + "Tentar novamente" footer
  - Per-card WhatsApp CTA "Solicitar emissão por milhas" with pre-filled flight, route, dates, class, passengers, and reference price
  - Added `iataCode: string` to `DestinationForModal` type

- `destinos/page.tsx`:
  - Added `iataCode: string` to `Destination` type
  - Added IATA code to all 28 destinations across 5 continents

### Files modified
- `src/components/booking/BookingModal.tsx` — replaced mock data with real API integration
- `src/app/destinos/page.tsx` — `iataCode` field on type and all destination entries
- `docs/known-issues.md` — resolved two open issues

### What was NOT changed
- Backend architecture untouched (`POST /api/flights/search`, service, provider, client)
- All existing API contracts unchanged
- Steps 1–5 UI unchanged
- WhatsApp deep-link format unchanged

### Impact
- Booking modal now returns real flight availability via Duffel API
- Each flight card shows real airline, flight number, times, route, duration, stops, and live price
- WhatsApp messages include exact flight details, enabling specialists to act on leads immediately

---

## [WhatsApp Emoji — Root cause: wa.me redirect service] — 2026-07-16

**Summary:** Binary investigation ruled out all JavaScript code (encoding, decoding, helpers, middleware, React rendering). The root cause was the `wa.me` URL format: WhatsApp's redirect service decodes and re-encodes the `text` query parameter server-side, corrupting 4-byte UTF-8 sequences (supplementary plane emoji) while BMP characters (accented letters like Olá, São Paulo) survived intact. Fix: replace `wa.me` with `api.whatsapp.com/send` at both URL construction sites.

### Binary investigation results

Ten audit checks were performed against the code:

| Check | Result |
|---|---|
| `encodeURIComponent` called exactly once | ✅ Line 987 in `RealFlightCard` |
| No `decodeURIComponent` | ✅ Zero matches in entire file |
| No plain `encodeURI` wrapping encoded URL | ✅ Zero matches |
| No helper or utility modifies `waHref` | ✅ Defined and used unchanged |
| Button is a plain `<a>` element with href | ✅ No click handler, no navigation override |
| No Next.js middleware rewrites URLs | ✅ No `middleware.ts` exists |
| No sanitising regex targeting non-ASCII | ✅ Only match was airport search (unrelated) |
| No `TextEncoder` / `Buffer` / `iconv` | ✅ Not present |
| `String.fromCodePoint()` constants are correct | ✅ Pure ASCII source, runtime-constructed |
| `rawMsg` contains correct emoji characters | ✅ Encoding chain is clean |

All ten passed. **The JavaScript code was correct throughout.**

### Root cause

The URL format `wa.me` is a WhatsApp redirect service. When a browser navigates to:

```
https://wa.me/5516997315748?text=%F0%9F%98%8A
```

The `wa.me` server receives the request, URL-decodes the `text` parameter to get the raw bytes (`F0 9F 98 8A` = 😊 in UTF-8), then builds a new Location redirect. During this decode→re-encode round-trip, the server corrupts 4-byte UTF-8 sequences (U+10000 and above, the supplementary plane where all emoji live). The redirect sends back `%EF%BF%BD` (U+FFFD, the replacement character) in place of each emoji. BMP characters like accented letters (`%C3%A3` = 2 bytes) are unaffected — only characters requiring 4 bytes are lost.

This is a server-side defect in the `wa.me` redirect service, not a bug in any client-side code.

### Fix (2 lines changed)

Replaced `wa.me` with the direct `api.whatsapp.com/send` endpoint at both URL construction sites, bypassing the redirect service entirely:

**Before:**
```typescript
const waHref = `https://wa.me/5516997315748?text=${waMessage}`
// and in RealFlightCard:
const waHref = `https://wa.me/5516997315748?text=${waMsg}`
```

**After:**
```typescript
const waHref = `https://api.whatsapp.com/send?phone=5516997315748&text=${waMessage}`
// and in RealFlightCard:
const waHref = `https://api.whatsapp.com/send?phone=5516997315748&text=${waMsg}`
```

`api.whatsapp.com/send` is the direct WhatsApp chat endpoint. It accepts the `phone` and `text` query parameters without any redirect or re-encoding step.

### Files modified
- `src/components/booking/BookingModal.tsx` — both `waHref` construction sites updated (line 294 and inside `RealFlightCard`)

### What was NOT changed
- `rawMsg` content, structure, or section layout
- `encodeURIComponent(rawMsg)` (still called exactly once)
- `EMOJI` constant (`String.fromCodePoint()` approach — correct and retained)
- Booking logic, search, deduplication, or any other feature

---

## [WhatsApp Emoji — Definitive Fix via String.fromCodePoint()] — 2026-07-16

**Summary:** Replaced the fragile `'\uXXXX'` Unicode escape notation with `String.fromCodePoint()` calls using plain hex number literals — the only approach that is immune to every layer of the build pipeline.

### Root cause (full diagnosis)

The previous fix (`'✈️'` etc. in the `EMOJI` object) was theoretically valid TypeScript but was fragile across build modes. Here is what the pipeline actually does:

| Layer | What happens to `'✈️'` |
|---|---|
| TypeScript source (on disk) | Literal ASCII bytes `5C 75 32 37 30 38` (`✈`) |
| SWC compiler | Parses escape → emoji character U+2708 U+FE0F |
| webpack eval-string serialization (dev mode) | Encodes emoji back to `'\\u2708\\uFE0F'` (double backslash) |
| Browser JS parser parses eval arg | Unescapes `\\u` → `\u` → eval input: `'✈️'` |
| `eval()` evaluates | Produces ✈️ (correct in this specific path) |
| webpack HMR in-memory update path | Different serialization — can produce wrong escaping |

The chain works in the static compiled bundle, but webpack's **hot-update in-memory path** skips the eval-string serialization and injects module updates directly. On Windows, where the Node.js process encoding can differ from the system code page (1252 vs. 65001), this caused corrupted emoji bytes in the hot-module replacement stream — making the WhatsApp message show replacement characters (🔲) after any HMR cycle.

### Why String.fromCodePoint() is immune

`String.fromCodePoint(0x2708, 0xFE0F)` contains only:
- ASCII identifier characters (`String`, `.`, `fromCodePoint`)
- Parentheses and commas
- Hex number literals (`0x2708`) — processed as integers, not strings

There are no characters to escape, no string literals to re-parse, and no bytes to corrupt. The hex value `0x2708` (the integer 10024) passes through every compiler, bundler, minifier, eval wrapper, and HMR mechanism completely unchanged. The emoji character is produced at **runtime** by the JavaScript engine's `String.fromCodePoint()` built-in — which has no connection to the file encoding pipeline.

For BMP+VS16 sequences (e.g. ✈️ = U+2708 + U+FE0F), `String.fromCodePoint()` accepts multiple code points as arguments and concatenates them. For supplementary plane characters (e.g. 📋 = U+1F4CB), it automatically generates the correct UTF-16 surrogate pair — no manual surrogate math required.

### Validation performed (Node.js)

All 15 constants verified with `encodeURIComponent()`:

```
✓ plane      ✈️  → %E2%9C%88%EF%B8%8F
✓ clipboard  📋  → %F0%9F%93%8B
✓ takeoff    🛫  → %F0%9F%9B%AB
✓ landing    🛬  → %F0%9F%9B%AC
✓ calendar   📅  → %F0%9F%93%85
✓ people     👥  → %F0%9F%91%A5
✓ seat       💺  → %F0%9F%92%BA
✓ office     🏢  → %F0%9F%8F%A2
✓ numbers    🔢  → %F0%9F%94%A2
✓ stopwatch  ⏱️  → %E2%8F%B1%EF%B8%8F
✓ stop       🛑  → %F0%9F%9B%91
✓ money      💰  → %F0%9F%92%B0
✓ info       ℹ️  → %E2%84%B9%EF%B8%8F
✓ speech     💬  → %F0%9F%92%AC
✓ smile      😊  → %F0%9F%98%8A
```

`encodeURIComponent(rawMsg)` produces no U+FFFD replacement characters. URL is RFC3986-compliant (no raw non-ASCII bytes). `.next` cache deleted to force clean recompile from the fixed source.

### Additional cleanup

Removed two temporary `if (process.env.NODE_ENV === 'development') { console.log(...) }` blocks from `duffel-provider.ts` that were added during the Duffel audit session.

### Files modified
- `src/components/booking/BookingModal.tsx` — EMOJI constant rewritten with `String.fromCodePoint()`
- `src/lib/providers/duffel-provider.ts` — temporary dev logging removed

### What was NOT changed
- Message content, structure, or section layout
- `encodeURIComponent(rawMsg)` (still called exactly once)
- WhatsApp phone number and URL format
- Booking logic, search, caching, deduplication
- Duffel integration, API, backend

---

## [Server-Side Flight Deduplication] — 2026-07-16

**Summary:** Added O(n) server-side deduplication in `duffel-provider.ts` to collapse fare-family variants of the same physical flight, so the frontend receives one offer per unique flight (the cheapest one).

### What changed

**`src/lib/providers/duffel-provider.ts`:**

- Added `buildDeduplicationKey(offer)` — pure function that joins 7 fields with `|` to produce a stable identity key for a physical flight:
  ```
  airlineCode|flightNumber|origin|destination|departureDate|departureTime|arrivalTime
  ```
- Added `deduplicateOffers(offers)` — single `Map<string, FlightOffer>` pass (O(n)):
  - For each offer, compute the key and check if it already exists in the map
  - If not seen: insert it
  - If already seen and the new offer is cheaper: replace it
  - Result: one entry per unique flight, always the cheapest fare
- Updated the search pipeline order: normalize → deduplicate → sort (sort now operates on the already-reduced set)
- Updated dev-mode logging to report `rawCount`, `normalizedCount`, `uniqueCount`, and `duplicatesRemoved` in a single log line

### Why this exists

Duffel returns all available fare families for each flight (saver, flexible, refundable, with/without baggage, etc.). A single flight can appear 10–20 times in the raw response with different prices and conditions. Since the website's purpose is to help customers identify a flight to request a mileage quotation — not to compare fare rules — showing these duplicates is pure noise that degrades UX.

### Why the cheapest duplicate is kept

The price displayed on each card is labelled "VALOR DE REFERÊNCIA" (reference price). It anchors the specialist's miles quotation. The market floor (cheapest fare for that flight) is the most representative and customer-favourable reference point.

### Fields ignored during deduplication

Fare family name, fare conditions, cabin brand, baggage allowance, refundability, change fees, Duffel offer ID, booking reference.

### Frontend impact

The `count` field in `FlightSearchResponse` and the "flights found" counter on the frontend automatically reflect the deduplicated number — no frontend changes required. The counter now shows unique flights, not raw fare variants.

### Files modified
- `src/lib/providers/duffel-provider.ts` — `buildDeduplicationKey`, `deduplicateOffers`, updated pipeline, updated dev logs

### Documentation updated
- `docs/technical-decisions.md` — Decision 13: Server-Side Offer Deduplication
- `docs/architecture.md` — Backend layer section updated with data pipeline diagram
- `docs/changelog.md` — This entry

### What was NOT changed
- All business logic, validation, error handling
- Duffel API request structure
- `FlightOffer` type shape
- Frontend components, WhatsApp message, booking flow
- API route, service layer

---

## [WhatsApp Emoji — Unicode Escape Sequences] — 2026-07-16

**Summary:** Replaced all literal emoji glyphs in the WhatsApp `rawMsg` with a named `EMOJI` constant using explicit `'\uXXXX\uXXXX'` escape sequences, permanently eliminating the risk of UTF-8/Windows-1252 HMR encoding corruption.

### What changed

**`src/components/booking/BookingModal.tsx` — static data section + `RealFlightCard`:**

- Added `const EMOJI` object in the static data section (after `CLASSES`) with 15 named entries:
  - BMP characters with emoji variation selector: `plane: '✈️'`, `stopwatch: '⏱️'`, `info: 'ℹ️'`
  - Supplementary plane characters (UTF-16 surrogate pairs): `clipboard: '📋'`, `takeoff: '🛫'`, `landing: '🛬'`, `calendar: '📅'`, `people: '👥'`, `seat: '💺'`, `office: '🏢'`, `numbers: '🔢'`, `stop: '🛑'`, `money: '💰'`, `speech: '💬'`, `smile: '😊'`
- Replaced all 15 literal emoji glyphs in `rawMsg` with `${EMOJI.xxx}` template interpolations
- Message content, section structure, and `encodeURIComponent` encoding are unchanged

### Why this change was made

WhatsApp was displaying replacement characters (🔲) instead of emojis. Investigation confirmed the source bytes were valid UTF-8, but Next.js webpack HMR was corrupting the in-memory compilation of literal emoji strings on Windows due to a code-page mismatch (process encoding 1252 vs. UTF-8 console). Deleting `.next/` fixed the immediate symptom, but the underlying risk remained for any future HMR cycle.

Using `'\uXXXX\uXXXX'` escape sequences instead of literal emoji glyphs:
1. The source file contains only ASCII characters for emoji values — no multi-byte UTF-8 sequences that can be corrupted by Windows code-page handling
2. JavaScript/TypeScript interprets the escape sequences identically at runtime regardless of the environment's code page
3. The compiled bundle always contains the correct Unicode code points

### Files modified
- `src/components/booking/BookingModal.tsx` — `const EMOJI` object added; `rawMsg` literal glyphs replaced with `${EMOJI.xxx}` references

### What was NOT changed
- Message content, all section labels, all dynamic variables
- `encodeURIComponent(rawMsg)` (still called exactly once)
- WhatsApp phone number and URL format
- Booking logic, search, caching, deduplication
- API, backend, Duffel integration

---

## How to Update This Changelog

Every time a significant change is made to the project, add an entry here.

### Entry format

```markdown
## [Version or Label] — YYYY-MM-DD

**Summary:** One-sentence description of the change.

### What changed
- List of specific changes

### Files modified
- `path/to/file.tsx` — what changed and why

### Impact
- What this affects (users, performance, SEO, etc.)
```

### What counts as "significant"
- New pages
- New components
- New features (including partial/in-progress)
- API integrations (added or removed)
- Design system changes
- Configuration changes
- Bug fixes that changed user-visible behavior
- New dependencies added or removed

### What does NOT need a changelog entry
- Typo/copy fixes
- Minor style tweaks (color shade adjustments, spacing changes)
- Refactoring with no behavioral change
- Documentation-only updates (update the date in the entry above instead)

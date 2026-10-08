# Pages

Every page in the application is documented here.

---

## Home Page (`/`)

**File:** `src/app/page.tsx`
**Client component:** No (child components handle their own client state)

### Layout

The home page is composed of sequential full-width sections stacked vertically:

```
[Hero Section]          full viewport height
[Benefits Section]      ~400px
[Quem Somos Section]    ~500px
[HomeCTA Section]       ~300px
```

### Section 1: Hero

**Components:** `CloudBackground`, `AviationTrail`, `Hero`

- `CloudBackground` fills the full hero area with the animated sky.
- `AviationTrail` is absolutely positioned over the clouds (z-10) — the airplane flies across.
- `Hero` contains all the headline text, CTAs, and trust badges (z-20, above both layers).
- The entire section is `min-h-screen` with `relative overflow-hidden`.

### Section 2: Benefits

**Component:** `Benefits`

- Gold tag: "Nossos Diferenciais"; heading "Por que escolher a Alvea?"
- 4 cards in a 2-column grid (`md:grid-cols-2`), staggered in by the component's own `useInView`
- Background: `bg-sky-abyss` with two ambient orbs

### Section 3: Quem Somos (Brand Showcase)

**Components:** `LogoHeroBanner` (the section itself is inline JSX in `page.tsx`, with no scroll animation)

**Layout:** 2-column grid (`lg:grid-cols-2`); on mobile the image comes first

**Left column:**
- Section tag: "Quem Somos"
- H2 headline: "Onde cada jornada começa com um sonho."
- 2 paragraphs of brand story text
- 3 stat cards: `50k+ Passagens emitidas`, `98% Satisfação dos clientes`, `120+ Destinos disponíveis`

**Right column:**
- `LogoHeroBanner` (brand logo with premium framing)

**Ambient decoration:**
- Two blurred orbs (gold and blue) positioned around the section for depth

### Section 4: HomeCTA

**Component:** `HomeCTA`

- Final conversion prompt before footer
- Dark background with centered content
- Dual buttons: "Emitir Passagem" → `/destinos` · "Falar com Especialista" → `/atendimento`

### Home page CTAs — where they go

| CTA | Target |
|---|---|
| Hero "Emitir Passagem" (only Hero CTA) | `/destinos` |
| HomeCTA "Emitir Passagem" | `/destinos` |
| HomeCTA "Falar com Especialista" | `/atendimento` |

---

## Destinations Page (`/destinos`)

**File:** `src/app/destinos/page.tsx`
**Client component:** Yes (BookingModal interaction)

### Layout

```
[PageHeader]                    Tag, title, subtitle
[Continent Section: Europa]     Grid of destination cards
[Continent Section: América]    Grid of destination cards
[Continent Section: Ásia]       Grid of destination cards
[Continent Section: Oriente Médio] Grid of destination cards
[Continent Section: Oceania]    Grid of destination cards
[Bottom CTA Strip]              "Consultar disponibilidade" → /atendimento
```

### Destination Data Structure

Data is inline in the page file (`CONTINENTS`). Each destination:
```typescript
type Destination = {
  name:     string   // City name
  country:  string   // Country name
  desc:     string   // Short description (1 sentence)
  miles:    string   // Estimated miles, number only (e.g., "45.000")
  photo:    string   // Unsplash image URL (?auto=format&fit=crop&w=1400&q=90)
  color:    string   // Tailwind gradient classes used as fallback behind the photo
  iataCode: string   // Destination airport sent to the flight search
}
```

### Continent Organization — 28 destinations

| Continent | Grid (desktop) | Destinations (IATA) |
|---|---|---|
| Europa (8) | 4 columns | Paris (CDG), Roma (FCO), Lisboa (LIS), Londres (LHR), Santorini (JTR), Barcelona (BCN), Amsterdã (AMS), Veneza (VCE) |
| América (8) | 4 columns | Nova York (JFK), Orlando (MCO), Cancún (CUN), Toronto (YYZ), Buenos Aires (EZE), Punta Cana (PUJ), Los Angeles (LAX), Miami (MIA) |
| Ásia (6) | 3 columns | Tóquio (NRT), Bangkok (BKK), Singapura (SIN), Bali (DPS), Seul (ICN), Maldivas (MLE) |
| Oriente Médio (3) | 3 columns | Dubai (DXB), Doha (DOH), Abu Dhabi (AUH) |
| Oceania (3) | 3 columns | Sydney (SYD), Melbourne (MEL), Auckland (AKL) |

Full table with miles and photo ids: [project-state-audit-2026-10.md](./project-state-audit-2026-10.md) §7. `JTR` and `MLE` are not in `airports.ts`, so no city name is shown for them in flight cards.

### Destination Card Behavior

- **Markup:** a clickable `motion.div` (not a button or link — not keyboard-focusable), 4:3 aspect ratio, raw `<img loading="lazy">`.
- **Default state:** Photo with dark gradient overlay. Country, city, and description visible.
- **Hover state:** Card scales to 1.03, photo scales up (`scale-110`), gold corner glow, and the line "A partir de {miles} milhas" + arrow fade in. On touch devices this line is not visible.
- **Click:** Opens `BookingModal` with that destination pre-filled.
- **Animation:** Each continent section has its own `useInView`; header fades up, cards stagger in (0.07s apart).

### BookingModal Integration

Clicking any card calls `setSelectedDest(dest)`, which mounts the modal inside `AnimatePresence`. `onClose` sets it back to `null`. See [booking-flow.md](./booking-flow.md).

### Bottom CTA

"Não encontrou o destino que procura? Podemos levá-lo a qualquer lugar do mundo." + button "Consultar disponibilidade" → `/atendimento`.

---

## Miles Page (`/milhas`)

**File:** `src/app/milhas/page.tsx`
**Client component:** Yes (`"use client"` — modal state and entrance animation)
**Reformulated on 2026-10-06:** the page now presents only two services. The former cards "Compra de Milhas", "Consultoria Especializada", "Estratégias Inteligentes", the stats strip (100k+ / R$5M+ / 98%), and the bottom CTA were removed.

### Layout

```
[Header]            Badge "Milhas" · H1 "Maximize o valor das suas milhas" · subheadline
[Two cards]         Venda de Milhas  |  Gestão de Milhas     (equal size and weight)
[Modals]            Opened by each card's CTA — no navigation
```

- Cards are side by side from `md` (768px) and stacked below; both stretch to the same height.
- `main` is `overflow-hidden`, so the ambient orbs never cause horizontal overflow.

### Card — Venda de Milhas

- Text: "Tem milhas acumuladas e quer transformá-las em dinheiro? Envie suas informações e nossa equipe avaliará sua oferta."
- Four check items (evaluation of the amount, analysis of the programme, simple accompanied process, negotiation directly with Alvea).
- CTA "Vender Minhas Milhas" → opens `SellMilesModal`.
- No price, value, or payment deadline is stated anywhere.

**Questionnaire (3 steps):**

| Step | Fields |
|---|---|
| 1 · Seus dados | Nome (required) · WhatsApp (required, masked `(16) 99999-9999`, 10–11 digits) |
| 2 · Suas milhas | Companhia/programa (required) — searchable select (`ProgramCombobox`) with 22 programmes plus "Outra companhia/programa", which reveals the required field "Qual companhia ou programa?" · Quantidade de milhas (required, digits only, shown as `100.000`) |
| 3 · Revisão e envio | Summary of the four answers · button "Enviar para a Alvea" |

Simplified later on 2026-10-06: the questions "Há quanto tempo possui essas milhas?", "As milhas estão disponíveis atualmente?", and the "Observações" field were removed from the form, its state, validation, summary, and message. The message carries only Nome, WhatsApp, Companhia/Programa (the typed name when "Outra" is chosen), and Quantidade.

Programme list: Azul, LATAM Pass, Smiles, TudoAzul, TAP Miles&Go, Iberia Plus, AAdvantage, MileagePlus, Flying Blue, Avios, Aeroplan, Emirates Skywards, Qatar Airways Privilege Club, British Airways Executive Club, Delta SkyMiles, Miles & More, Turkish Airlines Miles&Smiles, Etihad Guest, LifeMiles, ConnectMiles, Livelo, Esfera.

### Card — Gestão de Milhas

- Text: "Você acumula pontos e milhas, mas não sabe qual é a melhor estratégia para aproveitar tudo isso? A Alvea pode analisar seu perfil, seus objetivos e seus programas para orientar as melhores decisões."
- Five check items. CTA "Conhecer a Gestão" → opens `ManagementModal`.
- No price, fee, percentage, cashback amount, or guaranteed result is stated; the modal says commercial details are presented by the team.

**Modal (7 steps)** — the questionnaire was replaced on 2026-10-06 by Alvea's official 17-question profile form:

| Step | Content |
|---|---|
| 1 · O que é a Gestão | Explanation · "Você nos conta seus objetivos" with 7 examples · "Como funciona" in 5 numbered items (kept from the previous version; not part of the questionnaire) |
| 2 · Seus dados | Nome · E-mail · Telefone — all required |
| 3 · Perfil de consumo | Questions 1–5 |
| 4 · Conhecimento e viagens | Questions 6–10 |
| 5 · Perfil de viagem e cartões | Questions 11–14 |
| 6 · Oportunidades e potencial | Questions 15–17 |
| 7 · Revisão e envio | "Revise suas informações": every answer grouped by step, each group with an "Editar" button that jumps back to it · button "Enviar para a Alvea" |

**The 17 questions live in `src/lib/milhas/management-questionnaire.ts`, which is the single source for the form, the review, and the WhatsApp message. Their wording and options are Alvea's official text and must not be rephrased, reordered, or "corrected" (e.g. "Nu Bank", "LatamPass", "Aadvantage", "TudoAzul").**

| # | Topic (short label) | Type | Options | Required |
|---|---|---|---|---|
| 1 | Compras online | single | 7 | — |
| 2 | Programas de pontos/milhas | multiple ("Não" is exclusive) | 12 | — |
| 3 | Bancos/instituições | multiple | 13 | — |
| 4 | Gasto mensal nos cartões PF | single | 9 | — |
| 5 | Gasto mensal nos cartões PJ | single | 8 | — |
| 6 | Conhecimento em pontos e milhas | single | 5 | — |
| 7 | Investimento anual em viagens | single | 8 | — |
| 8 | Viagens compradas por ano | single | 6 | — |
| 9 | Viagens que gostaria de fazer por ano | single | 6 | — |
| 10 | Viagem dos sonhos | free text | — | — |
| 11 | Viagens internacionais por ano | single | 5 | Yes |
| 12 | Pessoas por viagem | single | 5 | Yes |
| 13 | Pontuação do cartão PF por dólar | single | 6 | Yes |
| 14 | Pontuação do cartão PJ por dólar | single | 6 | — |
| 15 | Gastos planejáveis para compras online | single | 6 | Yes |
| 16 | Benefícios de maior interesse | multiple | 5 | — |
| 17 | Gastos via PIX/débito/dinheiro | single | 6 | Yes |

- Required: Nome, E-mail, Telefone, and questions 11, 12, 13, 15, 17 (marked "Obrigatória"). Nothing else is required.
- Multiple choice: 16 (as specified) and also 2 and 3, where several answers are natural; these show "Você pode selecionar mais de uma opção." In question 2, choosing "Não" clears the other options and vice versa.
- Every option is a card with a square check box on the left — also for single-choice questions. Cards sit on a two-column grid (one column on mobile) and all cards of a question have the same width and height, however the text wraps; an odd last option keeps one cell.
- The WhatsApp message lists Nome / E-mail / Telefone under "MEUS DADOS" and the answers under "MEU PERFIL" as "N. short label". Multiple answers are bulleted in the official option order. Unanswered optional questions are omitted (their numbers are simply skipped).

### Validation

Per step, on "Continuar". Messages are short and neutral ("Informe o programa de milhas.", "Selecione pelo menos um objetivo."), shown under the field in gold with `role="alert"`, and cleared as soon as the field is corrected. Answers are kept when going back.

### WhatsApp

- Both flows end in a real link (`<a target="_blank" rel="noopener noreferrer">`) to `https://api.whatsapp.com/send?phone=…&text=…` — the same endpoint the booking flow uses (not `wa.me`).
- Number: `WHATSAPP_NUMBER` in `src/lib/config/links.ts` (the official number already used across the site). URL built by `buildWhatsAppUrl()`, which applies `encodeURIComponent` once.
- Messages are built by `buildSellMilesMessage()` and `buildManagementMessage()` in `src/lib/milhas/whatsapp-messages.ts`, with emoji from `src/lib/utils/wa-emojis.ts`. A field without an answer is omitted entirely — never "undefined", empty labels, or "Não informado".
- **No backend:** nothing is posted, stored, or logged. The answers exist only in component state and in the link.

### Responsiveness

- Verified at 1920, 1366, 1024, 768, 390px with no horizontal overflow.
- Modal: centred, max 600px (Venda) / 720px (Gestão) wide on desktop; on mobile it fills the screen with an 8px margin. Inputs and option rows are at least 50px tall.

---

## Tickets Page (`/passagens`)

**File:** `src/app/passagens/page.tsx`
**Client component:** Yes (`"use client"`, for button animations)

### Layout

```
[PageHeader]                Tag, title, subtitle
[Search Panel]              Visual "search" form (not functional — decorative)
[Services Grid]             3-column grid of 6 service types
[Trust Strip]               4 trust badges
[Bottom CTA]                "Emitir minha passagem agora" button
```

### Search Panel

A decorative search UI: three static boxes labelled "Origem", "Destino", "Data" (they are `div`s, not inputs) and a "Consultar" button → `/atendimento`. **This is not functional** — it serves as a visual anchor. The real flight search exists only in `BookingModal`, reached from `/destinos`; it is not available from this page. Caption: "Pesquisa realizada por especialistas humanos, não robôs."

### Services (3-column grid on desktop)

| Service | Notes |
|---|---|
| Passagens Nacionais | Brazil domestic flights |
| Passagens Internacionais | International routes |
| Classe Executiva | Business class focus |
| Primeira Classe | First class premium |
| Ofertas Exclusivas | Special promotions |
| Emissões Estratégicas | Strategic miles emission |

Service cards have no CTA.

### Trust Strip

4 horizontal badges:
- Sem filas ou ligações
- Resposta em até 2h
- Emissão confirmada
- Suporte pós-emissão

---

## Contact Page (`/atendimento`)

**File:** `src/app/atendimento/page.tsx`
**Client component:** Yes (form state)

### Layout

```
[PageHeader]                Tag, title, subtitle
[Contact Methods Grid]      3 cards: WhatsApp, Email, Consultation
[Contact Form]              5-field form with validation
```

### Contact Methods

| Method | Details |
|---|---|
| WhatsApp | +55 (16) 99731-5748 — "Iniciar conversa →" links to `https://wa.me/5516997315748` (same tab, no pre-filled text) |
| Email | alveaviagens@gmail.com — "Enviar e-mail →" `mailto:` link |

The third card ("Atendimento Personalizado", with fixed hours and "Agendar conversa") was removed on 2026-10-07. The two remaining cards sit in a `md:grid-cols-2` grid limited to `max-w-3xl`, the same width as the form below; they stack on mobile. No business hours are published anywhere on the site — Alvea attends on demand.

### Contact Form

**Fields:**
| Field | Type | Required |
|---|---|---|
| Nome | text | Yes |
| E-mail | email | Yes |
| Telefone | tel | Yes |
| Destino desejado | text | Yes |
| Mensagem | textarea (5 rows) | Yes |

**Validation (since 2026-10-07):** all five fields are required. Checked on submit by `validateContactRequest()`; each problem is shown under its field in gold ("Informe seu nome.", "Informe seu e-mail.", "Informe seu telefone.", "Informe o destino desejado.", "Escreva uma mensagem.", plus a format hint for a malformed e-mail) and disappears as the field is corrected. The form uses `noValidate`, so no native browser bubbles or `alert()` appear. Labels are now associated with their inputs.

**Submit behavior (since 2026-10-07):** "Solicitar Atendimento" builds a message from the five fields (`buildContactRequestMessage()` in `src/lib/atendimento/whatsapp-message.ts`) and opens WhatsApp in a new tab with that message pre-filled, via `buildWhatsAppUrl()` — `https://api.whatsapp.com/send?phone=…&text=…` with the official `WHATSAPP_NUMBER` from `src/lib/config/links.ts`. **Nothing is sent automatically:** the visitor reviews the text and presses "Enviar" in WhatsApp. There is no backend, API, or storage. The form stays on screen afterwards; the former "Mensagem enviada!" success card was removed because it claimed a delivery that never happened. Fields, layout, and the button's appearance are unchanged.

**Note for future development:** A backend endpoint needs to be wired to actually send the email or create a lead in CRM. See [integrations.md](./integrations.md).

---

## Offers Group Page (`/grupo-de-ofertas`)

**Files:** `src/app/grupo-de-ofertas/page.tsx` (Server Component: metadata + video check) → `src/components/grupo-ofertas/OffersGroupContent.tsx` (Client Component: all UI)
**In the navbar:** yes — "Grupo de Ofertas" replaced "Passagens" (2026-10-06). The footer's "Links Rápidos" followed on 2026-10-07. The `/passagens` page file still exists but nothing in the site links to it any more.

### Purpose

Landing page for Alvea's own WhatsApp offers group. Its single goal is to get the visitor to join the group. No numbers or social proof are shown (none exist in the project).

### Layout

```
[Hero]                    Left: badge "Ofertas Exclusivas" · H1 · subheadline · CTA
                          Right: vertical video (9:16) in a glass frame
[O que você encontra]     4 icon cards
[Como funciona]           3 numbered cards (01–03)
[CTA final]               "Não perca a próxima oportunidade." · CTA
```

Below `lg` (1024px) the hero is a single centred column in this order: badge → headline → text → CTA → video.

### Metadata

- `title`: "Grupo de Ofertas | Alvea Viagens"
- `description`: "Receba promoções e oportunidades de viagem da Alvea Viagens diretamente no WhatsApp." (also used for OpenGraph). Other pages keep the root metadata.

### Group CTA ("Entrar no Grupo de Ofertas")

- Appears twice (hero and final section), gold gradient like every primary CTA, WhatsApp only as a small icon.
- Both point to the official group, `https://chat.whatsapp.com/BzUhRCfOMebDQ95Uzk22j6`, opened in a new tab (`target="_blank" rel="noopener noreferrer"`).
- The link lives in one place: `WHATSAPP_GROUP_URL` in **`src/lib/config/links.ts`**. If that value ever stops being an `https://` URL, the CTA falls back to an inert button instead of a broken link.
- This is independent of the booking/contact WhatsApp links, which were not changed.

### Video (vertical, 9:16)

- File: **`public/videos/grupo-ofertas.mp4`** (served as `/videos/grupo-ofertas.mp4`). Present since 2026-10-06: 1440×2560, 30 s, ~44 MB.
- The frame is sized by width plus `aspect-[9/16]`, so it is always exactly 9:16: `min(100%, 360px)` wide on mobile, 320px from `md`, 338px from `lg` (about 587px tall including the frame; raised from 282px on 2026-10-06).
- `<video controls controlsList="nofullscreen" playsInline preload="metadata">` with `object-cover`; no autoplay, so no sound starts on its own.
- **Fullscreen is custom.** A round button in the top-right corner of the video puts the 9:16 *container* in fullscreen (not the `<video>`). Inside it the video is sized `width: min(100vw, 100vh × 9/16)` / `height: min(100vh, 100vw × 16/9)` with `object-contain`, centred on a dark navy background — so it stays 9:16 on any screen (e.g. 532×945 centred on a 1920×945 viewport). Esc or the same button exits. The native fullscreen control is hidden via `controlsList` where supported; elsewhere `[&:fullscreen]:object-contain` keeps the ratio in native fullscreen. iPhone Safari, which has no element fullscreen, falls back to its native video fullscreen.
- `page.tsx` checks on the server whether the file exists and passes `hasVideo`. Without the file (or if playback fails) the same 9:16 frame shows a placeholder ("Conheça o Grupo de Ofertas · Vídeo de apresentação em breve") and no request is made.
- The check runs per request in development and at build time in production.

### Responsiveness

- Hero: two columns from `lg`; one column below. H1 `text-4xl` → `sm:text-5xl` → `lg:text-[56px]`.
- Benefit cards: 1 → 2 (`sm`) → 4 (`lg`) columns. Steps: 1 → 3 (`md`).
- Verified without horizontal overflow at 390, 768, 1024, 1366, and 1920px; video ratio 0.5625 at every width.

---

## Experiences Page (`/experiencias`) — ALVEA JOURNEY

**File:** `src/app/experiencias/page.tsx` (server component, metadata only) → `src/components/experiencias/JourneyExperience.tsx`
**Type:** Client-rendered, scroll-driven storytelling. No forms, no API calls. Optional sound, off by default (see `experiencias-sound.md`).

### Purpose

"Uma viagem antes da viagem": a cinematic sequence the visitor moves through by scrolling, from the idea of travelling to the invitation to plan a trip. It is inspiration, not a catalogue — no prices, figures, dates, availability, or itineraries are stated anywhere, and the one illustrative item (the cruise route) is labelled as illustrative on screen.

### Structure

Ten chapters, each a tall `<section>` whose content is pinned in a `sticky top-0 h-[100svh]` stage. Sections overlap by one viewport, so a chapter takes the frame at the exact moment the previous one ends — the page reads as one continuous shot, with no empty stretch between chapters. Total scroll ≈ 26.5 viewports. Order, ids, and lengths live in `CHAPTERS` (`src/data/experiencias.ts`); a chapter is pinned for `screens − 1` viewports.

| # | id | Scene | `screens` |
|---|---|---|---|
| 01 | `o-chamado` | Hero: "ALVEA JOURNEY", "Uma viagem antes da viagem.", star field | 1.7 |
| 02 | `embarque` | Departures board out of the dark, guide lights on the floor, "Todo destino começa com uma decisão." | 2.3 |
| 03 | `decolagem` | Top-down runway: acceleration, rotation, the ground falling away, through the cloud layer, open sky | 3.7 |
| 04 | `o-mundo` | The clouds part over a dotted world map; an aircraft flies São Paulo → Paris drawing its route; ten routes in all | 3.9 |
| 05 | `destinos` | An aircraft window opens onto Paris, then Punta Cana, Tóquio, Dubai, Nova York full screen, each with its own colour grade | 5.6 |
| 06 | `alem-do-ceu` | The camera tilts from open sky down to the sea: "Nem toda viagem começa em um aeroporto." / "Algumas começam no mar." | 2.7 |
| 07 | `cruzeiros` | Ocean from above; the camera travels with a ship; five regions; one illustrative route | 3.7 |
| 08 | `o-caminho` | "Você escolhe o destino. / Nós pensamos no caminho." held together, then five steps on a dashed route | 4.5 |
| 09 | `milhas` | One word turning into the next: Dinheiro → Milhas → Pontos → Oportunidades → VIAGEM | 3.5 |
| 10 | `proximo` | "E agora...", a beat of empty sky, "Qual será o seu próximo destino?", the two CTAs, the Alvea signature | 3.5 |

The site footer follows the last chapter as on every page.

### CTAs

| CTA | Where | Destination |
|---|---|---|
| "Planejar minha viagem →" | Chapter 10 | `/destinos` (internal `Link`) |
| "Falar com um especialista" | Chapter 10 | Official WhatsApp via `buildWhatsAppUrl(SPECIALIST_MESSAGE)`, new tab, `rel="noopener noreferrer"` |
| Progress dots (desktop) | Right edge, all chapters | Native smooth scroll to the chapter |
| Sound control | Bottom-right, appears after the first scroll | Switches the optional soundscape on/off (`aria-pressed`). Not stored; off again on every visit |

### Metadata

Title "Experiências — ALVEA JOURNEY | Alvea Viagens", plus a description, set in `page.tsx`.

### Responsiveness

- Every scene is laid out for portrait screens rather than scaled down: the map is zoomed and the camera follows the aircraft below `lg`; the destination window is a tall pill; the cruise stage is turned a quarter turn so the ship sails up the screen, with the regions as a list beside it; the five steps run down a vertical line; the final word of the miles scene is set larger.
- Progress: ten dots on the right from `lg`; a 2px gold line at the top of the screen below it.
- Checked without horizontal overflow at 1920, 1600, 1366, 1024, 768, 390, and 375px.

### Notes

- One `h1` (chapter 01) and one `h2` per following chapter; each section has an `aria-label`; decorative layers are `aria-hidden`.
- The airport, runway, sky, ocean, and planet are CSS compositions. `public/images/experiencias/airport/` and `final/` exist and are empty, ready for real photography.
- The footer "Links Rápidos" list includes this page (added 2026-10-07, stage 2).

---

## Page Transitions

**File:** `src/app/template.tsx`

All page navigations trigger a smooth entrance animation:
- `opacity: 0 → 1`
- `y: 14px → 0`
- `filter: blur(5px) → blur(0)`
- Duration: 0.58s, ease `[0.22, 1, 0.36, 1]`

This is applied via `template.tsx` which re-mounts on every route change (unlike `layout.tsx` which persists).

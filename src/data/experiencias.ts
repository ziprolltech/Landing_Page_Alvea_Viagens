// ─── ALVEA JOURNEY — content and assets for /experiencias ─────────────────────
// Everything the experience shows comes from here: chapters, copy lists, map
// cities and routes, and every asset path. Scene components hold layout and
// motion only.
//
// The page is inspirational storytelling. Nothing below is a commercial offer:
// no prices, dates, or itineraries of Alvea are stated.

/* ── Assets (all local, under public/images/experiencias/) ───────────────── */

export const JOURNEY_ASSETS = {
  plane:     '/images/plane-scroll.png',                       // 1672×941, nose to the right
  ship:      '/images/experiencias/cruise/ship.webp',          // 1696×263, bow to the right
  worldDots: '/images/experiencias/world/world-dots.svg',      // viewBox 1000×394.4
  logo:      '/logo-navbar.png',
} as const

export const PLANE_RATIO = 941 / 1672
export const SHIP_RATIO  = 263 / 1696

/* ── Chapters (order = scroll order) ─────────────────────────────────────────
   `screens` is the height of the chapter's section in viewports. Its stage is
   pinned for (screens − 1) viewports of scroll. Sections overlap by exactly one
   viewport (see Scene in scene.tsx), so the next chapter takes the frame at the
   very moment the previous one finishes: the page reads as one continuous
   shot, with no empty stretch between chapters. */

export interface Chapter {
  id:      string
  number:  string
  label:   string
  screens: number
}

export const CHAPTERS: Chapter[] = [
  { id: 'o-chamado',    number: '01', label: 'O chamado',              screens: 1.7 },
  { id: 'embarque',     number: '02', label: 'Embarque',               screens: 2.3 },
  { id: 'decolagem',    number: '03', label: 'Decolagem',              screens: 3.7 },
  { id: 'o-mundo',      number: '04', label: 'O mundo',                screens: 3.9 },
  { id: 'destinos',     number: '05', label: 'Escolha seu destino',    screens: 5.6 },
  { id: 'alem-do-ceu',  number: '06', label: 'Além do céu',            screens: 2.7 },
  { id: 'cruzeiros',    number: '07', label: 'Cruzeiros',              screens: 3.7 },
  { id: 'o-caminho',    number: '08', label: 'Como a Alvea pensa',     screens: 4.5 },
  { id: 'milhas',       number: '09', label: 'Viagem inteligente',     screens: 3.5 },
  { id: 'proximo',      number: '10', label: 'O próximo destino',      screens: 3.5 },
]

/* Scroll distance (in viewports) during which a chapter is pinned */
export const pinned = (c: Chapter) => c.screens - 1

export function chapter(id: string): Chapter {
  const found = CHAPTERS.find((c) => c.id === id)
  if (!found) throw new Error(`Unknown chapter: ${id}`)
  return found
}

/* ── Departure board (decorative; destinations only, no airline or schedule) ─ */

export const DEPARTURES = [
  { time: '06:40', destination: 'Lisboa',    gate: 'A2', status: 'Previsto'  },
  { time: '07:15', destination: 'Paris',     gate: 'B4', status: 'Previsto'  },
  { time: '08:05', destination: 'Nova York', gate: 'C1', status: 'Previsto'  },
  { time: '09:30', destination: 'Tóquio',    gate: 'A7', status: 'Previsto'  },
  { time: '10:10', destination: 'Dubai',     gate: 'B9', status: 'Previsto'  },
]

/* ── World map ───────────────────────────────────────────────────────────────
   world-dots.svg is an equirectangular projection cropped to 84°N … 58°S on a
   1000 × 394.4 canvas. `project` uses the same mapping, so cities and routes
   line up with the dots. */

export const MAP_WIDTH  = 1000
export const MAP_HEIGHT = 394.4
const LAT_TOP = 84
const LAT_BOTTOM = -58

export function project(lon: number, lat: number): { x: number; y: number } {
  return {
    x: ((lon + 180) / 360) * MAP_WIDTH,
    y: ((LAT_TOP - lat) / (LAT_TOP - LAT_BOTTOM)) * MAP_HEIGHT,
  }
}

export interface City {
  name:   string
  x:      number
  y:      number
  /* where the label sits relative to the dot */
  anchor: 'left' | 'right' | 'top' | 'bottom'
  /* on small screens only some labels are shown, to keep the map legible */
  mobileLabel: boolean
}

function city(name: string, lon: number, lat: number, anchor: City['anchor'], mobileLabel: boolean): City {
  return { name, ...project(lon, lat), anchor, mobileLabel }
}

export const ORIGIN: City = city('São Paulo', -46.63, -23.55, 'bottom', true)

/* In the order they appear as the story advances (Americas → Europe → East) */
export const CITIES: City[] = [
  city('Miami',     -80.19, 25.76, 'right',  false),
  city('Cancún',    -86.85, 21.16, 'left',   true),
  city('Nova York', -74.00, 40.71, 'top',    true),
  city('Lisboa',     -9.14, 38.72, 'left',   true),
  city('Londres',    -0.13, 51.51, 'top',    false),
  city('Paris',       2.35, 48.86, 'right',  true),
  city('Roma',       12.50, 41.90, 'bottom', false),
  city('Dubai',      55.27, 25.20, 'right',  true),
  city('Tóquio',    139.69, 35.68, 'top',    true),
  city('Sydney',    151.21, -33.87, 'left',  true),
]

/* Quadratic arc from the origin to a city, bowed "north" like a flight path */
export function routeControl(to: City): { x: number; y: number } {
  const dx = to.x - ORIGIN.x
  const dy = to.y - ORIGIN.y
  const lift = Math.hypot(dx, dy) * 0.24
  return { x: ORIGIN.x + dx / 2, y: ORIGIN.y + dy / 2 - lift }
}

export function routePath(to: City): string {
  const c = routeControl(to)
  return `M ${ORIGIN.x.toFixed(1)} ${ORIGIN.y.toFixed(1)} Q ${c.x.toFixed(1)} ${c.y.toFixed(1)} ${to.x.toFixed(1)} ${to.y.toFixed(1)}`
}

/* ── Destinations shown as full-screen moments ───────────────────────────── */

export interface JourneyDestination {
  region:  string
  city:    string
  country: string
  line:    string
  image:   string
  alt:     string
  /* atmosphere: a light colour grade over the photograph and a small accent */
  grade:   string
  accent:  string
}

export const JOURNEY_DESTINATIONS: JourneyDestination[] = [
  {
    region: 'Europa', city: 'Paris', country: 'França',
    line: 'Arte. História. Gastronomia.',
    image: '/images/experiencias/destinations/paris.webp',
    alt: 'Torre Eiffel às margens do Sena, em Paris',
    grade: 'linear-gradient(200deg, rgba(255,176,128,0.16) 0%, rgba(64,32,84,0.22) 100%)',
    accent: '#F4CDA6',
  },
  {
    region: 'Caribe', city: 'Punta Cana', country: 'República Dominicana',
    line: 'Mar azul. Areia branca. Dias sem pressa.',
    image: '/images/experiencias/destinations/punta-cana.webp',
    alt: 'Praia de areia clara e mar turquesa em Punta Cana',
    grade: 'linear-gradient(200deg, rgba(64,224,208,0.14) 0%, rgba(0,60,110,0.20) 100%)',
    accent: '#8BE8DC',
  },
  {
    region: 'Ásia', city: 'Tóquio', country: 'Japão',
    line: 'Uma cidade onde tradição e futuro coexistem.',
    image: '/images/experiencias/destinations/toquio.webp',
    alt: 'Rua movimentada e iluminada em Tóquio',
    grade: 'linear-gradient(200deg, rgba(255,64,160,0.13) 0%, rgba(30,20,90,0.26) 100%)',
    accent: '#FF9FCF',
  },
  {
    region: 'Oriente Médio', city: 'Dubai', country: 'Emirados Árabes Unidos',
    line: 'O deserto que aprendeu a tocar o céu.',
    image: '/images/experiencias/destinations/dubai.webp',
    alt: 'Horizonte de arranha-céus de Dubai ao entardecer',
    grade: 'linear-gradient(200deg, rgba(255,170,64,0.17) 0%, rgba(90,40,10,0.20) 100%)',
    accent: '#FFCB7A',
  },
  {
    region: 'América', city: 'Nova York', country: 'Estados Unidos',
    line: 'Uma cidade inteira para caber em poucos dias.',
    image: '/images/experiencias/destinations/nova-york.webp',
    alt: 'Vista aérea dos edifícios de Nova York',
    grade: 'linear-gradient(200deg, rgba(120,160,255,0.12) 0%, rgba(10,20,50,0.30) 100%)',
    accent: '#B4CDFF',
  },
]

/* ── Cruises (inspiration only — not itineraries on sale) ────────────────── */

export const CRUISE_REGIONS = ['Caribe', 'Mediterrâneo', 'Costa Brasileira', 'Alasca', 'Norte da Europa']

export const CRUISE_ROUTE = ['Brasil', 'Caribe', 'Mediterrâneo']

/* ── How Alvea thinks a trip ─────────────────────────────────────────────── */

export const PROCESS_STEPS = [
  'Entendemos o que você procura.',
  'Analisamos as possibilidades.',
  'Comparamos dinheiro, milhas e oportunidades.',
  'Pensamos na estratégia.',
  'Você embarca.',
]

/* ── Smart travel ────────────────────────────────────────────────────────── */

export const VALUE_CHAIN = ['Dinheiro', 'Milhas', 'Pontos', 'Oportunidades', 'Viagem']

/* ── Final call to action ────────────────────────────────────────────────── */

export const SPECIALIST_MESSAGE =
  'Olá, Alvea Viagens! Conheci a experiência ALVEA JOURNEY no site e gostaria de falar com um especialista sobre a minha próxima viagem.'

// ─── Builds src/data/airports-world.json ──────────────────────────────────────
// The complete airport base used by the airport autocomplete.
//
//   node scripts/build-airports.mjs [path/to/airports.csv]
//
// Source: OurAirports (https://ourairports.com/data/, public domain). If no
// file is given, airports.csv is downloaded from the project's data mirror.
// The site never contacts that source: this script runs by hand, and the site
// only reads the JSON it writes.
//
// What goes in
//   · airports that are open (types large / medium / small — closed airports,
//     heliports, seaplane bases and balloon ports are left out)
//   · with a valid, unique 3-letter IATA code
//   · with a name and a city
//
// What is done to them
//   · the hand-written Portuguese entries in src/data/airports.ts win over the
//     source for the airports they cover (name, city, country)
//   · country names are written in Portuguese (from the ISO code)
//   · airport names are put in Portuguese word order where the pattern is
//     unambiguous ("X International Airport" → "Aeroporto Internacional X")
//   · well-known cities are written in Portuguese ("London" → "Londres") and
//     the original name is kept as a search alias
//   · airports of a metropolitan area share its city name and its city code
//     ("LON", "PAR", "NYC" …) as a search alias
//   · the list is ordered by importance, so the best match within a search
//     tier is the busiest airport

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const SOURCE_URL = 'https://davidmegginson.github.io/ourairports-data/airports.csv'
const OUT = path.join(ROOT, 'src/data/airports-world.json')

/* ── CSV (RFC 4180: quoted fields, doubled quotes, newlines inside quotes) ── */

function parseCsv(text) {
  const rows = []
  let row = [], field = '', quoted = false
  text = text.replace(/^﻿/, '')
  for (let i = 0; i < text.length; i++) {
    const c = text[i]
    if (quoted) {
      if (c === '"') { if (text[i + 1] === '"') { field += '"'; i++ } else quoted = false }
      else field += c
    } else if (c === '"') quoted = true
    else if (c === ',') { row.push(field); field = '' }
    else if (c === '\n') { row.push(field); rows.push(row); row = []; field = '' }
    else if (c !== '\r') field += c
  }
  if (field || row.length) { row.push(field); rows.push(row) }
  const header = rows.shift()
  return rows.filter((r) => r.length === header.length).map((r) => Object.fromEntries(header.map((h, i) => [h, r[i]])))
}

/* ── Portuguese names ───────────────────────────────────────────────────── */

const countryNames = new Intl.DisplayNames(['pt-BR'], { type: 'region' })
function countryName(iso) {
  if (iso === 'XK') return 'Kosovo'
  try { return countryNames.of(iso) ?? iso } catch { return iso }
}

/* City names as Brazilians write them. Key: the name in the source. */
const CITY_PT = {
  'London': 'Londres', 'New York': 'Nova York', 'Tokyo': 'Tóquio', 'Lisbon': 'Lisboa', 'Rome': 'Roma',
  'Milan': 'Milão', 'Venice': 'Veneza', 'Florence': 'Florença', 'Naples': 'Nápoles', 'Turin': 'Turim',
  'Genoa': 'Gênova', 'Munich': 'Munique', 'Cologne': 'Colônia', 'Hamburg': 'Hamburgo', 'Berlin': 'Berlim',
  'Frankfurt am Main': 'Frankfurt', 'Nuremberg': 'Nuremberg', 'Vienna': 'Viena', 'Prague': 'Praga',
  'Athens': 'Atenas', 'Thessaloniki': 'Tessalônica', 'Moscow': 'Moscou', 'Saint Petersburg': 'São Petersburgo',
  'St. Petersburg': 'São Petersburgo', 'Beijing': 'Pequim', 'Shanghai': 'Xangai', 'Guangzhou': 'Cantão',
  'Seoul': 'Seul', 'Singapore': 'Singapura', 'Mexico City': 'Cidade do México', 'New Delhi': 'Nova Délhi',
  'Brussels': 'Bruxelas', 'Antwerp': 'Antuérpia', 'Geneva': 'Genebra', 'Zurich': 'Zurique', 'Basel': 'Basileia',
  'Copenhagen': 'Copenhague', 'Stockholm': 'Estocolmo', 'Helsinki': 'Helsinque', 'Warsaw': 'Varsóvia',
  'Krakow': 'Cracóvia', 'Kraków': 'Cracóvia', 'Budapest': 'Budapeste', 'Bucharest': 'Bucareste',
  'Belgrade': 'Belgrado', 'Sofia': 'Sófia', 'Kyiv': 'Kiev', 'Havana': 'Havana', 'Johannesburg': 'Joanesburgo',
  'Cape Town': 'Cidade do Cabo', 'Marrakech': 'Marrakech', 'Istanbul': 'Istambul',
  'Amsterdam': 'Amsterdã', 'Rotterdam': 'Roterdã', 'Edinburgh': 'Edimburgo', 'Seville': 'Sevilha',
  'Marseille': 'Marselha', 'Luxembourg': 'Luxemburgo', 'Jerusalem': 'Jerusalém', 'Jakarta': 'Jacarta',
  'Panama City': 'Cidade do Panamá', 'Montevideo': 'Montevidéu', 'Asuncion': 'Assunção', 'Asunción': 'Assunção',
  'Guatemala City': 'Cidade da Guatemala', 'Philadelphia': 'Filadélfia', 'New Orleans': 'Nova Orleans',
  'Algiers': 'Argel', 'Tunis': 'Túnis', 'Nairobi': 'Nairóbi', 'Addis Ababa': 'Adis Abeba', 'Accra': 'Acra',
  'Riyadh': 'Riad', 'Jeddah': 'Jidá', 'Kuwait City': 'Cidade do Kuwait', 'Tehran': 'Teerã', 'Baghdad': 'Bagdá',
  'Damascus': 'Damasco', 'Beirut': 'Beirute', 'Amman': 'Amã', 'Kathmandu': 'Katmandu', 'Hanoi': 'Hanói',
  'Taipei': 'Taipé', 'Bogota': 'Bogotá', 'Medellin': 'Medellín', 'Cancun': 'Cancún', 'San Jose': 'San José',
  'Malaga': 'Málaga', 'Dusseldorf': 'Düsseldorf', 'Lisboa': 'Lisboa', 'Dublin': 'Dublin', 'Nice': 'Nice',
  'Tel Aviv': 'Tel Aviv', 'Cairo': 'Cairo', 'Casablanca': 'Casablanca', 'Mumbai': 'Mumbai', 'Delhi': 'Délhi',
  'Phnom Penh': 'Phnom Penh', 'Ho Chi Minh City': 'Ho Chi Minh', 'Male': 'Malé', 'Reykjavik': 'Reykjavik',
  'Quebec': 'Quebec', 'Montreal': 'Montreal', 'Hawaii': 'Havaí', 'Santo Domingo': 'Santo Domingo',
  /* the same cities, where the source uses the local spelling */
  'Firenze': 'Florença', 'Venezia': 'Veneza', 'Milano': 'Milão', 'Napoli': 'Nápoles', 'Torino': 'Turim',
  'Genova': 'Gênova', 'München': 'Munique', 'Köln': 'Colônia', 'Wien': 'Viena', 'Praha': 'Praga',
  'København': 'Copenhague', 'Warszawa': 'Varsóvia', 'Bruxelles': 'Bruxelas', 'Genève': 'Genebra',
  'Zürich': 'Zurique', 'Sevilla': 'Sevilha', 'Moskva': 'Moscou', 'Athina': 'Atenas', 'Bucureşti': 'Bucareste',
  'Beograd': 'Belgrado', 'Lisboa': 'Lisboa', 'Den Haag': 'Haia', 'The Hague': 'Haia', 'Nürnberg': 'Nuremberg',
}

/* Airports whose source city is a suburb: the city travellers know */
const CITY_OF = { MVD: 'Montevidéu', FLR: 'Florença', PSA: 'Pisa', BGY: 'Milão', CIA: 'Roma', TSF: 'Veneza' }

/* Metropolitan areas: city code → city name and its airports */
const METRO = {
  LON: ['Londres', 'LHR LGW STN LTN LCY SEN'], PAR: ['Paris', 'CDG ORY BVA'], NYC: ['Nova York', 'JFK LGA EWR'],
  TYO: ['Tóquio', 'NRT HND'], SAO: ['São Paulo', 'GRU CGH VCP'], RIO: ['Rio de Janeiro', 'GIG SDU'],
  BHZ: ['Belo Horizonte', 'CNF PLU'], MIL: ['Milão', 'MXP LIN BGY'], ROM: ['Roma', 'FCO CIA'],
  BUE: ['Buenos Aires', 'EZE AEP'], WAS: ['Washington', 'IAD DCA BWI'], CHI: ['Chicago', 'ORD MDW'],
  MOW: ['Moscou', 'SVO DME VKO'], SEL: ['Seul', 'ICN GMP'], OSA: ['Osaka', 'KIX ITM'], BJS: ['Pequim', 'PEK PKX'],
  SHA: ['Xangai', 'PVG SHA'], STO: ['Estocolmo', 'ARN BMA'], YTO: ['Toronto', 'YYZ YTZ'], JKT: ['Jacarta', 'CGK HLP'],
  IST: ['Istambul', 'IST SAW'], DXB: ['Dubai', 'DXB DWC'], BKK: ['Bangkok', 'BKK DMK'], MIA: ['Miami', 'MIA'],
}
const METRO_OF = {}
/* `order`: position in the list above — the city's main airport comes first */
for (const [code, [city, airports]] of Object.entries(METRO)) airports.split(' ').forEach((iata, order) => { METRO_OF[iata] = { code, city, order } })

/* ── The hand-written Portuguese entries (src/data/airports.ts) ─────────── */

function curatedEntries() {
  const source = fs.readFileSync(path.join(ROOT, 'src/data/airports.ts'), 'utf8')
  const entries = {}
  const line = /\{\s*code:\s*'([A-Z]{3})',\s*airport:\s*'((?:[^'\\]|\\.)*)',\s*city:\s*'((?:[^'\\]|\\.)*)',\s*country:\s*'((?:[^'\\]|\\.)*)'\s*\}/g
  for (const m of source.matchAll(line)) entries[m[1]] = { name: m[2].replace(/\\'/g, "'"), city: m[3].replace(/\\'/g, "'"), country: m[4].replace(/\\'/g, "'") }
  return entries
}

/* "Tancredo Neves International Airport" → "Aeroporto Internacional Tancredo Neves".
   Only the unambiguous endings are touched; anything else keeps the source name. */
function namePt(name) {
  if (/^aeroporto\b/i.test(name)) return name
  const rules = [
    [/^(.+?) International Airport$/i, 'Aeroporto Internacional $1'],
    [/^(.+?) Regional Airport$/i, 'Aeroporto Regional $1'],
    [/^(.+?) Municipal Airport$/i, 'Aeroporto Municipal $1'],
    [/^(.+?) Airport$/i, 'Aeroporto $1'],
  ]
  for (const [pattern, to] of rules) if (pattern.test(name)) return name.replace(pattern, to)
  return name
}

/* A city for airports the source lists without one: the airport's own name */
function cityFromName(name) {
  return tidy(
    name
      .replace(/\b(International|Regional|Municipal|Domestic)\b/gi, '')
      .replace(/\b(Airport|Airfield|Airstrip|Aerodrome|Air Base|Aeroporto|Aeropuerto)\b/gi, '')
      .replace(/[-–/].*$/, ''),
  )
}

/* ── Build ──────────────────────────────────────────────────────────────── */

const normalize = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')

/* Portuguese city → the spellings it replaces, as search terms */
const OTHER_SPELLINGS = {}
for (const [from, to] of Object.entries(CITY_PT)) {
  if (normalize(from) !== normalize(to)) (OTHER_SPELLINGS[to] ??= []).push(normalize(from))
}

const norm = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
const tidy = (s) => s.replace(/\s+/g, ' ').trim()

async function readSource() {
  const file = process.argv[2]
  if (file) return fs.readFileSync(file, 'utf8')
  console.log('downloading', SOURCE_URL)
  const response = await fetch(SOURCE_URL)
  if (!response.ok) throw new Error(`download failed: ${response.status}`)
  return response.text()
}

const rows = parseCsv(await readSource())
const curated = curatedEntries()
const TYPES = { large_airport: 0, medium_airport: 1, small_airport: 2 }

const report = { source: rows.length, noIata: 0, notOpen: 0, noCity: 0, duplicates: 0 }
const byIata = new Map()

for (const row of rows) {
  const iata = row.iata_code
  if (!/^[A-Z]{3}$/.test(iata)) { report.noIata++; continue }
  if (!(row.type in TYPES)) { report.notOpen++; continue }
  if (byIata.has(iata)) { report.duplicates++; continue }

  const own = curated[iata]
  const metro = METRO_OF[iata]
  /* "Paris (Roissy-en-France, Val-d'Oise)" → "Paris" */
  let sourceCity = tidy(row.municipality.replace(/\s*\(.*?\)\s*/g, ' ').split(/[,/]/)[0])
  /* no city in the source: keep the airport only if it has scheduled service */
  if (!sourceCity && row.scheduled_service === 'yes') sourceCity = cityFromName(row.name)
  const name = tidy(own?.name ?? namePt(tidy(row.name)))
  const city = own?.city ?? metro?.city ?? CITY_OF[iata] ?? CITY_PT[sourceCity] ?? sourceCity
  if (!name || !city) { report.noCity++; continue }

  /* extra search terms: the city code, the city as the source writes it, and
     the other spellings of the city shown ("tokyo" for Tóquio) */
  const alias = [...new Set([
    metro ? metro.code.toLowerCase() : '',
    norm(sourceCity) !== norm(city) ? norm(sourceCity) : '',
    ...(OTHER_SPELLINGS[city] ?? []),
  ].filter((term) => term && term !== norm(city)))].join(' ')

  byIata.set(iata, {
    iata, name, city,
    iso: row.iso_country,
    /* one spelling per country: always from the ISO code when there is one */
    ownCountry: row.iso_country ? undefined : own?.country,
    icao: /^[A-Z0-9]{4}$/.test(row.icao_code) ? row.icao_code : '',
    alias,
    /* importance: hand-written first, then size, scheduled service before none */
    rank: (own ? 0 : 10) + TYPES[row.type] + (row.scheduled_service === 'yes' ? 0 : 3) + (metro ? metro.order * 0.01 : 0.5),
  })
}

/* hand-written airports the source does not have (kept as they are) */
const missing = Object.keys(curated).filter((iata) => !byIata.has(iata))
for (const iata of missing) {
  byIata.set(iata, { iata, ...curated[iata], iso: '', ownCountry: curated[iata].country, icao: '', alias: '', rank: 0 })
}

const airports = [...byIata.values()].sort((a, b) => a.rank - b.rank || a.iata.localeCompare(b.iata))

/* countries are stored once; each airport points at one */
const countries = []
const countryIndex = new Map()
function countryId(label) {
  if (!countryIndex.has(label)) { countryIndex.set(label, countries.length); countries.push(label) }
  return countryIndex.get(label)
}

const data = {
  source: 'OurAirports (ourairports.com/data, public domain) + src/data/airports.ts',
  generated: new Date().toISOString().slice(0, 10),
  /* each airport: [iata, name, city, country index, icao, search aliases] */
  countries,
  airports: airports.map((a) => [a.iata, a.name, a.city, countryId(a.ownCountry ?? countryName(a.iso)), a.icao, a.alias]),
}
data.countries = countries

/* ── Checks ─────────────────────────────────────────────────────────────── */

const codes = data.airports.map((a) => a[0])
if (new Set(codes).size !== codes.length) throw new Error('duplicate IATA codes in the output')
for (const a of data.airports) {
  if (!/^[A-Z]{3}$/.test(a[0]) || !a[1] || !a[2] || typeof a[3] !== 'number' || !countries[a[3]]) throw new Error(`bad record: ${JSON.stringify(a)}`)
}

fs.writeFileSync(OUT, JSON.stringify(data))
console.log({
  ...report,
  written: data.airports.length,
  countries: countries.length,
  withIcao: data.airports.filter((a) => a[4]).length,
  handWritten: Object.keys(curated).length,
  handWrittenNotInSource: missing,
  bytes: fs.statSync(OUT).size,
})

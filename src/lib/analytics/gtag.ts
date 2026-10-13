// ─── Google Analytics 4 — loader and event helper ─────────────────────────────
// Single integration point: nothing else in the project talks to gtag. There is
// no Google Tag Manager, so each event has exactly one source.
//
// Page views are NOT sent from here. The `config` call sends the first one and
// GA4's enhanced measurement ("Page changes based on browser history events",
// on by default) sends the following ones as the App Router navigates. Sending
// them from code as well would count every navigation twice.

import { GA_MEASUREMENT_ID, ANALYTICS_ENABLED } from './config'

type Params = Record<string, string | number | boolean | undefined>

declare global {
  interface Window {
    dataLayer?: unknown[]
    gtag?: (...args: unknown[]) => void
  }
}

const LANDING_KEY = 'alvea-landing'
const UTM_TO_GA: Record<string, string> = {
  utm_source:   'campaign_source',
  utm_medium:   'campaign_medium',
  utm_campaign: 'campaign_name',
  utm_content:  'campaign_content',
  utm_term:     'campaign_term',
  utm_id:       'campaign_id',
}

const DISABLE_FLAG = 'ga-disable-' + GA_MEASUREMENT_ID

let loaded = false

interface Landing { url: string; referrer: string }

/* Remembers, for this tab only, where the visit started. The banner may be
   answered a few pages later; without this the campaign (UTM) and the referrer
   of the first page would be lost. Only the address and the referrer are kept. */
export function rememberLanding() {
  try {
    if (window.sessionStorage.getItem(LANDING_KEY)) return
    const landing: Landing = { url: window.location.href, referrer: document.referrer }
    window.sessionStorage.setItem(LANDING_KEY, JSON.stringify(landing))
  } catch {
    /* storage blocked: attribution falls back to the current page */
  }
}

function readLanding(): Landing | null {
  try {
    const value = window.sessionStorage.getItem(LANDING_KEY)
    return value ? (JSON.parse(value) as Landing) : null
  } catch {
    return null
  }
}

/* Campaign and referrer of the first page, when the tag starts on a later one */
function landingAttribution(): Params {
  const landing = readLanding()
  if (!landing || landing.url === window.location.href) return {}
  const params: Params = {}
  try {
    const query = new URL(landing.url).searchParams
    for (const [utm, ga] of Object.entries(UTM_TO_GA)) {
      const value = query.get(utm)
      if (value) params[ga] = value
    }
  } catch {
    /* malformed address: ignore */
  }
  if (landing.referrer) params.page_referrer = landing.referrer
  return params
}

/* Loads gtag.js once. Called only after the visitor accepts analytics cookies. */
export function loadAnalytics() {
  if (!ANALYTICS_ENABLED) return
  if (loaded) {
    /* accepted again after having withdrawn consent on this page */
    delete (window as unknown as Record<string, unknown>)[DISABLE_FLAG]
    window.gtag?.('consent', 'update', { analytics_storage: 'granted' })
    return
  }
  loaded = true

  window.dataLayer = window.dataLayer ?? []
  /* gtag expects the `arguments` object itself, not an array copy */
  window.gtag = function gtag() {
    // eslint-disable-next-line prefer-rest-params
    window.dataLayer!.push(arguments)
  }

  /* Consent Mode v2. There are no advertising tags: those signals stay denied. */
  window.gtag('consent', 'default', {
    analytics_storage:  'granted',
    ad_storage:         'denied',
    ad_user_data:       'denied',
    ad_personalization: 'denied',
  })
  window.gtag('js', new Date())
  window.gtag('config', GA_MEASUREMENT_ID, landingAttribution())

  const script = document.createElement('script')
  script.async = true
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`
  document.head.appendChild(script)
}

/* The visitor withdrew consent: stop measuring and remove the GA cookies */
export function stopAnalytics() {
  if (!loaded) return
  window.gtag?.('consent', 'update', { analytics_storage: 'denied' })
  /* gtag's own opt-out switch: from here on it sends nothing at all */
  ;(window as unknown as Record<string, unknown>)[DISABLE_FLAG] = true
  const names = document.cookie
    .split(';')
    .map((cookie) => cookie.split('=')[0].trim())
    .filter((name) => name.startsWith('_ga'))
  const host = window.location.hostname
  const domains = [host, `.${host}`, `.${host.replace(/^www\./, '')}`]
  for (const name of names) {
    document.cookie = `${name}=; Max-Age=0; path=/`
    for (const domain of domains) {
      document.cookie = `${name}=; Max-Age=0; path=/; domain=${domain}`
    }
  }
}

/* Sends one event. A no-op until the tag is loaded (no ID, or no consent).
   NEVER pass personal data: no names, e-mails, phones or message text. */
export function track(event: string, params: Params = {}) {
  if (!loaded) return
  window.gtag?.('event', event, params)
}

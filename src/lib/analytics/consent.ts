// ─── Cookie consent (analytics) ───────────────────────────────────────────────
// The visitor's choice is kept in localStorage, in this browser only. Google
// Analytics is loaded only after "granted"; with no choice or "denied" the tag
// is never requested and no analytics cookie is written.

export type ConsentChoice = 'granted' | 'denied'

const STORAGE_KEY = 'alvea-cookie-consent'

/* Fired on `window` whenever the choice changes */
export const CONSENT_EVENT = 'alvea:consent'
/* Fired on `window` to bring the banner back (footer link) */
export const CONSENT_OPEN_EVENT = 'alvea:consent-open'

export function readConsent(): ConsentChoice | null {
  try {
    const value = window.localStorage.getItem(STORAGE_KEY)
    return value === 'granted' || value === 'denied' ? value : null
  } catch {
    return null
  }
}

export function saveConsent(choice: ConsentChoice) {
  try {
    window.localStorage.setItem(STORAGE_KEY, choice)
  } catch {
    /* storage blocked: the choice lasts for this page only */
  }
  window.dispatchEvent(new CustomEvent<ConsentChoice>(CONSENT_EVENT, { detail: choice }))
}

export function openConsentPreferences() {
  window.dispatchEvent(new Event(CONSENT_OPEN_EVENT))
}

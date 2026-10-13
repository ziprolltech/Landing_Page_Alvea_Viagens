// ─── Google Analytics 4 — configuration ───────────────────────────────────────
// The measurement ID comes from NEXT_PUBLIC_GA_MEASUREMENT_ID (set in Vercel,
// Production environment only). It is a public identifier, not a secret: it is
// meant to be visible in the page. Without a valid ID nothing is loaded, no
// cookie is written and the consent banner is not shown.

const raw = (process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ?? '').trim()

export const GA_MEASUREMENT_ID = /^G-[A-Z0-9]{6,}$/.test(raw) ? raw : ''
export const ANALYTICS_ENABLED = GA_MEASUREMENT_ID !== ''

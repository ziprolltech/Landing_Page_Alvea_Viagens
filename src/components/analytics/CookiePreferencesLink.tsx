'use client'

import { ANALYTICS_ENABLED } from '@/lib/analytics/config'
import { openConsentPreferences } from '@/lib/analytics/consent'

/* Footer link that brings the cookie banner back, so a choice can be changed.
   Not rendered while no measurement ID is configured. */
export default function CookiePreferencesLink() {
  if (!ANALYTICS_ENABLED) return null
  return (
    <button
      type="button"
      onClick={openConsentPreferences}
      className="mt-2 mx-auto block text-white/40 hover:text-gold text-[12px] underline underline-offset-2 transition-colors duration-200"
    >
      Preferências de cookies
    </button>
  )
}

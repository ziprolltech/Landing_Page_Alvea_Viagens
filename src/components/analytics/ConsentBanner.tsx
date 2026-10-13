'use client'

import { useEffect, useState } from 'react'
import { ANALYTICS_ENABLED } from '@/lib/analytics/config'
import { CONSENT_OPEN_EVENT, readConsent, saveConsent, type ConsentChoice } from '@/lib/analytics/consent'

/* Cookie choice for Google Analytics. It really controls the tag: gtag.js is
   requested only after "Aceitar" (see Analytics.tsx). Shown when there is no
   stored choice, or when the footer link asks for it again. Not rendered at all
   while no measurement ID is configured — there is nothing to consent to. */
export default function ConsentBanner() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!ANALYTICS_ENABLED) return
    if (readConsent() === null) setOpen(true)
    const reopen = () => setOpen(true)
    window.addEventListener(CONSENT_OPEN_EVENT, reopen)
    return () => window.removeEventListener(CONSENT_OPEN_EVENT, reopen)
  }, [])

  if (!open) return null

  function choose(choice: ConsentChoice) {
    saveConsent(choice)
    setOpen(false)
  }

  const button =
    'flex-1 sm:flex-none min-h-[42px] px-5 rounded-full text-[13px] font-semibold transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/70'

  return (
    <div
      role="region"
      aria-label="Cookies de medição"
      className="fixed bottom-3 inset-x-3 z-[70] mx-auto max-w-3xl rounded-2xl border border-white/10 px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-5"
      style={{ background: 'rgba(5,13,26,0.97)', boxShadow: '0 12px 40px rgba(0,0,0,0.45)' }}
    >
      <p className="flex-1 text-white/70 text-[13px] leading-relaxed">
        Usamos cookies de medição (Google Analytics) para entender como o site é usado e melhorá-lo.
        Eles só são ativados se você aceitar.
      </p>
      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => choose('denied')}
          className={`${button} border border-white/20 text-white/85 hover:border-white/40`}
        >
          Recusar
        </button>
        <button
          type="button"
          onClick={() => choose('granted')}
          className={`${button} border border-gold/50 bg-gold/15 text-gold-light hover:bg-gold/25`}
        >
          Aceitar
        </button>
      </div>
    </div>
  )
}

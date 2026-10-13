'use client'

import { useEffect } from 'react'
import { ANALYTICS_ENABLED } from '@/lib/analytics/config'
import { CONSENT_EVENT, readConsent, type ConsentChoice } from '@/lib/analytics/consent'
import { loadAnalytics, rememberLanding, stopAnalytics, track } from '@/lib/analytics/gtag'

/* Where on the page the click happened: an explicit data-track-location wins,
   then the footer / menu, then the page body. */
function locationOf(el: Element): string {
  const marked = el.closest('[data-track-location]')
  if (marked) return marked.getAttribute('data-track-location') ?? 'page'
  if (el.closest('footer')) return 'footer'
  if (el.closest('header')) return 'navbar'
  return 'page'
}

/* One listener for every outbound contact link and every element marked with
   data-track. Only the kind of link and its position are sent — never the
   address itself, which may carry a pre-filled message. */
function onClick(e: MouseEvent) {
  const target = e.target instanceof Element ? e.target : null
  if (!target) return

  const marked = target.closest('[data-track]')
  if (marked) {
    track(marked.getAttribute('data-track')!, { link_location: locationOf(marked) })
  }

  const link = target.closest('a[href]')
  if (!link) return
  const href = link.getAttribute('href') ?? ''
  const link_location = locationOf(link)

  if (href.startsWith('mailto:')) return track('email_click', { link_location })
  if (!/^https?:\/\//.test(href)) return

  let host = ''
  try { host = new URL(href).hostname } catch { return }

  if (host === 'chat.whatsapp.com') return track('offer_group_click', { link_location })
  if (host === 'wa.me' || host === 'api.whatsapp.com') return track('whatsapp_click', { link_location })
  if (host.endsWith('instagram.com')) return track('instagram_click', { link_location })
}

/* Mounted once in the root layout. Renders nothing. */
export default function Analytics() {
  useEffect(() => {
    if (!ANALYTICS_ENABLED) return

    rememberLanding()
    if (readConsent() === 'granted') loadAnalytics()

    function onConsent(e: Event) {
      const choice = (e as CustomEvent<ConsentChoice>).detail
      if (choice === 'granted') loadAnalytics()
      else stopAnalytics()
    }

    window.addEventListener(CONSENT_EVENT, onConsent)
    document.addEventListener('click', onClick, true)
    return () => {
      window.removeEventListener(CONSENT_EVENT, onConsent)
      document.removeEventListener('click', onClick, true)
    }
  }, [])

  return null
}

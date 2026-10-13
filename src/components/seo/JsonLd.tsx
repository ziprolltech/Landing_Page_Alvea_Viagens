import { WHATSAPP_NUMBER } from '@/lib/config/links'
import {
  SITE_URL, SITE_NAME, SITE_DESCRIPTION, SITE_EMAIL, SITE_INSTAGRAM, SITE_CNPJ,
} from '@/lib/config/site'

/* Schema.org structured data (JSON-LD), rendered once in the root layout.
   Only facts that the site itself already shows: name, address of the site,
   e-mail, WhatsApp number, Instagram and CNPJ. No street address, opening
   hours, prices, ratings or review counts — the agency has not published any
   that could be checked, and search engines penalise invented ones. */
const DATA = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'TravelAgency',
      '@id': `${SITE_URL}/#organization`,
      name: SITE_NAME,
      url: SITE_URL,
      description: SITE_DESCRIPTION,
      logo: `${SITE_URL}/icons/icon-512.png`,
      image: `${SITE_URL}/og-image.png`,
      email: SITE_EMAIL,
      telephone: `+${WHATSAPP_NUMBER}`,
      taxID: SITE_CNPJ,
      areaServed: { '@type': 'Country', name: 'Brasil' },
      sameAs: [SITE_INSTAGRAM],
      contactPoint: {
        '@type': 'ContactPoint',
        contactType: 'customer service',
        telephone: `+${WHATSAPP_NUMBER}`,
        email: SITE_EMAIL,
        availableLanguage: 'Portuguese',
        areaServed: 'BR',
      },
    },
    {
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      url: SITE_URL,
      name: SITE_NAME,
      inLanguage: 'pt-BR',
      publisher: { '@id': `${SITE_URL}/#organization` },
    },
  ],
}

export default function JsonLd() {
  return (
    <script
      type="application/ld+json"
      /* static object built from constants: `<` is escaped so the JSON can
         never close the script tag */
      dangerouslySetInnerHTML={{ __html: JSON.stringify(DATA).replace(/</g, '\\u003c') }}
    />
  )
}

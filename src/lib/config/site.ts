// ─── Site identity used by SEO (metadata, sitemap, robots, JSON-LD) ───────────
// SITE_URL is the address that actually answers with the pages: in Vercel,
// alveaviagens.com.br redirects (308) to www.alveaviagens.com.br, so the "www"
// address is the canonical one. If that redirect is ever inverted in Vercel,
// change SOMENTE this line.
export const SITE_URL = 'https://www.alveaviagens.com.br'

export const SITE_NAME = 'Alvea Viagens'

export const SITE_DESCRIPTION =
  'Passagens aéreas, milhas e oportunidades exclusivas para você viajar mais pagando menos.'

export const SITE_EMAIL     = 'alveaviagens@gmail.com'
export const SITE_INSTAGRAM = 'https://www.instagram.com/alveaviagens/'
export const SITE_CNPJ      = '59.070.673/0001-60'

/* Pages listed in the sitemap: public, indexable, linked from the menu.
   /passagens is left out on purpose — nothing links to it and it is noindex. */
export const INDEXABLE_ROUTES = [
  { path: '/',                 priority: 1.0, changeFrequency: 'weekly'  },
  { path: '/destinos',         priority: 0.9, changeFrequency: 'weekly'  },
  { path: '/milhas',           priority: 0.9, changeFrequency: 'monthly' },
  { path: '/grupo-de-ofertas', priority: 0.8, changeFrequency: 'monthly' },
  { path: '/experiencias',     priority: 0.7, changeFrequency: 'monthly' },
  { path: '/atendimento',      priority: 0.7, changeFrequency: 'monthly' },
] as const

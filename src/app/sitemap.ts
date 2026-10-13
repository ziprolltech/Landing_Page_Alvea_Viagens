import type { MetadataRoute } from 'next'
import { SITE_URL, INDEXABLE_ROUTES } from '@/lib/config/site'

/* Served at /sitemap.xml: the canonical address of every indexable page.
   To add a page, add it to INDEXABLE_ROUTES in src/lib/config/site.ts. */
export default function sitemap(): MetadataRoute.Sitemap {
  return INDEXABLE_ROUTES.map(({ path, priority, changeFrequency }) => ({
    url: path === '/' ? SITE_URL : `${SITE_URL}${path}`,
    changeFrequency,
    priority,
  }))
}

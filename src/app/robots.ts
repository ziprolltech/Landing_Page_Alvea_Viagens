import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/config/site'

/* Served at /robots.txt. Every public page may be crawled; only the API is
   kept out (it returns data, not pages). /_next is NOT blocked: Google needs
   the scripts and styles there to render the pages. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: '/api/' }],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  }
}

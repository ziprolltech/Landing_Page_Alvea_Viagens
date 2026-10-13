# Deployment

## Repository

- Official repository: https://github.com/ziprolltech/Landing_Page_Alvea_Viagens
- Production branch: `main`
- The earlier repository (`ziprolltech/Landing-Page-AlveaViagens`) holds the first two commits only and is kept locally as the remote `origin-antigo`.

## Build

| | |
|---|---|
| Framework | Next.js 15 (App Router) |
| Install | `npm install` |
| Build | `npm run build` |
| Output | Next.js default (`.next`) |
| Node | 20 or newer |

Checks before publishing: `npx tsc --noEmit`, `npx eslint src scripts`, `npm run build`. There is no automated test suite.

After publishing, `/robots.txt` and `/sitemap.xml` must answer 200 and every page must carry a `rel="canonical"` link on the `www` address (see `seo.md`).

The build downloads the Inter font from Google Fonts (`next/font`). If that download fails, the build fails with an error in `next/font`; running it again is enough.

## Hosting

Vercel, project `alvea-viagens`, connected to the GitHub repository: every push to `main` produces a production deployment, and other branches produce preview deployments.

## Domains

| Address | Behaviour |
|---|---|
| `https://www.alveaviagens.com.br` | Serves the site. **Canonical address** (`SITE_URL` in `src/lib/config/site.ts`) |
| `https://alveaviagens.com.br` | Redirects (308) to the `www` address, keeping path and query string |
| `https://alvea-viagens.vercel.app` | Serves the same production deployment; its pages point to the `www` address as canonical |

DNS is hosted at Registro.br. Preview deployments are protected by Vercel Authentication; custom domains are public.

## Environment variables

None is required for the site to work.

| Name | Where it is read | Needed |
|---|---|---|
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | Browser — `src/lib/analytics/config.ts` | To switch Google Analytics on. Value `G-PGVBY1GKMD`. Set it for the **Production** environment only, then redeploy. On 2026-10-13 the published site did not contain it yet. Without it no tag, cookie or consent banner exists. See `analytics.md` |
| `DUFFEL_API_KEY` | Server only — `src/lib/duffel/client.ts`, used by `/api/flights/search` | Only if live flight search is switched back on |
| `DUFFEL_ENV` | Server only | Same |

They are deliberately **not** set in production: the site does not call the flight API (see `booking-flow.md`), and the route has no rate limiting, so leaving the key out keeps the endpoint inert.

`NEXT_PUBLIC_GA_MEASUREMENT_ID` is the only variable exposed to the browser. It is a public identifier, not a secret. `NEXT_PUBLIC_*` values are fixed at build time: changing one requires a new deployment.

`.env` and `.env.local` are in `.gitignore`.

## Large files

`public/videos/grupo-ofertas.mp4` is 44 MB — under GitHub's 100 MB limit, but worth compressing or moving to a video host if it grows.

## Known limits at the first deployment (2026-10-08)

- `npm audit` still reports a PostCSS advisory inside Next.js whose fix requires a breaking upgrade; it concerns build-time CSS processing of untrusted input, which this project does not do.
- Security headers: HSTS from Vercel, plus `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy` and `Permissions-Policy` from `next.config.ts` (added 2026-10-13). There is no Content-Security-Policy.
- `/passagens` still exists and is reachable by URL, but nothing links to it; it is `noindex` and absent from the sitemap.
- Footer and contact cards use `wa.me` links without text; forms use `api.whatsapp.com/send`.
- The sound of `/experiencias` has been verified by measurement only, not by ear.

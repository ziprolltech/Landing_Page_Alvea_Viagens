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

The build downloads the Inter font from Google Fonts (`next/font`). If that download fails, the build fails with an error in `next/font`; running it again is enough.

## Hosting

Vercel, connected to the GitHub repository: every push to `main` produces a production deployment, and other branches produce preview deployments. The production URL is the one shown on the project's page in Vercel.

No custom domain is configured.

## Environment variables

None is required.

| Name | Where it is read | Needed |
|---|---|---|
| `DUFFEL_API_KEY` | Server only — `src/lib/duffel/client.ts`, used by `/api/flights/search` | Only if live flight search is switched back on |
| `DUFFEL_ENV` | Server only | Same |

They are deliberately **not** set in production: the site does not call the flight API (see `booking-flow.md`), and the route has no rate limiting, so leaving the key out keeps the endpoint inert. No variable is exposed to the browser (there is no `NEXT_PUBLIC_*`).

`.env` and `.env.local` are in `.gitignore`.

## Large files

`public/videos/grupo-ofertas.mp4` is 44 MB — under GitHub's 100 MB limit, but worth compressing or moving to a video host if it grows.

## Known limits at the first deployment (2026-10-08)

- `npm audit` still reports a PostCSS advisory inside Next.js whose fix requires a breaking upgrade; it concerns build-time CSS processing of untrusted input, which this project does not do.
- No security headers (CSP, HSTS, etc.) are configured beyond the host's defaults.
- `/passagens` still exists and is reachable by URL, but nothing links to it.
- Footer and contact cards use `wa.me` links without text; forms use `api.whatsapp.com/send`.
- The sound of `/experiencias` has been verified by measurement only, not by ear.

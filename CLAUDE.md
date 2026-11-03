# CLAUDE.md

Guidance for Claude Code (and other AI assistants) working in this repository.

## What this is

A personal portfolio website for **Asher Shores**, live at
[www.ashershores.com](https://www.ashershores.com). Single-page React app with a
dark theme, sectioned layout (Intro → Skills → Certifications → Projects →
Connect → Contact) and a serverless contact form.

## Critical layout note

The repository root is **not** the app root. The web app lives in the nested
[portfolio/](portfolio/) directory.

```
portfolio-web-app/        <- repo root (this file lives here)
├── README.md
├── CLAUDE.md             <- this file
├── spec.md               <- product/technical spec (section 8 = 2026-11 refresh)
├── amplify.yml           <- Amplify build spec (builds portfolio/)
├── customHttp.yml        <- Amplify security headers (CSP etc.)
├── infra/                <- contact-form backend (CDK), separate package
└── portfolio/            <- the React app — run web npm commands FROM HERE
    ├── index.html        <- Vite entry HTML (meta tags, icons)
    ├── vite.config.js    <- Vite + Vitest config (build.outDir = build)
    ├── public/           <- static files copied as-is (icons, og-image, badges)
    └── src/
        ├── main.jsx      <- React entry
        ├── config.js     <- CONTACT_ENDPOINT
        ├── components/   <- one component per section (.jsx)
        └── data/         <- projects, skills, certs, socials
```

**Always `cd portfolio` before running web `npm` commands.** There is no
`package.json` at the repo root.

## Tech stack

- **Vite 8** + **Vitest 5** (jsdom, Testing Library). JavaScript, not TypeScript;
  files containing JSX use `.jsx`. `package.json` is `"type": "module"`, so the
  PostCSS/Tailwind configs are `.cjs`.
- **React 18.3**
- **TailwindCSS 3.4** ([tailwind.config.cjs](portfolio/tailwind.config.cjs), [postcss.config.cjs](portfolio/postcss.config.cjs))
- **lucide-react** for icons
- **AWS Amplify** hosts the site (builds from GitHub `main`); a **Lambda Function URL**
  backs the contact form.

## Commands

Run from [portfolio/](portfolio/):

```bash
npm ci             # install exact dependencies
npm run dev        # dev server at http://localhost:5173
npm test           # vitest run (one-shot)
npm run build      # production build -> portfolio/build/
npm run preview    # serve the build locally (add --host 127.0.0.1)
```

There is no lint script.

## Code conventions

- Components live in [portfolio/src/components/](portfolio/src/components/), one
  per section, exported as **named** exports (e.g. `export const IntroSection`).
- All display content is **data-driven** from [portfolio/src/data/](portfolio/src/data/):
  `projects.js` (newest first; `liveUrl`/`github` optional), `skills.js` (six
  categories, no duplicates), `certs.js` (newest first, badge PNGs in
  `public/images/`), `socials.js`. Edit these, not the JSX.
  [data.test.js](portfolio/src/data/data.test.js) checks ordering, duplicates and
  that badge files exist.
- Styling is Tailwind utility classes inline. Dark palette: `#0a0d14`, `#1a1f2c`,
  `#2a2f3c`; accent `blue-400` (`#60a5fa`).
- Sections follow `<section id="..." className="pt-4 min-h-screen scroll-mt-16">`.
  The `id` is the nav anchor; keep the nav `links` array in page order.
- **No inline scripts or styles.** The CSP in `customHttp.yml` is
  `script-src 'self'; style-src 'self'`. Don't add `<script>` blocks, `<style>`
  tags or `style="..."` attributes to `index.html`. Prefer Tailwind classes over
  React `style` props.
- Icon-only links need an `aria-label`; decorative icons get `aria-hidden="true"`.

## Editing personal content

| Want to change… | Edit… |
|---|---|
| Bio / intro headline | [IntroSection.jsx](portfolio/src/components/IntroSection.jsx) |
| Location text + embedded map | [HireMeSection.jsx](portfolio/src/components/HireMeSection.jsx) |
| "Professional Summary" blurb | [ConnectionSection.jsx](portfolio/src/components/ConnectionSection.jsx) |
| Projects / skills / certs / socials | [data/](portfolio/src/data/) |
| Page title, description, Open Graph tags | [index.html](portfolio/index.html) |
| Icons | `portfolio/public/` (favicon.svg, favicon-32x32, apple-touch-icon, icon-192/512, icon-maskable-512, og-image) |
| Contact form endpoint | [src/config.js](portfolio/src/config.js) or `VITE_CONTACT_ENDPOINT` |

## Contact form

The Contact section POSTs JSON `{name, email, message, website}` to
`CONTACT_ENDPOINT` from [src/config.js](portfolio/src/config.js):
`import.meta.env.VITE_CONTACT_ENDPOINT` if set at build time, otherwise the
committed live Lambda Function URL. `website` is a hidden honeypot and must be
empty. The form checks `response.ok` before parsing; 429 shows a "too many
messages today" message, anything else (including non-JSON) shows a generic
error with the email address. If the endpoint host changes, update the CSP
`connect-src` in `customHttp.yml` (tested in
[customHttp.test.js](portfolio/src/customHttp.test.js)).

## Deployment

Amplify builds from GitHub `main` using [amplify.yml](amplify.yml): `cd portfolio`,
`npm ci`, `npm run build`, artifacts from `portfolio/build`. Response headers
come from [customHttp.yml](customHttp.yml).

## Working style

- Low-risk personal site, but **live in production**. Run `npm test` and
  `npm run build` before considering a change done.
- Keep content edits surgical and data-driven. Don't restructure components
  unless asked.
- When the user reports their role/location has changed, update **all three**
  places: intro bio, professional summary, and the map/location text.

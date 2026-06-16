# CLAUDE.md

Guidance for Claude Code (and other AI assistants) working in this repository.

## What this is

A personal portfolio website for **Asher Shores**, deployed at
[ashershores.com](https://ashershores.com). Single-page React app with a dark
theme, sectioned layout (Intro → Skills → Certifications → Projects → Connect →
Hire Me) and a serverless contact form.

## Critical layout note

The repository root is **not** the app root. The actual application lives in the
nested [portfolio/](portfolio/) directory.

```
portfolio-web-app/        <- repo root (this file lives here)
├── README.md             <- project README
├── CLAUDE.md             <- this file
├── spec.md               <- product/technical spec
└── portfolio/            <- the React app — run all npm commands FROM HERE
    ├── package.json
    ├── public/
    └── src/
```

**Always `cd portfolio` before running `npm` commands.** Running them from the
repo root will fail (there is no `package.json` there).

## Tech stack

- **Create React App** (`react-scripts` 5.0.1) — *not* Vite. Ignore any
  references to Vite, `npm run dev`, or `VITE_*` env vars you may find in older
  docs; those are inaccurate.
- **React 18.3**
- **TailwindCSS 3.4** (config in [portfolio/tailwind.config.js](portfolio/tailwind.config.js), PostCSS in [portfolio/postcss.config.js](portfolio/postcss.config.js))
- **lucide-react** for icons. (`@heroicons/react` is listed as a dependency but
  is currently unused.)
- **AWS Amplify** for hosting/CI; **Lambda Function URL** backs the contact form.

## Commands

Run from [portfolio/](portfolio/):

```bash
npm install        # install dependencies
npm start          # dev server at http://localhost:3000
npm run build      # production build -> portfolio/build/
npm test           # CRA/Jest test runner (watch mode)
```

There is **no** `npm run dev` or `npm run lint` script. Linting happens
in-process via the `react-app` ESLint config during `npm start`/`npm run build`.

## Code conventions

- Components live in [portfolio/src/components/](portfolio/src/components/), one
  per section, exported as **named** exports (e.g. `export const IntroSection`).
  Note [CertificationsSection.js](portfolio/src/components/CertificationsSection.js)
  also has a default export — prefer named exports for consistency.
- All display content is **data-driven** from [portfolio/src/data/](portfolio/src/data/):
  - `projects.js` — project cards
  - `skills.js` — skill categories (object keyed by category name)
  - `certs.js` — certification cards
  - `socials.js` — social/contact links
  - To add or change portfolio content, edit these files — not the JSX.
- Styling is Tailwind utility classes inline. The dark palette uses hard-coded
  hex backgrounds (`#0a0d14`, `#1a1f2c`, `#2a2f3c`). Reuse these for consistency.
- Section components follow the pattern: `<section id="..."><div className="max-w-6xl mx-auto ...">`.
  The `id` is what the nav anchors scroll to.

## Editing personal content

Common requests and where they map:

| Want to change… | Edit… |
|---|---|
| Bio / intro headline | [IntroSection.js](portfolio/src/components/IntroSection.js) |
| Location text + embedded map | [HireMeSection.js](portfolio/src/components/HireMeSection.js) |
| "Professional Summary" blurb | [ConnectionSection.js](portfolio/src/components/ConnectionSection.js) |
| Projects shown | [data/projects.js](portfolio/src/data/projects.js) |
| Skills | [data/skills.js](portfolio/src/data/skills.js) |
| Certifications | [data/certs.js](portfolio/src/data/certs.js) |
| Social links | [data/socials.js](portfolio/src/data/socials.js) |
| Contact form endpoint | Lambda URL is hard-coded in [HireMeSection.js](portfolio/src/components/HireMeSection.js) |

## Contact form

The "Hire Me" form POSTs JSON `{name, email, message}` to a hard-coded AWS Lambda
Function URL (`*.lambda-url.us-west-1.on.aws`). There is no `.env` in use today;
the URL is committed in the component. If you move it to an env var, remember CRA
only exposes vars prefixed with `REACT_APP_` (e.g. `REACT_APP_CONTACT_ENDPOINT`).

## Deployment

Hosted on AWS Amplify, auto-building from the GitHub `main` branch. Because the
app is in the `portfolio/` subdirectory, the Amplify build spec must `cd portfolio`
in preBuild and point `baseDirectory` at `portfolio/build`. See the README for
the correct `amplify.yml`.

## Known rough edges

See [spec.md](spec.md) for the full backlog. As of 2026-06-16 the known bugs and
easy wins are resolved (test passes, build compiles). Remaining items are
enhancements: the contact endpoint is still hard-coded (no env var), the
`videoUrl` field on projects is unused, the favicon/logos are still CRA defaults,
and there's no real light/dark toggle despite the "dark mode" framing.

## Working style

- This is a low-risk personal site, but it is **live in production**. Verify
  builds (`npm run build`) before considering a change done.
- Keep content edits surgical and data-driven. Don't restructure components
  unless asked.
- When the user reports their role/location has changed, update **all three**
  places: intro bio, professional summary, and the map/location text.

# Asher Shores — Portfolio Website

A responsive personal portfolio site built with React and TailwindCSS, hosted on
AWS Amplify. Live at **[www.ashershores.com](https://www.ashershores.com)**.

![Portfolio screenshot](https://github.com/user-attachments/assets/09b5835d-5af3-48f8-af9c-9e02ba659a7a)

## Features

- Single-page, scroll-based layout: About → Skills → Certifications → Projects → Connect → Contact
- Responsive design with a mobile hamburger menu
- Dark theme
- Data-driven content (projects, skills, certifications, socials)
- Certification badges linking to Credly
- Serverless contact form (AWS Lambda Function URL) with a honeypot field
- Strict security headers and CSP via Amplify custom headers
- Embedded location map

## Tech Stack

- **React 18** built with **Vite**, tested with **Vitest** + Testing Library
- **TailwindCSS 3**
- **lucide-react** (icons)
- **AWS Amplify** (hosting + CI/CD), **Lambda** (contact form), **Route 53** (DNS)

## Repository layout

> **Note:** the React app lives in the nested [`portfolio/`](portfolio/)
> directory, not the repo root. Run web `npm` commands from there.

```
portfolio-web-app/
├── README.md            # this file
├── CLAUDE.md            # guidance for AI assistants
├── spec.md              # product/technical spec + backlog
├── amplify.yml          # Amplify build spec
├── customHttp.yml       # Amplify response headers (CSP, HSTS, ...)
├── infra/               # contact-form backend (CDK)
└── portfolio/           # the React app
    ├── index.html       # Vite entry HTML (title, meta, icons)
    ├── vite.config.js   # Vite + Vitest config
    ├── public/          # static assets (icons, og-image, badge images)
    └── src/
        ├── config.js     # contact endpoint
        ├── components/   # one component per section
        └── data/         # projects, skills, certifications, socials
```

## Local development

```bash
cd portfolio
npm ci            # install dependencies
npm run dev       # dev server at http://localhost:5173
npm test          # run tests once (Vitest)
npm run build     # production build -> portfolio/build/
npm run preview   # serve the production build locally
```

## Editing content

Content is data-driven. To update what's shown on the site, edit the files in
[portfolio/src/data/](portfolio/src/data/):

| To change… | Edit |
|---|---|
| Projects | [`data/projects.js`](portfolio/src/data/projects.js) |
| Skills | [`data/skills.js`](portfolio/src/data/skills.js) |
| Certifications | [`data/certs.js`](portfolio/src/data/certs.js) |
| Social links | [`data/socials.js`](portfolio/src/data/socials.js) |
| Bio / headline | [`components/IntroSection.jsx`](portfolio/src/components/IntroSection.jsx) |
| Location + map | [`components/HireMeSection.jsx`](portfolio/src/components/HireMeSection.jsx) |
| Title / meta / Open Graph | [`index.html`](portfolio/index.html) |

## Contact form

The contact form POSTs `{ name, email, message, website }` to an AWS Lambda
Function URL (`website` is a hidden honeypot and should be empty). The endpoint
is read from [`src/config.js`](portfolio/src/config.js): it uses the build-time
env var `VITE_CONTACT_ENDPOINT` if set, otherwise the committed live URL.

```
# portfolio/.env.local (or an Amplify environment variable)
VITE_CONTACT_ENDPOINT=https://<your-lambda-url>
```

If the endpoint host changes, also update `connect-src` in
[`customHttp.yml`](customHttp.yml).

## Deployment (AWS Amplify)

The site auto-deploys from the `main` branch. Because the app lives in the
`portfolio/` subdirectory, the build spec ([`amplify.yml`](amplify.yml)) builds from there:

```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - cd portfolio
        - npm ci
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: portfolio/build
    files:
      - "**/*"
  cache:
    paths:
      - portfolio/node_modules/**/*
```

Response headers (CSP, HSTS, nosniff, Referrer-Policy, Permissions-Policy,
COOP, frame denial) come from [`customHttp.yml`](customHttp.yml).

### Custom domain

The domain is managed in Route 53 and connected through the Amplify console
(custom domain + managed SSL certificate). Side projects are served from
subdomains of `ashershores.com`.

## Contact backend

The contact form's Lambda, rate limits and SES sender are a CDK app in
[`infra/`](infra/) (`npm ci && npm test && npx cdk synth` from there). It
deploys through GitHub Actions after a manual approval. See
[docs/first-deploy.md](docs/first-deploy.md).

## Project status

Privately maintained personal project; not open for external contributions. See
[spec.md](spec.md) for the current backlog of bugs, improvements, and planned work.

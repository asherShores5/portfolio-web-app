# Asher Shores — Portfolio Website

A responsive personal portfolio site built with React and TailwindCSS, hosted on
AWS Amplify. Live at **[ashershores.com](https://ashershores.com)**.

![Portfolio screenshot](https://github.com/user-attachments/assets/09b5835d-5af3-48f8-af9c-9e02ba659a7a)

## Features

- Single-page, scroll-based layout: About → Skills → Certifications → Projects → Connect → Contact
- Responsive design with a mobile hamburger menu
- Dark theme
- Data-driven content (projects, skills, certifications, socials)
- Certification badges linking to Credly
- Serverless contact form (AWS Lambda Function URL)
- Embedded location map

## Tech Stack

- **React 18** via Create React App (`react-scripts`)
- **TailwindCSS 3**
- **lucide-react** (icons)
- **AWS Amplify** (hosting + CI/CD), **Lambda** (contact form), **Route 53** (DNS)

## Repository layout

> **Note:** the React app lives in the nested [`portfolio/`](portfolio/)
> directory, not the repo root. Run all `npm` commands from there.

```
portfolio-web-app/
├── README.md            # this file
├── CLAUDE.md            # guidance for AI assistants
├── spec.md             # product/technical spec + backlog
└── portfolio/           # the React app
    ├── public/          # static assets, index.html, manifest
    └── src/
        ├── components/   # one component per section
        └── data/         # projects, skills, certs, socials
```

## Local development

```bash
cd portfolio
npm install      # install dependencies
npm start        # dev server at http://localhost:3000
npm run build    # production build -> portfolio/build/
npm test         # test runner (Jest, watch mode)
```

There is no `npm run dev` or `npm run lint` — this is a Create React App project.
Linting runs automatically during `start`/`build` via the `react-app` ESLint config.

## Editing content

Content is data-driven. To update what's shown on the site, edit the files in
[portfolio/src/data/](portfolio/src/data/):

| To change… | Edit |
|---|---|
| Projects | [`data/projects.js`](portfolio/src/data/projects.js) |
| Skills | [`data/skills.js`](portfolio/src/data/skills.js) |
| Certifications | [`data/certs.js`](portfolio/src/data/certs.js) |
| Social links | [`data/socials.js`](portfolio/src/data/socials.js) |
| Bio / headline | [`components/IntroSection.js`](portfolio/src/components/IntroSection.js) |
| Location + map | [`components/HireMeSection.js`](portfolio/src/components/HireMeSection.js) |

## Contact form

The contact form POSTs `{ name, email, message }` to an AWS Lambda Function URL.
The endpoint is currently hard-coded in
[`HireMeSection.js`](portfolio/src/components/HireMeSection.js). To externalize it,
use a `REACT_APP_`-prefixed env var (CRA only exposes those to the client):

```
# portfolio/.env
REACT_APP_CONTACT_ENDPOINT=https://<your-lambda-url>
```

## Deployment (AWS Amplify)

The site auto-deploys from the `main` branch. Because the app lives in the
`portfolio/` subdirectory, the Amplify build spec must build from there:

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

### Custom domain

The domain is managed in Route 53 and connected through the Amplify console
(custom domain + managed SSL certificate). Side projects are served from
subdomains of `ashershores.com`.

## Project status

Privately maintained personal project; not open for external contributions. See
[spec.md](spec.md) for the current backlog of bugs, improvements, and planned work.

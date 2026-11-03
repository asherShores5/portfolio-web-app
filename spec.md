# Portfolio Website — Specification

**Owner:** Asher Shores
**Live site:** [ashershores.com](https://ashershores.com)
**Last reviewed:** 2026-11-03

---

## 1. Purpose

A single-page personal portfolio that presents Asher Shores' professional
background, skills, certifications, and project work, and provides a way for
visitors to make contact. It doubles as a demonstration of front-end and AWS
cloud skills.

## 2. Audience

- Recruiters and hiring managers
- Professional peers and collaborators
- Anyone following Asher's open-source / side projects

## 3. Tech & architecture

| Layer | Choice |
|---|---|
| Framework | React 18.3 via Create React App (`react-scripts` 5.0.1) |
| Styling | TailwindCSS 3.4 (utility-first, inline classes) |
| Icons | lucide-react |
| Hosting / CI | AWS Amplify (auto-deploy from GitHub `main`) |
| Contact backend | AWS Lambda Function URL (`us-west-1`) |
| Domain / DNS | Route 53 → Amplify; subdomains for side projects |

The app is a flat, scroll-based SPA. Navigation anchors scroll to section `id`s;
there is no client-side router. All display content is sourced from plain JS data
modules in `src/data/`, keeping content edits separate from presentation.

### Component map

| Section | Component | Data source |
|---|---|---|
| Top nav | `Navigation.js` | inline `links` array |
| Hero / bio | `IntroSection.js` | inline |
| Skills | `SkillsSection.js` | `data/skills.js` |
| Certifications | `CertificationsSection.js` | `data/certs.js` |
| Projects | `ProjectsSection.js` | `data/projects.js` |
| Connect | `ConnectionSection.js` | `data/socials.js` |
| Hire Me / contact | `HireMeSection.js` | inline (Lambda URL) |

## 4. Functional requirements

1. **Responsive layout** — usable on mobile and desktop; nav collapses to a
   hamburger menu under the `md` breakpoint.
2. **Smooth-scroll navigation** — nav links scroll to their target section.
3. **Data-driven content** — projects, skills, certs, and socials render from
   `src/data/` arrays/objects.
4. **Certification badges** — each cert shows a badge image and links to its
   Credly public URL.
5. **Project cards** — each shows title, description, tech tags, and optional
   live-demo / GitHub links.
6. **Contact form** — collects name, email, message; POSTs to the Lambda URL;
   shows success/error status and a sending state.
7. **Location map** — embedded Google Map showing Asher's metro area.

## 5. Non-functional requirements

- Fast first load (static build on CDN via Amplify/CloudFront).
- Accessible: semantic sections, alt text on images, keyboard-reachable links.
- SEO-friendly meta tags and a descriptive title.

---

## 6. Current state vs. spec — gaps & backlog

Severity: 🔴 bug / 🟠 should-fix / 🟢 easy win / 🔵 enhancement.

### ✅ Completed (2026-06-16)

Content updates:
- ✅ **Bio updated for new role** → Cloud Support Engineer at AWS (Amazon
  Dedicated Cloud), Seattle, keeping the DevOps/cloud framing.
  [IntroSection.js](portfolio/src/components/IntroSection.js)
- ✅ **Base of operations Phoenix → Seattle** — heading and the embedded map
  (now a key-free `maps.google.com/maps?q=Seattle,WA` embed).
  [HireMeSection.js](portfolio/src/components/HireMeSection.js)
- ✅ **Professional summary reframed** to the AWS role; hiring/freelance language
  softened to "happy to connect."
  [ConnectionSection.js](portfolio/src/components/ConnectionSection.js)
- ✅ **"Hire Me" retitled** "Let's Work Together!" → "Get in Touch."
  [HireMeSection.js](portfolio/src/components/HireMeSection.js)

Bugs:
- ✅ **CRA test fixed** — [App.test.js](portfolio/src/App.test.js) now asserts the
  "I'm Asher Shores" heading; `npm test` passes.
- ✅ **ExamPrepLab URL fixed** — added `https://` scheme in
  [data/projects.js](portfolio/src/data/projects.js).
- ✅ **Desktop nav smooth-scroll** — `scrollToSection` now wired to desktop links,
  with a fixed-header offset so targets aren't hidden behind the nav.
  [Navigation.js](portfolio/src/components/Navigation.js)
- ✅ **`scrollToSection` null-guarded** — returns early if the target is missing.

Easy wins:
- ✅ **Removed literal `\t` tabs** from nav labels; mobile menu now uses a proper
  stacked flex layout. [Navigation.js](portfolio/src/components/Navigation.js)
- ✅ **Placeholder metadata replaced** in
  [public/index.html](portfolio/public/index.html) (meta description) and
  [public/manifest.json](portfolio/public/manifest.json) (app name).
- ✅ **Stale Twitter link removed** from
  [data/socials.js](portfolio/src/data/socials.js) and the dead commented block
  in [ConnectionSection.js](portfolio/src/components/ConnectionSection.js).
- ✅ **Removed unused `@heroicons/react`** dependency.
- ✅ **Deleted CRA leftovers** `src/App.css` and `src/logo.svg`.

> Verified: `npm test` passes (1/1) and `npm run build` compiles successfully.

### Remaining

- 🟢 **Missing site favicon/branding.** Still using CRA default `favicon.ico` /
  `logo192.png` / `logo512.png`. Replace with personal branding. (Requires
  designed image assets — left for a content pass.)

### Enhancements (planned for later)

- 🔵 **Move the Lambda endpoint to an env var.** The contact URL is hard-coded in
  [HireMeSection.js](portfolio/src/components/HireMeSection.js). Move to
  `process.env.REACT_APP_CONTACT_ENDPOINT` (CRA only exposes `REACT_APP_*`).
- 🔵 **Contact form validation & spam protection.** Add client-side validation
  beyond `required`, and consider a honeypot or captcha on the Lambda.
- 🔵 **Surface `videoUrl`.** Every project carries a `videoUrl: null` field that
  nothing renders. Either wire up demo videos or drop the field.
- 🔵 **Project image/thumbnails.** Cards are text-only; thumbnails would improve
  visual appeal.
- 🔵 **Light/dark toggle.** README claims "dark mode" but the site is
  dark-only. Either add a real toggle or correct the claim.
- 🔵 **Accessibility pass.** Add `aria-label`s to icon-only links, verify focus
  states, and check color contrast on `text-gray-400` over dark backgrounds.
- 🔵 **Dependency / framework refresh.** CRA is effectively unmaintained.
  A future migration to Vite would modernize the toolchain (and finally make the
  old README's `npm run dev` accurate).

---

## 7. Out of scope

- Blog / CMS
- Authentication or user accounts
- Server-side rendering
- Public open-source contributions (the repo is a personal showcase)

---

## 8. 2026-11 refresh (decided 2026-11-03)

Goal: bring content up to date, fix bugs, harden security. Bio wording unchanged.

### Content
- **Projects**, newest first: NutriSage (nutrisage.ashershores.com, repo NutriSage, Bedrock),
  HoneyDo, Games Catalog, App Connector (all with Live links; HoneyDo/Games Catalog
  show a sign-in page to visitors), Exam Prep Lab, Sprouts, Artsy, PrettyPress, OCR Wombat,
  AsherShores.com, Jokes PHP App (GitHub link only; its live API now needs a key).
  Drop the unused `videoUrl` field.
- **Certifications**, newest first: add SA Professional, ML Engineer Associate,
  AI Business Strategist; refresh Credly links that redirect.
- **Skills**: add TypeScript, AWS CDK, Lambda, DynamoDB, AppSync/GraphQL, Bedrock,
  GitHub Actions, Playwright, Vite; drop Angular, WebAssembly, Atlassian Suite,
  Microsoft Office; no duplicates across categories.
- **Branding**: "AS" monogram favicon/app icons, title "Asher Shores | Cloud & Software
  Engineer", Open Graph tags.

### Fixes
- Accessibility: aria-labels on icon-only links and the menu button (`aria-expanded`),
  form labels tied to inputs, `aria-live` status, descriptive profile alt text.
- Nav order matches page order; sections use a scroll margin so headings clear the fixed nav.
- Contact form: honeypot field; friendly message on any non-OK or non-JSON response.

### Toolchain
- Create React App -> Vite + Vitest (JavaScript kept, Tailwind 3 kept). Amplify build
  spec updated. Contact endpoint comes from `VITE_CONTACT_ENDPOINT` (build-time) with the
  live URL as the committed default in `src/config.js`.

### Contact backend (`infra/`, CDK TypeScript, us-west-1, stack `PortfolioContact`)
- New Lambda (Node 22) + Function URL, auth NONE, CORS POST only from
  https://www.ashershores.com (and https://ashershores.com).
- Validation: name 1-100, email <= 254 + format, message 1-5000, honeypot empty; 400 on
  bad/malformed input (parse inside try). 10s timeout, 30-day log retention,
  reserved concurrency 2.
- Rate limits via DynamoDB counters with TTL: 3 per IP per day, 50 total per day; 429 when over.
- SES domain identity ashershores.com with DKIM records in Route 53 + DMARC record.
  Sender noreply@ashershores.com, Reply-To = visitor email (validated; no CR/LF),
  delivered to asher.shores5@gmail.com. IAM limited to that identity.
- Cutover: site points at the new URL; old hand-made `send-portfolio-contact` is backed up,
  then deleted only after Asher confirms a test message arrived.

### Security / CI
- `customHttp.yml`: CSP (self, contact URL, Google Maps frames), HSTS, nosniff,
  Referrer-Policy, Permissions-Policy, COOP, frame-ancestors none.
- GitHub: main protected (PR, required checks, no force-push/delete); Actions pinned to SHAs;
  CI runs web + infra tests on PRs; backend deploys from main via OIDC role
  `portfolio-github-deploy` trusting only the `production` environment (Asher approves).
  Dependabot monthly, grouped. Amplify still builds the site from main.

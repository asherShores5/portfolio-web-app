# Portfolio Website — Specification

**Owner:** Asher Shores
**Live site:** [ashershores.com](https://ashershores.com)
**Last reviewed:** 2026-06-16

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

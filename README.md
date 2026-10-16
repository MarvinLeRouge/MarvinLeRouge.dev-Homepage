[🇫🇷 Version française](README.fr.md) | 🇬🇧 English version

---

# 🌐 MarvinLeRouge.dev-Website

> _Source of [marvinlerouge.dev](https://marvinlerouge.dev): personal site of a backend developer / data engineer, with bilingual project sheets offering a recruiter view and a technical view. Static site built with Astro._

[![CI](https://github.com/MarvinLeRouge/MarvinLeRouge.dev-Website/actions/workflows/ci.yml/badge.svg)](https://github.com/MarvinLeRouge/MarvinLeRouge.dev-Website/actions/workflows/ci.yml)
[![Coverage](https://img.shields.io/codecov/c/github/MarvinLeRouge/MarvinLeRouge.dev-Website/main?flag=frontend&label=coverage&logo=codecov)](https://app.codecov.io/gh/MarvinLeRouge/MarvinLeRouge.dev-Website)
[![Astro](https://img.shields.io/badge/Astro-7-BC52EE?logo=astro&logoColor=white)](https://astro.build)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![License](https://img.shields.io/github/license/MarvinLeRouge/MarvinLeRouge.dev-Website?cacheSeconds=3600)](LICENSE)

---

## About

The site complements the GitHub profile: GitHub shows the code, the site explains the reasoning behind it (design decisions, difficulties, case studies).

- Fully static output: plain HTML and CSS, no client-side JavaScript beyond small progressive enhancements.
- No audience measurement.
- Accessibility is a design constraint, not an afterthought.

---

## Tech stack

| Layer      | Technology                                                                                                      |
| ---------- | --------------------------------------------------------------------------------------------------------------- |
| Generator  | ![Astro](https://img.shields.io/badge/Astro-BC52EE?logo=astro&logoColor=white&style=flat-square)                |
| Language   | ![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white&style=flat-square) |
| Linting    | ![ESLint](https://img.shields.io/badge/ESLint-4B32C3?logo=eslint&logoColor=white&style=flat-square)             |
| Formatting | ![Prettier](https://img.shields.io/badge/Prettier-F7B93E?logo=prettier&logoColor=black&style=flat-square)       |
| Tests      | Vitest, Playwright, axe-core, lychee                                                                            |
| Git hooks  | Husky, lint-staged, gitleaks, git-cliff                                                                         |

---

## Development

Requires Node.js 24 (see `.nvmrc`) and gitleaks (see [CONTRIBUTING.md](CONTRIBUTING.md)).

```bash
npm install          # dependencies and git hooks
npm run dev          # local dev server with hot reload
npm run build        # static build into dist/
npm run preview      # serve the built site locally
npm run check        # Astro and TypeScript diagnostics
npm run lint         # ESLint
npm run format:check # Prettier
npm test             # unit tests (Vitest)
npm run test:cov     # unit tests with the coverage gate
npm run test:e2e     # end-to-end and accessibility tests on the built site
```

---

## Project structure

```
src/
  layouts/   page layouts (document head, shared structure)
  pages/     one file per route
  styles/    global stylesheets
tests/
  e2e/       Playwright and axe tests on the built site
docs/        roadmap and translated community files
scripts/     git hook helpers
```

---

## Roadmap

See [docs/roadmap.md](docs/roadmap.md).

---

## License

The source code is released under the [MIT License](LICENSE). The site content (texts, project sheets, case studies, screenshots and images) is not covered by it: all rights reserved.

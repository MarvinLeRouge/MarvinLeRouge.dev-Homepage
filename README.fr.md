🇫🇷 Version française | [🇬🇧 English version](README.md)

---

# 🌐 MarvinLeRouge.dev-Website

> _Sources de [marvinlerouge.dev](https://marvinlerouge.dev) : site personnel d'un développeur backend / data engineer, avec des fiches projet bilingues proposant une vue recruteur et une vue technique. Site statique construit avec Astro._

[![Astro](https://img.shields.io/badge/Astro-7-BC52EE?logo=astro&logoColor=white)](https://astro.build)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![License](https://img.shields.io/github/license/MarvinLeRouge/MarvinLeRouge.dev-Website?cacheSeconds=3600)](LICENSE)

---

## À propos

Le site complète le profil GitHub : GitHub montre le code, le site explique la réflexion derrière (décisions de conception, difficultés, études de cas).

- Sortie entièrement statique : HTML et CSS, sans JavaScript côté client hormis de petites améliorations progressives.
- Aucune mesure d'audience.
- L'accessibilité est une contrainte de conception, pas un ajout après coup.

---

## Stack technique

| Couche     | Technologie                                                                                                     |
| ---------- | --------------------------------------------------------------------------------------------------------------- |
| Générateur | ![Astro](https://img.shields.io/badge/Astro-BC52EE?logo=astro&logoColor=white&style=flat-square)                |
| Langage    | ![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white&style=flat-square) |
| Lint       | ![ESLint](https://img.shields.io/badge/ESLint-4B32C3?logo=eslint&logoColor=white&style=flat-square)             |
| Formatage  | ![Prettier](https://img.shields.io/badge/Prettier-F7B93E?logo=prettier&logoColor=black&style=flat-square)       |
| Hooks git  | Husky, lint-staged, gitleaks, git-cliff                                                                         |

---

## Développement

Nécessite Node.js 24 (voir `.nvmrc`) et gitleaks (voir [CONTRIBUTING.fr.md](docs/i18n/fr/CONTRIBUTING.fr.md)).

```bash
npm install          # dépendances et hooks git
npm run dev          # serveur de développement local avec rechargement à chaud
npm run build        # build statique dans dist/
npm run preview      # sert localement le site construit
npm run check        # diagnostics Astro et TypeScript
npm run lint         # ESLint
npm run format:check # Prettier
```

---

## Structure du projet

```
src/
  layouts/   gabarits de page (en-tête du document, structure commune)
  pages/     un fichier par route
  styles/    feuilles de style globales
docs/        feuille de route et fichiers communautaires traduits
scripts/     utilitaires des hooks git
```

---

## Feuille de route

Voir [docs/roadmap.fr.md](docs/roadmap.fr.md).

---

## Licence

Le code source est publié sous [licence MIT](LICENSE). Le contenu du site (textes, fiches projet, études de cas, captures et images) n'est pas couvert par cette licence : tous droits réservés.

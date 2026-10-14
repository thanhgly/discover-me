# discover-me

This repository houses the code for "Discover Me," an AI-powered chatbox portfolio. It allows visitors to engage in a natural conversation and explore the work experience, skills, and projects of a software engineer. Connect with the virtual assistant and uncover the world of coding and tech accomplishments. Let's chat and discover together! 💻🤖

## Getting started

Requires Node 18 (see `.nvmrc`).

```sh
npm install
cp data/info.example.ts data/info.ts   # then fill in your details (gitignored)
npm run dev
```

## Scripts

| Script                  | Purpose                         |
| ----------------------- | ------------------------------- |
| `npm run dev`           | Start the Vite dev server       |
| `npm run build`         | Type-check and build to `dist/` |
| `npm run lint`          | ESLint (fails on warnings)      |
| `npm run typecheck`     | `tsc --noEmit`                  |
| `npm run format`        | Format with Prettier            |
| `npm test`              | Vitest in watch mode            |
| `npm run test:ci`       | Single Vitest run               |
| `npm run test:coverage` | Single run with coverage        |

CI (`.github/workflows/ci.yml`) runs format check, lint, build and tests. A husky pre-commit hook runs lint-staged. `netlify.toml` configures deployment with an SPA fallback for client-side routes.

## Stack

React 18, TypeScript, Vite, Tailwind CSS, react-router-dom, tsparticles, Vitest.

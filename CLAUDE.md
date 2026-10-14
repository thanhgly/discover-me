# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Keep replies extremely concise and focus on conveying the key information. No unnecessary fluff, no long code snippets.

## Overview

"Discover Me" is an AI-powered chatbox portfolio: visitors chat with a virtual assistant to explore a software engineer's experience, skills, and projects. Stack: React 18 + TypeScript, Vite, Tailwind CSS, react-router-dom v6, tsparticles (background), Vitest + Testing Library.

## Commands

- `npm run dev` — Vite dev server
- `npm run build` — `tsc` type-check, then `vite build` (output to `dist/`)
- `npm run lint` — ESLint, fails on any warning
- `npm run test:ci` — single non-watch run (use in CI); `npm run test:coverage` adds coverage; `npm run format` / `format:check` run Prettier; `npm run typecheck` runs `tsc --noEmit`
- `npm test` — Vitest (watch mode); single file: `npx vitest run src/__tests__/app.test.tsx`; by name: `npx vitest run -t "<name>"`

## Architecture

- Vite `root` is `src/` (entry `src/index.html` → `src/index.tsx`), so build output goes to `../dist` and paths in `vite.config.ts` are relative to `src/`.
- `src/components/App.tsx` renders `<Particle />` (global background) outside the `BrowserRouter`, then `Nav` and routes: `/` → `Home`, `/contact` → `Contact`. `ChatBox` and `ContactForm` are sub-components used by those pages.
- Personal content (name, title, bio, links, emails, phones, CV) is not hardcoded: `Home.tsx` and `Contact.tsx` import it from `data/info.ts` at the repo root.
- **`data/info.ts` is gitignored.** On a fresh clone, create it by copying `data/info.example.ts` (`cp data/info.example.ts data/info.ts`), otherwise dev/build/tests fail on the missing import.
- Tests: `vitest.config.ts` extends the Vite config, uses jsdom for `*.test.tsx`, setup in `test/setup.ts`, and a custom `render` helper in `test/utilities.ts` (imported by tests as `../../test/utilities`; `test` is also aliased to `./test`).
- Prettier uses `prettier-plugin-tailwindcss` (Tailwind class ordering).
- CI (`.github/workflows/ci.yml`) copies `data/info.example.ts` to `data/info.ts` before building. A husky pre-commit hook runs lint-staged (eslint + prettier). `netlify.toml` provides the SPA fallback needed for `/contact`.

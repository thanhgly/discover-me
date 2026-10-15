# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Keep replies extremely concise and focus on conveying the key information. No unnecessary fluff, no long code snippets.

## Overview

"Discover Me" is a reusable AI-powered portfolio template: visitors chat with a virtual assistant about the site owner. Anyone can fork it and supply their own `profile/` data and `ANTHROPIC_API_KEY`. Stack: React 19 + TypeScript, Vite 8, Tailwind CSS 4 (via `@tailwindcss/vite`, theme in `src/style.css`), react-router-dom v7, Vitest + Testing Library.

## Commands

- `npm run dev` — Vite dev server (UI only); `npm run dev:netlify` — Netlify CLI dev server with the chat function
- `npm run build` — `tsc` type-check, then `vite build` (output to `dist/`)
- `npm run lint` — ESLint, fails on any warning
- `npm run test:ci` — single non-watch run (use in CI); `npm run test:coverage` adds coverage; `npm run format` / `format:check` run Prettier; `npm run typecheck` runs `tsc --noEmit`
- `npm test` — Vitest (watch mode); single file: `npx vitest run src/__tests__/app.test.tsx`; by name: `npx vitest run -t "<name>"`

## Architecture

- Vite `root` is `src/` (entry `src/index.html` → `src/index.tsx`), so build output goes to `../dist` and paths in `vite.config.ts` are relative to `src/`.
- `src/components/App.tsx` renders `Nav`, routes (`/` → `Home`, `/contact` → `Contact`) and `Footer`. `ChatBox` and `ContactForm` are sub-components used by those pages. `src/lib/chat.ts` (`streamReply`) POSTs the conversation to `/api/chat` and streams the plain-text reply. Chat state lives in `ChatProvider` (wraps the routes, mirrors to sessionStorage; `useChat` in `src/lib/chatState.ts`). Home's Experience/Projects/Skills sections (`Resume.tsx`) render from optional profile fields.
- Chat backend: `netlify/functions/chat.ts` (Netlify Functions v2, path `/api/chat`, Netlify rate limit) calls Claude Haiku 5.5 via `@anthropic-ai/sdk`; validation and the system prompt live in `netlify/lib/chat.ts`. Needs `ANTHROPIC_API_KEY` (Netlify env var, or `.env` with `npm run dev:netlify`). `netlify.toml` ships both profile folders with the function via `included_files`. Model defaults to `claude-haiku-5-5`, overridable with the `CLAUDE_MODEL` env var. After each reply the function logs question/reply/timestamp (no visitor data) to the Netlify Blobs store `chat-log` (`netlify/lib/chatLog.ts`; failures never break the chat).
- `seo/plugin.ts` (Vite plugin) injects title/meta/Open Graph/JSON-LD into `index.html` from the profile and emits `favicon.svg`, `og-image.png` (via `@resvg/resvg-js` + bundled Inter in `seo/fonts/`), `robots.txt`, `sitemap.xml`. Site URL: Netlify `URL` env, else profile `siteUrl`.
- **Never hardcode the owner's name or details.** All personal content lives in a profile folder with `profile.json` and `about-me.md` (the assistant's knowledge base; its `## TODO` section is stripped before reaching the model). `profile/` is the committed sample; the owner's real data is in git-ignored `profile.local/`, which wins when present. The site imports it via the `@profile` alias (resolved in `vite.config.ts`, typed by `Profile` in `src/lib/profile.ts`; components import `profile` from there); the function picks the folder at runtime in `netlify/lib/chat.ts`. Never commit `profile.local/`.
- Tests: `vitest.config.ts` extends the Vite config, uses jsdom for `*.test.tsx`, setup in `test/setup.ts`, and a custom `render` helper in `test/utilities.ts` (imported by tests as `../../test/utilities`; `test` is also aliased to `./test`).
- Prettier uses `prettier-plugin-tailwindcss` (Tailwind class ordering).
- CI is `.gitlab-ci.yml` (GitLab, the main remote) and `.github/workflows/ci.yml` (GitHub mirror). A husky pre-commit hook runs lint-staged (eslint + prettier). `netlify.toml` provides the SPA fallback needed for `/contact`.

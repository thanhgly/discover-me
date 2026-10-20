# Discover Me

[![CI](https://github.com/thanhgly/discover-me/actions/workflows/ci.yml/badge.svg)](https://github.com/thanhgly/discover-me/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

An AI-powered portfolio: visitors chat with an assistant that answers questions about your experience, skills, and projects. Fork it, drop in your own profile and Claude API key, and deploy your own copy.

**Live demo:** [discover-me-demo.netlify.app](https://discover-me-demo.netlify.app) runs the sample profile in demo mode, with preset answers and no API key. Add your own key and the same chat answers with Claude.

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/thanhgly/discover-me)

The button copies this repo to your GitHub account and deploys it. Leave the API key empty to try it in demo mode first, then follow the steps below to make it yours.

**Architecture:** a serverless (Jamstack) app. A static React + TypeScript + Tailwind site is served from Netlify's CDN, and one Netlify Function streams answers from Claude. There's no always-on server or database, so it costs nothing when nobody's chatting.

## Make it yours

1. **Copy the repo.** Click **Use this template** (or fork) on GitHub, then clone your copy.
2. **Add your details.** `profile/` holds a sample profile. Pick one:
   - **Keep your data out of git (recommended for public repos):** copy `profile/` to `profile.local/` and edit the copy. `profile.local/` is git-ignored, and the site and assistant use it automatically when it exists.
   - **Commit your data:** edit `profile/` directly.

   **Shortcut:** `npm run import-profile -- resume.pdf` drafts both `profile.local/` files from your resume, a LinkedIn "Save to PDF" export, or `.md`/`.txt` notes (pass several at once). It uses facts only from those files and lists what's missing as questions in the `## TODO` section. It needs `ANTHROPIC_API_KEY` and costs a few cents; `IMPORT_MODEL` picks the model (default `claude-opus-5-5`). Review the drafts before you publish.

   Each folder has two files:
   - `profile.json`: name, pronoun, title, bio, links, contact email, CV link, plus optional `experience`, `projects` and `skills` (home page sections that hide when empty), `openToRoles` (what you're looking for; also enables the "open to new roles?" chat starter) and `siteUrl` (used for link previews when Netlify's `URL` isn't set). These appear on the site.
   - `about-me.md`: the assistant's knowledge base. Write in the third person; the assistant answers only from this file. A `## TODO` section is never sent to the model.

3. **Get a Claude API key** at [console.anthropic.com](https://console.anthropic.com): add credits, set a monthly spending limit, and create a key.
4. **Deploy on Netlify.** Create a site at [app.netlify.com](https://app.netlify.com) (build settings come from `netlify.toml`) and add `ANTHROPIC_API_KEY` under Site configuration → Environment variables. Then:
   - If your data is in `profile.local/`, deploy from your machine so it's included: `npx netlify-cli deploy --build --prod`. (Builds triggered from GitHub won't have it and would show the sample.)
   - If you committed `profile/`, just connect the repo and Netlify deploys on every push.

**Demo mode:** until `ANTHROPIC_API_KEY` is set, the chat answers with preset replies built from `profile.json` (skills, experience, projects, contact) and says it's in demo mode. Handy for trying a fork before buying API credits.

Optional: set `CLAUDE_MODEL` (for example `claude-sonnet-5-5`) to use a different Claude model. The default is `claude-haiku-5-5`, which costs well under a cent per message.

Your API key stays in your own Netlify settings and is only used server-side; it never reaches the browser.

### Auto-deploy from GitLab

Each push to `main` gets a manual **deploy** job (`.gitlab-ci.yml`): after the checks pass, press play on it in **Build → Pipelines** to publish. It's manual so routine merges don't each use Netlify build credits. In the GitLab project, go to **Settings → CI/CD → Variables** and add these, all **Protected** (`main` is protected):

- `NETLIFY_AUTH_TOKEN`: a Netlify personal access token (**User settings → Applications**). Also mark it **Masked**.
- `NETLIFY_SITE_ID`: from Netlify **Site configuration → Site details**.
- `PROFILE_JSON` (type **File**): the contents of `profile.local/profile.json`.
- `ABOUT_ME_MD` (type **File**): the contents of `profile.local/about-me.md`.

File variables can't be masked. Set `ANTHROPIC_API_KEY` in Netlify, not GitLab. Without the profile variables the deploy job refuses to publish the sample profile unless `DEPLOY_SAMPLE_PROFILE=true`.

## Contact form

The contact page uses [Netlify Forms](https://docs.netlify.com/forms/setup/), so it only sends on a deployed site, not under `npm start`. After the first deploy, open the site in Netlify, go to **Forms**, and enable form detection if asked; then redeploy so Netlify picks up the form. To get submissions by email, go to **Site configuration → Notifications → Emails and webhooks → Form submission notifications → Add notification → Email notification** (event: _New form submission_, form: `contact`).

## Link previews and SEO

`seo/plugin.ts` (a small Vite plugin) builds the page title, description, canonical URL, Open Graph and Twitter card tags, and JSON-LD from `profile.json`, and emits `favicon.svg`, a 1200×630 `og-image.png`, `robots.txt` and `sitemap.xml`. The preview image is rendered with [`@resvg/resvg-js`](https://github.com/yisibl/resvg-js) (a prebuilt native SVG renderer, no browser needed) using the bundled Inter font in `seo/fonts/` (SIL Open Font License).

It also emits two copies of your profile for AI tools, such as the screeners recruiters use: `llms.txt` (a Markdown summary plus everything in `about-me.md` outside the TODO section, following [llmstxt.org](https://llmstxt.org)) and `resume.json` (a [JSON Resume](https://jsonresume.org) built from `profile.json`; dates like `Oct 2023 – Present` become `startDate: "2023-10"`). Only put things in `about-me.md` you're happy to publish, since `llms.txt` makes all of it readable in one place.

## Visitor questions

Off by default. To turn it on, set `LOG_QUESTIONS=true` in Netlify's environment variables and redeploy. If you do, consider telling visitors (for example in your bio or footer) that questions are saved.

When it's on, after each reply the chat function saves the question, the reply and a timestamp to a [Netlify Blobs](https://docs.netlify.com/blobs/overview/) store named `chat-log`. Nothing that identifies the visitor (IP, user agent, conversation history) is stored. Entries where the assistant said it didn't know have `"unanswered": true`: those are gaps to fill in `about-me.md`. Saving failures are logged and never affect the chat.

To read them, link your checkout to the site once (`netlify link`), then:

```sh
netlify blobs:list chat-log                       # keys are timestamps, oldest first
netlify blobs:list chat-log --prefix 2026-10      # one month
netlify blobs:get chat-log <key>                  # one entry as JSON
netlify blobs:list chat-log --json | jq -r '.blobs[].key' \
  | while read -r k; do netlify blobs:get chat-log "$k"; echo; done | jq -s 'map(select(.unanswered))'
```

Delete an entry with `netlify blobs:delete chat-log <key>`. You can also browse the store in the Netlify UI under **Blobs**.

**Quicker:** `npm run questions` prints the last 30 days in one go: totals, unanswered questions (newest first) and questions asked more than once. Add `-- --days 7` for another window, or `-- --summarize` to have Claude group the questions by theme and list the facts to add to `about-me.md` (a few cents; `SUMMARY_MODEL` picks the model, default `claude-sonnet-5-5`). It needs `NETLIFY_SITE_ID` and `NETLIFY_AUTH_TOKEN` in `.env` or your shell.

## Local development

Requires Node 20.19+ (22 recommended, see `.nvmrc`).

```sh
npm install
cp .env.example .env      # add your ANTHROPIC_API_KEY
npm run dev:netlify       # site + chat function at http://localhost:8888
```

`npm run dev` serves the site without the chat backend. `dev:netlify` uses the [Netlify CLI](https://docs.netlify.com/cli/get-started/) (`npm i -g netlify-cli`, or run `npx netlify-cli dev`).

## How the chat works

`src/components/ChatBox.tsx` posts the conversation to `/api/chat`. `netlify/functions/chat.ts` validates it, builds a system prompt from the profile (`profile.local/` if present, else `profile/`) (`netlify/lib/chat.ts`), calls Claude through `@anthropic-ai/sdk`, and streams the reply back as plain text. Conversations are capped at 20 messages of 1,000 characters each, and Netlify rate-limits each visitor to 10 requests a minute. The conversation lives in `ChatProvider` above the routes (and in `sessionStorage`), so it survives visiting the contact page or reloading the tab.

**Guardrail eval:** `npm run eval` sends prompt-injection and off-topic questions (override instructions, prompt leaks, fake system messages, coding requests, made-up facts) to your real chat prompt and grades each reply, then exits non-zero if any fail. It calls the Claude API (a few cents a run, Node 22.18+), so it isn't part of CI. Run it after editing `about-me.md` or the system prompt. Cases live in `eval/guardrails.ts`; `EVAL_GRADER_MODEL` picks the grading model (default `claude-sonnet-5-5`).

## Scripts

| Script                  | Purpose                           |
| ----------------------- | --------------------------------- |
| `npm run dev`           | Start the Vite dev server         |
| `npm run dev:netlify`   | Dev server plus the chat function |
| `npm run build`         | Type-check and build to `dist/`   |
| `npm run lint`          | ESLint (fails on warnings)        |
| `npm run typecheck`     | Type-check app, configs, function |
| `npm run format`        | Format with Prettier              |
| `npm test`              | Vitest in watch mode              |
| `npm run test:ci`       | Single Vitest run                 |
| `npm run test:coverage` | Single run with coverage          |
| `npm run eval`          | Guardrail eval (calls Claude API) |

Contributions are welcome: see [CONTRIBUTING.md](CONTRIBUTING.md). To report a security problem, see [SECURITY.md](SECURITY.md).

CI (`.gitlab-ci.yml` on GitLab, `.github/workflows/ci.yml` on GitHub) runs format check, lint, build and tests. A husky pre-commit hook runs lint-staged.

## Stack

React 19, TypeScript, Vite 8, Tailwind CSS 4, react-router-dom 7, Netlify Functions, Claude via `@anthropic-ai/sdk`, Vitest.

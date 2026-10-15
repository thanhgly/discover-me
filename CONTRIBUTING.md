# Contributing

Thanks for helping improve Discover Me. Bug reports, ideas and pull requests are all welcome.

## Before you start

- For anything bigger than a small fix, open an issue first so we can agree on the approach.
- Keep the template generic: never hardcode a person's name or details. Personal content belongs in `profile/` (the sample) or the git-ignored `profile.local/`.
- Keep it cheap to run: no always-on server or database unless there's a strong reason.

## Setup

Requires Node 20.19+ (22 recommended, see `.nvmrc`).

```sh
npm install
cp .env.example .env      # optional: add ANTHROPIC_API_KEY, or leave it empty for demo mode
npm run dev:netlify       # site + chat function at http://localhost:8888
```

## Making a change

1. Create a branch from `main`.
2. Add or update tests next to the code you change (`*.test.ts` / `*.test.tsx`).
3. Make sure these pass (CI runs the same checks):

   ```sh
   npm run format:check
   npm run lint
   npm run build
   npm run test:ci
   ```

4. If you change the system prompt or the chat request, also run `npm run eval` (needs an API key, costs a few cents) and mention the result in your pull request.
5. Open a pull request using the template, describing what changes for someone who forks the project.

## Reporting bugs

Open an issue with the steps to reproduce, what you expected, and what happened. Never paste your API key or other secrets into an issue.

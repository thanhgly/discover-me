# Security

## Reporting a vulnerability

Please don't open a public issue for security problems. Instead, use GitHub's **Report a vulnerability** button on the repository's Security tab (private vulnerability reporting), with steps to reproduce and the impact you expect.

You'll get a reply as soon as possible, and a fix will be credited to you unless you'd rather stay anonymous.

## Scope

Useful reports include ways to:

- read or misuse the site owner's `ANTHROPIC_API_KEY`
- get around the chat's message limits or rate limiting
- make the assistant reveal content that isn't in its knowledge base or the profile
- inject content into the site through profile fields

## For people running their own copy

- Keep `ANTHROPIC_API_KEY` only in Netlify's environment variables, never in git or in a `VITE_` variable.
- Set a monthly spending limit in the Anthropic console.
- Keep personal data you don't want public out of `profile/`, and use the git-ignored `profile.local/` instead.

// Shows what visitors asked the assistant (needs LOG_QUESTIONS=true on the site).
// Usage: npm run questions [-- --days 30] [--summarize]
// Reads the chat-log Netlify Blobs store with NETLIFY_AUTH_TOKEN and NETLIFY_SITE_ID.
// --summarize also asks Claude to group the questions and suggest what to add to about-me.md.
import { getStore } from "@netlify/blobs";
import Anthropic from "@anthropic-ai/sdk";
import { type ChatLogEntry, STORE_NAME } from "../netlify/lib/chatLog.ts";
import { keysSince, report, summaryPrompt } from "./questionReport.ts";

const MODEL = process.env.SUMMARY_MODEL || "claude-sonnet-5-5";
const args = process.argv.slice(2);
const daysArg = args.indexOf("--days");
const days = daysArg >= 0 ? Number(args[daysArg + 1]) : 30;
const summarize = args.includes("--summarize");

const siteID = process.env.NETLIFY_SITE_ID?.trim();
const token = process.env.NETLIFY_AUTH_TOKEN?.trim();
if (!siteID || !token || !(days > 0)) {
  console.error(`Usage: npm run questions [-- --days 30] [--summarize]
Needs NETLIFY_SITE_ID and NETLIFY_AUTH_TOKEN (in .env or the shell).`);
  process.exit(1);
}
if (summarize && !process.env.ANTHROPIC_API_KEY?.trim()) {
  console.error("--summarize needs ANTHROPIC_API_KEY.");
  process.exit(1);
}

const store = getStore({ name: STORE_NAME, siteID, token });
const { blobs } = await store.list().catch((err: Error) => {
  console.error(
    `Couldn't read the ${STORE_NAME} store (${err.message}). Check NETLIFY_SITE_ID and NETLIFY_AUTH_TOKEN.`,
  );
  process.exit(1);
});
const keys = keysSince(
  blobs.map((b) => b.key),
  days,
);
const entries = (
  await Promise.all(
    keys.map(
      (key) => store.get(key, { type: "json" }) as Promise<ChatLogEntry>,
    ),
  )
).filter(Boolean);

console.log(report(entries, days));

if (summarize && entries.length) {
  console.log(`\nSummary from ${MODEL}:\n`);
  const message = await new Anthropic().messages.create({
    model: MODEL,
    max_tokens: 4096,
    messages: [{ role: "user", content: summaryPrompt(entries) }],
  });
  console.log(
    message.content.map((b) => (b.type === "text" ? b.text : "")).join(""),
  );
}

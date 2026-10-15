// Drafts profile.local/profile.json and profile.local/about-me.md from your resume,
// a LinkedIn "Save to PDF" export, or notes. One Claude API call (a few cents).
// Usage: npm run import-profile -- resume.pdf [linkedin.pdf notes.md ...] [--force]
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import Anthropic from "@anthropic-ai/sdk";
import {
  IMPORT_PROMPT,
  IMPORT_SCHEMA,
  type ImportResult,
  sourceBlock,
  toProfileJson,
} from "./profileImport.ts";

const MODEL = process.env.IMPORT_MODEL || "claude-opus-5-5";
const args = process.argv.slice(2);
const force = args.includes("--force");
const files = args.filter((arg) => arg !== "--force");

if (!files.length) {
  console.error(
    "Usage: npm run import-profile -- resume.pdf [linkedin.pdf notes.md ...] [--force]",
  );
  process.exit(1);
}
if (!process.env.ANTHROPIC_API_KEY?.trim()) {
  console.error("Set ANTHROPIC_API_KEY (in .env or the shell) first.");
  process.exit(1);
}

const dir = resolve("profile.local");
const outputs = ["profile.json", "about-me.md"].map((f) => resolve(dir, f));
if (!force && outputs.some((f) => existsSync(f))) {
  console.error(
    "profile.local/ already has a profile. Re-run with --force to overwrite it.",
  );
  process.exit(1);
}

const content = [
  ...files.map((file) => sourceBlock(file)),
  { type: "text" as const, text: IMPORT_PROMPT },
];

console.log(`Reading ${files.join(", ")} with ${MODEL}...`);
const message = await new Anthropic().messages
  .stream({
    model: MODEL,
    max_tokens: 32000,
    output_config: { format: { type: "json_schema", schema: IMPORT_SCHEMA } },
    messages: [{ role: "user", content }],
  })
  .finalMessage();

if (message.stop_reason !== "end_turn") {
  console.error(`Claude stopped early (${message.stop_reason}). Try again.`);
  process.exit(1);
}
const output = message.content.find((b) => b.type === "text")?.text ?? "";
const result = JSON.parse(output) as ImportResult;

mkdirSync(dir, { recursive: true });
writeFileSync(
  outputs[0],
  JSON.stringify(toProfileJson(result), null, 2) + "\n",
);
writeFileSync(outputs[1], result.aboutMe.trim() + "\n");
console.log(`Wrote profile.local/profile.json and profile.local/about-me.md.
Review both, answer the TODO questions in about-me.md, and add a cvLink if you have one.`);

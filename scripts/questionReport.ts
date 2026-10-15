import type { ChatLogEntry } from "../netlify/lib/chatLog.ts";

// Turns the chat-log store into a short report for the site owner.
// Used by scripts/questions.ts (npm run questions).

const DAY = 24 * 60 * 60 * 1000;

// Keys start with the ISO timestamp, so plain string comparison filters by date.
export const keysSince = (keys: string[], days: number, now = new Date()) => {
  const since = new Date(now.getTime() - days * DAY).toISOString();
  return keys.filter((key) => key >= since).sort();
};

const normalize = (question: string) =>
  question
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, "")
    .replace(/\s+/g, " ")
    .trim();

// Questions asked more than once (ignoring case and punctuation), most asked first.
export function topQuestions(entries: ChatLogEntry[], limit = 10) {
  const counts = new Map<string, { question: string; count: number }>();
  for (const { question } of entries) {
    const key = normalize(question);
    const seen = counts.get(key);
    if (seen) seen.count++;
    else counts.set(key, { question: question.trim(), count: 1 });
  }
  return [...counts.values()]
    .filter(({ count }) => count > 1)
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

const oneLine = (text: string) => text.replace(/\s+/g, " ").trim();

export function report(entries: ChatLogEntry[], days: number): string {
  if (!entries.length) return `No questions in the last ${days} days.`;
  const unanswered = entries.filter((e) => e.unanswered);
  const top = topQuestions(entries);
  const lines = [
    `${entries.length} questions in the last ${days} days, ${unanswered.length} unanswered.`,
  ];
  if (unanswered.length) {
    lines.push("", "Unanswered (add these to about-me.md), newest first:");
    for (const e of [...unanswered].reverse()) {
      lines.push(`- ${e.timestamp.slice(0, 10)}  ${oneLine(e.question)}`);
    }
  }
  if (top.length) {
    lines.push("", "Asked more than once:");
    for (const { question, count } of top) {
      lines.push(`- ${count}x  ${oneLine(question)}`);
    }
  }
  return lines.join("\n");
}

export function summaryPrompt(entries: ChatLogEntry[]): string {
  const log = entries
    .map(
      (e) =>
        `<exchange unanswered="${e.unanswered}">\nQ: ${oneLine(e.question)}\nA: ${oneLine(e.reply)}\n</exchange>`,
    )
    .join("\n");
  return `These are questions visitors asked the AI assistant on a portfolio site, with its replies. The assistant answers only from the owner's about-me.md.

<log>
${log}
</log>

Write a short report for the site owner in plain text:
1. Themes: what visitors ask about most, with rough counts.
2. Gaps: questions the assistant couldn't answer well (including vague or hedged replies, not only ones marked unanswered), and the exact facts the owner should add to about-me.md to answer them.
3. Problems: any reply that looks wrong, off-topic, or like a misuse attempt.
Keep it under 300 words. Don't invent facts about the owner.`;
}

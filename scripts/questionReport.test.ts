import type { ChatLogEntry } from "../netlify/lib/chatLog";
import {
  keysSince,
  report,
  summaryPrompt,
  topQuestions,
} from "./questionReport";

const entry = (
  question: string,
  unanswered = false,
  timestamp = "2026-10-14T10:00:00.000Z",
): ChatLogEntry => ({ timestamp, question, reply: "A reply.", unanswered });

it("keeps only keys from the last N days, oldest first", () => {
  const keys = [
    "2026-10-14T09:00:00.000Z-bbbb",
    "2026-09-01T09:00:00.000Z-aaaa",
    "2026-10-10T09:00:00.000Z-cccc",
  ];
  expect(keysSince(keys, 7, new Date("2026-10-15T12:00:00Z"))).toEqual([
    "2026-10-10T09:00:00.000Z-cccc",
    "2026-10-14T09:00:00.000Z-bbbb",
  ]);
});

it("counts repeated questions ignoring case and punctuation", () => {
  const entries = [
    entry("What does Alex do?"),
    entry("what does alex do"),
    entry("Is Alex open to remote work?"),
    entry("What does Alex do??"),
  ];
  expect(topQuestions(entries)).toEqual([
    { question: "What does Alex do?", count: 3 },
  ]);
});

it("reports totals, unanswered questions newest first, and repeats", () => {
  const out = report(
    [
      entry("Salary?", true, "2026-10-01T10:00:00.000Z"),
      entry("Hobbies?", true, "2026-10-12T10:00:00.000Z"),
      entry("Skills?"),
      entry("skills"),
    ],
    30,
  );
  expect(out).toContain("4 questions in the last 30 days, 2 unanswered.");
  expect(out.indexOf("Hobbies?")).toBeLessThan(out.indexOf("Salary?"));
  expect(out).toContain("- 2x  Skills?");
});

it("says so when there are no questions", () => {
  expect(report([], 7)).toBe("No questions in the last 7 days.");
});

it("puts each exchange in the summary prompt", () => {
  const prompt = summaryPrompt([entry("Hobbies?\n\nAny?", true)]);
  expect(prompt).toContain(
    '<exchange unanswered="true">\nQ: Hobbies? Any?\nA: A reply.\n</exchange>',
  );
});

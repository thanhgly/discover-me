import { getStore } from "@netlify/blobs";

export const STORE_NAME = "chat-log";

export type ChatLogEntry = {
  timestamp: string;
  question: string;
  reply: string;
  /** The assistant said it didn't know: a gap to fill in about-me.md. */
  unanswered: boolean;
};

const dontKnow = [
  /\b(?:I|I'm|I am)\s+(?:don'?t|do not|doesn'?t|does not)\s+(?:know|have)\b/i,
  /\b(?:don'?t|do not|doesn'?t|does not)\s+(?:have|see|include|cover|mention)\s+(?:any\s+)?(?:information|info|details|anything)\b/i,
  /\bI'?m not sure\b/i,
  /\b(?:isn'?t|is not|aren'?t|are not|wasn'?t|not)\s+(?:covered|mentioned|included|listed)\b/i,
  /\bno (?:information|details|info)\b/i,
  /\bI can'?t (?:help with|answer|say)\b/i,
];

// Rough check for replies where the assistant admitted it didn't know the answer.
export function saidDontKnow(reply: string): boolean {
  const text = reply.replace(/[‘’]/g, "'");
  return dontKnow.some((re) => re.test(text));
}

export function logEntry(
  question: string,
  reply: string,
  now = new Date(),
): ChatLogEntry {
  return {
    timestamp: now.toISOString(),
    question,
    reply,
    unanswered: saidDontKnow(reply),
  };
}

// Saves the exchange without anything that identifies the visitor. Never throws.
export async function saveExchange(
  question: string,
  reply: string,
): Promise<void> {
  try {
    const entry = logEntry(question, reply);
    // Time-ordered keys, so `netlify blobs:list` shows the newest last.
    const key = `${entry.timestamp}-${crypto.randomUUID().slice(0, 8)}`;
    await getStore(STORE_NAME).setJSON(key, entry);
  } catch (err) {
    console.error("chat log error", err);
  }
}

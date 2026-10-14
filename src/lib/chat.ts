export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

// Streams the assistant's reply from the Netlify Function, calling onText with each chunk.
export async function streamReply(
  messages: ChatMessage[],
  onText: (text: string) => void,
): Promise<void> {
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages }),
  });
  if (res.status === 429) {
    throw new Error(
      "You're sending messages quickly. Wait a moment and try again.",
    );
  }
  if (!res.ok || !res.body) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.error ?? "Sorry, something went wrong. Try again?");
  }
  const reader = res.body.pipeThrough(new TextDecoderStream()).getReader();
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    onText(value);
  }
}

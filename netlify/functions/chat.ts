import Anthropic from "@anthropic-ai/sdk";
import type { Config } from "@netlify/functions";
import {
  MODEL,
  ownerFirstName,
  ValidationError,
  parseMessages,
  systemPrompt,
} from "../lib/chat";

const client = new Anthropic();

const fallback = () =>
  `Sorry, I can't help with that one. Feel free to reach out to ${ownerFirstName()} directly through the contact page.`;

export default async (req: Request): Promise<Response> => {
  let messages: Anthropic.MessageParam[];
  try {
    messages = parseMessages(await req.json());
  } catch (err) {
    const message =
      err instanceof ValidationError ? err.message : "Invalid request.";
    return Response.json({ error: message }, { status: 400 });
  }

  const encoder = new TextEncoder();
  // Abort generation (and stop billing) when the visitor disconnects.
  const stream = client.messages.stream(
    {
      model: MODEL,
      max_tokens: 2048,
      output_config: { effort: "low" },
      cache_control: { type: "ephemeral" },
      system: systemPrompt(),
      messages,
    },
    { signal: req.signal },
  );
  const body = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (text: string) => {
        try {
          controller.enqueue(encoder.encode(text));
        } catch {
          stream.abort(); // client went away
        }
      };
      stream.on("text", send);
      try {
        const final = await stream.finalMessage();
        if (final.stop_reason === "refusal") send(fallback());
      } catch (err) {
        if (!stream.aborted) {
          console.error("chat error", err);
          send(
            "\n\nSorry, I'm having trouble answering right now. Please try again in a moment.",
          );
        }
      } finally {
        try {
          controller.close();
        } catch {
          // already closed by a cancelled client
        }
      }
    },
    cancel() {
      stream.abort();
    },
  });

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
};

export const config: Config = {
  path: "/api/chat",
  method: "POST",
  rateLimit: {
    windowSize: 60,
    windowLimit: 10,
    aggregateBy: ["ip", "domain"],
  },
};

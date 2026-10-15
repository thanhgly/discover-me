import { createContext, useContext } from "react";
import type { ChatMessage } from "./chat";

// Matches the function's limits in netlify/lib/chat.ts.
export const MAX_MESSAGES = 20;
export const MAX_MESSAGE_CHARS = 1000;

export const STORAGE_KEY = "discover-me:chat";

export type ChatState = {
  messages: ChatMessage[];
  input: string;
  setInput: (text: string) => void;
  pending: boolean;
  error: string | null;
  /** The last finished reply, for the screen-reader announcement. */
  announcement: string;
  /** True when another exchange would exceed the conversation limit. */
  full: boolean;
  send: (text: string) => Promise<void>;
  reset: () => void;
};

export const ChatContext = createContext<ChatState | null>(null);

export function useChat(): ChatState {
  const chat = useContext(ChatContext);
  if (!chat) throw new Error("useChat must be used inside ChatProvider");
  return chat;
}

// Restores the conversation saved for this tab, keeping only complete exchanges.
export function loadMessages(): ChatMessage[] {
  try {
    const saved: unknown = JSON.parse(
      sessionStorage.getItem(STORAGE_KEY) ?? "[]",
    );
    if (!Array.isArray(saved)) return [];
    const valid = saved.every(
      (m, i) =>
        m?.role === (i % 2 ? "assistant" : "user") &&
        typeof m.content === "string",
    );
    if (!valid) return [];
    const messages = saved as ChatMessage[];
    const end = messages.length - (messages.length % 2);
    const complete = messages.slice(0, end);
    return complete.at(-1)?.content === "" ? complete.slice(0, -2) : complete;
  } catch {
    return [];
  }
}

export function saveMessages(messages: ChatMessage[]): void {
  try {
    if (messages.length) {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } else {
      sessionStorage.removeItem(STORAGE_KEY);
    }
  } catch {
    // storage unavailable (private mode, quota): the chat still works
  }
}

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { streamReply, type ChatMessage } from "../lib/chat";
import {
  ChatContext,
  loadMessages,
  MAX_MESSAGES,
  saveMessages,
  type ChatState,
} from "../lib/chatState";

// Holds the conversation above the routes so it survives page changes,
// and mirrors it to sessionStorage so it survives a reload.
const ChatProvider = ({ children }: { children: ReactNode }) => {
  const [messages, setMessages] = useState<ChatMessage[]>(loadMessages);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState("");
  // Bumped by reset so a reply still streaming into a cleared chat is dropped.
  const generation = useRef(0);
  const full = messages.length + 1 > MAX_MESSAGES;

  useEffect(() => saveMessages(messages), [messages]);

  const chat = useMemo<ChatState>(() => {
    const send = async (text: string) => {
      const content = text.trim();
      if (!content || pending || full) return;
      const run = generation.current;
      const current = () => run === generation.current;
      const history: ChatMessage[] = [...messages, { role: "user", content }];
      setMessages([...history, { role: "assistant", content: "" }]);
      setInput("");
      setError(null);
      setAnnouncement("");
      setPending(true);
      let reply = "";
      try {
        await streamReply(history, (chunk) => {
          if (!current()) return;
          reply += chunk;
          setMessages([...history, { role: "assistant", content: reply }]);
        });
      } catch (err) {
        if (!current()) return;
        if (!reply) {
          // Drop the failed exchange so it isn't re-sent, and give the text back.
          setMessages(messages);
          setInput(content);
        }
        setError(
          err instanceof Error ? err.message : "Sorry, something went wrong.",
        );
        return;
      } finally {
        if (current()) setPending(false);
      }
      if (!current()) return;
      if (!reply.trim()) {
        reply = "Sorry, I didn't get that.";
        setMessages([...history, { role: "assistant", content: reply }]);
      }
      setAnnouncement(reply);
    };

    const reset = () => {
      generation.current += 1;
      setMessages([]);
      setInput("");
      setError(null);
      setAnnouncement("");
      setPending(false);
    };

    return {
      messages,
      input,
      setInput,
      pending,
      error,
      announcement,
      full,
      send,
      reset,
    };
  }, [messages, input, pending, error, announcement, full]);

  return <ChatContext.Provider value={chat}>{children}</ChatContext.Provider>;
};

export default ChatProvider;

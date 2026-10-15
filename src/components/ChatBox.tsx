import { useEffect, useRef, type FormEvent } from "react";
import { FiArrowUp, FiRotateCcw } from "react-icons/fi";
import { profile as personalInfo } from "../lib/profile";
import type { ChatMessage } from "../lib/chat";
import { MAX_MESSAGE_CHARS, useChat } from "../lib/chatState";
import LinkedText from "./LinkedText";

const starters = (name: string, openToRoles?: string) => [
  `What does ${name} work on?`,
  "Tell me about a project",
  "What's the tech stack?",
  ...(openToRoles ? [`Is ${name} open to new roles?`] : []),
];

const ChatBox = () => {
  const { firstName, openToRoles } = personalInfo;
  const {
    messages,
    input,
    setInput,
    pending,
    error,
    announcement,
    full,
    send,
    reset,
  } = useChat();
  const logRef = useRef<HTMLDivElement>(null);

  // Follow new messages by scrolling the chat panel itself, never the page
  // (scrollIntoView would drag the whole page to the chat on mobile).
  useEffect(() => {
    const log = logRef.current;
    if (log && messages.length > 0) log.scrollTop = log.scrollHeight;
  }, [messages, pending, error, full]);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    void send(input);
  };

  return (
    <div className="card flex h-[32rem] flex-col overflow-hidden lg:h-[36rem]">
      <div className="flex items-center gap-3 border-b border-white/10 px-5 py-4">
        <div className="relative grid size-9 place-items-center rounded-full bg-accent/15 font-bold text-accent">
          AI
          <span className="absolute -right-0.5 -bottom-0.5 size-3 rounded-full border-2 border-zinc-900 bg-accent" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold">Ask about {firstName}</p>
          <p className="text-xs text-zinc-400">AI assistant</p>
        </div>
        {messages.length > 0 && (
          <button
            type="button"
            onClick={reset}
            className="btn btn-ghost px-3 py-1.5 text-xs"
          >
            <FiRotateCcw aria-hidden="true" /> New chat
          </button>
        )}
      </div>

      <div
        ref={logRef}
        role="log"
        aria-label="Conversation"
        aria-live="off"
        className="flex-1 space-y-3 overflow-y-auto px-5 py-4"
      >
        <Bubble role="assistant">
          Hi! I'm an AI assistant. Ask me anything about {firstName}'s
          experience, projects, or skills.
        </Bubble>
        {messages.map(
          (m, i) =>
            m.content && (
              <Bubble key={i} role={m.role}>
                {m.role === "assistant" ? (
                  <LinkedText text={m.content} />
                ) : (
                  m.content
                )}
              </Bubble>
            ),
        )}
        {pending && !messages[messages.length - 1]?.content && (
          <div role="status" className="flex gap-1 px-1 py-2">
            <span className="sr-only">Assistant is typing</span>
            {[0, 150, 300].map((delay) => (
              <span
                key={delay}
                aria-hidden="true"
                className="size-2 animate-bounce rounded-full bg-zinc-500"
                style={{ animationDelay: `${delay}ms` }}
              />
            ))}
          </div>
        )}
        {messages.length === 0 && (
          <div className="flex flex-wrap gap-2 pt-2">
            {starters(firstName, openToRoles).map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => void send(q)}
                className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-zinc-300 transition hover:border-accent/50 hover:text-white"
              >
                {q}
              </button>
            ))}
          </div>
        )}
        {error && (
          <p role="alert" className="px-1 text-xs text-red-300">
            {error}
          </p>
        )}
        {full && !pending && (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-center text-sm text-zinc-300">
            <p>
              That's a lot of great questions! This chat is full, so start a new
              one to keep asking about {firstName}.
            </p>
            <button
              type="button"
              onClick={reset}
              className="btn btn-ghost mt-3"
            >
              <FiRotateCcw aria-hidden="true" /> New chat
            </button>
          </div>
        )}
      </div>
      {/* Reads each reply once it's complete instead of every streamed chunk. */}
      <p className="sr-only" aria-live="polite" aria-atomic="true">
        {announcement}
      </p>

      <form onSubmit={onSubmit} className="border-t border-white/10 p-3">
        <div className="flex items-center gap-2">
          <label htmlFor="chat-input" className="sr-only">
            Message
          </label>
          <input
            id="chat-input"
            className="field rounded-full"
            placeholder={
              full ? "Start a new chat to continue" : "Type your question..."
            }
            value={input}
            onChange={(e) => setInput(e.target.value)}
            autoComplete="off"
            maxLength={MAX_MESSAGE_CHARS}
            disabled={full}
          />
          <button
            type="submit"
            className="btn btn-primary size-11 shrink-0 p-0"
            disabled={!input.trim() || pending || full}
            aria-label="Send"
          >
            <FiArrowUp size={18} />
          </button>
        </div>
        <p className="mt-2 px-2 text-center text-[11px] text-zinc-500">
          Questions are saved anonymously to improve answers.
        </p>
      </form>
    </div>
  );
};

const Bubble = ({
  role,
  children,
}: {
  role: ChatMessage["role"];
  children: React.ReactNode;
}) => (
  <div className={`flex ${role === "user" ? "justify-end" : "justify-start"}`}>
    <p
      className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed break-words whitespace-pre-wrap ${
        role === "user"
          ? "rounded-br-md bg-accent text-zinc-950"
          : "rounded-bl-md bg-white/5 text-zinc-200"
      }`}
    >
      {children}
    </p>
  </div>
);

export default ChatBox;

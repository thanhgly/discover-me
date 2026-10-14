import { useEffect, useRef, useState, type FormEvent } from "react";
import { FiArrowUp } from "react-icons/fi";
import { profile as personalInfo } from "../lib/profile";
import { streamReply, type ChatMessage } from "../lib/chat";

// Matches the function's limits in netlify/lib/chat.ts.
const MAX_MESSAGES = 20;
const MAX_MESSAGE_CHARS = 1000;

const starters = (name: string) => [
  `What does ${name} work on?`,
  "Tell me about a project",
  "What's the tech stack?",
  `Is ${name} open to new roles?`,
];

const ChatBox = () => {
  const { firstName } = personalInfo;
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const logRef = useRef<HTMLDivElement>(null);
  const full = messages.length + 1 > MAX_MESSAGES;

  // Follow new messages inside the chat panel without scrolling the page.
  useEffect(() => {
    const log = logRef.current;
    if (log && messages.length > 0) log.scrollTop = log.scrollHeight;
  }, [messages, pending, error]);

  const send = async (text: string) => {
    const content = text.trim();
    if (!content || pending || full) return;
    const history: ChatMessage[] = [...messages, { role: "user", content }];
    setMessages([...history, { role: "assistant", content: "" }]);
    setInput("");
    setError(null);
    setPending(true);
    let received = false;
    const appendToReply = (chunk: string) => {
      received = true;
      setMessages((m) => [
        ...m.slice(0, -1),
        { role: "assistant", content: m[m.length - 1].content + chunk },
      ]);
    };
    try {
      await streamReply(history, appendToReply);
    } catch (err) {
      if (!received) {
        // Drop the failed exchange so it isn't re-sent, and give the text back.
        setMessages(messages);
        setInput(content);
      }
      setError(
        err instanceof Error ? err.message : "Sorry, something went wrong.",
      );
    } finally {
      setMessages((m) =>
        m.length && !m[m.length - 1].content
          ? [
              ...m.slice(0, -1),
              { role: "assistant", content: "Sorry, I didn't get that." },
            ]
          : m,
      );
      setPending(false);
    }
  };

  const reset = () => {
    setMessages([]);
    setError(null);
  };

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
        <div>
          <p className="text-sm font-semibold">Ask about {firstName}</p>
          <p className="text-xs text-zinc-400">AI assistant</p>
        </div>
      </div>

      <div
        ref={logRef}
        className="flex-1 space-y-3 overflow-y-auto px-5 py-4"
        aria-live="polite"
      >
        <Bubble role="assistant">
          Hi! I'm an AI assistant. Ask me anything about {firstName}'s
          experience, projects, or skills.
        </Bubble>
        {messages.map(
          (m, i) =>
            m.content && (
              <Bubble key={i} role={m.role}>
                {m.content}
              </Bubble>
            ),
        )}
        {pending && !messages[messages.length - 1]?.content && (
          <div
            className="flex gap-1 px-1 py-2"
            aria-label="Assistant is typing"
          >
            {[0, 150, 300].map((delay) => (
              <span
                key={delay}
                className="size-2 animate-bounce rounded-full bg-zinc-500"
                style={{ animationDelay: `${delay}ms` }}
              />
            ))}
          </div>
        )}
        {messages.length === 0 && (
          <div className="flex flex-wrap gap-2 pt-2">
            {starters(firstName).map((q) => (
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
        {full && (
          <div className="flex justify-center pt-2">
            <button type="button" onClick={reset} className="btn btn-ghost">
              Start a new chat
            </button>
          </div>
        )}
      </div>

      <form
        onSubmit={onSubmit}
        className="flex items-center gap-2 border-t border-white/10 p-3"
      >
        <label htmlFor="chat-input" className="sr-only">
          Message
        </label>
        <input
          id="chat-input"
          className="field rounded-full"
          placeholder="Type your question..."
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
      className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
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

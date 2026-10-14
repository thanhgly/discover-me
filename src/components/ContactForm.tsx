import { useState, type FormEvent } from "react";

const Field = ({
  id,
  label,
  children,
}: {
  id: string;
  label: string;
  children: React.ReactNode;
}) => (
  <div>
    <label
      htmlFor={id}
      className="mb-1.5 block text-sm font-medium text-zinc-300"
    >
      {label}
    </label>
    {children}
  </div>
);

type Status = "idle" | "sending" | "sent" | "error";

// Netlify Forms picks up submissions posted to any page with a matching form-name.
// The static copy of this form in index.html is what registers it at deploy time.
const FORM_NAME = "contact";

const ContactForm = () => {
  const [status, setStatus] = useState<Status>("idle");

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    setStatus("sending");
    try {
      const data = new FormData(form);
      const body = new URLSearchParams(
        [...data.entries()].map(([k, v]) => [k, String(v)]),
      );
      const res = await fetch("/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: body.toString(),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      form.reset();
      setStatus("sent");
    } catch {
      setStatus("error");
    }
  };

  if (status === "sent") {
    return (
      <div className="card mt-8 p-6 sm:p-8" role="status">
        <p className="font-semibold">Thanks, your message was sent.</p>
        <p className="mt-1 text-sm text-zinc-400">I'll get back to you soon.</p>
        <button
          type="button"
          className="btn btn-ghost mt-4"
          onClick={() => setStatus("idle")}
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form
      name={FORM_NAME}
      method="POST"
      className="card mt-8 grid gap-5 p-6 sm:grid-cols-2 sm:p-8"
      onSubmit={(e) => void onSubmit(e)}
    >
      <input type="hidden" name="form-name" value={FORM_NAME} />
      {/* Honeypot: hidden from people, filled in by bots, dropped by Netlify. */}
      <p className="hidden" aria-hidden="true">
        <label>
          Leave this empty: <input name="bot-field" tabIndex={-1} />
        </label>
      </p>
      <Field id="full-name" label="Name">
        <input
          className="field"
          id="full-name"
          name="name"
          placeholder="Jane Doe"
          required
        />
      </Field>
      <Field id="email" label="Email">
        <input
          className="field"
          type="email"
          id="email"
          name="email"
          placeholder="name@domain.com"
          required
        />
      </Field>
      <div className="sm:col-span-2">
        <Field id="subject" label="Subject">
          <input
            className="field"
            id="subject"
            name="subject"
            placeholder="What's this about?"
          />
        </Field>
      </div>
      <div className="sm:col-span-2">
        <Field id="message" label="Message">
          <textarea
            className="field min-h-36 resize-y"
            id="message"
            name="message"
            placeholder="Write your message..."
            required
          />
        </Field>
      </div>
      <div className="flex flex-col gap-3 sm:col-span-2 sm:flex-row sm:items-center">
        <button
          type="submit"
          className="btn btn-primary w-full sm:w-auto"
          disabled={status === "sending"}
        >
          {status === "sending" ? "Sending..." : "Send message"}
        </button>
        {status === "error" && (
          <p role="alert" className="text-sm text-red-300">
            Sorry, that didn't send. Please try again or email me directly.
          </p>
        )}
      </div>
    </form>
  );
};

export default ContactForm;

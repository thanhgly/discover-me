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

const ContactForm = () => {
  return (
    <form
      className="card mt-8 grid gap-5 p-6 sm:grid-cols-2 sm:p-8"
      onSubmit={(e) => e.preventDefault()}
    >
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
      <div className="sm:col-span-2">
        <button type="submit" className="btn btn-primary w-full sm:w-auto">
          Send message
        </button>
      </div>
    </form>
  );
};

export default ContactForm;

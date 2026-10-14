import { MdAlternateEmail, MdPhone } from "react-icons/md";
import ContactForm from "./ContactForm";
import { profile as personalInfo } from "../lib/profile";

const Contact = () => {
  const { emails, phone } = personalInfo;

  return (
    <section className="grid gap-10 py-10 lg:grid-cols-[1fr_minmax(0,22rem)] lg:gap-16 lg:py-20">
      <div>
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
          Get in touch
        </h1>
        <p className="mt-3 max-w-lg text-zinc-400">
          Have a role, a project, or just a question? Send a message and I'll
          get back to you.
        </p>
        <ContactForm />
      </div>

      <aside className="space-y-4 lg:pt-24">
        {emails.map((email) => (
          <ContactCard
            key={email}
            href={`mailto:${email}`}
            label="Email"
            value={email}
            icon={<MdAlternateEmail size={20} />}
          />
        ))}
        {phone.map((number) => (
          <ContactCard
            key={number}
            href={`tel:${number}`}
            label="Phone"
            value={number}
            icon={<MdPhone size={20} />}
          />
        ))}
      </aside>
    </section>
  );
};

const ContactCard = ({
  href,
  label,
  value,
  icon,
}: {
  href: string;
  label: string;
  value: string;
  icon: React.ReactNode;
}) => (
  <a
    href={href}
    className="card flex items-center gap-4 p-4 transition hover:border-accent/40"
  >
    <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-accent/15 text-accent">
      {icon}
    </span>
    <span className="min-w-0">
      <span className="block text-xs text-zinc-400">{label}</span>
      <span className="block truncate text-sm font-medium">{value}</span>
    </span>
  </a>
);

export default Contact;

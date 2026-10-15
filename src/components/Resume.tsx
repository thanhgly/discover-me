import { FiExternalLink } from "react-icons/fi";
import type { Job, Project, SkillGroup } from "../lib/profile";

const Section = ({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) => (
  <section aria-labelledby={id} className="py-10 lg:py-14">
    <h2 id={id} className="text-2xl font-extrabold tracking-tight sm:text-3xl">
      {title}
    </h2>
    <div className="mt-6">{children}</div>
  </section>
);

const Highlights = ({ items }: { items: string[] }) => (
  <ul className="mt-3 space-y-2 text-sm leading-relaxed text-zinc-300">
    {items.map((item) => (
      <li key={item} className="flex gap-3">
        <span
          aria-hidden="true"
          className="mt-2 size-1.5 shrink-0 rounded-full bg-accent"
        />
        <span>{item}</span>
      </li>
    ))}
  </ul>
);

export const Experience = ({ jobs }: { jobs: Job[] }) => (
  <Section id="experience" title="Experience">
    <ol className="space-y-4">
      {jobs.map((job) => (
        <li key={`${job.company}-${job.role}`} className="card p-6 sm:p-8">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
            <h3 className="text-lg font-semibold">
              {job.role} <span className="text-accent">· {job.company}</span>
            </h3>
            <p className="shrink-0 text-sm text-zinc-400">{job.dates}</p>
          </div>
          {job.location && (
            <p className="mt-1 text-sm text-zinc-500">{job.location}</p>
          )}
          <Highlights items={job.highlights} />
        </li>
      ))}
    </ol>
  </Section>
);

export const Projects = ({ projects }: { projects: Project[] }) => (
  <Section id="projects" title="Projects">
    <ul className="grid gap-4 md:grid-cols-2">
      {projects.map((project) => (
        <li key={project.name} className="card flex flex-col p-6 sm:p-8">
          <p className="text-xs font-medium tracking-wide text-accent uppercase">
            {project.kind}
          </p>
          <div className="mt-2 flex items-baseline justify-between gap-4">
            <h3 className="text-lg font-semibold">{project.name}</h3>
            <p className="shrink-0 text-sm text-zinc-400">{project.dates}</p>
          </div>
          <p className="mt-2 text-sm leading-relaxed text-zinc-300">
            {project.summary}
          </p>
          {project.highlights && project.highlights.length > 0 && (
            <Highlights items={project.highlights} />
          )}
          {project.link && (
            <a
              href={project.link}
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-flex items-center gap-1.5 self-start text-sm font-medium text-accent hover:underline"
            >
              View code<span className="sr-only"> for {project.name}</span>
              <FiExternalLink aria-hidden="true" />
            </a>
          )}
        </li>
      ))}
    </ul>
  </Section>
);

export const Skills = ({ groups }: { groups: SkillGroup[] }) => (
  <Section id="skills" title="Skills">
    <div className="card grid gap-6 p-6 sm:grid-cols-2 sm:p-8 lg:grid-cols-3">
      {groups.map(({ group, items }) => (
        <div key={group}>
          <h3 className="text-sm font-semibold text-zinc-400">{group}</h3>
          <ul className="mt-3 flex flex-wrap gap-2">
            {items.map((item) => (
              <li
                key={item}
                className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-zinc-200"
              >
                {item}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  </Section>
);

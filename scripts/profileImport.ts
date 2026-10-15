import { readFileSync } from "node:fs";
import { basename, extname } from "node:path";
import type Anthropic from "@anthropic-ai/sdk";

// Drafts profile.json and about-me.md from a resume, a LinkedIn "Save to PDF" export,
// or plain-text notes. Used by scripts/import-profile.ts (npm run import-profile).

const text = { type: "string" };
const list = (items: object) => ({ type: "array", items });
const object = (properties: Record<string, object>) => ({
  type: "object",
  properties,
  required: Object.keys(properties),
  additionalProperties: false,
});

// Every field is required by structured outputs; unknown values come back as "" or [].
export const IMPORT_SCHEMA = object({
  profile: object({
    firstName: text,
    lastName: text,
    pronoun: text,
    title: text,
    bio: text,
    location: text,
    githubLink: text,
    linkedinLink: text,
    emails: list(text),
    openToRoles: text,
    skills: list(object({ group: text, items: list(text) })),
    experience: list(
      object({
        company: text,
        role: text,
        dates: text,
        location: text,
        highlights: list(text),
      }),
    ),
    projects: list(
      object({
        name: text,
        dates: text,
        kind: text,
        summary: text,
        highlights: list(text),
        link: text,
      }),
    ),
  }),
  aboutMe: text,
});

type Job = {
  company: string;
  role: string;
  dates: string;
  location: string;
  highlights: string[];
};
type Project = {
  name: string;
  dates: string;
  kind: string;
  summary: string;
  highlights: string[];
  link: string;
};
export type ImportResult = {
  profile: {
    firstName: string;
    lastName: string;
    pronoun: string;
    title: string;
    bio: string;
    location: string;
    githubLink: string;
    linkedinLink: string;
    emails: string[];
    openToRoles: string;
    skills: { group: string; items: string[] }[];
    experience: Job[];
    projects: Project[];
  };
  aboutMe: string;
};

export const IMPORT_PROMPT = `Draft a portfolio profile from the documents above (a resume, a LinkedIn export, or notes about one person). It powers a personal site with an AI assistant that answers visitors' questions only from about-me.md.

Rules:
- Use only facts stated in the documents. Never invent employers, dates, numbers, links, or skills. Leave a field "" or [] when the documents don't say.
- pronoun: only if the documents state it; otherwise "they".
- title: their current or target job title. bio: one first-person sentence for the home page.
- dates: short free text such as "Oct 2023 – Present".
- experience and projects: most recent first, two to four highlights each, keeping concrete numbers.
- skills: a few groups such as Frontend, Backend, Data, Tools.

aboutMe is the assistant's knowledge base, in Markdown, written in the third person, using this outline:
# About <full name>
> Knowledge base for the portfolio assistant. Drafted by npm run import-profile; review before publishing.
## Snapshot (role, location, current job, what they're open to, best way to reach them)
## Links (each URL found)
## Summary
## Skills
## Experience (### Company · Role (dates, location), then bullets)
## Projects (start with "Listed from most recent to oldest.", then ### Name (dates) · kind, a summary line, and bullets)
## Education
## Interests (only if the documents mention any)
## TODO: questions for you
List what a recruiter would ask that the documents don't answer, such as target role, remote or on-site, start date, impact numbers, interests, and topics the assistant should avoid. This section is never sent to the assistant.

Include every detail from the documents in aboutMe, including ones too long for the profile fields.`;

const PDF = ".pdf";
const TEXT = new Set([".md", ".txt", ".markdown"]);

export function sourceBlock(
  path: string,
  read: (path: string) => Buffer = readFileSync,
): Anthropic.ContentBlockParam {
  const ext = extname(path).toLowerCase();
  if (ext === PDF) {
    return {
      type: "document",
      title: basename(path),
      source: {
        type: "base64",
        media_type: "application/pdf",
        data: read(path).toString("base64"),
      },
    };
  }
  if (TEXT.has(ext)) {
    return {
      type: "document",
      title: basename(path),
      source: {
        type: "text",
        media_type: "text/plain",
        data: read(path).toString("utf8"),
      },
    };
  }
  throw new Error(`${path}: use a .pdf, .md or .txt file`);
}

const optional = (value: string) => value.trim() || undefined;

// Shapes the model's output like profile/profile.json, dropping empty optional fields.
export function toProfileJson({ profile: p }: ImportResult) {
  return {
    firstName: p.firstName,
    lastName: p.lastName,
    pronoun: p.pronoun || "they",
    title: p.title,
    bio: p.bio,
    location: optional(p.location),
    githubLink: optional(p.githubLink),
    linkedinLink: optional(p.linkedinLink),
    emails: p.emails,
    cvLink: "",
    openToRoles: optional(p.openToRoles),
    skills: p.skills.filter((s) => s.items.length),
    experience: p.experience.map((job) => ({
      ...job,
      location: optional(job.location),
    })),
    projects: p.projects.map(({ highlights, link, ...project }) => ({
      ...project,
      highlights: highlights.length ? highlights : undefined,
      link: optional(link),
    })),
  };
}

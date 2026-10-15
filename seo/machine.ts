// Machine-readable copies of the profile for AI tools and recruiters' screeners:
// llms.txt (https://llmstxt.org) and resume.json (https://jsonresume.org). Pure, so it's unit-tested.

import { fullName, type SeoProfile } from "./meta.ts";

export type ResumeProfile = SeoProfile & {
  emails?: string[];
  cvLink?: string;
  openToRoles?: string;
  skills?: { group: string; items: string[] }[];
  experience?: {
    company: string;
    role: string;
    dates: string;
    location?: string;
    highlights: string[];
  }[];
  projects?: {
    name: string;
    dates: string;
    kind: string;
    summary: string;
    highlights?: string[];
    link?: string;
  }[];
};

const MONTHS = [
  "jan",
  "feb",
  "mar",
  "apr",
  "may",
  "jun",
  "jul",
  "aug",
  "sep",
  "oct",
  "nov",
  "dec",
];

// "Oct 2023" → "2023-10", "2022" → "2022"; anything else (e.g. "Present") → undefined.
function isoDate(text: string): string | undefined {
  const m = text.trim().match(/^(?:([a-z]{3})[a-z]*\.?\s+)?(\d{4})$/i);
  if (!m) return undefined;
  const month = m[1] ? MONTHS.indexOf(m[1].toLowerCase()) + 1 : 0;
  return month ? `${m[2]}-${String(month).padStart(2, "0")}` : m[2];
}

// Free-text ranges like "Oct 2023 – Present" or "2019 - 2021".
export function dateRange(dates: string): {
  startDate?: string;
  endDate?: string;
} {
  const [start, end] = dates.split(/\s*[–—-]\s*|\s+to\s+/i);
  const range: { startDate?: string; endDate?: string } = {};
  const startDate = isoDate(start ?? "");
  const endDate = end ? isoDate(end) : undefined;
  if (startDate) range.startDate = startDate;
  if (endDate) range.endDate = endDate;
  return range;
}

export function jsonResume(profile: ResumeProfile, url: string) {
  const profiles = [
    profile.githubLink && { network: "GitHub", url: profile.githubLink },
    profile.linkedinLink && { network: "LinkedIn", url: profile.linkedinLink },
  ].filter(Boolean);
  return {
    $schema:
      "https://raw.githubusercontent.com/jsonresume/resume-schema/v1.0.0/schema.json",
    basics: {
      name: fullName(profile),
      label: profile.title,
      ...(profile.emails?.[0] && { email: profile.emails[0] }),
      url: `${url}/`,
      summary: profile.bio,
      ...(profile.location && { location: { city: profile.location } }),
      profiles,
    },
    work: (profile.experience ?? []).map((job) => ({
      name: job.company,
      position: job.role,
      ...(job.location && { location: job.location }),
      ...dateRange(job.dates),
      highlights: job.highlights,
    })),
    projects: (profile.projects ?? []).map((p) => ({
      name: p.name,
      description: p.summary,
      ...dateRange(p.dates),
      ...(p.highlights?.length && { highlights: p.highlights }),
      ...(p.link && { url: p.link }),
      keywords: [p.kind],
    })),
    skills: (profile.skills ?? []).map((s) => ({
      name: s.group,
      keywords: s.items,
    })),
    meta: { canonical: `${url}/resume.json` },
  };
}

// Profile facts first, then the assistant's knowledge base (already stripped of
// editor notes and the TODO section).
export function llmsTxt(
  profile: ResumeProfile,
  knowledge: string,
  url: string,
): string {
  const name = fullName(profile);
  const lines = [
    `# ${name}`,
    "",
    `> ${profile.title}. ${profile.bio}`,
    "",
    `This is ${name}'s portfolio. Visitors can chat with an AI assistant about ${profile.firstName} at ${url}/ and get in touch through ${url}/contact.`,
    "",
  ];
  if (profile.openToRoles?.trim()) {
    lines.push(`Open to: ${profile.openToRoles.trim()}`, "");
  }
  const links = [
    `- [Resume (JSON Resume)](${url}/resume.json)`,
    profile.cvLink && `- [CV](${profile.cvLink})`,
    profile.githubLink && `- [GitHub](${profile.githubLink})`,
    profile.linkedinLink && `- [LinkedIn](${profile.linkedinLink})`,
  ].filter((line): line is string => Boolean(line));
  lines.push("## Links", "", ...links, "");
  // Drop the knowledge base's own title and demote its headings to sit under "Details".
  const body = knowledge
    .replace(/^# .*\n?/, "")
    .replace(/^(#+ )/gm, "#$1")
    .trim();
  if (body) lines.push("## Details", "", body, "");
  return lines.join("\n");
}

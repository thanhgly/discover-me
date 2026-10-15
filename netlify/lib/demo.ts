// Demo mode: preset answers from profile.json when ANTHROPIC_API_KEY isn't set,
// so a fresh fork works the moment it deploys.

export type DemoProfile = {
  firstName: string;
  bio?: string;
  title?: string;
  openToRoles?: string;
  skills?: { group: string; items: string[] }[];
  experience?: { company: string; role: string; dates: string }[];
  projects?: { name: string; summary: string }[];
};

export const DEMO_NOTE =
  "(Demo mode: the site owner hasn't added a Claude API key yet, so these are preset answers from the profile.)";

export const isDemoMode = () => !process.env.ANTHROPIC_API_KEY?.trim();

const bullets = (lines: string[]) => lines.map((l) => `- ${l}`).join("\n");

const topics: {
  match: RegExp;
  answer: (p: DemoProfile) => string | undefined;
}[] = [
  {
    match: /\b(open to|looking|available|new role|hiring|hire)\b/i,
    answer: (p) =>
      p.openToRoles?.trim() &&
      `${p.firstName} is looking for: ${p.openToRoles.trim()}. The contact page is the best way to get in touch.`,
  },
  {
    match: /\b(skills?|stack|tech|technolog\w*|languages?|tools?)\b/i,
    answer: (p) =>
      p.skills?.length
        ? `${p.firstName}'s skills:\n${bullets(p.skills.map((s) => `${s.group}: ${s.items.join(", ")}`))}`
        : undefined,
  },
  {
    match: /\b(experience|work\w*|jobs?|roles?|compan\w*|career|employ\w*)\b/i,
    answer: (p) =>
      p.experience?.length
        ? `${p.firstName}'s experience:\n${bullets(p.experience.map((j) => `${j.role} at ${j.company} (${j.dates})`))}`
        : undefined,
  },
  {
    match: /\bprojects?\b/i,
    answer: (p) =>
      p.projects?.length
        ? `Some of ${p.firstName}'s projects:\n${bullets(p.projects.map((x) => `${x.name}: ${x.summary}`))}`
        : undefined,
  },
  {
    match: /\b(contact|email|reach|touch|talk)\b/i,
    answer: (p) => `You can reach ${p.firstName} through the contact page.`,
  },
];

export function demoReply(question: string, profile: DemoProfile): string {
  for (const topic of topics) {
    if (topic.match.test(question)) {
      const answer = topic.answer(profile);
      if (answer) return `${answer}\n\n${DEMO_NOTE}`;
    }
  }
  const intro = [
    profile.title && `${profile.firstName} is a ${profile.title}.`,
    profile.bio,
  ]
    .filter(Boolean)
    .join(" ");
  return `${intro || `This is ${profile.firstName}'s portfolio.`} Try asking about skills, experience, projects, or how to get in touch.\n\n${DEMO_NOTE}`;
}

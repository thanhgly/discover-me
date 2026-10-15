import data from "@profile/profile.json";

export type SkillGroup = { group: string; items: string[] };

export type Job = {
  company: string;
  role: string;
  /** Free text, e.g. "Oct 2023 – Present". */
  dates: string;
  location?: string;
  highlights: string[];
};

export type Project = {
  name: string;
  dates: string;
  /** Short label such as "Full-stack" or "Frontend". */
  kind: string;
  summary: string;
  highlights?: string[];
  link?: string;
};

export type Profile = {
  firstName: string;
  lastName: string;
  /** Pronoun the assistant uses when referring to you, e.g. "she", "he", or "they". */
  pronoun: string;
  title: string;
  bio: string;
  location?: string;
  githubLink?: string;
  linkedinLink?: string;
  emails: string[];
  /** Not shown on the site. */
  phone?: string[];
  /** Link to a hosted CV/resume PDF; the download button hides when empty. */
  cvLink?: string;
  /** What you're looking for, e.g. "Senior frontend roles, remote or hybrid". Enables the "open to new roles?" chat starter. */
  openToRoles?: string;
  /** Home page sections; each hides when empty. */
  skills?: SkillGroup[];
  experience?: Job[];
  projects?: Project[];
};

export const profile: Profile = data;

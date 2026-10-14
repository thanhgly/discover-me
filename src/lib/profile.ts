import data from "@profile/profile.json";

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
  phone: string[];
  /** Link to a hosted CV/resume PDF; the download button hides when empty. */
  cvLink?: string;
};

export const profile: Profile = data;

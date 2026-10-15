import { dateRange, jsonResume, llmsTxt } from "./machine.ts";

const profile = {
  firstName: "Alex",
  lastName: "Rivera",
  title: "Frontend Engineer",
  bio: "Builds fast apps.",
  location: "Austin, Texas",
  githubLink: "https://github.com/alex",
  linkedinLink: "",
  emails: ["alex@example.com"],
  openToRoles: "Senior frontend roles",
  skills: [{ group: "Frontend", items: ["React", "TypeScript"] }],
  experience: [
    {
      company: "Example Co.",
      role: "Senior Engineer",
      dates: "Oct 2023 – Present",
      highlights: ["Shipped a design system."],
    },
  ],
  projects: [
    {
      name: "Widget",
      dates: "2024",
      kind: "Frontend",
      summary: "A small widget.",
      link: "https://github.com/alex/widget",
    },
  ],
};
const url = "https://alex.example";

it.each([
  ["Oct 2023 – Present", { startDate: "2023-10" }],
  ["2019 - 2021", { startDate: "2019", endDate: "2021" }],
  ["September 2020 to Jan 2022", { startDate: "2020-09", endDate: "2022-01" }],
  ["Summer 2024", { startDate: "2024" }],
  ["Ongoing", {}],
])("reads %j as %j", (dates, expected) => {
  expect(dateRange(dates)).toEqual(expected);
});

it("builds a JSON Resume from the profile", () => {
  expect(jsonResume(profile, url)).toMatchObject({
    basics: {
      name: "Alex Rivera",
      label: "Frontend Engineer",
      email: "alex@example.com",
      url: `${url}/`,
      location: { city: "Austin, Texas" },
      profiles: [{ network: "GitHub", url: "https://github.com/alex" }],
    },
    work: [
      {
        name: "Example Co.",
        position: "Senior Engineer",
        startDate: "2023-10",
        highlights: ["Shipped a design system."],
      },
    ],
    projects: [
      {
        name: "Widget",
        startDate: "2024",
        url: "https://github.com/alex/widget",
      },
    ],
    skills: [{ name: "Frontend", keywords: ["React", "TypeScript"] }],
  });
});

it("works with only the required profile fields", () => {
  const { firstName, lastName, title, bio } = profile;
  const resume = jsonResume({ firstName, lastName, title, bio }, url);
  expect(resume.work).toEqual([]);
  expect(resume.basics).not.toHaveProperty("email");
});

it("writes llms.txt with the summary, links and knowledge base", () => {
  const txt = llmsTxt(
    profile,
    "# About Alex Rivera\n\n## Skills\n\nReact",
    url,
  );
  expect(txt).toMatch(
    /^# Alex Rivera\n\n> Frontend Engineer\. Builds fast apps\./,
  );
  expect(txt).toContain("Open to: Senior frontend roles");
  expect(txt).toContain(`- [Resume (JSON Resume)](${url}/resume.json)`);
  expect(txt).toContain("- [GitHub](https://github.com/alex)");
  expect(txt).not.toContain("LinkedIn");
  expect(txt).toContain("## Details\n\n### Skills\n\nReact");
  expect(txt).not.toContain("About Alex Rivera");
});

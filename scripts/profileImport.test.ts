import {
  IMPORT_SCHEMA,
  type ImportResult,
  sourceBlock,
  toProfileJson,
} from "./profileImport";

const read = () => Buffer.from("hello");

describe("sourceBlock", () => {
  it("sends PDFs as base64 documents", () => {
    expect(sourceBlock("/tmp/Resume.PDF", read)).toEqual({
      type: "document",
      title: "Resume.PDF",
      source: {
        type: "base64",
        media_type: "application/pdf",
        data: "aGVsbG8=",
      },
    });
  });

  it("sends Markdown and text as plain-text documents", () => {
    expect(sourceBlock("notes.md", read)).toMatchObject({
      source: { type: "text", data: "hello" },
    });
  });

  it("rejects other file types", () => {
    expect(() => sourceBlock("resume.docx", read)).toThrow(/\.pdf, \.md/);
  });
});

it("makes every schema field required, as structured outputs needs", () => {
  const walk = (node: Record<string, unknown>): void => {
    if (node.type === "object") {
      const properties = node.properties as Record<string, object>;
      expect(node.required).toEqual(Object.keys(properties));
      expect(node.additionalProperties).toBe(false);
      Object.values(properties).forEach((p) => walk(p as never));
    }
    if (node.type === "array") walk(node.items as never);
  };
  walk(IMPORT_SCHEMA);
});

it("shapes the result like profile.json and drops empty fields", () => {
  const result: ImportResult = {
    profile: {
      firstName: "Alex",
      lastName: "Rivera",
      pronoun: "",
      title: "Engineer",
      bio: "I build things.",
      location: "",
      githubLink: "https://github.com/alex",
      linkedinLink: " ",
      emails: ["alex@example.com"],
      openToRoles: "",
      skills: [
        { group: "Frontend", items: ["React"] },
        { group: "Empty", items: [] },
      ],
      experience: [
        {
          company: "Example Co.",
          role: "Engineer",
          dates: "2022 – Present",
          location: "",
          highlights: ["Shipped it."],
        },
      ],
      projects: [
        {
          name: "Side project",
          dates: "2024",
          kind: "Frontend",
          summary: "A thing.",
          highlights: [],
          link: "",
        },
      ],
    },
    aboutMe: "# About Alex Rivera",
  };
  const json = JSON.parse(JSON.stringify(toProfileJson(result)));
  expect(json).toEqual({
    firstName: "Alex",
    lastName: "Rivera",
    pronoun: "they",
    title: "Engineer",
    bio: "I build things.",
    githubLink: "https://github.com/alex",
    emails: ["alex@example.com"],
    cvLink: "",
    skills: [{ group: "Frontend", items: ["React"] }],
    experience: [
      {
        company: "Example Co.",
        role: "Engineer",
        dates: "2022 – Present",
        highlights: ["Shipped it."],
      },
    ],
    projects: [
      {
        name: "Side project",
        dates: "2024",
        kind: "Frontend",
        summary: "A thing.",
      },
    ],
  });
});

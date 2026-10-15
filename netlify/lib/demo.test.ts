import { DEMO_NOTE, demoReply, isDemoMode } from "./demo";

const profile = {
  firstName: "Alex",
  title: "Frontend Engineer",
  bio: "Builds fast, accessible web apps.",
  openToRoles: "Senior frontend roles, remote",
  skills: [{ group: "Frontend", items: ["React", "TypeScript"] }],
  experience: [
    {
      company: "Example Co.",
      role: "Senior Engineer",
      dates: "2022 – Present",
    },
  ],
  projects: [{ name: "Widget", summary: "A small widget." }],
};

it.each([
  ["What are her skills?", "Frontend: React, TypeScript"],
  ["Where has she worked?", "Senior Engineer at Example Co. (2022 – Present)"],
  ["Any side projects?", "Widget: A small widget."],
  ["Is she open to new roles?", "Senior frontend roles, remote"],
  ["How do I contact her?", "through the contact page"],
  ["Hi!", "Alex is a Frontend Engineer. Builds fast"],
])("answers %j from the profile", (question, expected) => {
  const reply = demoReply(question, profile);
  expect(reply).toContain(expected);
  expect(reply).toContain(DEMO_NOTE);
});

it("falls back to the intro when a topic has no data", () => {
  const reply = demoReply("What are her skills?", { firstName: "Alex" });
  expect(reply).toContain("This is Alex's portfolio.");
});

it("is on only when there's no API key", () => {
  vi.stubEnv("ANTHROPIC_API_KEY", "");
  expect(isDemoMode()).toBe(true);
  vi.stubEnv("ANTHROPIC_API_KEY", "sk-ant-test");
  expect(isDemoMode()).toBe(false);
  vi.unstubAllEnvs();
});

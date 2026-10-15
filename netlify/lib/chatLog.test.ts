import { getStore } from "@netlify/blobs";
import { logEntry, saidDontKnow, saveExchange, STORE_NAME } from "./chatLog";

vi.mock("@netlify/blobs", () => ({ getStore: vi.fn() }));

describe("saidDontKnow", () => {
  it.each([
    "I don't know what Thanh's favorite food is. Feel free to ask through the contact page.",
    "I don’t have information about salary expectations.",
    "The knowledge base doesn't include details about hobbies.",
    "I'm not sure about that one.",
    "That isn't covered in what I know about Alex.",
    "Sorry, I can't help with that one.",
  ])("flags %j", (reply) => {
    expect(saidDontKnow(reply)).toBe(true);
  });

  it.each([
    "Thanh is a full-stack engineer at Thryv who builds billing systems.",
    "Alex knows React, TypeScript, and accessibility well.",
    "- React\n- Node.js\n- PostgreSQL",
  ])("doesn't flag %j", (reply) => {
    expect(saidDontKnow(reply)).toBe(false);
  });
});

it("logs the question, reply, time and flag, and nothing else", () => {
  const entry = logEntry(
    "Hobbies?",
    "I don't know.",
    new Date("2026-10-15T12:00:00Z"),
  );
  expect(entry).toEqual({
    timestamp: "2026-10-15T12:00:00.000Z",
    question: "Hobbies?",
    reply: "I don't know.",
    unanswered: true,
  });
});

it("saves to the chat-log store under a time-ordered key", async () => {
  const setJSON = vi.fn().mockResolvedValue(undefined);
  vi.mocked(getStore).mockReturnValue({ setJSON } as never);
  await saveExchange("Q", "A");
  expect(getStore).toHaveBeenCalledWith(STORE_NAME);
  const [key, entry] = setJSON.mock.calls[0];
  expect(key).toMatch(/^\d{4}-\d\d-\d\dT.*Z-[0-9a-f]{8}$/);
  expect(entry).toMatchObject({ question: "Q", reply: "A", unanswered: false });
});

it("never throws when saving fails", async () => {
  const error = vi.spyOn(console, "error").mockImplementation(() => {});
  vi.mocked(getStore).mockImplementation(() => {
    throw new Error("no blobs here");
  });
  await expect(saveExchange("Q", "A")).resolves.toBeUndefined();
  expect(error).toHaveBeenCalled();
  error.mockRestore();
});

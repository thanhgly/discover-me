import { render, screen, within } from "../../test/utilities";
import App from "../components/App";
import { profile as personalInfo } from "../lib/profile";
import { STORAGE_KEY } from "../lib/chatState";

beforeEach(() => {
  window.history.pushState({}, "", "/");
});

afterEach(() => {
  vi.unstubAllGlobals();
  sessionStorage.clear();
});

const streamResponse = (...chunks: string[]) =>
  new Response(
    new ReadableStream({
      start(controller) {
        for (const c of chunks) controller.enqueue(new TextEncoder().encode(c));
        controller.close();
      },
    }),
  );

it("renders the home page with the owner's name", () => {
  render(<App />);
  expect(
    screen.getByRole("heading", {
      name: `${personalInfo.firstName} ${personalInfo.lastName}`,
    }),
  ).toBeInTheDocument();
});

it("sends the conversation to the chat API and streams the reply", async () => {
  const fetchMock = vi
    .fn()
    .mockResolvedValue(streamResponse("Builds ", "web apps."));
  vi.stubGlobal("fetch", fetchMock);

  const { user } = render(<App />);
  await user.type(screen.getByLabelText("Message"), "Hello there");
  await user.click(screen.getByRole("button", { name: "Send" }));

  const log = screen.getByRole("log");
  expect(await within(log).findByText("Builds web apps.")).toBeInTheDocument();
  expect(fetchMock).toHaveBeenCalledWith(
    "/api/chat",
    expect.objectContaining({
      body: JSON.stringify({
        messages: [{ role: "user", content: "Hello there" }],
      }),
    }),
  );
});

it("shows a friendly message when the chat API fails", async () => {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue(new Response(null, { status: 429 })),
  );
  const { user } = render(<App />);
  await user.type(screen.getByLabelText("Message"), "Hi");
  await user.click(screen.getByRole("button", { name: "Send" }));
  expect(
    await screen.findByText(/sending messages quickly/),
  ).toBeInTheDocument();
});

it("navigates to the contact page", async () => {
  const { user } = render(<App />);
  await user.click(screen.getByRole("link", { name: "Contact" }));
  expect(
    screen.getByRole("heading", { name: "Get in touch" }),
  ).toBeInTheDocument();
});

it("submits the contact form to Netlify Forms", async () => {
  const fetchMock = vi.fn().mockResolvedValue(new Response(null));
  vi.stubGlobal("fetch", fetchMock);
  const { user } = render(<App />);
  await user.click(screen.getByRole("link", { name: "Contact" }));
  await user.type(screen.getByLabelText("Name"), "Jane");
  await user.type(screen.getByLabelText("Email"), "jane@example.com");
  await user.type(screen.getByLabelText("Message"), "Hello!");
  await user.click(screen.getByRole("button", { name: "Send message" }));

  expect(await screen.findByText(/your message was sent/)).toBeInTheDocument();
  const [url, init] = fetchMock.mock.calls[0];
  expect(url).toBe("/");
  const sent = new URLSearchParams(init.body);
  expect(sent.get("form-name")).toBe("contact");
  expect(sent.get("email")).toBe("jane@example.com");
  expect(sent.get("message")).toBe("Hello!");
});

it("keeps the contact form filled in when sending fails", async () => {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue(new Response(null, { status: 500 })),
  );
  const { user } = render(<App />);
  await user.click(screen.getByRole("link", { name: "Contact" }));
  await user.type(screen.getByLabelText("Name"), "Jane");
  await user.type(screen.getByLabelText("Email"), "jane@example.com");
  await user.type(screen.getByLabelText("Message"), "Hello!");
  await user.click(screen.getByRole("button", { name: "Send message" }));

  expect(await screen.findByRole("alert")).toHaveTextContent(/didn't send/);
  expect(screen.getByLabelText("Message")).toHaveValue("Hello!");
});

const exchange = (n: number) =>
  Array.from({ length: n }, (_, i) => ({
    role: i % 2 ? "assistant" : "user",
    content: `message ${i}`,
  }));

it("shows experience, projects and skills from the profile", () => {
  render(<App />);
  const { experience, projects, skills } = personalInfo;
  for (const [name, items] of [
    ["Experience", experience],
    ["Projects", projects],
    ["Skills", skills],
  ] as const) {
    if (items?.length) {
      expect(screen.getByRole("heading", { level: 2, name })).toBeVisible();
    } else {
      expect(screen.queryByRole("heading", { name })).not.toBeInTheDocument();
    }
  }
  if (experience?.length) {
    expect(
      screen.getAllByText(experience[0].highlights[0])[0],
    ).toBeInTheDocument();
  }
});

it("only offers the open-to-roles starter when the profile says so", () => {
  const saved = personalInfo.openToRoles;
  const question = `Is ${personalInfo.firstName} open to new roles?`;
  try {
    personalInfo.openToRoles = "";
    const { unmount } = render(<App />);
    expect(screen.queryByRole("button", { name: question })).toBeNull();
    unmount();
    personalInfo.openToRoles = "Senior roles, remote";
    render(<App />);
    expect(screen.getByRole("button", { name: question })).toBeVisible();
  } finally {
    personalInfo.openToRoles = saved;
  }
});

it("keeps the conversation when visiting the contact page and back", async () => {
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue(streamResponse("Hello!")));
  const { user } = render(<App />);
  await user.type(screen.getByLabelText("Message"), "Hi");
  await user.click(screen.getByRole("button", { name: "Send" }));
  await within(screen.getByRole("log")).findByText("Hello!");

  await user.click(screen.getByRole("link", { name: "Contact" }));
  await user.click(screen.getAllByRole("link", { name: "Home" })[0]);
  expect(within(screen.getByRole("log")).getByText("Hello!")).toBeVisible();
  expect(JSON.parse(sessionStorage.getItem(STORAGE_KEY)!)).toEqual([
    { role: "user", content: "Hi" },
    { role: "assistant", content: "Hello!" },
  ]);
});

it("restores the saved conversation and starts over with New chat", async () => {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(exchange(2)));
  const { user } = render(<App />);
  expect(screen.getByText("message 1")).toBeVisible();
  await user.click(screen.getByRole("button", { name: "New chat" }));
  expect(screen.queryByText("message 1")).toBeNull();
  expect(sessionStorage.getItem(STORAGE_KEY)).toBeNull();
});

it("ignores a saved conversation that isn't valid", () => {
  sessionStorage.setItem(
    STORAGE_KEY,
    JSON.stringify([{ role: "assistant", content: "sneaky" }]),
  );
  render(<App />);
  expect(screen.queryByText("sneaky")).toBeNull();
});

it("offers a new chat instead of an error when the chat is full", () => {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(exchange(20)));
  render(<App />);
  expect(screen.getByText(/This chat is full/)).toBeVisible();
  expect(screen.queryByRole("alert")).toBeNull();
  expect(screen.getByLabelText("Message")).toBeDisabled();
  expect(screen.getAllByRole("button", { name: "New chat" })).toHaveLength(2);
});

it("links the contact page and URLs in replies and announces the finished reply", async () => {
  const reply = "See https://github.com/example/repo. Or use the contact page.";
  vi.stubGlobal(
    "fetch",
    vi
      .fn()
      .mockResolvedValue(
        streamResponse(
          "See https://github",
          ".com/example/repo. Or use the contact page.",
        ),
      ),
  );
  const { user } = render(<App />);
  await user.type(screen.getByLabelText("Message"), "Links?");
  await user.click(screen.getByRole("button", { name: "Send" }));

  const log = screen.getByRole("log");
  expect(
    await within(log).findByRole("link", { name: "contact page" }),
  ).toHaveAttribute("href", "/contact");
  expect(
    within(log).getByRole("link", { name: "https://github.com/example/repo" }),
  ).toHaveAttribute("href", "https://github.com/example/repo");
  expect(
    screen.getByText(reply, { selector: "[aria-live=polite]" }),
  ).toBeInTheDocument();
});

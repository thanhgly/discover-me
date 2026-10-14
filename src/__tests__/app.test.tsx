import { render, screen, within } from "../../test/utilities";
import App from "../components/App";
import { profile as personalInfo } from "../lib/profile";

afterEach(() => {
  vi.unstubAllGlobals();
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

  const log = screen.getByText("Hello there").closest("[aria-live]")!;
  expect(
    await within(log as HTMLElement).findByText("Builds web apps."),
  ).toBeInTheDocument();
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

import { afterEach, describe, expect, it, vi } from "vitest";
import config from "../lib/iblai/config";
import { complete } from "../lib/iblai/completions";

/** lib/iblai/completions.ts — one completion on the DM's OpenAI-compatible endpoint. */

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

function stubFetch(...responses: Response[]) {
  const fetchMock = vi.fn<(url: string, init?: RequestInit) => Promise<Response>>(
    async () => responses.shift() ?? json(500, {}),
  );
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

const sentBody = (call: [string, RequestInit?]) => JSON.parse(String(call[1]?.body));

afterEach(() => vi.unstubAllGlobals());

const messages = [{ role: "user" as const, content: "Hi" }];

describe("complete", () => {
  it("prefers iblai/iblai-pro, names the learner, and returns the text", async () => {
    const f = stubFetch(
      json(200, { data: [{ id: "openai/gpt-5" }, { id: "iblai/iblai-pro" }] }),
      json(200, { choices: [{ message: { content: "  Done.  " } }] }),
    );
    await expect(complete("acme", "jane", messages)).resolves.toBe("Done.");
    const path = "/api/ai-mentor/orgs/acme/v1";
    expect(f.mock.calls[0][0]).toBe(`${config.dmUrl()}${path}/models?learner_id=jane`);
    expect(f.mock.calls[1][0]).toBe(`${config.asgiUrl()}${path}/chat/completions?learner_id=jane`);
    expect(f.mock.calls[1][1]?.method).toBe("POST");
    expect(sentBody(f.mock.calls[1])).toEqual({ model: "iblai/iblai-pro", messages });
  });

  it("falls back to the first listed model", async () => {
    const f = stubFetch(
      json(200, { data: [{ id: "openai/gpt-5" }] }),
      json(200, { choices: [{ message: { content: "x" } }] }),
    );
    await complete("acme", "jane", messages);
    expect(sentBody(f.mock.calls[1]).model).toBe("openai/gpt-5");
  });

  it("says so when the platform lists no model", async () => {
    stubFetch(json(200, { data: [] }));
    await expect(complete("acme", "jane", messages)).rejects.toThrow(
      "This platform has no AI model available.",
    );
  });

  it("surfaces the platform's own message, e.g. out of credits", async () => {
    stubFetch(
      json(200, { data: [{ id: "iblai/iblai-pro" }] }),
      json(402, { error: { message: "Insufficient credits.", type: "insufficient_quota" } }),
    );
    await expect(complete("acme", "jane", messages)).rejects.toThrow("Insufficient credits.");
  });

  it("keeps the status when the body has no message, and refuses an empty answer", async () => {
    stubFetch(json(503, "busy"));
    await expect(complete("acme", "jane", messages)).rejects.toThrow(
      "Platform request failed (503)",
    );
    stubFetch(json(200, { data: [{ id: "iblai/iblai-pro" }] }), json(200, { choices: [] }));
    await expect(complete("acme", "jane", messages)).rejects.toThrow("The model returned no text.");
  });
});

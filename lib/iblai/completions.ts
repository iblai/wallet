/**
 * One chat completion on the platform's OpenAI-compatible endpoint
 * (`/api/ai-mentor/orgs/<org>/v1/`), as the signed-in user. The DM answers a
 * member only when they name themselves in `learner_id`; admins pass too.
 */
import { SessionFetchError, sessionFetch } from "./session-fetch";

export type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

/** ibl.ai's own router, used when the platform lists it. */
const PREFERRED_MODEL = "iblai/iblai-pro";

export async function complete(
  org: string,
  username: string,
  messages: ChatMessage[],
): Promise<string> {
  const base = `/api/ai-mentor/orgs/${encodeURIComponent(org)}/v1`;
  const me = `?learner_id=${encodeURIComponent(username)}`;
  try {
    // Only models the platform can actually run are listed.
    const { data = [] } = await sessionFetch<{ data?: { id: string }[] }>(`${base}/models${me}`);
    const model = data.some((m) => m.id === PREFERRED_MODEL) ? PREFERRED_MODEL : data[0]?.id;
    if (!model) throw new Error("This platform has no AI model available.");
    const res = await sessionFetch<{ choices?: { message?: { content?: string | null } }[] }>(
      `${base}/chat/completions${me}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model, messages }),
      },
    );
    const text = res.choices?.[0]?.message?.content?.trim();
    if (!text) throw new Error("The model returned no text.");
    return text;
  } catch (e) {
    // Errors come in OpenAI's envelope, `{ error: { message } }` — a 402 reads "Insufficient credits.".
    const message =
      e instanceof SessionFetchError
        ? (e.body as { error?: { message?: unknown } } | null)?.error?.message
        : undefined;
    throw typeof message === "string" && message ? new Error(message) : e;
  }
}

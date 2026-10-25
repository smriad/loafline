import { getEnv } from "./env";

const BASE = "https://app.backboard.io/api";

function headers(apiKey: string) {
  return { "X-API-Key": apiKey, "Content-Type": "application/json" };
}

export async function recallMemory(query: string): Promise<string | undefined> {
  const env = getEnv();
  if (!env.BACKBOARD_API_KEY || !env.BACKBOARD_ASSISTANT_ID) return undefined;

  const res = await fetch(
    `${BASE}/assistants/${env.BACKBOARD_ASSISTANT_ID}/memories/search`,
    {
      method: "POST",
      headers: headers(env.BACKBOARD_API_KEY),
      body: JSON.stringify({ query, limit: 3 }),
    },
  );
  if (!res.ok) return undefined;
  const data = (await res.json()) as { memories?: { content: string }[] };
  const top = data.memories?.[0]?.content;
  return top?.slice(0, 200);
}

export async function rememberCommitment(summary: string, verdict: string): Promise<void> {
  const env = getEnv();
  if (!env.BACKBOARD_API_KEY || !env.BACKBOARD_ASSISTANT_ID) return;

  await fetch(`${BASE}/assistants/${env.BACKBOARD_ASSISTANT_ID}/messages`, {
    method: "POST",
    headers: headers(env.BACKBOARD_API_KEY),
    body: JSON.stringify({
      content: `Loafline logged: ${summary}. Verdict: ${verdict}`,
      memory: "Auto",
    }),
  }).catch(() => undefined);
}

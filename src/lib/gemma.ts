import { getEnv } from "./env";
import type { CommitmentExtract } from "./types";

const SYSTEM = `You extract informal commitments from messy speech or text.
Reply with ONLY valid JSON:
{"summary":"","who":"","deadlineHint":"","stakes":""}
Keep each field under 120 characters. If unknown, use "unclear".`;

export async function extractCommitment(text: string): Promise<CommitmentExtract> {
  const env = getEnv();
  if (!env.OLLAMA_API_KEY || !env.OLLAMA_BASE_URL) {
    return {
      summary: text.slice(0, 140),
      who: "unclear",
      deadlineHint: "none stated",
      stakes: "low",
    };
  }

  const res = await fetch(`${env.OLLAMA_BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.OLLAMA_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: env.OLLAMA_CHAT_MODEL,
      temperature: 0.2,
      messages: [
        { role: "system", content: SYSTEM },
        { role: "user", content: text },
      ],
    }),
  });

  if (!res.ok) throw new Error(`Gemma request failed: ${res.status}`);
  const data = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const raw = data.choices?.[0]?.message?.content ?? "{}";
  const json = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
  try {
    return JSON.parse(json) as CommitmentExtract;
  } catch {
    const match = json.match(/\{[\s\S]*\}/);
    if (match) return JSON.parse(match[0]) as CommitmentExtract;
    return {
      summary: text.slice(0, 140),
      who: "unclear",
      deadlineHint: "none stated",
      stakes: "low",
    };
  }
}

import { getEnv } from "./env";
import { listLoafs } from "./mongodb";
import type { SlothStats } from "./types";

export async function buildSlothDigest(stats: SlothStats): Promise<string> {
  const items = await listLoafs(8);
  const bullets = items
    .map((i) => `- ${i.extract.summary} → ${i.verdict.label} (${i.verdict.safeUntil})`)
    .join("\n");

  const env = getEnv();
  const fallback = `Your sloth ledger: ${stats.total} checks, ${Math.round(stats.loafRate * 100)}% safe-to-loaf, ~${stats.minutesSavedTotal} minutes of rumination avoided.\n\nRecent:\n${bullets}`;

  if (!env.OLLAMA_API_KEY || !env.OLLAMA_BASE_URL) return fallback;

  const res = await fetch(`${env.OLLAMA_BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.OLLAMA_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: env.OLLAMA_CHAT_MODEL,
      temperature: 0.5,
      max_tokens: 220,
      messages: [
        {
          role: "system",
          content:
            "Write a 3-sentence sloth-themed morning brief. Be warm, lazy, and specific. No bullet lists.",
        },
        {
          role: "user",
          content: `Stats: ${JSON.stringify(stats)}\nCommitments:\n${bullets}`,
        },
      ],
    }),
  });

  if (!res.ok) return fallback;
  const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
  return data.choices?.[0]?.message?.content?.trim() || fallback;
}

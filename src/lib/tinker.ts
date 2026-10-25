import { getEnv } from "./env";
import type { CommitmentExtract, DeferLabel } from "./types";

export async function polishVerdict(
  extract: CommitmentExtract,
  label: DeferLabel,
  probability: number,
): Promise<{ verdictLine: string; tinyAction: string; safeUntil: string }> {
  const env = getEnv();
  const fallback = defaultCopy(extract, label);

  if (!env.TINKER_API_KEY) return fallback;

  const prompt = `Commitment: ${extract.summary}
Who: ${extract.who}. Deadline hint: ${extract.deadlineHint}. Stakes: ${extract.stakes}.
TabPFN defer class: ${label} (confidence ${(probability * 100).toFixed(0)}%).
Write JSON only: {"verdictLine":"","tinyAction":"","safeUntil":""}
verdictLine = one sloth-friendly sentence. tinyAction = smallest closing step under 15 words. safeUntil = realistic postpone date phrase.`;

  try {
    const res = await fetch(`${env.TINKER_BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.TINKER_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: env.TINKER_MODEL,
        temperature: 0.4,
        max_tokens: 200,
        messages: [{ role: "user", content: prompt }],
      }),
    });
    if (!res.ok) return fallback;
    const data = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const raw = data.choices?.[0]?.message?.content ?? "";
    const json = raw.replace(/```json\n?|\n?```/g, "").trim();
    return { ...fallback, ...JSON.parse(json) };
  } catch {
    return fallback;
  }
}

function defaultCopy(extract: CommitmentExtract, label: DeferLabel) {
  if (label === "loaf") {
    return {
      verdictLine: `You can loaf on "${extract.summary}" unless ${extract.who} pings you.`,
      tinyAction: "Send a one-line 'got it, by Friday' and close the tab.",
      safeUntil: "end of week",
    };
  }
  if (label === "this_week") {
    return {
      verdictLine: `Not emergency-tier, but "${extract.summary}" will rot if you ignore it all week.`,
      tinyAction: "Block 20 minutes before Thursday.",
      safeUntil: "Wednesday night",
    };
  }
  return {
    verdictLine: `Do not loaf: "${extract.summary}" has real deadline heat.`,
    tinyAction: "Do the smallest visible step in the next hour.",
    safeUntil: "not safely deferrable",
  };
}

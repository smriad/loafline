import { getEnv } from "./env";

export async function maybeGround(deadlineHint: string, summary: string): Promise<string | undefined> {
  const env = getEnv();
  if (!env.SERPAPI_API_KEY) return undefined;
  const q = `${deadlineHint} ${summary}`.trim().slice(0, 80);
  if (q.length < 8) return undefined;

  const url = new URL("https://serpapi.com/search.json");
  url.searchParams.set("engine", "google");
  url.searchParams.set("q", q);
  url.searchParams.set("num", "3");
  url.searchParams.set("api_key", env.SERPAPI_API_KEY);

  const res = await fetch(url);
  if (!res.ok) return undefined;
  const data = (await res.json()) as {
    answer_box?: { answer?: string; snippet?: string };
    organic_results?: { title?: string; snippet?: string }[];
  };
  if (data.answer_box?.answer) return data.answer_box.answer;
  if (data.answer_box?.snippet) return data.answer_box.snippet;
  const first = data.organic_results?.[0];
  if (first?.title && first?.snippet) return `${first.title}: ${first.snippet}`;
  return undefined;
}

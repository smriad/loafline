import { NextResponse } from "next/server";
import { runLoafline } from "@/lib/pipeline";

export const maxDuration = 180;

export async function POST(req: Request) {
  const { lines } = (await req.json()) as { lines?: string[] };
  if (!lines?.length) {
    return NextResponse.json({ error: "lines array required" }, { status: 400 });
  }
  const trimmed = lines.map((l) => l.trim()).filter(Boolean).slice(0, 5);
  const results = [];
  for (const line of trimmed) {
    results.push(await runLoafline({ text: line }));
  }
  const minutesSaved = results.reduce((s, r) => s + (r.lazyPayoffMinutes ?? 0), 0);
  return NextResponse.json({ results, minutesSaved, count: results.length });
}

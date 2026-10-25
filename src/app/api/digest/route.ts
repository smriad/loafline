import { NextResponse } from "next/server";
import { buildSlothDigest } from "@/lib/digest";
import { speakBrief } from "@/lib/elevenlabs";
import { computeSlothStats } from "@/lib/sloth-stats";

export async function POST() {
  const stats = await computeSlothStats();
  const text = await buildSlothDigest(stats);
  const audio = await speakBrief(text);
  return NextResponse.json({
    stats,
    digest: text,
    hasAudio: Boolean(audio),
  });
}

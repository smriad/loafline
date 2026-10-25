import { NextResponse } from "next/server";
import { speakBrief } from "@/lib/elevenlabs";

export async function POST(req: Request) {
  const { text } = (await req.json()) as { text?: string };
  if (!text?.trim()) {
    return NextResponse.json({ error: "text required" }, { status: 400 });
  }
  const audio = await speakBrief(text);
  if (!audio) {
    return NextResponse.json({ error: "TTS unavailable" }, { status: 503 });
  }
  return new NextResponse(new Uint8Array(audio), {
    headers: { "Content-Type": "audio/mpeg" },
  });
}

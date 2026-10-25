import { getEnv } from "./env";

export async function transcribeAudio(buffer: Buffer, mime = "audio/webm"): Promise<string> {
  const env = getEnv();
  if (!env.ELEVENLABS_API_KEY) throw new Error("ElevenLabs not configured");

  const form = new FormData();
  form.append("model_id", "scribe_v1");
  form.append("file", new Blob([new Uint8Array(buffer)], { type: mime }), "memo.webm");

  const res = await fetch("https://api.elevenlabs.io/v1/speech-to-text", {
    method: "POST",
    headers: { "xi-api-key": env.ELEVENLABS_API_KEY },
    body: form,
  });
  if (!res.ok) throw new Error(`ElevenLabs STT failed: ${res.status}`);
  const data = (await res.json()) as { text?: string };
  return (data.text ?? "").trim();
}

export async function speakBrief(text: string): Promise<Buffer | null> {
  const env = getEnv();
  if (!env.ELEVENLABS_API_KEY || !env.ELEVENLABS_VOICE_ID) return null;

  const res = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${env.ELEVENLABS_VOICE_ID}`,
    {
      method: "POST",
      headers: {
        "xi-api-key": env.ELEVENLABS_API_KEY,
        "Content-Type": "application/json",
        Accept: "audio/mpeg",
      },
      body: JSON.stringify({
        text,
        model_id: "eleven_multilingual_v2",
      }),
    },
  );
  if (!res.ok) return null;
  return Buffer.from(await res.arrayBuffer());
}

import * as Sentry from "@sentry/nextjs";
import { rememberCommitment, recallMemory } from "./backboard";
import { getEnv } from "./env";
import { demoLoaf } from "./demo";
import { extractCommitment } from "./gemma";
import { transcribeAudio } from "./elevenlabs";
import { saveLoaf } from "./mongodb";
import { maybeGround } from "./serpapi";
import { predictDefer } from "./tabpfn";
import { extractFeatures } from "./features";
import { lazyPayoffMinutes } from "./lazy-payoff";
import { buildPermissionSlip } from "./permission-slip";
import { findSimilar, storeEcho } from "./tiger";
import { polishVerdict } from "./tinker";
import type { LoafRecord, LoafVerdict } from "./types";

export type LoafInput = { text?: string; audio?: Buffer; audioMime?: string };

export async function runLoafline(input: LoafInput): Promise<LoafRecord> {
  const env = getEnv();
  const hasAudio = Boolean(input.audio?.length);
  if (env.DEMO_MODE && !hasAudio) {
    const text = input.text?.trim() || "Client wants mockups by Friday";
    return demoLoaf(text);
  }

  return Sentry.startSpan({ name: "loafline.run", op: "workflow" }, async () => {
    const started = Date.now();
    const partnersUsed: string[] = ["Render", "Mastra"];
    let text = input.text?.trim() ?? "";
    const hasVoice = hasAudio;

    if (!text && input.audio) {
      text = await transcribeAudio(input.audio, input.audioMime);
      partnersUsed.push("ElevenLabs");
    }
    if (!text) throw new Error("Provide text or voice memo");

    const extract = await extractCommitment(text);
    partnersUsed.push("Gemma");

    const tabpfnFeatures = extractFeatures(text);
    const { label, probability } = await predictDefer(text);
    partnersUsed.push("TabPFN");

    const copy = await polishVerdict(extract, label, probability);
    partnersUsed.push(env.TINKER_API_KEY ? "Tinker" : "Gemma");

    const memorySnippet = await recallMemory(extract.summary);
    if (memorySnippet) partnersUsed.push("Backboard");

    const groundingSnippet = await maybeGround(extract.deadlineHint, extract.summary);
    if (groundingSnippet) partnersUsed.push("SerpApi");

    const verdict: LoafVerdict = {
      label,
      probability,
      ...copy,
      memorySnippet,
      groundingSnippet,
    };

    const similar = await findSimilar(text);
    if (similar.length) {
      verdict.echoFromPast = similar[0];
    }

    const record: LoafRecord = {
      createdAt: new Date().toISOString(),
      inputText: text,
      extract,
      verdict,
      partnersUsed: [...new Set(partnersUsed)],
      tabpfnFeatures,
      pipelineMs: Date.now() - started,
    };
    record.lazyPayoffMinutes = lazyPayoffMinutes(record, hasVoice);
    record.permissionSlip = buildPermissionSlip(record);

    const id = await saveLoaf(record);
    record._id = id;
    partnersUsed.push("MongoDB Atlas");
    record.partnersUsed = [...new Set([...record.partnersUsed, "MongoDB Atlas"])];

    if (await storeEcho(id, text)) {
      partnersUsed.push("Tiger Data");
    }
    await rememberCommitment(extract.summary, verdict.verdictLine);

    record.partnersUsed = [...new Set(partnersUsed)];
    return record;
  });
}

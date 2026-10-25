import type { DeferLabel, LoafRecord } from "./types";

/** Rough minutes a human spends re-listening, drafting, and worrying. */
export function estimateManualMinutes(text: string, label: DeferLabel): number {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  const base = 6 + words * 0.12;
  if (label === "today") return base + 18;
  if (label === "this_week") return base + 8;
  return base + 3;
}

export function estimateLoaflineMinutes(hasVoice: boolean): number {
  return hasVoice ? 2.5 : 1.2;
}

export function lazyPayoffMinutes(record: Pick<LoafRecord, "inputText" | "verdict">, hasVoice = false): number {
  const manual = estimateManualMinutes(record.inputText, record.verdict.label);
  const automated = estimateLoaflineMinutes(hasVoice);
  return Math.max(1, Math.round(manual - automated));
}

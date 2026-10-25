import { lazyPayoffMinutes } from "./lazy-payoff";
import { buildPermissionSlip } from "./permission-slip";
import { extractFeatures } from "./features";
import type { LoafRecord } from "./types";

export function demoLoaf(text: string): LoafRecord {
  const record: LoafRecord = {
    createdAt: new Date().toISOString(),
    inputText: text,
    extract: {
      summary: "Send revised mockups to the client",
      who: "client",
      deadlineHint: "Friday",
      stakes: "contract milestone",
    },
    verdict: {
      label: "this_week",
      probability: 0.72,
      verdictLine: "Not a today fire, but the client will notice if Friday slides.",
      tinyAction: "Export v2 PNGs and send a two-line status email.",
      safeUntil: "Thursday 5pm",
      groundingSnippet: "Demo mode — connect APIs for live SerpApi grounding.",
      memorySnippet: "Demo mode — Backboard memory disabled.",
      echoFromPast: "You deferred a similar mockup pass last month.",
    },
    partnersUsed: ["Demo"],
    tabpfnFeatures: extractFeatures(text),
    pipelineMs: 120,
  };
  record.lazyPayoffMinutes = lazyPayoffMinutes(record);
  record.permissionSlip = buildPermissionSlip(record);
  return record;
}

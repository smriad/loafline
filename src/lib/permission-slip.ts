import type { LoafRecord } from "./types";

export function buildPermissionSlip(record: LoafRecord, minutesSaved?: number): string {
  const date = new Date(record.createdAt).toLocaleString();
  const saved = minutesSaved ?? record.lazyPayoffMinutes ?? 0;
  return `# Official Permission to Loaf (unofficial)

**Issued:** ${date}  
**Commitment:** ${record.extract.summary}  
**Stakeholder:** ${record.extract.who}  
**Deadline hint:** ${record.extract.deadlineHint}

## Verdict: ${record.verdict.label.replace("_", " ")}
${record.verdict.verdictLine}

**Minimum viable action:** ${record.verdict.tinyAction}  
**Safe to postpone until:** ${record.verdict.safeUntil}  
**TabPFN confidence:** ${(record.verdict.probability * 100).toFixed(0)}%

${record.verdict.echoFromPast ? `**Pattern:** ${record.verdict.echoFromPast}\n` : ""}${record.verdict.groundingSnippet ? `**Grounding:** ${record.verdict.groundingSnippet}\n` : ""}
---
*Loafline saved ~${saved} minutes of rumination this run. Open-weight Gemma + TabPFN on your terms — not a closed guilt API.*

Partners: ${record.partnersUsed.join(", ")}
`;
}

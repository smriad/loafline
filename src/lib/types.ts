import type { FeatureRow } from "./features";

export type DeferLabel = "loaf" | "this_week" | "today";

export type CommitmentExtract = {
  summary: string;
  who: string;
  deadlineHint: string;
  stakes: string;
};

export type LoafVerdict = {
  label: DeferLabel;
  probability: number;
  verdictLine: string;
  tinyAction: string;
  safeUntil: string;
  groundingSnippet?: string;
  memorySnippet?: string;
  echoFromPast?: string;
};

export type LoafRecord = {
  _id?: string;
  createdAt: string;
  inputText: string;
  extract: CommitmentExtract;
  verdict: LoafVerdict;
  partnersUsed: string[];
  tabpfnFeatures?: FeatureRow;
  lazyPayoffMinutes?: number;
  permissionSlip?: string;
  pipelineMs?: number;
};

export type SlothStats = {
  total: number;
  byLabel: Record<DeferLabel, number>;
  minutesSavedTotal: number;
  loafRate: number;
};

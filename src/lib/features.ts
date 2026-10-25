const DEADLINE = /\b(today|tomorrow|asap|eod|deadline|due|friday|monday|invoice|court|tax)\b/gi;
const STAKE = /\b(boss|client|landlord|doctor|mom|team|manager|ceo|hr)\b/gi;
const URGENT = /\b(urgent|critical|asap|immediately|overdue|final notice)\b/gi;

export type FeatureRow = {
  word_count: number;
  question_marks: number;
  deadline_words: number;
  stakeholder_words: number;
  urgency_words: number;
};

export function extractFeatures(text: string): FeatureRow {
  const words = text.trim().split(/\s+/).filter(Boolean);
  return {
    word_count: words.length,
    question_marks: (text.match(/\?/g) ?? []).length,
    deadline_words: (text.match(DEADLINE) ?? []).length,
    stakeholder_words: (text.match(STAKE) ?? []).length,
    urgency_words: (text.match(URGENT) ?? []).length,
  };
}

export function labelToDefer(n: number): "loaf" | "this_week" | "today" {
  if (n <= 0) return "loaf";
  if (n === 1) return "this_week";
  return "today";
}

export function deferToNumber(label: "loaf" | "this_week" | "today"): number {
  if (label === "loaf") return 0;
  if (label === "this_week") return 1;
  return 2;
}

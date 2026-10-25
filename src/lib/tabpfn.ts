import { readFileSync } from "fs";
import { join } from "path";
import { getEnv } from "./env";
import {
  deferToNumber,
  extractFeatures,
  labelToDefer,
  type FeatureRow,
} from "./features";
import type { DeferLabel } from "./types";

const PRIOR = "https://api.priorlabs.ai";

export async function predictDefer(
  text: string,
): Promise<{ label: DeferLabel; probability: number }> {
  const features = extractFeatures(text);
  const heuristic = heuristicPredict(features);

  const env = getEnv();
  if (!env.PRIORLABS_API_KEY) return heuristic;

  try {
    const api = await tabpfnPredict(features, env.PRIORLABS_API_KEY, env.TABPFN_FITTED_TRAIN_SET_ID);
    if (api) return api;
  } catch {
    /* fall through */
  }
  return heuristic;
}

function heuristicPredict(features: FeatureRow): { label: DeferLabel; probability: number } {
  const score =
    features.deadline_words * 0.35 +
    features.urgency_words * 0.4 +
    features.stakeholder_words * 0.15 +
    Math.min(features.word_count / 80, 1) * 0.1;
  const bucket = score < 0.35 ? 0 : score < 0.75 ? 1 : 2;
  const label = labelToDefer(bucket);
  const probability = Math.min(0.95, 0.55 + score * 0.3);
  return { label, probability };
}

async function tabpfnPredict(
  features: FeatureRow,
  apiKey: string,
  fittedId?: string,
): Promise<{ label: DeferLabel; probability: number } | null> {
  let trainId: string | null | undefined = fittedId;
  if (!trainId) trainId = await fitOnce(apiKey);
  if (!trainId) return null;

  const testCsv = featureCsvRow(features);
  const testUpload = await uploadCsv(apiKey, testCsv, trainId);
  const res = await fetch(`${PRIOR}/tabpfn/predict`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      test_set_upload_id: testUpload,
      fitted_train_set_id: trainId,
      task_config: {
        task: "classification",
        predict_params: { output_type: "probas" },
      },
    }),
  });
  if (!res.ok) return null;
  const body = (await res.json()) as { prediction?: number[][] };
  const probs = body.prediction?.[0];
  if (!probs || probs.length < 3) return null;
  const best = probs.indexOf(Math.max(...probs));
  return { label: labelToDefer(best), probability: probs[best] ?? 0.5 };
}

let fitPromise: Promise<string | null> | null = null;

async function fitOnce(apiKey: string): Promise<string | null> {
  if (!fitPromise) {
    fitPromise = (async () => {
      const trainPath = join(process.cwd(), "data", "defer_train.csv");
      const csv = readFileSync(trainPath, "utf8");
      const prep = await fetch(`${PRIOR}/tabpfn/prepare_train_set_upload`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ y_train_info: { format: "csv" }, x_train_info: { format: "csv" } }),
      });
      if (!prep.ok) return null;
      const prepBody = (await prep.json()) as {
        train_set_upload_id: string;
        y_train_info: { signed_urls: string[]; required_headers: Record<string, string> };
        x_train_info: { signed_urls: string[]; required_headers: Record<string, string> };
      };
      const lines = csv.trim().split("\n");
      const header = lines[0];
      const xRows = lines.slice(1).map((line) => {
        const cols = line.split(",");
        return cols.slice(0, -1).join(",");
      });
      const yRows = lines.slice(1).map((line) => line.split(",").pop() ?? "0");
      const xCsv = [header.split(",").slice(0, -1).join(","), ...xRows].join("\n");
      const yCsv = ["defer_label", ...yRows].join("\n");

      await putSigned(prepBody.x_train_info.signed_urls[0], xCsv, prepBody.x_train_info.required_headers);
      await putSigned(prepBody.y_train_info.signed_urls[0], yCsv, prepBody.y_train_info.required_headers);

      const fitRes = await fetch(`${PRIOR}/tabpfn/fit`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          train_set_upload_id: prepBody.train_set_upload_id,
          task_config: { task: "classification", tabpfn_config: { model_path: "auto" } },
        }),
      });
      if (!fitRes.ok) return null;
      const fitBody = (await fitRes.json()) as { fitted_train_set_id?: string };
      return fitBody.fitted_train_set_id ?? null;
    })();
  }
  return fitPromise;
}

async function uploadCsv(
  apiKey: string,
  csv: string,
  fittedTrainSetId: string,
): Promise<string> {
  const prep = await fetch(`${PRIOR}/tabpfn/prepare_test_set_upload`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      fitted_train_set_id: fittedTrainSetId,
      x_test_info: { format: "csv" },
    }),
  });
  if (!prep.ok) throw new Error("tabpfn test prep failed");
  const prepBody = (await prep.json()) as {
    test_set_upload_id: string;
    x_test_info: { signed_urls: string[]; required_headers: Record<string, string> };
  };
  await putSigned(prepBody.x_test_info.signed_urls[0], csv, prepBody.x_test_info.required_headers);
  return prepBody.test_set_upload_id;
}

function featureCsvRow(f: FeatureRow): string {
  return [
    "word_count,question_marks,deadline_words,stakeholder_words,urgency_words",
    `${f.word_count},${f.question_marks},${f.deadline_words},${f.stakeholder_words},${f.urgency_words}`,
  ].join("\n");
}

async function putSigned(url: string, body: string, headers: Record<string, string>) {
  const res = await fetch(url, { method: "PUT", headers, body });
  if (!res.ok) throw new Error(`upload failed ${res.status}`);
}

export { deferToNumber };

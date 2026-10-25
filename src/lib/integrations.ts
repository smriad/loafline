import { getEnv } from "./env";

export type PartnerStatus = {
  id: string;
  name: string;
  category: string;
  configured: boolean;
  role: string;
};

/** Env vars you must set on Render (Dashboard → Environment). Values never exposed to the client. */
export function listMissingSecretEnvKeys(): string[] {
  const env = getEnv();
  const required: { key: string; ok: boolean }[] = [
    { key: "OLLAMA_API_KEY", ok: Boolean(env.OLLAMA_API_KEY) },
    { key: "OLLAMA_BASE_URL", ok: Boolean(env.OLLAMA_BASE_URL) },
    { key: "PRIORLABS_API_KEY", ok: Boolean(env.PRIORLABS_API_KEY) },
    { key: "TINKER_API_KEY", ok: Boolean(env.TINKER_API_KEY) },
    { key: "MONGODB_URI", ok: Boolean(env.MONGODB_URI) },
    { key: "TIGER_DATABASE_URL", ok: Boolean(env.TIGER_DATABASE_URL) },
    { key: "ELEVENLABS_API_KEY", ok: Boolean(env.ELEVENLABS_API_KEY) },
    { key: "SENTRY_DSN", ok: Boolean(env.SENTRY_DSN) },
    { key: "SERPAPI_API_KEY", ok: Boolean(env.SERPAPI_API_KEY) },
    { key: "BACKBOARD_API_KEY", ok: Boolean(env.BACKBOARD_API_KEY) },
    { key: "BACKBOARD_ASSISTANT_ID", ok: Boolean(env.BACKBOARD_ASSISTANT_ID) },
  ];
  const tinkerModel = Boolean(env.TINKER_MODEL ?? env.TINKER_BRIEF_MODEL);
  if (!tinkerModel && env.TINKER_API_KEY) {
    required.push({ key: "TINKER_MODEL or TINKER_BRIEF_MODEL", ok: false });
  }
  return required.filter((r) => !r.ok).map((r) => r.key);
}

export function listPartnerStatus(): PartnerStatus[] {
  const env = getEnv();
  const tinkerReady = Boolean(
    env.TINKER_API_KEY && (env.TINKER_MODEL ?? env.TINKER_BRIEF_MODEL),
  );
  return [
    {
      id: "render",
      name: "Render",
      category: "Featured",
      configured: true,
      role: "Hosts the app + API",
    },
    {
      id: "gemma",
      name: "Gemma",
      category: "Featured",
      configured: Boolean(env.OLLAMA_API_KEY && env.OLLAMA_BASE_URL),
      role: "Open-weight extraction",
    },
    {
      id: "tabpfn",
      name: "TabPFN",
      category: "Featured",
      configured: Boolean(env.PRIORLABS_API_KEY),
      role: "Defer-risk classification",
    },
    {
      id: "tinker",
      name: "Tinker",
      category: "Featured",
      configured: tinkerReady,
      role: "Verdict copy polish",
    },
    {
      id: "mongodb",
      name: "MongoDB Atlas",
      category: "Partner",
      configured: Boolean(env.MONGODB_URI),
      role: "Commitment ledger",
    },
    {
      id: "tiger",
      name: "Tiger Data",
      category: "Partner",
      configured: Boolean(env.TIGER_DATABASE_URL),
      role: "pgvector echo search",
    },
    {
      id: "elevenlabs",
      name: "ElevenLabs",
      category: "Partner",
      configured: Boolean(env.ELEVENLABS_API_KEY),
      role: "Voice in + verdict TTS",
    },
    {
      id: "backboard",
      name: "Backboard",
      category: "Partner",
      configured: Boolean(env.BACKBOARD_API_KEY && env.BACKBOARD_ASSISTANT_ID),
      role: "Cross-session memory",
    },
    {
      id: "serpapi",
      name: "SerpApi",
      category: "Partner",
      configured: Boolean(env.SERPAPI_API_KEY),
      role: "Deadline grounding",
    },
    {
      id: "sentry",
      name: "Sentry",
      category: "Partner",
      configured: Boolean(env.SENTRY_DSN),
      role: "Agent pipeline traces",
    },
    {
      id: "mastra",
      name: "Mastra",
      category: "Partner",
      configured: true,
      role: "Workflow orchestration",
    },
  ];
}

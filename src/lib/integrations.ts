import { getEnv } from "./env";

export type PartnerStatus = {
  id: string;
  name: string;
  category: string;
  configured: boolean;
  role: string;
};

export function listPartnerStatus(): PartnerStatus[] {
  const env = getEnv();
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
      configured: Boolean(env.OLLAMA_API_KEY),
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
      configured: Boolean(env.TINKER_API_KEY),
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

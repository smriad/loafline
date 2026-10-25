import { z } from "zod";

const schema = z.object({
  DEMO_MODE: z
    .string()
    .optional()
    .transform((v) => v === "true"),
  OLLAMA_BASE_URL: z.string().optional(),
  OLLAMA_API_KEY: z.string().optional(),
  OLLAMA_CHAT_MODEL: z.string().default("google/gemma-3-4b-it"),
  TINKER_API_KEY: z.string().optional(),
  TINKER_BASE_URL: z
    .string()
    .default("https://tinker.thinkingmachines.dev/services/tinker-prod/oai/api/v1"),
  TINKER_MODEL: z.string().default("thinkingmachines/Inkling"),
  PRIORLABS_API_KEY: z.string().optional(),
  TABPFN_FITTED_TRAIN_SET_ID: z.string().optional(),
  MONGODB_URI: z.string().optional(),
  MONGODB_DB: z.string().default("loafline"),
  TIGER_DATABASE_URL: z.string().optional(),
  ELEVENLABS_API_KEY: z.string().optional(),
  ELEVENLABS_VOICE_ID: z.string().optional(),
  SENTRY_DSN: z.string().optional(),
  SERPAPI_API_KEY: z.string().optional(),
  BACKBOARD_API_KEY: z.string().optional(),
  BACKBOARD_ASSISTANT_ID: z.string().optional(),
});

export type AppEnv = z.infer<typeof schema>;

let cached: AppEnv | null = null;

export function getEnv(): AppEnv {
  if (!cached) cached = schema.parse(process.env);
  return cached;
}

import { createWorkflow, createStep } from "@mastra/core/workflows";
import { z } from "zod";
import { runLoafline } from "@/lib/pipeline";

const inputSchema = z.object({
  text: z.string().optional(),
  audioBase64: z.string().optional(),
  audioMime: z.string().optional(),
});

const loafStep = createStep({
  id: "loaf",
  inputSchema,
  outputSchema: z.any(),
  execute: async ({ inputData }) => {
    const audio = inputData.audioBase64
      ? Buffer.from(inputData.audioBase64, "base64")
      : undefined;
    return runLoafline({
      text: inputData.text,
      audio,
      audioMime: inputData.audioMime,
    });
  },
});

export const loafWorkflow = createWorkflow({
  id: "loafline",
  inputSchema,
  outputSchema: z.any(),
})
  .then(loafStep)
  .commit();

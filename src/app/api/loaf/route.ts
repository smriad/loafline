import { NextResponse } from "next/server";
import { mastra } from "@/mastra";

export const maxDuration = 120;

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      text?: string;
      audioBase64?: string;
      audioMime?: string;
    };
    const workflow = mastra.getWorkflow("loafWorkflow");
    const run = await workflow.createRun();
    const outcome = await run.start({ inputData: body });
    if (outcome.status !== "success") {
      throw new Error(outcome.status === "failed" ? String(outcome.error) : "Workflow failed");
    }
    return NextResponse.json(outcome.result);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Loaf failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

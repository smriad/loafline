import { NextResponse } from "next/server";
import { computeSlothStats } from "@/lib/sloth-stats";

export async function GET() {
  const stats = await computeSlothStats();
  return NextResponse.json(stats);
}

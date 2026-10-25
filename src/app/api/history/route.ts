import { NextResponse } from "next/server";
import { listLoafs } from "@/lib/mongodb";

export async function GET() {
  const items = await listLoafs();
  return NextResponse.json({ items });
}

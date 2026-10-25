import { NextResponse } from "next/server";
import { listPartnerStatus } from "@/lib/integrations";

export async function GET() {
  const partners = listPartnerStatus();
  const configured = partners.filter((p) => p.configured).length;
  return NextResponse.json({
    partners,
    configured,
    total: partners.length,
  });
}

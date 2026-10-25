import { NextResponse } from "next/server";
import { listMissingSecretEnvKeys, listPartnerStatus } from "@/lib/integrations";

export async function GET() {
  const partners = listPartnerStatus();
  const configured = partners.filter((p) => p.configured).length;
  const missingEnv = listMissingSecretEnvKeys();
  return NextResponse.json({
    partners,
    configured,
    total: partners.length,
    missingEnv,
    onRender: Boolean(process.env.RENDER),
  });
}

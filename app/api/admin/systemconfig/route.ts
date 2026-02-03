import { NextResponse } from "next/server";
import { DEFAULT_SYSTEM_CONFIG } from "@/lib/systemconfig";

let SYSTEM_CONFIG = structuredClone(DEFAULT_SYSTEM_CONFIG);

/**
 * GET: fetch system config
 */
export async function GET() {
  return NextResponse.json(SYSTEM_CONFIG);
}

/**
 * PUT: update system config
 */
export async function PUT(req: Request) {
  const body = await req.json();
  SYSTEM_CONFIG = body;
  return NextResponse.json({ success: true });
}

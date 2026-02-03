import { NextRequest, NextResponse } from "next/server";

const FALLBACK_ADMIN_EMAIL = "admin@example.com";
const FALLBACK_ADMIN_PASSWORD = "password123";

function getClientIp(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for") ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

export async function POST(request: NextRequest) {
  const { email, password } = await request.json();

  const adminEmail = process.env.ADMIN_EMAIL || FALLBACK_ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD || FALLBACK_ADMIN_PASSWORD;

  const isValid =
    typeof email === "string" &&
    typeof password === "string" &&
    email === adminEmail &&
    password === adminPassword;

  if (!isValid) {
    return NextResponse.json(
      { success: false, message: "Invalid email or password" },
      { status: 401 },
    );
  }

  // Simple session token – for production, replace with a signed JWT or proper session store.
  const sessionToken =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2);

  // Basic audit-style log (can be replaced with a real logging solution).
  console.info("Admin login", {
    email,
    time: new Date().toISOString(),
    ip: getClientIp(request),
  });

  const response = NextResponse.json({ success: true });

  response.cookies.set("admin_session", sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8, // 8 hours
  });

  return response;
}



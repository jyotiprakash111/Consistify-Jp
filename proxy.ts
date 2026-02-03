import { NextRequest, NextResponse } from "next/server";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isLoginPath = pathname === "/login";
  const isDashboardPath = pathname.startsWith("/dashboard");
  const isUsersPath = pathname.startsWith("/users");
  const isAnalyticsPath = pathname.startsWith("/analytics");
  const isWalletPath = pathname.startsWith("/wallet");
  const isBadgesPath = pathname.startsWith("/badges");
  const isSettingsPath = pathname.startsWith("/settings");
  const isLogsPath = pathname.startsWith("/logs");

  // Only guard login and admin routes for now.
  if (
    !isDashboardPath &&
    !isLoginPath &&
    !isUsersPath &&
    !isAnalyticsPath &&
    !isWalletPath &&
    !isBadgesPath &&
    !isSettingsPath &&
    !isLogsPath
  ) {
    return NextResponse.next();
  }

  const session = request.cookies.get("admin_session")?.value;

  // If not authenticated and trying to access protected routes, redirect to login.
  if (
    !session &&
    (isDashboardPath ||
      isUsersPath ||
      isAnalyticsPath ||
      isWalletPath ||
      isBadgesPath ||
      isSettingsPath ||
      isLogsPath)
  ) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If already authenticated and on login page, push to dashboard.
  if (session && isLoginPath) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/login",
    "/dashboard/:path*",
    "/users/:path*",
    "/analytics/:path*",
    "/wallet/:path*",
    "/badges/:path*",
    "/settings/:path*",
    "/logs/:path*",
  ],
};


import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { refreshSession } from "@/lib/supabase/middleware";
import { hasSupabaseEnvironment } from "@/lib/supabase/env";

/** Paths accessible without authentication. */
const PUBLIC_PATHS = new Set(["/", "/login"]);

export async function middleware(request: NextRequest) {
  const { response, user } = await refreshSession(request);
  const pathname = request.nextUrl.pathname;

  // Auth callback must always pass through.
  if (pathname.startsWith("/auth/")) {
    return response;
  }

  // Allow preview mode when environment is not fully configured or preview flag is active
  const isPreviewMode =
    request.nextUrl.searchParams.get("preview") === "true" ||
    request.cookies.get("btms-preview")?.value === "true" ||
    !hasSupabaseEnvironment();

  if (isPreviewMode) {
    // If preview query parameter was provided, persist it in a cookie
    if (request.nextUrl.searchParams.get("preview") === "true") {
      const res = NextResponse.next();
      res.cookies.set("btms-preview", "true", { path: "/" });
      return res;
    }
    return response;
  }

  // Redirect unauthenticated users to the login page (except public pages).
  if (!user && !PUBLIC_PATHS.has(pathname)) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect authenticated users away from the login page.
  if (user && pathname === "/login") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};

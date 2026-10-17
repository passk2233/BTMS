import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

import type { User } from "@supabase/supabase-js";

import type { Database } from "@/types/database.types";

import { getSupabaseEnvironment, hasSupabaseEnvironment } from "./env";

interface SessionResult {
  response: NextResponse;
  user: User | null;
}

/**
 * Refreshes the Supabase session and returns both the response (with updated
 * cookies) and the authenticated user. Used by the root Next.js middleware for
 * session management **and** route protection.
 */
export async function refreshSession(request: NextRequest): Promise<SessionResult> {
  let response = NextResponse.next({ request });

  if (!hasSupabaseEnvironment()) {
    return { response, user: null };
  }

  const { url, publishableKey } = getSupabaseEnvironment();
  const supabase = createServerClient<Database>(url, publishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return { response, user };
}

/**
 * Legacy helper — kept for backwards compatibility with code that only needs
 * the response object.
 */
export async function updateSession(request: NextRequest) {
  const { response } = await refreshSession(request);
  return response;
}

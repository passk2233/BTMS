import { type NextRequest, NextResponse } from "next/server";

import { hasSupabaseEnvironment } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

function getSafeNextPath(value: string | null, origin: string): string {
  if (!value) {
    return "/dashboard";
  }

  const candidate = new URL(value, origin);

  return candidate.origin === origin ? candidate.pathname + candidate.search + candidate.hash : "/dashboard";
}

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");

  if (code && hasSupabaseEnvironment()) {
    const supabase = await createClient();
    await supabase.auth.exchangeCodeForSession(code);
  }

  return NextResponse.redirect(new URL(getSafeNextPath(url.searchParams.get("next"), url.origin), url.origin));
}

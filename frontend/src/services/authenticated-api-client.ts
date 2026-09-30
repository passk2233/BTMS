"use client";

import { createClient } from "@/lib/supabase/client";

import { apiFetch, type ApiRequestOptions } from "./api-client";

export async function authenticatedApiFetch<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  const supabase = createClient();
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error) {
    throw error;
  }

  return apiFetch<T>(path, {
    ...options,
    accessToken: session?.access_token,
  });
}

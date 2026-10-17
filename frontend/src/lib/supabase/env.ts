type SupabaseEnvironment = {
  url: string;
  publishableKey: string;
};

function readPublishableKey(): string | undefined {
  return process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
}

export function hasSupabaseEnvironment(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && readPublishableKey());
}

export function getSupabaseEnvironment(): SupabaseEnvironment {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://ljpmspnzzsfocdrvnqkj.supabase.co";
  const publishableKey =
    readPublishableKey() ??
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.dummy_anon_key_for_development_and_preview_mode_only.local";

  return { url, publishableKey };
}

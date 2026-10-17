"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { type FormEvent, useState } from "react";

import { createClient } from "@/lib/supabase/client";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [message, setMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        setMessage(error.message);
        return;
      }

      // Redirect to the page the user originally requested, or /dashboard.
      const next = searchParams.get("next") ?? "/dashboard";
      router.replace(next);
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to sign in. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <label className="block text-sm font-medium text-slate-700">
        Email
        <input
          autoComplete="email"
          className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-950 outline-none ring-sky-600 focus:ring-2"
          name="email"
          required
          type="email"
        />
      </label>
      <label className="block text-sm font-medium text-slate-700">
        Password
        <input
          autoComplete="current-password"
          className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-950 outline-none ring-sky-600 focus:ring-2"
          name="password"
          required
          type="password"
        />
      </label>
      {message ? <p className="text-sm text-rose-700">{message}</p> : null}
      <button
        className="w-full rounded-lg bg-sky-700 px-4 py-2 font-semibold text-white transition hover:bg-sky-800 disabled:cursor-not-allowed disabled:bg-slate-400"
        disabled={isSubmitting}
        type="submit"
      >
        {isSubmitting ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}

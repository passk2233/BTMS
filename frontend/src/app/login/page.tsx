import Link from "next/link";
import { Suspense } from "react";

import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-12">
      <Link className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-700" href="/">
        BTMS
      </Link>
      <h1 className="mt-6 text-3xl font-bold tracking-tight text-slate-950">Sign in</h1>
      <p className="mt-2 text-slate-600">Use your Supabase account to continue to BTMS.</p>
      <div className="mt-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <Suspense>
          <LoginForm />
        </Suspense>
      </div>
    </main>
  );
}

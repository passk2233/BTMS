import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col justify-center gap-6 px-6">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-700">404</p>
      <h1 className="text-4xl font-bold text-slate-950">Page not found</h1>
      <p className="text-slate-600">The BTMS route you requested does not exist.</p>
      <Link className="font-semibold text-sky-700 hover:text-sky-800" href="/">
        Return home
      </Link>
    </main>
  );
}

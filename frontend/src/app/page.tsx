import Link from "next/link";

const modules = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/thesis", label: "Thesis management" },
  { href: "/examination", label: "Examinations" },
  { href: "/finance", label: "Finance" },
];

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col justify-center gap-10 px-6 py-16">
      <section className="max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-700">BTMS</p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">
          Bachelor&apos;s Thesis Examination &amp; Financial Management System
        </h1>
        <p className="mt-5 text-lg leading-8 text-slate-600">
          A Next.js application shell for thesis workflows, examinations, progress tracking, finance,
          disbursements, printing, and reporting.
        </p>
      </section>

      <div className="flex flex-wrap gap-3">
        <Link
          className="rounded-lg bg-sky-700 px-4 py-2 font-semibold text-white transition hover:bg-sky-800"
          href="/login"
        >
          Sign in
        </Link>
        {modules.map((module) => (
          <Link
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 font-medium text-slate-700 transition hover:border-sky-700 hover:text-sky-700"
            href={module.href}
            key={module.href}
          >
            {module.label}
          </Link>
        ))}
      </div>
    </main>
  );
}

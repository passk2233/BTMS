import Link from "next/link";

type ModulePageProps = {
  title: string;
  description: string;
  capabilities: readonly string[];
};

const navigation = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/thesis", label: "Thesis" },
  { href: "/examination", label: "Examination" },
  { href: "/progress", label: "Progress" },
  { href: "/finance", label: "Finance" },
  { href: "/printing", label: "Printing" },
  { href: "/reports", label: "Reports" },
  { href: "/users", label: "Users" },
];

export function ModulePage({ title, description, capabilities }: ModulePageProps) {
  return (
    <main className="mx-auto min-h-screen max-w-6xl px-6 py-10">
      <header className="flex flex-col gap-6 border-b border-slate-200 pb-8">
        <div>
          <Link className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-700" href="/">
            BTMS
          </Link>
          <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-950">{title}</h1>
          <p className="mt-3 max-w-2xl text-lg leading-8 text-slate-600">{description}</p>
        </div>
        <nav aria-label="Primary navigation" className="flex flex-wrap gap-x-5 gap-y-2 text-sm font-medium">
          {navigation.map((item) => (
            <Link className="text-slate-600 hover:text-sky-700" href={item.href} key={item.href}>
              {item.label}
            </Link>
          ))}
        </nav>
      </header>

      <section className="mt-10 rounded-xl border border-dashed border-slate-300 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-950">Module scaffold</h2>
        <p className="mt-2 text-slate-600">
          Connect forms and commands here to the Go API. Business calculations and state transitions remain
          server-side.
        </p>
        <ul className="mt-5 grid gap-3 sm:grid-cols-2">
          {capabilities.map((capability) => (
            <li className="rounded-lg bg-slate-50 px-4 py-3 text-sm text-slate-700" key={capability}>
              {capability}
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}

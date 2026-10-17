import Link from "next/link";
import {
  GraduationCap,
  ShieldCheck,
  CalendarCheck,
  Receipt,
  Printer,
  TrendingUp,
  ArrowRight,
  BookOpen,
  FileCheck2,
  Users2,
  Lock,
} from "lucide-react";

export default function HomePage() {
  const workflows = [
    {
      role: "Academic Governance",
      tag: "ບົດໂຄງການ",
      title: "ຄຸ້ມຄອງຫົວຂໍ້ບົດໂຄງການ ແລະ ອາຈານທີ່ປຶກສາ",
      description:
        "ລົງທະບຽນກຸ່ມນັກສຶກສາ, ສະເໜີຫົວຂໍ້ສອງພາສາ (ລາວ/ອັງກິດ), ຄວບຄຸມໂຄຕາອາຈານທີ່ປຶກສາ, ແລະ ກວດສອບສະບັບປັບປຸງແບບແຍກໜ້າຈໍ.",
      icon: BookOpen,
      href: "/thesis",
      highlight: "8 ລະດັບສະຖານະ",
    },
    {
      role: "Examination Hub",
      tag: "ຫ້ອງສອບເສັງ",
      title: "ສູນສອບປ້ອງກັນໂຄງຮ່າງ ແລະ ບົດຈົບຊັ້ນ",
      description:
        "ຈັດຕາຕະລາງຫ້ອງສອບ, ແຕ່ງຕັ້ງຄະນະກຳມະການ, ລະບົບໃຫ້ຄະແນນເກນຣູບຣິກແບບເວລາຈິງ ແລະ ລວມຜົນຄະແນນອັດຕະໂນມັດ.",
      icon: CalendarCheck,
      href: "/examination",
      highlight: "ເກນຣູບຣິກຖ່ວງນ້ຳໜັກ",
    },
    {
      role: "Real-time Tracking",
      tag: "ຄວາມຄືບໜ້າ",
      title: "ຕິດຕາມຄວາມຄືບໜ້າ ແລະ ໄລຍະພັດທະນາ",
      description:
        "ຕິດຕາມ 8 ຂັ້ນຕອນຂອງບົດໂຄງການຈົບຊັ້ນ ພ້ອມລາຍລະອຽດການພັດທະນາລະບົບ (Requirements, Design, Engineering, Testing).",
      icon: TrendingUp,
      href: "/progress",
      highlight: "ຊິງຄ໌ Realtime",
    },
    {
      role: "Financial Reconciliation",
      tag: "ການເງິນ",
      title: "ກວດສອບສະລິບໂອນເງິນ ແລະ ຈ່າຍຄ່າຕອບແທນ",
      description:
        "ກວດສອບສະລິບໂອນເງິນຄ່າທຳນຽມຂອງນັກສຶກສາແບບ Split-screen, ອອກໃບຮັບເງິນທາງການ, ແລະ ຈ່າຍເງິນຕອບແທນກຳມະການສອບ.",
      icon: Receipt,
      href: "/finance",
      highlight: "ບັນທຶກ Audit Log",
    },
    {
      role: "Print Production",
      tag: "ໂຮງພິມ",
      title: "ຈັດການຄິວໂຮງພິມ ແລະ ເຂົ້າຮູບເຫຼັ້ມປົກແຂງ",
      description:
        "ຄຳນວນລາຄາພິມບົດອັດຕະໂນມັດ (ໜ້າຂາວດຳ, ໜ້າສີ, ເຂົ້າຮູບເຫຼັ້ມປົກແຂງປ້ຳຄຳ) ແລະ ຕິດຕາມສະຖານະການຜະລິດຜ່ານ Kanban.",
      icon: Printer,
      href: "/printing",
      highlight: "ຄຳນວນຄ່າພິມອັດຕະໂນມັດ",
    },
    {
      role: "Security & Auditing",
      tag: "ຄວາມປອດໄພ",
      title: "ລະບົບສິດທິຜູ້ໃຊ້ ແລະ ບັນທຶກປະຫວັດຄວາມປອດໄພ",
      description:
        "ຮອງຮັບ 7 ບົດບາດທາງວິຊາການ ດ້ວຍການກວດສອບ JWT JWKS ແລະ ບັນທຶກທຸກທຸລະກຳລົງໃນ audit_logs ທີ່ບໍ່ສາມາດດັດແກ້ໄດ້.",
      icon: ShieldCheck,
      href: "/dashboard",
      highlight: "7 ບົດບາດ RBAC",
    },
  ];

  const systemMetrics = [
    { label: "ບົດບາດໃນລະບົບ (Roles)", value: "7 Granular Roles", detail: "Staff, Head, Advisor, Committee, Student, Finance, Printing" },
    { label: "ຂັ້ນຕອນບົດໂຄງການ", value: "8-Stage Pipeline", detail: "ຕັ້ງແຕ່ເລີ່ມສະເໜີຫົວຂໍ້ ຈົນເຖິງສົ່ງຮູບເຫຼັ້ມສົມບູນ" },
    { label: "ມາດຕະຖານຖານຂໍ້ມູນ", value: "Single Source of Truth", detail: "Go/Gin API Transactions + Immutable Audit Logs" },
    { label: "ຮູບແບບເອກະສານທາງການ", value: "Lao University Roster", detail: "ພິມຕາຕະລາງລາຍຊື່ທາງການຖືກຕ້ອງຕາມມາດຕະຖານ" },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans">
      {/* Top Navigation */}
      <header className="border-b border-slate-800 bg-slate-950/90 backdrop-blur-md sticky top-0 z-30">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-600 text-white shadow-sm">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div>
              <span className="text-base font-bold tracking-tight text-white flex items-center gap-2">
                BTMS
                <span className="text-[11px] font-mono uppercase px-2 py-0.5 rounded bg-slate-800 text-sky-400 border border-slate-700">
                  Lao Academic Edition
                </span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="rounded-lg px-3.5 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors"
            >
              ເຂົ້າສູ່ລະບົບ (Sign In)
            </Link>
            <Link
              href="/dashboard?preview=true"
              className="inline-flex items-center gap-2 rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-500 active:bg-sky-700"
            >
              ເຂົ້າສູ່ພື້ນທີ່ເຮັດວຽກ
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="mx-auto max-w-5xl px-6 pt-20 pb-16 text-center">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-tight">
          ລະບົບຄຸ້ມຄອງການປ້ອງກັນບົດໂຄງການຈົບຊັ້ນ ແລະ{" "}
          <span className="text-sky-400">
            ການຄຸ້ມຄອງການເງິນ
          </span>
        </h1>
        <p className="mt-6 text-lg sm:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
          ແພລດຟອມລວມສູນມາດຕະຖານວິຊາການສຳລັບການຈັດການການປ້ອງກັນບົດໂຄງການຂອງນັກສຶກສາ, ລະບົບໃຫ້ຄະແນນຂອງຄະນະກຳມະການສອບ,
          ກວດສອບສະລິບໂອນເງິນຄ່າທຳນຽມ ແລະ ການເບີກຈ່າຍເງິນຕອບແທນອາຈານຢ່າງໂປ່ງໃສ.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/dashboard?preview=true"
            className="inline-flex items-center gap-2 rounded-lg bg-sky-600 px-6 py-3.5 text-sm font-semibold text-white hover:bg-sky-500 transition shadow-sm active:bg-sky-700"
          >
            ເປີດແຜງຄວບຄຸມຫຼັກ (Dashboard)
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/thesis?preview=true"
            className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-900 px-6 py-3.5 text-sm font-semibold text-slate-200 hover:bg-slate-800 hover:text-white transition"
          >
            ສຳຫຼວດລາຍການບົດໂຄງການ
          </Link>
        </div>
      </section>

      {/* Institutional Architecture Metrics */}
      <section className="border-y border-slate-800 bg-slate-900/60 py-8">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {systemMetrics.map((metric) => (
              <div key={metric.label} className="border-l-2 border-sky-500 pl-4 py-1">
                <span className="text-xs font-medium uppercase tracking-wider text-slate-400">{metric.label}</span>
                <p className="mt-1 text-base font-bold text-white font-mono">{metric.value}</p>
                <p className="mt-0.5 text-xs text-slate-400 leading-snug">{metric.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature / Workflow Grid */}
      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="mb-10 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">ໂຄງສ້າງການເຮັດວຽກທີ່ຄົບວົງຈອນ</h2>
          <p className="text-slate-400 text-sm mt-2 max-w-2xl mx-auto">
            ອອກແບບໂດຍສະເພາະສຳລັບມະຫາວິທະຍາໄລ ແລະ ສະຖາບັນການສຶກສາຊັ້ນສູງ ເພື່ອຄວາມໂປ່ງໃສ ແລະ ຄວາມຖືກຕ້ອງທາງວິຊາການ
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {workflows.map((feat) => {
            const Icon = feat.icon;
            return (
              <Link
                key={feat.title}
                href={feat.href}
                className="group rounded-xl border border-slate-800 bg-slate-900/80 p-6 transition hover:border-slate-700 hover:bg-slate-900 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-800 text-sky-400 group-hover:bg-sky-600 group-hover:text-white transition-colors">
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                      {feat.highlight}
                    </span>
                  </div>
                  <h3 className="text-base font-semibold text-white group-hover:text-sky-300 transition-colors">
                    {feat.title}
                  </h3>
                  <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                    {feat.description}
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-mono">{feat.role}</span>
                  <span className="inline-flex items-center gap-1 font-semibold text-sky-400 group-hover:text-sky-300">
                    ເຂົ້າສູ່ລະບົບ
                    <ArrowRight className="h-3 w-3" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Dual Language & Official Printing Standard Note */}
      <section className="mx-auto max-w-7xl px-6 pb-16">
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-8 sm:p-10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
            <div className="lg:col-span-2">
              <div className="flex items-center gap-2 text-sky-400 text-sm font-semibold mb-2">
                <FileCheck2 className="h-4 w-4" />
                <span>ມາດຕະຖານການພິມເອກະສານທາງການ (Official University Roster Standards)</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                ຮອງຮັບການພິມໃບລາຍຊື່ຄະນະກຳມະການ ແລະ ຕາຕະລາງປ້ອງກັນບົດໂຄງການ
              </h3>
              <p className="mt-3 text-sm text-slate-300 leading-relaxed">
                ລະບົບອອກແບບຕາຕະລາງລາຍງານທາງການທີ່ກົງກັບແບບຟອມມະຫາວິທະຍາໄລ: ຖັນກຸ່ມ, ຫ້ອງ, ຊື່ຫົວຂໍ້ບົດໂຄງການສອງພາສາ,
                ຊື່ອາຈານທີ່ປຶກສາ, ແລະ ໝາຍເຫດສະເພາະສຳລັບນັກສຶກສາຕົກຮຸ່ນ ຫຼື ຕ່າງຫ້ອງ ພ້ອມພິມອອກເປັນເອກະສານ PDF ໄດ້ທັນທີ.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row lg:flex-col gap-3 justify-center">
              <Link
                href="/examination/roster?preview=true"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-800 border border-slate-700 px-4 py-2.5 text-xs font-semibold text-slate-200 hover:bg-slate-700 hover:text-white transition"
              >
                <Users2 className="h-4 w-4 text-sky-400" />
                ເບິ່ງຕົວຢ່າງຕາຕະລາງລາຍຊື່ທາງການ
              </Link>
              <Link
                href="/dashboard?preview=true"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-sky-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-sky-500 transition"
              >
                <Lock className="h-4 w-4" />
                ເຂົ້າສູ່ລະບົບຄຸ້ມຄອງ
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-950 py-8 text-center text-xs text-slate-400">
        <div className="mx-auto max-w-7xl px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 ລະບົບຄຸ້ມຄອງບົດໂຄງການຈົບຊັ້ນ (BTMS - Laos Edition). ສະຫງວນລິຂະສິດ.</p>
          <div className="flex items-center gap-4 text-slate-400 font-mono text-[11px]">
            <span>Next.js 15 App Router</span>
            <span>•</span>
            <span>Go 1.26 API</span>
            <span>•</span>
            <span>Supabase PostgreSQL</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

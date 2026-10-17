"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  CalendarCheck,
  Receipt,
  Printer,
  Plus,
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertTriangle,
  FileText,
  User,
  ExternalLink,
  FileCheck2,
  BarChart3,
} from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { StatCard } from "@/components/ui/stat-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Stepper, StepItem } from "@/components/ui/stepper";
import { useAuth } from "@/components/auth-provider";
import { ProposalTrackingDashboard } from "@/components/dashboard/proposal-tracking-dashboard";

export default function DashboardPage() {
  const { profile } = useAuth();
  const [dashboardView, setDashboardView] = useState<"PROPOSAL_PIPELINE" | "GENERAL">("PROPOSAL_PIPELINE");

  // 8-Stage Thesis Milestones in Lao
  const activeMilestonesLao: StepItem[] = [
    { id: "1", name: "ຫົວຂໍ້", status: "complete", date: "12 ສ.ຫ." },
    { id: "2", name: "ກວດສອບ", status: "complete", date: "24 ສ.ຫ." },
    { id: "3", name: "ສອບໂຄງຮ່າງ", status: "complete", date: "15 ກ.ຍ." },
    { id: "4", name: "ອະນຸມັດ", status: "complete", date: "20 ກ.ຍ." },
    { id: "5", name: "ພັດທະນາ", status: "current", date: "ເປົ້າໝາຍ ພ.ຈ." },
    { id: "6", name: "ສອບຈົບຊັ້ນ", status: "upcoming" },
    { id: "7", name: "ປັບປຸງ", status: "upcoming" },
    { id: "8", name: "ສຳເລັດ", status: "upcoming" },
  ];

  const recentTheses = [
    {
      id: "TH-2026-001",
      titleLao: "ລະບົບກວດຈັບຮອຍຮົ່ວທໍ່ສົ່ງອາຍແກັສດ້ວຍໂດຣນອັດຕະໂນມັດ",
      titleEn: "Autonomous UAV Pipeline Leak Detection",
      student: "ທ້າວ ອາລຸນ ເຊັນ (65010042) + 2 ສະມາຊິກ",
      advisor: "ຮສ. ດຣ. ສົມຊາຍ ປະເສີດ",
      status: "DEVELOPMENT",
      badgeVariant: "sky" as const,
      statusLabel: "ກຳລັງພັດທະນາລະບົບ (60%)",
    },
    {
      id: "TH-2026-002",
      titleLao: "ການຈຳແນກອາລົມຈາກຄື້ນສະໝອງ EEG ດ້ວຍ Deep Learning",
      titleEn: "EEG Emotion Recognition using Hybrid CNN-LSTM",
      student: "ທ້າວ ບອບ ສົມບັດ (65010098)",
      advisor: "ດຣ. ມາລີ ແກ້ວມະນີ",
      status: "PROPOSAL_EXAM",
      badgeVariant: "sky" as const,
      statusLabel: "ຈັດຕາຕະລາງສອບແລ້ວ",
    },
    {
      id: "TH-2026-003",
      titleLao: "ລະບົບແນະນຳຫຼັກສູດອັດສະລິຍະດ້ວຍ Knowledge Graph",
      titleEn: "Curriculum Recommender via Knowledge Graphs",
      student: "ນາງ ຄາໂຣນ ດາວີ (65010115)",
      advisor: "ອຈ. ດຣ. ນິລັນ ວົງສຸວັນ",
      status: "UNDER_REVIEW",
      badgeVariant: "amber" as const,
      statusLabel: "ລໍຖ້າອາຈານກວດສອບ",
    },
    {
      id: "TH-2026-004",
      titleLao: "ລະບົບບັນຊີແຈກຢາຍແບບກະຈາຍສູນສຳລັບສິນຊັບດິຈິຕອນ",
      titleEn: "Distributed Ledger for Institutional Asset Tokenization",
      student: "ທ້າວ ດາວິດ ອິນທິລາດ (65010204)",
      advisor: "ດຣ. ປະເສີດ ຈັນທະລັງສີ",
      status: "APPROVED",
      badgeVariant: "emerald" as const,
      statusLabel: "ອະນຸມັດໂຄງຮ່າງແລ້ວ",
    },
  ];

  const upcomingExams = [
    {
      id: "EX-101",
      topic: "ການຈຳແນກອາລົມຈາກຄື້ນສະໝອງ EEG",
      type: "ສອບປ້ອງກັນໂຄງຮ່າງ",
      date: "ມື້ອື່ນ, 10:00 ໂມງເຊົ້າ",
      room: "ຫ້ອງທົດລອງວິສະວະກຳ 402",
      committeeCount: 3,
      status: "SCHEDULED",
    },
    {
      id: "EX-102",
      topic: "ລະບົບຊົນລະປະທານອັດສະລິຍະດ້ວຍ AI",
      type: "ສອບປ້ອງກັນໂຄງຮ່າງ",
      date: "05 ຕຸລາ, 01:30 ໂມງແລງ",
      room: "ຫ້ອງປະຊຸມໃຫຍ່ B",
      committeeCount: 3,
      status: "SCHEDULED",
    },
    {
      id: "EX-103",
      topic: "ລະບົບຈຳລອງການເຂົ້າລະຫັດ Quantum",
      type: "ສອບປ້ອງກັນບົດຈົບຊັ້ນ",
      date: "12 ຕຸລາ, 09:00 ໂມງເຊົ້າ",
      room: "ຫ້ອງສອບເສັງອອນລາຍ 01",
      committeeCount: 4,
      status: "SCHEDULED",
    },
  ];

  return (
    <AppShell>
      <div className="space-y-8 font-sans">
        {/* Welcome Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-6">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-950">
                ແຜງຄວບຄຸມວິຊາການ (Dashboard)
              </h1>
              <span className="rounded-md bg-sky-100 px-2.5 py-0.5 text-xs font-semibold text-sky-800">
                ສົກຮຽນ 2026 / ພາກຮຽນ 1
              </span>
            </div>
            <p className="mt-1 text-sm text-slate-500">
              ຍິນດີຕ້ອນຮັບ, <strong className="text-slate-700">{profile?.display_name || "ອາຈານ ສົມຊາຍ ປະເສີດ"}</strong>. ນີ້ແມ່ນພາບລວມການດຳເນີນງານຂອງບົດໂຄງການ ແລະ ການສອບເສັງຂອງທ່ານ.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/thesis">
              <Button leftIcon={<Plus className="h-4 w-4" />}>
                ສະເໜີຫົວຂໍ້ບົດໃໝ່
              </Button>
            </Link>
            <Link href="/examination">
              <Button variant="outline" leftIcon={<CalendarCheck className="h-4 w-4" />}>
                ຫ້ອງສອບເສັງ
              </Button>
            </Link>
          </div>
        </div>

        {/* View Switcher Segmented Control */}
        <div className="flex items-center">
          <div className="inline-flex p-1 bg-slate-100 rounded-xl border border-slate-200 gap-1 text-xs sm:text-sm">
            <button
              onClick={() => setDashboardView("PROPOSAL_PIPELINE")}
              className={`inline-flex items-center gap-2 px-3.5 py-1.5 font-semibold rounded-lg transition-all ${
                dashboardView === "PROPOSAL_PIPELINE"
                  ? "bg-white text-slate-900 shadow-xs border border-slate-200/80"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <FileCheck2 className="h-4 w-4 text-sky-600" />
              <span>ຕິດຕາມການສອບໂຄງຮ່າງ (Proposal Pipeline)</span>
              <span
                className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${
                  dashboardView === "PROPOSAL_PIPELINE" ? "bg-sky-100 text-sky-800" : "bg-slate-200/80 text-slate-600"
                }`}
              >
                42 ກຸ່ມສົກຮຽນນີ້
              </span>
            </button>

            <button
              onClick={() => setDashboardView("GENERAL")}
              className={`inline-flex items-center gap-2 px-3.5 py-1.5 font-semibold rounded-lg transition-all ${
                dashboardView === "GENERAL"
                  ? "bg-white text-slate-900 shadow-xs border border-slate-200/80"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <BarChart3 className="h-4 w-4 text-slate-500" />
              <span>ພາບລວມທົ່ວໄປ (General Overview)</span>
            </button>
          </div>
        </div>

        {dashboardView === "PROPOSAL_PIPELINE" ? (
          <ProposalTrackingDashboard />
        ) : (
          <div className="space-y-8">
            {/* Top 4 KPI Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <StatCard
                title="ບົດໂຄງການທີ່ກຳລັງດຳເນີນ"
                value="48 ບົດ"
                change="+12% ຈາກພາກຮຽນກ່ອນ"
                trend="up"
                description="32 ບົດກຳລັງພັດທະນາ, 16 ບົດລໍຖ້າກວດ"
                icon={<BookOpen className="h-5 w-5" />}
              />
              <StatCard
                title="ຕາຕະລາງສອບປ້ອງກັນ"
                value="14 ຮອບ"
                change="3 ຮອບໃນອາທິດນີ້"
                trend="neutral"
                description="ສອບໂຄງຮ່າງ ແລະ ສອບຈົບຊັ້ນ"
                icon={<CalendarCheck className="h-5 w-5" />}
              />
          <StatCard
            title="ສະລິບລໍຖ້າກວດສອບ"
            value="6 ສະບັບ"
            change="ຕ້ອງກວດສອບໂດຍການເງິນ"
            trend="down"
            description="ຄ່າທຳນຽມສອບປ້ອງກັນໂຄງຮ່າງ"
            icon={<Receipt className="h-5 w-5" />}
          />
          <StatCard
            title="ຄິວພິມ ແລະ ເຂົ້າຮູບເຫຼັ້ມ"
            value="19 ເຫຼັ້ມ"
            change="5 ເຫຼັ້ມພ້ອມສົ່ງມອບ"
            trend="up"
            description="ເຫຼັ້ມປົກແຂງປ້ຳຄຳມາດຕະຖານ"
            icon={<Printer className="h-5 w-5" />}
          />
        </div>

        {/* Real-time Spotlight: Active Thesis Milestone Progress */}
        <Card className="border-sky-200/80 bg-gradient-to-br from-white via-sky-50/20 to-white">
          <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-sky-100">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-sky-700">
                  ກຸ່ມບົດໂຄງການທີ່ກຳລັງເຄື່ອນໄຫວ
                </span>
                <Badge variant="sky">CS-2026-001</Badge>
              </div>
              <CardTitle className="mt-1 text-lg sm:text-xl font-bold">
                ລະບົບກວດຈັບຮອຍຮົ່ວທໍ່ສົ່ງອາຍແກັສດ້ວຍໂດຣນອັດຕະໂນມັດ ແລະ ເຊັນເຊີຫຼາຍໂໝດ
              </CardTitle>
              <CardDescription>
                ອາຈານທີ່ປຶກສາ: ຮສ. ດຣ. ສົມຊາຍ ປະເສີດ • ນັກສຶກສາ: ອາລຸນ ເຊັນ, ບອບ ສົມບັດ, ຄາຣາ ອອດວັນ
              </CardDescription>
            </div>
            <Link href="/thesis">
              <Button variant="outline" size="sm" rightIcon={<ArrowRight className="h-3.5 w-3.5" />}>
                ເປີດລາຍລະອຽດ
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="pt-6 pb-6">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
              ຄວາມຄືບໜ້າຕາມຂັ້ນຕອນ: ໄລຍະການພັດທະນາລະບົບ (ສຳເລັດ 60%)
            </p>
            <Stepper steps={activeMilestonesLao} />
          </CardContent>
        </Card>

        {/* 2-Column Split: Recent Thesis Activity & Upcoming Examination Defenses */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Theses List (2 Cols) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900">ລາຍການບົດໂຄງການຫຼ້າສຸດ</h2>
                <p className="text-xs text-slate-500">ຫົວຂໍ້ ແລະ ສະຖານະການກວດສອບທີ່ອັບເດດ</p>
              </div>
              <Link href="/thesis" className="text-xs font-semibold text-sky-600 hover:text-sky-700 flex items-center gap-1">
                ເບິ່ງທັງໝົດ <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            <Card>
              <div className="divide-y divide-slate-100">
                {recentTheses.map((thesis) => (
                  <div key={thesis.id} className="p-4 sm:p-5 hover:bg-slate-50/80 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-semibold text-slate-500">{thesis.id}</span>
                        <Badge variant={thesis.badgeVariant}>{thesis.statusLabel}</Badge>
                      </div>
                      <h3 className="text-sm font-semibold text-slate-900 truncate">
                        {thesis.titleLao}
                      </h3>
                      <p className="text-xs text-slate-500 truncate font-mono">
                        {thesis.titleEn}
                      </p>
                      <div className="flex items-center gap-3 text-[11px] text-slate-400 pt-0.5">
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3 text-slate-400" /> {thesis.student}
                        </span>
                        <span>•</span>
                        <span>{thesis.advisor}</span>
                      </div>
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0">
                      <Link href="/thesis">
                        <Button variant="outline" size="sm">
                          ລາຍລະອຽດ
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Upcoming Examinations Defenses (1 Col) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900">ການສອບເສັງທີ່ໃກ້ຈະມາຮອດ</h2>
                <p className="text-xs text-slate-500">ຕາຕະລາງ ແລະ ຫ້ອງສອບເສັງ</p>
              </div>
              <Link href="/examination" className="text-xs font-semibold text-sky-600 hover:text-sky-700 flex items-center gap-1">
                ຕາຕະລາງເຕັມ <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            <div className="space-y-3">
              {upcomingExams.map((exam) => (
                <Card key={exam.id} className="p-4 hover:border-sky-300 transition-colors">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono text-slate-400">{exam.id}</span>
                    <Badge variant="sky">{exam.type}</Badge>
                  </div>
                  <h3 className="mt-2 text-sm font-bold text-slate-900">
                    {exam.topic}
                  </h3>
                  <div className="mt-3 space-y-1.5 text-xs text-slate-600">
                    <div className="flex items-center gap-2">
                      <Clock className="h-3.5 w-3.5 text-slate-400" />
                      <span>{exam.date}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FileText className="h-3.5 w-3.5 text-slate-400" />
                      <span>{exam.room}</span>
                    </div>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400">
                      {exam.committeeCount} ກຳມະການສອບເສັງ
                    </span>
                    <Link href="/examination">
                      <Button size="sm" variant="secondary" className="text-xs h-7 px-2.5">
                        ເຂົ້າຫ້ອງສອບ
                      </Button>
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    )}
  </div>
</AppShell>
);
}

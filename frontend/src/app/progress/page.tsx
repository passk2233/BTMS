"use client";

import React, { useState } from "react";
import {
  TrendingUp,
  CheckCircle,
  Clock,
  AlertCircle,
  GitBranch,
  Calendar,
  User,
  ArrowRight,
  Sparkles,
  BarChart2,
  ChevronDown,
} from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Badge, BadgeVariant } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { Stepper, StepItem } from "@/components/ui/stepper";
import { SearchableSelect, SearchableOption } from "@/components/ui/searchable-select";

interface MilestoneTask {
  id: string;
  name: string;
  category: "ຄວາມຕ້ອງການ" | "ການອອກແບບ" | "ພັດທະນາ" | "ການທົດສອບ";
  status: "Completed" | "In Progress" | "Pending";
  statusLabelLao: string;
  progressPct: number;
  updatedAt: string;
}

interface ThesisProgressItem {
  id: string;
  code: string;
  titleLao: string;
  titleEn: string;
  student: string;
  advisor: string;
  currentMilestone: string;
  overallProgress: number; // 0-100
  lastSync: string;
  milestones: StepItem[];
  tasks: MilestoneTask[];
}

const mockProgressDataLao: ThesisProgressItem[] = [
  {
    id: "P-01",
    code: "CS-2026-001",
    titleLao: "ລະບົບກວດຈັບຮອຍຮົ່ວທໍ່ສົ່ງອາຍແກັສດ້ວຍໂດຣນອັດຕະໂນມັດ ແລະ ເຊັນເຊີຫຼາຍໂໝດ",
    titleEn: "Autonomous UAV Pipeline Leak Detection using Multimodal Sensors",
    student: "ອາລຸນ ເຊັນ (65010042) + 2 ສະມາຊິກ",
    advisor: "ຮສ. ດຣ. ສົມຊາຍ ປະເສີດ",
    currentMilestone: "ຂັ້ນຕອນທີ 5: ການພັດທະນາລະບົບ ແລະ ທົດສອບພາກສະໜາມ",
    overallProgress: 65,
    lastSync: "ເມື່ອກີ້ນີ້ (ຊິງຄ໌ຜ່ານ Supabase Realtime)",
    milestones: [
      { id: "1", name: "ຫົວຂໍ້", status: "complete", date: "12 ສ.ຫ." },
      { id: "2", name: "ກວດສອບ", status: "complete", date: "24 ສ.ຫ." },
      { id: "3", name: "ສອບໂຄງຮ່າງ", status: "complete", date: "15 ກ.ຍ." },
      { id: "4", name: "ອະນຸມັດ", status: "complete", date: "20 ກ.ຍ." },
      { id: "5", name: "ພັດທະນາ", status: "current", date: "ເປົ້າໝາຍ ພ.ຈ." },
      { id: "6", name: "ສອບຈົບຊັ້ນ", status: "upcoming" },
      { id: "7", name: "ປັບປຸງ", status: "upcoming" },
      { id: "8", name: "ສຳເລັດ", status: "upcoming" },
    ],
    tasks: [
      { id: "t1", name: "ກຳນົດຄວາມຕ້ອງການລະບົບ ແລະ ເລືອກເຊັນເຊີ", category: "ຄວາມຕ້ອງການ", status: "Completed", statusLabelLao: "ສຳເລັດແລ້ວ", progressPct: 100, updatedAt: "10 ກ.ຍ." },
      { id: "t2", name: "ອອກແບບວົງຈອນຮາດແວ ແລະ ເຊື່ອມຕໍ່ Edge TPU", category: "ການອອກແບບ", status: "Completed", statusLabelLao: "ສຳເລັດແລ້ວ", progressPct: 100, updatedAt: "22 ກ.ຍ." },
      { id: "t3", name: "ຝຶກສອນແບບຈຳລອງ YOLO ກວດຈັບກຸ່ມອາຍແກັສ", category: "ພັດທະນາ", status: "In Progress", statusLabelLao: "ກຳລັງດຳເນີນ", progressPct: 80, updatedAt: "ມື້ວານນີ້" },
      { id: "t4", name: "ຂຽນໂປຣແກຣມປະມວນຜົນສັນຍານສຽງ Ultrasonic", category: "ພັດທະນາ", status: "In Progress", statusLabelLao: "ກຳລັງດຳເນີນ", progressPct: 50, updatedAt: "3 ມື້ກ່ອນ" },
      { id: "t5", name: "ທົດສອບການບິນກວດຈັບໃນພາກສະໜາມຕົວຈິງ", category: "ການທົດສອບ", status: "Pending", statusLabelLao: "ລໍຖ້າດຳເນີນ", progressPct: 0, updatedAt: "ກຳນົດເດືອນ ພ.ຈ." },
    ],
  },
  {
    id: "P-02",
    code: "CS-2026-002",
    titleLao: "ການຈຳແນກອາລົມຈາກສັນຍານຄື້ນສະໝອງ EEG ດ້ວຍໂຄງສ້າງ Deep Learning",
    titleEn: "EEG-Based Emotion Recognition using Hybrid CNN-Transformer",
    student: "ນິລັນ ເດຊາ (65010190)",
    advisor: "ດຣ. ມາລີ ແກ້ວມະນີ",
    currentMilestone: "ຂັ້ນຕອນທີ 3: ກະກຽມການສອບປ້ອງກັນໂຄງຮ່າງ",
    overallProgress: 35,
    lastSync: "2 ນາທີກ່ອນ",
    milestones: [
      { id: "1", name: "ຫົວຂໍ້", status: "complete", date: "18 ສ.ຫ." },
      { id: "2", name: "ກວດສອບ", status: "complete", date: "02 ກ.ຍ." },
      { id: "3", name: "ສອບໂຄງຮ່າງ", status: "current", date: "ກຳນົດສອບແລ້ວ" },
      { id: "4", name: "ອະນຸມັດ", status: "upcoming" },
      { id: "5", name: "ພັດທະນາ", status: "upcoming" },
      { id: "6", name: "ສອບຈົບຊັ້ນ", status: "upcoming" },
      { id: "7", name: "ປັບປຸງ", status: "upcoming" },
      { id: "8", name: "ສຳເລັດ", status: "upcoming" },
    ],
    tasks: [
      { id: "t21", name: "ກຽມຊຸດຂໍ້ມູນ EEG ຈາກ DEAP ແລະ SEED", category: "ຄວາມຕ້ອງການ", status: "Completed", statusLabelLao: "ສຳເລັດແລ້ວ", progressPct: 100, updatedAt: "15 ກ.ຍ." },
      { id: "t22", name: "ສ້າງໂຄງສ້າງ Spatial-Temporal Convolution Baseline", category: "ພັດທະນາ", status: "In Progress", statusLabelLao: "ກຳລັງດຳເນີນ", progressPct: 60, updatedAt: "25 ກ.ຍ." },
      { id: "t23", name: "ກະກຽມສະໄລດ໌ນຳສະເໜີສຳລັບການສອບໂຄງຮ່າງ", category: "ຄວາມຕ້ອງການ", status: "In Progress", statusLabelLao: "ກຳລັງດຳເນີນ", progressPct: 75, updatedAt: "ມື້ນີ້" },
    ],
  },
];

const progressSelectOptions: SearchableOption[] = mockProgressDataLao.map((p) => ({
  value: p.id,
  label: `${p.code} — ${p.titleLao}`,
  subLabel: `ນັກສຶກສາ: ${p.student} • ທີ່ປຶກສາ: ${p.advisor}`,
  badge: `${p.overallProgress}%`,
  badgeVariant: p.overallProgress >= 60 ? "emerald" : "amber",
}));

export default function ProgressTrackingPage() {
  const [selectedThesis, setSelectedThesis] = useState<ThesisProgressItem>(mockProgressDataLao[0]);

  return (
    <AppShell>
      <div className="space-y-6 font-sans">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-6">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-950">
                ຕິດຕາມຄວາມຄືບໜ້າ ແລະ ໄລຍະການພັດທະນາ (Progress Tracking)
              </h1>
              <span className="rounded-md bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-800 border border-emerald-200 flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                ຊິງຄ໌ຂໍ້ມູນເວລາຈິງ
              </span>
            </div>
            <p className="mt-1 text-sm text-slate-500">
              ຂັ້ນຕອນບົດໂຄງການຄຳນວນໂດຍ Go API ແລະ ສົ່ງຂໍ້ມູນເວລາຈິງຜ່ານ Supabase Realtime.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" leftIcon={<BarChart2 className="h-4 w-4" />}>
              ດາວໂຫຼດລາຍງານຄວາມຄືບໜ້າ
            </Button>
          </div>
        </div>

        {/* Searchable Select for Thesis Group / Student */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-800 shrink-0">
            <span className="p-1.5 rounded-lg bg-sky-50 text-sky-600">
              <Sparkles className="h-4 w-4" />
            </span>
            <span>ເລືອກບົດໂຄງການ / ນັກສຶກສາ (Searchable Dropdown):</span>
          </div>
          <div className="flex-1 max-w-xl">
            <SearchableSelect
              options={progressSelectOptions}
              value={selectedThesis.id}
              onChange={(val) => {
                const found = mockProgressDataLao.find((p) => p.id === val);
                if (found) setSelectedThesis(found);
              }}
              placeholder="-- ຄົ້ນຫາຕາມຊື່ນັກສຶກສາ, ລະຫັດ ຫຼື ຫົວຂໍ້ບົດ --"
              searchPlaceholder="ພິມຊື່, ລະຫັດບົດ, ອາຈານທີ່ປຶກສາ..."
              allowCustom={false}
            />
          </div>
        </div>

        {/* 4 Progress KPI Cards in Lao */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <StatCard
            title="ຄວາມຄືບໜ້າສະເລ່ຍທັງໝົດ"
            value="64.2%"
            change="+5.1% ໃນອາທິດນີ້"
            trend="up"
            description="ຈາກ 48 ກຸ່ມບົດໂຄງການທີ່ລົງທະບຽນ"
            icon={<TrendingUp className="h-5 w-5" />}
          />
          <StatCard
            title="ອັດຕາຕາມແຜນເວລາ"
            value="89.5%"
            change="ເປົ້າໝາຍ ≥ 85%"
            trend="up"
            description="43 ກຸ່ມດຳເນີນງານທັນຕາມກຳນົດ"
            icon={<CheckCircle className="h-5 w-5" />}
          />
          <StatCard
            title="ກຳລັງພັດທະນາລະບົບ"
            value="32 ກຸ່ມ"
            change="ໄລຍະທີ 9 ເນັ້ນໜັກ"
            trend="neutral"
            description="ກຳລັງພັດທະນາ Software/Hardware"
            icon={<GitBranch className="h-5 w-5" />}
          />
          <StatCard
            title="ຕ້ອງປັບປຸງແກ້ໄຂ"
            value="4 ກຸ່ມ"
            change="ຕ້ອງແກ້ໄຂດ່ວນ"
            trend="down"
            description="ແກ້ໄຂຕາມຄຳເຫັນຂອງກຳມະການ"
            icon={<AlertCircle className="h-5 w-5" />}
          />
        </div>

        {/* Selected Thesis Spotlight Card */}
        <Card className="border-sky-200 bg-gradient-to-br from-white via-sky-50/20 to-white shadow-sm">
          <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-sky-700 bg-sky-100 px-2 py-0.5 rounded">
                  {selectedThesis.code}
                </span>
                <span className="text-xs text-slate-500 font-mono">
                  {selectedThesis.lastSync}
                </span>
              </div>
              <CardTitle className="text-xl font-bold mt-1">
                {selectedThesis.titleLao}
              </CardTitle>
              <CardDescription>
                {selectedThesis.student} • ອາຈານທີ່ປຶກສາ: {selectedThesis.advisor}
              </CardDescription>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <span className="text-xs text-slate-500 font-medium block">ຄວາມຄືບໜ້າລວມ</span>
                <span className="text-2xl font-black text-sky-700 font-mono">
                  {selectedThesis.overallProgress}%
                </span>
              </div>
              <div className="w-16 h-16 rounded-full border-4 border-sky-100 border-t-sky-600 flex items-center justify-center font-bold text-xs text-sky-800">
                {selectedThesis.overallProgress}%
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6 pt-6">
            {/* 8-Stage Milestone Stepper in Lao */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  ຂັ້ນຕອນຄວາມຄືບໜ້າຂອງບົດໂຄງການ
                </h3>
                <span className="text-xs font-semibold text-sky-700">
                  {selectedThesis.currentMilestone}
                </span>
              </div>
              <Stepper steps={selectedThesis.milestones} />
            </div>

            {/* Sub-Milestone Development Tasks in Lao */}
            <div className="pt-4 border-t border-slate-100">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                ໄລຍະທີ 9: ການແບ່ງໜ້າວຽກພັດທະນາລະບົບ
              </h3>
              <div className="space-y-2.5">
                {selectedThesis.tasks.map((task) => (
                  <div
                    key={task.id}
                    className="p-3.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-900">{task.name}</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                          {task.category}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400">ອັບເດດ: {task.updatedAt}</p>
                    </div>

                    <div className="flex items-center gap-4 shrink-0">
                      <div className="w-36 bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            task.progressPct === 100 ? "bg-emerald-500" : "bg-sky-600"
                          }`}
                          style={{ width: `${task.progressPct}%` }}
                        />
                      </div>
                      <span className="font-mono font-bold text-slate-700 w-10 text-right">
                        {task.progressPct}%
                      </span>
                      <Badge
                        variant={
                          task.status === "Completed"
                            ? "emerald"
                            : task.status === "In Progress"
                            ? "amber"
                            : "slate"
                        }
                      >
                        {task.statusLabelLao}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}

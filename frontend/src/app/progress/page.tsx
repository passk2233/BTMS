"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import {
  TrendingUp,
  Clock,
  Calendar,
  User,
  Sparkles,
  BarChart2,
  Check,
  FileCheck2,
  RefreshCw,
  Loader2,
} from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { Stepper, StepItem } from "@/components/ui/stepper";
import { SearchableSelect, SearchableOption } from "@/components/ui/searchable-select";
import { ACADEMIC_STAGES } from "@/lib/academic-directory";
import { createClient } from "@/lib/supabase/client";

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
  category: string;
  student: string;
  advisor: string;
  advisorAffiliation: string;
  currentStageNo: number;
  overallProgress: number; // 0-100
  lastSync: string;
  tasks: MilestoneTask[];
}

type TimelinePhaseFilter = "ALL" | "REGISTRATION" | "PROPOSAL" | "FINAL" | "COMPLETION";

export default function ProgressTrackingPage() {
  const [theses, setTheses] = useState<ThesisProgressItem[]>([]);
  const [selectedThesis, setSelectedThesis] = useState<ThesisProgressItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activePhase, setActivePhase] = useState<TimelinePhaseFilter>("ALL");

  const fetchProgress = useCallback(async () => {
    setIsLoading(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("theses")
        .select(`
          id,
          topic_th,
          topic_en,
          status,
          academic_year,
          category_code,
          created_at,
          thesis_advisors (
            is_primary,
            teachers (
              academic_title,
              affiliation,
              department,
              profiles (
                display_name
              )
            )
          ),
          thesis_members (
            is_leader,
            students (
              student_code,
              profiles (
                display_name
              )
            )
          ),
          exams (
            round_id,
            attempt_no,
            status,
            result,
            scheduled_date
          )
        `)
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Error loading thesis progress:", error);
        return;
      }

      if (data) {
        const categoryMap: Record<string, string> = {
          SOFTWARE: "Software",
          NETWORK: "Network/Server",
          CYBERSECURITY: "Cybersecurity",
          HARDWARE: "Hardware (IoT, Robot)",
          MULTIMEDIA: "Multimedia",
        };

        const mapped: ThesisProgressItem[] = data.map((t: any, idx: number) => {
          const catName = categoryMap[t.category_code] || "Software";
          const advisors = t.thesis_advisors || [];
          const primaryAdv = advisors.find((a: any) => a.is_primary) || advisors[0];
          const advName = primaryAdv?.teachers?.profiles?.display_name || "ທ່ານ ຮສ. ແສງລັດສະໝີ ຈັນທະມິນາວົງ";
          const advAffil = primaryAdv?.teachers?.affiliation || "CEIT";

          const members = (t.thesis_members || []).map((m: any) => m.students?.profiles?.display_name || "ນັກສຶກສາ");
          const studentString = members.length > 0 ? members.join(", ") : "ນັກສຶກສາ CEIT";

          const exams = t.exams || [];
          const completedExam = exams.find((e: any) => e.status === "COMPLETED");
          const scheduledExam = exams.find((e: any) => e.status === "SCHEDULED");

          let stageNo = 2;
          if (completedExam && completedExam.result === "PASS") {
            stageNo = 7;
          } else if (scheduledExam) {
            stageNo = 6;
          } else if (t.status === "TOPIC_APPROVED") {
            stageNo = 5;
          } else if (t.status === "PROPOSED") {
            stageNo = 3;
          }

          const progressPct = Math.round((stageNo / 18) * 100);

          const tasks: MilestoneTask[] = [
            {
              id: `t-${t.id}-1`,
              name: "ເກັບກຳຄວາມຕ້ອງການລະບົບ ແລະ ບັນທຶກຫົວຂໍ້ບົດ",
              category: "ຄວາມຕ້ອງການ",
              status: stageNo >= 3 ? "Completed" : "In Progress",
              statusLabelLao: stageNo >= 3 ? "ສຳເລັດແລ້ວ" : "ກຳລັງດຳເນີນ",
              progressPct: stageNo >= 3 ? 100 : 50,
              updatedAt: "10 ຕ.ລ. 2026",
            },
            {
              id: `t-${t.id}-2`,
              name: "ຍື່ນຄຳຮ້ອງ ແລະ ປະກາດຊື່ຫົວຂໍ້ບົດຢ່າງເປັນທາງການ",
              category: "ຄວາມຕ້ອງການ",
              status: stageNo >= 4 ? "Completed" : stageNo === 3 ? "In Progress" : "Pending",
              statusLabelLao: stageNo >= 4 ? "ສຳເລັດແລ້ວ" : stageNo === 3 ? "ກຳລັງດຳເນີນ" : "ລໍຖ້າດຳເນີນ",
              progressPct: stageNo >= 4 ? 100 : stageNo === 3 ? 50 : 0,
              updatedAt: "15 ຕ.ລ. 2026",
            },
            {
              id: `t-${t.id}-3`,
              name: "ຂຽນບົດສະເໜີໂຄງຮ່າງບົດທີ 1–3 ແລະ ກະກຽມສົ່ງປຶ້ມ",
              category: "ພັດທະນາ",
              status: stageNo >= 6 ? "Completed" : stageNo === 5 ? "In Progress" : "Pending",
              statusLabelLao: stageNo >= 6 ? "ສຳເລັດແລ້ວ" : stageNo === 5 ? "ກຳລັງດຳເນີນ" : "ລໍຖ້າດຳເນີນ",
              progressPct: stageNo >= 6 ? 100 : stageNo === 5 ? 75 : 0,
              updatedAt: "ມື້ນີ້",
            },
            {
              id: `t-${t.id}-4`,
              name: "ກຽມປ້ອງກັນຫົວບົດວິທະຍານິພົນ ຊຸດທີ່ 1 (Feb–Mar 2027)",
              category: "ການທົດສອບ",
              status: stageNo >= 7 ? "Completed" : stageNo === 6 ? "In Progress" : "Pending",
              statusLabelLao: stageNo >= 7 ? "ສຳເລັດແລ້ວ" : stageNo === 6 ? "ກຳລັງດຳເນີນ" : "ລໍຖ້າດຳເນີນ",
              progressPct: stageNo >= 7 ? 100 : stageNo === 6 ? 60 : 0,
              updatedAt: "ຕາມຕາຕະລາງ",
            },
          ];

          return {
            id: t.id,
            code: `CS-2026-G0${idx + 1}`,
            titleLao: t.topic_th || "ຫົວຂໍ້ບົດວິທະຍານິພົນ",
            titleEn: t.topic_en || "Bachelor Thesis Topic",
            category: catName,
            student: studentString,
            advisor: advName,
            advisorAffiliation: advAffil,
            currentStageNo: stageNo,
            overallProgress: progressPct,
            lastSync: "ຊິງຄ໌ຜ່ານ Supabase Database ຈິງ",
            tasks,
          };
        });

        setTheses(mapped);
        setSelectedThesis((prev) => {
          if (!prev && mapped.length > 0) return mapped[0];
          if (prev) {
            const found = mapped.find((m) => m.id === prev.id);
            return found || mapped[0] || null;
          }
          return null;
        });
      }
    } catch (err) {
      console.error("Failed to load progress from DB:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProgress();
  }, [fetchProgress]);

  const progressSelectOptions: SearchableOption[] = useMemo(() => {
    return theses.map((p) => ({
      value: p.id,
      label: `${p.code} — ${p.titleLao}`,
      subLabel: `ໝວດ: ${p.category} • ອາຈານ: ${p.advisor} (${p.advisorAffiliation})`,
      badge: `${p.overallProgress}%`,
      badgeVariant: p.overallProgress >= 60 ? "emerald" : "amber",
    }));
  }, [theses]);

  // Filter 18 stages based on activePhase tab
  const displayedStages = useMemo(() => {
    if (activePhase === "ALL") return ACADEMIC_STAGES;
    return ACADEMIC_STAGES.filter((s) => s.phase === activePhase);
  }, [activePhase]);

  // Convert displayed stages into Stepper items for the selected thesis
  const stepperSteps: StepItem[] = useMemo(() => {
    const currentNo = selectedThesis?.currentStageNo ?? 1;
    return displayedStages.map((s) => {
      let status: "complete" | "current" | "upcoming" | "revision" = "upcoming";
      if (s.stageNo < currentNo) {
        status = "complete";
      } else if (s.stageNo === currentNo) {
        status = "current";
      }
      return {
        id: String(s.stageNo),
        name: `ຂັ້ນຕອນ ${s.stageNo}: ${s.nameLo}`,
        status,
        date: s.plannedWindow,
      };
    });
  }, [displayedStages, selectedThesis?.currentStageNo]);

  const currentStageInfo = useMemo(() => {
    const currentNo = selectedThesis?.currentStageNo ?? 1;
    return ACADEMIC_STAGES.find((s) => s.stageNo === currentNo);
  }, [selectedThesis?.currentStageNo]);

  return (
    <AppShell>
      <div className="space-y-6 font-sans">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-6">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-950 font-lao">
                ຕິດຕາມຄວາມຄືບໜ້າ 18 ຂັ້ນຕອນ (18-Stage Timeline Tracking)
              </h1>
              <span className="rounded-md bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-800 border border-emerald-200 flex items-center gap-1 font-lao">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                ສົກສຶກສາ 2026–2027
              </span>
            </div>
            <p className="mt-1 text-sm text-slate-500 font-lao">
              ແຜນກຳນົດເວລາທາງການ 18 ຂັ້ນຕອນ (ຕ.ລ. 2026 – ສ.ຫ. 2027) ພາກວິຊາວິສະວະກຳຄອມພິວເຕີ ແລະ ເຕັກໂນໂລຊີຂໍ້ມູນຂ່າວສານ.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<RefreshCw className={`h-4 w-4 text-sky-600 ${isLoading ? "animate-spin" : ""}`} />}
              className="font-lao"
              onClick={() => fetchProgress()}
            >
              ຊິງຄ໌ຂໍ້ມູນ DB
            </Button>
            <Button variant="outline" size="sm" leftIcon={<BarChart2 className="h-4 w-4" />} className="font-lao">
              ດາວໂຫຼດລາຍງານ Gantt Chart
            </Button>
          </div>
        </div>

        {/* Searchable Select for Thesis Group */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-lao">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-800 shrink-0">
            <span className="p-1.5 rounded-lg bg-sky-50 text-sky-600">
              <Sparkles className="h-4 w-4" />
            </span>
            <span>ເລືອກບົດໂຄງການເພື່ອຕິດຕາມ (Select Thesis):</span>
          </div>
          <div className="flex-1 max-w-xl">
            <SearchableSelect
              options={progressSelectOptions}
              value={selectedThesis?.id || ""}
              onChange={(val) => {
                const found = theses.find((p) => p.id === val);
                if (found) setSelectedThesis(found);
              }}
              placeholder="-- ຄົ້ນຫາຕາມຊື່ນັກສຶກສາ, ລະຫັດ ຫຼື ຫົວຂໍ້ບົດ --"
              searchPlaceholder="ພິມຊື່, ລະຫັດບົດ, ອາຈານທີ່ປຶກສາ..."
              allowCustom={false}
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center p-12 bg-white rounded-xl border border-slate-200">
            <Loader2 className="h-8 w-8 animate-spin text-sky-600 mb-2" />
            <p className="text-sm text-slate-500 font-lao">ກຳລັງໂຫຼດຂໍ້ມູນຄວາມຄືບໜ້າຈາກ Supabase Database...</p>
          </div>
        ) : !selectedThesis ? (
          <div className="p-8 text-center bg-white rounded-xl border border-slate-200 font-lao text-slate-500">
            ບໍ່ພົບຂໍ້ມູນບົດໂຄງການໃນລະບົບ
          </div>
        ) : (
          <>
            {/* 4 Progress KPI Cards in Lao */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-lao">
              <StatCard
                title="ຂັ້ນຕອນປັດຈຸບັນ"
                value={`ຂັ້ນຕອນທີ ${selectedThesis.currentStageNo} / 18`}
                change={currentStageInfo?.phase || "REGISTRATION"}
            trend="up"
            description={currentStageInfo?.nameLo || ""}
            icon={<Clock className="h-5 w-5" />}
          />
          <StatCard
            title="ຄວາມຄືບໜ້າລວມຂອງກຸ່ມ"
            value={`${selectedThesis.overallProgress}%`}
            change="ໄລຍະເປົ້າໝາຍ"
            trend="up"
            description={`ໝວດ ${selectedThesis.category}`}
            icon={<TrendingUp className="h-5 w-5" />}
          />
          <StatCard
            title="ກຳນົດເວລາປັດຈຸບັນ"
            value={currentStageInfo?.plannedWindow || "Oct 2026"}
            change="ແຜນເວລາທາງການ"
            trend="neutral"
            description="ສົກສຶກສາ 2026–2027"
            icon={<Calendar className="h-5 w-5" />}
          />
          <StatCard
            title="ອາຈານທີ່ປຶກສາ"
            value={selectedThesis.advisor}
            change={`ສັງກັດ ${selectedThesis.advisorAffiliation}`}
            trend="neutral"
            description="ຮັບຮອງຫົວຂໍ້ແລ້ວ"
            icon={<User className="h-5 w-5" />}
          />
        </div>

        {/* Selected Thesis Spotlight Card */}
        <Card className="border-sky-200 bg-gradient-to-br from-white via-sky-50/20 to-white shadow-sm font-lao">
          <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono text-xs font-bold text-sky-800 bg-sky-100 px-2 py-0.5 rounded">
                  {selectedThesis.code}
                </span>
                <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                  ໝວດ: {selectedThesis.category}
                </span>
                <span className="text-xs text-slate-500 font-mono">
                  {selectedThesis.lastSync}
                </span>
              </div>
              <CardTitle className="text-lg sm:text-xl font-bold mt-1.5">
                {selectedThesis.titleLao}
              </CardTitle>
              <CardDescription className="text-xs text-slate-600">
                ສະມາຊິກ: {selectedThesis.student} • ອາຈານທີ່ປຶກສາ: {selectedThesis.advisor} ({selectedThesis.advisorAffiliation})
              </CardDescription>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <span className="text-xs text-slate-500 font-medium block">ຄວາມຄືບໜ້າລວມ</span>
                <span className="text-2xl font-black text-sky-700 font-mono">
                  {selectedThesis.overallProgress}%
                </span>
              </div>
              <div className="w-14 h-14 rounded-full border-4 border-sky-100 border-t-sky-600 flex items-center justify-center font-bold text-xs text-sky-800">
                {selectedThesis.overallProgress}%
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6 pt-6">
            {/* Phase Tabs Selector */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-1.5 flex-wrap">
                {[
                  { id: "ALL", label: "ທັງໝົດ 18 ຂັ້ນຕອນ" },
                  { id: "REGISTRATION", label: "Phase 1: ລົງທະບຽນ (1–4)" },
                  { id: "PROPOSAL", label: "Phase 2: ສອບໂຄງຮ່າງ (5–11)" },
                  { id: "FINAL", label: "Phase 3: ສອບຈົບຊັ້ນ (12–16)" },
                  { id: "COMPLETION", label: "Phase 4: ສຳເລັດ (17–18)" },
                ].map((ph) => (
                  <button
                    key={ph.id}
                    onClick={() => setActivePhase(ph.id as TimelinePhaseFilter)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                      activePhase === ph.id
                        ? "bg-sky-600 text-white shadow-xs"
                        : "bg-slate-100 text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    {ph.label}
                  </button>
                ))}
              </div>

              <span className="text-xs font-semibold text-sky-700">
                ຂັ້ນຕອນທີ {selectedThesis.currentStageNo}: {currentStageInfo?.nameLo}
              </span>
            </div>

            {/* Stepper Component Rendering */}
            <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-xs">
              <Stepper steps={stepperSteps} />
            </div>

            {/* 18-Stage Official Timeline Matrix */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                  <Calendar className="h-4 w-4 text-sky-600" />
                  ຕາຕະລາງລາຍລະອຽດແຜນເວລາ 18 ຂັ້ນຕອນ (Oct 2026 – Aug 2027)
                </h3>
                <span className="text-xs text-slate-400">
                  ຂັ້ນຕອນປັດຈຸບັນຖືກໄຮໄລ້ດ້ວຍສີຟ້າ
                </span>
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                      <th className="py-2.5 px-3 w-16 text-center">ລ/ດ</th>
                      <th className="py-2.5 px-3">ຊື່ຂັ້ນຕອນ (ພາສາລາວ)</th>
                      <th className="py-2.5 px-3">Stage Name (English)</th>
                      <th className="py-2.5 px-3 w-40">ກຳນົດເວລາ (Planned Window)</th>
                      <th className="py-2.5 px-3 w-28 text-center">ໄລຍະ (Phase)</th>
                      <th className="py-2.5 px-3 w-28 text-center">ສະຖານະກຸ່ມ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {displayedStages.map((stage) => {
                      const isCurrent = stage.stageNo === selectedThesis.currentStageNo;
                      const isComplete = stage.stageNo < selectedThesis.currentStageNo;

                      return (
                        <tr
                          key={stage.stageNo}
                          className={`transition ${
                            isCurrent
                              ? "bg-sky-50/70 font-semibold text-sky-950"
                              : isComplete
                              ? "bg-white text-slate-800"
                              : "bg-slate-50/30 text-slate-400"
                          }`}
                        >
                          <td className="py-2 px-3 text-center font-mono font-bold">
                            {stage.stageNo}
                          </td>
                          <td className="py-2 px-3 font-medium flex items-center gap-2">
                            {isComplete && <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" />}
                            {isCurrent && <Clock className="h-3.5 w-3.5 text-sky-600 shrink-0 animate-pulse" />}
                            <span>{stage.nameLo}</span>
                          </td>
                          <td className="py-2 px-3 font-mono text-[11px] text-slate-500">
                            {stage.nameEn}
                          </td>
                          <td className="py-2 px-3 font-mono text-[11px]">
                            {stage.plannedWindow}
                          </td>
                          <td className="py-2 px-3 text-center">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                stage.phase === "REGISTRATION"
                                  ? "bg-blue-100 text-blue-800"
                                  : stage.phase === "PROPOSAL"
                                  ? "bg-amber-100 text-amber-800"
                                  : stage.phase === "FINAL"
                                  ? "bg-purple-100 text-purple-800"
                                  : "bg-emerald-100 text-emerald-800"
                              }`}
                            >
                              {stage.phase}
                            </span>
                          </td>
                          <td className="py-2 px-3 text-center">
                            <Badge
                              variant={
                                isComplete ? "emerald" : isCurrent ? "sky" : "slate"
                              }
                            >
                              {isComplete ? "ສຳເລັດແລ້ວ" : isCurrent ? "ກຳລັງດຳເນີນ" : "ລໍຖ້າ"}
                            </Badge>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Sub-Milestone Development Tasks */}
            <div className="pt-4 border-t border-slate-100">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
                <FileCheck2 className="h-4 w-4 text-emerald-600" />
                ໜ້າວຽກພັດທະນາປະຈຳຂັ້ນຕອນທີ {selectedThesis.currentStageNo}
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
          </>
        )}
      </div>
    </AppShell>
  );
}

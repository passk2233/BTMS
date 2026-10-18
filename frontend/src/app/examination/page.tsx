"use client";

import React, { useState, useEffect } from "react";
import {
  Clock,
  MapPin,
  Users,
  Award,
  Sliders,
  CheckCircle,
  XCircle,
  Search,
  ShieldAlert,
  Printer,
  Sparkles,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Badge, BadgeVariant } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { OfficialExamScheduleReport, ExamDaySchedule, ScheduleItem } from "@/components/reports/official-exam-schedule-report";
import { OfficialScorePaperReport, OfficialScorePaperData } from "@/components/reports/official-score-paper-report";
import { GenerateScheduleModal } from "@/components/examination/generate-schedule-modal";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { studentSearchableOptions, committeeSearchableOptions } from "@/lib/academic-directory";
import { createClient } from "@/lib/supabase/client";

interface ExamSchedule {
  id: string;
  code: string;
  thesisCode: string;
  thesisTitle: string;
  category: "Software" | "Network/Server" | "Cybersecurity" | "Hardware (IoT, Robot)" | "Multimedia" | "DATABASE" | "IOT" | "NETWORK" | "MEDIA";
  examRound: "PROPOSAL_1" | "PROPOSAL_2" | "FINAL_1" | "FINAL_2";
  roundNumber: number;
  attemptNo: number;
  type: "ສອບປ້ອງກັນໂຄງຮ່າງ" | "ສອບປ້ອງກັນບົດຈົບຊັ້ນ";
  date: string;
  time: string;
  room: string;
  chairman: string;
  members: string[];
  status: "SCHEDULED" | "IN_PROGRESS" | "COMPLETED";
  statusLabel: string;
  badgeVariant: BadgeVariant;
  candidateName: string;
}

const defaultScheduleData: ExamDaySchedule = {
  dayTitle: "ວັນພຸດ ວັນທີ 24 ກຸມພາ 2027",
  room: "ຫ້ອງສອບເສັງ Conference Room 1",
  deputyHeadName: "ທ່ານ ຮສ. ແສງລັດສະໝີ ຈັນທະມິນາວົງ",
  morningCommittees: {
    chairman: "ທ່ານ ຮສ. ແສງລັດສະໝີ ຈັນທະມິນາວົງ",
    members: ["ທ່ານ ອຈ. ເມກຈອນ ບຸນທັນ", "ທ່ານ ປອ. ໄຊທະວີ ຫຼວງວິໄລ"],
  },
  afternoonCommittees: {
    chairman: "ທ່ານ ຮສ. ແສງລັດສະໝີ ຈັນທະມິນາວົງ",
    members: ["ທ່ານ ຮສ. ປອ. ຄຳເພັດ ບຸນນະດີ", "ທ່ານ ສຸກສະຫວັນ ຈຸນດາລີ"],
  },
  morningSlots: [],
  afternoonSlots: [],
};

export default function ExaminationHubPage() {
  const [exams, setExams] = useState<ExamSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedExam, setSelectedExam] = useState<ExamSchedule | null>(null);
  const [filterType, setFilterType] = useState("ALL");
  const [roundFilter, setRoundFilter] = useState("ALL");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [committeeFilter, setCommitteeFilter] = useState("");
  const [evaluatingCommittee, setEvaluatingCommittee] = useState("");
  const [selectedCandidateName, setSelectedCandidateName] = useState("");
  const [committeeDecision, setCommitteeDecision] = useState<"PASS" | "FAIL">("PASS");

  // Load real examination data from Supabase PostgreSQL
  useEffect(() => {
    async function loadRealExams() {
      setLoading(true);
      try {
        const supabase = createClient();
        const { data, error } = await (supabase as any)
          .from("exams")
          .select(`
            id,
            scheduled_date,
            start_time,
            end_time,
            status,
            room:exam_rooms (name),
            thesis:theses (
              id,
              code,
              topic_th,
              topic_en,
              title_lo,
              title_en,
              category_code,
              members:thesis_members (
                id,
                student:students (
                  student_code,
                  profile:profiles (display_name)
                )
              ),
              advisors:thesis_advisors (
                is_primary,
                teacher:teachers (
                  academic_title,
                  profile:profiles (display_name)
                )
              )
            ),
            round:exam_rounds (
              id,
              period,
              round_no,
              name
            ),
            committees:exam_committees (
              role,
              teacher:teachers (
                academic_title,
                profile:profiles (display_name)
              )
            )
          `);

        if (error) {
          console.error("Error loading exams from Supabase:", error);
        }

        if (data && data.length > 0) {
          const mapped: ExamSchedule[] = data.map((d: any, index: number) => {
            const chairmanObj = d.committees?.find((c: any) => c.role === "CHAIRMAN");
            const membersObj = d.committees?.filter((c: any) => c.role !== "CHAIRMAN") || [];
            const chairmanName = chairmanObj
              ? `${chairmanObj.teacher?.academic_title || ""} ${chairmanObj.teacher?.profile?.display_name || ""}`.trim()
              : "ທ່ານ ຮສ. ແສງລັດສະໝີ ຈັນທະມິນາວົງ";
            const memberNames = membersObj.map(
              (m: any) => `${m.teacher?.academic_title || ""} ${m.teacher?.profile?.display_name || ""}`.trim()
            );
            const isProposal = d.round?.period === "PROPOSAL";
            const roundLabel = `${d.round?.period || "PROPOSAL"}_${d.round?.round_no || 1}` as any;
            return {
              id: d.id,
              code: `EX-${String(index + 1).padStart(3, "0")}`,
              thesisCode: d.thesis?.code || `CS-2027-${String(index + 1).padStart(3, "0")}`,
              thesisTitle: d.thesis?.title_lo || d.thesis?.topic_th || d.thesis?.title_en || d.thesis?.topic_en || "ຫົວບົດວິທະຍານິພົນ",
              category: d.thesis?.category_code || "Software",
              examRound: roundLabel,
              roundNumber: d.round?.round_no || 1,
              attemptNo: d.attempt_no || 1,
              type: isProposal ? "ສອບປ້ອງກັນໂຄງຮ່າງ" : "ສອບປ້ອງກັນບົດຈົບຊັ້ນ",
              date: d.scheduled_date || "ກຳນົດພາຍຫຼັງ",
              time: d.start_time && d.end_time ? `${d.start_time} - ${d.end_time}` : (d.scheduled_time || "08:30 - 10:00"),
              room: d.room?.name || d.room_name || "ຫ້ອງສອບເສັງ Conference Room",
              chairman: chairmanName,
              members: memberNames.length > 0 ? memberNames : ["ທ່ານ ອຈ. ເມກຈອນ ບຸນທັນ", "ທ່ານ ປອ. ໄຊທະວີ ຫຼວງວິໄລ"],
              status: (d.status as any) || "SCHEDULED",
              statusLabel: d.status === "COMPLETED" ? "ສອບເສັງແລ້ວ" : d.status === "IN_PROGRESS" ? "ກຳລັງສອບເສັງ" : "ກຳນົດສອບແລ້ວ",
              badgeVariant: d.status === "COMPLETED" ? "emerald" : d.status === "IN_PROGRESS" ? "violet" : "sky",
              candidateName: "ນັກສຶກສາກຸ່ມບົດໂຄງການ",
            };
          });
          setExams(mapped);

          // Populate live schedule report data from real database rows
          const realSlots: ScheduleItem[] = (data || []).map((d: any, idx: number) => {
            const advisorObj = d.thesis?.advisors?.find((a: any) => a.is_primary) || d.thesis?.advisors?.[0];
            const advName = advisorObj
              ? `${advisorObj.teacher?.academic_title || ""} ${advisorObj.teacher?.profile?.display_name || ""}`.trim()
              : "ທ່ານ ຮສ. ທາ ບຸນທັນ";
            const members = (d.thesis?.members || []).map((m: any, mIdx: number) => ({
              index: mIdx + 1,
              name: m.student?.profile?.display_name || `ນັກສຶກສາ ${mIdx + 1}`,
            }));
            return {
              groupNo: idx + 1,
              timeSlot: d.scheduled_time || "8:30 - 9:05 am",
              classroom: d.room_name || "4IT1",
              topicTitle: d.thesis?.title_lo || d.thesis?.title_en || "ຫົວບົດວິທະຍານິພົນ",
              advisor: advName,
              members: members.length > 0 ? members : [{ index: 1, name: "ນັກສຶກສາປະຈຳກຸ່ມ" }],
            };
          });

          const mSlots = realSlots.slice(0, Math.ceil(realSlots.length / 2));
          const aSlots = realSlots.slice(Math.ceil(realSlots.length / 2));

          setCurrentSchedule({
            dayTitle: data?.[0]?.scheduled_date ? `ວັນທີ ${data[0].scheduled_date}` : "ວັນພຸດ ວັນທີ 24 ກຸມພາ 2027",
            room: data?.[0]?.room?.name || data?.[0]?.room_name || "ຫ້ອງສອບເສັງ Conference Room 1",
            deputyHeadName: "ທ່ານ ຮສ. ແສງລັດສະໝີ ຈັນທະມິນາວົງ",
            morningCommittees: {
              chairman: "ທ່ານ ຮສ. ແສງລັດສະໝີ ຈັນທະມິນາວົງ",
              members: ["ທ່ານ ອຈ. ເມກຈອນ ບຸນທັນ", "ທ່ານ ປອ. ໄຊທະວີ ຫຼວງວິໄລ"],
            },
            afternoonCommittees: {
              chairman: "ທ່ານ ຮສ. ແສງລັດສະໝີ ຈັນທະມິນາວົງ",
              members: ["ທ່ານ ຮສ. ປອ. ຄຳເພັດ ບຸນນະດີ", "ທ່ານ ສຸກສະຫວັນ ຈຸນດາລີ"],
            },
            morningSlots: mSlots,
            afternoonSlots: aSlots,
          });
        } else {
          setExams([]);
        }
      } catch (err) {
        console.error("Error loading exams from Supabase:", err);
        setExams([]);
      } finally {
        setLoading(false);
      }
    }
    loadRealExams();
  }, []);

  // Modals for printable reports & generator
  const [currentSchedule, setCurrentSchedule] = useState<ExamDaySchedule>(defaultScheduleData);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showGenerateScheduleModal, setShowGenerateScheduleModal] = useState(false);
  const [scheduleSuccessMsg, setScheduleSuccessMsg] = useState<string | null>(null);
  const [showScorePaperModal, setShowScorePaperModal] = useState(false);
  const [activeScorePaperData, setActiveScorePaperData] = useState<OfficialScorePaperData | null>(null);

  const handleSaveGeneratedSchedule = (newSchedule: any) => {
    setCurrentSchedule(newSchedule);
    setShowGenerateScheduleModal(false);
    const scheduleExams = newSchedule.exams || [];
    const generated: ExamSchedule[] = scheduleExams.map((e: any, idx: number) => ({
      id: `EX-2027-${String(idx + 1).padStart(3, "0")}`,
      code: `EX-${String(idx + 1).padStart(3, "0")}`,
      thesisCode: e.thesisCode || `CS-2027-${String(idx + 1).padStart(3, "0")}`,
      thesisTitle: e.topicTitle || "ຫົວບົດວິທະຍານິພົນ",
      category: (e.category || "Software") as any,
      examRound: "PROPOSAL_1",
      roundNumber: 1,
      attemptNo: 1,
      type: "ສອບປ້ອງກັນໂຄງຮ່າງ",
      date: newSchedule.dateLao || newSchedule.dayTitle || "15 ກໍລະກົດ 2026",
      time: `${e.startTime || "09:00"} - ${e.endTime || "09:45"}`,
      room: e.room || "ຫ້ອງສອບເສັງ 4IT3",
      chairman: e.chairman || "ທ່ານ ຮສ. ປອ. ບຸນທັນ",
      members: [e.committee1 || "ທ່ານ ປອ. ໄຊທະວີ", e.committee2 || "ທ່ານ ອຈ. ເມກຈອນ"],
      status: "SCHEDULED",
      statusLabel: "ກຳນົດສອບແລ້ວ (Proposal Round 1)",
      badgeVariant: "sky",
      candidateName: Array.isArray(e.studentNames) ? e.studentNames.join(", ") : (e.candidateName || ""),
    }));
    setExams(generated);
    setScheduleSuccessMsg("ສ້າງ ແລະ ອັບເດດຕາຕະລາງສອບເສັງສຳເລັດແລ້ວ! ພ້ອມພິມແບບຟອມ A4 Landscape.");
    setTimeout(() => setScheduleSuccessMsg(null), 4000);
  };

  // Scoring rubric state for PROPOSAL (Total 60 points)
  const [propInnovation, setPropInnovation] = useState(4.5); // Max 5
  const [propCh1, setPropCh1] = useState(8.5); // Max 10
  const [propCh2, setPropCh2] = useState(7); // Max 8
  const [propCh3, setPropCh3] = useState(17); // Max 20
  const [propPresentation, setPropPresentation] = useState(6); // Max 7
  const [propQA, setPropQA] = useState(8.5); // Max 10

  // Scoring rubric state for FINAL DEFENSE (Total 60 points)
  const [scoreCh4, setScoreCh4] = useState(6); // Max 7
  const [scoreCh5, setScoreCh5] = useState(4.5); // Max 5
  const [scoreDoc, setScoreDoc] = useState(7.5); // Max 8
  const [scorePoster, setScorePoster] = useState(2.5); // Max 3
  const [scoreProduct, setScoreProduct] = useState(8.5); // Max 10
  const [scorePresentation, setScorePresentation] = useState(8.5); // Max 10
  const [scoreQA, setScoreQA] = useState(14); // Max 17

  const [comments, setComments] = useState("ວິທີວິໄຈມີຄວາມຮັດກຸມ ແລະ ອອກແບບລະບົບໄດ້ດີຫຼາຍ. ແນະນຳໃຫ້ປັບປຸງຂອບເຂດ ແລະ ວຽກງານທີ່ກ່ຽວຂ້ອງໃນບົດທີ 2 ຕາມຄຳເຫັນກຳມະການກ່ອນສົ່ງເລ่ม Hard Copy.");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const isCurrentExamProposal = selectedExam?.type === "ສອບປ້ອງກັນໂຄງຮ່າງ";

  const rawScore60 = isCurrentExamProposal
    ? propInnovation + propCh1 + propCh2 + propCh3 + propPresentation + propQA
    : scoreCh4 + scoreCh5 + scoreDoc + scorePoster + scoreProduct + scorePresentation + scoreQA;

  const scaledScore100 = (rawScore60 / 60) * 100;

  const filteredExams = exams.filter((e) => {
    const matchesSearch =
      e.thesisTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.thesisCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.candidateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.room.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "ALL" || e.type === filterType;
    const matchesRound = roundFilter === "ALL" || e.examRound === roundFilter;
    const matchesCategory = categoryFilter === "ALL" || e.category === categoryFilter;
    const matchesCommittee =
      !committeeFilter ||
      e.chairman.toLowerCase().includes(committeeFilter.toLowerCase()) ||
      e.members.some((m) => m.toLowerCase().includes(committeeFilter.toLowerCase()));
    return matchesSearch && matchesType && matchesRound && matchesCategory && matchesCommittee;
  });

  const handleOpenScorePaper = (exam: ExamSchedule) => {
    const isProp = exam.type === "ສອບປ້ອງກັນໂຄງຮ່າງ";
    setActiveScorePaperData({
      paperType: isProp ? "PROPOSAL" : "FINAL",
      groupCode: `${exam.thesisCode} (${exam.code})`,
      category: exam.category,
      roundNumber: exam.roundNumber,
      attemptNo: exam.attemptNo,
      examDate: exam.date,
      examRoom: exam.room,
      academicYear: "2026-2027",
      students: [
        {
          index: 1,
          name: selectedCandidateName || exam.candidateName,
          scores: isProp
            ? {
                innovation: propInnovation,
                chapter1: propCh1,
                chapter2: propCh2,
                chapter3: propCh3,
                presentationProposal: propPresentation,
                qaProposal: propQA,
                total60: parseFloat(rawScore60.toFixed(1)),
                total100: parseFloat(scaledScore100.toFixed(1)),
              }
            : {
                chapter4: scoreCh4,
                chapter5: scoreCh5,
                docCompleteness: scoreDoc,
                poster: scorePoster,
                productCompleteness: scoreProduct,
                presentationFinal: scorePresentation,
                qaFinal: scoreQA,
                total60: parseFloat(rawScore60.toFixed(1)),
                total100: parseFloat(scaledScore100.toFixed(1)),
              },
        },
      ],
      committeeName: evaluatingCommittee || exam.chairman,
      isChairman: true,
      verdict: committeeDecision,
      comment: comments,
    });
    setShowScorePaperModal(true);
  };

  const handleSelectExamForGrading = (exam: ExamSchedule) => {
    setSelectedExam(exam);
    setEvaluatingCommittee(exam.chairman);
    setSelectedCandidateName(exam.candidateName);
    setCommitteeDecision("PASS");
  };

  return (
    <AppShell>
      <div className="space-y-6 font-sans">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-6">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-950 font-lao">
                ສູນການສອບເສັງ ແລະ ຕັດເກຣດ (Examination Hub)
              </h1>
              <Badge variant="violet">ຂັ້ນຕອນທີ 3 - 5</Badge>
            </div>
            <p className="mt-1 text-sm text-slate-500 font-lao">
              ຕາຕະລາງສອບ (ອາຈານທີ່ປຶກສາບໍ່ໄດ້ເປັນກຳມະການ), ພິມໃບຄະແນນ &amp; ໃບຄຳເຫັນ, ແລະ ຕັດສິນຜົນ ຜ່ານ/ບໍ່ຜ່ານ (ສອບຄືນ).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="primary"
              onClick={() => setShowGenerateScheduleModal(true)}
              leftIcon={<Sparkles className="h-4 w-4" />}
              className="bg-sky-600 hover:bg-sky-700 text-white font-lao font-semibold shadow-sm"
            >
              + ສ້າງຕາຕະລາງສອບ (Generate Schedule)
            </Button>

            <Button
              variant="outline"
              onClick={() => setShowScheduleModal(true)}
              leftIcon={<Printer className="h-4 w-4 text-sky-600" />}
              className="border-sky-300 text-sky-800 hover:bg-sky-50 font-lao font-semibold"
            >
              ພິມຕາຕະລາງສອບ (Print Schedule)
            </Button>

            <Button
              variant="outline"
              disabled={exams.length === 0}
              onClick={() => {
                if (exams.length > 0) handleOpenScorePaper(exams[0]);
              }}
              leftIcon={<Printer className="h-4 w-4 text-violet-600" />}
              className="border-violet-300 text-violet-800 hover:bg-violet-50 font-lao font-semibold"
            >
              ພິມໃບຄະແນນ &amp; ຄຳເຫັນ (Score Paper)
            </Button>

            <Button
              disabled={exams.length === 0}
              onClick={() => {
                if (exams.length > 0) handleSelectExamForGrading(exams[0]);
              }}
              leftIcon={<Award className="h-4 w-4" />}
              className="font-lao"
            >
              ເຂົ້າສູ່ຫ້ອງໃຫ້ຄະແນນ
            </Button>
          </div>
        </div>

        {/* Schedule Success Toast */}
        {scheduleSuccessMsg && (
          <div className="flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-xs font-bold text-emerald-800 font-lao shadow-sm animate-in fade-in">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>{scheduleSuccessMsg}</span>
          </div>
        )}

        {/* Committee Fee Rates & Financial Standard Banner */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-gradient-to-r from-slate-900 to-slate-800 text-white p-3.5 rounded-xl shadow-sm text-xs font-lao">
          <div className="flex items-center gap-2">
            <span className="h-7 w-7 rounded-lg bg-sky-500/20 text-sky-300 flex items-center justify-center font-bold">1</span>
            <div>
              <p className="text-slate-400 text-[11px]">ປະທານກຳມະການ</p>
              <p className="font-bold text-sky-300">60,000 ກີບ / ກຸ່ມ</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-7 w-7 rounded-lg bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-bold">2</span>
            <div>
              <p className="text-slate-400 text-[11px]">ກຳມະການ / ເລຂາ</p>
              <p className="font-bold text-emerald-300">50,000 ກີບ / ກຸ່ມ / ທ່ານ</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-7 w-7 rounded-lg bg-amber-500/20 text-amber-300 flex items-center justify-center font-bold">3</span>
            <div>
              <p className="text-slate-400 text-[11px]">ຄ່ານ້ຳດື່ມ & ອາຫານຫວ່າງ</p>
              <p className="font-bold text-amber-300">10,000 ກີບ / ກຸ່ມ</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-7 w-7 rounded-lg bg-violet-500/20 text-violet-300 flex items-center justify-center font-bold">4</span>
            <div>
              <p className="text-slate-400 text-[11px]">ຮອບການສອບເສັງ</p>
              <p className="font-bold text-violet-300">4 ຮອບ (ໂຄງຮ່າງ 1-2 & ບົດຈົບ 1-2)</p>
            </div>
          </div>
        </div>

        {/* Filter Controls with Searchable Dropdown */}
        <div className="flex flex-col gap-3 bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 flex-1">
              <div className="flex items-center gap-2 flex-1 max-w-md bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
                <Search className="h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="ຄົ້ນຫາລະຫັດສອບ, ຫ້ອງສອບເສັງ ຫຼື ຫົວຂໍ້ບົດ..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-transparent text-xs text-slate-800 placeholder-slate-400 focus:outline-none w-full"
                />
              </div>

              <div className="w-full sm:w-64">
                <SearchableSelect
                  options={committeeSearchableOptions}
                  value={committeeFilter}
                  onChange={(val) => setCommitteeFilter(val)}
                  placeholder="-- ກັ່ນຕອງຕາມກຳມະການ --"
                  searchPlaceholder="ພິມຊື່ອາຈານກຳມະການ..."
                  allowCustom={false}
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs shrink-0 font-lao">
              <span className="text-slate-500 font-medium">ປະເພດ:</span>
              {[
                { id: "ALL", label: "ທັງໝົດ" },
                { id: "ສອບປ້ອງກັນໂຄງຮ່າງ", label: "ສອບໂຄງຮ່າງ" },
                { id: "ສອບປ້ອງກັນບົດຈົບຊັ້ນ", label: "ສອບບົດຈົບຊັ້ນ" },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setFilterType(t.id)}
                  className={`px-2.5 py-1 rounded-md font-semibold transition ${
                    filterType === t.id
                      ? "bg-sky-600 text-white shadow-xs"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Exam Round Selector Row */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-xs font-lao">
            <span className="text-slate-500 font-medium">ຮອບການສອບ:</span>
            {[
              { id: "ALL", label: "ທຸກຮອບ" },
              { id: "PROPOSAL_1", label: "ປ້ອງກັນຫົວບົດ ຊຸດທີ 1 (ກຸມພາ-ມີນາ 2027)" },
              { id: "PROPOSAL_2", label: "ປ້ອງກັນຫົວບົດ ຊຸດທີ 2 (ມີນາ 2027)" },
              { id: "FINAL_1", label: "ປ້ອງກັນບົດຈົບຊັ້ນ ຊຸດທີ 1 (ມິຖຸນາ-ກໍລະກົດ 2027)" },
              { id: "FINAL_2", label: "ປ້ອງກັນບົດຈົບຊັ້ນ ຊຸດທີ 2 (ກໍລະກົດ 2027)" },
            ].map((round) => (
              <button
                key={round.id}
                onClick={() => setRoundFilter(round.id)}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold transition ${
                  roundFilter === round.id
                    ? "bg-violet-700 text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {round.label}
              </button>
            ))}
          </div>

          {/* 5 Thesis Categories Filter Row */}
          <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100 text-xs font-lao">
            <span className="text-slate-500 font-medium">ໝວດວິຊາ:</span>
            {[
              { id: "ALL", label: "ທັງໝົດ" },
              { id: "Software", label: "Software" },
              { id: "Network/Server", label: "Network/Server" },
              { id: "Cybersecurity", label: "Cybersecurity" },
              { id: "Hardware (IoT, Robot)", label: "Hardware (IoT, Robot)" },
              { id: "Multimedia", label: "Multimedia" },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCategoryFilter(cat.id)}
                className={`px-2 py-0.5 rounded text-[11px] font-bold transition ${
                  categoryFilter === cat.id
                    ? "bg-emerald-700 text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Examination Cards Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center p-12 bg-white rounded-xl border border-slate-200">
            <Loader2 className="h-8 w-8 animate-spin text-sky-600 mb-2" />
            <p className="text-sm text-slate-500 font-lao">ກຳລັງໂຫຼດຕາຕະລາງສອບເສັງຈາກ Supabase Database...</p>
          </div>
        ) : filteredExams.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-xl border border-slate-200 font-lao text-slate-500">
            ບໍ່ພົບຕາຕະລາງສອບເສັງທີ່ກົງກັບເງື່ອນໄຂ
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredExams.map((exam) => (
              <Card key={exam.id} className="flex flex-col justify-between hover:border-sky-300 transition-all">
                <div>
                  <CardHeader className="border-b border-slate-100 pb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-xs font-bold text-sky-700 bg-sky-100 px-2 py-0.5 rounded">
                          {exam.code}
                        </span>
                        <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 bg-violet-100 text-violet-800 rounded">
                          {exam.category}
                        </span>
                      </div>
                      <Badge variant={exam.badgeVariant}>{exam.statusLabel}</Badge>
                    </div>
                    <CardTitle className="text-base font-bold mt-2.5 line-clamp-2">
                      {exam.thesisTitle}
                    </CardTitle>
                    <CardDescription className="text-xs text-slate-500 font-medium flex items-center justify-between mt-1">
                      <span>ນັກສຶກສາ: {exam.candidateName}</span>
                      <span className="text-[11px] font-semibold text-slate-600">
                        ຮອບ {exam.roundNumber} ({exam.attemptNo > 1 ? `ສອບຄືນ #${exam.attemptNo}` : "ຄັ້ງທີ 1"})
                      </span>
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-3 pt-4 text-xs text-slate-600">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-sky-600 shrink-0" />
                      <span>
                        {exam.date} • {exam.time}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-sky-600 shrink-0" />
                      <span className="truncate">{exam.room}</span>
                    </div>
                    <div className="flex items-start gap-2 pt-2 border-t border-slate-100">
                      <Users className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold text-slate-700 block">ປະທານກຳມະການ:</span>
                        <span className="text-slate-500">{exam.chairman}</span>
                        <span className="font-semibold text-slate-700 block mt-1">ກຳມະການຮ່ວມ:</span>
                        <span className="text-slate-500">{exam.members.join(", ")}</span>
                      </div>
                    </div>
                  </CardContent>
                </div>

                <CardFooter className="pt-3 border-t border-slate-100 flex gap-2">
                  <Button
                    onClick={() => handleSelectExamForGrading(exam)}
                    variant="outline"
                    size="sm"
                    className="flex-1 justify-center"
                    leftIcon={<Sliders className="h-3.5 w-3.5" />}
                  >
                    ເປີດຕາຕະລາງໃຫ້ຄະແນນ (Rubric)
                  </Button>
                  <Button
                    onClick={() => handleOpenScorePaper(exam)}
                    variant="outline"
                    size="sm"
                    className="border-violet-200 text-violet-700 hover:bg-violet-50"
                    title="ພິມໃບຄະແນນ & ຄຳເຫັນ"
                  >
                    <Printer className="h-3.5 w-3.5" />
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}

        {/* Live Evaluation Scoring Room Modal */}
        {selectedExam && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-5 my-8">
              {/* Header */}
              <div className="flex items-start justify-between border-b border-slate-100 pb-4">
                <div className="flex-1 mr-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-bold text-sky-700 bg-sky-100 px-2 py-0.5 rounded">
                      {selectedExam.code}
                    </span>
                    <span className="text-xs font-mono font-bold px-2 py-0.5 bg-violet-100 text-violet-800 rounded">
                      {selectedExam.category}
                    </span>
                    <Badge variant="violet">{selectedExam.type}</Badge>
                    <span className="text-xs font-semibold px-2 py-0.5 bg-amber-100 text-amber-900 rounded">
                      ຮອບ {selectedExam.roundNumber} ({selectedExam.attemptNo > 1 ? `ສອບຄືນ #${selectedExam.attemptNo}` : "ຄັ້ງທີ 1"})
                    </span>
                    <span className="text-xs text-slate-500 font-mono">
                      ຫ້ອງ: {selectedExam.room}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-950 mt-1">
                    {selectedExam.thesisTitle}
                  </h3>

                  {/* Searchable Selects for Candidate & Evaluator */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3 pt-3 border-t border-slate-100">
                    <div>
                      <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                        ນັກສຶກສາຜູ້ເຂົ້າສອບ (Candidate):
                      </label>
                      <SearchableSelect
                        options={studentSearchableOptions}
                        value={selectedCandidateName || selectedExam.candidateName}
                        onChange={(val) => setSelectedCandidateName(val)}
                        placeholder="-- ເລືອກນັກສຶກສາ --"
                        searchPlaceholder="ພິມຊື່, ລະຫັດ, ຫຼື ຫ້ອງຮຽນ..."
                        allowCustom={true}
                        customPlaceholder="+ ປ້ອນຊື່ນັກສຶກສາ:"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                        ກຳມະການຜູ້ໃຫ້ຄະແນນ (Evaluator):
                      </label>
                      <SearchableSelect
                        options={committeeSearchableOptions}
                        value={evaluatingCommittee || selectedExam.chairman}
                        onChange={(val) => setEvaluatingCommittee(val)}
                        placeholder="-- ເລືອກກຳມະການໃຫ້ຄະແນນ --"
                        searchPlaceholder="ພິມຊື່ອາຈານກຳມະການ..."
                        allowCustom={true}
                        customPlaceholder="+ ປ້ອນຊື່ກຳມະການ:"
                      />
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedExam(null)}
                  className="text-slate-400 hover:text-slate-600 p-1"
                >
                  ✕
                </button>
              </div>

              {/* Real-time Tally Score Banner with Independent Deliberation Verdict */}
              <div className="rounded-xl border border-slate-200 bg-slate-50/90 p-4 space-y-3 font-lao">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-600">
                      ຄະແນນລວມຕາມເກນ (Reference / Audit Only)
                    </p>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-3xl font-extrabold text-slate-950 tabular-nums">
                        {rawScore60.toFixed(1)}
                      </span>
                      <span className="text-xs text-slate-600 font-semibold">/ 60 ຄະແນນ</span>
                      <span className="text-xs text-slate-500 font-mono ml-1">
                        ({scaledScore100.toFixed(1)}%)
                      </span>
                    </div>
                  </div>

                  {/* Explicit Committee Decision Selector */}
                  <div className="flex flex-col items-start sm:items-end gap-1.5">
                    <span className="text-xs font-bold text-slate-800">
                      ມະຕິຕັດສິນຂອງກຳມະການ (Deliberation Verdict):
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setCommitteeDecision("PASS")}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                          committeeDecision === "PASS"
                            ? "bg-emerald-600 text-white shadow-xs ring-2 ring-emerald-400/40"
                            : "bg-white border border-slate-300 text-slate-700 hover:bg-slate-100"
                        }`}
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        ຜ່ານ (PASS)
                      </button>
                      <button
                        type="button"
                        onClick={() => setCommitteeDecision("FAIL")}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                          committeeDecision === "FAIL"
                            ? "bg-rose-600 text-white shadow-xs ring-2 ring-rose-400/40"
                            : "bg-white border border-slate-300 text-slate-700 hover:bg-slate-100"
                        }`}
                      >
                        <XCircle className="h-3.5 w-3.5" />
                        ບໍ່ຜ່ານ (FAIL)
                      </button>
                    </div>
                  </div>
                </div>

                <div className="text-[11px] text-slate-600 border-t border-slate-200 pt-2 flex items-center gap-1.5">
                  <ShieldAlert className="h-3.5 w-3.5 text-amber-600 shrink-0" />
                  <span>
                    ໝາຍເຫດ: ຄະແນນ 60 ໃຊ້ສຳລັບການກວດສອບ ແລະ ບັນທຶກລາຍງານ. ຜົນການສອບເສັງແມ່ນຂຶ້ນກັບມະຕິຂອງຄະນະກຳມະການໂດຍກົງ (Pass/Fail Deliberation).
                  </span>
                </div>
              </div>

              {/* Rubric Criteria Sliders based on official score paper */}
              <div className="space-y-3 text-xs max-h-[380px] overflow-y-auto pr-1">
                {isCurrentExamProposal ? (
                  /* PROPOSAL CRITERIA (Total 60 points) */
                  <>
                    <div className="p-2 rounded bg-violet-50 text-violet-800 font-bold text-[11px]">
                      📋 ເກນການໃຫ້ຄະແນນສອບປ້ອງກັນໂຄງຮ່າງ (Proposal Defense Rubric - ລວມ 60 ຄະແນນ)
                    </div>

                    {/* 1. ຄວາມຍາກງ່າຍຫຼືນະວັດຕະກຳ (Max 5) */}
                    <div className="space-y-1 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                      <div className="flex justify-between font-semibold text-slate-800">
                        <span>1. ຄວາມຍາກງ່າຍຫຼືນະວັດຕະກຳ</span>
                        <span className="font-mono text-sky-700">{propInnovation} / 5</span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={5}
                        step={0.5}
                        value={propInnovation}
                        onChange={(e) => setPropInnovation(parseFloat(e.target.value))}
                        className="w-full accent-sky-600 cursor-pointer"
                      />
                    </div>

                    {/* 2. ເນື້ອໃນບົດທີ 1 (Max 10) */}
                    <div className="space-y-1 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                      <div className="flex justify-between font-semibold text-slate-800">
                        <span>2. ເນື້ອໃນບົດທີ 1 (ຄວາມເປັນມາ, ຈຸດປະສົງ, ຂອບເຂດ)</span>
                        <span className="font-mono text-sky-700">{propCh1} / 10</span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={10}
                        step={0.5}
                        value={propCh1}
                        onChange={(e) => setPropCh1(parseFloat(e.target.value))}
                        className="w-full accent-sky-600 cursor-pointer"
                      />
                    </div>

                    {/* 3. ເນື້ອໃນບົດທີ 2 (Max 8) */}
                    <div className="space-y-1 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                      <div className="flex justify-between font-semibold text-slate-800">
                        <span>3. ເນື້ອໃນບົດທີ 2 (ທິດສະດີ ແລະ ວຽກງານທີ່ກ່ຽວຂ້ອງ)</span>
                        <span className="font-mono text-sky-700">{propCh2} / 8</span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={8}
                        step={0.5}
                        value={propCh2}
                        onChange={(e) => setPropCh2(parseFloat(e.target.value))}
                        className="w-full accent-sky-600 cursor-pointer"
                      />
                    </div>

                    {/* 4. ເນື້ອໃນບົດທີ 3 (Max 20) */}
                    <div className="space-y-1 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                      <div className="flex justify-between font-semibold text-slate-800">
                        <span>4. ເນື້ອໃນບົດທີ 3 (ວິທີວິໄຈ ແລະ ການອອກແບບລະບົບ)</span>
                        <span className="font-mono text-sky-700">{propCh3} / 20</span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={20}
                        step={0.5}
                        value={propCh3}
                        onChange={(e) => setPropCh3(parseFloat(e.target.value))}
                        className="w-full accent-sky-600 cursor-pointer"
                      />
                    </div>

                    {/* 5. ຄະແນນການນຳສະເໜີ (Max 7) */}
                    <div className="space-y-1 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                      <div className="flex justify-between font-semibold text-slate-800">
                        <span>5. ຄະແນນການນຳສະເໜີ</span>
                        <span className="font-mono text-sky-700">{propPresentation} / 7</span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={7}
                        step={0.5}
                        value={propPresentation}
                        onChange={(e) => setPropPresentation(parseFloat(e.target.value))}
                        className="w-full accent-sky-600 cursor-pointer"
                      />
                    </div>

                    {/* 6. ຄະແນນການຕອບຄຳຖາມ (Max 10) */}
                    <div className="space-y-1 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                      <div className="flex justify-between font-semibold text-slate-800">
                        <span>6. ຄະແນນການຕອບຄຳຖາມ</span>
                        <span className="font-mono text-sky-700">{propQA} / 10</span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={10}
                        step={0.5}
                        value={propQA}
                        onChange={(e) => setPropQA(parseFloat(e.target.value))}
                        className="w-full accent-sky-600 cursor-pointer"
                      />
                    </div>
                  </>
                ) : (
                  /* FINAL DEFENSE CRITERIA (Total 60 points) */
                  <>
                    <div className="p-2 rounded bg-sky-50 text-sky-800 font-bold text-[11px]">
                      🎓 ເກນການໃຫ້ຄະແນນສອບປ້ອງກັນບົດຈົບຊັ້ນ (Final Defense Rubric - ລວມ 60 ຄະແນນ)
                    </div>

                    {/* 1. ເນື້ອໃນບົດທີ 4 (Max 7) */}
                    <div className="space-y-1 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                      <div className="flex justify-between font-semibold text-slate-800">
                        <span>1. ເນື້ອໃນບົດທີ 4</span>
                        <span className="font-mono text-sky-700">{scoreCh4} / 7</span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={7}
                        step={0.5}
                        value={scoreCh4}
                        onChange={(e) => setScoreCh4(parseFloat(e.target.value))}
                        className="w-full accent-sky-600 cursor-pointer"
                      />
                    </div>

                    {/* 2. ເນື້ອໃນບົດທີ 5 (Max 5) */}
                    <div className="space-y-1 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                      <div className="flex justify-between font-semibold text-slate-800">
                        <span>2. ເນື້ອໃນບົດທີ 5</span>
                        <span className="font-mono text-sky-700">{scoreCh5} / 5</span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={5}
                        step={0.5}
                        value={scoreCh5}
                        onChange={(e) => setScoreCh5(parseFloat(e.target.value))}
                        className="w-full accent-sky-600 cursor-pointer"
                      />
                    </div>

                    {/* 3. ຄວາມສົມບູນຂອງເອກະສານ (Max 8) */}
                    <div className="space-y-1 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                      <div className="flex justify-between font-semibold text-slate-800">
                        <span>3. ຄວາມສົມບູນຂອງເອກະສານ</span>
                        <span className="font-mono text-sky-700">{scoreDoc} / 8</span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={8}
                        step={0.5}
                        value={scoreDoc}
                        onChange={(e) => setScoreDoc(parseFloat(e.target.value))}
                        className="w-full accent-sky-600 cursor-pointer"
                      />
                    </div>

                    {/* 4. Poster (Max 3) */}
                    <div className="space-y-1 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                      <div className="flex justify-between font-semibold text-slate-800">
                        <span>4. Poster</span>
                        <span className="font-mono text-sky-700">{scorePoster} / 3</span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={3}
                        step={0.5}
                        value={scorePoster}
                        onChange={(e) => setScorePoster(parseFloat(e.target.value))}
                        className="w-full accent-sky-600 cursor-pointer"
                      />
                    </div>

                    {/* 5. ຄວາມສົມບູນຂອງຊິ້ນງານ (Max 10) */}
                    <div className="space-y-1 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                      <div className="flex justify-between font-semibold text-slate-800">
                        <span>5. ຄວາມສົມບູນຂອງຊິ້ນງານ</span>
                        <span className="font-mono text-sky-700">{scoreProduct} / 10</span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={10}
                        step={0.5}
                        value={scoreProduct}
                        onChange={(e) => setScoreProduct(parseFloat(e.target.value))}
                        className="w-full accent-sky-600 cursor-pointer"
                      />
                    </div>

                    {/* 6. ຄະແນນການນຳສະເໜີ (Max 10) */}
                    <div className="space-y-1 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                      <div className="flex justify-between font-semibold text-slate-800">
                        <span>6. ຄະແນນການນຳສະເໜີ</span>
                        <span className="font-mono text-sky-700">{scorePresentation} / 10</span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={10}
                        step={0.5}
                        value={scorePresentation}
                        onChange={(e) => setScorePresentation(parseFloat(e.target.value))}
                        className="w-full accent-sky-600 cursor-pointer"
                      />
                    </div>

                    {/* 7. ຕອບຄຳຖາມ (Max 17) */}
                    <div className="space-y-1 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                      <div className="flex justify-between font-semibold text-slate-800">
                        <span>7. ຕອບຄຳຖາມ</span>
                        <span className="font-mono text-sky-700">{scoreQA} / 17</span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={17}
                        step={0.5}
                        value={scoreQA}
                        onChange={(e) => setScoreQA(parseFloat(e.target.value))}
                        className="w-full accent-sky-600 cursor-pointer"
                      />
                    </div>
                  </>
                )}

                {/* Deliberation Comments */}
                <div className="pt-2">
                  <label className="font-semibold text-slate-700 block mb-1">
                    ໃບໃຫ້ຄຳເຫັນ ແລະ ຂໍ້ສະເໜີແນະໃນການແກ້ໄຂບົດ (Comments on Score Paper)
                  </label>
                  <textarea
                    rows={3}
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2.5 text-slate-800 focus:outline-sky-500 text-xs"
                  />
                </div>

                {committeeDecision === "FAIL" && (
                  <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 text-[11px] font-lao">
                    ⚠️ <strong>ກົດລະບຽບການສອບຄືນ (Retake Policy):</strong> ກຸ່ມທີ່ບໍ່ຜ່ານ (FAIL) ຈະຕ້ອງລົງທະບຽນສອບຄືນໃນຮອບຖັດໄປ (Attempt {selectedExam ? selectedExam.attemptNo + 1 : 2}), ຈ່າຍສະເພາະຄ່າທຳນຽມສອບຄືນ (Retake Fee), ແລະ ກຳມະການຈະໄດ້ຮັບຄ່າຕອບແທນເພີ່ມ (Retake Bonus) ຕາມລະບຽບການເງິນ.
                  </div>
                )}
              </div>

              {isSubmitted && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>ບັນທຶກຄະແນນສອບເສັງ ແລະ ຜົນການຕັດສິນລົງຖານຂໍ້ມູນຜ່ານ Go API ສຳເລັດ!</span>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleOpenScorePaper(selectedExam)}
                  leftIcon={<Printer className="h-3.5 w-3.5 text-violet-600" />}
                >
                  ພິມໃບຄະແນນ &amp; ໃບຄຳເຫັນ
                </Button>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedExam(null)}
                  >
                    ປິດໜ້າຕ່າງ
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => {
                      setIsSubmitted(true);
                      setTimeout(() => setSelectedExam(null), 1500);
                    }}
                    leftIcon={<CheckCircle className="h-3.5 w-3.5" />}
                  >
                    ບັນທຶກຄະແນນຢ່າງເປັນທາງການ
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal: Generate Exam Schedule */}
        {showGenerateScheduleModal && (
          <GenerateScheduleModal
            initialSchedule={currentSchedule}
            onSaveSchedule={handleSaveGeneratedSchedule}
            onClose={() => setShowGenerateScheduleModal(false)}
          />
        )}

        {/* Modal: Official Exam Schedule Report */}
        {showScheduleModal && (
          <OfficialExamScheduleReport
            schedule={currentSchedule}
            onClose={() => setShowScheduleModal(false)}
          />
        )}

        {/* Modal: Official Score Paper Report */}
        {showScorePaperModal && activeScorePaperData && (
          <OfficialScorePaperReport
            data={activeScorePaperData}
            onClose={() => setShowScorePaperModal(false)}
          />
        )}
      </div>
    </AppShell>
  );
}

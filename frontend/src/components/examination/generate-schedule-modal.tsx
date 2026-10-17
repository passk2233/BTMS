"use client";

import React, { useState, useMemo } from "react";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  UserCheck,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Trash2,
  ArrowUpDown,
  Sparkles,
  X,
  Shuffle,
  Sun,
  Moon,
  Coffee,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExamDaySchedule, ScheduleItem } from "@/components/reports/official-exam-schedule-report";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { committeeSearchableOptions, teacherSearchableOptions } from "@/lib/academic-directory";

interface CandidateGroup {
  groupNo: number;
  classroom: string;
  topicTitle: string;
  advisor: string;
  members: { index: number; name: string }[];
}

// Available thesis groups ready for examination
const candidateGroupsPool: CandidateGroup[] = [
  {
    groupNo: 1,
    classroom: "2IT-CON",
    topicTitle: "ລະບົບຈັດການເອກະສານຂອງສາຍການບິນລາວ",
    advisor: "ທ່ານ ຮສ. ຫາ ບຸນທັນ",
    members: [
      { index: 1, name: "ແຮັກເຕ້ ແສງສະຫວ່າງ" },
      { index: 2, name: "ບຸນທະວີ ວໍລະລາດ" },
      { index: 3, name: "ສົມພົງ ສີສຸລາດ" },
    ],
  },
  {
    groupNo: 7,
    classroom: "4IT2",
    topicTitle: "ການພັດທະນາລະບົບຖາມ-ຕອບອັດຕະໂນມັດ ສຳລັບພາກວິຊາ CEIT ໂດຍນຳໃຊ້ເຕັກນິກ RAG",
    advisor: "ທ່ານ ຮສ. ຫາ ບຸນທັນ",
    members: [
      { index: 1, name: "ທ້າວ ບຸນມີ ບຸນທະວອນ" },
      { index: 2, name: "ນາງ ອາລຸນນາ ທັນລະສິນ" },
      { index: 3, name: "ທ້າວ ເກ້ ຄີ" },
    ],
  },
  {
    groupNo: 4,
    classroom: "4IT3",
    topicTitle: "ລະບົບຈັດການການໃຊ້ໄຟຟ້າໃນຫ້ອງແຖວ (ກໍລະນີສຶກສາ)",
    advisor: "ທ່ານ ຮສ. ຫາ ບຸນທັນ",
    members: [
      { index: 1, name: "ນາງ ພອຍໄພລິນ ໄຊຍະລາດ" },
      { index: 2, name: "ທ້າວ ກໍດຳ ອິນທະໂສມ" },
      { index: 3, name: "ທ້າວ ໄນຮ່ອນ ພະມີໄຊ" },
    ],
  },
  {
    groupNo: 56,
    classroom: "4Com2",
    topicTitle: "ການພັດທະນາລະບົບ White-box Pentesting ອັດຕະໂນມັດດ້ວຍ Local AI: AMS",
    advisor: "ທ່ານ ປອ. ຊານຸພາບ ພົມແກ້ວມາ",
    members: [
      { index: 1, name: "ທ້າວ ເດັກກີລານ ລາດສະຫວາດ" },
      { index: 2, name: "ທ້າວ ອົງກອນ ພູມມິທາ" },
      { index: 3, name: "ທ້າວ ພິລະສຸກ ແກ້ວບຸນມາ" },
    ],
  },
  {
    groupNo: 25,
    classroom: "2IT_CON",
    topicTitle: "ລະບົບຄຸ້ມຄອງຫ້ອງແຖວຕ່າງໆ",
    advisor: "ທ່ານ ຮສ. ປອ. ຄຳເພັດ ບຸນນະວົງ",
    members: [
      { index: 1, name: "ຄັນໄຊ ມະນີວົງ" },
      { index: 2, name: "ບຸນມີ ພົມມະຈັນ" },
      { index: 3, name: "ດວງຕາ ຄຳຈັນເພັງ" },
    ],
  },
  {
    groupNo: 32,
    classroom: "4Com2",
    topicTitle: "ລະບົບຄຸ້ມຄອງຕິດຕາມການສອບ-ການສອນຂອງອາຈານປະຈຳພາກວິຊາ CEIT",
    advisor: "ທ່ານ ອຈ. ເມກະລອນ ບຸນທັນ",
    members: [
      { index: 1, name: "ນາງ ແບບນາລີ ວົງພະຈັນ" },
      { index: 2, name: "ນາງ ພູກທິບຍາດ ອານຸວົງສີຣິວົງ" },
      { index: 3, name: "ທ້າວ ສຸພາໄຊ ສຸບານາວົງ" },
    ],
  },
  {
    groupNo: 39,
    classroom: "2IT-CON",
    topicTitle: "ລະບົບອອກເອກະສານໃຫ້ນັກສຶກສາໂທຕ່າງປະເທດ",
    advisor: "ທ່ານ ປອ. ພອນໄຊ ສີລະກອນ",
    members: [
      { index: 1, name: "ຄຳຫຼວງ ວັນນະວົງ" },
      { index: 2, name: "ວິລະສອນ ສີຫາລາດ" },
      { index: 3, name: "ພອນສະຫວັນ ວາງເຢັນ" },
    ],
  },
  {
    groupNo: 5,
    classroom: "4Com3",
    topicTitle: "ລະບົບຈັດການຂໍ້ມູນບໍລິການເຊົ່າລົດຈັກ-ລົດຖີບ",
    advisor: "ທ່ານ ຮສ. ຫາ ບຸນທັນ",
    members: [
      { index: 1, name: "ທ້າວ ຫຼ້າແກ້ວ ແສງວາລຸນ" },
      { index: 2, name: "ນາງ ທິບພະຈັນ ທຳມະວົງ" },
      { index: 3, name: "ນາງ ວົງມະນີ ລາບບັນດິດ" },
    ],
  },
  {
    groupNo: 20,
    classroom: "2IT-CON",
    topicTitle: "ເວັບໄຊສັ່ງອາຫານຜ່ານ QR code ຂອງຮ້ານອາຫານໂຄກແຟ",
    advisor: "ທ່ານ ປອ. ສົມພອນ ກັນທະວົງ",
    members: [
      { index: 1, name: "ມັກທະພອນ ສຸຣິພັນ" },
      { index: 2, name: "ແສງມະຈັນ ອິນດາວົງ" },
    ],
  },
  {
    groupNo: 52,
    classroom: "4IT3",
    topicTitle: "ລະບົບຈັດການຮ້ານຂາຍແຜ່ນແພ",
    advisor: "ທ່ານ ປອ. ພອນໄຊ ສີລະກອນ",
    members: [
      { index: 1, name: "ພອນສັກດາ ແກ້ວມະນີ" },
      { index: 2, name: "ທ້າວ ພຸດທະວາງ ແສນມະນີວົງ" },
      { index: 3, name: "ທ້າວ ສົມພະວັງ ແກ້ວພັນທະນາ" },
    ],
  },
];

// Predefined 35-minute defense interval slots
const morningIntervals = [
  "8:30 - 9:05 am",
  "9:10 - 9:45 am",
  "9:50 - 10:25 am",
  "10:30 - 11:05 am",
  "11:10 - 11:45 am",
];

const afternoonIntervals = [
  "13:00 - 13:35 pm",
  "13:40 - 14:15 pm",
  "14:20 - 14:55 pm",
  "15:00 - 15:35 pm",
  "15:40 - 16:15 pm",
];

interface GenerateScheduleModalProps {
  initialSchedule?: ExamDaySchedule;
  onSaveSchedule: (newSchedule: ExamDaySchedule) => void;
  onClose: () => void;
}

export function GenerateScheduleModal({
  initialSchedule,
  onSaveSchedule,
  onClose,
}: GenerateScheduleModalProps) {
  // 1. Exam Date & Location State
  const [examDate, setExamDate] = useState("2026-07-15");
  const [dayTitleLao, setDayTitleLao] = useState(
    initialSchedule?.dayTitle || "ວັນພຸດ ວັນທີ 15 ກໍລະກົດ 2026"
  );
  const [room, setRoom] = useState(initialSchedule?.room || "ຫ້ອງສອບເສັງ Conference");
  const [deputyHeadName, setDeputyHeadName] = useState(
    initialSchedule?.deputyHeadName || "ຮສ. ແສງລັດສະໝີ ຈັນທະມິນາວົງ"
  );

  // 2. Committee Panels State
  const [morningChairman, setMorningChairman] = useState(
    initialSchedule?.morningCommittees.chairman || "ທ່ານ ຮສ. ແສງລັດສະໝີ ຈັນທະມິນາວົງ"
  );
  const [morningMembers, setMorningMembers] = useState<string[]>(
    initialSchedule?.morningCommittees.members || [
      "ທ່ານ ອຈ. ມະກະລອນ ບຸນທັນ",
      "ທ່ານ ນາງ ລັດຕິກາ ຄົມສອນລະສິນ",
    ]
  );

  const [afternoonChairman, setAfternoonChairman] = useState(
    initialSchedule?.afternoonCommittees.chairman || "ທ່ານ ຮສ. ແສງລັດສະໝີ ຈັນທະມິນາວົງ"
  );
  const [afternoonMembers, setAfternoonMembers] = useState<string[]>(
    initialSchedule?.afternoonCommittees.members || [
      "ທ່ານ ຮສ. ປອ. ຄຳເພັດ ບຸນນະວົງ",
      "ທ່ານ ສຸກສະຫວັນ ຈຸນທະລີ",
    ]
  );

  // New member text inputs
  const [newMorningMember, setNewMorningMember] = useState("");
  const [newAfternoonMember, setNewAfternoonMember] = useState("");

  // 3. Assigned Slots State
  const [morningSlots, setMorningSlots] = useState<ScheduleItem[]>(
    initialSchedule?.morningSlots || []
  );
  const [afternoonSlots, setAfternoonSlots] = useState<ScheduleItem[]>(
    initialSchedule?.afternoonSlots || []
  );

  // Auto-format date in Lao when date input changes
  const handleDateChange = (dateStr: string) => {
    setExamDate(dateStr);
    try {
      const d = new Date(dateStr);
      const daysLao = ["ວັນອາທິດ", "ວັນຈັນ", "ວັນອັງຄານ", "ວັນພຸດ", "ວັນພະຫັດ", "ວັນສຸກ", "ວັນເສົາ"];
      const monthsLao = [
        "ມັງກອນ", "ກຸມພາ", "ມີນາ", "ເມສາ", "ພຶດສະພາ", "ມິຖຸນາ",
        "ກໍລະກົດ", "ສິງຫາ", "ກັນຍາ", "ຕຸລາ", "ພະຈິກ", "ທັນວາ"
      ];
      const dayName = daysLao[d.getDay()];
      const dayNum = d.getDate();
      const monthName = monthsLao[d.getMonth()];
      const year = d.getFullYear();
      setDayTitleLao(`${dayName} ວັນທີ ${dayNum} ${monthName} ${year}`);
    } catch {
      setDayTitleLao(dateStr);
    }
  };

  // Add / Remove Morning Committee Member
  const handleAddMorningMember = (nameToAdd?: string) => {
    const target = (nameToAdd || newMorningMember).trim();
    if (target && !morningMembers.includes(target)) {
      setMorningMembers([...morningMembers, target]);
      setNewMorningMember("");
    }
  };

  const handleRemoveMorningMember = (index: number) => {
    setMorningMembers(morningMembers.filter((_, i) => i !== index));
  };

  // Add / Remove Afternoon Committee Member
  const handleAddAfternoonMember = (nameToAdd?: string) => {
    const target = (nameToAdd || newAfternoonMember).trim();
    if (target && !afternoonMembers.includes(target)) {
      setAfternoonMembers([...afternoonMembers, target]);
      setNewAfternoonMember("");
    }
  };

  const handleRemoveAfternoonMember = (index: number) => {
    setAfternoonMembers(afternoonMembers.filter((_, i) => i !== index));
  };

  // 4. Critical Invariant Check: ADVISOR MUST NOT BE A COMMITTEE MEMBER
  const conflicts = useMemo(() => {
    const list: { groupNo: number; advisor: string; session: "morning" | "afternoon"; conflictedMember: string }[] = [];
    
    // Check morning
    const morningCommitteeFull = [morningChairman, ...morningMembers];
    morningSlots.forEach((slot) => {
      morningCommitteeFull.forEach((cm) => {
        if (slot.advisor && cm && (slot.advisor.includes(cm) || cm.includes(slot.advisor))) {
          list.push({
            groupNo: slot.groupNo,
            advisor: slot.advisor,
            session: "morning",
            conflictedMember: cm,
          });
        }
      });
    });

    // Check afternoon
    const afternoonCommitteeFull = [afternoonChairman, ...afternoonMembers];
    afternoonSlots.forEach((slot) => {
      afternoonCommitteeFull.forEach((cm) => {
        if (slot.advisor && cm && (slot.advisor.includes(cm) || cm.includes(slot.advisor))) {
          list.push({
            groupNo: slot.groupNo,
            advisor: slot.advisor,
            session: "afternoon",
            conflictedMember: cm,
          });
        }
      });
    });

    return list;
  }, [morningChairman, morningMembers, afternoonChairman, afternoonMembers, morningSlots, afternoonSlots]);

  // 5. Automatic Schedule Generation Algorithm
  const handleAutoGenerate = () => {
    const morningCommittee = [morningChairman, ...morningMembers];
    const afternoonCommittee = [afternoonChairman, ...afternoonMembers];

    const morningResult: ScheduleItem[] = [];
    const afternoonResult: ScheduleItem[] = [];
    const unassigned: CandidateGroup[] = [];

    // Sort candidate groups
    candidateGroupsPool.forEach((group) => {
      const isAdvisorInMorning = morningCommittee.some(
        (cm) => cm && group.advisor && (group.advisor.includes(cm) || cm.includes(group.advisor))
      );
      const isAdvisorInAfternoon = afternoonCommittee.some(
        (cm) => cm && group.advisor && (group.advisor.includes(cm) || cm.includes(group.advisor))
      );

      // Prefer assigning to session with NO advisor conflict
      if (!isAdvisorInMorning && morningResult.length < morningIntervals.length) {
        morningResult.push({
          groupNo: group.groupNo,
          timeSlot: morningIntervals[morningResult.length],
          classroom: group.classroom,
          topicTitle: group.topicTitle,
          advisor: group.advisor,
          members: group.members,
        });
      } else if (!isAdvisorInAfternoon && afternoonResult.length < afternoonIntervals.length) {
        afternoonResult.push({
          groupNo: group.groupNo,
          timeSlot: afternoonIntervals[afternoonResult.length],
          classroom: group.classroom,
          topicTitle: group.topicTitle,
          advisor: group.advisor,
          members: group.members,
        });
      } else if (morningResult.length < morningIntervals.length && !isAdvisorInMorning) {
        morningResult.push({
          groupNo: group.groupNo,
          timeSlot: morningIntervals[morningResult.length],
          classroom: group.classroom,
          topicTitle: group.topicTitle,
          advisor: group.advisor,
          members: group.members,
        });
      } else {
        unassigned.push(group);
      }
    });

    // Fill remaining slots if any
    unassigned.forEach((group) => {
      if (morningResult.length < morningIntervals.length) {
        morningResult.push({
          groupNo: group.groupNo,
          timeSlot: morningIntervals[morningResult.length],
          classroom: group.classroom,
          topicTitle: group.topicTitle,
          advisor: group.advisor,
          members: group.members,
        });
      } else if (afternoonResult.length < afternoonIntervals.length) {
        afternoonResult.push({
          groupNo: group.groupNo,
          timeSlot: afternoonIntervals[afternoonResult.length],
          classroom: group.classroom,
          topicTitle: group.topicTitle,
          advisor: group.advisor,
          members: group.members,
        });
      }
    });

    setMorningSlots(morningResult);
    setAfternoonSlots(afternoonResult);
  };

  // Move group between sessions
  const handleMoveToAfternoon = (index: number) => {
    const item = morningSlots[index];
    if (!item) return;
    const newMorning = morningSlots.filter((_, i) => i !== index);
    // re-index time slots
    const reindexedMorning = newMorning.map((slot, i) => ({
      ...slot,
      timeSlot: morningIntervals[i] || slot.timeSlot,
    }));
    const newAfternoon = [
      ...afternoonSlots,
      {
        ...item,
        timeSlot: afternoonIntervals[afternoonSlots.length] || "16:20 - 16:55 pm",
      },
    ];
    setMorningSlots(reindexedMorning);
    setAfternoonSlots(newAfternoon);
  };

  const handleMoveToMorning = (index: number) => {
    const item = afternoonSlots[index];
    if (!item) return;
    const newAfternoon = afternoonSlots.filter((_, i) => i !== index);
    const reindexedAfternoon = newAfternoon.map((slot, i) => ({
      ...slot,
      timeSlot: afternoonIntervals[i] || slot.timeSlot,
    }));
    const newMorning = [
      ...morningSlots,
      {
        ...item,
        timeSlot: morningIntervals[morningSlots.length] || "11:50 - 12:25 pm",
      },
    ];
    setMorningSlots(newMorning);
    setAfternoonSlots(reindexedAfternoon);
  };

  // Save and generate
  const handleSave = () => {
    const newSchedule: ExamDaySchedule = {
      dayTitle: dayTitleLao,
      room,
      deputyHeadName,
      morningCommittees: {
        chairman: morningChairman,
        members: morningMembers,
      },
      afternoonCommittees: {
        chairman: afternoonChairman,
        members: afternoonMembers,
      },
      morningSlots,
      afternoonSlots,
    };
    onSaveSchedule(newSchedule);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/80 backdrop-blur-sm p-3 sm:p-6 flex items-center justify-center font-sans">
      <div className="w-full max-w-5xl rounded-2xl bg-white shadow-2xl border border-slate-200 flex flex-col max-h-[92vh] overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 bg-slate-50 shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-100 text-sky-700 font-bold">
              <Sparkles className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-lg font-bold text-slate-900 font-lao">
                ສ້າງຕາຕະລາງສອບເສັງອັດຕະໂນມັດ (Generate Exam Schedule)
              </h2>
              <p className="text-xs text-slate-500 font-lao">
                ກຳນົດວັນທີສອບ, ແຕ່ງຕັ້ງຄະນະກຳມະການ ແລະ ຈັດເວລາປ້ອງກັນໂດຍກວດສອບບໍ່ໃຫ້ອາຈານທີ່ປຶກສາເປັນກຳມະການ
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body (Scrollable) */}
        <div className="overflow-y-auto p-6 space-y-6">
          {/* Invariant Warning Banner if Conflicts Exist */}
          {conflicts.length > 0 ? (
            <div className="rounded-xl border border-rose-300 bg-rose-50 p-4 text-rose-950 flex items-start gap-3 animate-in fade-in">
              <ShieldAlert className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
              <div className="text-xs font-lao space-y-1">
                <span className="font-bold text-sm text-rose-800">
                  ພົບຂໍ້ຂັດແຍ່ງ: ອາຈານທີ່ປຶກສາເປັນກຳມະການສອບ ({conflicts.length} ກຸ່ມ)
                </span>
                <p className="text-rose-700">
                  ຕາມລະບຽບການສອບເສັງ ອາຈານທີ່ປຶກສາຕ້ອງບໍ່ເປັນກຳມະການຕັດສິນຜົນຂອງກຸ່ມຕົນເອງ:
                </p>
                <ul className="list-disc list-inside space-y-0.5 pt-1 text-rose-800">
                  {conflicts.map((c, i) => (
                    <li key={i}>
                      ກຸ່ມ {c.groupNo} (ທີ່ປຶກສາ: {c.advisor}) ຖືກຈັດໃນຮອບ{c.session === "morning" ? "ເຊົ້າ" : "ແລງ"} ເຊິ່ງມີ {c.conflictedMember} ເປັນກຳມະການ
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-emerald-300 bg-emerald-50/70 p-3 text-emerald-950 flex items-center justify-between text-xs font-lao">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
                <span className="font-semibold text-emerald-800">
                  ກວດສອບຄວາມຖືກຕ້ອງແລ້ວ: ບໍ່ມີອາຈານທີ່ປຶກສາເປັນກຳມະການສອບຂອງກຸ່ມຕົນເອງ (0 ຂໍ້ຂັດແຍ່ງ)
                </span>
              </div>
              <Badge variant="emerald">Compliant</Badge>
            </div>
          )}

          {/* Section 1: Date & General Settings */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-lao">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-sky-600" /> ວັນທີສອບເສັງ (Exam Date)
              </label>
              <input
                type="date"
                value={examDate}
                onChange={(e) => handleDateChange(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-800 shadow-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
              />
              <span className="mt-1 block text-[11px] font-medium text-sky-700">
                {dayTitleLao}
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-sky-600" /> ຫ້ອງສອບເສັງ (Exam Room)
              </label>
              <input
                type="text"
                value={room}
                onChange={(e) => setRoom(e.target.value)}
                placeholder="ເຊັ່ນ: ຫ້ອງສອບເສັງ Conference, ຫ້ອງ 402..."
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-800 shadow-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <UserCheck className="h-3.5 w-3.5 text-sky-600" /> ຮອງຫົວໜ້າພາກວິຊາ (Signer)
              </label>
              <SearchableSelect
                options={teacherSearchableOptions}
                value={deputyHeadName}
                onChange={(val) => setDeputyHeadName(val)}
                placeholder="-- ເລືອກຮອງຫົວໜ້າພາກວິຊາ --"
                searchPlaceholder="ພິມຊື່ອາຈານ, ຕຳແໜ່ງ..."
                allowCustom={true}
                customPlaceholder="+ ປ້ອນຊື່ເອງ:"
              />
            </div>
          </div>

          {/* Section 2: Appoint Committee Panels (Morning & Afternoon) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 font-lao">
            {/* Morning Panel */}
            <Card className="border-sky-200 bg-sky-50/20">
              <CardHeader className="pb-2.5 pt-3.5 px-4 border-b border-sky-100 flex flex-row items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sun className="h-4 w-4 text-amber-500" />
                  <CardTitle className="text-xs font-bold text-sky-950 uppercase tracking-wider">
                    ກຳມະການຮອບເຊົ້າ (08:30 - 11:45)
                  </CardTitle>
                </div>
                <Badge variant="sky">{morningMembers.length + 1} ທ່ານ</Badge>
              </CardHeader>
              <CardContent className="p-4 space-y-3 text-xs">
                {/* Chairman */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    ປະທານກຳມະການ (Chairman):
                  </label>
                  <SearchableSelect
                    options={committeeSearchableOptions}
                    value={morningChairman}
                    onChange={(val) => setMorningChairman(val)}
                    placeholder="-- ເລືອກປະທານກຳມະການ --"
                    searchPlaceholder="ພິມຊື່ອາຈານກຳມະການ..."
                    allowCustom={true}
                    customPlaceholder="+ ປ້ອນຊື່ເອງ:"
                  />
                </div>

                {/* Members */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    ກຳມະການ (Members):
                  </label>
                  <div className="space-y-1.5">
                    {morningMembers.map((m, idx) => (
                      <div key={idx} className="flex items-center justify-between bg-white rounded-md border border-slate-200 px-2.5 py-1">
                        <span className="text-slate-800">{m}</span>
                        <button
                          onClick={() => handleRemoveMorningMember(idx)}
                          className="text-slate-400 hover:text-rose-600"
                          title="ລຶບກຳມະການ"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Add Member with Searchable Dropdown */}
                  <div className="mt-2 space-y-1">
                    <label className="text-[10px] text-slate-500 font-semibold block">
                      ເພີ່ມກຳມະການ (Searchable Dropdown):
                    </label>
                    <div className="flex items-center gap-1.5">
                      <div className="flex-1">
                        <SearchableSelect
                          options={committeeSearchableOptions.filter(
                            (c) => c.value !== morningChairman && !morningMembers.includes(c.value)
                          )}
                          value={newMorningMember}
                          onChange={(val) => {
                            setNewMorningMember(val);
                            if (val) handleAddMorningMember(val);
                          }}
                          placeholder="-- ຄົ້ນຫາ ແລະ ເລືອກກຳມະການ --"
                          searchPlaceholder="ພິມຊື່, ຕຳແໜ່ງ ຫຼື ພາກວິຊາ..."
                          allowCustom={true}
                          customPlaceholder="+ ເພີ່ມຊື່ນີ້:"
                        />
                      </div>
                      <Button
                        size="sm"
                        variant="secondary"
                        className="text-xs h-9 px-2.5 shrink-0"
                        onClick={() => handleAddMorningMember()}
                      >
                        <Plus className="h-3.5 w-3.5 mr-0.5" /> ເພີ່ມ
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Afternoon Panel */}
            <Card className="border-indigo-200 bg-indigo-50/20">
              <CardHeader className="pb-2.5 pt-3.5 px-4 border-b border-indigo-100 flex flex-row items-center justify-between">
                <div className="flex items-center gap-2">
                  <Moon className="h-4 w-4 text-indigo-600" />
                  <CardTitle className="text-xs font-bold text-indigo-950 uppercase tracking-wider">
                    ກຳມະການຮອບແລງ (13:00 - 16:15)
                  </CardTitle>
                </div>
                <Badge variant="violet">{afternoonMembers.length + 1} ທ່ານ</Badge>
              </CardHeader>
              <CardContent className="p-4 space-y-3 text-xs">
                {/* Chairman */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    ປະທານກຳມະການ (Chairman):
                  </label>
                  <SearchableSelect
                    options={committeeSearchableOptions}
                    value={afternoonChairman}
                    onChange={(val) => setAfternoonChairman(val)}
                    placeholder="-- ເລືອກປະທານກຳມະການ --"
                    searchPlaceholder="ພິມຊື່ອາຈານກຳມະການ..."
                    allowCustom={true}
                    customPlaceholder="+ ປ້ອນຊື່ເອງ:"
                  />
                </div>

                {/* Members */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    ກຳມະການ (Members):
                  </label>
                  <div className="space-y-1.5">
                    {afternoonMembers.map((m, idx) => (
                      <div key={idx} className="flex items-center justify-between bg-white rounded-md border border-slate-200 px-2.5 py-1">
                        <span className="text-slate-800">{m}</span>
                        <button
                          onClick={() => handleRemoveAfternoonMember(idx)}
                          className="text-slate-400 hover:text-rose-600"
                          title="ລຶບກຳມະການ"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Add Member with Searchable Dropdown */}
                  <div className="mt-2 space-y-1">
                    <label className="text-[10px] text-slate-500 font-semibold block">
                      ເພີ່ມກຳມະການ (Searchable Dropdown):
                    </label>
                    <div className="flex items-center gap-1.5">
                      <div className="flex-1">
                        <SearchableSelect
                          options={committeeSearchableOptions.filter(
                            (c) => c.value !== afternoonChairman && !afternoonMembers.includes(c.value)
                          )}
                          value={newAfternoonMember}
                          onChange={(val) => {
                            setNewAfternoonMember(val);
                            if (val) handleAddAfternoonMember(val);
                          }}
                          placeholder="-- ຄົ້ນຫາ ແລະ ເລືອກກຳມະການ --"
                          searchPlaceholder="ພິມຊື່, ຕຳແໜ່ງ ຫຼື ພາກວິຊາ..."
                          allowCustom={true}
                          customPlaceholder="+ ເພີ່ມຊື່ນີ້:"
                        />
                      </div>
                      <Button
                        size="sm"
                        variant="secondary"
                        className="text-xs h-9 px-2.5 shrink-0"
                        onClick={() => handleAddAfternoonMember()}
                      >
                        <Plus className="h-3.5 w-3.5 mr-0.5" /> ເພີ່ມ
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Section 3: Slots Auto-Generation Action Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-slate-100/80 p-3.5 rounded-xl border border-slate-200 font-lao">
            <div>
              <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Shuffle className="h-4 w-4 text-sky-600" />
                ຈັດຄິວອັດຕະໂນມັດ 35 ນາທີ/ກຸ່ມ (Auto-Schedule 35-min intervals)
              </span>
              <p className="text-[11px] text-slate-500">
                ຄຳນວນເວລາເຊົ້າ 5 ຊ່ວງ (08:30-11:45) • ພັກທ່ຽງ • ແລງ 5 ຊ່ວງ (13:00-16:15) ພ້ອມກວດສອບທີ່ປຶກສາອັດຕະໂນມັດ
              </p>
            </div>
            <Button
              size="sm"
              variant="primary"
              className="text-xs shrink-0"
              leftIcon={<Sparkles className="h-3.5 w-3.5" />}
              onClick={handleAutoGenerate}
            >
              ຄຳນວນ ແລະ ສ້າງຕາຕະລາງໃໝ່
            </Button>
          </div>

          {/* Section 4: Live Slot Allocation Preview & Manual Adjustment */}
          <div className="space-y-4 font-lao">
            {/* Morning Slots Table */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Sun className="h-3.5 w-3.5 text-amber-500" />
                  ຄິວສອບຮອບເຊົ້າ ({morningSlots.length} ກຸ່ມ)
                </span>
              </div>
              <div className="overflow-x-auto rounded-lg border border-slate-200">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-[11px] font-bold uppercase text-slate-600 border-b border-slate-200">
                    <tr>
                      <th className="py-2 px-2.5 text-center w-12">ກຸ່ມ</th>
                      <th className="py-2 px-3 w-32">ເວລາ</th>
                      <th className="py-2 px-3">ຫົວຂໍ້ບົດ</th>
                      <th className="py-2 px-3 min-w-[140px]">ອາຈານທີ່ປຶກສາ</th>
                      <th className="py-2 px-2.5 text-center w-24">ປັບປ່ຽນ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {morningSlots.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-4 text-center text-slate-400">
                          ກົດປຸ່ມ &quot;ຄຳນວນ ແລະ ສ້າງຕາຕະລາງໃໝ່&quot; ເພື່ອຈັດຄິວອັດຕະໂນມັດ
                        </td>
                      </tr>
                    ) : (
                      morningSlots.map((slot, idx) => {
                        const hasConflict = [morningChairman, ...morningMembers].some(
                          (cm) => cm && slot.advisor && (slot.advisor.includes(cm) || cm.includes(slot.advisor))
                        );
                        return (
                          <tr key={idx} className={hasConflict ? "bg-rose-50/70" : "hover:bg-slate-50"}>
                            <td className="py-2 px-2.5 text-center font-bold text-sky-900">
                              {slot.groupNo}
                            </td>
                            <td className="py-2 px-3 font-mono font-bold text-slate-700">
                              {slot.timeSlot}
                            </td>
                            <td className="py-2 px-3">
                              <div className="font-semibold text-slate-900 line-clamp-1">{slot.topicTitle}</div>
                              <div className="text-[10px] text-slate-400">
                                {slot.classroom} • {slot.members.map((m) => m.name).join(", ")}
                              </div>
                            </td>
                            <td className="py-2 px-3">
                              <span className={hasConflict ? "font-bold text-rose-700" : "text-slate-700"}>
                                {slot.advisor}
                              </span>
                              {hasConflict && (
                                <span className="block text-[10px] font-bold text-rose-600">
                                  ⚠️ ຊ້ຳກັບກຳມະການ
                                </span>
                              )}
                            </td>
                            <td className="py-2 px-2.5 text-center">
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-[10px] h-6 px-1.5"
                                onClick={() => handleMoveToAfternoon(idx)}
                                title="ຍ້າຍໄປຮອບແລງ"
                              >
                                ຍ້າຍໄປແລງ ↓
                              </Button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Lunch Break Divider */}
            <div className="flex items-center justify-center gap-2 py-2 bg-amber-50 rounded-lg border border-amber-200 text-amber-900 text-xs font-bold">
              <Coffee className="h-4 w-4 text-amber-700" />
              <span>11:45 - 13:00 : ພັກຜ່ອນ ແລະ ຮັບປະທານອາຫານທ່ຽງ (Lunch Break)</span>
            </div>

            {/* Afternoon Slots Table */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Moon className="h-3.5 w-3.5 text-indigo-600" />
                  ຄິວສອບຮອບແລງ ({afternoonSlots.length} ກຸ່ມ)
                </span>
              </div>
              <div className="overflow-x-auto rounded-lg border border-slate-200">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-[11px] font-bold uppercase text-slate-600 border-b border-slate-200">
                    <tr>
                      <th className="py-2 px-2.5 text-center w-12">ກຸ່ມ</th>
                      <th className="py-2 px-3 w-32">ເວລາ</th>
                      <th className="py-2 px-3">ຫົວຂໍ້ບົດ</th>
                      <th className="py-2 px-3 min-w-[140px]">ອາຈານທີ່ປຶກສາ</th>
                      <th className="py-2 px-2.5 text-center w-24">ປັບປ່ຽນ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {afternoonSlots.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-4 text-center text-slate-400">
                          ຍັງບໍ່ທັນມີກຸ່ມສອບຮອບແລງ
                        </td>
                      </tr>
                    ) : (
                      afternoonSlots.map((slot, idx) => {
                        const hasConflict = [afternoonChairman, ...afternoonMembers].some(
                          (cm) => cm && slot.advisor && (slot.advisor.includes(cm) || cm.includes(slot.advisor))
                        );
                        return (
                          <tr key={idx} className={hasConflict ? "bg-rose-50/70" : "hover:bg-slate-50"}>
                            <td className="py-2 px-2.5 text-center font-bold text-sky-900">
                              {slot.groupNo}
                            </td>
                            <td className="py-2 px-3 font-mono font-bold text-slate-700">
                              {slot.timeSlot}
                            </td>
                            <td className="py-2 px-3">
                              <div className="font-semibold text-slate-900 line-clamp-1">{slot.topicTitle}</div>
                              <div className="text-[10px] text-slate-400">
                                {slot.classroom} • {slot.members.map((m) => m.name).join(", ")}
                              </div>
                            </td>
                            <td className="py-2 px-3">
                              <span className={hasConflict ? "font-bold text-rose-700" : "text-slate-700"}>
                                {slot.advisor}
                              </span>
                              {hasConflict && (
                                <span className="block text-[10px] font-bold text-rose-600">
                                  ⚠️ ຊ້ຳກັບກຳມະການ
                                </span>
                              )}
                            </td>
                            <td className="py-2 px-2.5 text-center">
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-[10px] h-6 px-1.5"
                                onClick={() => handleMoveToMorning(idx)}
                                title="ຍ້າຍໄປຮອບເຊົ້າ"
                              >
                                ຍ້າຍໄປເຊົ້າ ↑
                              </Button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between border-t border-slate-200 px-6 py-3.5 bg-slate-50 shrink-0 font-lao">
          <div className="text-xs text-slate-500">
            ລວມທັງໝົດ: <strong className="text-slate-800">{morningSlots.length + afternoonSlots.length}</strong> ກຸ່ມສອບ
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onClose}>
              ຍົກເລີກ
            </Button>
            <Button
              variant="primary"
              size="sm"
              leftIcon={<CheckCircle2 className="h-4 w-4" />}
              onClick={handleSave}
            >
              ບັນທຶກ ແລະ ນຳໃຊ້ຕາຕະລາງນີ້
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

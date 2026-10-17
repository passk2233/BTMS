"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  FileCheck2,
  BookCheck,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Clock,
  Search,
  Filter,
  Users,
  Calendar,
  Printer,
  FileText,
  UserCheck,
  Building2,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  MessageSquare,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  DollarSign,
  AlertTriangle,
  RotateCcw,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge, BadgeVariant } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SearchableSelect, SearchableOption } from "@/components/ui/searchable-select";
import { teacherSearchableOptions, studentSearchableOptions } from "@/lib/academic-directory";

export interface ProposalTrackingGroup {
  id: string;
  groupNo: number;
  classroom: string;
  topicTitleLao: string;
  topicTitleEn: string;
  advisor: string;
  academicYear: string;
  members: { name: string; studentId: string }[];
  
  // 1. Intake & Hardcopy Document Submission
  hasHardcopySubmitted: boolean;
  hardcopySubmittedDate?: string;
  hasPermissionPaperSubmitted: boolean;
  hasExamFeePaid: boolean;
  examFeeReceiptNo?: string;

  // 2. Proposal Exam Result & Attempts
  examStatus: "NOT_SCHEDULED" | "SCHEDULED" | "PASSED" | "FAILED_RETAKE_2" | "FAILED_RETAKE_3";
  defenseAttempt: 1 | 2 | 3;
  defenseScore?: number; // out of 60
  defenseDate?: string;
  committeeComments?: string[];

  // 3. Post-Defense Revised Hardcopy Book (Fixed from comments)
  hasRevisedHardcopySubmitted: boolean;
  revisedHardcopySubmittedDate?: string;
  advisorRevisionEndorsed: boolean;
  revisionDeadline?: string;
  daysRemainingForRevision?: number;
}

const mockProposalGroups: ProposalTrackingGroup[] = [
  {
    id: "g1",
    groupNo: 1,
    classroom: "2IT-CON",
    topicTitleLao: "ລະບົບຈັດການເອກະສານຂອງສາຍການບິນລາວ",
    topicTitleEn: "Document Management System for Lao Airlines",
    advisor: "ທ່ານ ຮສ. ຫາ ບຸນທັນ",
    academicYear: "2025 - 2026",
    members: [
      { name: "ແຮັກເຕ້ ແສງສະຫວ່າງ", studentId: "2IT-001" },
      { name: "ບຸນທະວີ ວໍລະລາດ", studentId: "2IT-002" },
      { name: "ສົມພົງ ສີສຸລາດ", studentId: "2IT-003" },
    ],
    hasHardcopySubmitted: true,
    hardcopySubmittedDate: "2026-09-08",
    hasPermissionPaperSubmitted: true,
    hasExamFeePaid: true,
    examFeeReceiptNo: "REC-2026-081",
    examStatus: "PASSED",
    defenseAttempt: 1,
    defenseScore: 56.5,
    defenseDate: "2026-09-15",
    committeeComments: [
      "ເພີ່ມເຕີມ Flowchart ຂອງການຈັດເກັບໄຟລ໌ ແລະ ສິດທິການເຂົ້າເຖິງໃນບົດທີ 3",
      "ແກ້ໄຂການອ້າງອີງເອກະສານ (Citation) ໃຫ້ຖືກຕາມມາດຕະຖານ APA 7th",
    ],
    hasRevisedHardcopySubmitted: true,
    revisedHardcopySubmittedDate: "2026-09-22",
    advisorRevisionEndorsed: true,
  },
  {
    id: "g2",
    groupNo: 2,
    classroom: "4IT1",
    topicTitleLao: "ປັບປຸງ ແລະ ພັດທະນາລະບົບ AMS ໃນການຈັດການຂໍ້ມູນພາກວິຊາ",
    topicTitleEn: "Improvement and Development of AMS System for Department Management",
    advisor: "ທ່ານ ຮສ. ຫາ ບຸນທັນ",
    academicYear: "2025 - 2026",
    members: [
      { name: "ນາງ ວິໄລຄຳ ບຸນສີລົດ", studentId: "4IT1-012" },
      { name: "ທ້າວ ເພັດສະໝອນ ສີສັມຫວັງ", studentId: "4IT1-018" },
      { name: "ນາງ ສຸກສາຄອນ ໄຊຍະວົງ", studentId: "4IT1-025" },
    ],
    hasHardcopySubmitted: true,
    hardcopySubmittedDate: "2026-09-09",
    hasPermissionPaperSubmitted: true,
    hasExamFeePaid: true,
    examFeeReceiptNo: "REC-2026-084",
    examStatus: "PASSED",
    defenseAttempt: 1,
    defenseScore: 54.0,
    defenseDate: "2026-09-15",
    committeeComments: [
      "ເພີ່ມ Architecture Diagram ສະແດງການເຊື່ອມຕໍ່ລະຫວ່າງ Next.js ກັບ Go backend",
      "ກວດແກ້ຄຳຜິດໃນບົດທີ 1 ແລະ ບົດທີ 2",
    ],
    hasRevisedHardcopySubmitted: true,
    revisedHardcopySubmittedDate: "2026-09-24",
    advisorRevisionEndorsed: true,
  },
  {
    id: "g3",
    groupNo: 3,
    classroom: "4IT1 / 4IT2",
    topicTitleLao: "ລະບົບຈັດການຮ້ານຂາຍເຄື່ອງສຳອາງຂອງຮ້ານ Anika beauty shop",
    topicTitleEn: "Store Management System for Anika Beauty Shop",
    advisor: "ທ່ານ ຮສ. ຫາ ບຸນທັນ",
    academicYear: "2025 - 2026",
    members: [
      { name: "ທ້າວ ເກມ ຂຸນປະເສີດ", studentId: "4IT1-030" },
      { name: "ທ້າວ ທະນາທອນ ສີສົງຄາມ", studentId: "4IT2-033" },
      { name: "ທ້າວ ທັນມະກອນ ບູລົມມະວົງ", studentId: "4IT1-041" },
    ],
    hasHardcopySubmitted: true,
    hardcopySubmittedDate: "2026-09-11",
    hasPermissionPaperSubmitted: true,
    hasExamFeePaid: true,
    examFeeReceiptNo: "REC-2026-090",
    examStatus: "PASSED",
    defenseAttempt: 1,
    defenseScore: 51.5,
    defenseDate: "2026-09-16",
    committeeComments: [
      "ກຳນົດຂອບເຂດຂອງລະບົບ POS ແລະ Stock Inventory ໃຫ້ຈະແຈ້ງ",
      "ປັບປຸງ UI Wireframe ໃຫ້ສອດຄ່ອງກັບຂະບວນການຂາຍຕົວຈິງ",
    ],
    hasRevisedHardcopySubmitted: false,
    revisionDeadline: "2026-10-05",
    daysRemainingForRevision: 3,
    advisorRevisionEndorsed: false,
  },
  {
    id: "g4",
    groupNo: 4,
    classroom: "4IT3",
    topicTitleLao: "ລະບົບຈັດການການໃຊ້ໄຟຟ້າໃນຫ້ອງແຖວ (ກໍລະນີສຶກສາ)",
    topicTitleEn: "Electricity Usage Management System in Row Houses (Case Study)",
    advisor: "ທ່ານ ຮສ. ຫາ ບຸນທັນ",
    academicYear: "2025 - 2026",
    members: [
      { name: "ນາງ ພອຍໄພລິນ ໄຊຍະລາດ", studentId: "4IT3-005" },
      { name: "ທ້າວ ກໍດຳ ອິນທະໂສມ", studentId: "4IT2-011" },
      { name: "ທ້າວ ໄນຮ່ອນ ພະມີໄຊ", studentId: "4IT3-019" },
    ],
    hasHardcopySubmitted: true,
    hardcopySubmittedDate: "2026-09-12",
    hasPermissionPaperSubmitted: true,
    hasExamFeePaid: true,
    examFeeReceiptNo: "REC-2026-092",
    examStatus: "PASSED",
    defenseAttempt: 2,
    defenseScore: 49.0,
    defenseDate: "2026-09-25",
    committeeComments: [
      "ຜ່ານຮອບສອບແກ້ຕົວ 2: ກວດສອບໂປຣໂຕຄໍການສື່ສານ MQTT ກັບ ESP32 ແລ້ວ ຜ່ານເກນ",
      "ໃຫ້ສົ່ງເຫຼັ້ມປັບປຸງທີ່ປິດຊ່ອງຫວ່າງຄວາມປອດໄພ",
    ],
    hasRevisedHardcopySubmitted: true,
    revisedHardcopySubmittedDate: "2026-09-29",
    advisorRevisionEndorsed: true,
  },
  {
    id: "g5",
    groupNo: 5,
    classroom: "4Com3",
    topicTitleLao: "ລະບົບຈັດການຂໍ້ມູນບໍລິການເຊົ່າລົດຈັກ-ລົດຖີບ",
    topicTitleEn: "Rental Service Information Management System for Motorcycles and Bicycles",
    advisor: "ທ່ານ ຮສ. ຫາ ບຸນທັນ",
    academicYear: "2025 - 2026",
    members: [
      { name: "ທ້າວ ຫຼ້າແກ້ວ ແສງວາລຸນ", studentId: "4Com3-002" },
      { name: "ນາງ ທິບພະຈັນ ທຳມະວົງ", studentId: "4Com3-014" },
      { name: "ນາງ ວົງມະນີ ລາບບັນດິດ", studentId: "4Com3-021" },
    ],
    hasHardcopySubmitted: true,
    hardcopySubmittedDate: "2026-09-14",
    hasPermissionPaperSubmitted: true,
    hasExamFeePaid: true,
    examFeeReceiptNo: "REC-2026-095",
    examStatus: "FAILED_RETAKE_2",
    defenseAttempt: 1,
    defenseScore: 33.5,
    defenseDate: "2026-09-17",
    committeeComments: [
      "ບໍ່ຜ່ານຮອບທີ 1 (ຄະແນນ 33.5/60): ບົດທີ 3 ວິທີການສຶກສາບໍ່ຈະແຈ້ງ ບໍ່ມີ ER-Diagram ທີ່ສົມບູນ",
      "ໃຫ້ນັດໝາຍສອບແກ້ຕົວຮອບ 2 (Retake Attempt 2) ພາຍໃນ 14 ວັນ",
    ],
    hasRevisedHardcopySubmitted: false,
    revisionDeadline: "2026-10-08",
    daysRemainingForRevision: 6,
    advisorRevisionEndorsed: false,
  },
  {
    id: "g6",
    groupNo: 6,
    classroom: "2it_con2",
    topicTitleLao: "ອະນິເມຊັ່ນ (ຜົນກະທົບຂອງການຖິ້ມຂີ້ເຫຍື້ອຊະຊາຍ)",
    topicTitleEn: "Animation: The Impact of Indiscriminate Waste Disposal",
    advisor: "ທ່ານ ຮສ. ຫາ ບຸນທັນ",
    academicYear: "2025 - 2026",
    members: [
      { name: "ນາງ ວິໄລພອນ ໄຊຍະແສງ", studentId: "2IT2-004" },
      { name: "ທ້າວ ໄຊຊະນະ ມະນີວົງ", studentId: "2IT2-008" },
      { name: "ນາງ ດາລິສອນ ສີຫາບາດ", studentId: "2IT2-015" },
    ],
    hasHardcopySubmitted: true,
    hardcopySubmittedDate: "2026-09-15",
    hasPermissionPaperSubmitted: true,
    hasExamFeePaid: true,
    examFeeReceiptNo: "REC-2026-099",
    examStatus: "PASSED",
    defenseAttempt: 1,
    defenseScore: 57.0,
    defenseDate: "2026-09-18",
    committeeComments: [
      "ເພີ່ມລາຍລະອຽດ Storyboard ຂອງ Scene ທີ 4-7",
      "ເນັ້ນເພີ່ມສຽງພາກພາສາລາວໃຫ້ມີຄຸນນະພາບສູງ",
    ],
    hasRevisedHardcopySubmitted: true,
    revisedHardcopySubmittedDate: "2026-09-26",
    advisorRevisionEndorsed: true,
  },
  {
    id: "g7",
    groupNo: 7,
    classroom: "4IT2",
    topicTitleLao: "ການພັດທະນາລະບົບຖາມ-ຕອບອັດຕະໂນມັດ ສຳລັບພາກວິຊາ CEIT ດ້ວຍເຕັກນິກ RAG",
    topicTitleEn: "Development of Automated Q&A for CEIT Department using RAG",
    advisor: "ທ່ານ ຮສ. ຫາ ບຸນທັນ",
    academicYear: "2025 - 2026",
    members: [
      { name: "ທ້າວ ບຸນມີ ບຸນທະວອນ", studentId: "4IT2-001" },
      { name: "ນາງ ອາລຸນນາ ທັນລະສິນ", studentId: "4IT2-007" },
      { name: "ທ້າວ ເກ້ ຄີ", studentId: "4IT2-014" },
    ],
    hasHardcopySubmitted: true,
    hardcopySubmittedDate: "2026-09-15",
    hasPermissionPaperSubmitted: true,
    hasExamFeePaid: true,
    examFeeReceiptNo: "REC-2026-101",
    examStatus: "PASSED",
    defenseAttempt: 1,
    defenseScore: 58.5,
    defenseDate: "2026-09-18",
    committeeComments: [
      "ບົດໂຄງຮ່າງດີຫຼາຍ ໃຫ້ທົດສອບ Benchmark Vector Search ຕື່ມອີກ 1 ຮູບແບບ",
    ],
    hasRevisedHardcopySubmitted: false,
    revisionDeadline: "2026-10-03",
    daysRemainingForRevision: 1,
    advisorRevisionEndorsed: false,
  },
  {
    id: "g8",
    groupNo: 8,
    classroom: "4IT3",
    topicTitleLao: "ລະບົບຄວບຄຸມການປິດ-ເປີດໄຟຟ້າ ແລະ ແອດ້ວຍລະບົບຕັ້ງເວລາ",
    topicTitleEn: "Lighting and AC Automated Scheduling Control System",
    advisor: "ທ່ານ ຮສ. ຫາ ບຸນທັນ",
    academicYear: "2025 - 2026",
    members: [
      { name: "ທ້າວ ວາດສະໜາ ສີສຸວົງ", studentId: "4IT3-009" },
      { name: "ນາງ ມະນີວອນ ຫຼວງໂຄດ", studentId: "4IT3-022" },
      { name: "ທ້າວ ແສງເດືອນ ໄຊຍະສິດ", studentId: "4IT3-031" },
    ],
    hasHardcopySubmitted: false,
    hasPermissionPaperSubmitted: false,
    hasExamFeePaid: false,
    examStatus: "NOT_SCHEDULED",
    defenseAttempt: 1,
    hasRevisedHardcopySubmitted: false,
    advisorRevisionEndorsed: false,
  },
  {
    id: "g25",
    groupNo: 25,
    classroom: "2IT_CON",
    topicTitleLao: "ລະບົບຄຸ້ມຄອງຫ້ອງແຖວຕ່າງໆ",
    topicTitleEn: "Row House and Apartment Management System",
    advisor: "ທ່ານ ຮສ. ປອ. ຄຳເພັດ ບຸນນະວົງ",
    academicYear: "2025 - 2026",
    members: [
      { name: "ຄັນໄຊ ມະນີວົງ", studentId: "2IT-019" },
      { name: "ບຸນມີ ພົມມະຈັນ", studentId: "2IT-021" },
      { name: "ດວງຕາ ຄຳຈັນເພັງ", studentId: "2IT-027" },
    ],
    hasHardcopySubmitted: true,
    hardcopySubmittedDate: "2026-09-16",
    hasPermissionPaperSubmitted: true,
    hasExamFeePaid: true,
    examFeeReceiptNo: "REC-2026-107",
    examStatus: "PASSED",
    defenseAttempt: 1,
    defenseScore: 50.0,
    defenseDate: "2026-09-20",
    committeeComments: [
      "ເພີ່ມລະບົບອອກບິນຄ່າເຊົ່າ ແລະ ໃບຮັບເງິນໃນບົດທີ 3",
    ],
    hasRevisedHardcopySubmitted: true,
    revisedHardcopySubmittedDate: "2026-09-27",
    advisorRevisionEndorsed: true,
  },
  {
    id: "g32",
    groupNo: 32,
    classroom: "4Com2",
    topicTitleLao: "ລະບົບຄຸ້ມຄອງຕິດຕາມການສອບ-ການສອນຂອງອາຈານປະຈຳພາກວິຊາ CEIT",
    topicTitleEn: "Teaching & Exam Monitoring System for CEIT Faculty",
    advisor: "ທ່ານ ອຈ. ເມກະລອນ ບຸນທັນ",
    academicYear: "2025 - 2026",
    members: [
      { name: "ນາງ ແແບບນາລີ ວົງພະຈັນ", studentId: "4Com2-004" },
      { name: "ນາງ ພູກທິບຍາດ ອານຸວົງສີຣິວົງ", studentId: "4Com2-011" },
      { name: "ທ້າວ ສຸພາໄຊ ສຸບານາວົງ", studentId: "4Com2-018" },
    ],
    hasHardcopySubmitted: true,
    hardcopySubmittedDate: "2026-09-17",
    hasPermissionPaperSubmitted: true,
    hasExamFeePaid: true,
    examFeeReceiptNo: "REC-2026-114",
    examStatus: "SCHEDULED",
    defenseAttempt: 1,
    defenseDate: "2026-10-05 (13:00)",
    hasRevisedHardcopySubmitted: false,
    advisorRevisionEndorsed: false,
  },
  {
    id: "g56",
    groupNo: 56,
    classroom: "4Com2",
    topicTitleLao: "ການພັດທະນາລະບົບ White-box Pentesting ອັດຕະໂນມັດດ້ວຍ Local AI: ກໍລະນີສຶກສາ ລະບົບ AMS",
    topicTitleEn: "Automated White-box Pentesting via Local AI: AMS Case Study",
    advisor: "ທ່ານ ປອ. ຊານຸພາບ ພົມແກ້ວມາ",
    academicYear: "2025 - 2026",
    members: [
      { name: "ທ້າວ ເດັກກີລານ ລາດສະຫວາດ", studentId: "4Com2-008" },
      { name: "ທ້າວ ອົງກອນ ພູມມິທາ", studentId: "4Com2-016" },
      { name: "ທ້າວ ພິລະສຸກ ແກ້ວບຸນມາ", studentId: "4Com2-024" },
    ],
    hasHardcopySubmitted: true,
    hardcopySubmittedDate: "2026-09-16",
    hasPermissionPaperSubmitted: true,
    hasExamFeePaid: true,
    examFeeReceiptNo: "REC-2026-119",
    examStatus: "PASSED",
    defenseAttempt: 1,
    defenseScore: 59.0,
    defenseDate: "2026-09-20",
    committeeComments: [
      "ຜົນງານລະດັບດີເລີດ ແນະນຳໃຫ້ຂຽນບົດຄວາມວິຊາການຕື່ມ",
    ],
    hasRevisedHardcopySubmitted: true,
    revisedHardcopySubmittedDate: "2026-09-25",
    advisorRevisionEndorsed: true,
  },
  {
    id: "g57",
    groupNo: 57,
    classroom: "4IT1",
    topicTitleLao: "ລະບົບຄຸ້ມຄອງສາງອາໄຫຼ່ລົດຍົນອັດສະລິຍະ",
    topicTitleEn: "Intelligent Auto Spare Parts Inventory Management",
    advisor: "ທ່ານ ປອ. ພອນໄຊ ສີລະກອນ",
    academicYear: "2025 - 2026",
    members: [
      { name: "ທ້າວ ທອງດີ ວົງຄຳ", studentId: "4IT1-035" },
      { name: "ທ້າວ ສົມຈິດ ໄຊຍະລິນ", studentId: "4IT1-042" },
    ],
    hasHardcopySubmitted: false,
    hasPermissionPaperSubmitted: false,
    hasExamFeePaid: false,
    examStatus: "NOT_SCHEDULED",
    defenseAttempt: 1,
    hasRevisedHardcopySubmitted: false,
    advisorRevisionEndorsed: false,
  },
];

type FilterTab = 
  | "ALL"
  | "HARDCOPY_SUBMITTED"
  | "HARDCOPY_PENDING"
  | "PASSED"
  | "FAILED_RETAKE"
  | "REVISED_HARDCOPY_SUBMITTED"
  | "REVISED_HARDCOPY_PENDING";

export function ProposalTrackingDashboard() {
  const [selectedYear, setSelectedYear] = useState<string>("2025 - 2026");
  const [filterTab, setFilterTab] = useState<FilterTab>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [advisorFilter, setAdvisorFilter] = useState("");
  const [studentFilter, setStudentFilter] = useState("");
  const [activeCommentModalGroup, setActiveCommentModalGroup] = useState<ProposalTrackingGroup | null>(null);
  const [groups, setGroups] = useState<ProposalTrackingGroup[]>(mockProposalGroups);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Build advisor and student options from groups + directory
  const dashboardAdvisorOptions = useMemo<SearchableOption[]>(() => {
    const map = new Map<string, SearchableOption>();
    teacherSearchableOptions.forEach((opt) => map.set(opt.value, opt));
    groups.forEach((g) => {
      if (g.advisor && !map.has(g.advisor)) {
        map.set(g.advisor, {
          value: g.advisor,
          label: g.advisor,
          subLabel: "ອາຈານທີ່ປຶກສາໂຄງຮ່າງ",
        });
      }
    });
    return Array.from(map.values());
  }, [groups]);

  const dashboardStudentOptions = useMemo<SearchableOption[]>(() => {
    const map = new Map<string, SearchableOption>();
    studentSearchableOptions.forEach((opt) => map.set(opt.value, opt));
    groups.forEach((g) => {
      g.members.forEach((m) => {
        if (!map.has(m.studentId)) {
          map.set(m.studentId, {
            value: m.studentId,
            label: `${m.name} (${m.studentId})`,
            subLabel: `ກຸ່ມ ${g.groupNo} • ${g.classroom}`,
          });
        }
      });
    });
    return Array.from(map.values());
  }, [groups]);

  // Overall statistics for current academic year cohort (42 registered groups total)
  const totalRegisteredGroups = 42;
  const hardcopySubmittedCount = 36;
  const hardcopyPendingCount = totalRegisteredGroups - hardcopySubmittedCount; // 6
  
  const evaluatedCount = 32;
  const passedTotalCount = 28; // 24 round 1 + 3 round 2 + 1 round 3
  const retakeRequiredCount = 4;
  
  const revisedHardcopySubmittedCount = 22; // out of 28 passed
  const revisedHardcopyPendingCount = passedTotalCount - revisedHardcopySubmittedCount; // 6

  // Filter groups in local view
  const filteredGroups = useMemo(() => {
    return groups.filter((g) => {
      if (g.academicYear !== selectedYear) return false;

      if (filterTab === "HARDCOPY_SUBMITTED" && !g.hasHardcopySubmitted) return false;
      if (filterTab === "HARDCOPY_PENDING" && g.hasHardcopySubmitted) return false;
      if (filterTab === "PASSED" && g.examStatus !== "PASSED") return false;
      if (filterTab === "FAILED_RETAKE" && !g.examStatus.startsWith("FAILED_RETAKE")) return false;
      if (filterTab === "REVISED_HARDCOPY_SUBMITTED" && !g.hasRevisedHardcopySubmitted) return false;
      if (filterTab === "REVISED_HARDCOPY_PENDING" && (g.examStatus !== "PASSED" || g.hasRevisedHardcopySubmitted)) return false;

      if (advisorFilter && !g.advisor.toLowerCase().includes(advisorFilter.toLowerCase())) {
        return false;
      }

      if (studentFilter) {
        const hasMember = g.members.some(
          (m) =>
            m.studentId === studentFilter ||
            m.name.toLowerCase().includes(studentFilter.toLowerCase())
        );
        if (!hasMember) return false;
      }

      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesGroupNo = `ກຸ່ມ ${g.groupNo}`.toLowerCase().includes(query) || `group ${g.groupNo}`.toLowerCase().includes(query);
        const matchesTopic = g.topicTitleLao.toLowerCase().includes(query) || g.topicTitleEn.toLowerCase().includes(query);
        const matchesAdvisor = g.advisor.toLowerCase().includes(query);
        const matchesMember = g.members.some(
          (m) => m.name.toLowerCase().includes(query) || m.studentId.toLowerCase().includes(query)
        );
        return matchesGroupNo || matchesTopic || matchesAdvisor || matchesMember;
      }

      return true;
    });
  }, [groups, selectedYear, filterTab, searchQuery, advisorFilter, studentFilter]);

  const handleMarkHardcopyReceived = (groupId: string) => {
    setGroups((prev) =>
      prev.map((g) =>
        g.id === groupId
          ? {
              ...g,
              hasHardcopySubmitted: true,
              hasPermissionPaperSubmitted: true,
              hasExamFeePaid: true,
              hardcopySubmittedDate: new Date().toISOString().split("T")[0],
              examFeeReceiptNo: `REC-2026-${Math.floor(100 + Math.random() * 900)}`,
            }
          : g
      )
    );
    showToast("ບັນທຶກຮັບເຫຼັ້ມໂຄງຮ່າງ, ໃບສະເໜີ ແລະ ຄ່າທຳນຽມສຳເລັດແລ້ວ!");
  };

  const handleMarkRevisedHardcopyReceived = (groupId: string) => {
    setGroups((prev) =>
      prev.map((g) =>
        g.id === groupId
          ? {
              ...g,
              hasRevisedHardcopySubmitted: true,
              revisedHardcopySubmittedDate: new Date().toISOString().split("T")[0],
              advisorRevisionEndorsed: true,
            }
          : g
      )
    );
    showToast("ບັນທຶກຮັບເຫຼັ້ມແກ້ໄຂຕາມຄຳເຫັນກຳມະການ (ພ້ອມລາຍເຊັນທີ່ປຶກສາ) ສຳເລັດແລ້ວ!");
  };

  const showToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 3500);
  };

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {successToast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-3 text-sm font-medium text-white shadow-xl animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="h-5 w-5" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Header and Year Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-100 text-sky-700">
              <FileCheck2 className="h-5 w-5" />
            </span>
            <h2 className="text-xl font-bold tracking-tight text-slate-900 font-sans">
              ຕິດຕາມຂະບວນການສອບໂຄງຮ່າງບົດຈົບຊັ້ນ (Proposal Pipeline Tracking)
            </h2>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-slate-500 font-sans">
            ຕິດຕາມການສົ່ງເອກະສານ & ເຫຼັ້ມໂຄງຮ່າງ, ຜົນການສອບເສັງ, ແລະ ການສົ່ງເຫຼັ້ມແກ້ໄຂຕາມຄຳເຫັນກຳມະການ
          </p>
        </div>

        {/* Academic Year Selector */}
        <div className="flex items-center gap-2.5 shrink-0">
          <label className="text-xs font-semibold text-slate-600 font-sans">ສົກຮຽນ:</label>
          <div className="relative">
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="appearance-none rounded-lg border border-slate-300 bg-white py-1.5 pl-3 pr-8 text-xs font-bold text-slate-800 shadow-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500 font-sans"
            >
              <option value="2025 - 2026">ສົກຮຽນ 2025 - 2026 (ປະຈຸບັນ)</option>
              <option value="2024 - 2025">ສົກຮຽນ 2024 - 2025</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-2.5 h-3.5 w-3.5 text-slate-500" />
          </div>
        </div>
      </div>

      {/* 4 Primary Workflow KPI Funnel Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-sans">
        {/* Card 1: Total Groups This Year */}
        <Card className="border-slate-200 hover:border-slate-300 transition-all bg-gradient-to-br from-white to-slate-50/50">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                ກຸ່ມທັງໝົດສົກຮຽນນີ້
              </span>
              <span className="rounded-full bg-slate-100 p-2 text-slate-700">
                <Users className="h-4 w-4" />
              </span>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                {totalRegisteredGroups}
              </span>
              <span className="text-xs font-semibold text-slate-500">ກຸ່ມລົງທະບຽນ</span>
            </div>
            <p className="mt-2 text-[11px] text-slate-500 flex items-center gap-1.5">
              <Building2 className="h-3.5 w-3.5 text-slate-400" />
              <span>4IT1, 4IT2, 4IT3, 2IT-CON, 4Com2 (124 ນັກສຶກສາ)</span>
            </p>
          </CardContent>
        </Card>

        {/* Card 2: Submitted Hardcopy + Permission + Fee */}
        <Card className="border-sky-200 bg-gradient-to-br from-white via-sky-50/20 to-white hover:border-sky-300 transition-all">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-sky-700">
                1. ສົ່ງເອກະສານ & ເຫຼັ້ມແລ້ວ
              </span>
              <span className="rounded-full bg-sky-100 p-2 text-sky-700">
                <BookCheck className="h-4 w-4" />
              </span>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-sky-950">
                {hardcopySubmittedCount}
              </span>
              <span className="text-xs font-semibold text-slate-500">
                / {totalRegisteredGroups} ກຸ່ມ ({((hardcopySubmittedCount / totalRegisteredGroups) * 100).toFixed(1)}%)
              </span>
            </div>
            <div className="mt-2 flex items-center justify-between text-[11px]">
              <span className="text-emerald-600 font-semibold flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" /> ເຫຼັ້ມ + ໃບສະເໜີ + ຄ່າທຳນຽມ
              </span>
              <span className="text-amber-600 font-bold">
                ຄ້າງສົ່ງ {hardcopyPendingCount}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Card 3: Passed Proposal Defense */}
        <Card className="border-emerald-200 bg-gradient-to-br from-white via-emerald-50/20 to-white hover:border-emerald-300 transition-all">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                2. ສອບຜ່ານໂຄງຮ່າງ
              </span>
              <span className="rounded-full bg-emerald-100 p-2 text-emerald-700">
                <CheckCircle2 className="h-4 w-4" />
              </span>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-emerald-950">
                {passedTotalCount}
              </span>
              <span className="text-xs font-semibold text-slate-500">
                / {evaluatedCount} ກຸ່ມສອບ ({((passedTotalCount / evaluatedCount) * 100).toFixed(1)}%)
              </span>
            </div>
            <div className="mt-2 flex items-center justify-between text-[11px]">
              <span className="text-slate-600 font-medium">
                ຜ່ານຮອບ 1: 24 • ຮອບ 2/3: 4
              </span>
              <span className="text-rose-600 font-bold">
                ສອບແກ້ຕົວ {retakeRequiredCount}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Card 4: Submitted Fixed Hardcopy Book After Comments */}
        <Card className="border-slate-200 bg-white hover:border-slate-300 transition-all shadow-sm">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-teal-750 text-teal-800">
                3. ສົ່ງເຫຼັ້ມແກ້ໄຂແລ້ວ
              </span>
              <span className="rounded-full bg-teal-50 p-2 text-teal-700">
                <ShieldCheck className="h-4 w-4" />
              </span>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                {revisedHardcopySubmittedCount}
              </span>
              <span className="text-xs font-semibold text-slate-500">
                / {passedTotalCount} ທີ່ຜ່ານ ({((revisedHardcopySubmittedCount / passedTotalCount) * 100).toFixed(1)}%)
              </span>
            </div>
            <div className="mt-2 flex items-center justify-between text-[11px]">
              <span className="text-teal-700 font-medium">
                ແກ້ຕາມຄຳເຫັນກຳມະການ
              </span>
              <span className="text-amber-600 font-bold">
                ລໍຖ້າສົ່ງ {revisedHardcopyPendingCount}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Tabs, Search Bar, and Searchable Select Dropdowns */}
      <div className="space-y-3 pt-2">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3">
          {/* Quick Filter Buttons */}
          <div className="flex flex-wrap items-center gap-1.5 font-sans">
            <Button
              size="sm"
              variant={filterTab === "ALL" ? "primary" : "outline"}
              className="text-xs h-8"
              onClick={() => setFilterTab("ALL")}
            >
              ທັງໝົດ ({groups.length})
            </Button>
            <Button
              size="sm"
              variant={filterTab === "HARDCOPY_SUBMITTED" ? "primary" : "outline"}
              className="text-xs h-8"
              leftIcon={<CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />}
              onClick={() => setFilterTab("HARDCOPY_SUBMITTED")}
            >
              ສົ່ງເອກະສານ &amp; ເຫຼັ້ມແລ້ວ
            </Button>
            <Button
              size="sm"
              variant={filterTab === "HARDCOPY_PENDING" ? "primary" : "outline"}
              className="text-xs h-8 text-amber-800 border-amber-300"
              leftIcon={<AlertCircle className="h-3.5 w-3.5 text-amber-600" />}
              onClick={() => setFilterTab("HARDCOPY_PENDING")}
            >
              ຍັງບໍ່ທັນສົ່ງເອກະສານ
            </Button>
            <Button
              size="sm"
              variant={filterTab === "PASSED" ? "primary" : "outline"}
              className="text-xs h-8 text-emerald-800 border-emerald-300"
              leftIcon={<CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />}
              onClick={() => setFilterTab("PASSED")}
            >
              ສອບຜ່ານໂຄງຮ່າງ
            </Button>
            <Button
              size="sm"
              variant={filterTab === "FAILED_RETAKE" ? "primary" : "outline"}
              className="text-xs h-8 text-rose-800 border-rose-300"
              leftIcon={<XCircle className="h-3.5 w-3.5 text-rose-600" />}
              onClick={() => setFilterTab("FAILED_RETAKE")}
            >
              ບໍ່ຜ່ານ / ສອບແກ້ຕົວ
            </Button>
            <Button
              size="sm"
              variant={filterTab === "REVISED_HARDCOPY_SUBMITTED" ? "primary" : "outline"}
              className="text-xs h-8 text-teal-800 border-teal-300"
              leftIcon={<ShieldCheck className="h-3.5 w-3.5 text-teal-600" />}
              onClick={() => setFilterTab("REVISED_HARDCOPY_SUBMITTED")}
            >
              ສົ່ງເຫຼັ້ມແກ້ໄຂແລ້ວ
            </Button>
            <Button
              size="sm"
              variant={filterTab === "REVISED_HARDCOPY_PENDING" ? "primary" : "outline"}
              className="text-xs h-8 text-amber-800 border-amber-300"
              leftIcon={<Clock className="h-3.5 w-3.5 text-amber-600" />}
              onClick={() => setFilterTab("REVISED_HARDCOPY_PENDING")}
            >
              ລໍຖ້າສົ່ງເຫຼັ້ມແກ້ໄຂ
            </Button>
          </div>

          {/* Quick Free-text Search */}
          <div className="relative w-full xl:w-72">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="ຄົ້ນຫາກຸ່ມ, ຫົວຂໍ້..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white py-1.5 pl-8 pr-3 text-xs placeholder-slate-400 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500 font-sans"
            />
          </div>
        </div>

        {/* Dedicated Searchable Select Filters for Advisor and Student */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 shrink-0">
            <Filter className="h-4 w-4 text-sky-600" />
            <span>ກັ່ນຕອງແບບເຈາະຈົງ:</span>
          </div>

          <div className="flex-1 min-w-[220px]">
            <SearchableSelect
              options={dashboardAdvisorOptions}
              value={advisorFilter}
              onChange={(val) => setAdvisorFilter(val)}
              placeholder="ຄົ້ນຫາ ແລະ ເລືອກອາຈານທີ່ປຶກສາ..."
              clearable
            />
          </div>

          <div className="flex-1 min-w-[220px]">
            <SearchableSelect
              options={dashboardStudentOptions}
              value={studentFilter}
              onChange={(val) => setStudentFilter(val)}
              placeholder="ຄົ້ນຫາ ແລະ ເລືອກນັກສຶກສາ..."
              clearable
            />
          </div>

          {(advisorFilter || studentFilter) && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setAdvisorFilter("");
                setStudentFilter("");
              }}
              className="text-xs h-9 shrink-0 text-slate-600"
            >
              ລ້າງການກັ່ນຕອງ
            </Button>
          )}
        </div>
      </div>

      {/* Proposal Tracking Table */}
      <Card className="overflow-hidden border-slate-200">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-600 border-b border-slate-200">
              <tr>
                <th className="py-3 px-3.5 text-center w-16">ກຸ່ມທີ</th>
                <th className="py-3 px-4 min-w-[240px]">ຫົວຂໍ້ບົດໂຄງຮ່າງ & ສະມາຊິກ</th>
                <th className="py-3 px-3 min-w-[150px]">ອາຈານທີ່ປຶກສາ</th>
                <th className="py-3 px-3.5 text-center min-w-[160px]">
                  1. ເອກະສານ & ເຫຼັ້ມ
                </th>
                <th className="py-3 px-3.5 text-center min-w-[150px]">
                  2. ຜົນສອບໂຄງຮ່າງ
                </th>
                <th className="py-3 px-3.5 text-center min-w-[170px]">
                  3. ເຫຼັ້ມແກ້ໄຂຕາມຄຳເຫັນ
                </th>
                <th className="py-3 px-3.5 text-center w-24">ຈັດການ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredGroups.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    ບໍ່ພົບຂໍ້ມູນທີ່ກົງກັບເງື່ອນໄຂການຄົ້ນຫາ
                  </td>
                </tr>
              ) : (
                filteredGroups.map((group) => {
                  return (
                    <tr key={group.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Group No & Class */}
                      <td className="py-3.5 px-3.5 text-center">
                        <div className="inline-flex flex-col items-center">
                          <span className="font-mono text-sm font-extrabold text-sky-900 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                            {String(group.groupNo).padStart(2, "0")}
                          </span>
                          <span className="mt-1 text-[10px] font-semibold text-slate-500">
                            {group.classroom}
                          </span>
                        </div>
                      </td>

                      {/* Topic & Members */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 line-clamp-1">
                          {group.topicTitleLao}
                        </div>
                        <div className="font-mono text-[11px] text-slate-500 line-clamp-1">
                          {group.topicTitleEn}
                        </div>
                        <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                          {group.members.map((m, idx) => (
                            <span
                              key={idx}
                              className="inline-flex items-center gap-1 rounded bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-700"
                            >
                              <span className="font-medium">{m.name}</span>
                              <span className="font-mono text-slate-400">({m.studentId})</span>
                            </span>
                          ))}
                        </div>
                      </td>

                      {/* Advisor */}
                      <td className="py-3.5 px-3">
                        <div className="font-medium text-slate-800">{group.advisor}</div>
                        <span className="text-[10px] text-slate-400">ພາກວິຊາ CEIT</span>
                      </td>

                      {/* Stage 1: Document & Hardcopy Submission */}
                      <td className="py-3.5 px-3.5 text-center">
                        {group.hasHardcopySubmitted ? (
                          <div className="inline-flex flex-col items-center gap-1">
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-700 border border-emerald-200">
                              <CheckCircle2 className="h-3 w-3" /> ສົ່ງຄົບຖ້ວນ
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {group.hardcopySubmittedDate}
                            </span>
                            {group.examFeeReceiptNo && (
                              <span className="font-mono text-[9px] text-slate-500 bg-slate-100 px-1 rounded">
                                {group.examFeeReceiptNo}
                              </span>
                            )}
                          </div>
                        ) : (
                          <div className="inline-flex flex-col items-center gap-1">
                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-bold text-amber-700 border border-amber-200">
                              <AlertCircle className="h-3 w-3" /> ຍັງຄ້າງສົ່ງ
                            </span>
                            <Button
                              size="sm"
                              variant="secondary"
                              className="text-[10px] h-6 px-1.5 mt-0.5"
                              onClick={() => handleMarkHardcopyReceived(group.id)}
                            >
                              ບັນທຶກຮັບເຫຼັ້ມ
                            </Button>
                          </div>
                        )}
                      </td>

                      {/* Stage 2: Proposal Exam Result */}
                      <td className="py-3.5 px-3.5 text-center">
                        {group.examStatus === "PASSED" ? (
                          <div className="inline-flex flex-col items-center gap-0.5">
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-extrabold text-emerald-800">
                              <CheckCircle2 className="h-3 w-3" />
                              {group.defenseAttempt === 1 ? "ຜ່ານ (ຮອບ 1)" : `ຜ່ານ (ແກ້ຕົວຮອບ ${group.defenseAttempt})`}
                            </span>
                            {group.defenseScore && (
                              <span className="font-mono text-xs font-bold text-slate-700">
                                {group.defenseScore} / 60 ຄະແນນ
                              </span>
                            )}
                            <button
                              onClick={() => setActiveCommentModalGroup(group)}
                              className="text-[10px] text-sky-600 hover:text-sky-800 underline font-medium mt-0.5"
                            >
                              ເບິ່ງຄຳເຫັນກຳມະການ
                            </button>
                          </div>
                        ) : group.examStatus === "FAILED_RETAKE_2" || group.examStatus === "FAILED_RETAKE_3" ? (
                          <div className="inline-flex flex-col items-center gap-0.5">
                            <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2 py-0.5 text-[11px] font-extrabold text-rose-800">
                              <XCircle className="h-3 w-3" />
                              ບໍ່ຜ່ານ (ສອບແກ້ຕົວຮອບ 2)
                            </span>
                            {group.defenseScore && (
                              <span className="font-mono text-xs font-bold text-rose-700">
                                {group.defenseScore} / 60
                              </span>
                            )}
                            <button
                              onClick={() => setActiveCommentModalGroup(group)}
                              className="text-[10px] text-rose-600 hover:text-rose-800 underline font-medium mt-0.5"
                            >
                              ເບິ່ງຂໍ້ບົກຜ່ອງທີ່ຕ້ອງແກ້
                            </button>
                          </div>
                        ) : group.examStatus === "SCHEDULED" ? (
                          <div className="inline-flex flex-col items-center gap-0.5">
                            <span className="inline-flex items-center gap-1 rounded-full bg-sky-100 px-2 py-0.5 text-[11px] font-semibold text-sky-800">
                              <Clock className="h-3 w-3" /> ຈັດຕາຕະລາງແລ້ວ
                            </span>
                            <span className="text-[10px] text-slate-500 font-mono">
                              {group.defenseDate}
                            </span>
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-400">ລໍຖ້າສົ່ງເອກະສານ</span>
                        )}
                      </td>

                      {/* Stage 3: Revised Hardcopy Book After Comments */}
                      <td className="py-3.5 px-3.5 text-center">
                        {group.hasRevisedHardcopySubmitted ? (
                          <div className="inline-flex flex-col items-center gap-1">
                            <span className="inline-flex items-center gap-1 rounded-full bg-teal-50 px-2 py-0.5 text-[11px] font-extrabold text-teal-700 border border-teal-200">
                              <ShieldCheck className="h-3 w-3" /> ສົ່ງເຫຼັ້ມແກ້ໄຂແລ້ວ
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {group.revisedHardcopySubmittedDate}
                            </span>
                            {group.advisorRevisionEndorsed && (
                              <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1 rounded">
                                ທີ່ປຶກສາເຊັນຢັ້ງຢືນແລ້ວ
                              </span>
                            )}
                          </div>
                        ) : group.examStatus === "PASSED" ? (
                          <div className="inline-flex flex-col items-center gap-1">
                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-bold text-amber-700 border border-amber-200">
                              <Clock className="h-3 w-3" /> ກຳລັງປັບປຸງຕາມຄຳເຫັນ
                            </span>
                            {group.daysRemainingForRevision !== undefined && (
                              <span className="text-[10px] font-semibold text-orange-600">
                                ເຫຼືອ {group.daysRemainingForRevision} ວັນ
                              </span>
                            )}
                            <Button
                              size="sm"
                              variant="secondary"
                              className="text-[10px] h-6 px-1.5 mt-0.5"
                              onClick={() => handleMarkRevisedHardcopyReceived(group.id)}
                            >
                              ບັນທຶກຮັບເຫຼັ້ມແກ້ໄຂ
                            </Button>
                          </div>
                        ) : group.examStatus.startsWith("FAILED") ? (
                          <span className="text-[10px] font-semibold text-rose-600">
                            ຕ້ອງສອບແກ້ຕົວໃຫ້ຜ່ານກ່ອນ
                          </span>
                        ) : (
                          <span className="text-[11px] text-slate-300">-</span>
                        )}
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-3.5 text-center">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 w-7 p-0"
                          onClick={() => setActiveCommentModalGroup(group)}
                          title="ເບິ່ງລາຍລະອຽດ"
                        >
                          <ChevronRight className="h-4 w-4 text-slate-400" />
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modal: View Committee Comments & Rubric Score Breakdown */}
      {activeCommentModalGroup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl font-sans border border-slate-200">
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="rounded bg-sky-100 px-2 py-0.5 font-mono text-xs font-bold text-sky-800">
                    ກຸ່ມ {activeCommentModalGroup.groupNo} ({activeCommentModalGroup.classroom})
                  </span>
                  <Badge
                    variant={
                      activeCommentModalGroup.examStatus === "PASSED"
                        ? "emerald"
                        : activeCommentModalGroup.examStatus.startsWith("FAILED")
                        ? "rose"
                        : "sky"
                    }
                  >
                    {activeCommentModalGroup.examStatus === "PASSED"
                      ? "ສອບຜ່ານໂຄງຮ່າງ"
                      : activeCommentModalGroup.examStatus.startsWith("FAILED")
                      ? "ບໍ່ຜ່ານ / ຕ້ອງສອບແກ້ຕົວ"
                      : "ລໍຖ້າສອບເສັງ"}
                  </Badge>
                </div>
                <h3 className="mt-2 text-base font-bold text-slate-900">
                  {activeCommentModalGroup.topicTitleLao}
                </h3>
                <p className="text-xs text-slate-500 font-mono">
                  {activeCommentModalGroup.topicTitleEn}
                </p>
              </div>
              <button
                onClick={() => setActiveCommentModalGroup(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-4 text-xs">
              {/* Defense Score */}
              <div className="rounded-lg bg-slate-50 p-3 border border-slate-200">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-600">ຄະແນນສອບປ້ອງກັນໂຄງຮ່າງ (Proposal):</span>
                  <span className="font-mono text-base font-extrabold text-slate-900">
                    {activeCommentModalGroup.defenseScore !== undefined
                      ? `${activeCommentModalGroup.defenseScore} / 60 ຄະແນນ`
                      : "ຍັງບໍ່ທັນມີຄະແນນ"}
                  </span>
                </div>
                <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500">
                  <span>ຮອບການສອບ: ຮອບທີ {activeCommentModalGroup.defenseAttempt}</span>
                  <span>ວັນທີສອບ: {activeCommentModalGroup.defenseDate || "-"}</span>
                </div>
              </div>

              {/* Official Committee Comments from Score Paper */}
              <div>
                <h4 className="font-bold text-slate-900 flex items-center gap-1.5 mb-2">
                  <MessageSquare className="h-4 w-4 text-sky-600" />
                  ຄຳເຫັນ ແລະ ຂໍ້ແນະນຳຈາກໃບຄະແນນ (Score Paper Comments)
                </h4>
                {activeCommentModalGroup.committeeComments &&
                activeCommentModalGroup.committeeComments.length > 0 ? (
                  <ul className="space-y-2 rounded-lg bg-amber-50/60 p-3.5 border border-amber-200/80 text-amber-950">
                    {activeCommentModalGroup.committeeComments.map((comment, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="font-bold text-amber-700">•</span>
                        <span>{comment}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-slate-400 italic">ບໍ່ມີຄຳເຫັນບັນທຶກ</p>
                )}
              </div>

              {/* Status of Post-Defense Hardcopy Book */}
              <div className="rounded-lg border border-slate-200 p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800">
                    ສະຖານະການສົ່ງເຫຼັ້ມແກ້ໄຂຕາມຄຳເຫັນ (Post-Defense Hardcopy):
                  </span>
                  {activeCommentModalGroup.hasRevisedHardcopySubmitted ? (
                    <Badge variant="emerald">ສົ່ງແລ້ວ</Badge>
                  ) : (
                    <Badge variant="amber">ລໍຖ້າສົ່ງ</Badge>
                  )}
                </div>
                {activeCommentModalGroup.hasRevisedHardcopySubmitted ? (
                  <p className="text-emerald-700 font-medium text-[11px]">
                    ✓ ໄດ້ຮັບເຫຼັ້ມແກ້ໄຂວັນທີ {activeCommentModalGroup.revisedHardcopySubmittedDate} ພ້ອມລາຍເຊັນທີ່ປຶກສາຮັບຮອງ
                  </p>
                ) : (
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-orange-600 text-[11px]">
                      ກຳນົດສົ່ງພາຍໃນ: {activeCommentModalGroup.revisionDeadline || "14 ວັນຫຼັງສອບ"}
                    </span>
                    <Button
                      size="sm"
                      variant="primary"
                      className="text-xs h-7"
                      onClick={() => {
                        handleMarkRevisedHardcopyReceived(activeCommentModalGroup.id);
                        setActiveCommentModalGroup((prev) =>
                          prev ? { ...prev, hasRevisedHardcopySubmitted: true, advisorRevisionEndorsed: true } : null
                        );
                      }}
                    >
                      ບັນທຶກຮັບເຫຼັ້ມແກ້ໄຂດຽວນີ້
                    </Button>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setActiveCommentModalGroup(null)}
              >
                ປິດໜ້າຕ່າງ
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

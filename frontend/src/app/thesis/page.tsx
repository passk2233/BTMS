"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  BookOpen,
  Plus,
  Search,
  Filter,
  Users,
  FileText,
  Download,
  UploadCloud,
  CheckCircle,
  AlertCircle,
  AlertTriangle,
  XCircle,
  ChevronRight,
  Clock,
  Sparkles,
  Trash2,
  FileCheck2,
  Printer,
  GraduationCap,
  Keyboard,
  Info,
  Layers,
  Check,
  X,
} from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Badge, BadgeVariant } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { OfficialThesisReport } from "@/components/reports/official-thesis-report";
import { SearchableSelect, SearchableOption } from "@/components/ui/searchable-select";
import {
  studentSearchableOptions,
  teacherSearchableOptions,
  StudentRecord,
  TeacherRecord,
  registeredTeachers,
} from "@/lib/academic-directory";

interface StudentMember {
  name: string;
  studentId: string;
  classroom: string;
  isPreviousGen?: boolean;
  note?: string;
}

interface ThesisProject {
  id: string;
  groupNo: number;
  classroom: string;
  code: string;
  titleLao: string;
  titleEn: string;
  abstract: string;
  academicYear: string;
  advisor: string;
  advisorDepartment: string;
  members: StudentMember[];
  status: "DRAFT" | "SUBMITTED" | "UNDER_REVIEW" | "APPROVED" | "REVISION_REQUIRED" | "REJECTED";
  statusLabel: string;
  badgeVariant: BadgeVariant;
  currentStage: string;
  submittedAt: string;
  advisorConfirmationDoc: { name: string; size: string; date: string };
  files: { name: string; size: string; version: string; date: string }[];
}

const initialTheses: ThesisProject[] = [
  {
    id: "1",
    groupNo: 1,
    classroom: "2IT-CON",
    code: "CS-2026-G01",
    titleLao: "ລະບົບຈັດການເອກະສານຂອງສາຍການບິນລາວ",
    titleEn: "Document Management System for Lao Airlines",
    abstract: "ລະບົບຈັດການ ແລະ ຈັດເກັບເອກະສານເອເລັກໂຕຣນິກສຳລັບສາຍການບິນລາວ ເພື່ອຫຼຸດຜ່ອນການໃຊ້ເຈ້ຍ ແລະ ເພີ່ມຄວາມວ່ອງໄວໃນການຊອກຫາ.",
    academicYear: "2025 - 2026",
    advisor: "ທ່ານ ຮສ. ຫາ ບຸນທັນ",
    advisorDepartment: "ພາກວິຊາວິສະວະກຳຄອມພິວເຕີ ແລະ ເຕັກໂນໂລຊີຂໍ້ມູນຂ່າວສານ",
    members: [
      { name: "ແຮັກເຕ້ ແສງສະຫວ່າງ", studentId: "2IT-001", classroom: "2IT-CON" },
      { name: "ບຸນທະວີ ວໍລະລາດ", studentId: "2IT-002", classroom: "2IT-CON" },
      {
        name: "ສົມພົງ ສີສຸລາດ",
        studentId: "2IT-003",
        classroom: "2IT-CON",
        isPreviousGen: true,
        note: "ນັກສຶກສາຕົກຮຸ່ນ",
      },
    ],
    status: "APPROVED",
    statusLabel: "ອະນຸມັດຫົວຂໍ້ແລ້ວ",
    badgeVariant: "emerald",
    currentStage: "ໄລຍະພັດທະນາລະບົບ",
    submittedAt: "2026-09-10",
    advisorConfirmationDoc: {
      name: "ໃບຢັ້ງຢືນການຕົກລົງເປັນທີ່ປຶກສາ_ກຸ່ມ1.pdf",
      size: "1.2 MB",
      date: "10 ກ.ຍ. 2026",
    },
    files: [
      { name: "proposal_defense_v2_final.pdf", size: "4.8 MB", version: "v2.0", date: "20 ກ.ຍ. 2026" },
      { name: "proposal_draft_v1.pdf", size: "4.2 MB", version: "v1.0", date: "10 ກ.ຍ. 2026" },
    ],
  },
  {
    id: "2",
    groupNo: 2,
    classroom: "4IT1",
    code: "CS-2026-G02",
    titleLao: "ປັບປຸງ ແລະ ພັດທະນາລະບົບ AMS ໃນການຈັດການຂໍ້ມູນພາກວິຊາ",
    titleEn: "Improvement and Development of AMS System for Department Management",
    abstract: "ການຍົກລະດັບລະບົບ AMS (Academic Management System) ເພື່ອຄຸ້ມຄອງຂໍ້ມູນຫຼັກສູດ, ຄະແນນ, ແລະ ຕາຕະລາງການສອນພາຍໃນພາກວິຊາ.",
    academicYear: "2025 - 2026",
    advisor: "ທ່ານ ຮສ. ຫາ ບຸນທັນ",
    advisorDepartment: "ພາກວິຊາວິສະວະກຳຄອມພິວເຕີ ແລະ ເຕັກໂນໂລຊີຂໍ້ມູນຂ່າວສານ",
    members: [
      { name: "ນາງ ວິໄລຄຳ ບຸນສີລົດ", studentId: "4IT1-012", classroom: "4IT1" },
      { name: "ທ້າວ ເພັດສະໝອນ ສີສັມຫວັງ", studentId: "4IT1-018", classroom: "4IT1" },
      { name: "ນາງ ສຸກສາຄອນ ໄຊຍະວົງ", studentId: "4IT1-025", classroom: "4IT1" },
    ],
    status: "APPROVED",
    statusLabel: "ອະນຸມັດຫົວຂໍ້ແລ້ວ",
    badgeVariant: "emerald",
    currentStage: "ໄລຍະພັດທະນາລະບົບ",
    submittedAt: "2026-09-12",
    advisorConfirmationDoc: {
      name: "ໃບຢັ້ງຢືນການຕົກລົງເປັນທີ່ປຶກສາ_ກຸ່ມ2.pdf",
      size: "950 KB",
      date: "12 ກ.ຍ. 2026",
    },
    files: [
      { name: "ams_improvement_proposal.pdf", size: "3.1 MB", version: "v1.0", date: "12 ກ.ຍ. 2026" },
    ],
  },
  {
    id: "3",
    groupNo: 3,
    classroom: "4IT1 / 4IT2",
    code: "CS-2026-G03",
    titleLao: "ລະບົບຈັດການຮ້ານຂາຍເຄື່ອງສຳອາງຂອງຮ້ານ Anika beauty shop",
    titleEn: "Store Management System for Anika Beauty Shop",
    abstract: "ລະບົບບໍລິຫານຈັດການສາງສິນຄ້າ ແລະ ຈຸດຂາຍ POS ພ້ອມລາຍງານຍອດຂາຍປະຈຳວັນສຳລັບຮ້ານ Anika Beauty Shop.",
    academicYear: "2025 - 2026",
    advisor: "ທ່ານ ຮສ. ຫາ ບຸນທັນ",
    advisorDepartment: "ພາກວິຊາວິສະວະກຳຄອມພິວເຕີ ແລະ ເຕັກໂນໂລຊີຂໍ້ມູນຂ່າວສານ",
    members: [
      { name: "ທ້າວ ເກມ ຂຸນປະເສີດ", studentId: "4IT1-030", classroom: "4IT1" },
      { name: "ທ້າວ ທະນາທອນ ສີສົງຄາມ", studentId: "4IT2-033", classroom: "4IT2" },
      {
        name: "ທ້າວ ທັນມະກອນ ບູລົມມະວົງ",
        studentId: "4IT1-041",
        classroom: "4IT1",
        isPreviousGen: true,
        note: "ນັກສຶກສາຕົກຮຸ່ນ",
      },
    ],
    status: "UNDER_REVIEW",
    statusLabel: "ລໍຖ້າກວດສອບ",
    badgeVariant: "amber",
    currentStage: "ກວດສອບຫົວຂໍ້",
    submittedAt: "2026-09-15",
    advisorConfirmationDoc: {
      name: "ໃບຢັ້ງຢືນການຕົກລົງເປັນທີ່ປຶກສາ_ກຸ່ມ3.pdf",
      size: "1.1 MB",
      date: "15 ກ.ຍ. 2026",
    },
    files: [
      { name: "anika_pos_synopsis.pdf", size: "2.1 MB", version: "v1.0", date: "15 ກ.ຍ. 2026" },
    ],
  },
  {
    id: "4",
    groupNo: 4,
    classroom: "4IT3",
    code: "CS-2026-G04",
    titleLao: "ລະບົບຈັດການການໃຊ້ໄຟຟ້າໃນຫ້ອງແຖວ (ກໍລະນີສຶກສາ)",
    titleEn: "Electricity Usage Management System in Row Houses (Case Study)",
    abstract: "ລະບົບ IoT ແລະ ເວັບແອັບພລິເຄຊັນສຳລັບຕິດຕາມກວດກາ ແລະ ຄິດໄລ່ຄ່າກະແສໄຟຟ້າອັດຕະໂນມັດໃນຫ້ອງແຖວ.",
    academicYear: "2025 - 2026",
    advisor: "ທ່ານ ຮສ. ຫາ ບຸນທັນ",
    advisorDepartment: "ພາກວິຊາວິສະວະກຳຄອມພິວເຕີ ແລະ ເຕັກໂນໂລຊີຂໍ້ມູນຂ່າວສານ",
    members: [
      { name: "ນາງ ພອຍໄພລິນ ໄຊຍະລາດ", studentId: "4IT3-005", classroom: "4IT3" },
      { name: "ທ້າວ ກໍດຳ ອິນທະໂສມ", studentId: "4IT2-011", classroom: "4IT2" },
      { name: "ທ້າວ ໄນຮ່ອນ ພະມີໄຊ", studentId: "4IT3-019", classroom: "4IT3" },
    ],
    status: "APPROVED",
    statusLabel: "ອະນຸມັດຫົວຂໍ້ແລ້ວ",
    badgeVariant: "emerald",
    currentStage: "ກຽມສອບປ້ອງກັນ",
    submittedAt: "2026-09-18",
    advisorConfirmationDoc: {
      name: "ໃບຢັ້ງຢືນການຕົກລົງເປັນທີ່ປຶກສາ_ກຸ່ມ4.pdf",
      size: "1.3 MB",
      date: "18 ກ.ຍ. 2026",
    },
    files: [
      { name: "iot_power_monitoring_v2.pdf", size: "4.1 MB", version: "v2.0", date: "24 ກ.ຍ. 2026" },
    ],
  },
  {
    id: "5",
    groupNo: 5,
    classroom: "4Com3",
    code: "CS-2026-G05",
    titleLao: "ລະບົບຈັດການຂໍ້ມູນບໍລິການເຊົ່າລົດຈັກ-ລົດຖີບ",
    titleEn: "Rental Service Information Management System for Motorcycles and Bicycles",
    abstract: "ແພລດຟອມໃຫ້ບໍລິການເຊົ່າລົດຈັກ ແລະ ລົດຖີບ, ບັນທຶກປະຫວັດຜູ້ເຊົ່າ, ຄ່າທຳນຽມ ແລະ ການສົ່ງຄືນຍານພາຫະນະ.",
    academicYear: "2025 - 2026",
    advisor: "ທ່ານ ຮສ. ຫາ ບຸນທັນ",
    advisorDepartment: "ພາກວິຊາວິສະວະກຳຄອມພິວເຕີ ແລະ ເຕັກໂນໂລຊີຂໍ້ມູນຂ່າວສານ",
    members: [
      { name: "ທ້າວ ຫຼ້າແກ້ວ ແສງວາລຸນ", studentId: "4Com3-002", classroom: "4Com3" },
      { name: "ນາງ ທິບພະຈັນ ທຳມະວົງ", studentId: "4Com3-014", classroom: "4Com3" },
      { name: "ນາງ ວົງມະນີ ລາບບັນດິດ", studentId: "4Com3-021", classroom: "4Com3" },
    ],
    status: "APPROVED",
    statusLabel: "ອະນຸມັດຫົວຂໍ້ແລ້ວ",
    badgeVariant: "emerald",
    currentStage: "ໄລຍະພັດທະນາລະບົບ",
    submittedAt: "2026-09-20",
    advisorConfirmationDoc: {
      name: "ໃບຢັ້ງຢືນການຕົກລົງເປັນທີ່ປຶກສາ_ກຸ່ມ5.pdf",
      size: "1.4 MB",
      date: "20 ກ.ຍ. 2026",
    },
    files: [
      { name: "vehicle_rental_sys.pdf", size: "3.7 MB", version: "v1.0", date: "20 ກ.ຍ. 2026" },
    ],
  },
  {
    id: "6",
    groupNo: 6,
    classroom: "2it_con2",
    code: "CS-2026-G06",
    titleLao: "ອະນິເມຊັ່ນ (ຜົນກະທົບຂອງການຖິ້ມຂີ້ເຫຍື້ອຊະຊາຍ)",
    titleEn: "Animation: The Impact of Indiscriminate Waste Disposal",
    abstract: "ສື່ແອນິເມຊັນ 2D/3D ເພື່ອສ້າງຈິດສຳນຶກໃນການຄຸ້ມຄອງສິ່ງແວດລ້ອມ ແລະ ຜົນກະທົບຈາກຂີ້ເຫຍື້ອຕໍ່ສັງຄົມ.",
    academicYear: "2025 - 2026",
    advisor: "ທ່ານ ຮສ. ຫາ ບຸນທັນ",
    advisorDepartment: "ພາກວິຊາວິສະວະກຳຄອມພິວເຕີ ແລະ ເຕັກໂນໂລຊີຂໍ້ມູນຂ່າວສານ",
    members: [
      { name: "ນາງ ວິໄລພອນ ໄຊຍະແສງ", studentId: "2IT2-004", classroom: "2it_con2" },
      {
        name: "ທ້າວ ໄຊຊະນະ ມະນີວົງ",
        studentId: "2IT2-008",
        classroom: "2it_con1",
        isPreviousGen: true,
        note: "ນັກສຶກສາຕົກຮຸ່ນ",
      },
      { name: "ນາງ ດາລິສອນ ສີຫາບາດ", studentId: "2IT2-015", classroom: "2it_con2" },
    ],
    status: "APPROVED",
    statusLabel: "ອະນຸມັດຫົວຂໍ້ແລ້ວ",
    badgeVariant: "emerald",
    currentStage: "ໄລຍະພັດທະນາລະບົບ",
    submittedAt: "2026-09-22",
    advisorConfirmationDoc: {
      name: "ໃບຢັ້ງຢືນການຕົກລົງເປັນທີ່ປຶກສາ_ກຸ່ມ6.pdf",
      size: "1.0 MB",
      date: "22 ກ.ຍ. 2026",
    },
    files: [
      { name: "animation_storyboard_draft.pdf", size: "5.4 MB", version: "v1.2", date: "22 ກ.ຍ. 2026" },
    ],
  },
];

// Predefined registered students directory for dropdown selection
const registeredStudentsList = [
  { studentId: "FS-CS-2022-001", name: "ທ້າວ ສົມພອນ ແກ້ວມະນີ", classroom: "4IT1", isPreviousGen: false, note: "" },
  { studentId: "FS-CS-2022-002", name: "ນາງ ມະນີວອນ ດວງດີ", classroom: "4IT1", isPreviousGen: false, note: "" },
  { studentId: "FS-IT-2022-015", name: "ທ້າວ ບຸນທະວີ ສີສຸລາດ", classroom: "4IT2", isPreviousGen: false, note: "" },
  { studentId: "FS-IT-2022-016", name: "ນາງ ວິໄລພອນ ຄຳພູວົງ", classroom: "4IT2", isPreviousGen: false, note: "" },
  { studentId: "FS-SE-2022-033", name: "ທ້າວ ອານຸສອນ ພົມມະຈັນ", classroom: "4SE", isPreviousGen: false, note: "" },
  { studentId: "FS-CS-2022-045", name: "ທ້າວ ກິດຕິສັກ ສຸວັນນະສີ", classroom: "4IT1", isPreviousGen: false, note: "" },
  { studentId: "2IT-001", name: "ທ້າວ ແຮັກເຕ້ ແສງສະຫວ່າງ", classroom: "2IT-CON", isPreviousGen: false, note: "" },
  { studentId: "2IT-002", name: "ທ້າວ ບຸນທະວີ ວໍລະລາດ", classroom: "2IT-CON", isPreviousGen: false, note: "" },
  { studentId: "2IT-003", name: "ທ້າວ ສົມພົງ ສີສຸລາດ", classroom: "2IT-CON", isPreviousGen: true, note: "ນັກສຶກສາຕົກຮຸ່ນ" },
  { studentId: "2IT2-004", name: "ນາງ ວິໄລພອນ ໄຊຍະແສງ", classroom: "2it_con2", isPreviousGen: false, note: "" },
  { studentId: "2IT2-008", name: "ທ້າວ ໄຊຊະນະ ມະນີວົງ", classroom: "2it_con1", isPreviousGen: true, note: "ນັກສຶກສາຕົກຮຸ່ນ" },
  { studentId: "2IT2-015", name: "ນາງ ດາລິສອນ ສີຫາບາດ", classroom: "2it_con2", isPreviousGen: false, note: "" },
  { studentId: "4IT1-011", name: "ທ້າວ ວິຊິດ ວັນນະສານ", classroom: "4IT1", isPreviousGen: false, note: "" },
  { studentId: "4IT1-018", name: "ນາງ ສຸພັດຕາ ພົມວິຫານ", classroom: "4IT1", isPreviousGen: false, note: "" },
  { studentId: "4IT2-009", name: "ທ້າວ ສຸກສະຫວັນ ດວງປະເສີດ", classroom: "4IT2", isPreviousGen: false, note: "" },
  { studentId: "4IT2-022", name: "ນາງ ປານີ ສີຫາວົງ", classroom: "4IT2", isPreviousGen: false, note: "" },
  { studentId: "4Com3-002", name: "ທ້າວ ຫຼ້າແກ້ວ ແສງວາລຸນ", classroom: "4Com3", isPreviousGen: false, note: "" },
  { studentId: "4Com3-014", name: "ນາງ ທິບພະຈັນ ທຳມະວົງ", classroom: "4Com3", isPreviousGen: false, note: "" },
  { studentId: "4Com3-021", name: "ນາງ ວົງມະນີ ລາບບັນດິດ", classroom: "4Com3", isPreviousGen: false, note: "" },
  { studentId: "4SE-007", name: "ທ້າວ ອາລຸນເດດ ຈັນທະວີ", classroom: "4SE", isPreviousGen: false, note: "" },
  { studentId: "4SE-019", name: "ນາງ ແກ້ວມະນີ ວໍລະຈິດ", classroom: "4SE", isPreviousGen: false, note: "" },
  { studentId: "4IT1-099", name: "ທ້າວ ພຸດທະສິນ ສີປະເສີດ", classroom: "4IT1", isPreviousGen: true, note: "ນັກສຶກສາຕົກຮຸ່ນ" },
];

// Predefined available advisors directory for dropdown selection
const availableAdvisorsList = [
  { name: "ທ່ານ ຮສ. ຫາ ບຸນທັນ", department: "ພາກວິຊາວິສະວະກຳຄອມພິວເຕີ ແລະ ເຕັກໂນໂລຊີຂໍ້ມູນຂ່າວສານ", quota: "4/5 ກຸ່ມ" },
  { name: "ຮສ. ດຣ. ສົມຊາຍ ປະເສີດ", department: "ພາກວິຊາວິສະວະກຳຄອມພິວເຕີ", quota: "4/5 ກຸ່ມ" },
  { name: "ປອ. ບຸນມີ ໄຊຍະວົງ", department: "ພາກວິຊາເຕັກໂນໂລຊີຂໍ້ມູນຂ່າວສານ", quota: "3/5 ກຸ່ມ" },
  { name: "ອຈ. ດາວອນ ລັດສະໝີ", department: "ພາກວິຊາວິສະວະກຳຊອບແວ", quota: "2/5 ກຸ່ມ" },
  { name: "ຮສ. ປອ. ຄຳຫຼ້າ ແກ້ວພິລາ", department: "ພາກວິຊາວິສະວະກຳຄອມພິວເຕີ", quota: "5/5 ກຸ່ມ (ເຕັມໂຄຕ້າ)" },
  { name: "ອຈ. ປທ. ສົມສະໜຸກ ວົງວິຈິດ", department: "ພາກວິຊາເຕັກໂນໂລຊີຂໍ້ມູນຂ່າວສານ", quota: "1/5 ກຸ່ມ" },
  { name: "ອຈ. ວິໄຊ ໄຊຍະເສນ", department: "ພາກວິຊາວິສະວະກຳຊອບແວ", quota: "0/5 ກຸ່ມ" },
  { name: "ປອ. ວັນໄຊ ພົມມະລາດ", department: "ພາກວິຊາວິສະວະກຳຄອມພິວເຕີ", quota: "2/5 ກຸ່ມ" },
];

export default function ThesisManagementPage() {
  const [theses, setTheses] = useState<ThesisProject[]>(initialTheses);
  const [selectedThesis, setSelectedThesis] = useState<ThesisProject>(initialTheses[0]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showPrintReportModal, setShowPrintReportModal] = useState(false);
  const [listSortBy, setListSortBy] = useState<"group" | "advisor">("group");

  // Form State for Step 1: Staff saves thesis on behalf of students
  const [formGroupNo, setFormGroupNo] = useState(theses.length + 1);
  const [formDefaultClassroom, setFormDefaultClassroom] = useState("4IT1");
  const [formTitleLao, setFormTitleLao] = useState("");
  const [formTitleEn, setFormTitleEn] = useState("");
  const [formAdvisorName, setFormAdvisorName] = useState("ທ່ານ ຮສ. ຫາ ບຸນທັນ");
  const [formAdvisorDept, setFormAdvisorDept] = useState("ພາກວິຊາວິສະວະກຳຄອມພິວເຕີ ແລະ ເຕັກໂນໂລຊີຂໍ້ມູນຂ່າວສານ");
  const [formStudents, setFormStudents] = useState<StudentMember[]>([
    { name: "", studentId: "", classroom: "4IT1", isPreviousGen: false, note: "" },
  ]);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState(false);

  const handleSelectStudentFromDropdown = (index: number, selectedVal: string, opt?: SearchableOption) => {
    if (!selectedVal) {
      updateStudentField(index, "name", "");
      updateStudentField(index, "studentId", "");
      updateStudentField(index, "classroom", formDefaultClassroom);
      updateStudentField(index, "isPreviousGen", false);
      return;
    }
    const meta = opt?.metadata as StudentRecord | undefined;
    if (meta) {
      const updated = [...formStudents];
      updated[index] = {
        name: meta.name,
        studentId: meta.studentId,
        classroom: meta.classroom,
        isPreviousGen: Boolean(meta.isPreviousGen),
        note: meta.note || "",
      };
      setFormStudents(updated);
    } else {
      // Direct custom input or found in registered list
      const found = registeredStudentsList.find((s) => s.studentId === selectedVal || s.name === selectedVal);
      if (found) {
        const updated = [...formStudents];
        updated[index] = {
          name: found.name,
          studentId: found.studentId,
          classroom: found.classroom,
          isPreviousGen: found.isPreviousGen,
          note: found.note,
        };
        setFormStudents(updated);
      } else {
        updateStudentField(index, "name", selectedVal);
      }
    }
  };

  const handleSelectAdvisorFromDropdown = (advisorVal: string, opt?: SearchableOption) => {
    if (!advisorVal) {
      setFormAdvisorName("");
      setFormAdvisorDept("");
      return;
    }
    const meta = opt?.metadata as TeacherRecord | undefined;
    if (meta) {
      setFormAdvisorName(meta.fullName);
      setFormAdvisorDept(meta.department);
    } else {
      const found = availableAdvisorsList.find((a) => a.name === advisorVal);
      if (found) {
        setFormAdvisorName(found.name);
        setFormAdvisorDept(found.department);
      } else {
        setFormAdvisorName(advisorVal);
      }
    }
  };

  const addStudentField = () => {
    if (formStudents.length < 3) {
      setFormStudents([
        ...formStudents,
        { name: "", studentId: "", classroom: formDefaultClassroom, isPreviousGen: false, note: "" },
      ]);
    }
  };

  const removeStudentField = (index: number) => {
    if (formStudents.length > 1) {
      setFormStudents(formStudents.filter((_, i) => i !== index));
    }
  };

  const updateStudentField = <K extends keyof StudentMember>(
    index: number,
    field: K,
    value: StudentMember[K]
  ) => {
    const updated = [...formStudents];
    if (field === "isPreviousGen") {
      updated[index].isPreviousGen = Boolean(value);
      updated[index].note = value ? "ນັກສຶກສາຕົກຮຸ່ນ" : "";
    } else {
      updated[index] = { ...updated[index], [field]: value };
    }
    setFormStudents(updated);
  };

  const handleRegisterThesis = (e: React.FormEvent) => {
    e.preventDefault();
    const newGroupNum = formGroupNo || theses.length + 1;
    const newCode = `CS-2026-G0${newGroupNum}`;

    // Get unique classes in group
    const uniqueClasses = Array.from(
      new Set(formStudents.map((s) => s.classroom || formDefaultClassroom))
    ).join(" / ");

    const newThesis: ThesisProject = {
      id: `${Date.now()}`,
      groupNo: newGroupNum,
      classroom: uniqueClasses || formDefaultClassroom,
      code: newCode,
      titleLao: formTitleLao || "ຫົວຂໍ້ບົດໂຄງການໃໝ່",
      titleEn: formTitleEn || "New Bachelor Thesis Topic",
      abstract: "ບົດຄັດຫຍໍ້ເບື້ອງຕົ້ນທີ່ໄດ້ຮັບການຢືນຢັນຈາກອາຈານທີ່ປຶກສາແລ້ວ.",
      academicYear: "2025 - 2026",
      advisor: formAdvisorName || "ທ່ານ ຮສ. ຫາ ບຸນທັນ",
      advisorDepartment: formAdvisorDept,
      members: formStudents.filter((s) => s.name.trim() !== ""),
      status: "APPROVED",
      statusLabel: "ອະນຸມັດຫົວຂໍ້ແລ້ວ",
      badgeVariant: "emerald",
      currentStage: "ໄລຍະພັດທະນາລະບົບ",
      submittedAt: new Date().toISOString().split("T")[0],
      advisorConfirmationDoc: {
        name: uploadedFileName || `ໃບຢັ້ງຢືນການຕົກລົງເປັນທີ່ປຶກສາ_ກຸ່ມ${newGroupNum}.pdf`,
        size: "1.4 MB",
        date: "ມື້ນີ້",
      },
      files: [
        {
          name: uploadedFileName || `ໃບຢັ້ງຢືນການຕົກລົງເປັນທີ່ປຶກສາ_ກຸ່ມ${newGroupNum}.pdf`,
          size: "1.4 MB",
          version: "v1.0 (ຢືນຢັນແລ້ວ)",
          date: "ມື້ນີ້",
        },
      ],
    };

    setTheses([...theses, newThesis]);
    setSelectedThesis(newThesis);
    setSaveSuccessMsg(true);
    setTimeout(() => {
      setSaveSuccessMsg(false);
      setShowSubmitModal(false);
      // Reset form
      setFormGroupNo(theses.length + 2);
      setFormDefaultClassroom("4IT1");
      setFormTitleLao("");
      setFormTitleEn("");
      setFormAdvisorName("ທ່ານ ຮສ. ຫາ ບຸນທັນ");
      setFormStudents([
        { name: "", studentId: "", classroom: "4IT1", isPreviousGen: false, note: "" },
      ]);
      setUploadedFileName(null);
    }, 1500);
  };

  const filteredTheses = theses.filter((t) => {
    const matchesSearch =
      t.titleEn.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.titleLao.includes(searchTerm) ||
      t.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.classroom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.members.some(
        (m) =>
          m.name.includes(searchTerm) ||
          (m.classroom && m.classroom.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    const matchesStatus = statusFilter === "ALL" || t.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const displayedTheses = React.useMemo(() => {
    return [...filteredTheses].sort((a, b) => {
      if (listSortBy === "advisor") {
        return a.advisor.localeCompare(b.advisor, "lo");
      }
      return a.groupNo - b.groupNo;
    });
  }, [filteredTheses, listSortBy]);

  return (
    <AppShell>
      <div className="space-y-6 font-sans">
        {/* Page Header */}
        <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4 border-b border-slate-200 pb-6">
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-950 font-lao">
                ຄຸ້ມຄອງບົດໂຄງການຈົບຊັ້ນ (Thesis &amp; Group Management)
              </h1>
              <Badge variant="sky">ບົດບາດ: ວິຊາການ &amp; ຫົວໜ້າພາກ</Badge>
            </div>
            <p className="mt-1 text-sm text-slate-500 font-lao">
              ຂັ້ນຕອນທີ 1: ນັກສຶກສາ (ສາມາດມາຈາກຕ່າງຫ້ອງຮຽນ ຫຼື ຕົກຮຸ່ນ) ຍື່ນຫົວຂໍ້ບົດ ແລະ ໃບຢັ້ງຢືນຈາກອາຈານ → ວິຊາການບັນທຶກ ແລະ ພິມລາຍງານ.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <Button
              variant="outline"
              onClick={() => setShowPrintReportModal(true)}
              leftIcon={<Printer className="h-4 w-4 text-emerald-600" />}
              className="border-emerald-300 text-emerald-800 hover:bg-emerald-50 font-lao font-semibold shadow-xs"
            >
              ພິມລາຍງານທາງການ (Print Report)
            </Button>

            <Button
              onClick={() => setShowSubmitModal(true)}
              leftIcon={<Plus className="h-4 w-4" />}
              className="font-lao shadow-xs"
            >
              ລົງທະບຽນບົດໃໝ່ (Staff Entry)
            </Button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center gap-2 flex-1 max-w-md bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
            <Search className="h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="ຄົ້ນຫາຊື່ນັກສຶກສາ, ຫ້ອງ, ລະຫັດບົດ, ຫົວຂໍ້..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent text-xs text-slate-800 placeholder-slate-400 focus:outline-none w-full font-lao"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs font-lao">
            {/* Sort Toggle */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
              <span className="text-slate-500 px-1 font-medium">ຈັດຮຽງ:</span>
              <button
                type="button"
                onClick={() => setListSortBy("group")}
                className={`px-2.5 py-1 rounded-md font-semibold transition ${
                  listSortBy === "group"
                    ? "bg-white text-slate-900 shadow-xs border border-slate-200/80"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                ກຸ່ມທີ
              </button>
              <button
                type="button"
                onClick={() => setListSortBy("advisor")}
                className={`px-2.5 py-1 rounded-md font-semibold transition ${
                  listSortBy === "advisor"
                    ? "bg-white text-slate-900 shadow-xs border border-slate-200/80"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                ອາຈານທີ່ປຶກສາ
              </button>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-slate-500 font-medium flex items-center gap-1 mr-1">
                <Filter className="h-3.5 w-3.5 text-slate-400" /> ສະຖານະ:
              </span>
              {[
                { id: "ALL", label: "ທັງໝົດ" },
                { id: "APPROVED", label: "ອະນຸມັດແລ້ວ" },
                { id: "UNDER_REVIEW", label: "ລໍຖ້າກວດສອບ" },
              ].map((st) => (
                <button
                  key={st.id}
                  onClick={() => setStatusFilter(st.id)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                    statusFilter === st.id
                      ? "bg-sky-600 text-white shadow-xs border border-sky-600"
                      : "bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-slate-200"
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Split-Pane Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Thesis Projects List (5 Cols) */}
          <div className="lg:col-span-5 space-y-3 font-lao">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                ລາຍການບົດໂຄງການ ({displayedTheses.length} ກຸ່ມ)
              </span>
              <span className="text-xs text-slate-400">ຄລິກເພື່ອເບິ່ງລາຍລະອຽດ</span>
            </div>

            <div className="space-y-3">
              {displayedTheses.map((thesis) => {
                const isSelected = selectedThesis.id === thesis.id;
                const hasPreviousGen = thesis.members.some((m) => m.isPreviousGen);

                return (
                  <div
                    key={thesis.id}
                    onClick={() => setSelectedThesis(thesis)}
                    className={`cursor-pointer rounded-xl p-4 transition-all border ${
                      isSelected
                        ? "border-sky-500 bg-sky-50/40 ring-2 ring-sky-200 shadow-sm"
                        : "border-slate-200/90 bg-white hover:border-slate-300 hover:shadow-xs"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-sky-50 text-sky-800 border border-sky-200 text-xs font-mono font-bold">
                          ກຸ່ມ {thesis.groupNo}
                        </span>
                        <span className="font-mono text-xs font-bold text-slate-600">
                          {thesis.classroom}
                        </span>
                        {hasPreviousGen && (
                          <span className="text-[10px] text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 font-semibold">
                            ມີນັກສຶກສາຕົກຮຸ່ນ
                          </span>
                        )}
                      </div>
                      <Badge variant={thesis.badgeVariant}>{thesis.statusLabel}</Badge>
                    </div>

                    <h3 className="mt-2 text-sm font-bold text-slate-900 line-clamp-1">
                      {thesis.titleLao}
                    </h3>
                    <p className="text-xs text-slate-500 font-mono line-clamp-1 mt-0.5">
                      {thesis.titleEn}
                    </p>

                    <div className="mt-3 flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
                      <div className="flex items-center gap-1.5">
                        <Users className="h-3.5 w-3.5 text-slate-400" />
                        <span>{thesis.members.length} ນັກສຶກສາ</span>
                      </div>
                      <span className="font-medium text-slate-700 truncate max-w-[160px]">
                        {thesis.advisor}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Detailed Workspace & Document Review (7 Cols) */}
          <div className="lg:col-span-7 font-lao">
            <Card className="h-full flex flex-col justify-between">
              <div>
                <CardHeader className="border-b border-slate-100 bg-slate-50/40">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs text-sky-800 bg-sky-50 border border-sky-200 px-2.5 py-0.5 rounded">
                        ກຸ່ມທີ {selectedThesis.groupNo}
                      </span>
                      <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded">
                        ຫ້ອງ: {selectedThesis.classroom}
                      </span>
                    </div>
                    <Badge variant={selectedThesis.badgeVariant}>{selectedThesis.statusLabel}</Badge>
                  </div>
                  <CardTitle className="text-lg sm:text-xl font-bold mt-2">
                    {selectedThesis.titleLao}
                  </CardTitle>
                  <p className="text-sm text-slate-600 font-mono font-medium mt-1">
                    {selectedThesis.titleEn}
                  </p>
                </CardHeader>

                <CardContent className="space-y-6 pt-6">
                  {/* Students (Advicees) & Advisor Metadata */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Advicees List (at most 3) with Individual Classrooms & Previous Gen Status */}
                    <div className="bg-white p-3.5 rounded-lg border border-slate-200">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                          <Users className="h-3.5 w-3.5 text-sky-600" /> ນັກສຶກສາເຈົ້າຂອງບົດ
                        </h4>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                          {selectedThesis.members.length} / 3 ຄົນ
                        </span>
                      </div>
                      <ul className="space-y-2 text-xs text-slate-700">
                        {selectedThesis.members.map((m, idx) => (
                          <li
                            key={m.studentId || idx}
                            className="bg-slate-50 p-2.5 rounded border border-slate-100 space-y-1"
                          >
                            <div className="flex justify-between items-center">
                              <span className="font-medium text-slate-900">
                                {idx + 1}. {m.name}
                              </span>
                              <span className="font-mono text-slate-500 text-[11px]">{m.studentId}</span>
                            </div>
                            <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-200/60">
                              <span>ຫ້ອງ: <strong className="text-slate-700">{m.classroom}</strong></span>
                              {m.isPreviousGen ? (
                                <span className="text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded font-bold text-[10px]">
                                  {m.note || "ນັກສຶກສາຕົກຮຸ່ນ"}
                                </span>
                              ) : (
                                <span className="text-slate-400 text-[10px]">ຮຸ່ນປົກກະຕິ</span>
                              )}
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Advisor Details */}
                    <div className="bg-white p-3.5 rounded-lg border border-slate-200">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5 mb-2">
                        <BookOpen className="h-3.5 w-3.5 text-sky-600" /> ອາຈານທີ່ປຶກສາບົດ
                      </h4>
                      <p className="text-sm font-bold text-slate-900">
                        {selectedThesis.advisor}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {selectedThesis.advisorDepartment}
                      </p>
                      <p className="text-[11px] text-slate-400 mt-2">
                        ສົກຮຽນ: {selectedThesis.academicYear}
                      </p>
                    </div>
                  </div>

                  {/* Advisor Confirmation Document Spotlight (ໃບຢັ້ງຢືນການຕົກລົງເປັນທີ່ປຶກສາ) */}
                  <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-200">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-900 flex items-center gap-1.5">
                        <FileCheck2 className="h-4 w-4 text-emerald-600" /> ໃບຢັ້ງຢືນການຕົກລົງເປັນທີ່ປຶກສາ (Advisor Agreement)
                      </h4>
                      <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300">
                        ເຊັນຢືນຢັນແລ້ວ
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg border border-emerald-100 bg-white">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
                          PDF
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-900">
                            {selectedThesis.advisorConfirmationDoc.name}
                          </p>
                          <p className="text-[11px] text-slate-400">
                            ຂະໜາດ: {selectedThesis.advisorConfirmationDoc.size} • ວັນທີຍື່ນ: {selectedThesis.advisorConfirmationDoc.date}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 text-xs"
                        leftIcon={<Download className="h-3.5 w-3.5" />}
                      >
                        ເບິ່ງເອກະສານ
                      </Button>
                    </div>
                  </div>

                  {/* Abstract Section */}
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                      ບົດຄັດຫຍໍ້ເບື້ອງຕົ້ນ (Abstract Synopsis)
                    </h4>
                    <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3.5 rounded-lg border border-slate-200">
                      {selectedThesis.abstract}
                    </p>
                  </div>
                </CardContent>
              </div>

              {/* Staff / Head Operational Action Toolbar */}
              <CardFooter className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 bg-slate-50 p-4">
                <div className="text-xs text-slate-500">
                  <span>ຈັດການໂດຍ: ພະນັກງານວິຊາການ / ຫົວໜ້າພາກ</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowPrintReportModal(true)}
                    leftIcon={<Printer className="h-3.5 w-3.5 text-emerald-600" />}
                  >
                    ເບິ່ງແບບພິມລາຍງານ
                  </Button>
                  <Button size="sm" leftIcon={<CheckCircle className="h-3.5 w-3.5 text-white" />}>
                    ອະນຸມັດ ແລະ ຈັດຕາຕະລາງສອບ
                  </Button>
                </div>
              </CardFooter>
            </Card>
          </div>
        </div>

        {/* Step 1 Registration Modal (Staff Entry for Student Topic & Advisor Confirmation) */}
        {showSubmitModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-5 my-8 font-lao">
              {/* Modal Header */}
              <div className="flex items-start justify-between border-b border-slate-100 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-sky-100 text-sky-800 text-[11px] font-bold">
                      ຂັ້ນຕອນທີ 1 (Step 1)
                    </span>
                    <span className="text-xs text-slate-500">ລົງທະບຽນບົດໂຄງການ</span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-950 mt-1">
                    ບັນທຶກຫົວຂໍ້ບົດໂຄງການ ແລະ ອາຈານທີ່ປຶກສາ
                  </h3>
                  <p className="text-xs text-slate-500">
                    ຮອງຮັບນັກສຶກສາທີ່ມາຈາກຕ່າງຫ້ອງຮຽນ ແລະ ໝາຍເຫດນັກສຶກສາຕົກຮຸ່ນ (ຄ້າງປີ)
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowSubmitModal(false)}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
                  aria-label="Close modal"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {saveSuccessMsg && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center gap-2 animate-in fade-in">
                  <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>ລົງທະບຽນບົດໂຄງການສຳເລັດແລ້ວ! ຂໍ້ມູນຖືກບັນທຶກລົງລະບົບຮຽບຮ້ອຍ.</span>
                </div>
              )}

              <form onSubmit={handleRegisterThesis} className="space-y-4 text-xs">
                {/* Group & Default Classroom Information */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">
                      ກຸ່ມທີ (Group No.) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="number"
                      required
                      min={1}
                      value={formGroupNo}
                      onChange={(e) => setFormGroupNo(Number(e.target.value))}
                      className="w-full border border-slate-300 rounded-lg p-2.5 text-slate-800 focus:outline-sky-500 bg-white"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">
                      ຫ້ອງຮຽນເລີ່ມຕົ້ນ (Default Class)
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 4IT1, 4IT2, 2IT-CON"
                      value={formDefaultClassroom}
                      onChange={(e) => setFormDefaultClassroom(e.target.value)}
                      className="w-full border border-slate-300 rounded-lg p-2.5 text-slate-800 focus:outline-sky-500 bg-white"
                    />
                  </div>
                </div>

                {/* 1. Dual-Language Topics */}
                <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
                    1. ຫົວຂໍ້ບົດໂຄງການ (Topic in Lao &amp; English)
                  </h4>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">
                      ຫົວຂໍ້ບົດໂຄງການ (ພາສາລາວ) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="ຕົວຢ່າງ: ລະບົບຈັດການເອກະສານຂອງສາຍການບິນລາວ..."
                      value={formTitleLao}
                      onChange={(e) => setFormTitleLao(e.target.value)}
                      className="w-full border border-slate-300 rounded-lg p-2.5 text-slate-800 focus:outline-sky-500 bg-white"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">
                      ຫົວຂໍ້ບົດໂຄງການ (ພາສາອັງກິດ) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Document Management System for Lao Airlines..."
                      value={formTitleEn}
                      onChange={(e) => setFormTitleEn(e.target.value)}
                      className="w-full border border-slate-300 rounded-lg p-2.5 text-slate-800 focus:outline-sky-500 bg-white"
                    />
                  </div>
                </div>

                {/* 2. Advicees (Students, at most 3) with Individual Classrooms & ໝາຍເຫດ */}
                <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
                        2. ນັກສຶກສາເຈົ້າຂອງບົດ (Advicees - ສູງສຸດ 3 ຄົນ)
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        ນັກສຶກສາສາມາດມາຈາກຕ່າງຫ້ອງຮຽນກັນໄດ້ ແລະ ສາມາດໝາຍເຫດນັກສຶກສາຕົກຮຸ່ນໄດ້
                      </p>
                    </div>
                    {formStudents.length < 3 && (
                      <button
                        type="button"
                        onClick={addStudentField}
                        className="text-xs text-sky-600 font-bold hover:text-sky-700 flex items-center gap-1 bg-white px-2.5 py-1 rounded border border-slate-200"
                      >
                        <Plus className="h-3 w-3" /> ເພີ່ມນັກສຶກສາ
                      </button>
                    )}
                  </div>

                  <div className="space-y-3">
                    {formStudents.map((student, index) => (
                      <div
                        key={index}
                        className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-sky-700 text-xs flex items-center gap-1.5">
                            <GraduationCap className="h-3.5 w-3.5 text-sky-600" />
                            ນັກສຶກສາຄົນທີ {index + 1}
                          </span>
                          {formStudents.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeStudentField(index)}
                              className="text-slate-400 hover:text-rose-500 flex items-center gap-1 text-[11px]"
                              title="ລຶບ"
                            >
                              <Trash2 className="h-3.5 w-3.5" /> ລຶບ
                            </button>
                          )}
                        </div>

                        {/* Student Searchable Dropdown Selector */}
                        <div>
                          <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                            ເລືອກນັກສຶກສາຈາກລາຍຊື່ <span className="text-rose-500">*</span>
                          </label>
                          <SearchableSelect
                            options={studentSearchableOptions}
                            value={student.studentId}
                            onChange={(val, opt) => handleSelectStudentFromDropdown(index, val, opt)}
                            placeholder="ຄົ້ນຫາ ແລະ ເລືອກນັກສຶກສາ..."
                            searchPlaceholder="ພິມລະຫັດ, ຊື່, ຫຼື ຫ້ອງຮຽນ..."
                            allowCustom={true}
                            customPlaceholder="+ ປ້ອນຊື່ນັກສຶກສານີ້:"
                          />
                        </div>

                        {/* Editable Detail Fields */}
                        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 pt-1 bg-slate-50/70 p-2.5 rounded-lg border border-slate-100">
                          <div className="sm:col-span-5">
                            <label className="text-[10px] text-slate-500 font-semibold block mb-0.5">
                              ຊື່ ແລະ ນາມສະກຸນ
                            </label>
                            <input
                              type="text"
                              required
                              placeholder="ຊື່ ແລະ ນາມສະກຸນ..."
                              value={student.name}
                              onChange={(e) =>
                                updateStudentField(index, "name", e.target.value)
                              }
                              className="w-full border border-slate-300 rounded-md p-1.5 text-slate-900 text-xs focus:outline-sky-500 bg-white"
                            />
                          </div>
                          <div className="sm:col-span-4">
                            <label className="text-[10px] text-slate-500 font-semibold block mb-0.5">
                              ລະຫັດນັກສຶກສາ
                            </label>
                            <input
                              type="text"
                              required
                              placeholder="ລະຫັດ (e.g. 4IT1-012)"
                              value={student.studentId}
                              onChange={(e) =>
                                updateStudentField(index, "studentId", e.target.value)
                              }
                              className="w-full border border-slate-300 rounded-md p-1.5 text-slate-900 text-xs font-mono focus:outline-sky-500 bg-white"
                            />
                          </div>
                          <div className="sm:col-span-3">
                            <label className="text-[10px] text-slate-500 font-semibold block mb-0.5">
                              ຫ້ອງຮຽນ
                            </label>
                            <input
                              type="text"
                              required
                              placeholder="ຫ້ອງຮຽນ"
                              value={student.classroom}
                              onChange={(e) =>
                                updateStudentField(index, "classroom", e.target.value)
                              }
                              className="w-full border border-slate-300 rounded-md p-1.5 text-slate-900 text-xs font-semibold focus:outline-sky-500 bg-white"
                            />
                          </div>
                        </div>

                        {/* Previous Gen Checkbox (ໝາຍເຫດນັກສຶກສາຕົກຮຸ່ນ) */}
                        <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
                          <label className="flex items-center gap-2 cursor-pointer text-slate-700 text-[11px]">
                            <input
                              type="checkbox"
                              checked={!!student.isPreviousGen}
                              onChange={(e) =>
                                updateStudentField(index, "isPreviousGen", e.target.checked)
                              }
                              className="rounded border-slate-300 text-amber-600 focus:ring-amber-500 h-3.5 w-3.5"
                            />
                            <span className="font-medium">
                              ເປັນນັກສຶກສາຕົກຮຸ່ນ (ສອບຕົກບົດປີຜ່ານມາ / ມາຈາກຮຸ່ນກ່ອນ)
                            </span>
                          </label>
                          {student.isPreviousGen && (
                            <span className="text-[10px] text-amber-800 bg-amber-100 px-2 py-0.5 rounded font-bold">
                              ໝາຍເຫດ: ນັກສຶກສາຕົກຮຸ່ນ
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 3. Advisor Information with Searchable Dropdown */}
                <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                      <BookOpen className="h-3.5 w-3.5 text-amber-600" />
                      3. ອາຈານທີ່ປຶກສາບົດໂຄງການ
                    </h4>
                    <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      ຄົ້ນຫາຈາກອາຈານໃນພາກວິຊາ
                    </span>
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">
                      ເລືອກອາຈານທີ່ປຶກສາ <span className="text-rose-500">*</span>
                    </label>
                    <SearchableSelect
                      options={teacherSearchableOptions}
                      value={formAdvisorName}
                      onChange={(val, opt) => handleSelectAdvisorFromDropdown(val, opt)}
                      placeholder="ຄົ້ນຫາ ແລະ ເລືອກອາຈານທີ່ປຶກສາ..."
                      searchPlaceholder="ພິມຊື່ອາຈານ, ຕຳແໜ່ງ, ຫຼື ພາກວິຊາ..."
                      allowCustom={true}
                      customPlaceholder="+ ປ້ອນຊື່ອາຈານພິເສດ:"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">
                        ຊື່ອາຈານທີ່ປຶກສາ (Name) <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="ຕົວຢ່າງ: ທ່ານ ຮສ. ຫາ ບຸນທັນ"
                        value={formAdvisorName}
                        onChange={(e) => setFormAdvisorName(e.target.value)}
                        className="w-full border border-slate-300 rounded-lg p-2.5 text-slate-800 focus:outline-sky-500 bg-white text-xs"
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">
                        ສັງກັດພາກວິຊາ / ຄະນະ (Department)
                      </label>
                      <input
                        type="text"
                        value={formAdvisorDept}
                        onChange={(e) => setFormAdvisorDept(e.target.value)}
                        className="w-full border border-slate-300 rounded-lg p-2.5 text-slate-800 focus:outline-sky-500 bg-white text-xs"
                      />
                    </div>
                  </div>
                </div>

                {/* 4. Advisor Confirmation Document Upload */}
                <div className="space-y-2 bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
                    4. ເອກະສານຢືນຢັນຈາກອາຈານທີ່ປຶກສາ (Advisor Agreement Confirmation) <span className="text-rose-500">*</span>
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    ອັບໂຫຼດໃບຢັ້ງຢືນການຕົກລົງເປັນທີ່ປຶກສາ ທີ່ມີລາຍເຊັນຈາກອາຈານ (.pdf, .jpg, .png)
                  </p>

                  <div
                    onClick={() => setUploadedFileName("ໃບຢັ້ງຢືນການຕົກລົງເປັນທີ່ປຶກສາ_ເຊັນແລ້ວ.pdf")}
                    className="border-2 border-dashed border-emerald-300 bg-emerald-50/40 rounded-xl p-4 text-center hover:bg-emerald-50 cursor-pointer transition"
                  >
                    <UploadCloud className="h-6 w-6 text-emerald-600 mx-auto mb-1" />
                    {uploadedFileName ? (
                      <div className="flex items-center justify-center gap-1.5 text-emerald-700 font-bold">
                        <CheckCircle className="h-4 w-4" />
                        <span>ໄຟລ໌ທີ່ເລືອກ: {uploadedFileName}</span>
                      </div>
                    ) : (
                      <div>
                        <span className="text-emerald-800 font-semibold block">ຄລິກເພື່ອອັບໂຫຼດເອກະສານຢືນຢັນຈາກອາຈານ</span>
                        <span className="text-[10px] text-slate-400">ຮອງຮັບໄຟລ໌ PDF, PNG, JPG ຂະໜາດບໍ່ເກີນ 15MB</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Modal Footer Buttons */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                  <span className="text-[11px] text-slate-400">
                    ບັນທຶກໂດຍ: ພະນັກງານວິຊາການ / ຫົວໜ້າພາກວິຊາ
                  </span>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setShowSubmitModal(false)}
                    >
                      ຍົກເລີກ
                    </Button>
                    <Button type="submit" size="sm" leftIcon={<FileCheck2 className="h-4 w-4" />}>
                      ບັນທຶກບົດໂຄງການລົງລະບົບ
                    </Button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Printable Official Report Modal */}
        {showPrintReportModal && (
          <OfficialThesisReport
            defaultSortBy={listSortBy}
            records={theses.map((t) => ({
              groupNo: t.groupNo,
              classroom: t.classroom,
              topicLao: t.titleLao,
              topicEn: t.titleEn,
              advisor: t.advisor,
              members: t.members.map((m, idx) => ({
                index: idx + 1,
                name: m.name,
                studentId: m.studentId,
                classroom: m.classroom,
                isPreviousGen: m.isPreviousGen,
                note: m.note,
              })),
            }))}
            onClose={() => setShowPrintReportModal(false)}
          />
        )}
      </div>
    </AppShell>
  );
}

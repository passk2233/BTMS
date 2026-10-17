"use client";

import React, { useState, useEffect } from "react";
import {
  Users,
  ShieldCheck,
  Search,
  Filter,
  UserPlus,
  Key,
  CheckCircle,
  Clock,
  History,
  AlertCircle,
  GraduationCap,
  Briefcase,
  Award,
  BookOpen,
  Calendar,
  ExternalLink,
  Edit2,
  X,
  ChevronRight,
  UserCheck,
  Sparkles,
  BarChart2,
  FolderOpen,
} from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Badge, BadgeVariant } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import Link from "next/link";
import { SearchableSelect } from "@/components/ui/searchable-select";
import {
  studentSearchableOptions,
  teacherSearchableOptions,
  registeredStudents,
  registeredTeachers,
  StudentRecord,
  TeacherRecord,
} from "@/lib/academic-directory";

// ---------------------------------------------------------------------------
// Type Definitions
// ---------------------------------------------------------------------------

interface Student {
  id: string;
  profileId: string;
  studentCode: string;
  name: string;
  email: string;
  department: string;
  faculty: string;
  thesisId?: string;
  thesisTopicTH?: string;
  thesisTopicEN?: string;
  thesisStatus?: string;
  isLeader?: boolean;
  primaryAdvisorName?: string;
  createdAt: string;
}

interface AdvisingThesis {
  thesisId: string;
  topicTH: string;
  topicEN: string;
  status: string;
  academicYear: number;
  semester: number;
  isPrimary: boolean;
  studentLeader: string;
}

interface CommitteeExam {
  examId: string;
  examTypeCode: string;
  scheduledDate: string;
  startTime: string;
  endTime: string;
  examStatus: string;
  committeeRole: "CHAIRMAN" | "COMMITTEE" | "SECRETARY";
  topicTH: string;
  topicEN: string;
  roomName: string;
}

interface Teacher {
  id: string;
  profileId: string;
  academicTitle: string;
  name: string;
  email: string;
  department: string;
  faculty: string;
  advisingCount: number;
  maxAdvisingQuota: number;
  committeeCount: number;
  roles: string[];
  advisingTheses: AdvisingThesis[];
  committeeExams: CommitteeExam[];
  createdAt: string;
}

interface UserAccount {
  id: string;
  name: string;
  email: string;
  studentIdOrDept: string;
  roles: { code: string; name: string; variant: BadgeVariant }[];
  status: "ACTIVE" | "PENDING_ACTIVATION" | "SUSPENDED";
  statusLao: string;
  lastLogin: string;
}

// ---------------------------------------------------------------------------
// Mock Data (Realistic Lao University Academic Context)
// ---------------------------------------------------------------------------

const initialStudents: Student[] = [
  {
    id: "std_01",
    profileId: "p_std_01",
    studentCode: "FS-CS-2022-001",
    name: "ທ້າວ ສົມພອນ ແກ້ວມະນີ",
    email: "somphone.k@student.nuol.edu.la",
    department: "ວິສະວະກຳຄອມພິວເຕີ",
    faculty: "ຄະນະວິສະວະກຳສາດ",
    thesisId: "th_01",
    thesisTopicTH: "ລະບົບບໍລິຫານຈັດການບົດໂຄງການຈົບຊັ້ນ ແລະ ການເງິນອັດຕະໂນມັດ",
    thesisTopicEN: "Automated Bachelor Thesis and Financial Management System",
    thesisStatus: "IN_PROGRESS",
    isLeader: true,
    primaryAdvisorName: "ຮສ. ດຣ. ສົມຊາຍ ປະເສີດ",
    createdAt: "2024-09-01",
  },
  {
    id: "std_02",
    profileId: "p_std_02",
    studentCode: "FS-CS-2022-002",
    name: "ນາງ ມະນີວອນ ດວງດີ",
    email: "manivon.d@student.nuol.edu.la",
    department: "ວິສະວະກຳຄອມພິວເຕີ",
    faculty: "ຄະນະວິສະວະກຳສາດ",
    thesisId: "th_01",
    thesisTopicTH: "ລະບົບບໍລິຫານຈັດການບົດໂຄງການຈົບຊັ້ນ ແລະ ການເງິນອັດຕະໂນມັດ",
    thesisTopicEN: "Automated Bachelor Thesis and Financial Management System",
    thesisStatus: "IN_PROGRESS",
    isLeader: false,
    primaryAdvisorName: "ຮສ. ດຣ. ສົມຊາຍ ປະເສີດ",
    createdAt: "2024-09-01",
  },
  {
    id: "std_03",
    profileId: "p_std_03",
    studentCode: "FS-IT-2022-015",
    name: "ທ້າວ ບຸນທະວີ ສີສຸລາດ",
    email: "bounthavy.s@student.nuol.edu.la",
    department: "ເຕັກໂນໂລຊີຂໍ້ມູນຂ່າວສານ",
    faculty: "ຄະນະວິສະວະກຳສາດ",
    thesisId: "th_02",
    thesisTopicTH: "ລະບົບກວດສອບໃບໜ້າເຂົ້າຫ້ອງຮຽນດ້ວຍ AI",
    thesisTopicEN: "AI-based Facial Recognition Attendance System",
    thesisStatus: "PROPOSAL_PASSED",
    isLeader: true,
    primaryAdvisorName: "ປອ. ບຸນມີ ໄຊຍະວົງ",
    createdAt: "2024-09-01",
  },
  {
    id: "std_04",
    profileId: "p_std_04",
    studentCode: "FS-IT-2022-016",
    name: "ນາງ ວິໄລພອນ ຄຳພູວົງ",
    email: "vilaiphone.k@student.nuol.edu.la",
    department: "ເຕັກໂນໂລຊີຂໍ້ມູນຂ່າວສານ",
    faculty: "ຄະນະວິສະວະກຳສາດ",
    thesisId: "th_02",
    thesisTopicTH: "ລະບົບກວດສອບໃບໜ້າເຂົ້າຫ້ອງຮຽນດ້ວຍ AI",
    thesisTopicEN: "AI-based Facial Recognition Attendance System",
    thesisStatus: "PROPOSAL_PASSED",
    isLeader: false,
    primaryAdvisorName: "ປອ. ບຸນມີ ໄຊຍະວົງ",
    createdAt: "2024-09-01",
  },
  {
    id: "std_05",
    profileId: "p_std_05",
    studentCode: "FS-SE-2022-033",
    name: "ທ້າວ ອານຸສອນ ພົມມະຈັນ",
    email: "anousone.p@student.nuol.edu.la",
    department: "ວິສະວະກຳຊອບແວ",
    faculty: "ຄະນະວິສະວະກຳສາດ",
    thesisId: "th_03",
    thesisTopicTH: "ແອັບພລິເຄຊັນຊອກຫາສະຖານີສາກລົດໄຟຟ້າໃນນະຄອນຫຼວງວຽງຈັນ",
    thesisTopicEN: "EV Charging Station Finder Mobile App in Vientiane",
    thesisStatus: "TOPIC_APPROVED",
    isLeader: true,
    primaryAdvisorName: "ອຈ. ດາວອນ ລັດສະໝີ",
    createdAt: "2024-09-05",
  },
  {
    id: "std_06",
    profileId: "p_std_06",
    studentCode: "FS-CS-2022-045",
    name: "ທ້າວ ກິດຕິສັກ ສຸວັນນະສີ",
    email: "kittisak.s@student.nuol.edu.la",
    department: "ວິສະວະກຳຄອມພິວເຕີ",
    faculty: "ຄະນະວິສະວະກຳສາດ",
    createdAt: "2024-09-10",
  },
];

const initialTeachers: Teacher[] = [
  {
    id: "tch_01",
    profileId: "p_tch_01",
    academicTitle: "ຮສ. ດຣ.",
    name: "ສົມຊາຍ ປະເສີດ",
    email: "somchai.p@nuol.edu.la",
    department: "ພາກວິຊາວິສະວະກຳຄອມພິວເຕີ",
    faculty: "ຄະນະວິສະວະກຳສາດ",
    advisingCount: 4,
    maxAdvisingQuota: 5,
    committeeCount: 6,
    roles: ["ADVISOR", "COMMITTEE"],
    advisingTheses: [
      {
        thesisId: "th_01",
        topicTH: "ລະບົບບໍລິຫານຈັດການບົດໂຄງການຈົບຊັ້ນ ແລະ ການເງິນອັດຕະໂນມັດ",
        topicEN: "Automated Bachelor Thesis and Financial Management System",
        status: "IN_PROGRESS",
        academicYear: 2026,
        semester: 1,
        isPrimary: true,
        studentLeader: "ທ້າວ ສົມພອນ ແກ້ວມະນີ",
      },
      {
        thesisId: "th_04",
        topicTH: "ລະບົບວິນິດໄສພະຍາດໃບເຂົ້າດ້ວຍ Convolutional Neural Networks",
        topicEN: "Rice Leaf Disease Classification Using CNN",
        status: "DEVELOPMENT",
        academicYear: 2026,
        semester: 1,
        isPrimary: true,
        studentLeader: "ນາງ ຈັນທະສອນ ວົງສາ",
      },
      {
        thesisId: "th_05",
        topicTH: "ການພັດທະນາ Smart IoT Gateway ສຳລັບຟາມອັດສະລິຍະ",
        topicEN: "Smart IoT Gateway Development for Precision Agriculture",
        status: "PROPOSAL_PASSED",
        academicYear: 2026,
        semester: 1,
        isPrimary: true,
        studentLeader: "ທ້າວ ພຸດທະວົງ ຄຳມະນີ",
      },
      {
        thesisId: "th_06",
        topicTH: "ລະບົບຄຸ້ມຄອງເອກະສານເອເລັກໂຕຣນິກມະຫາວິທະຍາໄລແຫ່ງຊາດ",
        topicEN: "Electronic Document Management System for NUOL",
        status: "TOPIC_APPROVED",
        academicYear: 2026,
        semester: 1,
        isPrimary: false,
        studentLeader: "ທ້າວ ພອນໄຊ ສີພະຈັນ",
      },
    ],
    committeeExams: [
      {
        examId: "ex_01",
        examTypeCode: "PROPOSAL",
        scheduledDate: "2026-10-25",
        startTime: "09:00",
        endTime: "10:30",
        examStatus: "SCHEDULED",
        committeeRole: "CHAIRMAN",
        topicTH: "ລະບົບກວດສອບໃບໜ້າເຂົ້າຫ້ອງຮຽນດ້ວຍ AI",
        topicEN: "AI-based Facial Recognition Attendance System",
        roomName: "ຫ້ອງສອບເສັງ 402 (ຕຶກ FE)",
      },
      {
        examId: "ex_02",
        examTypeCode: "PROPOSAL",
        scheduledDate: "2026-10-25",
        startTime: "10:45",
        endTime: "12:15",
        examStatus: "SCHEDULED",
        committeeRole: "COMMITTEE",
        topicTH: "ແອັບພລິເຄຊັນຊອກຫາສະຖານີສາກລົດໄຟຟ້າໃນນະຄອນຫຼວງວຽງຈັນ",
        topicEN: "EV Charging Station Finder Mobile App in Vientiane",
        roomName: "ຫ້ອງສອບເສັງ 402 (ຕຶກ FE)",
      },
      {
        examId: "ex_03",
        examTypeCode: "FINAL",
        scheduledDate: "2026-11-02",
        startTime: "13:30",
        endTime: "15:00",
        examStatus: "SCHEDULED",
        committeeRole: "CHAIRMAN",
        topicTH: "ລະບົບຄວາມປອດໄພເຄືອຂ່າຍດ້ວຍ Snort IDS",
        topicEN: "Network Intrusion Detection System Using Snort",
        roomName: "ຫ້ອງປະຊຸມໃຫຍ່ FE",
      },
    ],
    createdAt: "2024-08-15",
  },
  {
    id: "tch_02",
    profileId: "p_tch_02",
    academicTitle: "ປອ.",
    name: "ບຸນມີ ໄຊຍະວົງ",
    email: "bounmy.x@nuol.edu.la",
    department: "ພາກວິຊາເຕັກໂນໂລຊີຂໍ້ມູນຂ່າວສານ",
    faculty: "ຄະນະວິສະວະກຳສາດ",
    advisingCount: 3,
    maxAdvisingQuota: 5,
    committeeCount: 5,
    roles: ["ADVISOR", "COMMITTEE"],
    advisingTheses: [
      {
        thesisId: "th_02",
        topicTH: "ລະບົບກວດສອບໃບໜ້າເຂົ້າຫ້ອງຮຽນດ້ວຍ AI",
        topicEN: "AI-based Facial Recognition Attendance System",
        status: "PROPOSAL_PASSED",
        academicYear: 2026,
        semester: 1,
        isPrimary: true,
        studentLeader: "ທ້າວ ບຸນທະວີ ສີສຸລາດ",
      },
      {
        thesisId: "th_07",
        topicTH: "ລະບົບ Chatbot ໃຫ້ຄຳປຶກສາຫຼັກສູດການສຶກສາດ້ວຍ LLM",
        topicEN: "Academic Curriculum Advisor Chatbot using LLM",
        status: "IN_PROGRESS",
        academicYear: 2026,
        semester: 1,
        isPrimary: true,
        studentLeader: "ທ້າວ ສຸລິຍາ ມະນີວົງ",
      },
      {
        thesisId: "th_08",
        topicTH: "ການວິເຄາະຄວາມຮູ້ສຶກຈາກຄຳຕິຊົມນັກສຶກສາພາສາລາວ",
        topicEN: "Sentiment Analysis of Lao Student Course Feedbacks",
        status: "DEVELOPMENT",
        academicYear: 2026,
        semester: 1,
        isPrimary: true,
        studentLeader: "ນາງ ດາວວີ ຄຳສິງ",
      },
    ],
    committeeExams: [
      {
        examId: "ex_04",
        examTypeCode: "PROPOSAL",
        scheduledDate: "2026-10-25",
        startTime: "09:00",
        endTime: "10:30",
        examStatus: "SCHEDULED",
        committeeRole: "COMMITTEE",
        topicTH: "ລະບົບບໍລິຫານຈັດການບົດໂຄງການຈົບຊັ້ນ ແລະ ການເງິນອັດຕະໂນມັດ",
        topicEN: "Automated Bachelor Thesis and Financial Management System",
        roomName: "ຫ້ອງສອບເສັງ 401 (ຕຶກ FE)",
      },
      {
        examId: "ex_05",
        examTypeCode: "PROPOSAL",
        scheduledDate: "2026-10-26",
        startTime: "14:00",
        endTime: "15:30",
        examStatus: "SCHEDULED",
        committeeRole: "SECRETARY",
        topicTH: "ລະບົບ E-commerce ຂາຍສິນຄ້າຫັດຖະກຳລາວ",
        topicEN: "Lao Handicraft E-commerce Platform",
        roomName: "ຫ້ອງສອບເສັງ 403 (ຕຶກ FE)",
      },
    ],
    createdAt: "2024-08-15",
  },
  {
    id: "tch_03",
    profileId: "p_tch_03",
    academicTitle: "ອຈ.",
    name: "ດາວອນ ລັດສະໝີ",
    email: "davone.l@nuol.edu.la",
    department: "ພາກວິຊາວິສະວະກຳຊອບແວ",
    faculty: "ຄະນະວິສະວະກຳສາດ",
    advisingCount: 2,
    maxAdvisingQuota: 5,
    committeeCount: 3,
    roles: ["ADVISOR"],
    advisingTheses: [
      {
        thesisId: "th_03",
        topicTH: "ແອັບພລິເຄຊັນຊອກຫາສະຖານີສາກລົດໄຟຟ້າໃນນະຄອນຫຼວງວຽງຈັນ",
        topicEN: "EV Charging Station Finder Mobile App in Vientiane",
        status: "TOPIC_APPROVED",
        academicYear: 2026,
        semester: 1,
        isPrimary: true,
        studentLeader: "ທ້າວ ອານຸສອນ ພົມມະຈັນ",
      },
      {
        thesisId: "th_09",
        topicTH: "ລະບົບຈອງປີ້ລົດເມສາທາລະນະນະຄອນຫຼວງວຽງຈັນຜ່ານ QR",
        topicEN: "Vientiane Public Bus Ticketing Mobile App via QR",
        status: "PROPOSED",
        academicYear: 2026,
        semester: 1,
        isPrimary: true,
        studentLeader: "ນາງ ຈິນດາ ອິນທະວົງ",
      },
    ],
    committeeExams: [
      {
        examId: "ex_06",
        examTypeCode: "PROPOSAL",
        scheduledDate: "2026-10-27",
        startTime: "09:00",
        endTime: "10:30",
        examStatus: "SCHEDULED",
        committeeRole: "SECRETARY",
        topicTH: "ລະບົບຈັດການຄັງສິນຄ້າດ້ວຍບາໂຄດ",
        topicEN: "Barcode Warehouse Management System",
        roomName: "ຫ້ອງສອບເສັງ 401 (ຕຶກ FE)",
      },
    ],
    createdAt: "2024-08-20",
  },
  {
    id: "tch_04",
    profileId: "p_tch_04",
    academicTitle: "ຮສ. ປອ.",
    name: "ຄຳຫຼ້າ ແກ້ວພິລາ",
    email: "khamla.k@nuol.edu.la",
    department: "ພາກວິຊາວິສະວະກຳຄອມພິວເຕີ",
    faculty: "ຄະນະວິສະວະກຳສາດ",
    advisingCount: 5,
    maxAdvisingQuota: 5,
    committeeCount: 7,
    roles: ["ADVISOR", "COMMITTEE"],
    advisingTheses: [],
    committeeExams: [
      {
        examId: "ex_07",
        examTypeCode: "PROPOSAL",
        scheduledDate: "2026-10-25",
        startTime: "09:00",
        endTime: "10:30",
        examStatus: "SCHEDULED",
        committeeRole: "CHAIRMAN",
        topicTH: "ລະບົບບໍລິຫານຈັດການບົດໂຄງການຈົບຊັ້ນ ແລະ ການເງິນອັດຕະໂນມັດ",
        topicEN: "Automated Bachelor Thesis and Financial Management System",
        roomName: "ຫ້ອງສອບເສັງ 401 (ຕຶກ FE)",
      },
    ],
    createdAt: "2024-08-10",
  },
  {
    id: "tch_05",
    profileId: "p_tch_05",
    academicTitle: "ອຈ. ປທ.",
    name: "ສົມສະໜຸກ ວົງວິຈິດ",
    email: "somsanouk.v@nuol.edu.la",
    department: "ພາກວິຊາເຕັກໂນໂລຊີຂໍ້ມູນຂ່າວສານ",
    faculty: "ຄະນະວິສະວະກຳສາດ",
    advisingCount: 0,
    maxAdvisingQuota: 5,
    committeeCount: 4,
    roles: ["COMMITTEE"],
    advisingTheses: [],
    committeeExams: [],
    createdAt: "2024-08-22",
  },
];

const mockUsersLao: UserAccount[] = [
  {
    id: "usr_01",
    name: "ຮສ. ດຣ. ສົມຊາຍ ປະເສີດ",
    email: "somchai.p@nuol.edu.la",
    studentIdOrDept: "ພາກວິຊາວິສະວະກຳຄອມພິວເຕີ",
    roles: [
      { code: "STAFF", name: "ວິຊາການ", variant: "sky" },
      { code: "ADVISOR", name: "ທີ່ປຶກສາ", variant: "amber" },
      { code: "COMMITTEE", name: "ກຳມະການ", variant: "violet" },
    ],
    status: "ACTIVE",
    statusLao: "ໃຊ້ງານປົກກະຕິ",
    lastLogin: "ມື້ນີ້, 10:14",
  },
  {
    id: "usr_02",
    name: "ທ້າວ ສົມພອນ ແກ້ວມະນີ",
    email: "somphone.k@student.nuol.edu.la",
    studentIdOrDept: "ລະຫັດນັກສຶກສາ: FS-CS-2022-001",
    roles: [{ code: "STUDENT", name: "ນັກສຶກສາ", variant: "slate" }],
    status: "ACTIVE",
    statusLao: "ໃຊ້ງານປົກກະຕິ",
    lastLogin: "ມື້ວານນີ້, 18:40",
  },
  {
    id: "usr_03",
    name: "ນັດຖະພົງ ວັດທະນາ",
    email: "nattapong.w@finance.nuol.edu.la",
    studentIdOrDept: "ພະແນກການເງິນ ແລະ ຊັບສິນ",
    roles: [{ code: "FINANCE", name: "ພະນັກງານການເງິນ", variant: "emerald" }],
    status: "ACTIVE",
    statusLao: "ໃຊ້ງານປົກກະຕິ",
    lastLogin: "ມື້ນີ້, 08:30",
  },
  {
    id: "usr_04",
    name: "ສຸພາພອນ ບຸນມີ",
    email: "supaporn.b@press.nuol.edu.la",
    studentIdOrDept: "ໂຮງພິມມະຫາວິທະຍາໄລ",
    roles: [{ code: "PRINTING", name: "ພະນັກງານໂຮງພິມ", variant: "sky" }],
    status: "ACTIVE",
    statusLao: "ໃຊ້ງານປົກກະຕິ",
    lastLogin: "28 ກ.ຍ., 15:20",
  },
  {
    id: "usr_05",
    name: "ຜູ້ດູແລລະບົບຫຼັກ (Admin)",
    email: "admin@nuol.edu.la",
    studentIdOrDept: "ສູນໄອທີ ແລະ ໂຄງລ່າງພື້ນຖານ",
    roles: [{ code: "ADMIN", name: "ຜູ້ດູແລລະບົບ", variant: "rose" }],
    status: "ACTIVE",
    statusLao: "ໃຊ້ງານປົກກະຕິ",
    lastLogin: "ມື້ນີ້, 12:00",
  },
];

const allRoleOptionsLao = [
  { code: "ADMIN", name: "ຜູ້ດູແລລະບົບ (Admin)", description: "ຄຸ້ມຄອງລະບົບເຕັມຮູບແບບ ແລະ ຈັດການຖານຂໍ້ມູນ" },
  { code: "STAFF", name: "ພະນັກງານວິຊາການ (Staff)", description: "ຈັດຕາຕະລາງສອບເສັງ ແລະ ແຕ່ງຕັ້ງຄະນະກຳມະການ" },
  { code: "ADVISOR", name: "ອາຈານທີ່ປຶກສາ (Advisor)", description: "ກວດສອບ ແລະ ອະນຸມັດຫົວຂໍ້ບົດໂຄງການຂອງນັກສຶກສາ" },
  { code: "COMMITTEE", name: "ຄະນະກຳມະການສອບ (Committee)", description: "ຕັດເກຣດ ແລະ ໃຫ້ຄະແນນການສອບປ້ອງກັນບົດ" },
  { code: "FINANCE", name: "ພະນັກງານການເງິນ (Finance)", description: "ກວດສອບສະລິບຄ່າທຳນຽມ ແລະ ຈ່າຍເງິນຕອບແທນອາຈານ" },
  { code: "PRINTING", name: "ພະນັກງານໂຮງພິມ (Printing)", description: "ຄຸ້ມຄອງຄິວພິມ ແລະ ການເຂົ້າຮູບເຫຼັ້ມປົກແຂງ" },
  { code: "STUDENT", name: "ນັກສຶກສາ (Student)", description: "ສ້າງກຸ່ມ, ສະເໜີບົດ ແລະ ອັບໂຫຼດສະລິບໂອນເງິນ" },
];

export default function UserManagementPage() {
  const [activeTab, setActiveTab] = useState<"students" | "teachers" | "advisers" | "committees" | "rbac">("students");

  // Students state
  const [students, setStudents] = useState<Student[]>(initialStudents);
  const [studentSearch, setStudentSearch] = useState("");
  const [studentDeptFilter, setStudentDeptFilter] = useState("ALL");
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [newStudentForm, setNewStudentForm] = useState({
    studentCode: "",
    name: "",
    email: "",
    department: "ວິສະວະກຳຄອມພິວເຕີ",
    faculty: "ຄະນະວິສະວະກຳສາດ",
  });

  // Teachers state
  const [teachers, setTeachers] = useState<Teacher[]>(initialTeachers);
  const [teacherSearch, setTeacherSearch] = useState("");
  const [teacherDeptFilter, setTeacherDeptFilter] = useState("ALL");
  const [teacherRoleFilter, setTeacherRoleFilter] = useState<"ALL" | "ADVISOR" | "COMMITTEE">("ALL");
  const [viewingPortfolioTeacher, setViewingPortfolioTeacher] = useState<Teacher | null>(null);
  const [viewingCommitteesTeacher, setViewingCommitteesTeacher] = useState<Teacher | null>(null);
  const [showAddTeacherModal, setShowAddTeacherModal] = useState(false);
  const [newTeacherForm, setNewTeacherForm] = useState({
    academicTitle: "ອຈ.",
    name: "",
    email: "",
    department: "ພາກວິຊາວິສະວະກຳຄອມພິວເຕີ",
    faculty: "ຄະນະວິສະວະກຳສາດ",
    roles: ["ADVISOR", "COMMITTEE"],
  });

  // RBAC State
  const [users, setUsers] = useState<UserAccount[]>(mockUsersLao);
  const [rbacSearch, setRbacSearch] = useState("");
  const [rbacRoleFilter, setRbacRoleFilter] = useState("ALL");
  const [selectedRbacUser, setSelectedRbacUser] = useState<UserAccount | null>(null);
  const [saveNotice, setSaveNotice] = useState(false);

  // Filtered Students
  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      s.studentCode.toLowerCase().includes(studentSearch.toLowerCase()) ||
      s.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
      s.department.toLowerCase().includes(studentSearch.toLowerCase()) ||
      (s.thesisTopicTH && s.thesisTopicTH.toLowerCase().includes(studentSearch.toLowerCase()));
    const matchesDept = studentDeptFilter === "ALL" || s.department === studentDeptFilter;
    return matchesSearch && matchesDept;
  });

  // Filtered Teachers
  const filteredTeachers = teachers.filter((t) => {
    const matchesSearch =
      t.name.toLowerCase().includes(teacherSearch.toLowerCase()) ||
      t.academicTitle.toLowerCase().includes(teacherSearch.toLowerCase()) ||
      t.department.toLowerCase().includes(teacherSearch.toLowerCase());
    const matchesDept = teacherDeptFilter === "ALL" || t.department === teacherDeptFilter;
    const matchesRole =
      teacherRoleFilter === "ALL" ||
      (teacherRoleFilter === "ADVISOR" && t.roles.includes("ADVISOR")) ||
      (teacherRoleFilter === "COMMITTEE" && t.roles.includes("COMMITTEE"));
    return matchesSearch && matchesDept && matchesRole;
  });

  // Filtered RBAC
  const filteredRbacUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(rbacSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(rbacSearch.toLowerCase()) ||
      u.studentIdOrDept.toLowerCase().includes(rbacSearch.toLowerCase());
    const matchesRole = rbacRoleFilter === "ALL" || u.roles.some((r) => r.code === rbacRoleFilter);
    return matchesSearch && matchesRole;
  });

  // Handlers
  const handleAddStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentForm.studentCode || !newStudentForm.name) return;
    const created: Student = {
      id: `std_${Date.now()}`,
      profileId: `p_${Date.now()}`,
      studentCode: newStudentForm.studentCode,
      name: newStudentForm.name,
      email: newStudentForm.email || `${newStudentForm.studentCode.toLowerCase()}@student.nuol.edu.la`,
      department: newStudentForm.department,
      faculty: newStudentForm.faculty,
      createdAt: new Date().toISOString().split("T")[0],
    };
    setStudents([created, ...students]);
    setShowAddStudentModal(false);
    setNewStudentForm({
      studentCode: "",
      name: "",
      email: "",
      department: "ວິສະວະກຳຄອມພິວເຕີ",
      faculty: "ຄະນະວິສະວະກຳສາດ",
    });
  };

  const handleAddTeacher = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeacherForm.name) return;
    const created: Teacher = {
      id: `tch_${Date.now()}`,
      profileId: `p_${Date.now()}`,
      academicTitle: newTeacherForm.academicTitle,
      name: newTeacherForm.name,
      email: newTeacherForm.email || `teacher_${Date.now()}@nuol.edu.la`,
      department: newTeacherForm.department,
      faculty: newTeacherForm.faculty,
      advisingCount: 0,
      maxAdvisingQuota: 5,
      committeeCount: 0,
      roles: newTeacherForm.roles,
      advisingTheses: [],
      committeeExams: [],
      createdAt: new Date().toISOString().split("T")[0],
    };
    setTeachers([created, ...teachers]);
    setShowAddTeacherModal(false);
    setNewTeacherForm({
      academicTitle: "ອຈ.",
      name: "",
      email: "",
      department: "ພາກວິຊາວິສະວະກຳຄອມພິວເຕີ",
      faculty: "ຄະນະວິສະວະກຳສາດ",
      roles: ["ADVISOR", "COMMITTEE"],
    });
  };

  const toggleRbacRole = (roleCode: string) => {
    if (!selectedRbacUser) return;
    const exists = selectedRbacUser.roles.some((r) => r.code === roleCode);
    let updatedRoles: { code: string; name: string; variant: BadgeVariant }[] = [];
    if (exists) {
      updatedRoles = selectedRbacUser.roles.filter((r) => r.code !== roleCode);
    } else {
      const option = allRoleOptionsLao.find((o) => o.code === roleCode);
      if (option) {
        updatedRoles = [
          ...selectedRbacUser.roles,
          { code: option.code, name: option.name.split(" ")[0], variant: "sky" as BadgeVariant },
        ];
      }
    }
    const updatedUser = { ...selectedRbacUser, roles: updatedRoles };
    setSelectedRbacUser(updatedUser);
    setUsers((prev) => prev.map((u) => (u.id === updatedUser.id ? updatedUser : u)));
    setSaveNotice(true);
    setTimeout(() => setSaveNotice(false), 2000);
  };

  return (
    <AppShell>
      <div className="space-y-6 font-sans">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-6">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500 text-white shadow-sm">
                <GraduationCap className="h-6 w-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-950">
                    ຄຸ້ມຄອງນັກສຶກສາ ແລະ ຄູອາຈານ (Academic Governance)
                  </h1>
                  <Badge variant="sky">Staff &amp; Head Control</Badge>
                </div>
                <p className="mt-1 text-sm text-slate-500">
                  ຈັດການລາຍຊື່ນັກສຶກສາ, ຄຸ້ມຄອງພາລະງານອາຈານທີ່ປຶກສາ (Advisers), ການແຕ່ງຕັ້ງຄະນະກຳມະການສອບ (Committees) ແລະ ສິດທິລະບົບ.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {activeTab === "students" && (
              <Button
                onClick={() => setShowAddStudentModal(true)}
                leftIcon={<UserPlus className="h-4 w-4" />}
              >
                ເພີ່ມນັກສຶກສາໃໝ່
              </Button>
            )}
            {(activeTab === "teachers" || activeTab === "advisers" || activeTab === "committees") && (
              <Button
                onClick={() => setShowAddTeacherModal(true)}
                leftIcon={<UserPlus className="h-4 w-4" />}
              >
                ເພີ່ມອາຈານໃໝ່
              </Button>
            )}
          </div>
        </div>

        {/* 4 Navigation Tabs */}
        <div className="flex items-center border-b border-slate-200 gap-1 overflow-x-auto pb-px">
          <button
            onClick={() => setActiveTab("students")}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold transition-colors border-b-2 whitespace-nowrap ${
              activeTab === "students"
                ? "border-sky-500 text-sky-600 bg-white"
                : "border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100/60"
            }`}
          >
            <GraduationCap className="h-4 w-4" />
            <span>ຈັດການນັກສຶກສາ (Students)</span>
            <span className="ml-1 text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
              {students.length}
            </span>
          </button>

          <button
            onClick={() => {
              setActiveTab("advisers");
              setTeacherRoleFilter("ADVISOR");
            }}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold transition-colors border-b-2 whitespace-nowrap ${
              activeTab === "advisers"
                ? "border-amber-500 text-amber-600 bg-white"
                : "border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100/60"
            }`}
          >
            <Briefcase className="h-4 w-4" />
            <span>ອາຈານທີ່ປຶກສາ (Advisers &amp; Quota)</span>
            <span className="ml-1 text-xs px-2 py-0.5 rounded-full bg-amber-50 text-amber-700">
              {teachers.filter((t) => t.roles.includes("ADVISOR")).length}
            </span>
          </button>

          <button
            onClick={() => {
              setActiveTab("committees");
              setTeacherRoleFilter("COMMITTEE");
            }}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold transition-colors border-b-2 whitespace-nowrap ${
              activeTab === "committees"
                ? "border-sky-600 text-sky-700 bg-white"
                : "border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100/60"
            }`}
          >
            <Award className="h-4 w-4" />
            <span>ຄະນະກຳມະການສອບ (Committees)</span>
            <span className="ml-1 text-xs px-2 py-0.5 rounded-full bg-sky-50 text-sky-700">
              {teachers.filter((t) => t.roles.includes("COMMITTEE")).length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("rbac")}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold transition-colors border-b-2 whitespace-nowrap ${
              activeTab === "rbac"
                ? "border-rose-500 text-rose-600 bg-white"
                : "border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100/60"
            }`}
          >
            <ShieldCheck className="h-4 w-4" />
            <span>ບັນຊີ &amp; ສິດທິລະບົບ (RBAC Governance)</span>
          </button>
        </div>

        {/* =========================================================================
            TAB 1: STUDENTS MANAGEMENT
        ========================================================================= */}
        {activeTab === "students" && (
          <div className="space-y-6">
            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                title="ນັກສຶກສາທັງໝົດ"
                value={`${students.length} ຄົນ`}
                change="ສົກຮຽນ 2026"
                trend="neutral"
                description="ລົງທະບຽນໃນລະບົບ"
                icon={<GraduationCap className="h-5 w-5" />}
              />
              <StatCard
                title="ມີຫົວຂໍ້ບົດແລ້ວ"
                value={`${students.filter((s) => s.thesisId).length} ຄົນ`}
                change={`${Math.round((students.filter((s) => s.thesisId).length / students.length) * 100)}%`}
                trend="up"
                description="ສັງກັດກຸ່ມບົດໂຄງການ"
                icon={<BookOpen className="h-5 w-5" />}
              />
              <StatCard
                title="ຍັງບໍ່ມີຫົວຂໍ້ບົດ"
                value={`${students.filter((s) => !s.thesisId).length} ຄົນ`}
                change="ລໍຖ້າລົງທະບຽນ"
                trend="down"
                description="ຕ້ອງການຈັບກຸ່ມ"
                icon={<AlertCircle className="h-5 w-5" />}
              />
              <StatCard
                title="ຜ່ານການສອບຫົວຂໍ້"
                value={`${students.filter((s) => s.thesisStatus === "PROPOSAL_PASSED" || s.thesisStatus === "IN_PROGRESS").length} ຄົນ`}
                change="ກຳລັງດຳເນີນການ"
                trend="up"
                description="ເຂົ້າສູ່ຂັ້ນຕອນພັດທະນາ"
                icon={<CheckCircle className="h-5 w-5" />}
              />
            </div>

            {/* Filter & Search Bar */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 flex-1">
                <div className="flex items-center gap-2 flex-1 max-w-md bg-slate-50 px-3 py-2 rounded-lg border border-slate-200">
                  <Search className="h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="ຄົ້ນຫາຕາມລະຫັດ, ຊື່, ພາກວິຊາ ຫຼື ຫົວຂໍ້ບົດ..."
                    className="bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden w-full"
                    value={studentSearch}
                    onChange={(e) => setStudentSearch(e.target.value)}
                  />
                </div>
                <div className="w-full sm:w-64">
                  <SearchableSelect
                    options={studentSearchableOptions}
                    value={studentSearch}
                    onChange={(val, opt) => {
                      const s = opt?.metadata as StudentRecord | undefined;
                      if (s) {
                        setStudentSearch(s.name);
                      } else {
                        setStudentSearch(val);
                      }
                    }}
                    placeholder="ເລືອກນັກສຶກສາ..."
                    searchPlaceholder="ພິມລະຫັດ, ຊື່..."
                    allowCustom={true}
                    customPlaceholder="+ ຄົ້ນຫາ:"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 font-medium">ພາກວິຊາ:</span>
                <select
                  value={studentDeptFilter}
                  onChange={(e) => setStudentDeptFilter(e.target.value)}
                  className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-700 focus:outline-hidden"
                >
                  <option value="ALL">ທຸກພາກວິຊາ</option>
                  <option value="ວິສະວະກຳຄອມພິວເຕີ">ວິສະວະກຳຄອມພິວເຕີ</option>
                  <option value="ເຕັກໂນໂລຊີຂໍ້ມູນຂ່າວສານ">ເຕັກໂນໂລຊີຂໍ້ມູນຂ່າວສານ</option>
                  <option value="ວິສະວະກຳຊອບແວ">ວິສະວະກຳຊອບແວ</option>
                </select>
              </div>
            </div>

            {/* Student Table */}
            <Card>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-600 border-collapse">
                  <thead className="bg-slate-50/80 text-xs font-semibold uppercase text-slate-500 border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4">ລະຫັດນັກສຶກສາ</th>
                      <th className="py-3 px-4">ຊື່ ແລະ ນາມສະກຸນ</th>
                      <th className="py-3 px-4">ພາກວິຊາ</th>
                      <th className="py-3 px-4">ຫົວຂໍ້ບົດໂຄງການ</th>
                      <th className="py-3 px-4">ອາຈານທີ່ປຶກສາ</th>
                      <th className="py-3 px-4 text-center">ບົດບາດກຸ່ມ</th>
                      <th className="py-3 px-4 text-center">ສະຖານະ</th>
                      <th className="py-3 px-4 text-right">ຈັດການ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredStudents.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-12 text-center text-slate-400">
                          ບໍ່ພົບຂໍ້ມູນນັກສຶກສາທີ່ກົງກັບເງື່ອນໄຂ
                        </td>
                      </tr>
                    ) : (
                      filteredStudents.map((std) => (
                        <tr key={std.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="py-3 px-4 font-mono font-semibold text-slate-900 text-xs">
                            {std.studentCode}
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-medium text-slate-900">{std.name}</div>
                            <div className="text-xs text-slate-400">{std.email}</div>
                          </td>
                          <td className="py-3 px-4 text-xs text-slate-700">{std.department}</td>
                          <td className="py-3 px-4 max-w-xs">
                            {std.thesisTopicTH ? (
                              <div>
                                <div className="text-xs font-medium text-slate-900 line-clamp-1" title={std.thesisTopicTH}>
                                  {std.thesisTopicTH}
                                </div>
                                <div className="text-[11px] text-slate-400 line-clamp-1 italic">
                                  {std.thesisTopicEN}
                                </div>
                              </div>
                            ) : (
                              <span className="text-xs text-amber-600 italic font-medium">ຍັງບໍ່ມີຫົວຂໍ້ບົດ</span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-xs font-medium text-slate-800">
                            {std.primaryAdvisorName ? (
                              <span className="inline-flex items-center gap-1 text-slate-900">
                                <Briefcase className="h-3 w-3 text-amber-500" />
                                {std.primaryAdvisorName}
                              </span>
                            ) : (
                              <span className="text-slate-400 italic">-</span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-center">
                            {std.thesisId ? (
                              std.isLeader ? (
                                <Badge variant="sky">ຫົວໜ້າກຸ່ມ</Badge>
                              ) : (
                                <Badge variant="slate">ສະມາຊິກ</Badge>
                              )
                            ) : (
                              <span className="text-slate-300">-</span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-center">
                            {std.thesisStatus === "IN_PROGRESS" && <Badge variant="amber">ກຳລັງດຳເນີນການ</Badge>}
                            {std.thesisStatus === "PROPOSAL_PASSED" && <Badge variant="emerald">ຜ່ານການສອບຫົວຂໍ້</Badge>}
                            {std.thesisStatus === "TOPIC_APPROVED" && <Badge variant="violet">ອະນຸມັດຫົວຂໍ້ແລ້ວ</Badge>}
                            {!std.thesisStatus && <Badge variant="slate">ລໍຖ້າຈັບກຸ່ມ</Badge>}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <button
                              onClick={() => setSelectedStudent(std)}
                              className="text-xs font-medium text-sky-600 hover:text-sky-800 px-2 py-1 rounded-md hover:bg-sky-50"
                            >
                              ເບິ່ງລາຍລະອຽດ
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {/* =========================================================================
            TAB 2: ADVISERS MANAGEMENT & QUOTA
        ========================================================================= */}
        {activeTab === "advisers" && (
          <div className="space-y-6">
            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                title="ອາຈານທີ່ປຶກສາທັງໝົດ"
                value={`${teachers.filter((t) => t.roles.includes("ADVISOR")).length} ທ່ານ`}
                change="ສົກຮຽນ 2026"
                trend="neutral"
                description="ມີສິດຮັບພາລະງານທີ່ປຶກສາ"
                icon={<Briefcase className="h-5 w-5" />}
              />
              <StatCard
                title="ບົດທີ່ກຳລັງເບິ່ງແຍງ"
                value={`${teachers.reduce((acc, t) => acc + t.advisingCount, 0)} ບົດ`}
                change="ກຳລັງເຮັດບົດໂຄງການ"
                trend="up"
                description="ກຸ່ມນັກສຶກສາທັງໝົດ"
                icon={<BookOpen className="h-5 w-5" />}
              />
              <StatCard
                title="ໂຄຕ້າສະເລ່ຍ"
                value={`${(teachers.reduce((acc, t) => acc + t.advisingCount, 0) / Math.max(1, teachers.filter((t) => t.roles.includes("ADVISOR")).length)).toFixed(1)} / 5 ບົດ`}
                change="ໂຄຕ້າສູງສຸດ 5 ບົດ/ທ່ານ"
                trend="neutral"
                description="ເພື່ອຄຸນນະພາບການສິດສອນ"
                icon={<BarChart2 className="h-5 w-5" />}
              />
              <StatCard
                title="ອາຈານທີ່ເຕັມໂຄຕ້າ"
                value={`${teachers.filter((t) => t.advisingCount >= t.maxAdvisingQuota).length} ທ່ານ`}
                change="ເຕັມ 5/5 ບົດແລ້ວ"
                trend="down"
                description="ບໍ່ສາມາດຮັບກຸ່ມເພີ່ມໄດ້"
                icon={<AlertCircle className="h-5 w-5" />}
              />
            </div>

            {/* Filter */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 flex-1">
                <div className="flex items-center gap-2 flex-1 max-w-md bg-slate-50 px-3 py-2 rounded-lg border border-slate-200">
                  <Search className="h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="ຄົ້ນຫາຊື່ອາຈານທີ່ປຶກສາ, ຕຳແໜ່ງ, ພາກວິຊາ..."
                    className="bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden w-full"
                    value={teacherSearch}
                    onChange={(e) => setTeacherSearch(e.target.value)}
                  />
                </div>
                <div className="w-full sm:w-64">
                  <SearchableSelect
                    options={teacherSearchableOptions}
                    value={teacherSearch}
                    onChange={(val, opt) => {
                      const t = opt?.metadata as TeacherRecord | undefined;
                      if (t) {
                        setTeacherSearch(t.name);
                      } else {
                        setTeacherSearch(val);
                      }
                    }}
                    placeholder="ເລືອກອາຈານ..."
                    searchPlaceholder="ພິມຊື່ອາຈານ..."
                    allowCustom={true}
                    customPlaceholder="+ ຄົ້ນຫາ:"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 font-medium">ພາກວິຊາ:</span>
                <select
                  value={teacherDeptFilter}
                  onChange={(e) => setTeacherDeptFilter(e.target.value)}
                  className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-700 focus:outline-hidden"
                >
                  <option value="ALL">ທຸກພາກວິຊາ</option>
                  <option value="ພາກວິຊາວິສະວະກຳຄອມພິວເຕີ">ພາກວິຊາວິສະວະກຳຄອມພິວເຕີ</option>
                  <option value="ພາກວິຊາເຕັກໂນໂລຊີຂໍ້ມູນຂ່າວສານ">ພາກວິຊາເຕັກໂນໂລຊີຂໍ້ມູນຂ່າວສານ</option>
                  <option value="ພາກວິຊາວິສະວະກຳຊອບແວ">ພາກວິຊາວິສະວະກຳຊອບແວ</option>
                </select>
              </div>
            </div>

            {/* Advisers Table */}
            <Card>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-600 border-collapse">
                  <thead className="bg-slate-50/80 text-xs font-semibold uppercase text-slate-500 border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4">ຕຳແໜ່ງ &amp; ຊື່-ນາມສະກຸນ</th>
                      <th className="py-3 px-4">ພາກວິຊາ / ຄະນະ</th>
                      <th className="py-3 px-4">ພາລະງານທີ່ປຶກສາ (Quota)</th>
                      <th className="py-3 px-4 text-center">ສະຖານະໂຄຕ້າ</th>
                      <th className="py-3 px-4 text-center">ບົດທີ່ເບິ່ງແຍງຫຼັກ</th>
                      <th className="py-3 px-4 text-right">ລາຍການບົດໂຄງການ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredTeachers
                      .filter((t) => t.roles.includes("ADVISOR"))
                      .map((tch) => {
                        const percent = Math.min(100, Math.round((tch.advisingCount / tch.maxAdvisingQuota) * 100));
                        const isFull = tch.advisingCount >= tch.maxAdvisingQuota;
                        return (
                          <tr key={tch.id} className="hover:bg-slate-50/60 transition-colors">
                            <td className="py-3 px-4">
                              <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                                <span className="text-sky-700 font-medium">{tch.academicTitle}</span>
                                <span>{tch.name}</span>
                              </div>
                              <div className="text-xs text-slate-400">{tch.email}</div>
                            </td>
                            <td className="py-3 px-4">
                              <div className="text-xs text-slate-900 font-medium">{tch.department}</div>
                              <div className="text-[11px] text-slate-400">{tch.faculty}</div>
                            </td>
                            <td className="py-3 px-4">
                              <div className="w-48">
                                <div className="flex justify-between text-xs mb-1 font-medium">
                                  <span className="text-slate-700">{tch.advisingCount} / {tch.maxAdvisingQuota} ກຸ່ມ</span>
                                  <span className={isFull ? "text-rose-600 font-bold" : "text-slate-500"}>{percent}%</span>
                                </div>
                                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                                  <div
                                    className={`h-full rounded-full transition-all ${
                                      isFull ? "bg-rose-500" : percent >= 60 ? "bg-amber-500" : "bg-emerald-500"
                                    }`}
                                    style={{ width: `${percent}%` }}
                                  />
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-center">
                              {isFull ? (
                                <Badge variant="rose">ເຕັມໂຄຕ້າ (Full)</Badge>
                              ) : tch.advisingCount === 0 ? (
                                <Badge variant="emerald">ຫວ່າງ (Available)</Badge>
                              ) : (
                                <Badge variant="amber">ຮັບໄດ້ອີກ {tch.maxAdvisingQuota - tch.advisingCount} ກຸ່ມ</Badge>
                              )}
                            </td>
                            <td className="py-3 px-4 text-center">
                              <span className="font-semibold text-slate-900">
                                {tch.advisingTheses.filter((at) => at.isPrimary).length} ບົດ
                              </span>
                            </td>
                            <td className="py-3 px-4 text-right">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setViewingPortfolioTeacher(tch)}
                                leftIcon={<FolderOpen className="h-3.5 w-3.5 text-amber-600" />}
                              >
                                ເບິ່ງ Portfolio ({tch.advisingTheses.length})
                              </Button>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {/* =========================================================================
            TAB 3: COMMITTEES MANAGEMENT & EXAM SCHEDULES
        ========================================================================= */}
        {activeTab === "committees" && (
          <div className="space-y-6">
            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                title="ກຳມະການສອບທັງໝົດ"
                value={`${teachers.filter((t) => t.roles.includes("COMMITTEE")).length} ທ່ານ`}
                change="ສົກຮຽນ 2026"
                trend="neutral"
                description="ມີສິດປະເມີນ ແລະ ຕັດເກຣດ"
                icon={<Award className="h-5 w-5" />}
              />
              <StatCard
                title="ຮອບການສອບທີ່ຖືກແຕ່ງຕັ້ງ"
                value={`${teachers.reduce((acc, t) => acc + t.committeeCount, 0)} ຄັ້ງ`}
                change="ຮອບສອບ Proposal & Final"
                trend="up"
                description="ມີສິດຮັບເງິນຕອບແທນ"
                icon={<Calendar className="h-5 w-5" />}
              />
              <StatCard
                title="ບົດບາດປະທານສອບ"
                value={`${teachers.reduce((acc, t) => acc + t.committeeExams.filter((ce) => ce.committeeRole === "CHAIRMAN").length, 0)} ຄັ້ງ`}
                change="ຫົວໜ້າຄະນະກຳມະການ"
                trend="up"
                description="ອະນຸມັດຜົນຄະແນນລວມ"
                icon={<ShieldCheck className="h-5 w-5" />}
              />
              <StatCard
                title="ຄວາມພ້ອມດ້ານການເງິນ"
                value="100% ພ້ອມເບີກຈ່າຍ"
                change="ຕາມອັດຕາຄະນະກຳມະການ"
                trend="up"
                description="ບັນທຶກໄວ້ໃນລະບົບການເງິນ"
                icon={<CheckCircle className="h-5 w-5" />}
              />
            </div>

            {/* Filter */}
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 flex-1">
                <div className="flex items-center gap-2 flex-1 max-w-md bg-slate-50 px-3 py-2 rounded-lg border border-slate-200">
                  <Search className="h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="ຄົ້ນຫາຊື່ກຳມະການສອບເສັງ, ພາກວິຊາ..."
                    className="bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden w-full"
                    value={teacherSearch}
                    onChange={(e) => setTeacherSearch(e.target.value)}
                  />
                </div>
                <div className="w-full sm:w-64">
                  <SearchableSelect
                    options={teacherSearchableOptions}
                    value={teacherSearch}
                    onChange={(val, opt) => {
                      const t = opt?.metadata as TeacherRecord | undefined;
                      if (t) {
                        setTeacherSearch(t.name);
                      } else {
                        setTeacherSearch(val);
                      }
                    }}
                    placeholder="ເລືອກກຳມະການ..."
                    searchPlaceholder="ພິມຊື່ກຳມະການ..."
                    allowCustom={true}
                    customPlaceholder="+ ຄົ້ນຫາ:"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 font-medium">ພາກວິຊາ:</span>
                <select
                  value={teacherDeptFilter}
                  onChange={(e) => setTeacherDeptFilter(e.target.value)}
                  className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-700 focus:outline-hidden"
                >
                  <option value="ALL">ທຸກພາກວິຊາ</option>
                  <option value="ພາກວິຊາວິສະວະກຳຄອມພິວເຕີ">ພາກວິຊາວິສະວະກຳຄອມພິວເຕີ</option>
                  <option value="ພາກວິຊາເຕັກໂນໂລຊີຂໍ້ມູນຂ່າວສານ">ພາກວິຊາເຕັກໂນໂລຊີຂໍ້ມູນຂ່າວສານ</option>
                  <option value="ພາກວິຊາວິສະວະກຳຊອບແວ">ພາກວິຊາວິສະວະກຳຊອບແວ</option>
                </select>
              </div>
            </div>

            {/* Committee Table */}
            <Card>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-600 border-collapse">
                  <thead className="bg-slate-50/80 text-xs font-semibold uppercase text-slate-500 border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4">ຕຳແໜ່ງ &amp; ຊື່-ນາມສະກຸນ</th>
                      <th className="py-3 px-4">ພາກວິຊາ</th>
                      <th className="py-3 px-4 text-center">ຈຳນວນຮອບສອບທີ່ແຕ່ງຕັ້ງ</th>
                      <th className="py-3 px-4">ບົດບາດໃນກຳມະການ</th>
                      <th className="py-3 px-4 text-center">ການເງິນຕອບແທນ</th>
                      <th className="py-3 px-4 text-right">ຕາຕະລາງສອບເສັງ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredTeachers
                      .filter((t) => t.roles.includes("COMMITTEE"))
                      .map((tch) => {
                        const chairCount = tch.committeeExams.filter((ce) => ce.committeeRole === "CHAIRMAN").length;
                        const memCount = tch.committeeExams.filter((ce) => ce.committeeRole === "COMMITTEE").length;
                        const secCount = tch.committeeExams.filter((ce) => ce.committeeRole === "SECRETARY").length;

                        return (
                          <tr key={tch.id} className="hover:bg-slate-50/60 transition-colors">
                            <td className="py-3 px-4">
                              <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                                <span className="text-violet-700 font-medium">{tch.academicTitle}</span>
                                <span>{tch.name}</span>
                              </div>
                              <div className="text-xs text-slate-400">{tch.email}</div>
                            </td>
                            <td className="py-3 px-4 text-xs text-slate-700">{tch.department}</td>
                            <td className="py-3 px-4 text-center font-bold text-slate-900">
                              {tch.committeeCount} ຄັ້ງ
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                {chairCount > 0 && (
                                  <Badge variant="rose">ປະທານ ({chairCount})</Badge>
                                )}
                                {memCount > 0 && (
                                  <Badge variant="violet">ກຳມະການ ({memCount})</Badge>
                                )}
                                {secCount > 0 && (
                                  <Badge variant="sky">ເລຂາ ({secCount})</Badge>
                                )}
                                {chairCount === 0 && memCount === 0 && secCount === 0 && (
                                  <span className="text-xs text-slate-400 italic">ລໍຖ້າການແຕ່ງຕັ້ງ</span>
                                )}
                              </div>
                            </td>
                            <td className="py-3 px-4 text-center">
                              <Badge variant="emerald">ພ້ອມເບີກຈ່າຍ (Eligible)</Badge>
                            </td>
                            <td className="py-3 px-4 text-right">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setViewingCommitteesTeacher(tch)}
                                leftIcon={<Calendar className="h-3.5 w-3.5 text-violet-600" />}
                              >
                                ຕາຕະລາງສອບ ({tch.committeeExams.length})
                              </Button>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {/* =========================================================================
            TAB 4: RBAC GOVERNANCE (Existing System)
        ========================================================================= */}
        {activeTab === "rbac" && (
          <div className="space-y-6">
            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                title="ຈຳນວນບັນຊີທັງໝົດ"
                value="342 ບັນຊີ"
                change="12 ລໍຖ້າການເປີດໃຊ້"
                trend="neutral"
                description="ເຊື່ອມຕໍ່ຜ່ານ Supabase Auth"
                icon={<Users className="h-5 w-5" />}
              />
              <StatCard
                title="ອາຈານທີ່ປຶກສາ"
                value="48 ທ່ານ"
                change="ກຳລັງເບິ່ງແຍງບົດ"
                trend="up"
                description="ປະຈຳສົກຮຽນ 2026"
                icon={<ShieldCheck className="h-5 w-5" />}
              />
              <StatCard
                title="ຄະນະກຳມະການສອບເສັງ"
                value="64 ທ່ານ"
                change="ມີລາຍຊື່ແຕ່ງຕັ້ງ"
                trend="up"
                description="ມີສິດຮັບເງິນຕອບແທນ"
                icon={<Key className="h-5 w-5" />}
              />
              <StatCard
                title="ບັນທຶກຄວາມປອດໄພ"
                value="1,289 ລາຍການ"
                change="ບໍ່ພົບຄວາມຜິດປົກກະຕິ"
                trend="up"
                description="ບັນທຶກໄວ້ໃນ audit_logs"
                icon={<History className="h-5 w-5" />}
              />
            </div>

            {/* Filter */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
              <div className="flex items-center gap-2 flex-1 max-w-md bg-slate-50 px-3 py-2 rounded-lg border border-slate-200">
                <Search className="h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="ຄົ້ນຫາຕາມຊື່, ອີເມວ ຫຼື ລະຫັດ..."
                  className="bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden w-full"
                  value={rbacSearch}
                  onChange={(e) => setRbacSearch(e.target.value)}
                />
              </div>

              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-slate-400" />
                <select
                  value={rbacRoleFilter}
                  onChange={(e) => setRbacRoleFilter(e.target.value)}
                  className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-700 focus:outline-hidden"
                >
                  <option value="ALL">ທຸກບົດບາດ</option>
                  <option value="ADMIN">ADMIN</option>
                  <option value="STAFF">STAFF</option>
                  <option value="ADVISOR">ADVISOR</option>
                  <option value="COMMITTEE">COMMITTEE</option>
                  <option value="STUDENT">STUDENT</option>
                  <option value="FINANCE">FINANCE</option>
                  <option value="PRINTING">PRINTING</option>
                </select>
              </div>
            </div>

            {/* Users Table */}
            <Card>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-600 border-collapse">
                  <thead className="bg-slate-50/80 text-xs font-semibold uppercase text-slate-500 border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4">ຊື່ ແລະ ອີເມວ</th>
                      <th className="py-3 px-4">ພາກວິຊາ / ສັງກັດ</th>
                      <th className="py-3 px-4">ບົດບາດໃນລະບົບ (Roles)</th>
                      <th className="py-3 px-4 text-center">ສະຖານະບັນຊີ</th>
                      <th className="py-3 px-4 text-right">ຈັດການສິດທິ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredRbacUsers.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-semibold text-slate-900">{u.name}</div>
                          <div className="text-xs text-slate-400">{u.email}</div>
                        </td>
                        <td className="py-3 px-4 text-xs text-slate-700">{u.studentIdOrDept}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {u.roles.map((r) => (
                              <Badge key={r.code} variant={r.variant}>
                                {r.name}
                              </Badge>
                            ))}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Badge variant="emerald">{u.statusLao}</Badge>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedRbacUser(u)}
                            leftIcon={<Key className="h-3.5 w-3.5" />}
                          >
                            ແກ້ໄຂສິດທິ
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {/* =========================================================================
            MODAL: ADD STUDENT
        ========================================================================= */}
        {showAddStudentModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-xs p-4">
            <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/60">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-sky-50 text-sky-600">
                    <UserPlus className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">ເພີ່ມນັກສຶກສາໃໝ່ (Register Student)</h3>
                    <p className="text-xs text-slate-500">ປ້ອນຂໍ້ມູນນັກສຶກສາເພື່ອເຂົ້າສູ່ລະບົບບົດໂຄງການ</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAddStudentModal(false)}
                  className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleAddStudent} className="p-6 space-y-4">
                {/* Searchable Select from Directory */}
                <div className="bg-sky-50/60 p-3 rounded-xl border border-sky-100 space-y-1.5">
                  <label className="block text-xs font-bold text-sky-900">
                    ຄົ້ນຫາ ແລະ ເລືອກຈາກຖານຂໍ້ມູນນັກສຶກສາ (Searchable Dropdown)
                  </label>
                  <SearchableSelect
                    options={studentSearchableOptions}
                    value={newStudentForm.studentCode}
                    onChange={(val, opt) => {
                      const s = opt?.metadata as StudentRecord | undefined;
                      if (s) {
                        setNewStudentForm({
                          studentCode: s.studentId,
                          name: s.name,
                          email: `${s.studentId.toLowerCase()}@student.nuol.edu.la`,
                          department: s.department,
                          faculty: "ຄະນະວິສະວະກຳສາດ",
                        });
                      } else {
                        setNewStudentForm({ ...newStudentForm, name: val });
                      }
                    }}
                    placeholder="ຄົ້ນຫາ ແລະ ເລືອກນັກສຶກສາ..."
                    searchPlaceholder="ພິມລະຫັດ, ຊື່ ຫຼື ຫ້ອງຮຽນ..."
                    allowCustom={true}
                    customPlaceholder="+ ປ້ອນຊື່ໃໝ່:"
                  />
                  <p className="text-[10px] text-sky-600">
                    ເລືອກແລ້ວລະບົບຈະດຶງລະຫັດ, ຊື່, ແລະ ພາກວິຊາໃຫ້ອັດຕະໂນມັດ
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    ລະຫັດນັກສຶກສາ (Student Code) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. FS-CS-2022-099"
                    value={newStudentForm.studentCode}
                    onChange={(e) => setNewStudentForm({ ...newStudentForm, studentCode: e.target.value })}
                    className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:outline-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    ຊື່ ແລະ ນາມສະກຸນ (Full Name) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. ທ້າວ ສຸລິວັນ ມະນີຈັນ"
                    value={newStudentForm.name}
                    onChange={(e) => setNewStudentForm({ ...newStudentForm, name: e.target.value })}
                    className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:outline-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    ອີເມວ (Email)
                  </label>
                  <input
                    type="email"
                    placeholder="e.g. souliwan.m@student.nuol.edu.la"
                    value={newStudentForm.email}
                    onChange={(e) => setNewStudentForm({ ...newStudentForm, email: e.target.value })}
                    className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:outline-sky-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">ພາກວິຊາ</label>
                    <select
                      value={newStudentForm.department}
                      onChange={(e) => setNewStudentForm({ ...newStudentForm, department: e.target.value })}
                      className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:outline-sky-500"
                    >
                      <option value="ວິສະວະກຳຄອມພິວເຕີ">ວິສະວະກຳຄອມພິວເຕີ</option>
                      <option value="ເຕັກໂນໂລຊີຂໍ້ມູນຂ່າວສານ">ເຕັກໂນໂລຊີຂໍ້ມູນຂ່າວສານ</option>
                      <option value="ວິສະວະກຳຊອບແວ">ວິສະວະກຳຊອບແວ</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">ຄະນະ</label>
                    <input
                      type="text"
                      disabled
                      value={newStudentForm.faculty}
                      className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 bg-slate-50 text-slate-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                  <Button variant="outline" type="button" onClick={() => setShowAddStudentModal(false)}>
                    ຍົກເລີກ
                  </Button>
                  <Button type="submit">ບັນທຶກຂໍ້ມູນ</Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* =========================================================================
            MODAL: ADD TEACHER
        ========================================================================= */}
        {showAddTeacherModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-xs p-4">
            <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/60">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
                    <UserPlus className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">ເພີ່ມອາຈານໃໝ່ (Register Teacher)</h3>
                    <p className="text-xs text-slate-500">ກຳນົດສິດທິເປັນອາຈານທີ່ປຶກສາ ຫຼື ຄະນະກຳມະການ</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAddTeacherModal(false)}
                  className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleAddTeacher} className="p-6 space-y-4">
                {/* Searchable Select from Directory */}
                <div className="bg-amber-50/60 p-3 rounded-xl border border-amber-100 space-y-1.5">
                  <label className="block text-xs font-bold text-amber-900">
                    ຄົ້ນຫາ ແລະ ເລືອກຈາກຖານຂໍ້ມູນອາຈານ (Searchable Dropdown)
                  </label>
                  <SearchableSelect
                    options={teacherSearchableOptions}
                    value={newTeacherForm.name}
                    onChange={(val, opt) => {
                      const t = opt?.metadata as TeacherRecord | undefined;
                      if (t) {
                        setNewTeacherForm({
                          academicTitle: t.academicTitle,
                          name: t.name,
                          email: `${t.name.split(" ")[0].toLowerCase()}@nuol.edu.la`,
                          department: t.department,
                          faculty: "ຄະນະວິສະວະກຳສາດ",
                          roles: t.roles,
                        });
                      } else {
                        setNewTeacherForm({ ...newTeacherForm, name: val });
                      }
                    }}
                    placeholder="ຄົ້ນຫາ ແລະ ເລືອກອາຈານ..."
                    searchPlaceholder="ພິມຊື່ອາຈານ, ຕຳແໜ່ງ ຫຼື ພາກວິຊາ..."
                    allowCustom={true}
                    customPlaceholder="+ ປ້ອນຊື່ໃໝ່:"
                  />
                  <p className="text-[10px] text-amber-700">
                    ເລືອກແລ້ວລະບົບຈະດຶງຕຳແໜ່ງວິຊາການ, ພາກວິຊາ ແລະ ບົດບາດໃຫ້ອັດຕະໂນມັດ
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">ຕຳແໜ່ງວິຊາການ</label>
                    <select
                      value={newTeacherForm.academicTitle}
                      onChange={(e) => setNewTeacherForm({ ...newTeacherForm, academicTitle: e.target.value })}
                      className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:outline-sky-500"
                    >
                      <option value="ອຈ.">ອຈ.</option>
                      <option value="ອຈ. ປທ.">ອຈ. ປທ.</option>
                      <option value="ປອ.">ປອ.</option>
                      <option value="ຮສ. ປອ.">ຮສ. ປອ.</option>
                      <option value="ຮສ. ດຣ.">ຮສ. ດຣ.</option>
                      <option value="ສຈ. ດຣ.">ສຈ. ດຣ.</option>
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      ຊື່ ແລະ ນາມສະກຸນ *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. ວິໄຊ ໄຊຍະເສນ"
                      value={newTeacherForm.name}
                      onChange={(e) => setNewTeacherForm({ ...newTeacherForm, name: e.target.value })}
                      className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:outline-sky-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">ອີເມວວິຊາການ</label>
                  <input
                    type="email"
                    placeholder="e.g. vichai.x@nuol.edu.la"
                    value={newTeacherForm.email}
                    onChange={(e) => setNewTeacherForm({ ...newTeacherForm, email: e.target.value })}
                    className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:outline-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">ພາກວິຊາ</label>
                  <select
                    value={newTeacherForm.department}
                    onChange={(e) => setNewTeacherForm({ ...newTeacherForm, department: e.target.value })}
                    className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:outline-sky-500"
                  >
                    <option value="ພາກວິຊາວິສະວະກຳຄອມພິວເຕີ">ພາກວິຊາວິສະວະກຳຄອມພິວເຕີ</option>
                    <option value="ພາກວິຊາເຕັກໂນໂລຊີຂໍ້ມູນຂ່າວສານ">ພາກວິຊາເຕັກໂນໂລຊີຂໍ້ມູນຂ່າວສານ</option>
                    <option value="ພາກວິຊາວິສະວະກຳຊອບແວ">ພາກວິຊາວິສະວະກຳຊອບແວ</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-2">ບົດບາດໜ້າທີ່ໃນລະບົບ</label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newTeacherForm.roles.includes("ADVISOR")}
                        onChange={(e) => {
                          const updated = e.target.checked
                            ? [...newTeacherForm.roles, "ADVISOR"]
                            : newTeacherForm.roles.filter((r) => r !== "ADVISOR");
                          setNewTeacherForm({ ...newTeacherForm, roles: updated });
                        }}
                        className="rounded text-sky-600"
                      />
                      <span>ອາຈານທີ່ປຶກສາ (Advisor)</span>
                    </label>

                    <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newTeacherForm.roles.includes("COMMITTEE")}
                        onChange={(e) => {
                          const updated = e.target.checked
                            ? [...newTeacherForm.roles, "COMMITTEE"]
                            : newTeacherForm.roles.filter((r) => r !== "COMMITTEE");
                          setNewTeacherForm({ ...newTeacherForm, roles: updated });
                        }}
                        className="rounded text-violet-600"
                      />
                      <span>ຄະນະກຳມະການສອບ (Committee)</span>
                    </label>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                  <Button variant="outline" type="button" onClick={() => setShowAddTeacherModal(false)}>
                    ຍົກເລີກ
                  </Button>
                  <Button type="submit">ບັນທຶກຂໍ້ມູນ</Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* =========================================================================
            MODAL: VIEW ADVISING PORTFOLIO
        ========================================================================= */}
        {viewingPortfolioTeacher && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-xs p-4">
            <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/60">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
                    <FolderOpen className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">
                      Portfolio ບົດໂຄງການທີ່ປຶກສາ: {viewingPortfolioTeacher.academicTitle} {viewingPortfolioTeacher.name}
                    </h3>
                    <p className="text-xs text-slate-500">
                      {viewingPortfolioTeacher.department} &bull; ພາລະງານ: {viewingPortfolioTeacher.advisingTheses.length} / {viewingPortfolioTeacher.maxAdvisingQuota} ກຸ່ມ
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setViewingPortfolioTeacher(null)}
                  className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                {viewingPortfolioTeacher.advisingTheses.length === 0 ? (
                  <div className="py-8 text-center text-slate-400">
                    ຍັງບໍ່ມີບົດໂຄງການທີ່ສັງກັດການເບິ່ງແຍງໃນປັດຈຸບັນ
                  </div>
                ) : (
                  viewingPortfolioTeacher.advisingTheses.map((at, idx) => (
                    <div
                      key={at.thesisId}
                      className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-sky-100 text-sky-800">
                              ກຸ່ມທີ {idx + 1}
                            </span>
                            {at.isPrimary ? (
                              <Badge variant="amber">ທີ່ປຶກສາຫຼັກ (Primary)</Badge>
                            ) : (
                              <Badge variant="slate">ທີ່ປຶກສາຮ່ວມ (Co-Advisor)</Badge>
                            )}
                            <Badge variant="sky">ສົກຮຽນ {at.academicYear}</Badge>
                          </div>
                          <h4 className="font-bold text-slate-900 text-sm mt-2">{at.topicTH}</h4>
                          <p className="text-xs text-slate-500 italic mt-0.5">{at.topicEN}</p>
                          <div className="flex items-center gap-2 text-xs text-slate-600 mt-2 font-medium">
                            <span className="text-slate-400">ຫົວໜ້າກຸ່ມ:</span>
                            <span className="text-slate-900">{at.studentLeader}</span>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          {at.status === "IN_PROGRESS" && <Badge variant="amber">ກຳລັງດຳເນີນການ</Badge>}
                          {at.status === "DEVELOPMENT" && <Badge variant="violet">ກຳລັງພັດທະນາ</Badge>}
                          {at.status === "PROPOSAL_PASSED" && <Badge variant="emerald">ຜ່ານການສອບຫົວຂໍ້</Badge>}
                          {at.status === "TOPIC_APPROVED" && <Badge variant="sky">ອະນຸມັດຫົວຂໍ້ແລ້ວ</Badge>}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="flex justify-between items-center px-6 py-3 bg-slate-50 border-t border-slate-100">
                <span className="text-xs text-slate-500">
                  ສາມາດແຕ່ງຕັ້ງ ຫຼື ປ່ຽນແປງທີ່ປຶກສາໄດ້ຜ່ານເມນູ &quot;ຄຸ້ມຄອງບົດໂຄງການ&quot;
                </span>
                <Button variant="outline" size="sm" onClick={() => setViewingPortfolioTeacher(null)}>
                  ປິດໜ້າຕ່າງ
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            MODAL: VIEW COMMITTEE EXAM SCHEDULE
        ========================================================================= */}
        {viewingCommitteesTeacher && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-xs p-4">
            <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/60">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-violet-50 text-violet-600">
                    <Calendar className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">
                      ຕາຕະລາງສອບເສັງ: {viewingCommitteesTeacher.academicTitle} {viewingCommitteesTeacher.name}
                    </h3>
                    <p className="text-xs text-slate-500">
                      {viewingCommitteesTeacher.department} &bull; ລາຍຊື່ຄະນະກຳມະການທີ່ຖືກແຕ່ງຕັ້ງ
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setViewingCommitteesTeacher(null)}
                  className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                {viewingCommitteesTeacher.committeeExams.length === 0 ? (
                  <div className="py-8 text-center text-slate-400">
                    ຍັງບໍ່ມີຕາຕະລາງສອບເສັງທີ່ຖືກແຕ່ງຕັ້ງໃນປັດຈຸບັນ
                  </div>
                ) : (
                  viewingCommitteesTeacher.committeeExams.map((ce) => (
                    <div
                      key={ce.examId}
                      className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-violet-100 text-violet-800">
                              {ce.examTypeCode} EXAM
                            </span>
                            {ce.committeeRole === "CHAIRMAN" && (
                              <Badge variant="rose">ປະທານຄະນະກຳມະການ</Badge>
                            )}
                            {ce.committeeRole === "COMMITTEE" && (
                              <Badge variant="violet">ກຳມະການສອບ</Badge>
                            )}
                            {ce.committeeRole === "SECRETARY" && (
                              <Badge variant="sky">ເລຂາ</Badge>
                            )}
                          </div>
                          <h4 className="font-bold text-slate-900 text-sm mt-2">{ce.topicTH}</h4>
                          <p className="text-xs text-slate-500 italic mt-0.5">{ce.topicEN}</p>

                          <div className="grid grid-cols-2 gap-2 mt-3 pt-2 border-t border-slate-200/60 text-xs">
                            <div className="text-slate-600 flex items-center gap-1.5">
                              <Calendar className="h-3.5 w-3.5 text-slate-400" />
                              <span>ວັນທີ: {ce.scheduledDate}</span>
                            </div>
                            <div className="text-slate-600 flex items-center gap-1.5">
                              <Clock className="h-3.5 w-3.5 text-slate-400" />
                              <span>ເວລາ: {ce.startTime} - {ce.endTime}</span>
                            </div>
                            <div className="col-span-2 text-slate-600 flex items-center gap-1.5">
                              <span className="text-slate-400">ສະຖານທີ່:</span>
                              <span className="font-medium text-slate-800">{ce.roomName}</span>
                            </div>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <Badge variant="emerald">ພ້ອມສອບເສັງ</Badge>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="flex justify-between items-center px-6 py-3 bg-slate-50 border-t border-slate-100">
                <span className="text-xs text-slate-500">
                  ຈັດຕາຕະລາງ ແລະ ແຕ່ງຕັ້ງກຳມະການຜ່ານເມນູ &quot;ສູນການສອບເສັງ (Examination Hub)&quot;
                </span>
                <Button variant="outline" size="sm" onClick={() => setViewingCommitteesTeacher(null)}>
                  ປິດໜ້າຕ່າງ
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            MODAL: RBAC ROLE EDIT (Existing)
        ========================================================================= */}
        {selectedRbacUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-xs p-4">
            <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/60">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-rose-50 text-rose-600">
                    <Key className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">ກຳນົດສິດທິຜູ້ໃຊ້ງານ: {selectedRbacUser.name}</h3>
                    <p className="text-xs text-slate-500">{selectedRbacUser.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedRbacUser(null)}
                  className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="p-6 space-y-3">
                <p className="text-xs text-slate-500 mb-2">
                  ເລືອກບົດບາດທີ່ຕ້ອງການມອບໝາຍໃຫ້ບັນຊີນີ້ (ສາມາດມີໄດ້ຫຼາຍບົດບາດພ້ອມກັນ):
                </p>

                {allRoleOptionsLao.map((opt) => {
                  const isChecked = selectedRbacUser.roles.some((r) => r.code === opt.code);
                  return (
                    <label
                      key={opt.code}
                      onClick={() => toggleRbacRole(opt.code)}
                      className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                        isChecked
                          ? "bg-sky-50/60 border-sky-300 text-sky-950"
                          : "border-slate-200 hover:bg-slate-50 text-slate-700"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        readOnly
                        className="mt-0.5 rounded text-sky-600"
                      />
                      <div className="flex-1">
                        <div className="text-sm font-semibold">{opt.name}</div>
                        <div className="text-xs text-slate-500 mt-0.5">{opt.description}</div>
                      </div>
                    </label>
                  );
                })}
              </div>

              <div className="flex justify-between items-center px-6 py-3 bg-slate-50 border-t border-slate-100">
                {saveNotice ? (
                  <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                    <CheckCircle className="h-3.5 w-3.5" /> ບັນທຶກສິດທິຮຽບຮ້ອຍແລ້ວ!
                  </span>
                ) : (
                  <span className="text-xs text-slate-400">ບັນທຶກອັດຕະໂນມັດທັນທີ</span>
                )}
                <Button size="sm" onClick={() => setSelectedRbacUser(null)}>
                  ສຳເລັດ
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}

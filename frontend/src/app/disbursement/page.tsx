"use client";

import React, { useState, useMemo } from "react";
import {
  Wallet,
  CheckCircle2,
  Clock,
  Printer,
  Search,
  ShieldCheck,
  Receipt,
  FileCheck,
  Plus,
} from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Badge, BadgeVariant } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { teacherSearchableOptions } from "@/lib/academic-directory";

export interface CommitteeDisbursementRecord {
  id: string;
  voucherNo: string;
  recipientName: string;
  recipientAffiliation: string;
  role: "CHAIRMAN" | "MEMBER" | "SECRETARY" | "STAFF" | "CATERING";
  roleLabel: string;
  examRound: "PROPOSAL_1" | "PROPOSAL_2" | "FINAL_1" | "FINAL_2";
  roundTitle: string;
  defenseGroupsCount: number;
  ratePerGroup: number;
  totalAmount: number;
  bankName: string;
  bankAccount: string;
  status: "PENDING_APPROVAL" | "APPROVED" | "DISBURSED";
  statusLabel: string;
  badgeVariant: BadgeVariant;
  disbursedAt?: string;
  referenceNo?: string;
}

const initialDisbursements: CommitteeDisbursementRecord[] = [
  {
    id: "DISB-2027-001",
    voucherNo: "VCH-2027-0101",
    recipientName: "ທ່ານ ຮສ. ແສງລັດສະໝີ ຈັນທະມິນາວົງ",
    recipientAffiliation: "CEIT",
    role: "CHAIRMAN",
    roleLabel: "ປະທານກຳມະການ",
    examRound: "PROPOSAL_1",
    roundTitle: "ປ້ອງກັນຫົວບົດ ຊຸດທີ 1",
    defenseGroupsCount: 12,
    ratePerGroup: 60000,
    totalAmount: 720000,
    bankName: "BCEL",
    bankAccount: "010-12-00-01928301-001",
    status: "DISBURSED",
    statusLabel: "ເບີກຈ່າຍແລ້ວ (Disbursed)",
    badgeVariant: "emerald",
    disbursedAt: "2027-03-05 14:30",
    referenceNo: "BCEL-TRX-9821039",
  },
  {
    id: "DISB-2027-002",
    voucherNo: "VCH-2027-0102",
    recipientName: "ທ່ານ ອຈ. ເມກຈອນ ບຸນທັນ",
    recipientAffiliation: "CEIT",
    role: "MEMBER",
    roleLabel: "ກຳມະການສອບເສັງ",
    examRound: "PROPOSAL_1",
    roundTitle: "ປ້ອງກັນຫົວບົດ ຊຸດທີ 1",
    defenseGroupsCount: 10,
    ratePerGroup: 50000,
    totalAmount: 500000,
    bankName: "BCEL",
    bankAccount: "010-12-00-04481920-001",
    status: "DISBURSED",
    statusLabel: "ເບີກຈ່າຍແລ້ວ (Disbursed)",
    badgeVariant: "emerald",
    disbursedAt: "2027-03-05 14:35",
    referenceNo: "BCEL-TRX-9821044",
  },
  {
    id: "DISB-2027-003",
    voucherNo: "VCH-2027-0103",
    recipientName: "ທ່ານ ຮສ. ປອ. ຄຳເພັດ ບຸນນະດີ",
    recipientAffiliation: "CEIT",
    role: "MEMBER",
    roleLabel: "ກຳມະການສອບເສັງ",
    examRound: "PROPOSAL_1",
    roundTitle: "ປ້ອງກັນຫົວບົດ ຊຸດທີ 1",
    defenseGroupsCount: 10,
    ratePerGroup: 50000,
    totalAmount: 500000,
    bankName: "BCEL",
    bankAccount: "010-12-00-05519283-001",
    status: "APPROVED",
    statusLabel: "ອະນຸມັດແລ້ວ (Approved)",
    badgeVariant: "sky",
    disbursedAt: "2027-03-08",
  },
  {
    id: "DISB-2027-004",
    voucherNo: "VCH-2027-0104",
    recipientName: "ທ່ານ ນາງ ລັດທິດາ",
    recipientAffiliation: "CEIT",
    role: "SECRETARY",
    roleLabel: "ເລຂາກຳມະການ",
    examRound: "PROPOSAL_1",
    roundTitle: "ປ້ອງກັນຫົວບົດ ຊຸດທີ 1",
    defenseGroupsCount: 8,
    ratePerGroup: 50000,
    totalAmount: 400000,
    bankName: "BCEL",
    bankAccount: "010-12-00-07728391-001",
    status: "APPROVED",
    statusLabel: "ອະນຸມັດແລ້ວ (Approved)",
    badgeVariant: "sky",
  },
  {
    id: "DISB-2027-005",
    voucherNo: "VCH-2027-0105",
    recipientName: "ງົບປະມານນ້ຳດື່ມ & ອາຫານຫວ່າງພາກວິຊາ",
    recipientAffiliation: "CEIT Catering",
    role: "CATERING",
    roleLabel: "ຄ່ານ້ຳດື່ມ/ອາຫານຫວ່າງ",
    examRound: "PROPOSAL_1",
    roundTitle: "ປ້ອງກັນຫົວບົດ ຊຸດທີ 1",
    defenseGroupsCount: 20,
    ratePerGroup: 10000,
    totalAmount: 200000,
    bankName: "BCEL OneCash",
    bankAccount: "CEIT-CATERING-FUND",
    status: "DISBURSED",
    statusLabel: "ເບີກຈ່າຍແລ້ວ (Disbursed)",
    badgeVariant: "emerald",
    disbursedAt: "2027-03-01 08:30",
    referenceNo: "PETTY-CASH-081",
  },
  {
    id: "DISB-2027-006",
    voucherNo: "VCH-2027-0106",
    recipientName: "ທ່ານ ປອ. ຊານຸພາບ ພົມແກ້ວນາ",
    recipientAffiliation: "CEIT",
    role: "CHAIRMAN",
    roleLabel: "ປະທານກຳມະການ",
    examRound: "PROPOSAL_2",
    roundTitle: "ປ້ອງກັນຫົວບົດ ຊຸດທີ 2",
    defenseGroupsCount: 6,
    ratePerGroup: 60000,
    totalAmount: 360000,
    bankName: "BCEL",
    bankAccount: "010-12-00-08837192-001",
    status: "PENDING_APPROVAL",
    statusLabel: "ລໍຖ້າອະນຸມັດ (Pending)",
    badgeVariant: "amber",
  },
  {
    id: "DISB-2027-007",
    voucherNo: "VCH-2027-0107",
    recipientName: "ທ່ານ ສຸກສະຫວັນ ຈຸນດາລີ",
    recipientAffiliation: "CEIT",
    role: "MEMBER",
    roleLabel: "ກຳມະການສອບເສັງ",
    examRound: "PROPOSAL_2",
    roundTitle: "ປ້ອງກັນຫົວບົດ ຊຸດທີ 2",
    defenseGroupsCount: 6,
    ratePerGroup: 50000,
    totalAmount: 300000,
    bankName: "BCEL",
    bankAccount: "010-12-00-09928371-001",
    status: "PENDING_APPROVAL",
    statusLabel: "ລໍຖ້າອະນຸມັດ (Pending)",
    badgeVariant: "amber",
  },
  {
    id: "DISB-2027-008",
    voucherNo: "VCH-2027-0108",
    recipientName: "ທ່ານ ຄຳໄຊ ລີຫວາຕູ້",
    recipientAffiliation: "CEIT",
    role: "MEMBER",
    roleLabel: "ກຳມະການສອບເສັງ",
    examRound: "FINAL_1",
    roundTitle: "ປ້ອງກັນບົດຈົບຊັ້ນ ຊຸດທີ 1",
    defenseGroupsCount: 8,
    ratePerGroup: 50000,
    totalAmount: 400000,
    bankName: "BCEL",
    bankAccount: "010-12-00-01129384-001",
    status: "PENDING_APPROVAL",
    statusLabel: "ລໍຖ້າອະນຸມັດ (Pending)",
    badgeVariant: "amber",
  },
];

export default function DisbursementPage() {
  const [records, setRecords] = useState<CommitteeDisbursementRecord[]>(initialDisbursements);
  const [selectedRound, setSelectedRound] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // New disbursement modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTeacherName, setSelectedTeacherName] = useState("");
  const [newRole, setNewRole] = useState<"CHAIRMAN" | "MEMBER" | "SECRETARY" | "STAFF" | "CATERING">("MEMBER");
  const [newRound, setNewRound] = useState<"PROPOSAL_1" | "PROPOSAL_2" | "FINAL_1" | "FINAL_2">("PROPOSAL_1");
  const [newGroupsCount, setNewGroupsCount] = useState<number>(4);
  const [newBankAccount, setNewBankAccount] = useState("");

  // Rate calculator based on official decree
  const currentRatePerGroup = useMemo(() => {
    switch (newRole) {
      case "CHAIRMAN":
        return 60000;
      case "MEMBER":
      case "SECRETARY":
        return 50000;
      case "STAFF":
        return 30000;
      case "CATERING":
        return 10000;
      default:
        return 50000;
    }
  }, [newRole]);

  const newTotalAmount = newGroupsCount * currentRatePerGroup;

  // Filtered records
  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      const matchesRound = selectedRound === "ALL" || r.examRound === selectedRound;
      const matchesStatus = statusFilter === "ALL" || r.status === statusFilter;
      const matchesSearch =
        r.recipientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.voucherNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.bankAccount.includes(searchTerm);
      return matchesRound && matchesStatus && matchesSearch;
    });
  }, [records, selectedRound, statusFilter, searchTerm]);

  // Aggregate financial metrics
  const totalDisbursed = useMemo(() => {
    return records
      .filter((r) => r.status === "DISBURSED")
      .reduce((sum, r) => sum + r.totalAmount, 0);
  }, [records]);

  const totalApproved = useMemo(() => {
    return records
      .filter((r) => r.status === "APPROVED")
      .reduce((sum, r) => sum + r.totalAmount, 0);
  }, [records]);

  const totalPending = useMemo(() => {
    return records
      .filter((r) => r.status === "PENDING_APPROVAL")
      .reduce((sum, r) => sum + r.totalAmount, 0);
  }, [records]);

  const totalBudgetRequired = totalDisbursed + totalApproved + totalPending;

  // Handlers
  const handleApprove = (id: string) => {
    setRecords((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              status: "APPROVED",
              statusLabel: "ອະນຸມັດແລ້ວ (Approved)",
              badgeVariant: "sky",
            }
          : r
      )
    );
    setSuccessToast("ອະນຸມັດໃບເບີກຈ່າຍສຳເລັດແລ້ວ!");
    setTimeout(() => setSuccessToast(null), 3500);
  };

  const handleDisburse = (id: string) => {
    const trxRef = `BCEL-TRX-${Math.floor(1000000 + Math.random() * 9000000)}`;
    setRecords((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              status: "DISBURSED",
              statusLabel: "ເບີກຈ່າຍແລ້ວ (Disbursed)",
              badgeVariant: "emerald",
              disbursedAt: new Date().toISOString().replace("T", " ").substring(0, 16),
              referenceNo: trxRef,
            }
          : r
      )
    );
    setSuccessToast(`ໂອນເງິນສຳເລັດແລ້ວ! ລະຫັດອ້າງອີງ: ${trxRef}`);
    setTimeout(() => setSuccessToast(null), 3500);
  };

  const handleCreateDisbursement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTeacherName.trim()) return;

    const roundTitles: Record<string, string> = {
      PROPOSAL_1: "ປ້ອງກັນຫົວບົດ ຊຸດທີ 1",
      PROPOSAL_2: "ປ້ອງກັນຫົວບົດ ຊຸດທີ 2",
      FINAL_1: "ປ້ອງກັນບົດຈົບຊັ້ນ ຊຸດທີ 1",
      FINAL_2: "ປ້ອງກັນບົດຈົບຊັ້ນ ຊຸດທີ 2",
    };

    const roleLabels: Record<string, string> = {
      CHAIRMAN: "ປະທານກຳມະການ",
      MEMBER: "ກຳມະການສອບເສັງ",
      SECRETARY: "ເລຂາກຳມະການ",
      STAFF: "ພະນັກງານຊ່ວຍວຽກ",
      CATERING: "ຄ່ານ້ຳດື່ມ/ອາຫານຫວ່າງ",
    };

    const newRecord: CommitteeDisbursementRecord = {
      id: `DISB-2027-${String(records.length + 1).padStart(3, "0")}`,
      voucherNo: `VCH-2027-${String(100 + records.length + 1)}`,
      recipientName: selectedTeacherName,
      recipientAffiliation: "CEIT / ຄວສ",
      role: newRole,
      roleLabel: roleLabels[newRole],
      examRound: newRound,
      roundTitle: roundTitles[newRound],
      defenseGroupsCount: newGroupsCount,
      ratePerGroup: currentRatePerGroup,
      totalAmount: newTotalAmount,
      bankName: "BCEL",
      bankAccount: newBankAccount || "010-12-00-XXXXXXXX-001",
      status: "PENDING_APPROVAL",
      statusLabel: "ລໍຖ້າອະນຸມັດ (Pending)",
      badgeVariant: "amber",
    };

    setRecords([newRecord, ...records]);
    setShowCreateModal(false);
    setSelectedTeacherName("");
    setNewBankAccount("");
    setSuccessToast("ສ້າງໃບສະເໜີເບີກຈ່າຍຄ່າຕອບແທນສຳເລັດແລ້ວ!");
    setTimeout(() => setSuccessToast(null), 3500);
  };

  return (
    <AppShell>
      <div className="space-y-6 font-sans">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-6">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-950 font-lao">
                ການເບີກຈ່າຍຄ່າຕອບແທນກຳມະການສອບເສັງ (Disbursement & Committee Honorarium)
              </h1>
              <Badge variant="emerald">ສົກຮຽນ 2026-2027</Badge>
            </div>
            <p className="mt-1 text-sm text-slate-500 font-lao">
              ຄຸ້ມຄອງການເບີກຈ່າຍເງິນຄ່າຕອບແທນປະທານ, ກຳມະການ, ເລຂາ ແລະ ງົບປະມານຮັບໃຊ້ການສອບເສັງທັງ 4 ຮອບ ຕາມລະບຽບການເງິນ ຄະນະວິສະວະກຳສາດ.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 font-lao">
            <Button
              onClick={() => setShowCreateModal(true)}
              variant="primary"
              leftIcon={<Plus className="h-4 w-4" />}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-sm"
            >
              + ສ້າງໃບເບີກຈ່າຍ (New Voucher)
            </Button>
            <Button
              onClick={() => window.print()}
              variant="outline"
              leftIcon={<Printer className="h-4 w-4 text-slate-600" />}
              className="font-medium"
            >
              ພິມໃບສະຫຼຸບເບີກຈ່າຍ
            </Button>
          </div>
        </div>

        {/* Success Toast */}
        {successToast && (
          <div className="flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-xs font-bold text-emerald-800 font-lao shadow-sm animate-in fade-in">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>{successToast}</span>
          </div>
        )}

        {/* KPI Financial Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="ເບີກຈ່າຍສຳເລັດແລ້ວ"
            value={`${totalDisbursed.toLocaleString()} LAK`}
            description="ໂອນຜ່ານ BCEL ຮຽບຮ້ອຍ"
            icon={<CheckCircle2 className="h-5 w-5 text-emerald-600" />}
          />
          <StatCard
            title="ອະນຸມັດລໍຖ້າໂອນ"
            value={`${totalApproved.toLocaleString()} LAK`}
            description="ຜ່ານການກວດສອບຈາກຫົວໜ້າພາກ"
            icon={<FileCheck className="h-5 w-5 text-sky-600" />}
          />
          <StatCard
            title="ລໍຖ້າການອະນຸມັດ"
            value={`${totalPending.toLocaleString()} LAK`}
            description="ໃບສະເໜີໃໝ່ຈາກກອງເລຂາ"
            icon={<Clock className="h-5 w-5 text-amber-600" />}
          />
          <StatCard
            title="ງົບປະມານລວມທັງໝົດ"
            value={`${totalBudgetRequired.toLocaleString()} LAK`}
            description="ອັດຕາ 60k / 50k / 10k ຕໍ່ກຸ່ມ"
            icon={<Wallet className="h-5 w-5 text-violet-600" />}
          />
        </div>

        {/* Official Fee Structure & Rate Standard Banner */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-gradient-to-r from-slate-900 to-slate-800 text-white p-4 rounded-xl shadow-sm text-xs font-lao">
          <div className="flex items-start gap-2.5">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-500/20 text-sky-300 font-bold shrink-0">1</span>
            <div>
              <p className="font-bold text-sky-300">ປະທານກຳມະການສອບ</p>
              <p className="text-slate-300 text-[11px] mt-0.5">60,000 ກີບ / ກຸ່ມ / ຄັ້ງ</p>
              <p className="text-slate-400 text-[10px]">ຄວບຄຸມການສອບ ແລະ ຕັດສິນ</p>
            </div>
          </div>
          <div className="flex items-start gap-2.5">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-300 font-bold shrink-0">2</span>
            <div>
              <p className="font-bold text-emerald-300">ກຳມະການ &amp; ເລຂາ</p>
              <p className="text-slate-300 text-[11px] mt-0.5">50,000 ກີບ / ກຸ່ມ / ທ່ານ</p>
              <p className="text-slate-400 text-[10px]">ໃຫ້ຄະແນນ &amp; ບັນທຶກຄຳເຫັນ</p>
            </div>
          </div>
          <div className="flex items-start gap-2.5">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/20 text-amber-300 font-bold shrink-0">3</span>
            <div>
              <p className="font-bold text-amber-300">ນ້ຳດື່ມ &amp; ອາຫານຫວ່າງ</p>
              <p className="text-slate-300 text-[11px] mt-0.5">10,000 ກີບ / ກຸ່ມ</p>
              <p className="text-slate-400 text-[10px]">ຮັບໃຊ້ຫ້ອງສອບເສັງ</p>
            </div>
          </div>
          <div className="flex items-start gap-2.5">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-500/20 text-violet-300 font-bold shrink-0">4</span>
            <div>
              <p className="font-bold text-violet-300">ພະນັກງານຊ່ວຍວຽກ</p>
              <p className="text-slate-300 text-[11px] mt-0.5">30,000 ກີບ / ພາກການສອບ</p>
              <p className="text-slate-400 text-[10px]">ກະກຽມຫ້ອງ &amp; ເອກະສານ</p>
            </div>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-col gap-3 bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-1 max-w-md bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
              <Search className="h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="ຄົ້ນຫາຊື່ກຳມະການ, ເລກທີໃບສັ່ງຈ່າຍ, ຫຼື ເລກບັນຊີ..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-transparent text-xs text-slate-800 placeholder-slate-400 focus:outline-none w-full"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs shrink-0 font-lao">
              <span className="text-slate-500 font-medium">ສະຖານະ:</span>
              {[
                { id: "ALL", label: "ທັງໝົດ" },
                { id: "DISBURSED", label: "ເບີກຈ່າຍແລ້ວ" },
                { id: "APPROVED", label: "ອະນຸມັດແລ້ວ" },
                { id: "PENDING_APPROVAL", label: "ລໍຖ້າອະນຸມັດ" },
              ].map((st) => (
                <button
                  key={st.id}
                  onClick={() => setStatusFilter(st.id)}
                  className={`px-2.5 py-1 rounded-md font-semibold transition ${
                    statusFilter === st.id
                      ? "bg-slate-900 text-white shadow-xs"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>
          </div>

          {/* Exam Round Selector Row */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-xs font-lao">
            <span className="text-slate-500 font-medium">ຮອບການສອບເສັງ:</span>
            {[
              { id: "ALL", label: "ທຸກຮອບການສອບ (4 ຮອບ)" },
              { id: "PROPOSAL_1", label: "ປ້ອງກັນຫົວບົດ ຊຸດທີ 1" },
              { id: "PROPOSAL_2", label: "ປ້ອງກັນຫົວບົດ ຊຸດທີ 2" },
              { id: "FINAL_1", label: "ປ້ອງກັນບົດຈົບຊັ້ນ ຊຸດທີ 1" },
              { id: "FINAL_2", label: "ປ້ອງກັນບົດຈົບຊັ້ນ ຊຸດທີ 2" },
            ].map((round) => (
              <button
                key={round.id}
                onClick={() => setSelectedRound(round.id)}
                className={`px-3 py-1 rounded-md text-xs font-semibold transition ${
                  selectedRound === round.id
                    ? "bg-emerald-700 text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {round.label}
              </button>
            ))}
          </div>
        </div>

        {/* Disbursement Table Card */}
        <Card className="border-slate-200 overflow-hidden shadow-xs">
          <CardHeader className="bg-slate-50/70 border-b border-slate-200 py-3 px-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-bold text-slate-900 font-lao">
                ລາຍການເບີກຈ່າຍຄ່າຕອບແທນກຳມະການ ({filteredRecords.length} ລາຍການ)
              </CardTitle>
              <span className="text-xs text-slate-500 font-lao">
                ຍອດລວມໃນຕາຕະລາງ:{" "}
                <strong className="text-slate-900">
                  {filteredRecords.reduce((sum, r) => sum + r.totalAmount, 0).toLocaleString()} LAK
                </strong>
              </span>
            </div>
          </CardHeader>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse font-sans">
              <thead className="bg-slate-100 text-slate-600 font-semibold uppercase text-[11px] font-lao">
                <tr>
                  <th className="py-3 px-3">ເລກທີໃບສັ່ງຈ່າຍ</th>
                  <th className="py-3 px-3">ຜູ້ຮັບເງິນ &amp; ພາກສ່ວນ</th>
                  <th className="py-3 px-3">ບົດບາດ</th>
                  <th className="py-3 px-3">ຮອບສອບ</th>
                  <th className="py-3 px-3 text-center">ຈຳນວນກຸ່ມ</th>
                  <th className="py-3 px-3 text-right">ອັດຕາ/ກຸ່ມ</th>
                  <th className="py-3 px-3 text-right">ລວມເປັນເງິນ (LAK)</th>
                  <th className="py-3 px-3">ເລກບັນຊີ / BCEL One</th>
                  <th className="py-3 px-3 text-center">ສະຖານະ</th>
                  <th className="py-3 px-3 text-center">ການດຳເນີນງານ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-lao">
                {filteredRecords.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="py-8 text-center text-slate-400">
                      ບໍ່ພົບຂໍ້ມູນການເບີກຈ່າຍຕາມເງື່ອນໄຂທີ່ເລືອກ
                    </td>
                  </tr>
                ) : (
                  filteredRecords.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-3 font-mono font-bold text-slate-700">
                        {item.voucherNo}
                      </td>
                      <td className="py-3 px-3 font-medium text-slate-900">
                        <div>
                          <span>{item.recipientName}</span>
                          <span className="block text-[10px] text-slate-400">{item.recipientAffiliation}</span>
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <span className="inline-block px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700">
                          {item.roleLabel}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-600 text-[11px]">
                        {item.roundTitle}
                      </td>
                      <td className="py-3 px-3 text-center font-bold text-slate-800">
                        {item.defenseGroupsCount} ກຸ່ມ
                      </td>
                      <td className="py-3 px-3 text-right text-slate-600">
                        {item.ratePerGroup.toLocaleString()}
                      </td>
                      <td className="py-3 px-3 text-right font-bold text-emerald-700 text-xs">
                        {item.totalAmount.toLocaleString()}
                      </td>
                      <td className="py-3 px-3 font-mono text-[11px] text-slate-600">
                        <div>
                          <span>{item.bankAccount}</span>
                          <span className="block text-[10px] text-slate-400">{item.bankName}</span>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <Badge variant={item.badgeVariant}>{item.statusLabel}</Badge>
                        {item.disbursedAt && (
                          <span className="block text-[10px] text-slate-400 mt-0.5">
                            {item.disbursedAt}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {item.status === "PENDING_APPROVAL" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleApprove(item.id)}
                              className="text-[11px] py-1 px-2 h-auto text-sky-700 border-sky-300 hover:bg-sky-50"
                            >
                              ອະນຸມັດ
                            </Button>
                          )}
                          {item.status === "APPROVED" && (
                            <Button
                              size="sm"
                              variant="primary"
                              onClick={() => handleDisburse(item.id)}
                              className="text-[11px] py-1 px-2.5 h-auto bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
                            >
                              ໂອນເງິນ
                            </Button>
                          )}
                          {item.status === "DISBURSED" && (
                            <span className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1">
                              <ShieldCheck className="h-3 w-3" /> ສຳເລັດ
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Modal: Create Disbursement Voucher */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 font-lao">
            <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-6 py-4">
                <div className="flex items-center gap-2">
                  <Receipt className="h-5 w-5 text-emerald-600" />
                  <h3 className="text-base font-bold text-slate-900">
                    ສ້າງໃບສະເໜີເບີກຈ່າຍຄ່າຕອບແທນກຳມະການ
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="rounded-lg p-1 text-slate-400 hover:bg-slate-200"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateDisbursement} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    ເລືອກອາຈານກຳມະການ ຫຼື ຜູ້ຮັບເງິນ:
                  </label>
                  <SearchableSelect
                    options={teacherSearchableOptions}
                    value={selectedTeacherName}
                    onChange={(val) => setSelectedTeacherName(val)}
                    placeholder="-- ຄົ້ນຫາຊື່ອາຈານໃນສາລະບົບ --"
                    searchPlaceholder="ພິມຊື່ອາຈານ..."
                    allowCustom={true}
                    customPlaceholder="+ ປ້ອນຊື່ພາຍນອກ:"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      ບົດບາດໃນການສອບເສັງ:
                    </label>
                    <select
                      value={newRole}
                      onChange={(e) =>
                        setNewRole(
                          e.target.value as CommitteeDisbursementRecord["role"]
                        )
                      }
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-800 shadow-sm focus:border-emerald-500 focus:outline-none"
                    >
                      <option value="CHAIRMAN">ປະທານກຳມະການ (60,000 ກີບ)</option>
                      <option value="MEMBER">ກຳມະການສອບເສັງ (50,000 ກີບ)</option>
                      <option value="SECRETARY">ເລຂາກຳມະການ (50,000 ກີບ)</option>
                      <option value="STAFF">ພະນັກງານຊ່ວຍວຽກ (30,000 ກີບ)</option>
                      <option value="CATERING">ຄ່ານ້ຳດື່ມ/ອາຫານຫວ່າງ (10,000 ກີບ)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      ຮອບການສອບເສັງ:
                    </label>
                    <select
                      value={newRound}
                      onChange={(e) =>
                        setNewRound(
                          e.target.value as CommitteeDisbursementRecord["examRound"]
                        )
                      }
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-800 shadow-sm focus:border-emerald-500 focus:outline-none"
                    >
                      <option value="PROPOSAL_1">ປ້ອງກັນຫົວບົດ ຊຸດທີ 1</option>
                      <option value="PROPOSAL_2">ປ້ອງກັນຫົວບົດ ຊຸດທີ 2</option>
                      <option value="FINAL_1">ປ້ອງກັນບົດຈົບຊັ້ນ ຊຸດທີ 1</option>
                      <option value="FINAL_2">ປ້ອງກັນບົດຈົບຊັ້ນ ຊຸດທີ 2</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      ຈຳນວນກຸ່ມສອບ (ກຸ່ມ):
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={30}
                      value={newGroupsCount}
                      onChange={(e) => setNewGroupsCount(parseInt(e.target.value) || 1)}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-bold text-slate-800 shadow-sm focus:border-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      ເລກບັນຊີ BCEL:
                    </label>
                    <input
                      type="text"
                      placeholder="010-12-00-XXXXXXXX-001"
                      value={newBankAccount}
                      onChange={(e) => setNewBankAccount(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-mono text-slate-800 shadow-sm focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Calculation Summary Box */}
                <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-200 space-y-1 text-xs">
                  <div className="flex justify-between text-slate-500">
                    <span>ອັດຕາຕາມລະບຽບ:</span>
                    <span>{currentRatePerGroup.toLocaleString()} ກີບ / ກຸ່ມ</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>ຈຳນວນກຸ່ມທີ່ປະເມີນ:</span>
                    <span>{newGroupsCount} ກຸ່ມ</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold text-slate-900 pt-1 border-t border-slate-200">
                    <span>ຍອດເງິນເບີກຈ່າຍລວມ:</span>
                    <span className="text-emerald-700">{newTotalAmount.toLocaleString()} LAK</span>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowCreateModal(false)}
                  >
                    ຍົກເລີກ
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
                  >
                    ບັນທຶກ &amp; ສົ່ງຂໍອະນຸມັດ
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}

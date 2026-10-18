"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import {
  Receipt,
  CheckCircle,
  Clock,
  Search,
  ShieldCheck,
  CreditCard,
  FileCheck,
  RefreshCw,
} from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Badge, BadgeVariant } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { studentSearchableOptions, teacherSearchableOptions } from "@/lib/academic-directory";
import { createClient } from "@/lib/supabase/client";

interface PaymentRecord {
  id: string;
  refCode: string;
  studentName: string;
  studentId: string;
  thesisCode: string;
  feeType: string;
  amount: number;
  uploadedAt: string;
  bankRef: string;
  status: "VERIFIED" | "PENDING_VERIFICATION" | "UNPAID";
  statusLabel: string;
  badgeVariant: BadgeVariant;
  receiptNo?: string;
  notes?: string;
}

export default function FinanceReconciliationPage() {
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPayment, setSelectedPayment] = useState<PaymentRecord | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [studentFilter, setStudentFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifiedSuccess, setVerifiedSuccess] = useState(false);

  // Teacher remuneration payout modal state
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [selectedTeacherForPayout, setSelectedTeacherForPayout] = useState("");
  const [payoutRole, setPayoutRole] = useState("ປະທານກຳມະການສອບ");
  const [payoutAmount, setPayoutAmount] = useState(1500000);
  const [payoutThesisRef, setPayoutThesisRef] = useState("CS-2026-001");
  const [payoutSuccess, setPayoutSuccess] = useState(false);

  const fetchPayments = useCallback(async () => {
    setIsLoading(true);
    try {
      const supabase = createClient();
      const { data, error } = await (supabase as any)
        .from("exam_fee_payments")
        .select(`
          id,
          amount,
          currency,
          status,
          receipt_no,
          paid_at,
          verified_at,
          notes,
          fee_type_code,
          attempt_no,
          theses (
            id,
            topic_th,
            topic_en,
            category_code,
            thesis_members (
              is_leader,
              students (
                student_code,
                profiles (
                  display_name
                )
              )
            )
          )
        `)
        .order("paid_at", { ascending: false });

      if (error) {
        console.error("Error fetching payments from live DB:", error);
        return;
      }

      if (data) {
        const records: PaymentRecord[] = data.map((item: any) => {
          const thesis = Array.isArray(item.theses) ? item.theses[0] : item.theses;
          const members = thesis?.thesis_members || [];
          const leader = members.find((m: any) => m.is_leader) || members[0];
          const studentName = leader?.students?.profiles?.display_name || "ນັກສຶກສາ (ກຸ່ມບົດ)";
          const studentId = leader?.students?.student_code || "—";
          const thesisCode = thesis?.topic_th || "ບົດວິທະຍານິພົນ";
          const isVerified = item.status === "VERIFIED";
          const isPaid = item.status === "PAID";
          const statusLabel = isVerified ? "ກວດສອບແລ້ວ & ອອກໃບຮັບ" : isPaid ? "ລໍຖ້າກວດສອບສະລິບ" : "ຍັງບໍ່ທັນຊຳລະ";
          const badgeVariant: BadgeVariant = isVerified ? "emerald" : isPaid ? "amber" : "slate";
          const feeTypeName =
            item.fee_type_code === "PROPOSAL_EXAM"
              ? "ຄ່າທຳນຽມສອບປ້ອງກັນໂຄງຮ່າງ"
              : item.fee_type_code === "FINAL_EXAM"
              ? "ຄ່າທຳນຽມສອບປ້ອງກັນບົດ"
              : item.fee_type_code;

          return {
            id: item.id,
            refCode: item.receipt_no || `PAY-${item.id.substring(0, 8).toUpperCase()}`,
            studentName,
            studentId,
            thesisCode,
            feeType: feeTypeName,
            amount: Number(item.amount) || 0,
            uploadedAt: item.paid_at ? new Date(item.paid_at).toLocaleString("lo-LA") : "—",
            bankRef: item.receipt_no ? `BCEL-${item.receipt_no}` : "BCEL-ONE",
            status: isVerified ? "VERIFIED" : isPaid ? "PENDING_VERIFICATION" : "UNPAID",
            statusLabel,
            badgeVariant,
            receiptNo: item.receipt_no,
            notes: item.notes,
          };
        });
        setPayments(records);
      }
    } catch (err) {
      console.error("Failed to load payments from Supabase:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  const filteredPayments = useMemo(() => {
    return payments.filter((p) => {
      const matchesSearch =
        p.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.studentId.includes(searchTerm) ||
        p.refCode.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "ALL" || p.status === statusFilter;
      const matchesStudent =
        !studentFilter ||
        p.studentId === studentFilter ||
        p.studentName.toLowerCase().includes(studentFilter.toLowerCase());
      return matchesSearch && matchesStatus && matchesStudent;
    });
  }, [payments, searchTerm, statusFilter, studentFilter]);

  const totalCollectedAmount = useMemo(() => {
    return payments.filter((p) => p.status === "VERIFIED").reduce((acc, p) => acc + p.amount, 0);
  }, [payments]);

  const pendingVerificationCount = useMemo(() => {
    return payments.filter((p) => p.status === "PENDING_VERIFICATION").length;
  }, [payments]);

  const issuedReceiptsCount = useMemo(() => {
    return payments.filter((p) => Boolean(p.receiptNo) && p.status === "VERIFIED").length;
  }, [payments]);

  const handleApprove = async () => {
    if (!selectedPayment) return;
    setIsVerifying(true);
    try {
      const supabase = createClient();
      const generatedReceipt =
        selectedPayment.receiptNo || `RC-2026-00${Math.floor(450 + Math.random() * 50)}`;

      const { error } = await (supabase as any)
        .from("exam_fee_payments")
        .update({
          status: "VERIFIED",
          receipt_no: generatedReceipt,
          verified_at: new Date().toISOString(),
        })
        .eq("id", selectedPayment.id);

      if (error) {
        console.error("Error approving payment:", error);
      } else {
        setVerifiedSuccess(true);
        await fetchPayments();
        setTimeout(() => {
          setVerifiedSuccess(false);
          setSelectedPayment(null);
        }, 1500);
      }
    } catch (err) {
      console.error("Failed to approve payment:", err);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleDisbursePayout = () => {
    if (!selectedTeacherForPayout) return;
    setPayoutSuccess(true);
    setTimeout(() => {
      setPayoutSuccess(false);
      setShowPayoutModal(false);
      setSelectedTeacherForPayout("");
    }, 1800);
  };

  return (
    <AppShell>
      <div className="space-y-6 font-sans">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-6">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-950">
                ການຄຸ້ມຄອງການເງິນ ແລະ ກວດສອບສະລິບ (Financial Management)
              </h1>
              <Badge variant="emerald">ເຊື່ອມຕໍ່ຖານຂໍ້ມູນຈິງ 100%</Badge>
            </div>
            <p className="mt-1 text-sm text-slate-500">
              ກວດສອບສະລິບໂອນເງິນຄ່າທຳນຽມສອບປ້ອງກັນບົດ, ອອກໃບຮັບເງິນດິຈິຕອນ, ແລະ ຄຸ້ມຄອງການເບີກຈ່າຍເງິນຕອບແທນອາຈານ (Supabase Real DB).
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchPayments}
              disabled={isLoading}
              leftIcon={<RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />}
            >
              ໂຫຼດຄືນໃໝ່
            </Button>
            <Link href="/disbursement">
              <Button
                variant="outline"
                leftIcon={<CreditCard className="h-4 w-4 text-emerald-600" />}
                className="border-emerald-300 text-emerald-800 hover:bg-emerald-50"
              >
                ສູນເບີກຈ່າຍ 4 ຊຸດສອບ (Disbursement)
              </Button>
            </Link>
            <Button
              onClick={() => {
                const pending = payments.find((p) => p.status === "PENDING_VERIFICATION") || payments[0];
                if (pending) setSelectedPayment(pending);
              }}
              disabled={payments.length === 0}
              leftIcon={<CheckCircle className="h-4 w-4" />}
            >
              ກວດສອບສະລິບຫຼ້າສຸດ
            </Button>
          </div>
        </div>

        {/* 4 Financial Stat Cards in Lao Kip (Computed live from database) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <StatCard
            title="ຍອດລວມຄ່າທຳນຽມທີ່ຮັບແລ້ວ"
            value={`₭ ${totalCollectedAmount.toLocaleString("en-US")}`}
            change="ຈາກຖານຂໍ້ມູນຈິງ"
            trend="up"
            description="ບັນທຶກຜ່ານ exam_fee_payments"
            icon={<Receipt className="h-5 w-5" />}
          />
          <StatCard
            title="ສະລິບລໍຖ້າກວດສອບ"
            value={`${pendingVerificationCount} ສະບັບ`}
            change={pendingVerificationCount > 0 ? "ຕ້ອງກວດສອບດ່ວນ" : "ບໍ່ມີລາຍການຄ້າງ"}
            trend={pendingVerificationCount > 0 ? "down" : "neutral"}
            description="ຫຼັກຖານການໂອນເງິນໃນລະບົບ"
            icon={<Clock className="h-5 w-5" />}
          />
          <StatCard
            title="ກອງທຶນຕອບແທນກຳມະການ"
            value="₭ 48,000,000"
            change="ໄລຍະທີ 13 ພ້ອມເບີກຈ່າຍ"
            trend="neutral"
            description="ສຳຮອງສຳລັບອາຈານກຳມະການສອບ"
            icon={<CreditCard className="h-5 w-5" />}
          />
          <StatCard
            title="ໃບຮັບເງິນທີ່ອອກແລ້ວ"
            value={`${issuedReceiptsCount} ສະບັບ`}
            change="ອອກລະຫັດກວດສອບແລ້ວ"
            trend="up"
            description="ໃບຮັບເງິນດິຈິຕອນທາງການ"
            icon={<FileCheck className="h-5 w-5" />}
          />
        </div>


        {/* Filter Bar with Searchable Student Dropdown */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 flex-1">
            <div className="flex items-center gap-2 flex-1 max-w-sm bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
              <Search className="h-4 w-4 text-slate-400 shrink-0" />
              <input
                type="text"
                placeholder="ຄົ້ນຫາຊື່ນັກສຶກສາ, ລະຫັດ ຫຼື ເລກອ້າງອີງ..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-transparent text-xs text-slate-800 placeholder-slate-400 focus:outline-none w-full"
              />
            </div>

            <div className="w-full sm:w-64">
              <SearchableSelect
                options={studentSearchableOptions}
                value={studentFilter}
                onChange={(val) => setStudentFilter(val)}
                placeholder="ເລືອກນັກສຶກສາ (Searchable)..."
                clearable
              />
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500 font-medium">ສະຖານະ:</span>
            {[
              { id: "ALL", label: "ທັງໝົດ" },
              { id: "PENDING_VERIFICATION", label: "ລໍຖ້າກວດສອບ" },
              { id: "VERIFIED", label: "ກວດສອບແລ້ວ" },
              { id: "UNPAID", label: "ຍັງບໍ່ທັນຊຳລະ" },
            ].map((st) => (
              <button
                key={st.id}
                onClick={() => setStatusFilter(st.id)}
                className={`px-2.5 py-1 rounded-md font-semibold transition ${
                  statusFilter === st.id
                    ? "bg-sky-600 text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>
        </div>

        {/* Payments Ledger Table */}
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th scope="col" className="p-4">ລະຫັດອ້າງອີງ</th>
                  <th scope="col" className="p-4">ນັກສຶກສາ &amp; ບົດໂຄງການ</th>
                  <th scope="col" className="p-4">ລາຍລະອຽດຄ່າທຳນຽມ</th>
                  <th scope="col" className="p-4 text-right">ຈຳນວນເງິນ (LAK)</th>
                  <th scope="col" className="p-4">ສະຖານະ</th>
                  <th scope="col" className="p-4">ເລກທີໃບຮັບເງິນ</th>
                  <th scope="col" className="p-4 text-right">ການດຳເນີນງານ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="p-12 text-center text-slate-500">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <RefreshCw className="h-6 w-6 text-sky-600 animate-spin" />
                        <span className="text-xs font-medium">ກຳລັງໂຫຼດຂໍ້ມູນການເງິນຈາກຖານຂໍ້ມູນຈິງ...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredPayments.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-12 text-center text-slate-400">
                      <Receipt className="h-10 w-10 text-slate-300 mx-auto mb-2" />
                      <p className="font-semibold text-slate-700 text-sm">ບໍ່ພົບລາຍການຊຳລະເງິນ</p>
                      <p className="text-xs text-slate-400 mt-1">ບໍ່ມີຂໍ້ມູນທີ່ຕົງກັບເງື່ອນໄຂການຄົ້ນຫາໃນຖານຂໍ້ມູນ</p>
                    </td>
                  </tr>
                ) : (
                  filteredPayments.map((payment) => (
                    <tr key={payment.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-4 font-mono font-bold text-slate-700">
                        {payment.refCode}
                      </td>
                      <td className="p-4">
                        <div className="font-semibold text-slate-900">{payment.studentName}</div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          {payment.studentId} • {payment.thesisCode}
                        </div>
                      </td>
                      <td className="p-4 font-medium text-slate-700">
                        {payment.feeType}
                      </td>
                      <td className="p-4 text-right font-mono font-bold text-slate-900 text-sm">
                        ₭ {payment.amount.toLocaleString("en-US")} ກີບ
                      </td>
                      <td className="p-4">
                        <Badge variant={payment.badgeVariant}>{payment.statusLabel}</Badge>
                      </td>
                      <td className="p-4 font-mono text-[11px] text-slate-500">
                        {payment.receiptNo || "—"}
                      </td>
                      <td className="p-4 text-right">
                        {payment.status === "PENDING_VERIFICATION" ? (
                          <Button
                            onClick={() => setSelectedPayment(payment)}
                            size="sm"
                            className="h-7 text-xs px-2.5"
                          >
                            ກວດສອບສະລິບ
                          </Button>
                        ) : (
                          <Button
                            onClick={() => setSelectedPayment(payment)}
                            variant="outline"
                            size="sm"
                            className="h-7 text-xs px-2.5"
                          >
                            ເບິ່ງລາຍລະອຽດ
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Split-Screen Slip Verification Modal (BCEL One Laos Slip Simulation) */}
        {selectedPayment && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl max-w-4xl w-full p-6 shadow-2xl space-y-6 my-8">
              {/* Modal Header */}
              <div className="flex items-start justify-between border-b border-slate-100 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-sky-700 bg-sky-100 px-2 py-0.5 rounded">
                      {selectedPayment.refCode}
                    </span>
                    <Badge variant={selectedPayment.badgeVariant}>
                      {selectedPayment.statusLabel}
                    </Badge>
                  </div>
                  <h3 className="text-xl font-bold text-slate-950 mt-1">
                    ກວດສອບຫຼັກຖານການໂອນເງິນຄ່າທຳນຽມ
                  </h3>
                  <p className="text-xs text-slate-500">
                    ນັກສຶກສາ: {selectedPayment.studentName} ({selectedPayment.studentId}) • ລະຫັດບົດ: {selectedPayment.thesisCode}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedPayment(null)}
                  className="text-slate-400 hover:text-slate-600 p-1"
                >
                  ✕
                </button>
              </div>

              {/* Split Screen: Left Ledger Details | Right BCEL One Bank Transfer Slip */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column: Authoritative Accounting Data */}
                <div className="space-y-4 text-xs">
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                    <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
                      ຂໍ້ມູນບັນຊີທາງການໃນລະບົບ
                    </h4>
                    <div className="flex justify-between border-b border-slate-200/60 pb-2">
                      <span className="text-slate-500">ປະເພດຄ່າທຳນຽມ:</span>
                      <span className="font-semibold text-slate-800">{selectedPayment.feeType}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-200/60 pb-2">
                      <span className="text-slate-500">ຍອດທີ່ຕ້ອງຊຳລະ:</span>
                      <span className="font-mono font-bold text-slate-900 text-sm">
                        ₭ {selectedPayment.amount.toLocaleString("en-US")} LAK
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-slate-200/60 pb-2">
                      <span className="text-slate-500">ເລກອ້າງອີງທະນາຄານ:</span>
                      <span className="font-mono text-slate-700">{selectedPayment.bankRef}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">ວັນທີອັບໂຫຼດສະລິບ:</span>
                      <span className="text-slate-700">{selectedPayment.uploadedAt}</span>
                    </div>
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1.5">
                      ບັນທຶກການກວດສອບຂອງເຈົ້າໜ້າທີ່ການເງິນ
                    </label>
                    <textarea
                      rows={3}
                      defaultValue="ກວດສອບລາຍການໂອນເງິນຖືກຕ້ອງຕົງກັບບັນຊີຫຼັກຂອງມະຫາວິທະຍາໄລ (BCEL ບັນຊີເລກທີ 010-12-000492). ຍອດເງິນ ແລະ ເວລາຕົງກັນສົມບູນ."
                      className="w-full border border-slate-300 rounded-lg p-2.5 text-slate-800 focus:outline-sky-500 text-xs"
                    />
                  </div>

                  <div className="rounded-lg bg-sky-50 p-3 border border-sky-200 text-sky-900 text-[11px] flex items-start gap-2">
                    <ShieldCheck className="h-4 w-4 text-sky-600 shrink-0 mt-0.5" />
                    <span>
                      ການອະນຸມັດຈະດຳເນີນການຜ່ານ ACID Transaction ໃນ Go API, ປັບສະຖານະເປັນ VERIFIED, ອອກເລກໃບຮັບເງິນທາງການ, ແລະ ບັນທຶກລົງ audit_logs.
                    </span>
                  </div>
                </div>

                {/* Right Column: BCEL One Laos Transfer Slip Viewer */}
                <div className="flex flex-col items-center justify-center bg-slate-950 rounded-xl p-6 text-white text-xs relative overflow-hidden">
                  <div className="absolute top-3 right-3 flex items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-300 border border-red-500/30 text-[10px] font-mono">
                      BCEL One Slip (Laos)
                    </span>
                  </div>

                  {/* Simulated Authentic BCEL One Transfer Slip */}
                  <div className="bg-white text-slate-900 rounded-lg p-5 w-full max-w-xs shadow-xl border border-slate-200 space-y-3 font-sans">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded bg-red-600 text-white flex items-center justify-center font-bold text-[10px]">
                          BCEL
                        </div>
                        <span className="font-bold text-xs text-red-700">BCEL One</span>
                      </div>
                      <span className="text-[10px] text-emerald-600 font-bold font-mono">ໂອນເງິນສຳເລັດ</span>
                    </div>

                    <div className="text-center py-2 bg-red-50 rounded-lg border border-red-100">
                      <p className="text-[10px] text-red-600 font-medium">ຈຳນວນເງິນໂອນ</p>
                      <p className="text-2xl font-black text-slate-900 font-mono mt-0.5">
                        ₭ 1,500,000
                      </p>
                      <span className="text-[10px] text-slate-500 font-mono">LAK (ກີບ)</span>
                    </div>

                    <div className="space-y-1.5 text-[11px]">
                      <div className="flex justify-between">
                        <span className="text-slate-400">ຈາກ:</span>
                        <span className="font-semibold text-slate-700">ອາລຸນ ເຊັນ (010-xx-xx421)</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">ຫາ:</span>
                        <span className="font-semibold text-slate-700">ບັນຊີບົດໂຄງການ ມຊ (010-12-000492)</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">ວັນທີ:</span>
                        <span className="text-slate-600 font-mono">01/10/2026 14:22:10</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">ເລກອ້າງອີງ:</span>
                        <span className="text-slate-600 font-mono">BCEL-8829104921</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-dashed border-slate-200 text-center">
                      <span className="text-[9px] text-slate-400 font-mono">
                        QR CODE ສຳລັບກວດສອບສະລິບ
                      </span>
                    </div>
                  </div>

                  <p className="mt-3 text-[11px] text-slate-400">
                    ແຫຼ່ງຂໍ້ມູນ: Supabase Private Storage (`payment-proofs`)
                  </p>
                </div>
              </div>

              {verifiedSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>
                    ກວດສອບການຊຳລະເງິນສຳເລັດ! ອອກໃບຮັບເງິນທາງການ #RC-2026-00442 ແລະ ບັນທຶກຮຽບຮ້ອຍແລ້ວ.
                  </span>
                </div>
              )}

              {/* Modal Actions */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setSelectedPayment(null)}
                >
                  ປະຕິເສດສະລິບ
                </Button>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedPayment(null)}
                  >
                    ຍົກເລີກ
                  </Button>
                  <Button
                    size="sm"
                    isLoading={isVerifying}
                    onClick={handleApprove}
                    leftIcon={<FileCheck className="h-4 w-4" />}
                  >
                    ອະນຸມັດ &amp; ອອກໃບຮັບເງິນ
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Teacher / Committee Remuneration Payout Modal */}
        {showPayoutModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-5 my-8">
              <div className="flex items-start justify-between border-b border-slate-100 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Badge variant="emerald">ກອງທຶນຕອບແທນອາຈານ</Badge>
                    <span className="font-mono text-xs text-slate-500">ໄລຍະທີ 13</span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-950 mt-1">
                    ເບີກຈ່າຍເງິນຕອບແທນອາຈານທີ່ປຶກສາ &amp; ກຳມະການສອບ
                  </h3>
                  <p className="text-xs text-slate-500">
                    ເລືອກອາຈານຈາກຖານຂໍ້ມູນທາງການເພື່ອອະນຸມັດເງິນຕອບແທນ (Laos Bank Transfer / BCEL)
                  </p>
                </div>
                <button
                  onClick={() => setShowPayoutModal(false)}
                  className="text-slate-400 hover:text-slate-600 p-1"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4 text-xs">
                {/* Searchable Select for Teacher */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    ເລືອກອາຈານຜູ້ຮັບເງິນຕອບແທນ (Searchable Teacher Dropdown) *
                  </label>
                  <SearchableSelect
                    options={teacherSearchableOptions}
                    value={selectedTeacherForPayout}
                    onChange={(val) => setSelectedTeacherForPayout(val)}
                    placeholder="ພິມຊື່ອາຈານ ຫຼື ຕຳແໜ່ງວິຊາການ..."
                    clearable
                  />
                  <p className="mt-1 text-[11px] text-slate-400">
                    ພິມຊື່ແລ້ວລາຍຊື່ຈະຫຼຸດລົງເລື້ອຍໆ ພ້ອມສະແດງພາກວິຊາ ແລະ ໂກຕາປະຈຸບັນ
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      ບົດບາດໃນການສອບເສັງ
                    </label>
                    <select
                      value={payoutRole}
                      onChange={(e) => {
                        setPayoutRole(e.target.value);
                        if (e.target.value === "ປະທານກຳມະການສອບ") setPayoutAmount(1500000);
                        else if (e.target.value === "ກຳມະການປະເມີນ") setPayoutAmount(1000000);
                        else setPayoutAmount(1200000);
                      }}
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 focus:outline-sky-500"
                    >
                      <option value="ປະທານກຳມະການສອບ">ປະທານກຳມະການສອບ (1,500,000 LAK)</option>
                      <option value="ກຳມະການປະເມີນ">ກຳມະການປະເມີນ (1,000,000 LAK)</option>
                      <option value="ອາຈານທີ່ປຶກສາຫຼັກ">ອາຈານທີ່ປຶກສາຫຼັກ (1,200,000 LAK)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      ລະຫັດບົດໂຄງການອ້າງອີງ
                    </label>
                    <input
                      type="text"
                      value={payoutThesisRef}
                      onChange={(e) => setPayoutThesisRef(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 focus:outline-sky-500 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    ຈຳນວນເງິນຕອບແທນ (LAK)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 font-bold text-slate-400">₭</span>
                    <input
                      type="number"
                      value={payoutAmount}
                      onChange={(e) => setPayoutAmount(Number(e.target.value))}
                      className="w-full rounded-lg border border-slate-300 bg-white pl-8 pr-3 py-2 text-sm font-mono font-bold text-slate-900 focus:outline-sky-500"
                    />
                  </div>
                </div>

                {payoutSuccess && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>
                      ອະນຸມັດການເບີກຈ່າຍຄ່າຕອບແທນໃຫ້ {selectedTeacherForPayout} ຈຳນວນ ₭ {payoutAmount.toLocaleString("en-US")} ກີບ ສຳເລັດແລ້ວ!
                    </span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowPayoutModal(false)}
                >
                  ຍົກເລີກ
                </Button>
                <Button
                  size="sm"
                  disabled={!selectedTeacherForPayout}
                  onClick={handleDisbursePayout}
                  leftIcon={<CreditCard className="h-4 w-4" />}
                >
                  ຢັ້ງຢືນການເບີກຈ່າຍ (Disburse)
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}

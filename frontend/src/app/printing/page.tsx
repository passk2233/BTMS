"use client";

import React, { useState } from "react";
import {
  Printer,
  Plus,
  Clock,
  CheckCircle,
  Truck,
  BookOpen,
  DollarSign,
  Package,
  Layers,
  Sparkles,
  Search,
} from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Badge, BadgeVariant } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { studentSearchableOptions, StudentRecord } from "@/lib/academic-directory";

interface PrintOrder {
  id: string;
  orderNo: string;
  thesisCode: string;
  thesisTitle: string;
  studentName: string;
  copies: number;
  totalPages: number;
  colorPages: number;
  bindingStyle: "ປົກແຂງ (ປ້ຳຄຳ)" | "ປົກອ່ອນ (ກາວຮ້ອນ)" | "ເຂົ້າສັນກະດູກງູ";
  totalCost: number;
  stage: "QUEUED" | "PRINTING" | "BINDING" | "READY";
  stageLabel: string;
  badgeVariant: BadgeVariant;
  orderedAt: string;
}

const initialOrders: PrintOrder[] = [
  {
    id: "PO-101",
    orderNo: "PR-2026-001",
    thesisCode: "CS-2026-001",
    thesisTitle: "ລະບົບກວດຈັບຮອຍຮົ່ວທໍ່ສົ່ງອາຍແກັສດ້ວຍໂດຣນອັດຕະໂນມັດ",
    studentName: "ອາລຸນ ເຊັນ (65010042)",
    copies: 5,
    totalPages: 120,
    colorPages: 25,
    bindingStyle: "ປົກແຂງ (ປ້ຳຄຳ)",
    totalCost: 925000,
    stage: "BINDING",
    stageLabel: "ກຳລັງເຂົ້າຮູບເຫຼັ້ມ",
    badgeVariant: "amber",
    orderedAt: "ມື້ວານນີ້, 11:20",
  },
  {
    id: "PO-102",
    orderNo: "PR-2026-002",
    thesisCode: "CS-2026-002",
    thesisTitle: "ການຈຳແນກອາລົມຈາກສັນຍານຄື້ນສະໝອງ EEG",
    studentName: "ນິລັນ ເດຊາ (65010190)",
    copies: 3,
    totalPages: 95,
    colorPages: 15,
    bindingStyle: "ປົກແຂງ (ປ້ຳຄຳ)",
    totalCost: 547500,
    stage: "PRINTING",
    stageLabel: "ກຳລັງພິມ",
    badgeVariant: "sky",
    orderedAt: "ມື້ນີ້, 08:45",
  },
  {
    id: "PO-103",
    orderNo: "PR-2026-003",
    thesisCode: "CS-2025-089",
    thesisTitle: "ລະບົບບັນຊີແຈກຢາຍແບບກະຈາຍສູນ",
    studentName: "ທະນັດ ລ. (64010502)",
    copies: 5,
    totalPages: 140,
    colorPages: 30,
    bindingStyle: "ປົກແຂງ (ປ້ຳຄຳ)",
    totalCost: 1050000,
    stage: "READY",
    stageLabel: "ພ້ອມຮັບເຫຼັ້ມແລ້ວ",
    badgeVariant: "emerald",
    orderedAt: "28 ກ.ຍ., 14:00",
  },
  {
    id: "PO-104",
    orderNo: "PR-2026-004",
    thesisCode: "CS-2026-003",
    thesisTitle: "ລະບົບສັນຍາອັດສະລິຍະເພື່ອຕິດຕາມຕ່ອງໂສ້ອຸປະທານອາຫານ",
    studentName: "ທະນະວັດ ສ. (65010301)",
    copies: 2,
    totalPages: 80,
    colorPages: 10,
    bindingStyle: "ປົກອ່ອນ (ກາວຮ້ອນ)",
    totalCost: 170000,
    stage: "QUEUED",
    stageLabel: "ລໍຖ້າຄິວພິມ",
    badgeVariant: "slate",
    orderedAt: "ມື້ນີ້, 10:15",
  },
];

export default function PrintingManagementPage() {
  const [orders, setOrders] = useState<PrintOrder[]>(initialOrders);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [orderSearch, setOrderSearch] = useState("");

  // Student selection state for print order
  const [selectedStudentId, setSelectedStudentId] = useState("FS-CS-2022-001");
  const [selectedStudentName, setSelectedStudentName] = useState("ທ້າວ ສົມພອນ ແກ້ວມະນີ (FS-CS-2022-001)");
  const [selectedThesisCode, setSelectedThesisCode] = useState("CS-2026-001");
  const [selectedThesisTitle, setSelectedThesisTitle] = useState("ລະບົບກວດຈັບຮອຍຮົ່ວທໍ່ສົ່ງອາຍແກັສດ້ວຍໂດຣນອັດຕະໂນມັດ");

  // New order calculator state in Lao Kip
  const [copies, setCopies] = useState(3);
  const [totalPages, setTotalPages] = useState(100);
  const [colorPages, setColorPages] = useState(20);
  const [bindingType, setBindingType] = useState<"hardcover" | "softcover">("hardcover");

  const bwPages = Math.max(0, totalPages - colorPages);
  const bindingCostPerCopy = bindingType === "hardcover" ? 75000 : 25000;
  const printCostPerCopy = bwPages * 500 + colorPages * 2500;
  const calculatedTotal = (printCostPerCopy + bindingCostPerCopy) * copies;

  const filteredOrders = orders.filter((o) => {
    if (!orderSearch) return true;
    const q = orderSearch.toLowerCase();
    return (
      o.studentName.toLowerCase().includes(q) ||
      o.thesisTitle.toLowerCase().includes(q) ||
      o.thesisCode.toLowerCase().includes(q) ||
      o.orderNo.toLowerCase().includes(q)
    );
  });

  const advanceStage = (orderId: string) => {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id !== orderId) return o;
        if (o.stage === "QUEUED")
          return { ...o, stage: "PRINTING", stageLabel: "ກຳລັງພິມ", badgeVariant: "sky" };
        if (o.stage === "PRINTING")
          return { ...o, stage: "BINDING", stageLabel: "ກຳລັງເຂົ້າຮູບເຫຼັ້ມ", badgeVariant: "amber" };
        if (o.stage === "BINDING")
          return { ...o, stage: "READY", stageLabel: "ພ້ອມຮັບເຫຼັ້ມແລ້ວ", badgeVariant: "emerald" };
        return o;
      })
    );
  };

  const kanbanColumns = [
    { id: "QUEUED", title: "1. ລໍຖ້າຄິວພິມ", icon: Clock, badgeVariant: "slate" as const },
    { id: "PRINTING", title: "2. ກຳລັງພິມ", icon: Printer, badgeVariant: "sky" as const },
    { id: "BINDING", title: "3. ເຂົ້າຮູບເຫຼັ້ມ & ປ້ຳຄຳ", icon: Layers, badgeVariant: "amber" as const },
    { id: "READY", title: "4. ພ້ອມຮັບເຫຼັ້ມແລ້ວ", icon: CheckCircle, badgeVariant: "emerald" as const },
  ];

  return (
    <AppShell>
      <div className="space-y-6 font-sans">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-6">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-950">
                ຄຸ້ມຄອງການພິມບົດ ແລະ ເຂົ້າຮູບເຫຼັ້ມ (Printing &amp; Press)
              </h1>
              <Badge variant="sky">ໂຮງພິມພວມດຳເນີນງານ</Badge>
            </div>
            <p className="mt-1 text-sm text-slate-500">
              ຄຳນວນລາຄາພິມບົດ ແລະ ເຂົ້າຮູບເຫຼັ້ມປົກແຂງປ້ຳຄຳຕາມມາດຕະຖານ, ຕິດຕາມຄິວພິມ ແລະ ຢືນຢັນການສົ່ງມອບບົດ.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={() => setShowOrderModal(true)}
              leftIcon={<Plus className="h-4 w-4" />}
            >
              ສັ່ງພິມບົດໃໝ່
            </Button>
          </div>
        </div>

        {/* 4 Printing Stat Cards in Lao Kip */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <StatCard
            title="ຈຳນວນເຫຼັ້ມທີ່ພິມແລ້ວ"
            value="148 ເຫຼັ້ມ"
            change="ສົກຮຽນ 2026"
            trend="up"
            description="ເຫຼັ້ມປົກແຂງປ້ຳຄຳມາດຕະຖານ"
            icon={<BookOpen className="h-5 w-5" />}
          />
          <StatCard
            title="ຄິວພິມທີ່ກຳລັງແລ່ນ"
            value="4 ລາຍການ"
            change="ກຳລັງພິມເທິງເຄື່ອງ #2"
            trend="neutral"
            description="ປະມານເວລາ: 3.5 ຊົ່ວໂມງ"
            icon={<Printer className="h-5 w-5" />}
          />
          <StatCard
            title="ກຳລັງເຂົ້າຮູບເຫຼັ້ມ & ປ້ຳຄຳ"
            value="1 ຊຸດ"
            change="ປ້ຳຟອຍຄຳປົກແຂງ"
            trend="neutral"
            description="ສະບັບຫໍສະໝຸດ ແລະ ພາກວິຊາ"
            icon={<Layers className="h-5 w-5" />}
          />
          <StatCard
            title="ພ້ອມຮັບເຫຼັ້ມແລ້ວ"
            value="1 ລາຍການ"
            change="ແຈ້ງເຕືອນນັກສຶກສາແລ້ວ"
            trend="up"
            description="ລໍຖ້ານັກສຶກສາມາຮັບເຫຼັ້ມ"
            icon={<Package className="h-5 w-5" />}
          />
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center gap-2 flex-1 max-w-md bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
            <Search className="h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="ຄົ້ນຫາຕາມເລກບິນ, ລະຫັດບົດ ຫຼື ຊື່ນັກສຶກສາ..."
              value={orderSearch}
              onChange={(e) => setOrderSearch(e.target.value)}
              className="bg-transparent text-xs text-slate-800 placeholder-slate-400 focus:outline-none w-full"
            />
          </div>

          <div className="w-full sm:w-72">
            <SearchableSelect
              options={studentSearchableOptions}
              value={orderSearch}
              onChange={(val, opt) => {
                const s = opt?.metadata as StudentRecord | undefined;
                if (s?.name) {
                  setOrderSearch(s.name);
                } else {
                  setOrderSearch(val);
                }
              }}
              placeholder="-- ເລືອກນັກສຶກສາເພື່ອຄົ້ນຫາ --"
              searchPlaceholder="ພິມລະຫັດ, ຊື່..."
              allowCustom={true}
              customPlaceholder="+ ຄົ້ນຫາ:"
            />
          </div>
        </div>

        {/* Production Kanban Board in Lao */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-slate-900">ຂັ້ນຕອນການຜະລິດ (Kanban Pipeline)</h2>
            <span className="text-xs text-slate-500">ຄລິກ &apos;ເລື່ອນຂັ້ນຕອນ&apos; ເພື່ອອັບເດດສະຖານະ</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {kanbanColumns.map((col) => {
              const colOrders = filteredOrders.filter((o) => o.stage === col.id);
              const ColIcon = col.icon;

              return (
                <div key={col.id} className="bg-slate-100/70 p-3.5 rounded-xl border border-slate-200 flex flex-col justify-between min-h-[450px]">
                  <div>
                    {/* Column Header */}
                    <div className="flex items-center justify-between pb-3 border-b border-slate-200/80 mb-3">
                      <div className="flex items-center gap-2">
                        <ColIcon className="h-4 w-4 text-slate-600" />
                        <span className="text-xs font-bold text-slate-800">{col.title}</span>
                      </div>
                      <span className="h-5 w-5 rounded-full bg-slate-200 text-slate-700 text-[10px] font-bold flex items-center justify-center">
                        {colOrders.length}
                      </span>
                    </div>

                    {/* Orders in Column */}
                    <div className="space-y-3">
                      {colOrders.map((order) => (
                        <div
                          key={order.id}
                          className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:shadow-sm transition-all space-y-2 text-xs"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-mono font-bold text-sky-700">{order.orderNo}</span>
                            <Badge variant={order.badgeVariant}>{order.stageLabel}</Badge>
                          </div>

                          <h4 className="font-bold text-slate-900 line-clamp-2">
                            {order.thesisTitle}
                          </h4>
                          <p className="text-[11px] text-slate-500">{order.studentName}</p>

                          <div className="pt-2 border-t border-slate-100 text-[11px] space-y-1 text-slate-600">
                            <div className="flex justify-between">
                              <span>ລາຍລະອຽດ:</span>
                              <span className="font-medium text-slate-800">
                                {order.copies} ເຫຼັ້ມ • {order.totalPages} ໜ້າ ({order.colorPages} ໜ້າສີ)
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>ຮູບເຫຼັ້ມ:</span>
                              <span className="font-medium text-slate-800 truncate max-w-[120px]">
                                {order.bindingStyle}
                              </span>
                            </div>
                            <div className="flex justify-between font-mono font-bold text-slate-900 pt-1">
                              <span>ລວມມູນຄ່າ:</span>
                              <span>₭ {order.totalCost.toLocaleString()} LAK</span>
                            </div>
                          </div>

                          {order.stage !== "READY" && (
                            <Button
                              onClick={() => advanceStage(order.id)}
                              variant="outline"
                              size="sm"
                              className="w-full text-xs h-7 mt-2"
                            >
                              ເລື່ອນຂັ້ນຕອນ ➔
                            </Button>
                          )}
                          {order.stage === "READY" && (
                            <div className="pt-2 text-center text-emerald-600 font-semibold text-[11px] flex items-center justify-center gap-1">
                              <CheckCircle className="h-3.5 w-3.5" /> ພ້ອມສົ່ງມອບແລ້ວ
                            </div>
                          )}
                        </div>
                      ))}

                      {colOrders.length === 0 && (
                        <div className="py-12 text-center text-slate-400 text-xs">
                          ບໍ່ມີລາຍການໃນຂັ້ນຕອນນີ້
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* New Print Order Cost Calculator Modal in Lao */}
        {showOrderModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 my-8">
              <div className="flex items-start justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-lg font-bold text-slate-950">ສັ່ງພິມບົດໂຄງການຈົບຊັ້ນ</h3>
                  <p className="text-xs text-slate-500">ຄຳນວນລາຄາອັດຕະໂນມັດຕາມອັດຕາມາດຕະຖານຂອງໂຮງພິມ</p>
                </div>
                <button onClick={() => setShowOrderModal(false)} className="text-slate-400 hover:text-slate-600">
                  ✕
                </button>
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    ເລືອກນັກສຶກສາ / ບົດໂຄງການ (Searchable Dropdown)
                  </label>
                  <SearchableSelect
                    options={studentSearchableOptions}
                    value={selectedStudentId}
                    onChange={(val, opt) => {
                      setSelectedStudentId(val);
                      const s = opt?.metadata as StudentRecord | undefined;
                      if (s) {
                        setSelectedStudentName(`${s.name} (${s.studentId})`);
                        setSelectedThesisTitle(`ບົດໂຄງການຈົບຊັ້ນ: ລະບົບຄຸ້ມຄອງຂໍ້ມູນຂອງ ${s.name}`);
                        setSelectedThesisCode(s.studentId && s.studentId.includes("FS-CS") ? "CS-2026-001" : "IT-2026-002");
                      } else {
                        setSelectedStudentName(val);
                      }
                    }}
                    placeholder="-- ຄົ້ນຫາ ແລະ ເລືອກນັກສຶກສາ --"
                    searchPlaceholder="ພິມລະຫັດ, ຊື່ ຫຼື ຫ້ອງຮຽນ..."
                    allowCustom={true}
                    customPlaceholder="+ ປ້ອນຊື່ນັກສຶກສາ:"
                  />
                  {selectedStudentName && (
                    <div className="mt-1.5 p-2 bg-slate-50 rounded-lg border border-slate-200 text-[11px] text-slate-600 space-y-0.5">
                      <div><span className="font-semibold text-slate-800">ນັກສຶກສາ:</span> {selectedStudentName}</div>
                      <div><span className="font-semibold text-slate-800">ລະຫັດບົດ:</span> {selectedThesisCode}</div>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">ຈຳນວນເຫຼັ້ມ</label>
                    <input
                      type="number"
                      min={1}
                      max={10}
                      value={copies}
                      onChange={(e) => setCopies(parseInt(e.target.value) || 1)}
                      className="w-full border border-slate-300 rounded-lg p-2 text-slate-800 text-center font-bold"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">ຈຳນວນໜ້າທັງໝົດ</label>
                    <input
                      type="number"
                      min={10}
                      max={500}
                      value={totalPages}
                      onChange={(e) => setTotalPages(parseInt(e.target.value) || 10)}
                      className="w-full border border-slate-300 rounded-lg p-2 text-slate-800 text-center font-bold"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">ຈຳນວນໜ້າສີ</label>
                    <input
                      type="number"
                      min={0}
                      max={totalPages}
                      value={colorPages}
                      onChange={(e) => setColorPages(parseInt(e.target.value) || 0)}
                      className="w-full border border-slate-300 rounded-lg p-2 text-slate-800 text-center font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">ຮູບແບບການເຂົ້າຮູບເຫຼັ້ມ</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setBindingType("hardcover")}
                      className={`p-3 rounded-lg border text-left transition ${
                        bindingType === "hardcover"
                          ? "border-sky-500 bg-sky-50/50 ring-2 ring-sky-200"
                          : "border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      <p className="font-bold text-slate-900">ປົກແຂງ (ປ້ຳຄຳ)</p>
                      <p className="text-[11px] text-slate-500">ປ້ຳຟອຍຄຳມາດຕະຖານ • ₭75,000/ເຫຼັ້ມ</p>
                    </button>
                    <button
                      type="button"
                      onClick={() => setBindingType("softcover")}
                      className={`p-3 rounded-lg border text-left transition ${
                        bindingType === "softcover"
                          ? "border-sky-500 bg-sky-50/50 ring-2 ring-sky-200"
                          : "border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      <p className="font-bold text-slate-900">ປົກອ່ອນ (ກາວຮ້ອນ)</p>
                      <p className="text-[11px] text-slate-500">ເຂົ້າຮູບເຫຼັ້ມກາວຮ້ອນ • ₭25,000/ເຫຼັ້ມ</p>
                    </button>
                  </div>
                </div>

                {/* Real-time Calculation Summary in Lao Kip */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex justify-between text-slate-600">
                    <span>ຄ່າພິມໜ້າຂາວດຳ ({bwPages} ໜ້າ × ₭500 × {copies} ເຫຼັ້ມ):</span>
                    <span className="font-mono">₭ {(bwPages * 500 * copies).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>ຄ່າພິມໜ້າສີ ({colorPages} ໜ້າ × ₭2,500 × {copies} ເຫຼັ້ມ):</span>
                    <span className="font-mono">₭ {(colorPages * 2500 * copies).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>ຄ່າເຂົ້າຮູບເຫຼັ້ມ ({copies} ເຫຼັ້ມ × ₭{bindingCostPerCopy.toLocaleString()}):</span>
                    <span className="font-mono">₭ {(bindingCostPerCopy * copies).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between font-bold text-slate-900 text-sm pt-2 border-t border-slate-200">
                    <span>ຍອດລວມຄຳນວນທັງໝົດ:</span>
                    <span className="font-mono text-sky-700 text-base">₭ {calculatedTotal.toLocaleString("en-US")} LAK</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <Button variant="outline" size="sm" onClick={() => setShowOrderModal(false)}>
                  ຍົກເລີກ
                </Button>
                <Button
                  size="sm"
                  onClick={() => {
                    const newOrder: PrintOrder = {
                      id: `PO-${Date.now()}`,
                      orderNo: `PR-2026-00${orders.length + 1}`,
                      thesisCode: selectedThesisCode,
                      thesisTitle: selectedThesisTitle,
                      studentName: selectedStudentName,
                      copies,
                      totalPages,
                      colorPages,
                      bindingStyle: bindingType === "hardcover" ? "ປົກແຂງ (ປ້ຳຄຳ)" : "ປົກອ່ອນ (ກາວຮ້ອນ)",
                      totalCost: calculatedTotal,
                      stage: "QUEUED",
                      stageLabel: "ລໍຖ້າຄິວພິມ",
                      badgeVariant: "slate",
                      orderedAt: "ເມື່ອກີ້ນີ້",
                    };
                    setOrders([newOrder, ...orders]);
                    setShowOrderModal(false);
                  }}
                  leftIcon={<Printer className="h-4 w-4" />}
                >
                  ຢືນຢັນ ແລະ ສົ່ງເຂົ້າຄິວພິມ
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}

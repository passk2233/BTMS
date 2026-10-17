"use client";

import React, { useState } from "react";
import {
  BarChart3,
  Download,
  FileSpreadsheet,
  FileText,
  Filter,
  Calendar,
  CheckCircle,
  PieChart,
  TrendingUp,
  Receipt,
  Users,
  Printer,
} from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { OfficialThesisReport, OfficialGroupRecord } from "@/components/reports/official-thesis-report";
import { SearchableSelect, SearchableOption } from "@/components/ui/searchable-select";
import { teacherSearchableOptions, studentSearchableOptions } from "@/lib/academic-directory";

const officialRosterRecords: OfficialGroupRecord[] = [
  {
    groupNo: 1,
    classroom: "2IT-CON",
    topicLao: "ລະບົບຈັດການເອກະສານຂອງສາຍການບິນລາວ",
    advisor: "ທ່ານ ຮສ. ຫາ ບຸນທັນ",
    members: [
      { index: 1, name: "ແຮັກເຕ້ ແສງສະຫວ່າງ", classroom: "2IT-CON" },
      { index: 2, name: "ບຸນທະວີ ວໍລະລາດ", classroom: "2IT-CON" },
      { index: 3, name: "ສົມພົງ ສີສຸລາດ", classroom: "2IT-CON", isPreviousGen: true, note: "ນັກສຶກສາຕົກຮຸ່ນ" },
    ],
  },
  {
    groupNo: 2,
    classroom: "4IT1",
    topicLao: "ປັບປຸງ ແລະ ພັດທະນາລະບົບ AMS ໃນການຈັດການຂໍ້ມູນພາກວິຊາ",
    advisor: "ທ່ານ ຮສ. ຫາ ບຸນທັນ",
    members: [
      { index: 1, name: "ນາງ ວິໄລຄຳ ບຸນສີລົດ", classroom: "4IT1" },
      { index: 2, name: "ທ້າວ ເພັດສະໝອນ ສີສັມຫວັງ", classroom: "4IT1" },
      { index: 3, name: "ນາງ ສຸກສາຄອນ ໄຊຍະວົງ", classroom: "4IT1" },
    ],
  },
  {
    groupNo: 3,
    classroom: "4IT1 / 4IT2",
    topicLao: "ລະບົບຈັດການຮ້ານຂາຍເຄື່ອງສຳອາງຂອງຮ້ານ Anika beauty shop",
    advisor: "ທ່ານ ຮສ. ຫາ ບຸນທັນ",
    members: [
      { index: 1, name: "ທ້າວ ເກມ ຂຸນປະເສີດ", classroom: "4IT1" },
      { index: 2, name: "ທ້າວ ທະນາທອນ ສີສົງຄາມ", classroom: "4IT2" },
      { index: 3, name: "ທ້າວ ທັນມະກອນ ບູລົມມະວົງ", classroom: "4IT1", isPreviousGen: true, note: "ນັກສຶກສາຕົກຮຸ່ນ" },
    ],
  },
  {
    groupNo: 4,
    classroom: "4IT3",
    topicLao: "ລະບົບຈັດການການໃຊ້ໄຟຟ້າໃນຫ້ອງແຖວ (ກໍລະນີສຶກສາ)",
    advisor: "ທ່ານ ຮສ. ຫາ ບຸນທັນ",
    members: [
      { index: 1, name: "ນາງ ພອຍໄພລິນ ໄຊຍະລາດ", classroom: "4IT3" },
      { index: 2, name: "ທ້າວ ກໍດຳ ອິນທະໂສມ", classroom: "4IT2" },
      { index: 3, name: "ທ້າວ ໄນຮ່ອນ ພະມີໄຊ", classroom: "4IT3" },
    ],
  },
  {
    groupNo: 5,
    classroom: "4Com3",
    topicLao: "ລະບົບຈັດການຂໍ້ມູນບໍລິການເຊົ່າລົດຈັກ-ລົດຖີບ",
    advisor: "ທ່ານ ຮສ. ຫາ ບຸນທັນ",
    members: [
      { index: 1, name: "ທ້າວ ຫຼ້າແກ້ວ ແສງວາລຸນ", classroom: "4Com3" },
      { index: 2, name: "ນາງ ທິບພະຈັນ ທຳມະວົງ", classroom: "4Com3" },
      { index: 3, name: "ນາງ ວົງມະນີ ລາບບັນດິດ", classroom: "4Com3" },
    ],
  },
  {
    groupNo: 6,
    classroom: "2it_con2",
    topicLao: "ອະນິເມຊັ່ນ (ຜົນກະທົບຂອງການຖິ້ມຂີ້ເຫຍື້ອຊະຊາຍ)",
    advisor: "ທ່ານ ຮສ. ຫາ ບຸນທັນ",
    members: [
      { index: 1, name: "ນາງ ວິໄລພອນ ໄຊຍະແສງ", classroom: "2it_con2" },
      { index: 2, name: "ທ້າວ ໄຊຊະນະ ມະນີວົງ", classroom: "2it_con1", isPreviousGen: true, note: "ນັກສຶກສາຕົກຮຸ່ນ" },
      { index: 3, name: "ນາງ ດາລິສອນ ສີຫາບາດ", classroom: "2it_con2" },
    ],
  },
];

export default function ReportsAnalyticsPage() {
  const [selectedReportType, setSelectedReportType] = useState<
    "OFFICIAL_ROSTER" | "ACADEMIC" | "FINANCIAL" | "COMMITTEE"
  >("OFFICIAL_ROSTER");
  const [exportNotice, setExportNotice] = useState<string | null>(null);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [selectedAdvisor, setSelectedAdvisor] = useState("");
  const [selectedStudent, setSelectedStudent] = useState("");

  // Extract advisor and student options for SearchableSelect
  const rosterAdvisorOptions = React.useMemo<SearchableOption[]>(() => {
    const map = new Map<string, SearchableOption>();
    teacherSearchableOptions.forEach((t) => map.set(t.value, t));
    officialRosterRecords.forEach((r) => {
      if (r.advisor && !map.has(r.advisor)) {
        map.set(r.advisor, {
          value: r.advisor,
          label: r.advisor,
          subLabel: "ອາຈານທີ່ປຶກສາບົດໂຄງການ",
        });
      }
    });
    return Array.from(map.values());
  }, []);

  const rosterStudentOptions = React.useMemo<SearchableOption[]>(() => {
    const map = new Map<string, SearchableOption>();
    studentSearchableOptions.forEach((s) => map.set(s.value, s));
    officialRosterRecords.forEach((r) => {
      r.members.forEach((m) => {
        const val = m.name;
        if (!map.has(val)) {
          map.set(val, {
            value: m.name,
            label: m.name,
            subLabel: `ກຸ່ມ ${r.groupNo} • ຫ້ອງ ${m.classroom || r.classroom}`,
            badge: m.isPreviousGen ? "ຕົກຮຸ່ນ" : undefined,
            badgeVariant: m.isPreviousGen ? "amber" : undefined,
          });
        }
      });
    });
    return Array.from(map.values());
  }, []);

  const filteredRosterRecords = React.useMemo(() => {
    return officialRosterRecords.filter((group) => {
      if (selectedAdvisor && !group.advisor.toLowerCase().includes(selectedAdvisor.toLowerCase())) {
        return false;
      }
      if (selectedStudent) {
        const hasMember = group.members.some(
          (m) =>
            m.name.toLowerCase().includes(selectedStudent.toLowerCase()) ||
            (m.studentId && m.studentId.includes(selectedStudent))
        );
        if (!hasMember) return false;
      }
      return true;
    });
  }, [selectedAdvisor, selectedStudent]);

  const triggerExport = (format: string) => {
    setExportNotice(`ກຳລັງສ້າງ ແລະ ດາວໂຫຼດລາຍງານຮູບແບບ ${format.toUpperCase()}...`);
    setTimeout(() => {
      setExportNotice(null);
    }, 2500);
  };

  const academicDataLao = [
    { stage: "ສະເໜີຫົວຂໍ້ບົດໂຄງການ", count: 8, percentage: "16.7%", badgeVariant: "sky" as const },
    { stage: "ອາຈານກວດສອບ & ສົ່ງປັບປຸງ", count: 4, percentage: "8.3%", badgeVariant: "amber" as const },
    { stage: "ກຳນົດສອບປ້ອງກັນໂຄງຮ່າງ", count: 6, percentage: "12.5%", badgeVariant: "violet" as const },
    { stage: "ຜ່ານໂຄງຮ່າງ (ພວມພັດທະນາ)", count: 22, percentage: "45.8%", badgeVariant: "emerald" as const },
    { stage: "ກຽມສອບປ້ອງກັນບົດຈົບຊັ້ນ", count: 5, percentage: "10.4%", badgeVariant: "sky" as const },
    { stage: "ສຳເລັດສົມບູນ & ເກັບເຂົ້າຄັງ", count: 3, percentage: "6.3%", badgeVariant: "slate" as const },
  ];

  const financialDataLao = [
    { category: "ຄ່າທຳນຽມສອບປ້ອງກັນໂຄງຮ່າງ", collected: "₭ 72,000,000", pending: "₭ 9,000,000", target: "₭ 81,000,000" },
    { category: "ຄ່າທຳນຽມສອບປ້ອງກັນບົດຈົບຊັ້ນ", collected: "₭ 96,000,000", pending: "₭ 18,000,000", target: "₭ 114,000,000" },
    { category: "ຄ່າພິມບົດ ແລະ ເຂົ້າຮູບເຫຼັ້ມປົກແຂງ", collected: "₭ 46,500,000", pending: "₭ 4,200,000", target: "₭ 50,700,000" },
  ];

  const committeeDisbursementsLao = [
    { role: "ປະທານກຳມະການສອບ", rate: "₭ 1,500,000 / ຄະນະ", disbursed: "₭ 45,000,000", pending: "₭ 15,000,000" },
    { role: "ກຳມະການຮ່ວມ (ຜູ້ປະເມີນ)", rate: "₭ 1,000,000 / ທ່ານ", disbursed: "₭ 60,000,000", pending: "₭ 20,000,000" },
    { role: "ຊ່ຽວຊານວິຊາການພາຍນອກ", rate: "₭ 1,200,000 / ທ່ານ", disbursed: "₭ 24,000,000", pending: "₭ 12,000,000" },
  ];

  return (
    <AppShell>
      <div className="space-y-6 font-sans">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-6">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-950 font-lao">
                ລາຍງານ ແລະ ສະຖິຕິວິຊາການ (Reports &amp; Analytics)
              </h1>
              <Badge variant="sky">ກວດສອບໄດ້ 100%</Badge>
            </div>
            <p className="mt-1 text-sm text-slate-500 font-lao">
              ຕາຕະລາງລາຍຊື່ຫົວຂໍ້ບົດທາງການ (ຮອງຮັບຕ່າງຫ້ອງ ແລະ ຕົກຮຸ່ນ), ສະຖິຕິບົດໂຄງການ, ແລະ ບັນຊີລາຍຮັບ-ລາຍຈ່າຍ.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              onClick={() => setShowPrintModal(true)}
              leftIcon={<Printer className="h-4 w-4" />}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-lao font-semibold shadow-sm"
            >
              ພິມລາຍງານທາງການ (Print Report)
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => triggerExport("excel")}
              leftIcon={<FileSpreadsheet className="h-4 w-4" />}
              className="font-lao"
            >
              Excel
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => triggerExport("pdf")}
              leftIcon={<FileText className="h-4 w-4" />}
              className="font-lao"
            >
              ດາວໂຫຼດ PDF
            </Button>
          </div>
        </div>

        {exportNotice && (
          <div className="p-3 bg-sky-50 border border-sky-200 rounded-xl text-sky-800 text-xs flex items-center gap-2 animate-in fade-in">
            <CheckCircle className="h-4 w-4 text-sky-600 shrink-0" />
            <span>{exportNotice}</span>
          </div>
        )}

        {/* 4 Report Summary KPIs in Lao */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 font-lao">
          <StatCard
            title="ອັດຕາການສອບປ້ອງກັນຜ່ານ"
            value="94.2%"
            change="+2.1% ທຽບກັບສົກກ່ອນ"
            trend="up"
            description="ເກຣດດີເລີດ (A/B): 82%"
            icon={<CheckCircle className="h-5 w-5" />}
          />
          <StatCard
            title="ຍອດລາຍຮັບຄ່າທຳນຽມລວມ"
            value="₭ 214,500,000"
            change="92% ຂອງເປົ້າໝາຍ"
            trend="up"
            description="ກວດສອບສະລິບຮຽບຮ້ອຍ"
            icon={<Receipt className="h-5 w-5" />}
          />
          <StatCard
            title="ກອງທຶນຕອບແທນກຳມະການ"
            value="₭ 129,000,000"
            change="ພ້ອມເບີກຈ່າຍຮອບທີ 13"
            trend="neutral"
            description="ສຳລັບອາຈານ 42 ທ່ານ"
            icon={<Users className="h-5 w-5" />}
          />
          <StatCard
            title="ເວລາເຮັດບົດສະເລ່ຍ"
            value="14.2 ອາທິດ"
            change="-1.5 ອາທິດ ໄວກວ່າເດີມ"
            trend="up"
            description="ຕັ້ງແຕ່ສະເໜີຈົນພິມເຫຼັ້ມແລ້ວ"
            icon={<TrendingUp className="h-5 w-5" />}
          />
        </div>

        {/* Report Selector Tabs in Lao */}
        <div className="flex border-b border-slate-200 gap-4 text-sm font-semibold overflow-x-auto font-lao">
          {(
            [
              { id: "OFFICIAL_ROSTER", label: "ແບບພິມທາງການ: ຕາຕະລາງຫົວຂໍ້ບົດ ແລະ ອາຈານ" },
              { id: "ACADEMIC", label: "ຄວາມຄືບໜ້າທາງວິຊາການ ແລະ ບົດໂຄງການ" },
              { id: "FINANCIAL", label: "ຄ່າທຳນຽມນັກສຶກສາ ແລະ ການຮັບເງິນ" },
              { id: "COMMITTEE", label: "ເງິນຕອບແທນຄະນະກຳມະການສອບເສັງ" },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedReportType(tab.id)}
              className={`pb-3 border-b-2 whitespace-nowrap transition-colors ${
                selectedReportType === tab.id
                  ? "border-emerald-600 text-emerald-800 font-bold"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Dynamic Report Content in Lao */}
        {selectedReportType === "OFFICIAL_ROSTER" && (
          <Card>
            <CardHeader className="border-b border-slate-100 pb-4 bg-slate-50/50">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <CardTitle className="text-base font-bold font-lao">
                    ຕາຕະລາງລາຍຊື່ນັກສຶກສາ, ຫົວຂໍ້ບົດໂຄງການຈົບຊັ້ນ ແລະ ອາຈານທີ່ປຶກສາ
                  </CardTitle>
                  <CardDescription className="font-lao">
                    ສົກສຶກສາ 2025 - 2026 • ພາກວິຊາວິສະວະກຳຄອມພິວເຕີ ແລະ ເຕັກໂນໂລຊີຂໍ້ມູນຂ່າວສານ
                  </CardDescription>
                </div>
                <Button
                  onClick={() => setShowPrintModal(true)}
                  leftIcon={<Printer className="h-4 w-4" />}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-lao text-xs"
                >
                  ເປີດໜ້າພິມທາງການ (Full Print View)
                </Button>
              </div>
            </CardHeader>

            <CardContent className="p-4 sm:p-6 overflow-x-auto font-lao space-y-4">
              {/* Searchable Select Filter Toolbar */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 shrink-0">
                  <Filter className="h-4 w-4 text-emerald-600" />
                  <span>ກັ່ນຕອງລາຍງານ:</span>
                </div>

                <div className="flex-1 min-w-[220px]">
                  <SearchableSelect
                    options={rosterAdvisorOptions}
                    value={selectedAdvisor}
                    onChange={(val) => setSelectedAdvisor(val)}
                    placeholder="ເລືອກອາຈານທີ່ປຶກສາ (Searchable)..."
                    clearable
                  />
                </div>

                <div className="flex-1 min-w-[220px]">
                  <SearchableSelect
                    options={rosterStudentOptions}
                    value={selectedStudent}
                    onChange={(val) => setSelectedStudent(val)}
                    placeholder="ເລືອກນັກສຶກສາ (Searchable)..."
                    clearable
                  />
                </div>

                {(selectedAdvisor || selectedStudent) && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setSelectedAdvisor("");
                      setSelectedStudent("");
                    }}
                    className="text-xs h-9 shrink-0 text-slate-600"
                  >
                    ລ້າງການກັ່ນຕອງ
                  </Button>
                )}

                <div className="text-xs text-slate-500 font-semibold shrink-0">
                  ພົບ {filteredRosterRecords.length} ກຸ່ມ
                </div>
              </div>

              {/* Exact 7-Column Table Layout */}
              <table
                className="w-full border-collapse text-xs sm:text-[13px] leading-snug"
                style={{
                  border: "1.5px solid #000000",
                  borderCollapse: "collapse",
                }}
              >
                <thead>
                  <tr style={{ height: "36px" }}>
                    <th
                      style={{
                        backgroundColor: "#b6d7a8",
                        border: "1px solid #000000",
                        width: "55px",
                        textAlign: "center",
                        fontWeight: "bold",
                        padding: "6px 4px",
                      }}
                    >
                      ກຸ່ມ
                    </th>
                    <th
                      colSpan={2}
                      style={{
                        backgroundColor: "#d9d9d9",
                        border: "1px solid #000000",
                        width: "210px",
                        textAlign: "center",
                        fontWeight: "bold",
                        padding: "6px 4px",
                      }}
                    >
                      ຊື່ ແລະ ນາມສະກຸນ
                    </th>
                    <th
                      style={{
                        backgroundColor: "#d9d9d9",
                        border: "1px solid #000000",
                        width: "85px",
                        textAlign: "center",
                        fontWeight: "bold",
                        padding: "6px 4px",
                      }}
                    >
                      ຫ້ອງ
                    </th>
                    <th
                      style={{
                        backgroundColor: "#d9d9d9",
                        border: "1px solid #000000",
                        textAlign: "center",
                        fontWeight: "bold",
                        padding: "6px 8px",
                      }}
                    >
                      ຊື່ຫົວຂໍ້
                    </th>
                    <th
                      style={{
                        backgroundColor: "#d9d9d9",
                        border: "1px solid #000000",
                        width: "165px",
                        textAlign: "center",
                        fontWeight: "bold",
                        padding: "6px 4px",
                      }}
                    >
                      ຊື່ອາຈານທີ່ປຶກສາ
                    </th>
                    <th
                      style={{
                        backgroundColor: "#d9d9d9",
                        border: "1px solid #000000",
                        width: "120px",
                        textAlign: "center",
                        fontWeight: "bold",
                        padding: "6px 4px",
                      }}
                    >
                      ໝາຍເຫດ
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredRosterRecords.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ border: "1px solid #000", textAlign: "center", padding: "16px", color: "#666" }}>
                        ບໍ່ພົບຂໍ້ມູນທີ່ກົງກັບເງື່ອນໄຂການຄົ້ນຫາ
                      </td>
                    </tr>
                  ) : (
                    filteredRosterRecords.map((group) => {
                    const memberCount = Math.max(group.members.length, 1);
                    const allSameClass =
                      group.members.length > 0 &&
                      group.members.every(
                        (m) =>
                          (m.classroom || group.classroom || "").trim() ===
                          (group.members[0]?.classroom || group.classroom || "").trim()
                      );

                    return group.members.map((member, mIdx) => {
                      const isFirstRowOfGroup = mIdx === 0;
                      const memberClass = member.classroom || group.classroom || "-";
                      const noteText =
                        member.note || (member.isPreviousGen ? "ນັກສຶກສາຕົກຮຸ່ນ" : "");

                      return (
                        <tr
                          key={`${group.groupNo}-${member.index || mIdx}`}
                          style={{ height: "30px" }}
                        >
                          {isFirstRowOfGroup && (
                            <td
                              rowSpan={memberCount}
                              style={{
                                backgroundColor: "#c6e0b4",
                                border: "1px solid #000000",
                                textAlign: "center",
                                verticalAlign: "middle",
                                fontWeight: "bold",
                                fontSize: "14px",
                                padding: "4px",
                              }}
                            >
                              {group.groupNo}
                            </td>
                          )}

                          <td
                            style={{
                              border: "1px solid #000000",
                              width: "30px",
                              textAlign: "center",
                              verticalAlign: "middle",
                              padding: "3px 4px",
                              fontWeight: "500",
                            }}
                          >
                            {member.index}
                          </td>

                          <td
                            style={{
                              border: "1px solid #000000",
                              textAlign: "left",
                              verticalAlign: "middle",
                              padding: "3px 8px",
                              whiteSpace: "nowrap",
                            }}
                          >
                            <div className="flex items-center justify-between gap-1">
                              <span>{member.name}</span>
                              {member.isPreviousGen && (
                                <span className="text-[10px] text-amber-700 bg-amber-50 px-1 py-0.2 rounded border border-amber-200 font-semibold">
                                  ຕົກຮຸ່ນ
                                </span>
                              )}
                            </div>
                          </td>

                          {allSameClass ? (
                            isFirstRowOfGroup && (
                              <td
                                rowSpan={memberCount}
                                style={{
                                  border: "1px solid #000000",
                                  textAlign: "center",
                                  verticalAlign: "middle",
                                  padding: "4px 6px",
                                  fontWeight: "500",
                                }}
                              >
                                {memberClass}
                              </td>
                            )
                          ) : (
                            <td
                              style={{
                                border: "1px solid #000000",
                                textAlign: "center",
                                verticalAlign: "middle",
                                padding: "3px 6px",
                                fontWeight: "500",
                              }}
                            >
                              {memberClass}
                            </td>
                          )}

                          {isFirstRowOfGroup && (
                            <td
                              rowSpan={memberCount}
                              style={{
                                border: "1px solid #000000",
                                textAlign: "center",
                                verticalAlign: "middle",
                                padding: "6px 10px",
                                lineHeight: "1.4",
                              }}
                            >
                              {group.topicLao}
                            </td>
                          )}

                          {isFirstRowOfGroup && (
                            <td
                              rowSpan={memberCount}
                              style={{
                                border: "1px solid #000000",
                                textAlign: "center",
                                verticalAlign: "middle",
                                padding: "4px 8px",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {group.advisor}
                            </td>
                          )}

                          <td
                            style={{
                              border: "1px solid #000000",
                              textAlign: "center",
                              verticalAlign: "middle",
                              padding: "3px 6px",
                              fontSize: "11px",
                              fontWeight: member.isPreviousGen ? "bold" : "normal",
                              color: member.isPreviousGen ? "#b91c1c" : "#000000",
                            }}
                          >
                            {noteText || "-"}
                          </td>
                        </tr>
                      );
                    });
                  })
                )}
                </tbody>
              </table>
            </CardContent>
          </Card>
        )}

        {selectedReportType === "ACADEMIC" && (
          <Card>
            <CardHeader className="border-b border-slate-100 pb-4">
              <CardTitle className="text-base font-bold font-lao">
                ການແຈກຢາຍຂັ້ນຕອນບົດໂຄງການ (ສົກຮຽນ 2026 / ພາກຮຽນ 1)
              </CardTitle>
              <CardDescription className="font-lao">
                ສະຫຼຸບຂໍ້ມູນ 48 ກຸ່ມບົດໂຄງການຕະຫຼອດ 8 ຂັ້ນຕອນ.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0 font-lao">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="p-4">ຂັ້ນຕອນຂອງບົດໂຄງການ</th>
                    <th className="p-4 text-center">ຈຳນວນກຸ່ມ</th>
                    <th className="p-4 text-center">ເປີເຊັນ</th>
                    <th className="p-4">ແຖບສະແດງອັດຕາສ່ວນ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {academicDataLao.map((row) => (
                    <tr key={row.stage} className="hover:bg-slate-50/80">
                      <td className="p-4 font-semibold text-slate-800 flex items-center gap-2">
                        <Badge variant={row.badgeVariant}>{row.stage}</Badge>
                      </td>
                      <td className="p-4 text-center font-mono font-bold text-slate-900">
                        {row.count}
                      </td>
                      <td className="p-4 text-center font-mono text-slate-600">
                        {row.percentage}
                      </td>
                      <td className="p-4 w-1/3">
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-sky-600 h-full rounded-full"
                            style={{ width: row.percentage }}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        )}

        {selectedReportType === "FINANCIAL" && (
          <Card>
            <CardHeader className="border-b border-slate-100 pb-4">
              <CardTitle className="text-base font-bold font-lao">
                ການເກັບຄ່າທຳນຽມນັກສຶກສາ ແລະ ຍອດຄ້າງຊຳລະ
              </CardTitle>
              <CardDescription className="font-lao">
                ບັນຊີຄ່າທຳນຽມທີ່ກວດສອບສະລິບໂອນເງິນແລ້ວ.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0 font-lao">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="p-4">ປະເພດຄ່າທຳນຽມ</th>
                    <th className="p-4 text-right">ຍອດຮັບແລ້ວ (LAK)</th>
                    <th className="p-4 text-right">ລໍຖ້າກວດສອບ (LAK)</th>
                    <th className="p-4 text-right">ເປົ້າໝາຍງົບປະມານ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {financialDataLao.map((row) => (
                    <tr key={row.category} className="hover:bg-slate-50/80">
                      <td className="p-4 font-semibold text-slate-800">{row.category}</td>
                      <td className="p-4 text-right font-mono font-bold text-emerald-700">
                        {row.collected}
                      </td>
                      <td className="p-4 text-right font-mono text-amber-700">
                        {row.pending}
                      </td>
                      <td className="p-4 text-right font-mono font-bold text-slate-900">
                        {row.target}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        )}

        {selectedReportType === "COMMITTEE" && (
          <Card>
            <CardHeader className="border-b border-slate-100 pb-4">
              <CardTitle className="text-base font-bold font-lao">
                ຕາຕະລາງການຈ່າຍເງິນຕອບແທນຄະນະກຳມະການສອບ (ໄລຍະທີ 13)
              </CardTitle>
              <CardDescription className="font-lao">
                ຄຳນວນຕາມອັດຕາມາດຕະຖານການຕອບແທນກຳມະການສອບເສັງຂອງມະຫາວິທະຍາໄລ.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0 font-lao">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="p-4">ບົດບາດກຳມະການ</th>
                    <th className="p-4">ອັດຕາທາງການ</th>
                    <th className="p-4 text-right">ເບີກຈ່າຍແລ້ວ (LAK)</th>
                    <th className="p-4 text-right">ລໍຖ້າເບີກຈ່າຍຮອບນີ້</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {committeeDisbursementsLao.map((row) => (
                    <tr key={row.role} className="hover:bg-slate-50/80">
                      <td className="p-4 font-semibold text-slate-800">{row.role}</td>
                      <td className="p-4 font-mono text-slate-600">{row.rate}</td>
                      <td className="p-4 text-right font-mono font-bold text-emerald-700">
                        {row.disbursed}
                      </td>
                      <td className="p-4 text-right font-mono text-amber-700">
                        {row.pending}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        )}

        {/* Full Official Report Print Modal */}
        {showPrintModal && (
          <OfficialThesisReport
            records={filteredRosterRecords}
            onClose={() => setShowPrintModal(false)}
          />
        )}
      </div>
    </AppShell>
  );
}

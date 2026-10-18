"use client";

import React, { useRef } from "react";
import { Printer, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { officialAdvisors2026_2027, TOTAL_ADVISOR_QUOTA, MULTIMEDIA_GLOBAL_CAP, TeacherRecord } from "@/lib/academic-directory";

export interface OfficialMember {
  index: number;
  name: string;
  studentId?: string;
  classroom?: string;
  isPreviousGen?: boolean;
  note?: string;
}

export interface OfficialGroupRecord {
  groupNo: number;
  classroom?: string;
  topicLao: string;
  topicEn?: string;
  advisor: string;
  members: OfficialMember[];
  note?: string;
}

interface OfficialThesisReportProps {
  records: OfficialGroupRecord[];
  academicYear?: string;
  departmentName?: string;
  facultyName?: string;
  defaultSortBy?: "group" | "advisor";
  onClose?: () => void;
}

export function OfficialThesisReport({
  records,
  academicYear = "2026 - 2027",
  departmentName = "ພາກວິຊາວິສະວະກຳຄອມພິວເຕີ ແລະ ເຕັກໂນໂລຊີຂໍ້ມູນຂ່າວສານ",
  facultyName = "ຄະນະວິສະວະກຳສາດ, ມະຫາວິທະຍາໄລແຫ່ງຊາດ",
  defaultSortBy = "group",
  onClose,
}: OfficialThesisReportProps) {
  const reportRef = useRef<HTMLDivElement>(null);
  const [sortBy, setSortBy] = React.useState<"group" | "advisor">(defaultSortBy);
  const [viewMode, setViewMode] = React.useState<"TOPICS" | "QUOTAS" | "BOTH">("BOTH");

  const sortedRecords = React.useMemo(() => {
    return [...records].sort((a, b) => {
      if (sortBy === "advisor") {
        return a.advisor.localeCompare(b.advisor, "lo");
      }
      return a.groupNo - b.groupNo;
    });
  }, [records, sortBy]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/80 backdrop-blur-xs p-2 sm:p-6 flex flex-col items-center">
      {/* Control Action Bar (Hidden during print) */}
      <div className="w-full max-w-5xl mb-4 bg-white/95 backdrop-blur-md rounded-2xl p-4 shadow-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 print:hidden font-sans">
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
            <Printer className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 font-lao">
              ແບບພິມລາຍງານທາງການ ພາກວິຊາ CEIT (ສົກສຶກສາ {academicYear})
            </h3>
            <p className="text-xs text-slate-500 font-lao">
              ຕາຕະລາງປະກາດຫົວຂໍ້ ແລະ ຕາຕະລາງສະຫຼຸບໂຄຕ້າ 21 ອາຈານທີ່ປຶກສາ (84 ກຸ່ມ)
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* View Mode Selector */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs font-lao">
            <span className="text-slate-500 px-1 font-medium">ຮູບແບບ:</span>
            <button
              type="button"
              onClick={() => setViewMode("TOPICS")}
              className={`px-2.5 py-1 rounded font-semibold transition ${
                viewMode === "TOPICS"
                  ? "bg-white text-slate-900 shadow-xs border border-slate-200/80"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              ຫົວຂໍ້ບົດ
            </button>
            <button
              type="button"
              onClick={() => setViewMode("QUOTAS")}
              className={`px-2.5 py-1 rounded font-semibold transition ${
                viewMode === "QUOTAS"
                  ? "bg-white text-slate-900 shadow-xs border border-slate-200/80"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              ສະຫຼຸບໂຄຕ້າອາຈານ
            </button>
            <button
              type="button"
              onClick={() => setViewMode("BOTH")}
              className={`px-2.5 py-1 rounded font-semibold transition ${
                viewMode === "BOTH"
                  ? "bg-white text-slate-900 shadow-xs border border-slate-200/80"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              ທັງ 2 ຕາຕະລາງ
            </button>
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs font-lao">
            <span className="text-slate-500 px-1 font-medium">ຈັດຮຽງ:</span>
            <button
              type="button"
              onClick={() => setSortBy("group")}
              className={`px-2.5 py-1 rounded font-semibold transition ${
                sortBy === "group"
                  ? "bg-white text-slate-900 shadow-xs border border-slate-200/80"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              ກຸ່ມ
            </button>
            <button
              type="button"
              onClick={() => setSortBy("advisor")}
              className={`px-2.5 py-1 rounded font-semibold transition ${
                sortBy === "advisor"
                  ? "bg-white text-slate-900 shadow-xs border border-slate-200/80"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              ອາຈານ
            </button>
          </div>

          <Button
            size="sm"
            onClick={handlePrint}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-lao font-medium shadow-sm"
            leftIcon={<Printer className="h-4 w-4" />}
          >
            ພິມລາຍງານ (Print)
          </Button>

          {onClose && (
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              leftIcon={<X className="h-4 w-4" />}
              className="font-lao"
            >
              ປິດໜ້າຕ່າງ
            </Button>
          )}
        </div>
      </div>

      {/* Official Document Container (This is what prints) */}
      <div
        ref={reportRef}
        className="w-full max-w-5xl bg-white p-6 sm:p-10 shadow-2xl rounded-xl border border-slate-300 font-lao text-black print:p-0 print:m-0 print:shadow-none print:border-none print:w-full print:max-w-none"
        style={{
          colorAdjust: "exact",
          WebkitPrintColorAdjust: "exact",
        }}
      >
        {/* 1. Official Topic Announcement Section */}
        {(viewMode === "TOPICS" || viewMode === "BOTH") && (
          <div className="mb-10">
            {/* Academic Official Header */}
            <div className="text-center space-y-1 mb-6">
              <p className="text-sm font-bold tracking-wide">
                ສາທາລະນະລັດ ປະຊາທິປະໄຕ ປະຊາຊົນລາວ
              </p>
              <p className="text-sm font-bold tracking-wider">
                ສັນຕິພາບ ເອກະລາດ ປະຊາທິປະໄຕ ເອກະພາບ ວັດທະນະຖາວອນ
              </p>
              <div className="w-24 h-0.5 bg-black mx-auto my-2" />

              <div className="flex justify-between items-center text-xs pt-1 px-2 font-medium">
                <div className="text-left">
                  <p>{facultyName}</p>
                  <p className="font-bold">{departmentName}</p>
                </div>
                <div className="text-right">
                  <p>ສົກສຶກສາ: {academicYear}</p>
                  <p>ລະດັບ: ປະລິນຍາຕີ</p>
                </div>
              </div>

              <h2 className="text-base sm:text-lg font-bold pt-3 pb-1">
                ຕາຕະລາງລາຍຊື່ນັກສຶກສາ, ຫົວຂໍ້ບົດໂຄງການຈົບຊັ້ນ ແລະ ອາຈານທີ່ປຶກສາ
              </h2>
            </div>

            {/* Exact Official Report Table with 7 Columns */}
            <div className="overflow-x-auto w-full">
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
                  {sortedRecords.map((group) => {
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
                                <span className="text-[10px] text-amber-700 bg-amber-50 px-1 py-0.2 rounded border border-amber-200 font-semibold print:hidden">
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
                  })}
                </tbody>
              </table>
            </div>

            {/* Signatures for Topics */}
            <div className="mt-8 grid grid-cols-2 text-center text-xs pt-4 font-lao">
              <div>
                <p>ພະນັກງານວິຊາການ ຜູ້ຮວບຮວມ</p>
                <div className="h-16" />
                <p className="font-bold">....................................................</p>
              </div>
              <div>
                <p>ວຽງຈັນ, ວັນທີ ............. ເດືອນ ............. ປີ 2026 - 2027</p>
                <p className="font-bold mt-1">ຫົວໜ້າພາກວິຊາ CEIT</p>
                <div className="h-14" />
                <p className="font-bold">....................................................</p>
              </div>
            </div>
          </div>
        )}

        {/* 2. Official Advisor Quota Summary Section (Rule 2: 21 Advisors, 84 Groups) */}
        {(viewMode === "QUOTAS" || viewMode === "BOTH") && (
          <div className={`${viewMode === "BOTH" ? "break-before-page pt-10 print:pt-0" : ""}`}>
            {/* Academic Official Header */}
            <div className="text-center space-y-1 mb-6">
              <p className="text-sm font-bold tracking-wide">
                ສາທາລະນະລັດ ປະຊາທິປະໄຕ ປະຊາຊົນລາວ
              </p>
              <p className="text-sm font-bold tracking-wider">
                ສັນຕິພາບ ເອກະລາດ ປະຊາທິປະໄຕ ເອກະພາບ ວັດທະນະຖາວອນ
              </p>
              <div className="w-24 h-0.5 bg-black mx-auto my-2" />

              <div className="flex justify-between items-center text-xs pt-1 px-2 font-medium">
                <div className="text-left">
                  <p>{facultyName}</p>
                  <p className="font-bold">{departmentName}</p>
                </div>
                <div className="text-right">
                  <p>ສົກສຶກສາ: {academicYear}</p>
                  <p>ໂຄຕ້າລວມ: {TOTAL_ADVISOR_QUOTA} ກຸ່ມ / 21 ທ່ານ</p>
                </div>
              </div>

              <h2 className="text-base sm:text-lg font-bold pt-3 pb-1">
                ຕາຕະລາງລາຍຊື່ ແລະ ໂຄຕ້າອາຈານທີ່ປຶກສາບົດວິທະຍານິພົນ ປະຈຳສົກສຶກສາ {academicYear}
              </h2>
              <p className="text-xs text-slate-600 font-medium">
                (ກຸ່ມລະ 2-3 ຄົນ • ໝວດ Multimedia ຈຳກັດສູງສຸດບໍ່ເກີນ {MULTIMEDIA_GLOBAL_CAP} ກຸ່ມ ທົ່ວພາກວິຊາ)
              </p>
            </div>

            {/* Official Advisor Quota Table */}
            <div className="overflow-x-auto w-full">
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
                        width: "45px",
                        textAlign: "center",
                        fontWeight: "bold",
                        padding: "6px 4px",
                      }}
                    >
                      ລ/ດ
                    </th>
                    <th
                      style={{
                        backgroundColor: "#d9d9d9",
                        border: "1px solid #000000",
                        width: "230px",
                        textAlign: "center",
                        fontWeight: "bold",
                        padding: "6px 6px",
                      }}
                    >
                      ຊື່ ແລະ ນາມສະກຸນອາຈານທີ່ປຶກສາ
                    </th>
                    <th
                      style={{
                        backgroundColor: "#d9d9d9",
                        border: "1px solid #000000",
                        width: "130px",
                        textAlign: "center",
                        fontWeight: "bold",
                        padding: "6px 4px",
                      }}
                    >
                      ສັງກັດ / ຫ້ອງການ
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
                      ໝວດຫົວບົດທີ່ຮັບຜິດຊອບ
                    </th>
                    <th
                      style={{
                        backgroundColor: "#d9d9d9",
                        border: "1px solid #000000",
                        width: "70px",
                        textAlign: "center",
                        fontWeight: "bold",
                        padding: "6px 4px",
                      }}
                    >
                      ຮັບແລ້ວ
                    </th>
                    <th
                      style={{
                        backgroundColor: "#c6e0b4",
                        border: "1px solid #000000",
                        width: "70px",
                        textAlign: "center",
                        fontWeight: "bold",
                        padding: "6px 4px",
                      }}
                    >
                      ໂຄຕ້າ
                    </th>
                    <th
                      style={{
                        backgroundColor: "#d9d9d9",
                        border: "1px solid #000000",
                        width: "70px",
                        textAlign: "center",
                        fontWeight: "bold",
                        padding: "6px 4px",
                      }}
                    >
                      ຍັງວ່າງ
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {officialAdvisors2026_2027.map((advisor: TeacherRecord, index: number) => {
                    const assigned = advisor.assignedCount || 0;
                    const quota = advisor.maxQuota || 0;
                    const available = Math.max(quota - assigned, 0);

                    return (
                      <tr key={advisor.id || index} style={{ height: "28px" }}>
                        <td
                          style={{
                            border: "1px solid #000000",
                            textAlign: "center",
                            verticalAlign: "middle",
                            fontWeight: "bold",
                            padding: "4px",
                          }}
                        >
                          {index + 1}
                        </td>
                        <td
                          style={{
                            border: "1px solid #000000",
                            textAlign: "left",
                            verticalAlign: "middle",
                            padding: "4px 8px",
                            fontWeight: "500",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {advisor.fullName}
                        </td>
                        <td
                          style={{
                            border: "1px solid #000000",
                            textAlign: "center",
                            verticalAlign: "middle",
                            padding: "4px 6px",
                          }}
                        >
                          {advisor.affiliation}
                        </td>
                        <td
                          style={{
                            border: "1px solid #000000",
                            textAlign: "left",
                            verticalAlign: "middle",
                            padding: "4px 8px",
                            fontSize: "12px",
                          }}
                        >
                          {advisor.eligibleCategories.join(", ")}
                          {advisor.conditionalCategories && advisor.conditionalCategories.length > 0 && (
                            <span className="text-amber-800 text-[11px] block">
                              (ເງື່ອນໄຂ/ຮ່ວມ: {advisor.conditionalCategories.join(", ")})
                            </span>
                          )}
                        </td>
                        <td
                          style={{
                            border: "1px solid #000000",
                            textAlign: "center",
                            verticalAlign: "middle",
                            fontWeight: "bold",
                            padding: "4px",
                          }}
                        >
                          {assigned}
                        </td>
                        <td
                          style={{
                            backgroundColor: "#e2efda",
                            border: "1px solid #000000",
                            textAlign: "center",
                            verticalAlign: "middle",
                            fontWeight: "bold",
                            fontSize: "13px",
                            padding: "4px",
                          }}
                        >
                          {quota}
                        </td>
                        <td
                          style={{
                            border: "1px solid #000000",
                            textAlign: "center",
                            verticalAlign: "middle",
                            fontWeight: "bold",
                            color: available === 0 ? "#b91c1c" : "#15803d",
                            padding: "4px",
                          }}
                        >
                          {available}
                        </td>
                      </tr>
                    );
                  })}

                  {/* Summary Totals Row */}
                  <tr style={{ height: "34px", backgroundColor: "#fff2cc" }}>
                    <td
                      colSpan={4}
                      style={{
                        border: "1.5px solid #000000",
                        textAlign: "center",
                        verticalAlign: "middle",
                        fontWeight: "bold",
                        fontSize: "13px",
                        padding: "6px 8px",
                      }}
                    >
                      ລວມທັງໝົດ: 21 ທ່ານ (ໝວດ Multimedia ຈຳກັດສູງສຸດບໍ່ເກີນ {MULTIMEDIA_GLOBAL_CAP} ກຸ່ມ)
                    </td>
                    <td
                      style={{
                        border: "1.5px solid #000000",
                        textAlign: "center",
                        verticalAlign: "middle",
                        fontWeight: "bold",
                        fontSize: "13px",
                        padding: "6px 4px",
                      }}
                    >
                      {officialAdvisors2026_2027.reduce((sum: number, a: TeacherRecord) => sum + (a.assignedCount || 0), 0)}
                    </td>
                    <td
                      style={{
                        backgroundColor: "#c6e0b4",
                        border: "1.5px solid #000000",
                        textAlign: "center",
                        verticalAlign: "middle",
                        fontWeight: "bold",
                        fontSize: "14px",
                        padding: "6px 4px",
                      }}
                    >
                      {TOTAL_ADVISOR_QUOTA}
                    </td>
                    <td
                      style={{
                        border: "1.5px solid #000000",
                        textAlign: "center",
                        verticalAlign: "middle",
                        fontWeight: "bold",
                        fontSize: "13px",
                        color: "#15803d",
                        padding: "6px 4px",
                      }}
                    >
                      {officialAdvisors2026_2027.reduce((sum: number, a: TeacherRecord) => sum + Math.max((a.maxQuota || 0) - (a.assignedCount || 0), 0), 0)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Official Signatures Footer for Advisor Quotas */}
            <div className="mt-8 grid grid-cols-2 text-center text-xs pt-4 font-lao">
              <div>
                <p>ພະນັກງານວິຊາການ ຜູ້ຮວບຮວມ</p>
                <div className="h-16" />
                <p className="font-bold">....................................................</p>
              </div>
              <div>
                <p>ວຽງຈັນ, ວັນທີ ............. ເດືອນ ............. ປີ 2026 - 2027</p>
                <p className="font-bold mt-1">ຫົວໜ້າພາກວິຊາ CEIT</p>
                <div className="h-14" />
                <p className="font-bold">....................................................</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Print Style Injections */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .font-lao,
          .font-lao * {
            visibility: visible;
          }
          @page {
            size: A4 landscape;
            margin: 10mm;
          }
        }
      `}</style>
    </div>
  );
}

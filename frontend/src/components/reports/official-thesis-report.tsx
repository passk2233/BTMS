"use client";

import React, { useRef } from "react";
import { Printer, X } from "lucide-react";
import { Button } from "@/components/ui/button";

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
  academicYear = "2025 - 2026",
  departmentName = "ພາກວິຊາວິສະວະກຳຄອມພິວເຕີ ແລະ ເຕັກໂນໂລຊີຂໍ້ມູນຂ່າວສານ",
  facultyName = "ຄະນະວິສະວະກຳສາດ, ມະຫາວິທະຍາໄລແຫ່ງຊາດ",
  defaultSortBy = "group",
  onClose,
}: OfficialThesisReportProps) {
  const reportRef = useRef<HTMLDivElement>(null);
  const [sortBy, setSortBy] = React.useState<"group" | "advisor">(defaultSortBy);

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
              ແບບພິມລາຍງານທາງການ: ຕາຕະລາງຫົວຂໍ້ບົດ ແລະ ອາຈານທີ່ປຶກສາ
            </h3>
            <p className="text-xs text-slate-500 font-lao">
              ຮອງຮັບນັກສຶກສາຕ່າງຫ້ອງຮຽນ ແລະ ໝາຍເຫດນັກສຶກສາຕົກຮຸ່ນ (ເຊັນຢັ້ງຢືນຈາກຫົວໜ້າພາກ)
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
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
              ຕາມກຸ່ມທີ
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
              ຕາມຊື່ອາຈານທີ່ປຶກສາ
            </button>
          </div>
          <Button
            size="sm"
            onClick={handlePrint}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-lao font-medium shadow-sm"
            leftIcon={<Printer className="h-4 w-4" />}
          >
            ພິມອອກເອກະສານ (Print / Save PDF)
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
                {/* Column 1: ກຸ່ມ */}
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

                {/* Columns 2 & 3: ຊື່ ແລະ ນາມສະກຸນ */}
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

                {/* Column 4: ຫ້ອງ */}
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

                {/* Column 5: ຊື່ຫົວຂໍ້ */}
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

                {/* Column 6: ຊື່ອາຈານທີ່ປຶກສາ */}
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

                {/* Column 7: ໝາຍເຫດ (Remarks / Previous Gen Note) */}
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

                // Check if all members belong to the exact same classroom
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
                      {/* Column 1: Group No (Rowspan) */}
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

                      {/* Column 2: Member Index (1, 2, 3) */}
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

                      {/* Column 3: Member Full Name */}
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

                      {/* Column 4: Classroom (Individual or Rowspan if all identical) */}
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

                      {/* Column 5: Thesis Topic (Rowspan) */}
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

                      {/* Column 6: Advisor Name (Rowspan) */}
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

                      {/* Column 7: ໝາຍເຫດ (Remarks / Previous Gen Note per student) */}
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

        {/* Official Signatures Footer */}
        <div className="mt-10 grid grid-cols-2 text-center text-xs pt-4 font-lao">
          <div>
            <p>ພະນັກງານວິຊາການ ຜູ້ຮວບຮວມ</p>
            <div className="h-16" />
            <p className="font-bold">....................................................</p>
          </div>
          <div>
            <p>ວຽງຈັນ, ວັນທີ ............. ເດືອນ ............. ປີ 2026</p>
            <p className="font-bold mt-1">ຫົວໜ້າພາກວິຊາ</p>
            <div className="h-14" />
            <p className="font-bold">....................................................</p>
          </div>
        </div>
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

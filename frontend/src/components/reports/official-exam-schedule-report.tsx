"use client";

import React, { useRef } from "react";
import { Printer, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface ScheduleItem {
  groupNo: number;
  timeSlot: string; // e.g. "8:30 - 9:05 am"
  members: { index: number; name: string }[];
  classroom: string;
  topicTitle: string;
  advisor: string;
}

export interface CommitteeSession {
  chairman: string;
  members: string[];
}

export interface ExamDaySchedule {
  dayTitle: string; // e.g. "ວັນພຸດ ວັນທີ 15 ກໍລະກົດ 2026"
  room: string; // e.g. "ຫ້ອງສອບເສັງ Conference"
  morningCommittees: CommitteeSession;
  afternoonCommittees: CommitteeSession;
  morningSlots: ScheduleItem[];
  afternoonSlots: ScheduleItem[];
  deputyHeadName?: string;
}

interface OfficialExamScheduleReportProps {
  schedule: ExamDaySchedule;
  academicYear?: string;
  onClose?: () => void;
}

export function OfficialExamScheduleReport({
  schedule,
  academicYear = "2025-2026",
  onClose,
}: OfficialExamScheduleReportProps) {
  const reportRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  const deputyHead = schedule.deputyHeadName || "ຮສ. ແສງລັດສະໝີ ຈັນທະມິນາວົງ";

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/80 backdrop-blur-xs p-2 sm:p-6 flex flex-col items-center">
      {/* Control Action Bar (Hidden during print) */}
      <div className="w-full max-w-6xl mb-4 bg-white/95 backdrop-blur-md rounded-2xl p-4 shadow-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 print:hidden font-sans">
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-xl bg-sky-100 text-sky-800 flex items-center justify-center font-bold">
            <Printer className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 font-lao">
              ແບບພິມທາງການ: ຕາຕະລາງສອບຫົວບົດໂຄງການຈົບຊັ້ນ (Official Exam Schedule)
            </h3>
            <p className="text-xs text-slate-500 font-lao">
              {schedule.dayTitle} • {schedule.room} (ອາຈານທີ່ປຶກສາບໍ່ໄດ້ເປັນກຳມະການສອບ)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={handlePrint}
            className="bg-sky-600 hover:bg-sky-700 text-white font-lao font-medium shadow-sm"
            leftIcon={<Printer className="h-4 w-4" />}
          >
            ພິມຕາຕະລາງສອບ (Print / PDF)
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

      {/* Official A4 Landscape Document Container */}
      <div
        ref={reportRef}
        className="w-full max-w-6xl bg-white p-6 sm:p-8 shadow-2xl rounded-xl border border-slate-300 font-lao text-black print:p-0 print:m-0 print:shadow-none print:border-none print:w-full print:max-w-none text-[12px] leading-tight"
        style={{
          colorAdjust: "exact",
          WebkitPrintColorAdjust: "exact",
        }}
      >
        {/* Document Header matching university format */}
        <div className="text-center space-y-1 mb-4">
          <h2 className="text-base sm:text-lg font-bold">
            ຕາຕະລາງສອບຫົວບົດໂຄງການຈົບຊັ້ນ ນັກສຶກສາປະລິນຍາຕີ ສົກປີ {academicYear}
          </h2>
          <p className="text-sm font-semibold text-slate-900">
            {schedule.dayTitle} {schedule.room}
          </p>
        </div>

        {/* Schedule Table */}
        <div className="overflow-x-auto w-full">
          <table
            className="w-full border-collapse"
            style={{
              border: "1.5px solid #000000",
              borderCollapse: "collapse",
            }}
          >
            <thead>
              <tr style={{ height: "32px", backgroundColor: "#f2f2f2" }}>
                <th
                  style={{
                    border: "1px solid #000000",
                    width: "48px",
                    textAlign: "center",
                    fontWeight: "bold",
                    padding: "4px",
                  }}
                >
                  ກຸ່ມ
                </th>
                <th
                  style={{
                    border: "1px solid #000000",
                    width: "105px",
                    textAlign: "center",
                    fontWeight: "bold",
                    padding: "4px",
                  }}
                >
                  ເວລາ
                </th>
                <th
                  style={{
                    border: "1px solid #000000",
                    width: "180px",
                    textAlign: "center",
                    fontWeight: "bold",
                    padding: "4px",
                  }}
                >
                  ຊື່ ແລະ ນາມສະກຸນ
                </th>
                <th
                  style={{
                    border: "1px solid #000000",
                    width: "75px",
                    textAlign: "center",
                    fontWeight: "bold",
                    padding: "4px",
                  }}
                >
                  ຫ້ອງ
                </th>
                <th
                  style={{
                    border: "1px solid #000000",
                    textAlign: "center",
                    fontWeight: "bold",
                    padding: "4px 8px",
                  }}
                >
                  ຊື່ຫົວຂໍ້
                </th>
                <th
                  style={{
                    border: "1px solid #000000",
                    width: "160px",
                    textAlign: "center",
                    fontWeight: "bold",
                    padding: "4px",
                  }}
                >
                  ຊື່ອາຈານທີ່ປຶກສາ
                </th>
                <th
                  style={{
                    border: "1px solid #000000",
                    width: "175px",
                    textAlign: "center",
                    fontWeight: "bold",
                    padding: "4px",
                  }}
                >
                  ກຳມະການ
                </th>
              </tr>
            </thead>

            <tbody>
              {/* MORNING SLOTS */}
              {schedule.morningSlots.map((item, idx) => {
                const isFirstRowOfMorning = idx === 0;
                return (
                  <tr key={`morning-${item.groupNo}-${idx}`} style={{ minHeight: "34px" }}>
                    {/* Group */}
                    <td
                      style={{
                        border: "1px solid #000000",
                        textAlign: "center",
                        verticalAlign: "middle",
                        fontWeight: "bold",
                        padding: "4px",
                      }}
                    >
                      {item.groupNo}
                    </td>

                    {/* Time Slot */}
                    <td
                      style={{
                        border: "1px solid #000000",
                        textAlign: "center",
                        verticalAlign: "middle",
                        padding: "4px",
                        whiteSpace: "nowrap",
                        fontFamily: "monospace",
                        fontSize: "11px",
                      }}
                    >
                      {item.timeSlot}
                    </td>

                    {/* Students list */}
                    <td
                      style={{
                        border: "1px solid #000000",
                        verticalAlign: "middle",
                        padding: "4px 6px",
                      }}
                    >
                      <div className="space-y-0.5">
                        {item.members.map((m) => (
                          <div key={m.index} className="flex gap-1.5 items-baseline">
                            <span className="font-semibold text-slate-700 w-3">{m.index}</span>
                            <span>{m.name}</span>
                          </div>
                        ))}
                      </div>
                    </td>

                    {/* Class */}
                    <td
                      style={{
                        border: "1px solid #000000",
                        textAlign: "center",
                        verticalAlign: "middle",
                        fontWeight: "500",
                        padding: "4px",
                      }}
                    >
                      {item.classroom}
                    </td>

                    {/* Topic */}
                    <td
                      style={{
                        border: "1px solid #000000",
                        textAlign: "center",
                        verticalAlign: "middle",
                        padding: "4px 8px",
                      }}
                    >
                      {item.topicTitle}
                    </td>

                    {/* Advisor */}
                    <td
                      style={{
                        border: "1px solid #000000",
                        textAlign: "center",
                        verticalAlign: "middle",
                        padding: "4px 6px",
                      }}
                    >
                      {item.advisor}
                    </td>

                    {/* Morning Committee (Spans all morning slots) */}
                    {isFirstRowOfMorning && (
                      <td
                        rowSpan={schedule.morningSlots.length}
                        style={{
                          border: "1px solid #000000",
                          textAlign: "center",
                          verticalAlign: "middle",
                          padding: "6px 8px",
                          lineHeight: "1.5",
                        }}
                      >
                        <p className="font-bold text-slate-900">
                          {schedule.morningCommittees.chairman}
                        </p>
                        <p className="text-[11px] font-semibold text-slate-700">(ປະທານ)</p>
                        <div className="mt-2 space-y-1">
                          {schedule.morningCommittees.members.map((comm, cIdx) => (
                            <p key={cIdx} className="text-slate-800">
                              {comm}
                            </p>
                          ))}
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}

              {/* LUNCH BREAK ROW */}
              <tr style={{ height: "28px", backgroundColor: "#f9fafb" }}>
                <td
                  colSpan={7}
                  style={{
                    border: "1px solid #000000",
                    textAlign: "center",
                    verticalAlign: "middle",
                    fontWeight: "bold",
                    letterSpacing: "2px",
                    padding: "4px",
                  }}
                >
                  ພັກທ່ຽງ
                </td>
              </tr>

              {/* AFTERNOON SLOTS */}
              {schedule.afternoonSlots.map((item, idx) => {
                const isFirstRowOfAfternoon = idx === 0;
                return (
                  <tr key={`afternoon-${item.groupNo}-${idx}`} style={{ minHeight: "34px" }}>
                    {/* Group */}
                    <td
                      style={{
                        border: "1px solid #000000",
                        textAlign: "center",
                        verticalAlign: "middle",
                        fontWeight: "bold",
                        padding: "4px",
                      }}
                    >
                      {item.groupNo}
                    </td>

                    {/* Time Slot */}
                    <td
                      style={{
                        border: "1px solid #000000",
                        textAlign: "center",
                        verticalAlign: "middle",
                        padding: "4px",
                        whiteSpace: "nowrap",
                        fontFamily: "monospace",
                        fontSize: "11px",
                      }}
                    >
                      {item.timeSlot}
                    </td>

                    {/* Students list */}
                    <td
                      style={{
                        border: "1px solid #000000",
                        verticalAlign: "middle",
                        padding: "4px 6px",
                      }}
                    >
                      <div className="space-y-0.5">
                        {item.members.map((m) => (
                          <div key={m.index} className="flex gap-1.5 items-baseline">
                            <span className="font-semibold text-slate-700 w-3">{m.index}</span>
                            <span>{m.name}</span>
                          </div>
                        ))}
                      </div>
                    </td>

                    {/* Class */}
                    <td
                      style={{
                        border: "1px solid #000000",
                        textAlign: "center",
                        verticalAlign: "middle",
                        fontWeight: "500",
                        padding: "4px",
                      }}
                    >
                      {item.classroom}
                    </td>

                    {/* Topic */}
                    <td
                      style={{
                        border: "1px solid #000000",
                        textAlign: "center",
                        verticalAlign: "middle",
                        padding: "4px 8px",
                      }}
                    >
                      {item.topicTitle}
                    </td>

                    {/* Advisor */}
                    <td
                      style={{
                        border: "1px solid #000000",
                        textAlign: "center",
                        verticalAlign: "middle",
                        padding: "4px 6px",
                      }}
                    >
                      {item.advisor}
                    </td>

                    {/* Afternoon Committee (Spans all afternoon slots) */}
                    {isFirstRowOfAfternoon && (
                      <td
                        rowSpan={schedule.afternoonSlots.length}
                        style={{
                          border: "1px solid #000000",
                          textAlign: "center",
                          verticalAlign: "middle",
                          padding: "6px 8px",
                          lineHeight: "1.5",
                        }}
                      >
                        <p className="font-bold text-slate-900">
                          {schedule.afternoonCommittees.chairman}
                        </p>
                        <p className="text-[11px] font-semibold text-slate-700">(ປະທານ)</p>
                        <div className="mt-2 space-y-1">
                          {schedule.afternoonCommittees.members.map((comm, cIdx) => (
                            <p key={cIdx} className="text-slate-800">
                              {comm}
                            </p>
                          ))}
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Official Signature Footer matching document */}
        <div className="mt-8 flex justify-end text-center font-lao">
          <div className="w-72">
            <p className="font-bold">ຮອງຫົວໜ້າພາກວິຊາ</p>
            <div className="h-16 flex items-center justify-center">
              <span className="text-slate-300 font-mono text-xs">[ລາຍເຊັນ]</span>
            </div>
            <p className="font-bold text-rose-700 text-sm">{deputyHead}</p>
          </div>
        </div>
      </div>

      {/* Print Styles */}
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
            margin: 8mm;
          }
        }
      `}</style>
    </div>
  );
}

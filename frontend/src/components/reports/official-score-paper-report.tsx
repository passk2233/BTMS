"use client";

import React, { useRef, useState } from "react";
import { Printer, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface ScorePaperStudent {
  index: number;
  name: string;
  studentId?: string;
  scores?: {
    // Proposal criteria
    innovation?: number; // max 5
    chapter1?: number; // max 10
    chapter2?: number; // max 8
    chapter3?: number; // max 20
    presentationProposal?: number; // max 7
    qaProposal?: number; // max 10

    // Final defense criteria
    chapter4?: number; // max 7
    chapter5?: number; // max 5
    docCompleteness?: number; // max 8
    poster?: number; // max 3
    productCompleteness?: number; // max 10
    presentationFinal?: number; // max 10
    qaFinal?: number; // max 17

    total60?: number; // max 60
    total100?: number; // max 100
  };
}

export interface OfficialScorePaperData {
  paperType?: "PROPOSAL" | "FINAL";
  groupCode: string; // e.g. "ກຸ່ມ 1" or "CS-2026-G01"
  examDate?: string;
  examRoom?: string;
  academicYear?: string;
  category?: string; // e.g. "DATABASE", "IOT", "NETWORK", "MEDIA"
  roundNumber?: number; // e.g. 1, 2, 3
  attemptNo?: number; // e.g. 1 (normal), 2+ (retake)
  students: ScorePaperStudent[];
  committeeName?: string;
  isChairman?: boolean;
  verdict?: "PASS" | "FAIL";
  comment?: string;
}

interface OfficialScorePaperReportProps {
  data: OfficialScorePaperData;
  onClose?: () => void;
}

export function OfficialScorePaperReport({
  data,
  onClose,
}: OfficialScorePaperReportProps) {
  const reportRef = useRef<HTMLDivElement>(null);
  const [paperType, setPaperType] = useState<"PROPOSAL" | "FINAL">(
    data.paperType || "PROPOSAL"
  );

  const handlePrint = () => {
    window.print();
  };

  const academicYear = data.academicYear || "2026";
  const examDate = data.examDate || "........../........../2026";
  const examRoom = data.examRoom || "....................................";

  // Ensure 3 rows for students
  const studentRows: ScorePaperStudent[] = [
    data.students[0] || { index: 1, name: "" },
    data.students[1] || { index: 2, name: "" },
    data.students[2] || { index: 3, name: "" },
  ];

  const isProposal = paperType === "PROPOSAL";

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/80 backdrop-blur-xs p-2 sm:p-6 flex flex-col items-center">
      {/* Control Action Bar (Hidden during print) */}
      <div className="w-full max-w-4xl mb-4 bg-white/95 backdrop-blur-md rounded-2xl p-4 shadow-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 print:hidden font-sans">
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-xl bg-violet-100 text-violet-800 flex items-center justify-center font-bold">
            <Printer className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 font-lao">
              {isProposal
                ? "ແບບພິມທາງການ: ໃບໃຫ້ຄະແນນການປ້ອງກັນ ຫົວຂໍ້ບົດໂຄງການ (Proposal)"
                : "ແບບພິມທາງການ: ໃບໃຫ້ຄະແນນການປ້ອງກັນ ບົດໂຄງການຈົບຊັ້ນ (Final)"}
            </h3>
            <p className="text-xs text-slate-500 font-lao">
              {isProposal
                ? "ເກນສອບໂຄງຮ່າງ: ນະວັດຕະກຳ (5), ບົດທີ 1 (10), ບົດທີ 2 (8), ບົດທີ 3 (20), ສະເໜີ (7), ຕອບ (10) = 60"
                : "ເກນສອບບົດຈົບຊັ້ນ: ບົດທີ 4 (7), ບົດທີ 5 (5), ເອກະສານ (8), Poster (3), ຊິ້ນງານ (10), ສະເໜີ (10), ຕອບ (17) = 60"}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Paper Type Toggle */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs font-lao">
            <span className="text-slate-500 px-1 font-medium">ປະເພດໃບຄະແນນ:</span>
            <button
              type="button"
              onClick={() => setPaperType("PROPOSAL")}
              className={`px-2 py-1 rounded font-semibold transition ${
                isProposal
                  ? "bg-white text-violet-800 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              ສອບໂຄງຮ່າງ (Proposal)
            </button>
            <button
              type="button"
              onClick={() => setPaperType("FINAL")}
              className={`px-2 py-1 rounded font-semibold transition ${
                !isProposal
                  ? "bg-white text-violet-800 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              ສອບບົດຈົບຊັ້ນ (Final)
            </button>
          </div>

          <Button
            size="sm"
            onClick={handlePrint}
            className="bg-violet-600 hover:bg-violet-700 text-white font-lao font-medium shadow-sm"
            leftIcon={<Printer className="h-4 w-4" />}
          >
            ພິມໃບໃຫ້ຄະແນນ (Print / PDF)
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

      {/* Official Printable Sheet Container (A4 Portrait) */}
      <div
        ref={reportRef}
        className="w-full max-w-4xl bg-white p-8 sm:p-12 shadow-2xl rounded-xl border border-slate-300 font-lao text-black print:p-0 print:m-0 print:shadow-none print:border-none print:w-full print:max-w-none text-[12px] leading-normal"
        style={{
          colorAdjust: "exact",
          WebkitPrintColorAdjust: "exact",
        }}
      >
        {/* ========================================================================= */}
        {/* PART 1: ໃບໃຫ້ຄະແນນການປ້ອງກັນ                                              */}
        {/* ========================================================================= */}
        <div>
          {/* Header */}
          <div className="text-center mb-3">
            <h2 className="text-base sm:text-lg font-bold">
              {isProposal
                ? `ໃບໃຫ້ຄະແນນການປ້ອງກັນ ຫົວຂໍ້ບົດໂຄງການຈົບຊັ້ນ ສົກປີ ${academicYear}`
                : `ໃບໃຫ້ຄະແນນການປ້ອງກັນ ບົດໂຄງການຈົບຊັ້ນ ສົກປີ ${academicYear}`}
            </h2>
          </div>

          <div className="flex justify-between items-center text-xs mb-2">
            <span>#. ຫຼັກການໃຫ້ຄະແນນມີດັ່ງລຸ່ມນີ້</span>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
              {data.category && (
                <span>
                  ໝວດວິຊາ: <strong>{data.category}</strong>
                </span>
              )}
              {(data.roundNumber || data.attemptNo) && (
                <span className="font-semibold text-sky-900">
                  {data.roundNumber ? `ຮອບທີ ${data.roundNumber}` : ""}
                  {data.attemptNo && data.attemptNo > 1
                    ? ` (ສອບຄືນຄັ້ງທີ ${data.attemptNo})`
                    : " (ສອບຄັ້ງທີ 1)"}
                </span>
              )}
              <span>ວັນທີ ....{examDate}....</span>
              <span>ຫ້ອງສອບ: <strong>{examRoom}</strong></span>
            </div>
          </div>

          {/* =================== PROPOSAL RUBRIC TABLE =================== */}
          {isProposal ? (
            <table
              className="w-full border-collapse text-center text-xs"
              style={{
                border: "1.5px solid #000000",
                borderCollapse: "collapse",
              }}
            >
              <thead>
                {/* Row 1: Weight numbers */}
                <tr style={{ height: "30px" }}>
                  <th
                    style={{
                      border: "1px solid #000000",
                      width: "160px",
                      fontWeight: "bold",
                      padding: "4px",
                    }}
                  >
                    ນ້ຳໜັກຄະແນນ
                  </th>
                  <th style={{ border: "1px solid #000000", width: "95px", padding: "4px" }}>5</th>
                  <th style={{ border: "1px solid #000000", width: "80px", padding: "4px" }}>10</th>
                  <th style={{ border: "1px solid #000000", width: "80px", padding: "4px" }}>8</th>
                  <th style={{ border: "1px solid #000000", width: "80px", padding: "4px" }}>20</th>
                  <th style={{ border: "1px solid #000000", width: "85px", padding: "4px" }}>7</th>
                  <th style={{ border: "1px solid #000000", width: "95px", padding: "4px" }}>10</th>
                  <th
                    style={{
                      border: "1px solid #000000",
                      width: "80px",
                      fontWeight: "bold",
                      padding: "4px",
                    }}
                  >
                    60
                  </th>
                </tr>

                {/* Row 2: Criteria Names */}
                <tr style={{ height: "46px" }}>
                  <th style={{ border: "1px solid #000000", padding: "4px 2px", fontWeight: "bold", fontSize: "11px" }}>
                    ຕາມເກນໃຫ້ຄະແນນ
                  </th>
                  <th style={{ border: "1px solid #000000", padding: "4px 2px", fontWeight: "normal", fontSize: "11px" }}>
                    ຄວາມຍາກງ່າຍຫຼືນະວັດຕະກຳ
                  </th>
                  <th style={{ border: "1px solid #000000", padding: "4px 2px", fontWeight: "normal", fontSize: "11px" }}>
                    ເນື້ອໃນບົດທີ 1
                  </th>
                  <th style={{ border: "1px solid #000000", padding: "4px 2px", fontWeight: "normal", fontSize: "11px" }}>
                    ເນື້ອໃນບົດທີ 2
                  </th>
                  <th style={{ border: "1px solid #000000", padding: "4px 2px", fontWeight: "normal", fontSize: "11px" }}>
                    ເນື້ອໃນບົດທີ 3
                  </th>
                  <th style={{ border: "1px solid #000000", padding: "4px 2px", fontWeight: "normal", fontSize: "11px" }}>
                    ຄະແນນການນຳສະເໜີ
                  </th>
                  <th style={{ border: "1px solid #000000", padding: "4px 2px", fontWeight: "normal", fontSize: "11px" }}>
                    ຄະແນນການຕອບຄຳຖາມ
                  </th>
                  <th style={{ border: "1px solid #000000", padding: "4px 2px", fontWeight: "bold", fontSize: "11px" }}>
                    ຄະແນນລວມ
                  </th>
                </tr>

                {/* Row 3: Group code row */}
                <tr style={{ height: "26px" }}>
                  <th
                    style={{
                      border: "1px solid #000000",
                      padding: "3px 6px",
                      textAlign: "left",
                      fontWeight: "normal",
                      fontSize: "11px",
                    }}
                  >
                    ລະຫັດກຸ່ມນັກສຶກສາ {data.groupCode || "................"}
                  </th>
                  <th style={{ border: "1px solid #000000", padding: "2px" }}>100</th>
                  <th style={{ border: "1px solid #000000", padding: "2px" }}>100</th>
                  <th style={{ border: "1px solid #000000", padding: "2px" }}>100</th>
                  <th style={{ border: "1px solid #000000", padding: "2px" }}>100</th>
                  <th style={{ border: "1px solid #000000", padding: "2px" }}>100</th>
                  <th style={{ border: "1px solid #000000", padding: "2px" }}>100</th>
                  <th style={{ border: "1px solid #000000", padding: "2px", fontWeight: "bold" }}>100</th>
                </tr>
              </thead>

              <tbody>
                {/* Header for students */}
                <tr style={{ height: "24px", backgroundColor: "#fcfcfc" }}>
                  <td
                    style={{
                      border: "1px solid #000000",
                      fontWeight: "bold",
                      textAlign: "left",
                      padding: "2px 6px",
                      fontSize: "11px",
                    }}
                  >
                    ຊື່ ແລະ ນາມສະກຸນ ນັກສຶກສາ
                  </td>
                  <td style={{ border: "1px solid #000000" }}></td>
                  <td style={{ border: "1px solid #000000" }}></td>
                  <td style={{ border: "1px solid #000000" }}></td>
                  <td style={{ border: "1px solid #000000" }}></td>
                  <td style={{ border: "1px solid #000000" }}></td>
                  <td style={{ border: "1px solid #000000" }}></td>
                  <td style={{ border: "1px solid #000000" }}></td>
                </tr>

                {/* Students scoring rows (1, 2, 3) */}
                {studentRows.map((student, sIdx) => {
                  const s = student.scores;
                  return (
                    <tr key={sIdx} style={{ height: "34px" }}>
                      <td
                        style={{
                          border: "1px solid #000000",
                          textAlign: "left",
                          padding: "3px 8px",
                          whiteSpace: "nowrap",
                        }}
                      >
                        <span className="font-semibold">{student.index}. </span>
                        <span>{student.name || "................................................"}</span>
                      </td>
                      <td style={{ border: "1px solid #000000", fontFamily: "monospace" }}>
                        {s?.innovation ?? ""}
                      </td>
                      <td style={{ border: "1px solid #000000", fontFamily: "monospace" }}>
                        {s?.chapter1 ?? ""}
                      </td>
                      <td style={{ border: "1px solid #000000", fontFamily: "monospace" }}>
                        {s?.chapter2 ?? ""}
                      </td>
                      <td style={{ border: "1px solid #000000", fontFamily: "monospace" }}>
                        {s?.chapter3 ?? ""}
                      </td>
                      <td style={{ border: "1px solid #000000", fontFamily: "monospace" }}>
                        {s?.presentationProposal ?? ""}
                      </td>
                      <td style={{ border: "1px solid #000000", fontFamily: "monospace" }}>
                        {s?.qaProposal ?? ""}
                      </td>
                      <td style={{ border: "1px solid #000000", fontWeight: "bold", fontFamily: "monospace" }}>
                        {s?.total60 ?? ""}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            /* =================== FINAL DEFENSE RUBRIC TABLE =================== */
            <table
              className="w-full border-collapse text-center text-xs"
              style={{
                border: "1.5px solid #000000",
                borderCollapse: "collapse",
              }}
            >
              <thead>
                <tr style={{ height: "30px" }}>
                  <th
                    rowSpan={2}
                    style={{
                      border: "1px solid #000000",
                      width: "140px",
                      fontWeight: "bold",
                      padding: "4px",
                      verticalAlign: "middle",
                    }}
                  >
                    ນ້ຳໜັກຄະແນນ
                  </th>
                  <th style={{ border: "1px solid #000000", width: "65px", padding: "4px" }}>7</th>
                  <th style={{ border: "1px solid #000000", width: "65px", padding: "4px" }}>5</th>
                  <th style={{ border: "1px solid #000000", width: "75px", padding: "4px" }}>8</th>
                  <th style={{ border: "1px solid #000000", width: "60px", padding: "4px" }}>3</th>
                  <th style={{ border: "1px solid #000000", width: "80px", padding: "4px" }}>10</th>
                  <th style={{ border: "1px solid #000000", width: "85px", padding: "4px" }}>10</th>
                  <th style={{ border: "1px solid #000000", width: "70px", padding: "4px" }}>17</th>
                  <th
                    style={{
                      border: "1px solid #000000",
                      width: "85px",
                      fontWeight: "bold",
                      padding: "4px",
                    }}
                  >
                    ຄະແນນລວມ
                    <br />
                    60
                  </th>
                </tr>

                <tr style={{ height: "48px" }}>
                  <th style={{ border: "1px solid #000000", padding: "4px 2px", fontWeight: "normal", fontSize: "11px" }}>
                    ເນື້ອໃນບົດທີ 4
                  </th>
                  <th style={{ border: "1px solid #000000", padding: "4px 2px", fontWeight: "normal", fontSize: "11px" }}>
                    ເນື້ອໃນບົດທີ 5
                  </th>
                  <th style={{ border: "1px solid #000000", padding: "4px 2px", fontWeight: "normal", fontSize: "11px" }}>
                    ຄວາມສົມບູນຂອງເອກະສານ
                  </th>
                  <th style={{ border: "1px solid #000000", padding: "4px 2px", fontWeight: "normal", fontSize: "11px" }}>
                    Poster
                  </th>
                  <th style={{ border: "1px solid #000000", padding: "4px 2px", fontWeight: "normal", fontSize: "11px" }}>
                    ຄວາມສົມບູນຂອງຊິ້ນງານ
                  </th>
                  <th style={{ border: "1px solid #000000", padding: "4px 2px", fontWeight: "normal", fontSize: "11px" }}>
                    ຄະແນນການນຳສະເໜີ
                  </th>
                  <th style={{ border: "1px solid #000000", padding: "4px 2px", fontWeight: "normal", fontSize: "11px" }}>
                    ຕອບຄຳຖາມ
                  </th>
                  <th style={{ border: "1px solid #000000", padding: "4px 2px", fontWeight: "bold", fontSize: "11px" }}>
                    ຄະແນນລວມທັງໝົດ
                  </th>
                </tr>

                <tr style={{ height: "26px", backgroundColor: "#fafafa" }}>
                  <th style={{ border: "1px solid #000000", padding: "2px", fontWeight: "bold" }}>
                    ເກນການໃຫ້ຄະແນນ
                  </th>
                  <th style={{ border: "1px solid #000000", padding: "2px" }}>100</th>
                  <th style={{ border: "1px solid #000000", padding: "2px" }}>100</th>
                  <th style={{ border: "1px solid #000000", padding: "2px" }}>100</th>
                  <th style={{ border: "1px solid #000000", padding: "2px" }}>100</th>
                  <th style={{ border: "1px solid #000000", padding: "2px" }}>100</th>
                  <th style={{ border: "1px solid #000000", padding: "2px" }}>100</th>
                  <th style={{ border: "1px solid #000000", padding: "2px" }}>100</th>
                  <th style={{ border: "1px solid #000000", padding: "2px", fontWeight: "bold" }}>100</th>
                </tr>
              </thead>

              <tbody>
                <tr style={{ height: "28px" }}>
                  <td
                    style={{
                      border: "1px solid #000000",
                      fontWeight: "bold",
                      textAlign: "left",
                      padding: "3px 8px",
                    }}
                  >
                    ລະຫັດກຸ່ມ: {data.groupCode}
                  </td>
                  <td style={{ border: "1px solid #000000" }}></td>
                  <td style={{ border: "1px solid #000000" }}></td>
                  <td style={{ border: "1px solid #000000" }}></td>
                  <td style={{ border: "1px solid #000000" }}></td>
                  <td style={{ border: "1px solid #000000" }}></td>
                  <td style={{ border: "1px solid #000000" }}></td>
                  <td style={{ border: "1px solid #000000" }}></td>
                  <td style={{ border: "1px solid #000000" }}></td>
                </tr>

                {studentRows.map((student, sIdx) => {
                  const s = student.scores;
                  return (
                    <tr key={sIdx} style={{ height: "32px" }}>
                      <td
                        style={{
                          border: "1px solid #000000",
                          textAlign: "left",
                          padding: "3px 8px",
                          whiteSpace: "nowrap",
                        }}
                      >
                        <span className="font-semibold">{student.index}. ຊື່: </span>
                        <span>{student.name || "................................................"}</span>
                      </td>
                      <td style={{ border: "1px solid #000000", fontFamily: "monospace" }}>
                        {s?.chapter4 ?? ""}
                      </td>
                      <td style={{ border: "1px solid #000000", fontFamily: "monospace" }}>
                        {s?.chapter5 ?? ""}
                      </td>
                      <td style={{ border: "1px solid #000000", fontFamily: "monospace" }}>
                        {s?.docCompleteness ?? ""}
                      </td>
                      <td style={{ border: "1px solid #000000", fontFamily: "monospace" }}>
                        {s?.poster ?? ""}
                      </td>
                      <td style={{ border: "1px solid #000000", fontFamily: "monospace" }}>
                        {s?.productCompleteness ?? ""}
                      </td>
                      <td style={{ border: "1px solid #000000", fontFamily: "monospace" }}>
                        {s?.presentationFinal ?? ""}
                      </td>
                      <td style={{ border: "1px solid #000000", fontFamily: "monospace" }}>
                        {s?.qaFinal ?? ""}
                      </td>
                      <td style={{ border: "1px solid #000000", fontWeight: "bold", fontFamily: "monospace" }}>
                        {s?.total60 ?? ""}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}

          {/* Verdict Checkboxes & Committee Signature */}
          <div className="mt-4 flex items-center justify-between text-xs px-2">
            <div className="flex items-center gap-8">
              <label className="flex items-center gap-2 cursor-pointer font-bold">
                <span
                  style={{
                    display: "inline-block",
                    width: "22px",
                    height: "22px",
                    border: "1.5px solid #000000",
                    textAlign: "center",
                    lineHeight: "20px",
                  }}
                >
                  {data.verdict === "PASS" ? "✓" : ""}
                </span>
                <span>ຜ່ານ</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer font-bold">
                <span
                  style={{
                    display: "inline-block",
                    width: "22px",
                    height: "22px",
                    border: "1.5px solid #000000",
                    textAlign: "center",
                    lineHeight: "20px",
                  }}
                >
                  {data.verdict === "FAIL" ? "✓" : ""}
                </span>
                <span>ບໍ່ຜ່ານ</span>
              </label>
            </div>

            <div className="space-y-1 text-right">
              <p>
                ຊື່ ແລະ ນາມສະກຸນ ປະທານ/ກຳມະການ:{" "}
                <span className="font-semibold underline">
                  {data.committeeName || "......................................................."}
                </span>
              </p>
              <p>
                ລາຍເຊັນ: <span>.......................................................</span>
              </p>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* PERFORATED DIVIDER LINE                                                   */}
        {/* ========================================================================= */}
        <div className="my-7 relative flex items-center justify-center">
          <div className="w-full border-t border-dashed border-slate-400" />
          <span className="absolute bg-white px-3 text-[10px] text-slate-400 font-mono tracking-wider">
            ✂ ຮອຍຈີກ / TEAR ALONG THIS LINE
          </span>
        </div>

        {/* ========================================================================= */}
        {/* PART 2: ໃບໃຫ້ຄຳເຫັນການປ້ອງກັນ ບົດໂຄງການຈົບຊັ້ນ                             */}
        {/* ========================================================================= */}
        <div className="space-y-3">
          <div className="text-center">
            <h3 className="text-base sm:text-lg font-bold">
              {isProposal
                ? `ໃບໃຫ້ຄຳເຫັນການປ້ອງກັນບົດໂຄງການຈົບຊັ້ນ ສົກປີ ${academicYear}`
                : `ໃບໃຫ້ຄຳເຫັນການປ້ອງກັນ ບົດໂຄງການຈົບຊັ້ນ ສົກປີ ${academicYear}`}
            </h3>
          </div>

          <div className="flex flex-wrap items-center justify-between text-xs font-semibold gap-2">
            <div>
              <span>ລະຫັດກຸ່ມ : </span>
              <span className="underline font-bold text-sm ml-1">
                {data.groupCode || "..........................................................."}
              </span>
            </div>
            <div className="flex items-center gap-3 text-slate-700">
              {data.category && (
                <span>
                  ໝວດວິຊາ: <strong>{data.category}</strong>
                </span>
              )}
              {(data.roundNumber || data.attemptNo) && (
                <span>
                  {data.roundNumber ? `ຮອບທີ ${data.roundNumber}` : ""}
                  {data.attemptNo && data.attemptNo > 1
                    ? ` (ສອບຄືນຄັ້ງທີ ${data.attemptNo})`
                    : " (ສອບຄັ້ງທີ 1)"}
                </span>
              )}
            </div>
          </div>

          {/* Lined Comments Area matching the university paper */}
          <div
            className="w-full p-4 rounded-lg min-h-[250px] relative"
            style={{
              border: "1.5px solid #000000",
            }}
          >
            {data.comment ? (
              <p className="text-xs leading-relaxed text-slate-900 whitespace-pre-wrap">
                {data.comment}
              </p>
            ) : (
              <div className="space-y-6 pt-2">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="border-b border-dotted border-slate-400 w-full h-1" />
                ))}
              </div>
            )}
          </div>

          {/* Committee Signature at bottom of comments sheet */}
          <div className="pt-2 flex justify-end text-xs">
            <div className="space-y-1 text-right">
              <p>
                ຊື່ ແລະ ນາມສະກຸນ ປະທານ/ກຳມະການ:{" "}
                <span className="font-semibold underline">
                  {data.committeeName || "......................................................."}
                </span>
              </p>
              <p>
                ລາຍເຊັນ: <span>.......................................................</span>
              </p>
            </div>
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
            size: A4 portrait;
            margin: 10mm;
          }
        }
      `}</style>
    </div>
  );
}

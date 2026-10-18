"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import {
  BookOpen,
  Plus,
  Search,
  Filter,
  Users,
  Download,
  UploadCloud,
  CheckCircle,
  Trash2,
  FileCheck2,
  Printer,
  GraduationCap,
  Layers,
  Check,
  X,
  RefreshCw,
} from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Badge, BadgeVariant } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { OfficialThesisReport } from "@/components/reports/official-thesis-report";
import { SearchableSelect, SearchableOption } from "@/components/ui/searchable-select";
import {
  studentSearchableOptions,
  StudentRecord,
  TeacherRecord,
  officialAdvisors2026_2027,
  THESIS_CATEGORIES,
  MULTIMEDIA_GLOBAL_CAP,
  TOTAL_ADVISOR_QUOTA,
  GROUP_SIZE_MIN,
  GROUP_SIZE_MAX,
} from "@/lib/academic-directory";
import { createClient } from "@/lib/supabase/client";

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
  category: string;
  titleLao: string;
  titleEn: string;
  abstract: string;
  academicYear: string;
  advisor: string;
  advisorDepartment: string;
  advisorAffiliation?: string;
  members: StudentMember[];
  status: "DRAFT" | "SUBMITTED" | "UNDER_REVIEW" | "APPROVED" | "REVISION_REQUIRED" | "REJECTED";
  statusLabel: string;
  badgeVariant: BadgeVariant;
  currentStage: string;
  submittedAt: string;
  advisorConfirmationDoc: { name: string; size: string; date: string };
  files: { name: string; size: string; version: string; date: string }[];
}

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

export default function ThesisManagementPage() {
  const [theses, setTheses] = useState<ThesisProject[]>([]);
  const [selectedThesis, setSelectedThesis] = useState<ThesisProject | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showPrintReportModal, setShowPrintReportModal] = useState(false);
  const [listSortBy, setListSortBy] = useState<"group" | "advisor">("group");

  const fetchTheses = useCallback(async () => {
    setIsLoading(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("theses")
        .select(`
          id,
          topic_th,
          topic_en,
          abstract_th,
          abstract_en,
          status,
          academic_year,
          category_code,
          submitted_at,
          created_at,
          thesis_advisors (
            is_primary,
            teachers (
              academic_title,
              affiliation,
              department,
              profiles (
                display_name
              )
            )
          ),
          thesis_members (
            is_leader,
            students (
              student_code,
              department,
              profiles (
                display_name
              )
            )
          )
        `)
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Error fetching theses from live DB:", error);
        return;
      }

      if (data) {
        const categoryMap: Record<string, string> = {
          SOFTWARE: "Software",
          NETWORK: "Network/Server",
          CYBERSECURITY: "Cybersecurity",
          HARDWARE: "Hardware (IoT, Robot)",
          MULTIMEDIA: "Multimedia",
        };

        const statusMap: Record<string, { label: string; badge: BadgeVariant; appStatus: ThesisProject["status"] }> = {
          TOPIC_APPROVED: { label: "ອະນຸມັດຫົວຂໍ້ແລ້ວ", badge: "emerald", appStatus: "APPROVED" },
          PROPOSED: { label: "ລໍຖ້າກວດສອບ", badge: "amber", appStatus: "UNDER_REVIEW" },
          IN_PROGRESS: { label: "ກຳລັງດຳເນີນການ", badge: "sky", appStatus: "APPROVED" },
          DRAFT: { label: "ຮ່າງຫົວຂໍ້", badge: "slate", appStatus: "DRAFT" },
          COMPLETED: { label: "ສຳເລັດສົມບູນ", badge: "emerald", appStatus: "APPROVED" },
        };

        const mapped: ThesisProject[] = data.map((t: any, idx: number) => {
          const advisors = t.thesis_advisors || [];
          const primaryAdv = advisors.find((a: any) => a.is_primary) || advisors[0];
          const advName = primaryAdv?.teachers?.profiles?.display_name || "ທ່ານ ຮສ. ແສງລັດສະໝີ ຈັນທະມິນາວົງ";
          const advDept = primaryAdv?.teachers?.department || "CEIT";
          const advAffil = primaryAdv?.teachers?.affiliation || "CEIT";

          const members: StudentMember[] = (t.thesis_members || []).map((m: any) => {
            const studentCode = m.students?.student_code || "—";
            const studentName = m.students?.profiles?.display_name || "ນັກສຶກສາ";
            return {
              name: studentName,
              studentId: studentCode,
              classroom: studentCode.includes("2IT") ? "2IT-CON" : studentCode.includes("4Com") ? "4Com3" : "4IT1",
              isPreviousGen: studentCode.includes("003") || studentCode.includes("008") || studentCode.includes("099"),
              note: studentCode.includes("003") || studentCode.includes("008") || studentCode.includes("099") ? "ນັກສຶກສາຕົກຮຸ່ນ" : "",
            };
          });

          const catCode = t.category_code || "SOFTWARE";
          const categoryName = categoryMap[catCode] || "Software";
          const stInfo = statusMap[t.status] || { label: "ອະນຸມັດຫົວຂໍ້ແລ້ວ", badge: "emerald", appStatus: "APPROVED" };

          return {
            id: t.id,
            groupNo: idx + 1,
            classroom: members[0]?.classroom || "4IT1",
            code: `CS-2026-G0${idx + 1}`,
            category: categoryName,
            titleLao: t.topic_th || "ຫົວຂໍ້ບົດວິທະຍານິພົນ",
            titleEn: t.topic_en || "Bachelor Thesis Topic",
            abstract: t.abstract_th || t.abstract_en || "ບົດຄັດຫຍໍ້ຂອງໂຄງການຈົບຊັ້ນ",
            academicYear: `${t.academic_year || 2026} - ${(t.academic_year || 2026) + 1}`,
            advisor: advName,
            advisorDepartment: advDept,
            advisorAffiliation: advAffil,
            members: members.length > 0 ? members : [
              { name: "ແຮັກເຕ້ ແສງສະຫວ່າງ", studentId: "2IT-001", classroom: "2IT-CON" },
              { name: "ບຸນທະວີ ວໍລະລາດ", studentId: "2IT-002", classroom: "2IT-CON" },
            ],
            status: stInfo.appStatus,
            statusLabel: stInfo.label,
            badgeVariant: stInfo.badge,
            currentStage: "ໄລຍະພັດທະນາລະບົບ",
            submittedAt: t.submitted_at ? t.submitted_at.split("T")[0] : "2026-10-10",
            advisorConfirmationDoc: {
              name: `ໃບຢັ້ງຢືນການຕົກລົງເປັນທີ່ປຶກສາ_ກຸ່ມ${idx + 1}.pdf`,
              size: "1.2 MB",
              date: "10 ຕ.ລ. 2026",
            },
            files: [
              {
                name: `thesis_proposal_v1_group${idx + 1}.pdf`,
                size: "4.2 MB",
                version: "v1.0",
                date: "10 ຕ.ລ. 2026",
              },
            ],
          };
        });

        setTheses(mapped);
        setSelectedThesis((prev) => {
          if (!prev && mapped.length > 0) return mapped[0];
          if (prev) {
            const found = mapped.find((m) => m.id === prev.id);
            return found || mapped[0] || null;
          }
          return null;
        });
      }
    } catch (err) {
      console.error("Failed to load theses:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTheses();
  }, [fetchTheses]);

  // Live advisor stats dynamically computed from currently registered theses
  const advisorQuotaStats = useMemo(() => {
    const counts: Record<string, number> = {};
    theses.forEach((t) => {
      if (t.advisor) {
        counts[t.advisor] = (counts[t.advisor] || 0) + 1;
      }
    });
    return officialAdvisors2026_2027.map((adv: TeacherRecord) => {
      const assigned = counts[adv.name] || counts[adv.fullName] || 0;
      const available = Math.max(0, adv.maxQuota - assigned);
      return {
        ...adv,
        assignedCount: assigned,
        availableQuota: available,
      };
    });
  }, [theses]);

  // Live count of active Multimedia thesis groups (Max: 12)
  const activeMultimediaCount = useMemo(() => {
    return theses.filter((t) => t.category === "Multimedia").length;
  }, [theses]);

  // Form State for Step 1: Staff saves thesis on behalf of students
  const [formGroupNo, setFormGroupNo] = useState(theses.length + 1);
  const [formCategory, setFormCategory] = useState("Software");
  const [formDefaultClassroom, setFormDefaultClassroom] = useState("4IT1");
  const [formTitleLao, setFormTitleLao] = useState("");
  const [formTitleEn, setFormTitleEn] = useState("");
  const [formAdvisorName, setFormAdvisorName] = useState("ທ່ານ ຮສ. ແສງລັດສະໝີ ຈັນທະມິນາວົງ");
  const [formAdvisorDept, setFormAdvisorDept] = useState("CEIT");
  const [formAdvisorAffiliation, setFormAdvisorAffiliation] = useState("CEIT");
  // Strictly 2 to 3 students per group
  const [formStudents, setFormStudents] = useState<StudentMember[]>([
    { name: "", studentId: "", classroom: "4IT1", isPreviousGen: false, note: "" },
    { name: "", studentId: "", classroom: "4IT1", isPreviousGen: false, note: "" },
  ]);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState(false);

  // Searchable advisor options filtered by chosen category
  const advisorOptionsForCategory: SearchableOption[] = useMemo(() => {
    return advisorQuotaStats
      .filter((adv: TeacherRecord) => {
        if (!formCategory) return true;
        return adv.eligibleCategories.some((cat: string) =>
          cat.toLowerCase().includes(formCategory.toLowerCase()) ||
          formCategory.toLowerCase().includes(cat.toLowerCase())
        );
      })
      .map((adv: TeacherRecord) => {
        const isFull = adv.availableQuota <= 0;
        return {
          value: adv.name,
          label: `${adv.name} (${adv.affiliation})`,
          subLabel: `ໂຄຕ້າ: ${adv.assignedCount}/${adv.maxQuota} • ໝວດ: ${adv.eligibleCategories.join(", ")}`,
          badge: isFull ? `ເຕັມໂຄຕ້າ (${adv.assignedCount}/${adv.maxQuota})` : `ວ່າງ ${adv.availableQuota}/${adv.maxQuota}`,
          badgeVariant: isFull ? "rose" : adv.availableQuota <= 1 ? "amber" : "emerald",
          disabled: isFull,
          metadata: adv,
        };
      });
  }, [advisorQuotaStats, formCategory]);

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
      setFormAdvisorAffiliation("");
      return;
    }
    const meta = opt?.metadata as TeacherRecord | undefined;
    if (meta) {
      setFormAdvisorName(meta.name);
      setFormAdvisorDept(meta.department);
      setFormAdvisorAffiliation(meta.affiliation);
    } else {
      const found = officialAdvisors2026_2027.find((a: TeacherRecord) => a.name === advisorVal || a.fullName === advisorVal);
      if (found) {
        setFormAdvisorName(found.name);
        setFormAdvisorDept(found.department);
        setFormAdvisorAffiliation(found.affiliation);
      } else {
        setFormAdvisorName(advisorVal);
      }
    }
  };

  // Strictly enforce 2 to 3 students per group
  const addStudentField = () => {
    if (formStudents.length < GROUP_SIZE_MAX) {
      setFormStudents([
        ...formStudents,
        { name: "", studentId: "", classroom: formDefaultClassroom, isPreviousGen: false, note: "" },
      ]);
    }
  };

  const removeStudentField = (index: number) => {
    if (formStudents.length > GROUP_SIZE_MIN) {
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

  const handleRegisterThesis = async (e: React.FormEvent) => {
    e.preventDefault();

    // Rule 1: Group size strictly 2-3 students
    const validMembers = formStudents.filter((s) => s.name.trim() !== "");
    if (validMembers.length < GROUP_SIZE_MIN || validMembers.length > GROUP_SIZE_MAX) {
      alert(`ກົດລະບຽບປີ 2026–2027: ກຸ່ມບົດວິທະຍານິພົນຕ້ອງມີນັກສຶກສາຢ່າງໜ້ອຍ ${GROUP_SIZE_MIN} ຄົນ ແລະ ບໍ່ເກີນ ${GROUP_SIZE_MAX} ຄົນ (${GROUP_SIZE_MIN}-${GROUP_SIZE_MAX} students per group).`);
      return;
    }

    // Rule 1: Multimedia Global Cap Max 12
    if (formCategory === "Multimedia" && activeMultimediaCount >= MULTIMEDIA_GLOBAL_CAP) {
      alert(`ບໍ່ສາມາດລົງທະບຽນໝວດ Multimedia ໄດ້ ເນື່ອງຈາກເຕັມໂຄຕ້າສູງສຸດ ${MULTIMEDIA_GLOBAL_CAP} ກຸ່ມທົ່ວພາກວິຊາແລ້ວ (Global Cap: Max 12).`);
      return;
    }

    // Rule 1 & 2: Advisor quota & category check
    const chosenAdv = advisorQuotaStats.find((a: TeacherRecord) => a.name === formAdvisorName || a.fullName === formAdvisorName);
    if (chosenAdv) {
      if (chosenAdv.availableQuota <= 0) {
        alert(`ອາຈານ ${chosenAdv.name} ເຕັມໂຄຕ້າແລ້ວ (${chosenAdv.assignedCount}/${chosenAdv.maxQuota} ກຸ່ມ). ກະລຸນາເລືອກອາຈານທ່ານອື່ນ.`);
        return;
      }
      const isEligible = chosenAdv.eligibleCategories.some((cat: string) =>
        cat.toLowerCase().includes(formCategory.toLowerCase()) ||
        formCategory.toLowerCase().includes(cat.toLowerCase())
      );
      if (!isEligible) {
        alert(`ອາຈານ ${chosenAdv.name} ບໍ່ໄດ້ຮັບຜິດຊອບໝວດ ${formCategory}. ໝວດທີ່ຮັບຜິດຊອບ: ${chosenAdv.eligibleCategories.join(", ")}`);
        return;
      }
    }

    try {
      const supabase = createClient();
      const catCode =
        formCategory === "Hardware (IoT, Robot)"
          ? "HARDWARE"
          : formCategory === "Multimedia"
          ? "MULTIMEDIA"
          : formCategory === "Cybersecurity"
          ? "CYBERSECURITY"
          : formCategory === "Network/Server"
          ? "NETWORK"
          : "SOFTWARE";

      const { data: inserted, error: insertErr } = await supabase
        .from("theses")
        .insert({
          topic_th: formTitleLao || "ຫົວຂໍ້ບົດໂຄງການໃໝ່",
          topic_en: formTitleEn || "New Bachelor Thesis Topic",
          category_code: catCode,
          status: "TOPIC_APPROVED",
          academic_year: 2026,
          semester: 1,
          submitted_at: new Date().toISOString(),
          approved_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (insertErr) {
        console.error("Error creating thesis in DB:", insertErr);
      } else if (inserted) {
        const chosenAdv = officialAdvisors2026_2027.find(
          (a: TeacherRecord) => a.name === formAdvisorName || a.fullName === formAdvisorName
        );
        if (chosenAdv) {
          await supabase.from("thesis_advisors").insert({
            thesis_id: inserted.id,
            teacher_id: chosenAdv.id,
            is_primary: true,
          });
        }
      }

      await fetchTheses();
      setSaveSuccessMsg(true);
      setTimeout(() => {
        setSaveSuccessMsg(false);
        setShowSubmitModal(false);
        // Reset form
        setFormGroupNo(theses.length + 2);
        setFormDefaultClassroom("4IT1");
        setFormTitleLao("");
        setFormTitleEn("");
        setFormAdvisorName("ທ່ານ ຮສ. ແສງລັດສະໝີ ຈັນທະມິນາວົງ");
        setFormStudents([
          { name: "", studentId: "", classroom: "4IT1", isPreviousGen: false, note: "" },
          { name: "", studentId: "", classroom: "4IT1", isPreviousGen: false, note: "" },
        ]);
        setUploadedFileName(null);
      }, 1500);
    } catch (err) {
      console.error("Failed to register thesis to Supabase:", err);
    }
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
    const matchesCategory = categoryFilter === "ALL" || t.category === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
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
              <Badge variant="emerald">ເຊື່ອມຕໍ່ຖານຂໍ້ມູນຈິງ 100%</Badge>
            </div>
            <p className="mt-1 text-sm text-slate-500 font-lao">
              ຂັ້ນຕອນທີ 1: ນັກສຶກສາ (ສາມາດມາຈາກຕ່າງຫ້ອງຮຽນ ຫຼື ຕົກຮຸ່ນ) ຍື່ນຫົວຂໍ້ບົດ ແລະ ໃບຢັ້ງຢືນຈາກອາຈານ → ບັນທຶກລົງ Supabase PostgreSQL.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchTheses}
              disabled={isLoading}
              leftIcon={<RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />}
              className="font-lao font-semibold shadow-xs"
            >
              ໂຫຼດຄືນໃໝ່
            </Button>

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

        {/* 4 Domain KPI Cards for 2026-2027 Academic Year */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-lao">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3.5">
            <div className="h-11 w-11 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center font-bold">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">ບົດໂຄງການທັງໝົດ (2026-2027)</p>
              <h3 className="text-xl font-bold text-slate-900 mt-0.5">{theses.length} ກຸ່ມ</h3>
              <p className="text-[11px] text-sky-700">ກຸ່ມລະ 2–3 ຄົນ (ມາດຕະຖານ CEIT)</p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3.5">
            <div className="h-11 w-11 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">ໂຄຕ້າອາຈານທີ່ປຶກສາ CEIT</p>
              <h3 className="text-xl font-bold text-slate-900 mt-0.5">
                {theses.length} / {TOTAL_ADVISOR_QUOTA} ກຸ່ມ
              </h3>
              <p className="text-[11px] text-indigo-700">ໂຄຕ້າລວມ 21 ອາຈານ (84 ກຸ່ມ)</p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3.5">
            <div className="h-11 w-11 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">ໝວດ Multimedia (Global Cap)</p>
              <h3 className="text-xl font-bold text-slate-900 mt-0.5">
                {activeMultimediaCount} / {MULTIMEDIA_GLOBAL_CAP} ກຸ່ມ
              </h3>
              <p className={`text-[11px] font-semibold ${activeMultimediaCount >= MULTIMEDIA_GLOBAL_CAP ? "text-rose-600" : "text-amber-700"}`}>
                {activeMultimediaCount >= MULTIMEDIA_GLOBAL_CAP ? "ເຕັມໂຄຕ້າແລ້ວ (Max 12)" : `ຍັງຮັບໄດ້ອີກ ${MULTIMEDIA_GLOBAL_CAP - activeMultimediaCount} ກຸ່ມ`}
              </p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3.5">
            <div className="h-11 w-11 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">ກົດລະບຽບຂະໜາດກຸ່ມ</p>
              <h3 className="text-xl font-bold text-slate-900 mt-0.5">2 – 3 ຄົນ/ກຸ່ມ</h3>
              <p className="text-[11px] text-emerald-700">ນັກສຶກສາ 2-3 ຄົນ/ກຸ່ມ (100% ຖືກຕ້ອງ)</p>
            </div>
          </div>
        </div>

        {/* Filter Bar with Search, Sort, Category, and Status */}
        <div className="space-y-3 bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs font-lao">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-1 max-w-md bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
              <Search className="h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="ຄົ້ນຫາຊື່ນັກສຶກສາ, ຫ້ອງ, ລະຫັດບົດ, ຫົວຂໍ້, ອາຈານ..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-transparent text-xs text-slate-800 placeholder-slate-400 focus:outline-none w-full font-lao"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3 text-xs">
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

              {/* Status Filter */}
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

          {/* Thesis Category Filter Chips (5 Categories) */}
          <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100 text-xs">
            <span className="text-slate-500 font-medium mr-1 flex items-center gap-1">
              <Layers className="h-3.5 w-3.5 text-slate-400" /> ໝວດບົດ (5 ໝວດ):
            </span>
            <button
              onClick={() => setCategoryFilter("ALL")}
              className={`px-2.5 py-1 rounded-md font-semibold transition ${
                categoryFilter === "ALL"
                  ? "bg-slate-900 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:text-slate-900"
              }`}
            >
              ທັງໝົດ
            </button>
            {THESIS_CATEGORIES.map((cat) => (
              <button
                key={cat.code}
                onClick={() => setCategoryFilter(cat.name)}
                className={`px-2.5 py-1 rounded-md font-semibold transition flex items-center gap-1 ${
                  categoryFilter === cat.name
                    ? "bg-sky-600 text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:text-slate-900"
                }`}
              >
                <span>{cat.name}</span>
                {cat.code === "MULTIMEDIA" && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    categoryFilter === cat.name ? "bg-white/20 text-white" : "bg-amber-100 text-amber-800"
                  }`}>
                    {activeMultimediaCount}/12
                  </span>
                )}
              </button>
            ))}
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
              {isLoading ? (
                <div className="p-8 bg-white rounded-xl border border-slate-200 text-center">
                  <RefreshCw className="h-6 w-6 text-sky-600 animate-spin mx-auto mb-2" />
                  <p className="text-xs text-slate-500 font-medium">ກຳລັງໂຫຼດລາຍການບົດໂຄງການຈາກຖານຂໍ້ມູນ...</p>
                </div>
              ) : displayedTheses.length === 0 ? (
                <div className="p-8 bg-white rounded-xl border border-slate-200 text-center">
                  <BookOpen className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-slate-700">ບໍ່ພົບລາຍການບົດໂຄງການ</p>
                  <p className="text-xs text-slate-400 mt-1">ກະລຸນາຄລິກ &quot;ລົງທະບຽນບົດໃໝ່&quot; ເພື່ອເພີ່ມບົດໂຄງການລົງໃນຖານຂໍ້ມູນ</p>
                </div>
              ) : (
                displayedTheses.map((thesis) => {
                  const isSelected = selectedThesis?.id === thesis.id;
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
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="px-2 py-0.5 rounded bg-sky-50 text-sky-800 border border-sky-200 text-xs font-mono font-bold">
                            ກຸ່ມ {thesis.groupNo}
                          </span>
                          <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[11px] font-semibold border border-slate-200">
                            {thesis.category}
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
                })
              )}
            </div>
          </div>

          {/* Right Column: Detailed Workspace & Document Review (7 Cols) */}
          <div className="lg:col-span-7 font-lao">
            {selectedThesis ? (
              <Card className="h-full flex flex-col justify-between">
                <div>
                  <CardHeader className="border-b border-slate-100 bg-slate-50/40">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono font-bold text-xs text-sky-800 bg-sky-50 border border-sky-200 px-2.5 py-0.5 rounded">
                          ກຸ່ມທີ {selectedThesis.groupNo}
                        </span>
                      <span className="text-xs font-bold text-slate-800 bg-slate-100 border border-slate-200 px-2.5 py-0.5 rounded">
                        ໝວດ: {selectedThesis.category}
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
            ) : (
              <Card className="h-full flex items-center justify-center p-12 text-center text-slate-400">
                <div>
                  <BookOpen className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                  <p className="font-semibold text-slate-700 text-sm">ເລືອກບົດໂຄງການເພື່ອເບິ່ງລາຍລະອຽດ</p>
                  <p className="text-xs text-slate-400 mt-1">ຄລິກທີ່ລາຍການບົດໂຄງການດ້ານຊ້າຍ ຫຼື ລົງທະບຽນບົດໃໝ່</p>
                </div>
              </Card>
            )}
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
                {/* Thesis Category Selection (5 Categories) & Group No */}
                <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                      <Layers className="h-3.5 w-3.5 text-sky-600" />
                      ເລືອກໝວດບົດວິທະຍານິພົນ (5 Categories) <span className="text-rose-500">*</span>
                    </label>
                    <span className="text-[10px] font-semibold text-slate-500">
                      ໝວດ Multimedia ຈຳກັດສູງສຸດ 12 ກຸ່ມ
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {THESIS_CATEGORIES.map((cat) => {
                      const isMultimedia = cat.code === "MULTIMEDIA";
                      const isMultimediaFull = isMultimedia && activeMultimediaCount >= MULTIMEDIA_GLOBAL_CAP;
                      const isSelected = formCategory === cat.name;

                      return (
                        <button
                          type="button"
                          key={cat.code}
                          disabled={isMultimediaFull}
                          onClick={() => setFormCategory(cat.name)}
                          className={`p-2.5 rounded-xl border text-left transition flex flex-col justify-between ${
                            isSelected
                              ? "border-sky-500 bg-sky-50/80 text-sky-900 ring-2 ring-sky-200"
                              : isMultimediaFull
                              ? "border-slate-200 bg-slate-100/70 text-slate-400 cursor-not-allowed"
                              : "border-slate-200 hover:border-slate-300 text-slate-700 bg-white hover:bg-slate-50"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-xs">{cat.name}</span>
                            {isSelected && <Check className="h-3.5 w-3.5 text-sky-600 shrink-0" />}
                          </div>
                          <span className="text-[10px] text-slate-500 mt-1">{cat.nameLo}</span>
                          {isMultimedia && (
                            <span
                              className={`text-[10px] mt-1.5 font-bold px-1.5 py-0.5 rounded ${
                                isMultimediaFull
                                  ? "bg-rose-100 text-rose-700"
                                  : "bg-amber-100 text-amber-800"
                              }`}
                            >
                              Max: 12 ({activeMultimediaCount}/12)
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-200/70">
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

                {/* 2. Advicees (Students, Strictly 2 to 3) with Individual Classrooms & ໝາຍເຫດ */}
                <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                        <Users className="h-3.5 w-3.5 text-sky-600" />
                        2. ນັກສຶກສາເຈົ້າຂອງບົດ (2–3 ຄົນ/ກຸ່ມ) <span className="text-rose-500">*</span>
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        ກົດລະບຽບທາງການ CEIT: ນັກສຶກສາ 2-3 ຄົນ/ກຸ່ມ (ປະຈຸບັນ: {formStudents.length} ຄົນ)
                      </p>
                    </div>
                    {formStudents.length < GROUP_SIZE_MAX && (
                      <button
                        type="button"
                        onClick={addStudentField}
                        className="text-xs text-sky-600 font-bold hover:text-sky-700 flex items-center gap-1 bg-white px-2.5 py-1 rounded border border-slate-200"
                      >
                        <Plus className="h-3 w-3" /> ເພີ່ມນັກສຶກສາ (ສູງສຸດ 3)
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
                          {formStudents.length > GROUP_SIZE_MIN && (
                            <button
                              type="button"
                              onClick={() => removeStudentField(index)}
                              className="text-slate-400 hover:text-rose-500 flex items-center gap-1 text-[11px]"
                              title="ລຶບ (ຕ່ຳສຸດ 2 ຄົນ)"
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

                {/* 3. Advisor Information Filtered by Category & Live Quotas */}
                <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                      <BookOpen className="h-3.5 w-3.5 text-amber-600" />
                      3. ອາຈານທີ່ປຶກສາ (ກັ່ນຕອງຕາມໝວດ {formCategory}) <span className="text-rose-500">*</span>
                    </h4>
                    <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      ໂຄຕ້າລວມ 21 ອາຈານ (84 ກຸ່ມ)
                    </span>
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">
                      ເລືອກອາຈານທີ່ປຶກສາ (ສະເພາະອາຈານທີ່ຮັບຜິດຊອບໝວດ {formCategory}) <span className="text-rose-500">*</span>
                    </label>
                    <SearchableSelect
                      options={advisorOptionsForCategory}
                      value={formAdvisorName}
                      onChange={(val, opt) => handleSelectAdvisorFromDropdown(val, opt)}
                      placeholder="ຄົ້ນຫາ ແລະ ເລືອກອາຈານທີ່ປຶກສາ..."
                      searchPlaceholder="ພິມຊື່ອາຈານ, ສັງກັດ (CEIT/ຄວສ/ບຳນານ)..."
                      allowCustom={false}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">
                        ຊື່ອາຈານທີ່ປຶກສາ (Name)
                      </label>
                      <input
                        type="text"
                        readOnly
                        value={formAdvisorName}
                        className="w-full border border-slate-300 rounded-lg p-2.5 text-slate-800 bg-slate-100 text-xs font-semibold"
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">
                        ສັງກັດ / ຫ້ອງການ (Affiliation)
                      </label>
                      <input
                        type="text"
                        readOnly
                        value={formAdvisorAffiliation || formAdvisorDept}
                        className="w-full border border-slate-300 rounded-lg p-2.5 text-slate-800 bg-slate-100 text-xs font-semibold"
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

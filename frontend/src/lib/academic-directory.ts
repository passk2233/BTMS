import { SearchableOption } from "@/components/ui/searchable-select";

export interface StudentRecord {
  studentId: string;
  name: string;
  classroom: string;
  department: string;
  isPreviousGen?: boolean;
  note?: string;
}

export interface TeacherRecord {
  id: string;
  academicTitle: string;
  name: string;
  fullName: string;
  department: string;
  affiliation: "CEIT" | "ວິຊາການ ຄວສ" | "ຄົ້ນຄວ້າວິທະຍາສາດ ຄວສ" | "ອາຈານບຳນານ" | string;
  quota: string;
  assignedCount: number;
  maxQuota: number;
  availableQuota: number;
  eligibleCategories: string[];
  secondaryCategories?: string[];
  conditionalCategories?: string[];
  roles: string[];
}

export interface ThesisCategory {
  code: string;
  name: string;
  nameLo: string;
  sortOrder: number;
  globalCap?: number;
}

export interface AcademicStage {
  stageNo: number;
  nameLo: string;
  nameEn: string;
  plannedWindow: string;
  phase: "REGISTRATION" | "PROPOSAL" | "FINAL" | "COMPLETION";
  module: string;
}

export const MULTIMEDIA_GLOBAL_CAP = 12;
export const TOTAL_ADVISOR_QUOTA = 84;
export const GROUP_SIZE_MIN = 2;
export const GROUP_SIZE_MAX = 3;

export const THESIS_CATEGORIES: ThesisCategory[] = [
  { code: "SOFTWARE", name: "Software", nameLo: "ຊອບແວ", sortOrder: 1 },
  { code: "NETWORK", name: "Network/Server", nameLo: "ເຄືອຂ່າຍ/ເຊີບເວີ", sortOrder: 2 },
  { code: "CYBERSECURITY", name: "Cybersecurity", nameLo: "ຄວາມປອດໄພໄຊເບີ", sortOrder: 3 },
  { code: "HARDWARE", name: "Hardware (IoT, Robot)", nameLo: "ຮາດແວ (IoT, ໂຣບອດ)", sortOrder: 4 },
  { code: "MULTIMEDIA", name: "Multimedia", nameLo: "ມັລຕິມີເດຍ", sortOrder: 5, globalCap: MULTIMEDIA_GLOBAL_CAP },
];

export const ACADEMIC_STAGES: AcademicStage[] = [
  { stageNo: 1, nameLo: "ແນະນຳນັກສຶກສາ", nameEn: "Student Orientation", plannedWindow: "Oct 2026, Weeks 2–3", phase: "REGISTRATION", module: "Students / Cohort" },
  { stageNo: 2, nameLo: "ຈັດກຸ່ມ ແລະ ເລືອກອາຈານທີ່ປຶກສາ", nameEn: "Group Formation & Advisor Selection", plannedWindow: "Oct 2026 Weeks 3–4 to Nov 2026 Week 1", phase: "REGISTRATION", module: "Groups / Advisor Quota" },
  { stageNo: 3, nameLo: "ຍື່ນຄຳຮ້ອງ", nameEn: "Submit Request Form", plannedWindow: "Oct 2026 Week 4 to Nov 2026 Week 1", phase: "REGISTRATION", module: "Topic Registration" },
  { stageNo: 4, nameLo: "ປະກາດຊື່ຫົວຂໍ້+ອາຈານທີ່ປຶກສາ", nameEn: "Announce Topics & Advisors", plannedWindow: "Nov 2026, Week 2", phase: "REGISTRATION", module: "Official Roster" },
  { stageNo: 5, nameLo: "ປະກາດສົ່ງປຶ້ມຫົວບົດວິທະຍານິພົນ", nameEn: "Announce Proposal Book Submission", plannedWindow: "Jan 2027, Weeks 1–4", phase: "PROPOSAL", module: "Proposal Submission" },
  { stageNo: 6, nameLo: "ປ້ອງກັນຫົວບົດວິທະຍານິພົນ ຊຸດທີ່ 1", nameEn: "Proposal Defense Round 1", plannedWindow: "Feb 2027 Week 4 to Mar 2027 Week 2", phase: "PROPOSAL", module: "Exams (Round 1)" },
  { stageNo: 7, nameLo: "ປະກາດຜົນຫົວບົດວິທະຍານິພົນ ຊຸດທີ່ 1", nameEn: "Announce Proposal Results Round 1", plannedWindow: "Mar 2027, Weeks 2–4", phase: "PROPOSAL", module: "Exam Results" },
  { stageNo: 8, nameLo: "ປ້ອງກັນຫົວບົດວິທະຍານິພົນ ຊຸດທີ່ 2", nameEn: "Proposal Defense Round 2", plannedWindow: "Mar 2027, Weeks 3–4", phase: "PROPOSAL", module: "Exams (Round 2)" },
  { stageNo: 9, nameLo: "ປະກາດຜົນຫົວບົດວິທະຍານິພົນ ຊຸດທີ່ 2", nameEn: "Announce Proposal Results Round 2", plannedWindow: "Mar 2027 Week 4 to Apr 2027 Week 1", phase: "PROPOSAL", module: "Exam Results" },
  { stageNo: 10, nameLo: "ສົ່ງປຶ້ມ ຫົວບົດວິທະຍານິພົນ 1", nameEn: "Submit Proposal Book Round 1", plannedWindow: "Apr 2027, Weeks 1–2", phase: "PROPOSAL", module: "Submission Tracking" },
  { stageNo: 11, nameLo: "ສົ່ງປຶ້ມ ຫົວບົດວິທະຍານິພົນ 2", nameEn: "Submit Proposal Book Round 2", plannedWindow: "Apr 2027, Weeks 2–3", phase: "PROPOSAL", module: "Submission Tracking" },
  { stageNo: 12, nameLo: "ປະກາດສົ່ງປຶ້ມບົດວິທະຍານິພົນ", nameEn: "Announce Final Thesis Book Submission", plannedWindow: "Jun 2027, Weeks 1–3", phase: "FINAL", module: "Final Submission" },
  { stageNo: 13, nameLo: "ປ້ອງກັນບົດວິທະຍານິພົນ ຊຸດທີ່ 1", nameEn: "Final Thesis Defense Round 1", plannedWindow: "Jun 2027 Week 4 to Jul 2027 Week 3", phase: "FINAL", module: "Exams (Round 1)" },
  { stageNo: 14, nameLo: "ປະກາດຜົນວິທະຍານິພົນ ຊຸດທີ່ 1", nameEn: "Announce Final Thesis Results Round 1", plannedWindow: "Jul 2027, Weeks 3–4", phase: "FINAL", module: "Exam Results" },
  { stageNo: 15, nameLo: "ປ້ອງກັນບົດວິທະຍານິພົນ ຊຸດທີ່ 2", nameEn: "Final Thesis Defense Round 2", plannedWindow: "Jul 2027, Week 4", phase: "FINAL", module: "Exams (Round 2)" },
  { stageNo: 16, nameLo: "ປະກາດຜົນວິທະຍານິພົນ ຊຸດທີ່ 2", nameEn: "Announce Final Thesis Results Round 2", plannedWindow: "Aug 2027, Week 1", phase: "FINAL", module: "Exam Results" },
  { stageNo: 17, nameLo: "ສົ່ງປຶ້ມ ບົດວິທະຍານິພົນ ກວດ Format", nameEn: "Submit Thesis Book for Format Check", plannedWindow: "Jul 2027 Week 4 to Aug 2027 Week 2", phase: "COMPLETION", module: "Format Review" },
  { stageNo: 18, nameLo: "ສົ່ງປຶ້ມສົມບູນເພື່ອເຂົ້າເຫຼັ້ມ", nameEn: "Submit Final Complete Book for Binding", plannedWindow: "Aug 2027, Weeks 2–4", phase: "COMPLETION", module: "Printing & Binding" },
];

export const registeredStudents: StudentRecord[] = [
  { studentId: "FS-CS-2022-001", name: "ທ້າວ ສົມພອນ ແກ້ວມະນີ", classroom: "4IT1", department: "ວິສະວະກຳຄອມພິວເຕີ" },
  { studentId: "FS-CS-2022-002", name: "ນາງ ມະນີວອນ ດວງດີ", classroom: "4IT1", department: "ວິສະວະກຳຄອມພິວເຕີ" },
  { studentId: "FS-IT-2022-015", name: "ທ້າວ ບຸນທະວີ ສີສຸລາດ", classroom: "4IT2", department: "ເຕັກໂນໂລຊີຂໍ້ມູນຂ່າວສານ" },
  { studentId: "FS-IT-2022-016", name: "ນາງ ວິໄລພອນ ຄຳພູວົງ", classroom: "4IT2", department: "ເຕັກໂນໂລຊີຂໍ້ມູນຂ່າວສານ" },
  { studentId: "FS-SE-2022-033", name: "ທ້າວ ອານຸສອນ ພົມມະຈັນ", classroom: "4SE", department: "ວິສະວະກຳຊອບແວ" },
  { studentId: "FS-CS-2022-045", name: "ທ້າວ ກິດຕິສັກ ສຸວັນນະສີ", classroom: "4IT1", department: "ວິສະວະກຳຄອມພິວເຕີ" },
  { studentId: "2IT-001", name: "ທ້າວ ແຮັກເຕ້ ແສງສະຫວ່າງ", classroom: "2IT-CON", department: "ວິສະວະກຳຄອມພິວເຕີ" },
  { studentId: "2IT-002", name: "ທ້າວ ບຸນທະວີ ວໍລະລາດ", classroom: "2IT-CON", department: "ວິສະວະກຳຄອມພິວເຕີ" },
  { studentId: "2IT-003", name: "ທ້າວ ສົມພົງ ສີສຸລາດ", classroom: "2IT-CON", department: "ວິສະວະກຳຄອມພິວເຕີ", isPreviousGen: true, note: "ນັກສຶກສາຕົກຮຸ່ນ" },
  { studentId: "2IT2-004", name: "ນາງ ວິໄລພອນ ໄຊຍະແສງ", classroom: "2it_con2", department: "ເຕັກໂນໂລຊີຂໍ້ມູນຂ່າວສານ" },
  { studentId: "2IT2-008", name: "ທ້າວ ໄຊຊະນະ ມະນີວົງ", classroom: "2it_con1", department: "ເຕັກໂນໂລຊີຂໍ້ມູນຂ່າວສານ", isPreviousGen: true, note: "ນັກສຶກສາຕົກຮຸ່ນ" },
  { studentId: "2IT2-015", name: "ນາງ ດາລິສອນ ສີຫາບາດ", classroom: "2it_con2", department: "ເຕັກໂນໂລຊີຂໍ້ມູນຂ່າວສານ" },
  { studentId: "4IT1-011", name: "ທ້າວ ວິຊິດ ວັນນະສານ", classroom: "4IT1", department: "ວິສະວະກຳຄອມພິວເຕີ" },
  { studentId: "4IT1-018", name: "ນາງ ສຸພັດຕາ ພົມວິຫານ", classroom: "4IT1", department: "ວິສະວະກຳຄອມພິວເຕີ" },
  { studentId: "4IT2-009", name: "ທ້າວ ສຸກສະຫວັນ ດວງປະເສີດ", classroom: "4IT2", department: "ເຕັກໂນໂລຊີຂໍ້ມູນຂ່າວສານ" },
  { studentId: "4IT2-022", name: "ນາງ ປານີ ສີຫາວົງ", classroom: "4IT2", department: "ເຕັກໂນໂລຊີຂໍ້ມູນຂ່າວສານ" },
  { studentId: "4Com3-002", name: "ທ້າວ ຫຼ້າແກ້ວ ແສງວາລຸນ", classroom: "4Com3", department: "ວິສະວະກຳຄອມພິວເຕີ" },
  { studentId: "4Com3-014", name: "ນາງ ທິບພະຈັນ ທຳມະວົງ", classroom: "4Com3", department: "ວິສະວະກຳຄອມພິວເຕີ" },
  { studentId: "4Com3-021", name: "ນາງ ວົງມະນີ ລາບບັນດິດ", classroom: "4Com3", department: "ວິສະວະກຳຄອມພິວເຕີ" },
  { studentId: "4SE-007", name: "ທ້າວ ອາລຸນເດດ ຈັນທະວີ", classroom: "4SE", department: "ວິສະວະກຳຊອບແວ" },
  { studentId: "4SE-019", name: "ນາງ ແກ້ວມະນີ ວໍລະຈິດ", classroom: "4SE", department: "ວິສະວະກຳຊອບແວ" },
  { studentId: "4IT1-099", name: "ທ້າວ ພຸດທະສິນ ສີປະເສີດ", classroom: "4IT1", department: "ວິສະວະກຳຄອມພິວເຕີ", isPreviousGen: true, note: "ນັກສຶກສາຕົກຮຸ່ນ" },
];

// Official 21 Advisors — Academic Year 2026–2027 (Total Quota = 84 groups)
export const registeredTeachers: TeacherRecord[] = [
  {
    id: "tch_01",
    academicTitle: "ທ່ານ ຮສ.",
    name: "ແສງລັດສະໝີ ຈັນທະມິນາວົງ",
    fullName: "ທ່ານ ຮສ. ແສງລັດສະໝີ ຈັນທະມິນາວົງ",
    department: "ພາກວິຊາວິສະວະກຳຄອມພິວເຕີ",
    affiliation: "CEIT",
    quota: "0/6 ກຸ່ມ",
    assignedCount: 0,
    maxQuota: 6,
    availableQuota: 6,
    eligibleCategories: ["Software", "Network/Server", "Cybersecurity", "Hardware (IoT, Robot)"],
    roles: ["ADVISOR", "COMMITTEE"],
  },
  {
    id: "tch_02",
    academicTitle: "ທ່ານ ຮສ. ປອ.",
    name: "ຄຳເພັດ ບຸນນະດີ",
    fullName: "ທ່ານ ຮສ. ປອ. ຄຳເພັດ ບຸນນະດີ",
    department: "ພາກວິຊາວິສະວະກຳຄອມພິວເຕີ",
    affiliation: "CEIT",
    quota: "0/6 ກຸ່ມ",
    assignedCount: 0,
    maxQuota: 6,
    availableQuota: 6,
    eligibleCategories: ["Software", "Hardware (IoT, Robot)", "Multimedia"],
    roles: ["ADVISOR", "COMMITTEE"],
  },
  {
    id: "tch_03",
    academicTitle: "ທ່ານ ຮສ. ນາງ",
    name: "ມະໂນລົມ ຈັນທະວົງ",
    fullName: "ທ່ານ ຮສ. ນາງ ມະໂນລົມ ຈັນທະວົງ",
    department: "ພາກວິຊາວິສະວະກຳຄອມພິວເຕີ",
    affiliation: "CEIT",
    quota: "0/4 ກຸ່ມ",
    assignedCount: 0,
    maxQuota: 4,
    availableQuota: 4,
    eligibleCategories: ["Software", "Hardware (IoT, Robot)", "Multimedia"],
    roles: ["ADVISOR", "COMMITTEE"],
  },
  {
    id: "tch_04",
    academicTitle: "ທ່ານ ອຈ. ປອ.",
    name: "ພອນໄຊ ວິລະກອນ",
    fullName: "ທ່ານ ອຈ. ປອ. ພອນໄຊ ວິລະກອນ",
    department: "ພາກວິຊາວິສະວະກຳຊອບແວ",
    affiliation: "CEIT",
    quota: "0/5 ກຸ່ມ",
    assignedCount: 0,
    maxQuota: 5,
    availableQuota: 5,
    eligibleCategories: ["Software"],
    roles: ["ADVISOR", "COMMITTEE"],
  },
  {
    id: "tch_05",
    academicTitle: "ທ່ານ ປອ.",
    name: "ໄຊທະວີ ຫຼວງວິໄລ",
    fullName: "ທ່ານ ປອ. ໄຊທະວີ ຫຼວງວິໄລ",
    department: "ພາກວິຊາເຕັກໂນໂລຊີຂໍ້ມູນຂ່າວສານ",
    affiliation: "CEIT",
    quota: "0/5 ກຸ່ມ",
    assignedCount: 0,
    maxQuota: 5,
    availableQuota: 5,
    eligibleCategories: ["Software", "Network/Server"],
    roles: ["ADVISOR", "COMMITTEE"],
  },
  {
    id: "tch_06",
    academicTitle: "ທ່ານ ອຈ.",
    name: "ເມກຈອນ ບຸນທັນ",
    fullName: "ທ່ານ ອຈ. ເມກຈອນ ບຸນທັນ",
    department: "ພາກວິຊາເຕັກໂນໂລຊີຂໍ້ມູນຂ່າວສານ",
    affiliation: "CEIT",
    quota: "0/6 ກຸ່ມ",
    assignedCount: 0,
    maxQuota: 6,
    availableQuota: 6,
    eligibleCategories: ["Software", "Hardware (IoT, Robot)"],
    roles: ["ADVISOR", "COMMITTEE"],
  },
  {
    id: "tch_07",
    academicTitle: "ທ່ານ ປອ.",
    name: "ພອນປະດິດ ພຸມມະວົງ",
    fullName: "ທ່ານ ປອ. ພອນປະດິດ ພຸມມະວົງ",
    department: "ພາກວິຊາວິສະວະກຳຄອມພິວເຕີ",
    affiliation: "CEIT",
    quota: "0/3 ກຸ່ມ",
    assignedCount: 0,
    maxQuota: 3,
    availableQuota: 3,
    eligibleCategories: ["Software", "Network/Server"],
    roles: ["ADVISOR", "COMMITTEE"],
  },
  {
    id: "tch_08",
    academicTitle: "ທ່ານ ປອ.",
    name: "ຊານຸພາບ ພົມແກ້ວນາ",
    fullName: "ທ່ານ ປອ. ຊານຸພາບ ພົມແກ້ວນາ",
    department: "ພາກວິຊາເຕັກໂນໂລຊີຂໍ້ມູນຂ່າວສານ",
    affiliation: "CEIT",
    quota: "0/4 ກຸ່ມ",
    assignedCount: 0,
    maxQuota: 4,
    availableQuota: 4,
    eligibleCategories: ["Network/Server", "Cybersecurity", "Multimedia"],
    roles: ["ADVISOR", "COMMITTEE"],
  },
  {
    id: "tch_09",
    academicTitle: "ທ່ານ ປອ.",
    name: "ຈ່າຊົ່ງ ຢ່າໂກເຍ່ຍຕູ້",
    fullName: "ທ່ານ ປອ. ຈ່າຊົ່ງ ຢ່າໂກເຍ່ຍຕູ້",
    department: "ພາກວິຊາວິສະວະກຳຊອບແວ",
    affiliation: "CEIT",
    quota: "0/4 ກຸ່ມ",
    assignedCount: 0,
    maxQuota: 4,
    availableQuota: 4,
    eligibleCategories: ["Software", "Network/Server", "Cybersecurity"],
    roles: ["ADVISOR", "COMMITTEE"],
  },
  {
    id: "tch_10",
    academicTitle: "ທ່ານ ປອ. ນາງ",
    name: "ພອນຄຳ ຫານໄຊຊະນະ",
    fullName: "ທ່ານ ປອ. ນາງ ພອນຄຳ ຫານໄຊຊະນະ",
    department: "ພາກວິຊາວິສະວະກຳຄອມພິວເຕີ",
    affiliation: "CEIT",
    quota: "0/4 ກຸ່ມ",
    assignedCount: 0,
    maxQuota: 4,
    availableQuota: 4,
    eligibleCategories: ["Software", "Hardware (IoT, Robot)"],
    roles: ["ADVISOR", "COMMITTEE"],
  },
  {
    id: "tch_11",
    academicTitle: "ທ່ານ",
    name: "ຄຳໄຊ ລີຫວາຕູ້",
    fullName: "ທ່ານ ຄຳໄຊ ລີຫວາຕູ້",
    department: "ພາກວິຊາເຕັກໂນໂລຊີຂໍ້ມູນຂ່າວສານ",
    affiliation: "CEIT",
    quota: "0/4 ກຸ່ມ",
    assignedCount: 0,
    maxQuota: 4,
    availableQuota: 4,
    eligibleCategories: ["Network/Server", "Cybersecurity", "Multimedia"],
    secondaryCategories: ["Multimedia"],
    conditionalCategories: ["Multimedia"],
    roles: ["ADVISOR", "COMMITTEE"],
  },
  {
    id: "tch_12",
    academicTitle: "ທ່ານ",
    name: "ສຸກສະຫວັນ ຈຸນດາລີ",
    fullName: "ທ່ານ ສຸກສະຫວັນ ຈຸນດາລີ",
    department: "ພາກວິຊາວິສະວະກຳຊອບແວ",
    affiliation: "CEIT",
    quota: "0/5 ກຸ່ມ",
    assignedCount: 0,
    maxQuota: 5,
    availableQuota: 5,
    eligibleCategories: ["Software"],
    roles: ["ADVISOR", "COMMITTEE"],
  },
  {
    id: "tch_13",
    academicTitle: "ທ່ານ",
    name: "ບຸນປະເສີດ ອຸປະຖານາ",
    fullName: "ທ່ານ ບຸນປະເສີດ ອຸປະຖານາ",
    department: "ພາກວິຊາເຕັກໂນໂລຊີຂໍ້ມູນຂ່າວສານ",
    affiliation: "CEIT",
    quota: "0/4 ກຸ່ມ",
    assignedCount: 0,
    maxQuota: 4,
    availableQuota: 4,
    eligibleCategories: ["Multimedia"],
    roles: ["ADVISOR", "COMMITTEE"],
  },
  {
    id: "tch_14",
    academicTitle: "ທ່ານ ນາງ",
    name: "ມະນິດດາ ທະວົງຈິດ",
    fullName: "ທ່ານ ນາງ ມະນິດດາ ທະວົງຈິດ",
    department: "ພາກວິຊາວິສະວະກຳຊອບແວ",
    affiliation: "CEIT",
    quota: "0/4 ກຸ່ມ",
    assignedCount: 0,
    maxQuota: 4,
    availableQuota: 4,
    eligibleCategories: ["Software", "Cybersecurity"],
    roles: ["ADVISOR", "COMMITTEE"],
  },
  {
    id: "tch_15",
    academicTitle: "ທ່ານ ນາງ",
    name: "ລັດທິດາ",
    fullName: "ທ່ານ ນາງ ລັດທິດາ",
    department: "ພາກວິຊາວິສະວະກຳຄອມພິວເຕີ",
    affiliation: "CEIT",
    quota: "0/2 ກຸ່ມ",
    assignedCount: 0,
    maxQuota: 2,
    availableQuota: 2,
    eligibleCategories: ["Hardware (IoT, Robot)", "Multimedia"],
    secondaryCategories: ["Multimedia"],
    conditionalCategories: ["Multimedia"],
    roles: ["ADVISOR", "COMMITTEE"],
  },
  {
    id: "tch_16",
    academicTitle: "ທ່ານ",
    name: "ພຸດວັນ",
    fullName: "ທ່ານ ພຸດວັນ",
    department: "ພາກວິຊາເຕັກໂນໂລຊີຂໍ້ມູນຂ່າວສານ",
    affiliation: "CEIT",
    quota: "0/2 ກຸ່ມ",
    assignedCount: 0,
    maxQuota: 2,
    availableQuota: 2,
    eligibleCategories: ["Network/Server", "Multimedia"],
    roles: ["ADVISOR", "COMMITTEE"],
  },
  {
    id: "tch_17",
    academicTitle: "ທ່ານ ອຈ. ປອ.",
    name: "ຂັນທະນູ ຫລວງໄຊຊະນະ",
    fullName: "ທ່ານ ອຈ. ປອ. ຂັນທະນູ ຫລວງໄຊຊະນະ",
    department: "ພາກວິຊາວິສະວະກຳຄອມພິວເຕີ",
    affiliation: "ວິຊາການ ຄວສ",
    quota: "0/3 ກຸ່ມ",
    assignedCount: 0,
    maxQuota: 3,
    availableQuota: 3,
    eligibleCategories: ["Software", "Hardware (IoT, Robot)", "Multimedia"],
    roles: ["ADVISOR", "COMMITTEE"],
  },
  {
    id: "tch_18",
    academicTitle: "ທ່ານ ອຈ. ປອ.",
    name: "ຄຳເຜົ້າ ສີສະອາດ",
    fullName: "ທ່ານ ອຈ. ປອ. ຄຳເຜົ້າ ສີສະອາດ",
    department: "ພາກວິຊາວິສະວະກຳຄອມພິວເຕີ",
    affiliation: "ຄົ້ນຄວ້າວິທະຍາສາດ ຄວສ",
    quota: "0/3 ກຸ່ມ",
    assignedCount: 0,
    maxQuota: 3,
    availableQuota: 3,
    eligibleCategories: ["Network/Server", "Cybersecurity"],
    roles: ["ADVISOR", "COMMITTEE"],
  },
  {
    id: "tch_19",
    academicTitle: "ທ່ານ ຮສ.",
    name: "ທາ ບຸນທັນ",
    fullName: "ທ່ານ ຮສ. ທາ ບຸນທັນ",
    department: "ອາຈານບຳນານ CEIT",
    affiliation: "ອາຈານບຳນານ",
    quota: "0/4 ກຸ່ມ",
    assignedCount: 0,
    maxQuota: 4,
    availableQuota: 4,
    eligibleCategories: ["Software", "Network/Server", "Hardware (IoT, Robot)"],
    roles: ["ADVISOR", "COMMITTEE"],
  },
  {
    id: "tch_20",
    academicTitle: "ທ່ານ ປອ.",
    name: "ສົມພອນ ກັນທະວົງ",
    fullName: "ທ່ານ ປອ. ສົມພອນ ກັນທະວົງ",
    department: "ອາຈານບຳນານ CEIT",
    affiliation: "ອາຈານບຳນານ",
    quota: "0/4 ກຸ່ມ",
    assignedCount: 0,
    maxQuota: 4,
    availableQuota: 4,
    eligibleCategories: ["Software", "Network/Server"],
    roles: ["ADVISOR", "COMMITTEE"],
  },
  {
    id: "tch_21",
    academicTitle: "ທ່ານ ຮສ.",
    name: "ເສີມສັກ ດວງສີລາ",
    fullName: "ທ່ານ ຮສ. ເສີມສັກ ດວງສີລາ",
    department: "ອາຈານບຳນານ CEIT",
    affiliation: "ອາຈານບຳນານ",
    quota: "0/2 ກຸ່ມ",
    assignedCount: 0,
    maxQuota: 2,
    availableQuota: 2,
    eligibleCategories: ["Network/Server", "Cybersecurity"],
    roles: ["ADVISOR", "COMMITTEE"],
  },
];

// Helper to convert students to SearchableOption[]
export const studentSearchableOptions: SearchableOption[] = registeredStudents.map((s) => ({
  value: s.studentId,
  label: `${s.name} (${s.studentId})`,
  subLabel: `ຫ້ອງ: ${s.classroom} • ${s.department}`,
  badge: s.isPreviousGen ? "ຕົກຮຸ່ນ" : undefined,
  badgeVariant: s.isPreviousGen ? "amber" : undefined,
  metadata: s,
}));

// Helper to convert teachers to SearchableOption[]
export const teacherSearchableOptions: SearchableOption[] = registeredTeachers.map((t) => ({
  value: t.fullName,
  label: t.fullName,
  subLabel: `${t.affiliation} • ຫົວບົດ: ${t.eligibleCategories.join(", ")}`,
  badge: `${t.assignedCount}/${t.maxQuota} (${t.availableQuota} ວ່າງ)`,
  badgeVariant: t.availableQuota === 0 ? "rose" : t.availableQuota <= 1 ? "amber" : "emerald",
  metadata: t,
}));

// Committee specific SearchableOption[]
export const committeeSearchableOptions: SearchableOption[] = registeredTeachers
  .filter((t) => t.roles.includes("COMMITTEE"))
  .map((t) => ({
    value: t.fullName,
    label: t.fullName,
    subLabel: `${t.affiliation} • ຊ່ຽວຊານ: ${t.eligibleCategories.join(", ")}`,
    badge: "ກຳມະການ",
    badgeVariant: "violet",
    metadata: t,
  }));

// Advisor specific SearchableOption[]
export const advisorSearchableOptions: SearchableOption[] = registeredTeachers
  .filter((t) => t.roles.includes("ADVISOR"))
  .map((t) => ({
    value: t.fullName,
    label: t.fullName,
    subLabel: `${t.affiliation} • ຫົວບົດ: ${t.eligibleCategories.join(", ")}`,
    badge: `${t.assignedCount}/${t.maxQuota} ກຸ່ມ`,
    badgeVariant: t.availableQuota === 0 ? "rose" : "amber",
    metadata: t,
  }));

/**
 * Filter advisors eligible for a specific category code or name
 */
export function getEligibleAdvisorsForCategory(category: string): TeacherRecord[] {
  const norm = category.toLowerCase().trim();
  return registeredTeachers.filter((t) => {
    return t.eligibleCategories.some((c) => {
      const cNorm = c.toLowerCase().trim();
      if (norm.includes("software") || norm.includes("ຊອບແວ")) return cNorm.includes("software");
      if (norm.includes("network") || norm.includes("server") || norm.includes("ເຄືອຂ່າຍ")) return cNorm.includes("network");
      if (norm.includes("cyber") || norm.includes("security") || norm.includes("ຄວາມປອດໄພ")) return cNorm.includes("cybersecurity");
      if (norm.includes("hardware") || norm.includes("iot") || norm.includes("robot") || norm.includes("ຮາດແວ")) return cNorm.includes("hardware");
      if (norm.includes("multimedia") || norm.includes("media") || norm.includes("ມັລຕິມີເດຍ")) return cNorm.includes("multimedia");
      return cNorm === norm;
    });
  });
}

export const officialAdvisors2026_2027: TeacherRecord[] = registeredTeachers;
export const officialTeachers2026_2027: TeacherRecord[] = registeredTeachers;

export function getTeachersByCategory(category: string): TeacherRecord[] {
  return getEligibleAdvisorsForCategory(category);
}

export function getAvailableTeachers(): TeacherRecord[] {
  return registeredTeachers.filter((t) => t.availableQuota > 0);
}

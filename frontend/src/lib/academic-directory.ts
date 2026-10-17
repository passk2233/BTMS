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
  quota: string;
  roles: string[];
}

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

export const registeredTeachers: TeacherRecord[] = [
  {
    id: "tch_01",
    academicTitle: "ທ່ານ ຮສ.",
    name: "ຫາ ບຸນທັນ",
    fullName: "ທ່ານ ຮສ. ຫາ ບຸນທັນ",
    department: "ພາກວິຊາວິສະວະກຳຄອມພິວເຕີ ແລະ ເຕັກໂນໂລຊີຂໍ້ມູນຂ່າວສານ",
    quota: "4/5 ກຸ່ມ",
    roles: ["ADVISOR", "COMMITTEE"],
  },
  {
    id: "tch_02",
    academicTitle: "ຮສ. ດຣ.",
    name: "ສົມຊາຍ ປະເສີດ",
    fullName: "ຮສ. ດຣ. ສົມຊາຍ ປະເສີດ",
    department: "ພາກວິຊາວິສະວະກຳຄອມພິວເຕີ",
    quota: "4/5 ກຸ່ມ",
    roles: ["ADVISOR", "COMMITTEE"],
  },
  {
    id: "tch_03",
    academicTitle: "ປອ.",
    name: "ບຸນມີ ໄຊຍະວົງ",
    fullName: "ປອ. ບຸນມີ ໄຊຍະວົງ",
    department: "ພາກວິຊາເຕັກໂນໂລຊີຂໍ້ມູນຂ່າວສານ",
    quota: "3/5 ກຸ່ມ",
    roles: ["ADVISOR", "COMMITTEE"],
  },
  {
    id: "tch_04",
    academicTitle: "ອຈ.",
    name: "ດາວອນ ລັດສະໝີ",
    fullName: "ອຈ. ດາວອນ ລັດສະໝີ",
    department: "ພາກວິຊາວິສະວະກຳຊອບແວ",
    quota: "2/5 ກຸ່ມ",
    roles: ["ADVISOR"],
  },
  {
    id: "tch_05",
    academicTitle: "ຮສ. ປອ.",
    name: "ຄຳຫຼ້າ ແກ້ວພິລາ",
    fullName: "ຮສ. ປອ. ຄຳຫຼ້າ ແກ້ວພິລາ",
    department: "ພາກວິຊາວິສະວະກຳຄອມພິວເຕີ",
    quota: "5/5 ກຸ່ມ (ເຕັມໂຄຕ້າ)",
    roles: ["ADVISOR", "COMMITTEE"],
  },
  {
    id: "tch_06",
    academicTitle: "ອຈ. ປທ.",
    name: "ສົມສະໜຸກ ວົງວິຈິດ",
    fullName: "ອຈ. ປທ. ສົມສະໜຸກ ວົງວິຈິດ",
    department: "ພາກວິຊາເຕັກໂນໂລຊີຂໍ້ມູນຂ່າວສານ",
    quota: "1/5 ກຸ່ມ",
    roles: ["COMMITTEE"],
  },
  {
    id: "tch_07",
    academicTitle: "ອຈ.",
    name: "ວິໄຊ ໄຊຍະເສນ",
    fullName: "ອຈ. ວິໄຊ ໄຊຍະເສນ",
    department: "ພາກວິຊາວິສະວະກຳຊອບແວ",
    quota: "0/5 ກຸ່ມ",
    roles: ["ADVISOR", "COMMITTEE"],
  },
  {
    id: "tch_08",
    academicTitle: "ປອ.",
    name: "ວັນໄຊ ພົມມະລາດ",
    fullName: "ປອ. ວັນໄຊ ພົມມະລາດ",
    department: "ພາກວິຊາວິສະວະກຳຄອມພິວເຕີ",
    quota: "2/5 ກຸ່ມ",
    roles: ["ADVISOR", "COMMITTEE"],
  },
  {
    id: "tch_09",
    academicTitle: "ຮສ.",
    name: "ແສງລັດສະໝີ ຈັນທະມິນາວົງ",
    fullName: "ທ່ານ ຮສ. ແສງລັດສະໝີ ຈັນທະມິນາວົງ",
    department: "ພາກວິຊາວິສະວະກຳຄອມພິວເຕີ",
    quota: "3/5 ກຸ່ມ",
    roles: ["COMMITTEE", "ADVISOR"],
  },
  {
    id: "tch_10",
    academicTitle: "ອຈ.",
    name: "ມະກະລອນ ບຸນທັນ",
    fullName: "ທ່ານ ອຈ. ມະກະລອນ ບຸນທັນ",
    department: "ພາກວິຊາເຕັກໂນໂລຊີຂໍ້ມູນຂ່າວສານ",
    quota: "3/5 ກຸ່ມ",
    roles: ["COMMITTEE", "ADVISOR"],
  },
  {
    id: "tch_11",
    academicTitle: "ນາງ",
    name: "ລັດຕິກາ ຄົມສອນລະສິນ",
    fullName: "ທ່ານ ນາງ ລັດຕິກາ ຄົມສອນລະສິນ",
    department: "ພາກວິຊາວິສະວະກຳຊອບແວ",
    quota: "2/5 ກຸ່ມ",
    roles: ["COMMITTEE", "ADVISOR"],
  },
  {
    id: "tch_12",
    academicTitle: "ຮສ. ປອ.",
    name: "ຄຳເພັດ ບຸນນະວົງ",
    fullName: "ທ່ານ ຮສ. ປອ. ຄຳເພັດ ບຸນນະວົງ",
    department: "ພາກວິຊາວິສະວະກຳຄອມພິວເຕີ",
    quota: "4/5 ກຸ່ມ",
    roles: ["COMMITTEE", "ADVISOR"],
  },
  {
    id: "tch_13",
    academicTitle: "ທ່ານ",
    name: "ສຸກສະຫວັນ ຈຸນທະລີ",
    fullName: "ທ່ານ ສຸກສະຫວັນ ຈຸນທະລີ",
    department: "ພາກວິຊາເຕັກໂນໂລຊີຂໍ້ມູນຂ່າວສານ",
    quota: "1/5 ກຸ່ມ",
    roles: ["COMMITTEE"],
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
  subLabel: t.department,
  badge: t.quota,
  badgeVariant: t.quota.includes("ເຕັມ") ? "rose" : "sky",
  metadata: t,
}));

// Committee specific SearchableOption[]
export const committeeSearchableOptions: SearchableOption[] = registeredTeachers
  .filter((t) => t.roles.includes("COMMITTEE"))
  .map((t) => ({
    value: t.fullName,
    label: t.fullName,
    subLabel: t.department,
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
    subLabel: `${t.department} • ໂຄຕ້າ: ${t.quota}`,
    badge: "ທີ່ປຶກສາ",
    badgeVariant: "amber",
    metadata: t,
  }));

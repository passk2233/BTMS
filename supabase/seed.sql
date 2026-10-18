-- =========================================================================
-- BTMS Database Seed Data — Academic Year 2026–2027
-- Official Advisor Directory (21 Advisors, Quota = 84)
-- 5 Thesis Categories (Multimedia Cap = 12)
-- 18-Stage Academic Timeline & 4 Examination Rounds
-- =========================================================================

begin;

-- =========================================================================
-- 1. System Roles
-- =========================================================================

insert into public.roles (code, name, description)
values
  ('ADMIN', 'Administrator', 'System administration and user management'),
  ('STAFF', 'Academic Staff', 'Thesis workflow administration'),
  ('HEAD', 'Head of Department', 'Signs schedules, approves topics and financial payouts'),
  ('STUDENT', 'Student', 'Thesis group member and submitter'),
  ('ADVISOR', 'Advisor', 'Assigned thesis advisor'),
  ('COMMITTEE', 'Committee Member', 'Assigned examination committee member'),
  ('FINANCE', 'Finance Officer', 'Financial verification and disbursement'),
  ('PRINTING', 'Printing Officer', 'Printing order processing')
on conflict (code) do update
set
  name = excluded.name,
  description = excluded.description;

-- =========================================================================
-- 2. Thesis Categories (Official 5 Categories)
-- =========================================================================

insert into public.thesis_categories (code, name, sort_order, global_cap)
values
  ('SOFTWARE', 'Software', 1, null),
  ('NETWORK', 'Network/Server', 2, null),
  ('CYBERSECURITY', 'Cybersecurity', 3, null),
  ('HARDWARE', 'Hardware (IoT, Robot)', 4, null),
  ('MULTIMEDIA', 'Multimedia', 5, 12)
on conflict (code) do update
set
  name = excluded.name,
  sort_order = excluded.sort_order,
  global_cap = excluded.global_cap;

-- =========================================================================
-- 3. Academic Timeline Stages (Official 18 Stages)
-- =========================================================================

insert into public.academic_stages (stage_no, name_lo, name_en, planned_window, phase, btms_module, sort_order)
values
  (1, 'ແນະນຳນັກສຶກສາ', 'Student Orientation', 'Oct 2026, Weeks 2–3', 'REGISTRATION', 'Students / Cohort', 1),
  (2, 'ຈັດກຸ່ມ ແລະ ເລືອກອາຈານທີ່ປຶກສາ', 'Group Formation & Advisor Selection', 'Oct 2026 Weeks 3–4 to Nov 2026 Week 1', 'REGISTRATION', 'Groups / Advisor Quota', 2),
  (3, 'ຍື່ນຄຳຮ້ອງ', 'Submit Request Form', 'Oct 2026 Week 4 to Nov 2026 Week 1', 'REGISTRATION', 'Topic Registration', 3),
  (4, 'ປະກາດຊື່ຫົວຂໍ້+ອາຈານທີ່ປຶກສາ', 'Announce Topics & Advisors', 'Nov 2026, Week 2', 'REGISTRATION', 'Official Roster', 4),
  (5, 'ປະກາດສົ່ງປຶ້ມຫົວບົດວິທະຍານິພົນ', 'Announce Proposal Book Submission', 'Jan 2027, Weeks 1–4', 'PROPOSAL', 'Proposal Submission', 5),
  (6, 'ປ້ອງກັນຫົວບົດວິທະຍານິພົນ ຊຸດທີ່ 1', 'Proposal Defense Round 1', 'Feb 2027 Week 4 to Mar 2027 Week 2', 'PROPOSAL', 'Exams (Round 1)', 6),
  (7, 'ປະກາດຜົນຫົວບົດວິທະຍານິພົນ ຊຸດທີ່ 1', 'Announce Proposal Results Round 1', 'Mar 2027, Weeks 2–4', 'PROPOSAL', 'Exam Results', 7),
  (8, 'ປ້ອງກັນຫົວບົດວິທະຍານິພົນ ຊຸດທີ່ 2', 'Proposal Defense Round 2', 'Mar 2027, Weeks 3–4', 'PROPOSAL', 'Exams (Round 2)', 8),
  (9, 'ປະກາດຜົນຫົວບົດວິທະຍານິພົນ ຊຸດທີ່ 2', 'Announce Proposal Results Round 2', 'Mar 2027 Week 4 to Apr 2027 Week 1', 'PROPOSAL', 'Exam Results', 9),
  (10, 'ສົ່ງປຶ້ມ ຫົວບົດວິທະຍານິພົນ 1', 'Submit Proposal Book Round 1', 'Apr 2027, Weeks 1–2', 'PROPOSAL', 'Submission Tracking', 10),
  (11, 'ສົ່ງປຶ້ມ ຫົວບົດວິທະຍານິພົນ 2', 'Submit Proposal Book Round 2', 'Apr 2027, Weeks 2–3', 'PROPOSAL', 'Submission Tracking', 11),
  (12, 'ປະກາດສົ່ງປຶ້ມບົດວິທະຍານິພົນ', 'Announce Final Thesis Book Submission', 'Jun 2027, Weeks 1–3', 'FINAL', 'Final Submission', 12),
  (13, 'ປ້ອງກັນບົດວິທະຍານິພົນ ຊຸດທີ່ 1', 'Final Thesis Defense Round 1', 'Jun 2027 Week 4 to Jul 2027 Week 3', 'FINAL', 'Exams (Round 1)', 13),
  (14, 'ປະກາດຜົນວິທະຍານິພົນ ຊຸດທີ່ 1', 'Announce Final Thesis Results Round 1', 'Jul 2027, Weeks 3–4', 'FINAL', 'Exam Results', 14),
  (15, 'ປ້ອງກັນບົດວິທະຍານິພົນ ຊຸດທີ່ 2', 'Final Thesis Defense Round 2', 'Jul 2027, Week 4', 'FINAL', 'Exams (Round 2)', 15),
  (16, 'ປະກາດຜົນວິທະຍານິພົນ ຊຸດທີ່ 2', 'Announce Final Thesis Results Round 2', 'Aug 2027, Week 1', 'FINAL', 'Exam Results', 16),
  (17, 'ສົ່ງປຶ້ມ ບົດວິທະຍານິພົນ ກວດ Format', 'Submit Thesis Book for Format Check', 'Jul 2027 Week 4 to Aug 2027 Week 2', 'COMPLETION', 'Format Review', 17),
  (18, 'ສົ່ງປຶ້ມສົມບູນເພື່ອເຂົ້າເຫຼັ້ມ', 'Submit Final Complete Book for Binding', 'Aug 2027, Weeks 2–4', 'COMPLETION', 'Printing & Binding', 18)
on conflict (stage_no) do update
set
  name_lo = excluded.name_lo,
  name_en = excluded.name_en,
  planned_window = excluded.planned_window,
  phase = excluded.phase,
  btms_module = excluded.btms_module,
  sort_order = excluded.sort_order;

-- =========================================================================
-- 4. Exam Types & Fee Types
-- =========================================================================

insert into public.exam_types (code, name, description)
values
  ('PROPOSAL', 'Proposal Defense', 'Initial thesis proposal defense examination'),
  ('FINAL', 'Final Thesis Defense', 'Final complete thesis defense examination')
on conflict (code) do update
set
  name = excluded.name,
  description = excluded.description;

insert into public.fee_types (code, name)
values
  ('PROPOSAL_EXAM', 'Proposal Exam Fee'),
  ('PROPOSAL_RETAKE', 'Proposal Retake Fee'),
  ('FINAL_EXAM', 'Final Exam Fee'),
  ('FINAL_RETAKE', 'Final Retake Fee'),
  ('PRINTING', 'Printing Fee'),
  ('BINDING', 'Binding Fee'),
  ('OTHER', 'Other Fee')
on conflict (code) do update
set name = excluded.name;

insert into public.fee_rates (fee_type_code, amount, currency, effective_from)
values
  ('PROPOSAL_EXAM', 350000.00, 'LAK', '2026-10-01'),
  ('PROPOSAL_RETAKE', 200000.00, 'LAK', '2026-10-01'),
  ('FINAL_EXAM', 500000.00, 'LAK', '2026-10-01'),
  ('FINAL_RETAKE', 300000.00, 'LAK', '2026-10-01')
on conflict (fee_type_code, effective_from) do update
set amount = excluded.amount;

-- Committee Rates
insert into public.committee_rates (exam_type_code, role, rate_kind, amount, currency, effective_from)
values
  ('PROPOSAL', 'CHAIRMAN', 'BASE', 100000.00, 'LAK', '2026-10-01'),
  ('PROPOSAL', 'COMMITTEE', 'BASE', 80000.00, 'LAK', '2026-10-01'),
  ('PROPOSAL', 'CHAIRMAN', 'RETAKE_BONUS', 50000.00, 'LAK', '2026-10-01'),
  ('PROPOSAL', 'COMMITTEE', 'RETAKE_BONUS', 40000.00, 'LAK', '2026-10-01'),
  ('FINAL', 'CHAIRMAN', 'BASE', 150000.00, 'LAK', '2026-10-01'),
  ('FINAL', 'COMMITTEE', 'BASE', 120000.00, 'LAK', '2026-10-01'),
  ('FINAL', 'CHAIRMAN', 'RETAKE_BONUS', 75000.00, 'LAK', '2026-10-01'),
  ('FINAL', 'COMMITTEE', 'RETAKE_BONUS', 60000.00, 'LAK', '2026-10-01')
on conflict (exam_type_code, role, rate_kind, effective_from) do update
set amount = excluded.amount;

-- =========================================================================
-- 5. Examination Rounds (2026–2027 Academic Year)
-- =========================================================================

insert into public.exam_rounds (id, academic_year, period, round_no, name, start_date, end_date, status)
values
  ('00000000-0000-0000-0001-000000000001', 2026, 'PROPOSAL', 1, 'ປ້ອງກັນຫົວບົດວິທະຍານິພົນ ຊຸດທີ່ 1 (Proposal Defense Round 1)', '2027-02-22', '2027-03-12', 'OPEN'),
  ('00000000-0000-0000-0001-000000000002', 2026, 'PROPOSAL', 2, 'ປ້ອງກັນຫົວບົດວິທະຍານິພົນ ຊຸດທີ່ 2 (Proposal Defense Round 2)', '2027-03-15', '2027-03-26', 'OPEN'),
  ('00000000-0000-0000-0001-000000000003', 2026, 'FINAL', 1, 'ປ້ອງກັນບົດວິທະຍານິພົນ ຊຸດທີ່ 1 (Final Thesis Defense Round 1)', '2027-06-21', '2027-07-16', 'OPEN'),
  ('00000000-0000-0000-0001-000000000004', 2026, 'FINAL', 2, 'ປ້ອງກັນບົດວິທະຍານິພົນ ຊຸດທີ່ 2 (Final Thesis Defense Round 2)', '2027-07-19', '2027-07-23', 'OPEN')
on conflict (academic_year, period, round_no) do update
set
  name = excluded.name,
  start_date = excluded.start_date,
  end_date = excluded.end_date,
  status = excluded.status;

-- =========================================================================
-- 6. Core System Users & Staff Profiles
-- =========================================================================

-- Provision auth.users accounts
insert into auth.users (id, aud, role, email, is_sso_user, is_anonymous, created_at, updated_at)
values
  ('10000000-0000-0000-0000-000000000001', 'authenticated', 'authenticated', 'admin@nuol.edu.la', false, false, now(), now()),
  ('10000000-0000-0000-0000-000000000002', 'authenticated', 'authenticated', 'staff@nuol.edu.la', false, false, now(), now()),
  ('10000000-0000-0000-0000-000000000003', 'authenticated', 'authenticated', 'head@nuol.edu.la', false, false, now(), now()),
  ('10000000-0000-0000-0000-000000000004', 'authenticated', 'authenticated', 'finance@nuol.edu.la', false, false, now(), now()),
  ('10000000-0000-0000-0000-000000000005', 'authenticated', 'authenticated', 'printing@nuol.edu.la', false, false, now(), now()),
  ('20000000-0000-0000-0000-000000000001', 'authenticated', 'authenticated', 'saengratsamy.c@nuol.edu.la', false, false, now(), now()),
  ('20000000-0000-0000-0000-000000000002', 'authenticated', 'authenticated', 'khammphet.b@nuol.edu.la', false, false, now(), now()),
  ('20000000-0000-0000-0000-000000000003', 'authenticated', 'authenticated', 'manolom.c@nuol.edu.la', false, false, now(), now()),
  ('20000000-0000-0000-0000-000000000004', 'authenticated', 'authenticated', 'phonxay.v@nuol.edu.la', false, false, now(), now()),
  ('20000000-0000-0000-0000-000000000005', 'authenticated', 'authenticated', 'xaythavy.l@nuol.edu.la', false, false, now(), now()),
  ('20000000-0000-0000-0000-000000000006', 'authenticated', 'authenticated', 'mekjohn.b@nuol.edu.la', false, false, now(), now()),
  ('20000000-0000-0000-0000-000000000007', 'authenticated', 'authenticated', 'phonpadith.p@nuol.edu.la', false, false, now(), now()),
  ('20000000-0000-0000-0000-000000000008', 'authenticated', 'authenticated', 'chanuphap.p@nuol.edu.la', false, false, now(), now()),
  ('20000000-0000-0000-0000-000000000009', 'authenticated', 'authenticated', 'chaxong.y@nuol.edu.la', false, false, now(), now()),
  ('20000000-0000-0000-0000-000000000010', 'authenticated', 'authenticated', 'phonkham.h@nuol.edu.la', false, false, now(), now()),
  ('20000000-0000-0000-0000-000000000011', 'authenticated', 'authenticated', 'khamxay.l@nuol.edu.la', false, false, now(), now()),
  ('20000000-0000-0000-0000-000000000012', 'authenticated', 'authenticated', 'souksavanh.c@nuol.edu.la', false, false, now(), now()),
  ('20000000-0000-0000-0000-000000000013', 'authenticated', 'authenticated', 'bounpaseuth.o@nuol.edu.la', false, false, now(), now()),
  ('20000000-0000-0000-0000-000000000014', 'authenticated', 'authenticated', 'manidda.t@nuol.edu.la', false, false, now(), now()),
  ('20000000-0000-0000-0000-000000000015', 'authenticated', 'authenticated', 'latthida@nuol.edu.la', false, false, now(), now()),
  ('20000000-0000-0000-0000-000000000016', 'authenticated', 'authenticated', 'phoudvanh@nuol.edu.la', false, false, now(), now()),
  ('20000000-0000-0000-0000-000000000017', 'authenticated', 'authenticated', 'khanthanou.l@nuol.edu.la', false, false, now(), now()),
  ('20000000-0000-0000-0000-000000000018', 'authenticated', 'authenticated', 'khampheo.s@nuol.edu.la', false, false, now(), now()),
  ('20000000-0000-0000-0000-000000000019', 'authenticated', 'authenticated', 'tha.b@nuol.edu.la', false, false, now(), now()),
  ('20000000-0000-0000-0000-000000000020', 'authenticated', 'authenticated', 'somphone.k@nuol.edu.la', false, false, now(), now()),
  ('20000000-0000-0000-0000-000000000021', 'authenticated', 'authenticated', 'seumsack.d@nuol.edu.la', false, false, now(), now())
on conflict (id) do nothing;

-- Standard Admin, Staff, Head, Finance, Printing accounts
insert into public.profiles (id, display_name)
values
  ('10000000-0000-0000-0000-000000000001', 'ຜູ້ດູແລລະບົບ (Admin)'),
  ('10000000-0000-0000-0000-000000000002', 'ວິຊາການພາກວິຊາ (Academic Staff)'),
  ('10000000-0000-0000-0000-000000000003', 'ຫົວໜ້າພາກວິຊາ (Head of Department)'),
  ('10000000-0000-0000-0000-000000000004', 'ການເງິນ (Finance Officer)'),
  ('10000000-0000-0000-0000-000000000005', 'ໂຮງພິມ (Printing Officer)')
on conflict (id) do update set display_name = excluded.display_name;

insert into public.user_roles (profile_id, role_code)
values
  ('10000000-0000-0000-0000-000000000001', 'ADMIN'),
  ('10000000-0000-0000-0000-000000000002', 'STAFF'),
  ('10000000-0000-0000-0000-000000000003', 'HEAD'),
  ('10000000-0000-0000-0000-000000000003', 'STAFF'),
  ('10000000-0000-0000-0000-000000000004', 'FINANCE'),
  ('10000000-0000-0000-0000-000000000005', 'PRINTING')
on conflict (profile_id, role_code) do nothing;

-- =========================================================================
-- 7. Official 21 Advisors Directory (Academic Year 2026–2027)
-- =========================================================================

-- Profiles for 21 Advisors
insert into public.profiles (id, display_name) values
  ('20000000-0000-0000-0000-000000000001', 'ທ່ານ ຮສ. ແສງລັດສະໝີ ຈັນທະມິນາວົງ'),
  ('20000000-0000-0000-0000-000000000002', 'ທ່ານ ຮສ. ປອ. ຄຳເພັດ ບຸນນະດີ'),
  ('20000000-0000-0000-0000-000000000003', 'ທ່ານ ຮສ. ນາງ ມະໂນລົມ ຈັນທະວົງ'),
  ('20000000-0000-0000-0000-000000000004', 'ທ່ານ ອຈ. ປອ. ພອນໄຊ ວິລະກອນ'),
  ('20000000-0000-0000-0000-000000000005', 'ທ່ານ ປອ. ໄຊທະວີ ຫຼວງວິໄລ'),
  ('20000000-0000-0000-0000-000000000006', 'ທ່ານ ອຈ. ເມກຈອນ ບຸນທັນ'),
  ('20000000-0000-0000-0000-000000000007', 'ທ່ານ ປອ. ພອນປະດິດ ພຸມມະວົງ'),
  ('20000000-0000-0000-0000-000000000008', 'ທ່ານ ປອ. ຊານຸພາບ ພົມແກ້ວນາ'),
  ('20000000-0000-0000-0000-000000000009', 'ທ່ານ ປອ. ຈ່າຊົ່ງ ຢ່າໂກເຍ່ຍຕູ້'),
  ('20000000-0000-0000-0000-000000000010', 'ທ່ານ ປອ. ນາງ ພອນຄຳ ຫານໄຊຊະນະ'),
  ('20000000-0000-0000-0000-000000000011', 'ທ່ານ ຄຳໄຊ ລີຫວາຕູ້'),
  ('20000000-0000-0000-0000-000000000012', 'ທ່ານ ສຸກສະຫວັນ ຈຸນດາລີ'),
  ('20000000-0000-0000-0000-000000000013', 'ທ່ານ ບຸນປະເສີດ ອຸປະຖານາ'),
  ('20000000-0000-0000-0000-000000000014', 'ທ່ານ ນາງ ມະນິດດາ ທະວົງຈິດ'),
  ('20000000-0000-0000-0000-000000000015', 'ທ່ານ ນາງ ລັດທິດາ'),
  ('20000000-0000-0000-0000-000000000016', 'ທ່ານ ພຸດວັນ'),
  ('20000000-0000-0000-0000-000000000017', 'ທ່ານ ອຈ. ປອ. ຂັນທະນູ ຫລວງໄຊຊະນະ'),
  ('20000000-0000-0000-0000-000000000018', 'ທ່ານ ອຈ. ປອ. ຄຳເຜົ້າ ສີສະອາດ'),
  ('20000000-0000-0000-0000-000000000019', 'ທ່ານ ຮສ. ທາ ບຸນທັນ'),
  ('20000000-0000-0000-0000-000000000020', 'ທ່ານ ປອ. ສົມພອນ ກັນທະວົງ'),
  ('20000000-0000-0000-0000-000000000021', 'ທ່ານ ຮສ. ເສີມສັກ ດວງສີລາ')
on conflict (id) do update set display_name = excluded.display_name;

-- Roles for 21 Advisors
insert into public.user_roles (profile_id, role_code) values
  ('20000000-0000-0000-0000-000000000001', 'ADVISOR'), ('20000000-0000-0000-0000-000000000001', 'COMMITTEE'),
  ('20000000-0000-0000-0000-000000000002', 'ADVISOR'), ('20000000-0000-0000-0000-000000000002', 'COMMITTEE'),
  ('20000000-0000-0000-0000-000000000003', 'ADVISOR'), ('20000000-0000-0000-0000-000000000003', 'COMMITTEE'),
  ('20000000-0000-0000-0000-000000000004', 'ADVISOR'), ('20000000-0000-0000-0000-000000000004', 'COMMITTEE'),
  ('20000000-0000-0000-0000-000000000005', 'ADVISOR'), ('20000000-0000-0000-0000-000000000005', 'COMMITTEE'),
  ('20000000-0000-0000-0000-000000000006', 'ADVISOR'), ('20000000-0000-0000-0000-000000000006', 'COMMITTEE'),
  ('20000000-0000-0000-0000-000000000007', 'ADVISOR'), ('20000000-0000-0000-0000-000000000007', 'COMMITTEE'),
  ('20000000-0000-0000-0000-000000000008', 'ADVISOR'), ('20000000-0000-0000-0000-000000000008', 'COMMITTEE'),
  ('20000000-0000-0000-0000-000000000009', 'ADVISOR'), ('20000000-0000-0000-0000-000000000009', 'COMMITTEE'),
  ('20000000-0000-0000-0000-000000000010', 'ADVISOR'), ('20000000-0000-0000-0000-000000000010', 'COMMITTEE'),
  ('20000000-0000-0000-0000-000000000011', 'ADVISOR'), ('20000000-0000-0000-0000-000000000011', 'COMMITTEE'),
  ('20000000-0000-0000-0000-000000000012', 'ADVISOR'), ('20000000-0000-0000-0000-000000000012', 'COMMITTEE'),
  ('20000000-0000-0000-0000-000000000013', 'ADVISOR'), ('20000000-0000-0000-0000-000000000013', 'COMMITTEE'),
  ('20000000-0000-0000-0000-000000000014', 'ADVISOR'), ('20000000-0000-0000-0000-000000000014', 'COMMITTEE'),
  ('20000000-0000-0000-0000-000000000015', 'ADVISOR'), ('20000000-0000-0000-0000-000000000015', 'COMMITTEE'),
  ('20000000-0000-0000-0000-000000000016', 'ADVISOR'), ('20000000-0000-0000-0000-000000000016', 'COMMITTEE'),
  ('20000000-0000-0000-0000-000000000017', 'ADVISOR'), ('20000000-0000-0000-0000-000000000017', 'COMMITTEE'),
  ('20000000-0000-0000-0000-000000000018', 'ADVISOR'), ('20000000-0000-0000-0000-000000000018', 'COMMITTEE'),
  ('20000000-0000-0000-0000-000000000019', 'ADVISOR'), ('20000000-0000-0000-0000-000000000019', 'COMMITTEE'),
  ('20000000-0000-0000-0000-000000000020', 'ADVISOR'), ('20000000-0000-0000-0000-000000000020', 'COMMITTEE'),
  ('20000000-0000-0000-0000-000000000021', 'ADVISOR'), ('20000000-0000-0000-0000-000000000021', 'COMMITTEE')
on conflict (profile_id, role_code) do nothing;

-- Extended Teachers Table (ID, Academic Title, Affiliation, Quota)
insert into public.teachers (id, profile_id, academic_title, department, faculty, affiliation, quota)
values
  ('30000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 'ທ່ານ ຮສ.', 'ພາກວິຊາວິສະວະກຳຄອມພິວເຕີ', 'ຄະນະວິສະວະກຳສາດ', 'CEIT', 6),
  ('30000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000002', 'ທ່ານ ຮສ. ປອ.', 'ພາກວິຊາວິສະວະກຳຄອມພິວເຕີ', 'ຄະນະວິສະວະກຳສາດ', 'CEIT', 6),
  ('30000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000003', 'ທ່ານ ຮສ. ນາງ', 'ພາກວິຊາວິສະວະກຳຄອມພິວເຕີ', 'ຄະນະວິສະວະກຳສາດ', 'CEIT', 4),
  ('30000000-0000-0000-0000-000000000004', '20000000-0000-0000-0000-000000000004', 'ທ່ານ ອຈ. ປອ.', 'ພາກວິຊາວິສະວະກຳຊອບແວ', 'ຄະນະວິສະວະກຳສາດ', 'CEIT', 5),
  ('30000000-0000-0000-0000-000000000005', '20000000-0000-0000-0000-000000000005', 'ທ່ານ ປອ.', 'ພາກວິຊາເຕັກໂນໂລຊີຂໍ້ມູນຂ່າວສານ', 'ຄະນະວິສະວະກຳສາດ', 'CEIT', 5),
  ('30000000-0000-0000-0000-000000000006', '20000000-0000-0000-0000-000000000006', 'ທ່ານ ອຈ.', 'ພາກວິຊາເຕັກໂນໂລຊີຂໍ້ມູນຂ່າວສານ', 'ຄະນະວິສະວະກຳສາດ', 'CEIT', 6),
  ('30000000-0000-0000-0000-000000000007', '20000000-0000-0000-0000-000000000007', 'ທ່ານ ປອ.', 'ພາກວິຊາວິສະວະກຳຄອມພິວເຕີ', 'ຄະນະວິສະວະກຳສາດ', 'CEIT', 3),
  ('30000000-0000-0000-0000-000000000008', '20000000-0000-0000-0000-000000000008', 'ທ່ານ ປອ.', 'ພາກວິຊາເຕັກໂນໂລຊີຂໍ້ມູນຂ່າວສານ', 'ຄະນະວິສະວະກຳສາດ', 'CEIT', 4),
  ('30000000-0000-0000-0000-000000000009', '20000000-0000-0000-0000-000000000009', 'ທ່ານ ປອ.', 'ພາກວິຊາວິສະວະກຳຊອບແວ', 'ຄະນະວິສະວະກຳສາດ', 'CEIT', 4),
  ('30000000-0000-0000-0000-000000000010', '20000000-0000-0000-0000-000000000010', 'ທ່ານ ປອ. ນາງ', 'ພາກວິຊາວິສະວະກຳຄອມພິວເຕີ', 'ຄະນະວິສະວະກຳສາດ', 'CEIT', 4),
  ('30000000-0000-0000-0000-000000000011', '20000000-0000-0000-0000-000000000011', 'ທ່ານ', 'ພາກວິຊາເຕັກໂນໂລຊີຂໍ້ມູນຂ່າວສານ', 'ຄະນະວິສະວະກຳສາດ', 'CEIT', 4),
  ('30000000-0000-0000-0000-000000000012', '20000000-0000-0000-0000-000000000012', 'ທ່ານ', 'ພາກວິຊາວິສະວະກຳຊອບແວ', 'ຄະນະວິສະວະກຳສາດ', 'CEIT', 5),
  ('30000000-0000-0000-0000-000000000013', '20000000-0000-0000-0000-000000000013', 'ທ່ານ', 'ພາກວິຊາເຕັກໂນໂລຊີຂໍ້ມູນຂ່າວສານ', 'ຄະນະວິສະວະກຳສາດ', 'CEIT', 4),
  ('30000000-0000-0000-0000-000000000014', '20000000-0000-0000-0000-000000000014', 'ທ່ານ ນາງ', 'ພາກວິຊາວິສະວະກຳຊອບແວ', 'ຄະນະວິສະວະກຳສາດ', 'CEIT', 4),
  ('30000000-0000-0000-0000-000000000015', '20000000-0000-0000-0000-000000000015', 'ທ່ານ ນາງ', 'ພາກວິຊາວິສະວະກຳຄອມພິວເຕີ', 'ຄະນະວິສະວະກຳສາດ', 'CEIT', 2),
  ('30000000-0000-0000-0000-000000000016', '20000000-0000-0000-0000-000000000016', 'ທ່ານ', 'ພາກວິຊາເຕັກໂນໂລຊີຂໍ້ມູນຂ່າວສານ', 'ຄະນະວິສະວະກຳສາດ', 'CEIT', 2),
  ('30000000-0000-0000-0000-000000000017', '20000000-0000-0000-0000-000000000017', 'ທ່ານ ອຈ. ປອ.', 'ພາກວິຊາວິສະວະກຳຄອມພິວເຕີ', 'ຄະນະວິສະວະກຳສາດ', 'ວິຊາການ ຄວສ', 3),
  ('30000000-0000-0000-0000-000000000018', '20000000-0000-0000-0000-000000000018', 'ທ່ານ ອຈ. ປອ.', 'ພາກວິຊາວິສະວະກຳຄອມພິວເຕີ', 'ຄະນະວິສະວະກຳສາດ', 'ຄົ້ນຄວ້າວິທະຍາສາດ ຄວສ', 3),
  ('30000000-0000-0000-0000-000000000019', '20000000-0000-0000-0000-000000000019', 'ທ່ານ ຮສ.', 'ອາຈານບຳນານ CEIT', 'ຄະນະວິສະວະກຳສາດ', 'ອາຈານບຳນານ', 4),
  ('30000000-0000-0000-0000-000000000020', '20000000-0000-0000-0000-000000000020', 'ທ່ານ ປອ.', 'ອາຈານບຳນານ CEIT', 'ຄະນະວິສະວະກຳສາດ', 'ອາຈານບຳນານ', 4),
  ('30000000-0000-0000-0000-000000000021', '20000000-0000-0000-0000-000000000021', 'ທ່ານ ຮສ.', 'ອາຈານບຳນານ CEIT', 'ຄະນະວິສະວະກຳສາດ', 'ອາຈານບຳນານ', 2)
on conflict (id) do update set
  academic_title = excluded.academic_title,
  department = excluded.department,
  faculty = excluded.faculty,
  affiliation = excluded.affiliation,
  quota = excluded.quota;

-- =========================================================================
-- 8. Advisor Eligible Categories (Primary vs Secondary/Conditional)
-- =========================================================================

insert into public.teacher_expertise (teacher_id, category_code, is_primary, is_secondary, is_conditional)
values
  -- 1. ທ່ານ ຮສ. ແສງລັດສະໝີ ຈັນທະມິນາວົງ (Software, Network/Server, Cybersecurity, Hardware)
  ('30000000-0000-0000-0000-000000000001', 'SOFTWARE', true, false, false),
  ('30000000-0000-0000-0000-000000000001', 'NETWORK', true, false, false),
  ('30000000-0000-0000-0000-000000000001', 'CYBERSECURITY', true, false, false),
  ('30000000-0000-0000-0000-000000000001', 'HARDWARE', true, false, false),

  -- 2. ທ່ານ ຮສ. ປອ. ຄຳເພັດ ບຸນນະດີ (Software, Hardware, Multimedia)
  ('30000000-0000-0000-0000-000000000002', 'SOFTWARE', true, false, false),
  ('30000000-0000-0000-0000-000000000002', 'HARDWARE', true, false, false),
  ('30000000-0000-0000-0000-000000000002', 'MULTIMEDIA', true, false, false),

  -- 3. ທ່ານ ຮສ. ນາງ ມະໂນລົມ ຈັນທະວົງ (Software, Hardware, Multimedia)
  ('30000000-0000-0000-0000-000000000003', 'SOFTWARE', true, false, false),
  ('30000000-0000-0000-0000-000000000003', 'HARDWARE', true, false, false),
  ('30000000-0000-0000-0000-000000000003', 'MULTIMEDIA', true, false, false),

  -- 4. ທ່ານ ອຈ. ປອ. ພອນໄຊ ວິລະກອນ (Software)
  ('30000000-0000-0000-0000-000000000004', 'SOFTWARE', true, false, false),

  -- 5. ທ່ານ ປອ. ໄຊທະວີ ຫຼວງວິໄລ (Software, Network/Server)
  ('30000000-0000-0000-0000-000000000005', 'SOFTWARE', true, false, false),
  ('30000000-0000-0000-0000-000000000005', 'NETWORK', true, false, false),

  -- 6. ທ່ານ ອຈ. ເມກຈອນ ບຸນທັນ (Software, Hardware)
  ('30000000-0000-0000-0000-000000000006', 'SOFTWARE', true, false, false),
  ('30000000-0000-0000-0000-000000000006', 'HARDWARE', true, false, false),

  -- 7. ທ່ານ ປອ. ພອນປະດິດ ພຸມມະວົງ (Software, Network/Server)
  ('30000000-0000-0000-0000-000000000007', 'SOFTWARE', true, false, false),
  ('30000000-0000-0000-0000-000000000007', 'NETWORK', true, false, false),

  -- 8. ທ່ານ ປອ. ຊານຸພາບ ພົມແກ້ວນາ (Network/Server, Cybersecurity, Multimedia)
  ('30000000-0000-0000-0000-000000000008', 'NETWORK', true, false, false),
  ('30000000-0000-0000-0000-000000000008', 'CYBERSECURITY', true, false, false),
  ('30000000-0000-0000-0000-000000000008', 'MULTIMEDIA', true, false, false),

  -- 9. ທ່ານ ປອ. ຈ່າຊົ່ງ ຢ່າໂກເຍ່ຍຕູ້ (Software, Network/Server, Cybersecurity)
  ('30000000-0000-0000-0000-000000000009', 'SOFTWARE', true, false, false),
  ('30000000-0000-0000-0000-000000000009', 'NETWORK', true, false, false),
  ('30000000-0000-0000-0000-000000000009', 'CYBERSECURITY', true, false, false),

  -- 10. ທ່ານ ປອ. ນາງ ພອນຄຳ ຫານໄຊຊະນະ (Software, Hardware)
  ('30000000-0000-0000-0000-000000000010', 'SOFTWARE', true, false, false),
  ('30000000-0000-0000-0000-000000000010', 'HARDWARE', true, false, false),

  -- 11. ທ່ານ ຄຳໄຊ ລີຫວາຕູ້ (Network/Server, Cybersecurity, Multimedia [Secondary/Conditional])
  ('30000000-0000-0000-0000-000000000011', 'NETWORK', true, false, false),
  ('30000000-0000-0000-0000-000000000011', 'CYBERSECURITY', true, false, false),
  ('30000000-0000-0000-0000-000000000011', 'MULTIMEDIA', false, true, true),

  -- 12. ທ່ານ ສຸກສະຫວັນ ຈຸນດາລີ (Software)
  ('30000000-0000-0000-0000-000000000012', 'SOFTWARE', true, false, false),

  -- 13. ທ່ານ ບຸນປະເສີດ ອຸປະຖານາ (Multimedia)
  ('30000000-0000-0000-0000-000000000013', 'MULTIMEDIA', true, false, false),

  -- 14. ທ່ານ ນາງ ມະນິດດາ ທະວົງຈິດ (Software, Cybersecurity)
  ('30000000-0000-0000-0000-000000000014', 'SOFTWARE', true, false, false),
  ('30000000-0000-0000-0000-000000000014', 'CYBERSECURITY', true, false, false),

  -- 15. ທ່ານ ນາງ ລັດທິດາ (Hardware, Multimedia [Secondary/Conditional])
  ('30000000-0000-0000-0000-000000000015', 'HARDWARE', true, false, false),
  ('30000000-0000-0000-0000-000000000015', 'MULTIMEDIA', false, true, true),

  -- 16. ທ່ານ ພຸດວັນ (Network/Server, Multimedia)
  ('30000000-0000-0000-0000-000000000016', 'NETWORK', true, false, false),
  ('30000000-0000-0000-0000-000000000016', 'MULTIMEDIA', true, false, false),

  -- 17. ທ່ານ ອຈ. ປອ. ຂັນທະນູ ຫລວງໄຊຊະນະ (Software, Hardware, Multimedia)
  ('30000000-0000-0000-0000-000000000017', 'SOFTWARE', true, false, false),
  ('30000000-0000-0000-0000-000000000017', 'HARDWARE', true, false, false),
  ('30000000-0000-0000-0000-000000000017', 'MULTIMEDIA', true, false, false),

  -- 18. ທ່ານ ອຈ. ປອ. ຄຳເຜົ້າ ສີສະອາດ (Network/Server, Cybersecurity)
  ('30000000-0000-0000-0000-000000000018', 'NETWORK', true, false, false),
  ('30000000-0000-0000-0000-000000000018', 'CYBERSECURITY', true, false, false),

  -- 19. ທ່ານ ຮສ. ທາ ບຸນທັນ (Software, Network/Server, Hardware)
  ('30000000-0000-0000-0000-000000000019', 'SOFTWARE', true, false, false),
  ('30000000-0000-0000-0000-000000000019', 'NETWORK', true, false, false),
  ('30000000-0000-0000-0000-000000000019', 'HARDWARE', true, false, false),

  -- 20. ທ່ານ ປອ. ສົມພອນ ກັນທະວົງ (Software, Network/Server)
  ('30000000-0000-0000-0000-000000000020', 'SOFTWARE', true, false, false),
  ('30000000-0000-0000-0000-000000000020', 'NETWORK', true, false, false),

  -- 21. ທ່ານ ຮສ. ເສີມສັກ ດວງສີລາ (Network/Server, Cybersecurity)
  ('30000000-0000-0000-0000-000000000021', 'NETWORK', true, false, false),
  ('30000000-0000-0000-0000-000000000021', 'CYBERSECURITY', true, false, false)
on conflict (teacher_id, category_code) do update
set
  is_primary = excluded.is_primary,
  is_secondary = excluded.is_secondary,
  is_conditional = excluded.is_conditional;

commit;

-- Thesis domain queries for sqlc

-- =========================================================================
-- Students
-- =========================================================================

-- name: GetStudentByProfileID :one
SELECT id, profile_id, student_code, department, faculty, created_at, updated_at
FROM public.students
WHERE profile_id = $1;

-- name: GetStudentByID :one
SELECT id, profile_id, student_code, department, faculty, created_at, updated_at
FROM public.students
WHERE id = $1;

-- name: CreateStudent :one
INSERT INTO public.students (profile_id, student_code, department, faculty)
VALUES ($1, $2, $3, $4)
RETURNING id, profile_id, student_code, department, faculty, created_at, updated_at;

-- name: ListStudentsWithDetails :many
SELECT s.id, s.profile_id, s.student_code, s.department, s.faculty,
       p.display_name, s.created_at, s.updated_at,
       t.id AS thesis_id, t.topic_th AS thesis_topic_th, t.topic_en AS thesis_topic_en,
       t.status AS thesis_status, tm.is_leader,
       adv_p.display_name AS primary_advisor_name
FROM public.students s
JOIN public.profiles p ON p.id = s.profile_id
LEFT JOIN public.thesis_members tm ON tm.student_id = s.id
LEFT JOIN public.theses t ON t.id = tm.thesis_id
LEFT JOIN public.thesis_advisors ta ON ta.thesis_id = t.id AND ta.is_primary = true
LEFT JOIN public.teachers adv_tc ON adv_tc.id = ta.teacher_id
LEFT JOIN public.profiles adv_p ON adv_p.id = adv_tc.profile_id
ORDER BY s.student_code;

-- name: UpdateStudent :one
UPDATE public.students
SET student_code = $2, department = $3, faculty = $4, updated_at = now()
WHERE id = $1
RETURNING id, profile_id, student_code, department, faculty, created_at, updated_at;

-- =========================================================================
-- Teachers
-- =========================================================================

-- name: GetTeacherByProfileID :one
SELECT id, profile_id, academic_title, department, faculty, created_at, updated_at
FROM public.teachers
WHERE profile_id = $1;

-- name: GetTeacherByID :one
SELECT id, profile_id, academic_title, department, faculty, created_at, updated_at
FROM public.teachers
WHERE id = $1;

-- name: ListTeachers :many
SELECT t.id, t.profile_id, t.academic_title, t.department, t.faculty,
       p.display_name, t.created_at, t.updated_at
FROM public.teachers t
JOIN public.profiles p ON p.id = t.profile_id
ORDER BY p.display_name
LIMIT $1 OFFSET $2;

-- name: ListTeachersWithStats :many
SELECT t.id, t.profile_id, t.academic_title, t.department, t.faculty,
       p.display_name, t.created_at, t.updated_at,
       COUNT(DISTINCT ta.thesis_id)::int AS advising_count,
       COUNT(DISTINCT ec.exam_id)::int AS committee_count
FROM public.teachers t
JOIN public.profiles p ON p.id = t.profile_id
LEFT JOIN public.thesis_advisors ta ON ta.teacher_id = t.id
LEFT JOIN public.exam_committees ec ON ec.teacher_id = t.id
GROUP BY t.id, p.display_name
ORDER BY p.display_name;

-- name: CreateTeacher :one
INSERT INTO public.teachers (profile_id, academic_title, department, faculty)
VALUES ($1, $2, $3, $4)
RETURNING id, profile_id, academic_title, department, faculty, created_at, updated_at;

-- name: UpdateTeacher :one
UPDATE public.teachers
SET academic_title = $2, department = $3, faculty = $4, updated_at = now()
WHERE id = $1
RETURNING id, profile_id, academic_title, department, faculty, created_at, updated_at;

-- name: ListTeacherAdvisingTheses :many
SELECT t.id AS thesis_id, t.topic_th, t.topic_en, t.status, t.academic_year, t.semester,
       ta.is_primary, ta.assigned_at
FROM public.thesis_advisors ta
JOIN public.theses t ON t.id = ta.thesis_id
WHERE ta.teacher_id = $1
ORDER BY ta.assigned_at DESC;

-- name: ListTeacherCommittees :many
SELECT e.id AS exam_id, e.thesis_id, e.exam_type_code, e.scheduled_date, e.start_time, e.end_time,
       e.status AS exam_status, ec.role AS committee_role,
       t.topic_th, t.topic_en
FROM public.exam_committees ec
JOIN public.exams e ON e.id = ec.exam_id
JOIN public.theses t ON t.id = e.thesis_id
WHERE ec.teacher_id = $1
ORDER BY e.scheduled_date DESC NULLS LAST;

-- =========================================================================
-- Theses
-- =========================================================================

-- name: CreateThesis :one
INSERT INTO public.theses (topic_th, topic_en, abstract_th, abstract_en, status, academic_year, semester)
VALUES ($1, $2, $3, $4, $5, $6, $7)
RETURNING *;

-- name: GetThesisByID :one
SELECT * FROM public.theses WHERE id = $1;

-- name: UpdateThesisTopics :one
UPDATE public.theses
SET topic_th = $2, topic_en = $3, abstract_th = $4, abstract_en = $5
WHERE id = $1
RETURNING *;

-- name: UpdateThesisStatus :one
UPDATE public.theses
SET status = $2
WHERE id = $1
RETURNING *;

-- name: SetThesisSubmittedAt :exec
UPDATE public.theses SET submitted_at = now() WHERE id = $1;

-- name: SetThesisApprovedAt :exec
UPDATE public.theses SET approved_at = now() WHERE id = $1;

-- name: SetThesisCompletedAt :exec
UPDATE public.theses SET completed_at = now() WHERE id = $1;

-- name: ListThesesByStatus :many
SELECT t.*
FROM public.theses t
WHERE ($1::text = '' OR t.status = $1::text)
ORDER BY t.updated_at DESC
LIMIT $2 OFFSET $3;

-- name: ListThesesByStudentProfile :many
SELECT t.*
FROM public.theses t
JOIN public.thesis_members tm ON tm.thesis_id = t.id
JOIN public.students s ON s.id = tm.student_id
WHERE s.profile_id = $1
ORDER BY t.updated_at DESC;

-- name: ListThesesByAdvisorProfile :many
SELECT t.*
FROM public.theses t
JOIN public.thesis_advisors ta ON ta.thesis_id = t.id
JOIN public.teachers tc ON tc.id = ta.teacher_id
WHERE tc.profile_id = $1
ORDER BY t.updated_at DESC;

-- name: CountThesesByStatus :many
SELECT status, count(*)::int AS count
FROM public.theses
GROUP BY status
ORDER BY status;

-- =========================================================================
-- Thesis Members
-- =========================================================================

-- name: AddThesisMember :one
INSERT INTO public.thesis_members (thesis_id, student_id, is_leader)
VALUES ($1, $2, $3)
ON CONFLICT (thesis_id, student_id) DO NOTHING
RETURNING *;

-- name: RemoveThesisMember :exec
DELETE FROM public.thesis_members
WHERE thesis_id = $1 AND student_id = $2;

-- name: ListThesisMembers :many
SELECT tm.id, tm.thesis_id, tm.student_id, tm.is_leader, tm.joined_at,
       s.student_code, s.department, s.faculty,
       p.display_name
FROM public.thesis_members tm
JOIN public.students s ON s.id = tm.student_id
JOIN public.profiles p ON p.id = s.profile_id
WHERE tm.thesis_id = $1
ORDER BY tm.is_leader DESC, tm.joined_at;

-- =========================================================================
-- Thesis Advisors
-- =========================================================================

-- name: AssignThesisAdvisor :one
INSERT INTO public.thesis_advisors (thesis_id, teacher_id, is_primary)
VALUES ($1, $2, $3)
ON CONFLICT (thesis_id, teacher_id) DO NOTHING
RETURNING *;

-- name: RemoveThesisAdvisor :exec
DELETE FROM public.thesis_advisors
WHERE thesis_id = $1 AND teacher_id = $2;

-- name: ListThesisAdvisors :many
SELECT ta.id, ta.thesis_id, ta.teacher_id, ta.is_primary, ta.assigned_at,
       tc.academic_title, tc.department,
       p.display_name
FROM public.thesis_advisors ta
JOIN public.teachers tc ON tc.id = ta.teacher_id
JOIN public.profiles p ON p.id = tc.profile_id
WHERE ta.thesis_id = $1
ORDER BY ta.is_primary DESC, ta.assigned_at;

-- =========================================================================
-- Thesis Files
-- =========================================================================

-- name: CreateThesisFile :one
INSERT INTO public.thesis_files (thesis_id, uploaded_by, file_type, file_name, storage_path, file_size_bytes, mime_type, description)
VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
RETURNING *;

-- name: ListThesisFiles :many
SELECT * FROM public.thesis_files
WHERE thesis_id = $1
ORDER BY uploaded_at DESC;

-- =========================================================================
-- Thesis Revisions
-- =========================================================================

-- name: CreateThesisRevision :one
INSERT INTO public.thesis_revisions (thesis_id, version_number, submitted_by, file_name, storage_path, notes)
VALUES ($1, $2, $3, $4, $5, $6)
RETURNING *;

-- name: GetLatestRevision :one
SELECT * FROM public.thesis_revisions
WHERE thesis_id = $1
ORDER BY version_number DESC
LIMIT 1;

-- name: UpdateRevisionStatus :one
UPDATE public.thesis_revisions
SET status = $2, reviewed_by = $3, reviewed_at = now(), review_comments = $4
WHERE id = $1
RETURNING *;

-- name: ListThesisRevisions :many
SELECT * FROM public.thesis_revisions
WHERE thesis_id = $1
ORDER BY version_number DESC;

-- =========================================================================
-- Audit log (reusable across domains)
-- =========================================================================

-- name: InsertAuditLog :exec
INSERT INTO public.audit_logs (actor_id, request_id, action, entity_type, entity_id, old_values, new_values, metadata)
VALUES ($1, $2, $3, $4, $5, $6, $7, $8);

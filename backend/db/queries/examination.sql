-- Examination domain queries for sqlc

-- =========================================================================
-- Exam Types
-- =========================================================================

-- name: ListExamTypes :many
SELECT code, name, description, created_at
FROM public.exam_types
ORDER BY code;

-- =========================================================================
-- Exam Rooms
-- =========================================================================

-- name: ListExamRooms :many
SELECT id, name, building, floor, capacity, is_active, created_at
FROM public.exam_rooms
WHERE ($1::boolean IS NULL OR is_active = $1::boolean)
ORDER BY name;

-- name: CreateExamRoom :one
INSERT INTO public.exam_rooms (name, building, floor, capacity)
VALUES ($1, $2, $3, $4)
RETURNING *;

-- name: UpdateExamRoom :one
UPDATE public.exam_rooms
SET name = $2, building = $3, floor = $4, capacity = $5, is_active = $6
WHERE id = $1
RETURNING *;

-- =========================================================================
-- Exams
-- =========================================================================

-- name: CreateExam :one
INSERT INTO public.exams (thesis_id, exam_type_code, room_id, scheduled_date, start_time, end_time, notes, round_id, attempt_no)
VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
RETURNING *;

-- name: GetExamByID :one
SELECT * FROM public.exams WHERE id = $1;

-- name: GetLatestExamAttempt :one
SELECT COALESCE(MAX(attempt_no), 0)::int AS max_attempt
FROM public.exams
WHERE thesis_id = $1 AND exam_type_code = $2;

-- name: UpdateExamSchedule :one
UPDATE public.exams
SET room_id = $2, scheduled_date = $3, start_time = $4, end_time = $5, notes = $6, round_id = $7
WHERE id = $1
RETURNING *;

-- name: UpdateExamStatus :one
UPDATE public.exams
SET status = $2
WHERE id = $1
RETURNING *;

-- name: UpdateExamResult :one
UPDATE public.exams
SET result = $2, result_notes = $3, decided_by = $4, decided_at = now(), status = 'COMPLETED'
WHERE id = $1
RETURNING *;

-- name: ListExamsByThesis :many
SELECT * FROM public.exams
WHERE thesis_id = $1
ORDER BY scheduled_date DESC NULLS LAST;

-- name: ListExamsByStatus :many
SELECT e.*, t.topic_en, t.topic_th
FROM public.exams e
JOIN public.theses t ON t.id = e.thesis_id
WHERE ($1::text = '' OR e.status = $1::text)
ORDER BY e.scheduled_date ASC NULLS LAST
LIMIT $2 OFFSET $3;

-- name: ListExamsByCommitteeMember :many
SELECT e.*
FROM public.exams e
JOIN public.exam_committees ec ON ec.exam_id = e.id
JOIN public.teachers t ON t.id = ec.teacher_id
WHERE t.profile_id = $1
ORDER BY e.scheduled_date ASC NULLS LAST;

-- name: CountExamsByStatus :many
SELECT status, count(*)::int AS count
FROM public.exams
GROUP BY status
ORDER BY status;

-- =========================================================================
-- Exam Committees
-- =========================================================================

-- name: AssignExamCommittee :one
INSERT INTO public.exam_committees (exam_id, teacher_id, role)
VALUES ($1, $2, $3)
ON CONFLICT (exam_id, teacher_id) DO UPDATE SET role = excluded.role
RETURNING *;

-- name: RemoveExamCommittee :exec
DELETE FROM public.exam_committees
WHERE exam_id = $1 AND teacher_id = $2;

-- name: ListExamCommittees :many
SELECT ec.id, ec.exam_id, ec.teacher_id, ec.role, ec.assigned_at,
       t.academic_title, t.department,
       p.display_name
FROM public.exam_committees ec
JOIN public.teachers t ON t.id = ec.teacher_id
JOIN public.profiles p ON p.id = t.profile_id
WHERE ec.exam_id = $1
ORDER BY
  CASE ec.role WHEN 'CHAIRMAN' THEN 0 WHEN 'SECRETARY' THEN 2 ELSE 1 END,
  ec.assigned_at;

-- =========================================================================
-- Evaluation Criteria
-- =========================================================================

-- name: ListEvaluationCriteria :many
SELECT id, exam_type_code, name, description, max_score, weight, sort_order, is_active
FROM public.evaluation_criteria
WHERE exam_type_code = $1 AND is_active = true
ORDER BY sort_order;

-- name: CreateEvaluationCriteria :one
INSERT INTO public.evaluation_criteria (exam_type_code, name, description, max_score, weight, sort_order)
VALUES ($1, $2, $3, $4, $5, $6)
RETURNING *;

-- name: UpdateEvaluationCriteria :one
UPDATE public.evaluation_criteria
SET name = $2, description = $3, max_score = $4, weight = $5, sort_order = $6, is_active = $7
WHERE id = $1
RETURNING *;

-- =========================================================================
-- Evaluation Scores
-- =========================================================================

-- name: UpsertEvaluationScore :one
INSERT INTO public.evaluation_scores (exam_id, criteria_id, committee_member_id, score, comment)
VALUES ($1, $2, $3, $4, $5)
ON CONFLICT (exam_id, criteria_id, committee_member_id) DO UPDATE
SET score = excluded.score, comment = excluded.comment, scored_at = now()
RETURNING *;

-- name: ListScoresByExam :many
SELECT es.id, es.exam_id, es.criteria_id, es.committee_member_id, es.score, es.comment, es.scored_at,
       ec.name AS criteria_name, ec.max_score, ec.weight,
       p.display_name AS scorer_name
FROM public.evaluation_scores es
JOIN public.evaluation_criteria ec ON ec.id = es.criteria_id
JOIN public.exam_committees ecm ON ecm.id = es.committee_member_id
JOIN public.teachers t ON t.id = ecm.teacher_id
JOIN public.profiles p ON p.id = t.profile_id
WHERE es.exam_id = $1
ORDER BY ec.sort_order, p.display_name;

-- name: GetExamScoreSummary :many
SELECT ec.id AS criteria_id, ec.name AS criteria_name, ec.max_score, ec.weight,
       COALESCE(avg(es.score), 0)::numeric(5,2) AS avg_score,
       count(es.id)::int AS scorer_count
FROM public.evaluation_criteria ec
LEFT JOIN public.evaluation_scores es ON es.criteria_id = ec.id AND es.exam_id = $1
WHERE ec.exam_type_code = $2 AND ec.is_active = true
GROUP BY ec.id, ec.name, ec.max_score, ec.weight, ec.sort_order
ORDER BY ec.sort_order;

-- =========================================================================
-- Exam Comments
-- =========================================================================

-- name: CreateExamComment :one
INSERT INTO public.exam_comments (exam_id, committee_member_id, comment_type, content)
VALUES ($1, $2, $3, $4)
RETURNING *;

-- name: ListExamComments :many
SELECT ec.id, ec.exam_id, ec.committee_member_id, ec.comment_type, ec.content, ec.created_at,
       p.display_name AS author_name
FROM public.exam_comments ec
JOIN public.exam_committees ecm ON ecm.id = ec.committee_member_id
JOIN public.teachers t ON t.id = ecm.teacher_id
JOIN public.profiles p ON p.id = t.profile_id
WHERE ec.exam_id = $1
ORDER BY ec.created_at;

-- =========================================================================
-- Categories & Teacher Expertise
-- =========================================================================

-- name: ListThesisCategories :many
SELECT code, name, sort_order, created_at
FROM public.thesis_categories
ORDER BY sort_order;

-- name: ListTeacherExpertise :many
SELECT te.teacher_id, te.category_code, tc.name AS category_name
FROM public.teacher_expertise te
JOIN public.thesis_categories tc ON tc.code = te.category_code
WHERE te.teacher_id = $1
ORDER BY tc.sort_order;

-- name: ListTeachersByExpertise :many
SELECT t.id, t.profile_id, t.academic_title, t.department, t.faculty,
       p.display_name, te.category_code
FROM public.teachers t
JOIN public.profiles p ON p.id = t.profile_id
JOIN public.teacher_expertise te ON te.teacher_id = t.id
WHERE te.category_code = $1
ORDER BY p.display_name;

-- name: AssignTeacherExpertise :exec
INSERT INTO public.teacher_expertise (teacher_id, category_code)
VALUES ($1, $2)
ON CONFLICT (teacher_id, category_code) DO NOTHING;

-- name: RemoveTeacherExpertise :exec
DELETE FROM public.teacher_expertise
WHERE teacher_id = $1 AND category_code = $2;

-- =========================================================================
-- Exam Rounds & Round Rooms
-- =========================================================================

-- name: ListExamRounds :many
SELECT id, academic_year, period, round_no, name, start_date, end_date, status, closed_at, created_at, updated_at
FROM public.exam_rounds
WHERE ($1::int = 0 OR academic_year = $1::int)
  AND ($2::text = '' OR period = $2::text)
ORDER BY academic_year DESC, period DESC, round_no ASC;

-- name: GetExamRoundByID :one
SELECT * FROM public.exam_rounds WHERE id = $1;

-- name: CreateExamRound :one
INSERT INTO public.exam_rounds (academic_year, period, round_no, name, start_date, end_date)
VALUES ($1, $2, $3, $4, $5, $6)
RETURNING *;

-- name: CloseExamRound :one
UPDATE public.exam_rounds
SET status = 'CLOSED', closed_at = now()
WHERE id = $1
RETURNING *;

-- name: ListExamRoundRooms :many
SELECT err.round_id, err.room_id, err.category_code,
       r.name AS room_name, r.building, r.floor, r.capacity,
       c.name AS category_name
FROM public.exam_round_rooms err
JOIN public.exam_rooms r ON r.id = err.room_id
JOIN public.thesis_categories c ON c.code = err.category_code
WHERE err.round_id = $1
ORDER BY r.name;

-- name: AssignExamRoundRoom :one
INSERT INTO public.exam_round_rooms (round_id, room_id, category_code)
VALUES ($1, $2, $3)
ON CONFLICT (round_id, room_id) DO UPDATE SET category_code = excluded.category_code
RETURNING *;

-- name: RemoveExamRoundRoom :exec
DELETE FROM public.exam_round_rooms
WHERE round_id = $1 AND room_id = $2;

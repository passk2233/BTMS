-- Examination domain tables.
--
-- Covers exam types, scheduling, rooms, committee assignment, evaluation
-- criteria, scoring, results, and comments. Score calculation and result
-- finalization are performed exclusively by the Go API.
--
-- Depends on: 20261001000000_thesis_core.sql

begin;

-- =========================================================================
-- 1. Exam Types (seeded)
-- =========================================================================

create table public.exam_types (
  code text primary key,
  name text not null,
  description text not null default '',
  created_at timestamptz not null default now(),
  constraint exam_types_code_format check (code = upper(code) and code ~ '^[A-Z][A-Z_]*$'),
  constraint exam_types_name_not_blank check (btrim(name) <> '')
);

comment on table public.exam_types is
  'Catalogue of examination types (PROPOSAL, FINAL, etc.). Seeded at migration time.';

insert into public.exam_types (code, name, description) values
  ('PROPOSAL', 'Proposal Examination', 'Evaluates the thesis proposal, scope, and feasibility'),
  ('FINAL', 'Final Examination', 'Evaluates the completed thesis, product demo, and presentation')
on conflict (code) do update set
  name = excluded.name,
  description = excluded.description;

-- =========================================================================
-- 2. Exam Rooms
-- =========================================================================

create table public.exam_rooms (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  building text not null default '',
  floor text not null default '',
  capacity integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  constraint exam_rooms_name_not_blank check (btrim(name) <> ''),
  constraint exam_rooms_capacity_positive check (capacity >= 0)
);

comment on table public.exam_rooms is
  'Available examination rooms. Managed by staff.';

-- =========================================================================
-- 3. Exams
-- =========================================================================

create table public.exams (
  id uuid primary key default gen_random_uuid(),
  thesis_id uuid not null references public.theses (id) on delete cascade,
  exam_type_code text not null references public.exam_types (code),
  room_id uuid references public.exam_rooms (id) on delete set null,
  status text not null default 'SCHEDULED',
  scheduled_date date,
  start_time time,
  end_time time,
  notes text not null default '',
  result text,
  result_notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint exams_status_valid check (status in (
    'SCHEDULED', 'IN_PROGRESS', 'SCORING', 'COMPLETED', 'CANCELLED'
  )),
  constraint exams_result_valid check (result is null or result in (
    'PASS', 'PASS_WITH_REVISION', 'FAIL'
  )),
  constraint exams_time_order check (
    start_time is null or end_time is null or start_time < end_time
  )
);

comment on table public.exams is
  'Examination instances linked to a thesis. Scheduling, scoring, and result calculation are performed by the Go API.';

create index exams_thesis_idx on public.exams (thesis_id);
create index exams_status_idx on public.exams (status);
create index exams_date_idx on public.exams (scheduled_date);

create trigger exams_set_updated_at
before update on public.exams
for each row execute function private.set_updated_at();

-- =========================================================================
-- 4. Exam Committees
-- =========================================================================

create table public.exam_committees (
  id uuid primary key default gen_random_uuid(),
  exam_id uuid not null references public.exams (id) on delete cascade,
  teacher_id uuid not null references public.teachers (id) on delete cascade,
  role text not null default 'COMMITTEE',
  assigned_at timestamptz not null default now(),
  constraint exam_committees_unique unique (exam_id, teacher_id),
  constraint exam_committees_role_valid check (role in (
    'CHAIRMAN', 'COMMITTEE', 'SECRETARY'
  ))
);

comment on table public.exam_committees is
  'Committee assignments for an examination. Each exam should have one CHAIRMAN.';

create index exam_committees_teacher_idx on public.exam_committees (teacher_id);

-- =========================================================================
-- 5. Evaluation Criteria
-- =========================================================================

create table public.evaluation_criteria (
  id uuid primary key default gen_random_uuid(),
  exam_type_code text not null references public.exam_types (code),
  name text not null,
  description text not null default '',
  max_score numeric(5,2) not null default 100,
  weight numeric(5,4) not null default 1.0,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  constraint criteria_name_not_blank check (btrim(name) <> ''),
  constraint criteria_max_score_positive check (max_score > 0),
  constraint criteria_weight_positive check (weight > 0)
);

comment on table public.evaluation_criteria is
  'Scoring rubric for each exam type. Each criterion has a max score and weight. Managed by admin/staff.';

create index evaluation_criteria_type_idx on public.evaluation_criteria (exam_type_code, sort_order);

-- Seed default proposal examination criteria
insert into public.evaluation_criteria (exam_type_code, name, description, max_score, weight, sort_order) values
  ('PROPOSAL', 'Topic Relevance', 'Relevance and significance of the research topic', 100, 0.15, 1),
  ('PROPOSAL', 'Literature Review', 'Comprehensiveness and quality of related work', 100, 0.15, 2),
  ('PROPOSAL', 'Methodology', 'Appropriateness of proposed methodology and approach', 100, 0.20, 3),
  ('PROPOSAL', 'Feasibility', 'Feasibility of completing within the timeframe', 100, 0.15, 4),
  ('PROPOSAL', 'Presentation', 'Clarity and quality of presentation', 100, 0.15, 5),
  ('PROPOSAL', 'Q&A Response', 'Quality of responses to committee questions', 100, 0.20, 6);

-- Seed default final examination criteria
insert into public.evaluation_criteria (exam_type_code, name, description, max_score, weight, sort_order) values
  ('FINAL', 'Product Quality', 'Functionality, reliability, and completeness of the product', 100, 0.20, 1),
  ('FINAL', 'Technical Implementation', 'Code quality, architecture, and technical decisions', 100, 0.15, 2),
  ('FINAL', 'Testing', 'Coverage and quality of testing', 100, 0.10, 3),
  ('FINAL', 'Thesis Content', 'Quality, completeness, and accuracy of the thesis document', 100, 0.20, 4),
  ('FINAL', 'Presentation', 'Clarity and quality of presentation and demo', 100, 0.15, 5),
  ('FINAL', 'Q&A Response', 'Quality of responses to committee questions', 100, 0.20, 6);

-- =========================================================================
-- 6. Evaluation Scores
-- =========================================================================

create table public.evaluation_scores (
  id uuid primary key default gen_random_uuid(),
  exam_id uuid not null references public.exams (id) on delete cascade,
  criteria_id uuid not null references public.evaluation_criteria (id) on delete cascade,
  committee_member_id uuid not null references public.exam_committees (id) on delete cascade,
  score numeric(5,2) not null,
  comment text not null default '',
  scored_at timestamptz not null default now(),
  constraint scores_unique unique (exam_id, criteria_id, committee_member_id),
  constraint scores_non_negative check (score >= 0)
);

comment on table public.evaluation_scores is
  'Individual scores given by committee members per criterion per exam. The Go API validates that scores do not exceed max_score.';

create index scores_exam_idx on public.evaluation_scores (exam_id);

-- =========================================================================
-- 7. Exam Comments
-- =========================================================================

create table public.exam_comments (
  id uuid primary key default gen_random_uuid(),
  exam_id uuid not null references public.exams (id) on delete cascade,
  committee_member_id uuid not null references public.exam_committees (id) on delete cascade,
  comment_type text not null default 'GENERAL',
  content text not null,
  created_at timestamptz not null default now(),
  constraint comments_type_valid check (comment_type in (
    'GENERAL', 'STRENGTH', 'WEAKNESS', 'SUGGESTION', 'REVISION_REQUIRED'
  )),
  constraint comments_content_not_blank check (btrim(content) <> '')
);

comment on table public.exam_comments is
  'Qualitative feedback from committee members on an examination.';

create index exam_comments_exam_idx on public.exam_comments (exam_id);

-- =========================================================================
-- 8. Row Level Security
-- =========================================================================

alter table public.exam_types enable row level security;
alter table public.exam_rooms enable row level security;
alter table public.exams enable row level security;
alter table public.exam_committees enable row level security;
alter table public.evaluation_criteria enable row level security;
alter table public.evaluation_scores enable row level security;
alter table public.exam_comments enable row level security;

grant select on public.exam_types to authenticated;
grant select on public.exam_rooms to authenticated;
grant select on public.exams to authenticated;
grant select on public.exam_committees to authenticated;
grant select on public.evaluation_criteria to authenticated;
grant select on public.evaluation_scores to authenticated;
grant select on public.exam_comments to authenticated;

-- Exam types and criteria: readable by all authenticated users
create policy exam_types_select_authenticated
on public.exam_types for select to authenticated using (true);

create policy exam_rooms_select_authenticated
on public.exam_rooms for select to authenticated using (true);

create policy evaluation_criteria_select_authenticated
on public.evaluation_criteria for select to authenticated using (true);

-- Exams: visible to thesis members, advisors, assigned committee, and admin/staff
create policy exams_select_related
on public.exams for select to authenticated
using (
  exists (
    select 1 from public.thesis_members tm
    join public.students s on s.id = tm.student_id
    where tm.thesis_id = exams.thesis_id and s.profile_id = (select auth.uid())
  )
  or exists (
    select 1 from public.thesis_advisors ta
    join public.teachers t on t.id = ta.teacher_id
    where ta.thesis_id = exams.thesis_id and t.profile_id = (select auth.uid())
  )
  or exists (
    select 1 from public.exam_committees ec
    join public.teachers t on t.id = ec.teacher_id
    where ec.exam_id = exams.id and t.profile_id = (select auth.uid())
  )
  or exists (
    select 1 from public.user_roles ur
    where ur.profile_id = (select auth.uid()) and ur.role_code in ('ADMIN', 'STAFF')
  )
);

-- Exam committees: same visibility as the parent exam
create policy exam_committees_select_related
on public.exam_committees for select to authenticated
using (
  exists (
    select 1 from public.exams e where e.id = exam_committees.exam_id
    and (
      exists (
        select 1 from public.thesis_members tm
        join public.students s on s.id = tm.student_id
        where tm.thesis_id = e.thesis_id and s.profile_id = (select auth.uid())
      )
      or exists (
        select 1 from public.thesis_advisors ta
        join public.teachers t on t.id = ta.teacher_id
        where ta.thesis_id = e.thesis_id and t.profile_id = (select auth.uid())
      )
      or exists (
        select 1 from public.exam_committees ec2
        join public.teachers t on t.id = ec2.teacher_id
        where ec2.exam_id = e.id and t.profile_id = (select auth.uid())
      )
      or exists (
        select 1 from public.user_roles ur
        where ur.profile_id = (select auth.uid()) and ur.role_code in ('ADMIN', 'STAFF')
      )
    )
  )
);

-- Scores and comments: visible to committee members of the exam and admin/staff
create policy scores_select_related
on public.evaluation_scores for select to authenticated
using (
  exists (
    select 1 from public.exam_committees ec
    join public.teachers t on t.id = ec.teacher_id
    where ec.exam_id = evaluation_scores.exam_id and t.profile_id = (select auth.uid())
  )
  or exists (
    select 1 from public.user_roles ur
    where ur.profile_id = (select auth.uid()) and ur.role_code in ('ADMIN', 'STAFF')
  )
);

create policy comments_select_related
on public.exam_comments for select to authenticated
using (
  exists (
    select 1 from public.exam_committees ec
    join public.teachers t on t.id = ec.teacher_id
    where ec.exam_id = exam_comments.exam_id and t.profile_id = (select auth.uid())
  )
  or exists (
    select 1 from public.user_roles ur
    where ur.profile_id = (select auth.uid()) and ur.role_code in ('ADMIN', 'STAFF')
  )
);

commit;

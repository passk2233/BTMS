-- Thesis core domain tables.
--
-- Introduces students, teachers, theses, group membership, advisor assignments,
-- thesis files, and thesis revisions. All workflow transitions (submit, review,
-- approve, revision) are performed exclusively by the Go API so that audit_logs
-- entries are always written in the same database transaction.
--
-- Depends on: 20260928000000_bootstrap_identity_and_storage.sql

begin;

-- =========================================================================
-- 1. Students & Teachers
-- =========================================================================

create table public.students (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null unique references public.profiles (id) on delete cascade,
  student_code text not null unique,
  department text not null default '',
  faculty text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint students_code_not_blank check (btrim(student_code) <> '')
);

comment on table public.students is
  'Extended student information linked to a profile. One profile maps to at most one student record.';

create trigger students_set_updated_at
before update on public.students
for each row execute function private.set_updated_at();

create table public.teachers (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null unique references public.profiles (id) on delete cascade,
  academic_title text not null default '',
  department text not null default '',
  faculty text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.teachers is
  'Extended teacher information. Teachers may serve as advisors and/or committee members.';

create trigger teachers_set_updated_at
before update on public.teachers
for each row execute function private.set_updated_at();

-- =========================================================================
-- 2. Theses
-- =========================================================================

-- Status state machine (enforced by CHECK constraint):
--   DRAFT → PROPOSED → TOPIC_APPROVED → IN_PROGRESS → PROPOSAL_EXAM_SCHEDULED
--   → PROPOSAL_PASSED → DEVELOPMENT → FINAL_SUBMITTED → FINAL_EXAM_SCHEDULED
--   → FINAL_PASSED → REVISION_REQUIRED → COMPLETED → CANCELLED
--
-- Transitions are governed by Go service logic, not database triggers.

create table public.theses (
  id uuid primary key default gen_random_uuid(),
  topic_th text not null default '',
  topic_en text not null default '',
  abstract_th text not null default '',
  abstract_en text not null default '',
  status text not null default 'DRAFT',
  academic_year integer,
  semester integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  submitted_at timestamptz,
  approved_at timestamptz,
  completed_at timestamptz,
  constraint theses_status_valid check (status in (
    'DRAFT',
    'PROPOSED',
    'TOPIC_APPROVED',
    'IN_PROGRESS',
    'PROPOSAL_EXAM_SCHEDULED',
    'PROPOSAL_PASSED',
    'DEVELOPMENT',
    'FINAL_SUBMITTED',
    'FINAL_EXAM_SCHEDULED',
    'FINAL_PASSED',
    'REVISION_REQUIRED',
    'COMPLETED',
    'CANCELLED'
  )),
  constraint theses_semester_valid check (semester is null or semester in (1, 2, 3))
);

comment on table public.theses is
  'Central thesis record with a status state machine. All transitions go through the Go API.';

create index theses_status_idx on public.theses (status);
create index theses_academic_year_idx on public.theses (academic_year, semester);

create trigger theses_set_updated_at
before update on public.theses
for each row execute function private.set_updated_at();

-- =========================================================================
-- 3. Thesis Members (Student ↔ Thesis)
-- =========================================================================

create table public.thesis_members (
  id uuid primary key default gen_random_uuid(),
  thesis_id uuid not null references public.theses (id) on delete cascade,
  student_id uuid not null references public.students (id) on delete cascade,
  is_leader boolean not null default false,
  joined_at timestamptz not null default now(),
  constraint thesis_members_unique unique (thesis_id, student_id)
);

comment on table public.thesis_members is
  'Maps students to thesis groups. Each thesis has one leader (is_leader = true).';

create index thesis_members_student_idx on public.thesis_members (student_id);

-- =========================================================================
-- 4. Thesis Advisors (Teacher ↔ Thesis)
-- =========================================================================

create table public.thesis_advisors (
  id uuid primary key default gen_random_uuid(),
  thesis_id uuid not null references public.theses (id) on delete cascade,
  teacher_id uuid not null references public.teachers (id) on delete cascade,
  is_primary boolean not null default false,
  assigned_at timestamptz not null default now(),
  constraint thesis_advisors_unique unique (thesis_id, teacher_id)
);

comment on table public.thesis_advisors is
  'Advisor assignments. Each thesis should have exactly one primary advisor (is_primary = true).';

create index thesis_advisors_teacher_idx on public.thesis_advisors (teacher_id);

-- =========================================================================
-- 5. Thesis Files
-- =========================================================================

create table public.thesis_files (
  id uuid primary key default gen_random_uuid(),
  thesis_id uuid not null references public.theses (id) on delete cascade,
  uploaded_by uuid not null references public.profiles (id) on delete set null,
  file_type text not null default 'OTHER',
  file_name text not null,
  storage_path text not null,
  file_size_bytes bigint,
  mime_type text,
  description text not null default '',
  uploaded_at timestamptz not null default now(),
  constraint thesis_files_type_valid check (file_type in (
    'PROPOSAL', 'FULL_THESIS', 'PRESENTATION', 'SOURCE_CODE', 'APPENDIX', 'OTHER'
  )),
  constraint thesis_files_name_not_blank check (btrim(file_name) <> ''),
  constraint thesis_files_path_not_blank check (btrim(storage_path) <> '')
);

comment on table public.thesis_files is
  'Metadata for files uploaded to the thesis-files storage bucket. The storage_path references the Supabase Storage object.';

create index thesis_files_thesis_idx on public.thesis_files (thesis_id, uploaded_at desc);

-- =========================================================================
-- 6. Thesis Revisions
-- =========================================================================

create table public.thesis_revisions (
  id uuid primary key default gen_random_uuid(),
  thesis_id uuid not null references public.theses (id) on delete cascade,
  version_number integer not null,
  submitted_by uuid not null references public.profiles (id) on delete set null,
  file_name text not null,
  storage_path text not null,
  notes text not null default '',
  status text not null default 'SUBMITTED',
  reviewed_by uuid references public.profiles (id) on delete set null,
  reviewed_at timestamptz,
  review_comments text not null default '',
  submitted_at timestamptz not null default now(),
  constraint thesis_revisions_version_unique unique (thesis_id, version_number),
  constraint thesis_revisions_status_valid check (status in (
    'SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED'
  )),
  constraint thesis_revisions_version_positive check (version_number > 0),
  constraint thesis_revisions_name_not_blank check (btrim(file_name) <> ''),
  constraint thesis_revisions_path_not_blank check (btrim(storage_path) <> '')
);

comment on table public.thesis_revisions is
  'Versioned thesis document submissions (thesis_v1.pdf, thesis_v2.pdf, thesis_final.pdf). Review is performed by the Go API.';

create index thesis_revisions_thesis_idx on public.thesis_revisions (thesis_id, version_number desc);

-- =========================================================================
-- 7. Row Level Security
-- =========================================================================
-- Direct browser access is limited to read-only. All writes go through the
-- Go API using the service-role connection (bypasses RLS).

alter table public.students enable row level security;
alter table public.teachers enable row level security;
alter table public.theses enable row level security;
alter table public.thesis_members enable row level security;
alter table public.thesis_advisors enable row level security;
alter table public.thesis_files enable row level security;
alter table public.thesis_revisions enable row level security;

grant select on public.students to authenticated;
grant select on public.teachers to authenticated;
grant select on public.theses to authenticated;
grant select on public.thesis_members to authenticated;
grant select on public.thesis_advisors to authenticated;
grant select on public.thesis_files to authenticated;
grant select on public.thesis_revisions to authenticated;

-- Students: own record readable
create policy students_select_own
on public.students for select to authenticated
using ((select auth.uid()) = profile_id);

-- Teachers: all authenticated users can see teacher records (for advisor selection)
create policy teachers_select_authenticated
on public.teachers for select to authenticated
using (true);

-- Theses: members and advisors can see their theses; staff/admin can see all
-- (staff/admin check is done via role lookup)
create policy theses_select_member_or_advisor
on public.theses for select to authenticated
using (
  exists (
    select 1 from public.thesis_members tm
    join public.students s on s.id = tm.student_id
    where tm.thesis_id = theses.id and s.profile_id = (select auth.uid())
  )
  or exists (
    select 1 from public.thesis_advisors ta
    join public.teachers t on t.id = ta.teacher_id
    where ta.thesis_id = theses.id and t.profile_id = (select auth.uid())
  )
  or exists (
    select 1 from public.user_roles ur
    where ur.profile_id = (select auth.uid()) and ur.role_code in ('ADMIN', 'STAFF')
  )
);

-- Thesis members: same visibility as theses
create policy thesis_members_select_related
on public.thesis_members for select to authenticated
using (
  exists (
    select 1 from public.thesis_members tm2
    join public.students s on s.id = tm2.student_id
    where tm2.thesis_id = thesis_members.thesis_id and s.profile_id = (select auth.uid())
  )
  or exists (
    select 1 from public.thesis_advisors ta
    join public.teachers t on t.id = ta.teacher_id
    where ta.thesis_id = thesis_members.thesis_id and t.profile_id = (select auth.uid())
  )
  or exists (
    select 1 from public.user_roles ur
    where ur.profile_id = (select auth.uid()) and ur.role_code in ('ADMIN', 'STAFF')
  )
);

-- Thesis advisors: same visibility as theses
create policy thesis_advisors_select_related
on public.thesis_advisors for select to authenticated
using (
  exists (
    select 1 from public.thesis_members tm
    join public.students s on s.id = tm.student_id
    where tm.thesis_id = thesis_advisors.thesis_id and s.profile_id = (select auth.uid())
  )
  or exists (
    select 1 from public.thesis_advisors ta2
    join public.teachers t on t.id = ta2.teacher_id
    where ta2.thesis_id = thesis_advisors.thesis_id and t.profile_id = (select auth.uid())
  )
  or exists (
    select 1 from public.user_roles ur
    where ur.profile_id = (select auth.uid()) and ur.role_code in ('ADMIN', 'STAFF')
  )
);

-- Thesis files: same visibility as the parent thesis
create policy thesis_files_select_related
on public.thesis_files for select to authenticated
using (
  exists (
    select 1 from public.thesis_members tm
    join public.students s on s.id = tm.student_id
    where tm.thesis_id = thesis_files.thesis_id and s.profile_id = (select auth.uid())
  )
  or exists (
    select 1 from public.thesis_advisors ta
    join public.teachers t on t.id = ta.teacher_id
    where ta.thesis_id = thesis_files.thesis_id and t.profile_id = (select auth.uid())
  )
  or exists (
    select 1 from public.user_roles ur
    where ur.profile_id = (select auth.uid()) and ur.role_code in ('ADMIN', 'STAFF')
  )
);

-- Thesis revisions: same visibility as the parent thesis
create policy thesis_revisions_select_related
on public.thesis_revisions for select to authenticated
using (
  exists (
    select 1 from public.thesis_members tm
    join public.students s on s.id = tm.student_id
    where tm.thesis_id = thesis_revisions.thesis_id and s.profile_id = (select auth.uid())
  )
  or exists (
    select 1 from public.thesis_advisors ta
    join public.teachers t on t.id = ta.teacher_id
    where ta.thesis_id = thesis_revisions.thesis_id and t.profile_id = (select auth.uid())
  )
  or exists (
    select 1 from public.user_roles ur
    where ur.profile_id = (select auth.uid()) and ur.role_code in ('ADMIN', 'STAFF')
  )
);

commit;

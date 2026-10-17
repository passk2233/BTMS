-- Examination workflow v2: thesis categories, teacher expertise, exam rounds,
-- category-bound rooms, retake attempts, and committee-decided results.
--
-- Business rules (see implementation-plan.md, Phase 1):
--   * Each thesis has one category: DATABASE / IOT / NETWORK / MEDIA.
--   * Teachers may have expertise in several categories.
--   * Exams are held inside exam rounds. Each academic year opens a variable
--     number of rounds in a PROPOSAL or FINAL period. A round's period does not
--     restrict the exam type (a PROPOSAL exam may sit in a FINAL-period round).
--   * In a round, each room hosts a single category.
--   * Committee = 1 CHAIRMAN + 2 COMMITTEE (max 3 enforced by the Go API).
--   * Pass/fail is the committee's decision (PASS / FAIL), entered by staff.
--     It is NOT derived from scores. Scores are kept for reporting only.
--   * Failed groups retake in a later round, unlimited (attempt_no 1, 2, 3...).
--
-- Depends on: 20261001100000_examinations.sql

begin;

-- =========================================================================
-- 1. HEAD role (Head of Department approves schedules and payouts)
-- =========================================================================

insert into public.roles (code, name, description) values
  ('HEAD', 'Head of Department', 'Same capabilities as STAFF; signs schedules and approves payouts')
on conflict (code) do update set
  name = excluded.name,
  description = excluded.description;

-- =========================================================================
-- 2. Thesis categories (seeded)
-- =========================================================================

create table public.thesis_categories (
  code text primary key,
  name text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  constraint thesis_categories_code_format check (code = upper(code) and code ~ '^[A-Z][A-Z_]*$'),
  constraint thesis_categories_name_not_blank check (btrim(name) <> '')
);

comment on table public.thesis_categories is
  'Thesis topic categories. Drives committee expertise matching and room allocation.';

insert into public.thesis_categories (code, name, sort_order) values
  ('DATABASE', 'Database', 1),
  ('IOT', 'IoT', 2),
  ('NETWORK', 'Network', 3),
  ('MEDIA', 'Media', 4)
on conflict (code) do update set
  name = excluded.name,
  sort_order = excluded.sort_order;

alter table public.theses
  add column category_code text references public.thesis_categories (code);

create index theses_category_idx on public.theses (category_code);

-- =========================================================================
-- 3. Teacher expertise (teacher <-> category, many-to-many)
-- =========================================================================

create table public.teacher_expertise (
  teacher_id uuid not null references public.teachers (id) on delete cascade,
  category_code text not null references public.thesis_categories (code),
  created_at timestamptz not null default now(),
  primary key (teacher_id, category_code)
);

comment on table public.teacher_expertise is
  'Categories a teacher is qualified to examine. Used to pick committee members.';

create index teacher_expertise_category_idx on public.teacher_expertise (category_code, teacher_id);

-- =========================================================================
-- 4. Exam rounds
-- =========================================================================

create table public.exam_rounds (
  id uuid primary key default gen_random_uuid(),
  academic_year integer not null,
  period text not null,
  round_no integer not null,
  name text not null default '',
  start_date date,
  end_date date,
  status text not null default 'OPEN',
  closed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint exam_rounds_period_valid check (period in ('PROPOSAL', 'FINAL')),
  constraint exam_rounds_round_no_positive check (round_no > 0),
  constraint exam_rounds_status_valid check (status in ('OPEN', 'CLOSED')),
  constraint exam_rounds_date_order check (start_date is null or end_date is null or start_date <= end_date),
  constraint exam_rounds_unique unique (academic_year, period, round_no)
);

comment on table public.exam_rounds is
  'Examination rounds per academic year, in a PROPOSAL or FINAL period. The number of rounds varies per year.';
comment on column public.exam_rounds.period is
  'Period of the round. Fees of exams held in this round are attributed to this period for staff wage calculation.';

create index exam_rounds_year_idx on public.exam_rounds (academic_year, period, round_no);

create trigger exam_rounds_set_updated_at
before update on public.exam_rounds
for each row execute function private.set_updated_at();

-- =========================================================================
-- 5. Room <-> category binding per round
-- =========================================================================

create table public.exam_round_rooms (
  round_id uuid not null references public.exam_rounds (id) on delete cascade,
  room_id uuid not null references public.exam_rooms (id) on delete cascade,
  category_code text not null references public.thesis_categories (code),
  primary key (round_id, room_id)
);

comment on table public.exam_round_rooms is
  'Within a round, each room hosts exactly one thesis category.';

create index exam_round_rooms_category_idx on public.exam_round_rooms (round_id, category_code);

-- =========================================================================
-- 6. Exams: round, attempt number, PASS/FAIL only
-- =========================================================================

alter table public.exams
  add column round_id uuid references public.exam_rounds (id) on delete set null,
  add column attempt_no integer not null default 1,
  add column decided_by uuid references auth.users (id) on delete set null,
  add column decided_at timestamptz;

-- Backfill attempt numbers for any existing exams (ordered by creation).
update public.exams e
set attempt_no = numbered.rn
from (
  select id, row_number() over (partition by thesis_id, exam_type_code order by created_at, id) as rn
  from public.exams
) numbered
where numbered.id = e.id;

alter table public.exams
  add constraint exams_attempt_no_positive check (attempt_no > 0),
  add constraint exams_attempt_unique unique (thesis_id, exam_type_code, attempt_no);

-- The score paper only has PASS / FAIL. Existing conditional passes are passes.
update public.exams set result = 'PASS' where result = 'PASS_WITH_REVISION';

alter table public.exams drop constraint exams_result_valid;
alter table public.exams
  add constraint exams_result_valid check (result is null or result in ('PASS', 'FAIL'));

comment on column public.exams.result is
  'Committee decision entered by staff: PASS or FAIL. Independent of evaluation_scores.';
comment on column public.exams.attempt_no is
  '1 = first sitting; >= 2 = retake (retake fee and committee retake bonus apply).';

create index exams_round_idx on public.exams (round_id);

-- =========================================================================
-- 7. Committee: CHAIRMAN x1 + COMMITTEE x2 (no SECRETARY)
-- =========================================================================

update public.exam_committees set role = 'COMMITTEE' where role = 'SECRETARY';

alter table public.exam_committees drop constraint exam_committees_role_valid;
alter table public.exam_committees
  add constraint exam_committees_role_valid check (role in ('CHAIRMAN', 'COMMITTEE'));

create unique index exam_committees_one_chairman_idx
  on public.exam_committees (exam_id)
  where role = 'CHAIRMAN';

-- =========================================================================
-- 8. Row Level Security (read-only reference data for the browser)
-- =========================================================================

alter table public.thesis_categories enable row level security;
alter table public.teacher_expertise enable row level security;
alter table public.exam_rounds enable row level security;
alter table public.exam_round_rooms enable row level security;

grant select on public.thesis_categories to authenticated;
grant select on public.teacher_expertise to authenticated;
grant select on public.exam_rounds to authenticated;
grant select on public.exam_round_rooms to authenticated;

create policy thesis_categories_select_authenticated
on public.thesis_categories for select to authenticated using (true);

create policy teacher_expertise_select_authenticated
on public.teacher_expertise for select to authenticated using (true);

create policy exam_rounds_select_authenticated
on public.exam_rounds for select to authenticated using (true);

create policy exam_round_rooms_select_authenticated
on public.exam_round_rooms for select to authenticated using (true);

commit;

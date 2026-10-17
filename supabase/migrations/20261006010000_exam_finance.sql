-- Exam finance: exam fees (normal / retake), committee rates, round snack
-- budgets, staff wage periods, and payouts.
--
-- Business rules (see implementation-plan.md, Step 8 and Phases 12-13):
--   * Normal sitting (attempt 1) pays the normal exam fee.
--     Retake (attempt >= 2) pays ONLY the retake fee, same amount every retake.
--   * Committee fee: per group, by role (CHAIRMAN / COMMITTEE), paid per round.
--     Retake exams add a fixed per-group RETAKE_BONUS by role (same for every retake).
--   * Snack: one lump sum per exam round.
--   * Staff wage: twice per academic year (PROPOSAL period, FINAL period).
--       base = (normal + retake fees of exams held in rounds of that period)
--              - (committee fees + retake bonuses of those rounds)
--              - (snack budgets of those rounds)
--       each responsible person = base x their percent (percents differ,
--       recipients are chosen per period, total percent <= 100).
--   * A fee is attributed to the period of the round the exam is held in.
--
-- All writes and calculations are performed by the Go API inside a single
-- transaction together with an audit_logs entry. No browser access.
--
-- Depends on: 20261006000000_exam_rounds_and_categories.sql

begin;

-- =========================================================================
-- 1. Fee types and rates
-- =========================================================================

create table public.fee_types (
  code text primary key,
  name text not null,
  created_at timestamptz not null default now(),
  constraint fee_types_code_format check (code = upper(code) and code ~ '^[A-Z][A-Z_]*$'),
  constraint fee_types_name_not_blank check (btrim(name) <> '')
);

insert into public.fee_types (code, name) values
  ('PROPOSAL_EXAM', 'Proposal Exam Fee'),
  ('PROPOSAL_RETAKE', 'Proposal Retake Fee'),
  ('FINAL_EXAM', 'Final Exam Fee'),
  ('FINAL_RETAKE', 'Final Retake Fee'),
  ('PRINTING', 'Printing'),
  ('BINDING', 'Binding'),
  ('OTHER', 'Other')
on conflict (code) do update set name = excluded.name;

create table public.fee_rates (
  id uuid primary key default gen_random_uuid(),
  fee_type_code text not null references public.fee_types (code),
  amount numeric(14,2) not null,
  currency text not null default 'LAK',
  effective_from date not null default current_date,
  created_at timestamptz not null default now(),
  constraint fee_rates_amount_non_negative check (amount >= 0),
  constraint fee_rates_unique unique (fee_type_code, effective_from)
);

comment on table public.fee_rates is
  'Fee amount per fee type over time. The rate in effect on the payment date is copied into exam_fee_payments.amount.';

-- =========================================================================
-- 2. Exam fee payments (one per thesis + exam type + attempt)
-- =========================================================================

create table public.exam_fee_payments (
  id uuid primary key default gen_random_uuid(),
  thesis_id uuid not null references public.theses (id) on delete restrict,
  exam_type_code text not null references public.exam_types (code),
  attempt_no integer not null,
  fee_type_code text not null references public.fee_types (code),
  exam_id uuid unique references public.exams (id) on delete set null,
  amount numeric(14,2) not null,
  currency text not null default 'LAK',
  status text not null default 'PAID',
  receipt_no text not null default '',
  paid_at timestamptz not null default now(),
  recorded_by uuid references auth.users (id) on delete set null,
  verified_by uuid references auth.users (id) on delete set null,
  verified_at timestamptz,
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint exam_fee_payments_attempt_positive check (attempt_no > 0),
  constraint exam_fee_payments_amount_non_negative check (amount >= 0),
  constraint exam_fee_payments_status_valid check (status in ('PAID', 'VERIFIED', 'REFUNDED')),
  constraint exam_fee_payments_fee_matches_attempt check (
    (attempt_no = 1 and fee_type_code in ('PROPOSAL_EXAM', 'FINAL_EXAM'))
    or (attempt_no > 1 and fee_type_code in ('PROPOSAL_RETAKE', 'FINAL_RETAKE'))
  ),
  constraint exam_fee_payments_unique unique (thesis_id, exam_type_code, attempt_no)
);

comment on table public.exam_fee_payments is
  'Exam fee recorded at intake (before scheduling). exam_id is linked once the exam is scheduled into a round; the round period decides which staff wage period the fee counts toward.';

create index exam_fee_payments_exam_idx on public.exam_fee_payments (exam_id);

create trigger exam_fee_payments_set_updated_at
before update on public.exam_fee_payments
for each row execute function private.set_updated_at();

-- =========================================================================
-- 3. Committee rates (base fee and retake bonus, per role, per group)
-- =========================================================================

create table public.committee_rates (
  id uuid primary key default gen_random_uuid(),
  exam_type_code text not null references public.exam_types (code),
  role text not null,
  rate_kind text not null,
  amount numeric(14,2) not null,
  currency text not null default 'LAK',
  effective_from date not null default current_date,
  created_at timestamptz not null default now(),
  constraint committee_rates_role_valid check (role in ('CHAIRMAN', 'COMMITTEE')),
  constraint committee_rates_kind_valid check (rate_kind in ('BASE', 'RETAKE_BONUS')),
  constraint committee_rates_amount_non_negative check (amount >= 0),
  constraint committee_rates_unique unique (exam_type_code, role, rate_kind, effective_from)
);

comment on table public.committee_rates is
  'Per-group committee pay by exam type and role. BASE applies to every exam; RETAKE_BONUS is added when attempt_no >= 2.';

-- =========================================================================
-- 4. Round snack budget (one lump sum per round)
-- =========================================================================

create table public.round_snack_budgets (
  round_id uuid primary key references public.exam_rounds (id) on delete restrict,
  amount numeric(14,2) not null,
  currency text not null default 'LAK',
  notes text not null default '',
  set_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint round_snack_budgets_amount_non_negative check (amount >= 0)
);

comment on table public.round_snack_budgets is
  'Lump-sum committee snack budget for an exam round.';

create trigger round_snack_budgets_set_updated_at
before update on public.round_snack_budgets
for each row execute function private.set_updated_at();

-- =========================================================================
-- 5. Staff wage periods and assignments
-- =========================================================================

create table public.staff_wage_periods (
  id uuid primary key default gen_random_uuid(),
  academic_year integer not null,
  period text not null,
  status text not null default 'DRAFT',
  gross_fees numeric(14,2),
  committee_total numeric(14,2),
  snack_total numeric(14,2),
  base_amount numeric(14,2),
  currency text not null default 'LAK',
  calculated_at timestamptz,
  calculated_by uuid references auth.users (id) on delete set null,
  approved_at timestamptz,
  approved_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint staff_wage_periods_period_valid check (period in ('PROPOSAL', 'FINAL')),
  constraint staff_wage_periods_status_valid check (status in ('DRAFT', 'CALCULATED', 'APPROVED', 'PAID')),
  constraint staff_wage_periods_unique unique (academic_year, period)
);

comment on table public.staff_wage_periods is
  'Staff wage calculation, twice per academic year. base_amount = gross_fees - committee_total - snack_total (snapshotted at calculation time).';

create trigger staff_wage_periods_set_updated_at
before update on public.staff_wage_periods
for each row execute function private.set_updated_at();

create table public.staff_wage_assignments (
  id uuid primary key default gen_random_uuid(),
  wage_period_id uuid not null references public.staff_wage_periods (id) on delete cascade,
  profile_id uuid references public.profiles (id) on delete set null,
  payee_name text not null,
  duty text not null default '',
  percent numeric(5,2) not null,
  created_at timestamptz not null default now(),
  constraint staff_wage_assignments_percent_range check (percent > 0 and percent <= 100),
  constraint staff_wage_assignments_name_not_blank check (btrim(payee_name) <> '')
);

comment on table public.staff_wage_assignments is
  'Responsible persons for a wage period and their individual percent of the base. Total percent per period must be <= 100 (validated by the Go API).';

create index staff_wage_assignments_period_idx on public.staff_wage_assignments (wage_period_id);

-- =========================================================================
-- 6. Payouts (every money-out line item, with snapshotted rates)
-- =========================================================================

create table public.payouts (
  id uuid primary key default gen_random_uuid(),
  payout_type text not null,
  round_id uuid references public.exam_rounds (id) on delete restrict,
  exam_id uuid references public.exams (id) on delete restrict,
  exam_committee_id uuid references public.exam_committees (id) on delete restrict,
  teacher_id uuid references public.teachers (id) on delete restrict,
  wage_period_id uuid references public.staff_wage_periods (id) on delete restrict,
  wage_assignment_id uuid references public.staff_wage_assignments (id) on delete restrict,
  payee_name text not null,
  rate_amount numeric(14,2),
  percent numeric(5,2),
  base_amount numeric(14,2),
  amount numeric(14,2) not null,
  currency text not null default 'LAK',
  status text not null default 'PENDING',
  created_by uuid references auth.users (id) on delete set null,
  approved_by uuid references auth.users (id) on delete set null,
  approved_at timestamptz,
  paid_at timestamptz,
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint payouts_type_valid check (payout_type in (
    'COMMITTEE_FEE', 'COMMITTEE_RETAKE_BONUS', 'ROUND_SNACK', 'STAFF_WAGE'
  )),
  constraint payouts_status_valid check (status in ('PENDING', 'APPROVED', 'PAID', 'CANCELLED')),
  constraint payouts_amount_non_negative check (amount >= 0),
  constraint payouts_refs_match_type check (
    (payout_type in ('COMMITTEE_FEE', 'COMMITTEE_RETAKE_BONUS')
       and round_id is not null and exam_id is not null and exam_committee_id is not null and teacher_id is not null)
    or (payout_type = 'ROUND_SNACK' and round_id is not null)
    or (payout_type = 'STAFF_WAGE' and wage_period_id is not null and wage_assignment_id is not null)
  )
);

comment on table public.payouts is
  'All disbursement line items. rate_amount / percent / base_amount are snapshots so later rate changes never alter past payouts.';

-- Prevent double payment (cancelled rows may be recreated).
create unique index payouts_committee_once_idx
  on public.payouts (exam_committee_id, payout_type)
  where payout_type in ('COMMITTEE_FEE', 'COMMITTEE_RETAKE_BONUS') and status <> 'CANCELLED';

create unique index payouts_snack_once_idx
  on public.payouts (round_id)
  where payout_type = 'ROUND_SNACK' and status <> 'CANCELLED';

create unique index payouts_wage_once_idx
  on public.payouts (wage_assignment_id)
  where payout_type = 'STAFF_WAGE' and status <> 'CANCELLED';

create index payouts_round_idx on public.payouts (round_id, payout_type);
create index payouts_wage_period_idx on public.payouts (wage_period_id);
create index payouts_status_idx on public.payouts (status);

create trigger payouts_set_updated_at
before update on public.payouts
for each row execute function private.set_updated_at();

-- =========================================================================
-- 7. Row Level Security: Go API only (no browser grants or policies)
-- =========================================================================

alter table public.fee_types enable row level security;
alter table public.fee_rates enable row level security;
alter table public.exam_fee_payments enable row level security;
alter table public.committee_rates enable row level security;
alter table public.round_snack_budgets enable row level security;
alter table public.staff_wage_periods enable row level security;
alter table public.staff_wage_assignments enable row level security;
alter table public.payouts enable row level security;

commit;

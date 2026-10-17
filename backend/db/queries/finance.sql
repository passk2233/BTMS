-- name: GetActiveFeeRate :one
select id, fee_type_code, amount, currency, effective_from, created_at
from public.fee_rates
where fee_type_code = $1 and effective_from <= current_date
order by effective_from desc
limit 1;

-- name: ListActiveFeeRates :many
select distinct on (fee_type_code)
  id, fee_type_code, amount, currency, effective_from, created_at
from public.fee_rates
where effective_from <= current_date
order by fee_type_code, effective_from desc;

-- name: CreateExamFeePayment :one
insert into public.exam_fee_payments (
  thesis_id,
  exam_type_code,
  attempt_no,
  fee_type_code,
  exam_id,
  amount,
  currency,
  status,
  receipt_no,
  recorded_by,
  notes
) values (
  $1, $2, $3, $4, $5, $6, coalesce(nullif($7, ''), 'LAK'),
  coalesce(nullif($8, ''), 'PAID'), coalesce($9, ''), $10, coalesce($11, '')
) returning *;

-- name: LinkExamFeePaymentToExam :one
update public.exam_fee_payments
set exam_id = $2
where id = $1
returning *;

-- name: GetExamFeePaymentByThesisAndAttempt :one
select *
from public.exam_fee_payments
where thesis_id = $1 and exam_type_code = $2 and attempt_no = $3;

-- name: ListExamFeePaymentsByThesis :many
select *
from public.exam_fee_payments
where thesis_id = $1
order by attempt_no asc, paid_at desc;

-- name: ListFeePaymentsForPeriod :many
select
  p.id,
  p.thesis_id,
  p.exam_type_code,
  p.attempt_no,
  p.fee_type_code,
  p.exam_id,
  p.amount,
  p.currency,
  p.status,
  p.paid_at,
  r.id as round_id,
  r.academic_year,
  r.period as round_period,
  r.round_number
from public.exam_fee_payments p
inner join public.exams e on p.exam_id = e.id
inner join public.exam_rounds r on e.round_id = r.id
where r.academic_year = $1
  and r.period = $2
  and p.status in ('PAID', 'VERIFIED');

-- name: VerifyExamFeePayment :one
update public.exam_fee_payments
set status = 'VERIFIED',
    verified_by = $2,
    verified_at = now()
where id = $1
returning *;

-- name: GetActiveCommitteeRate :one
select id, exam_type_code, role, rate_kind, amount, currency, effective_from, created_at
from public.committee_rates
where exam_type_code = $1
  and role = $2
  and rate_kind = $3
  and effective_from <= current_date
order by effective_from desc
limit 1;

-- name: ListActiveCommitteeRates :many
select distinct on (exam_type_code, role, rate_kind)
  id, exam_type_code, role, rate_kind, amount, currency, effective_from, created_at
from public.committee_rates
where effective_from <= current_date
order by exam_type_code, role, rate_kind, effective_from desc;

-- name: GetRoundSnackBudget :one
select *
from public.round_snack_budgets
where round_id = $1;

-- name: UpsertRoundSnackBudget :one
insert into public.round_snack_budgets (
  round_id,
  amount,
  currency,
  notes,
  set_by
) values (
  $1, $2, coalesce(nullif($3, ''), 'LAK'), coalesce($4, ''), $5
)
on conflict (round_id) do update set
  amount = excluded.amount,
  currency = excluded.currency,
  notes = excluded.notes,
  set_by = excluded.set_by,
  updated_at = now()
returning *;

-- name: ListRoundSnackBudgetsByPeriod :many
select b.*
from public.round_snack_budgets b
inner join public.exam_rounds r on b.round_id = r.id
where r.academic_year = $1 and r.period = $2;

-- name: GetStaffWagePeriodByYearAndPeriod :one
select *
from public.staff_wage_periods
where academic_year = $1 and period = $2;

-- name: GetStaffWagePeriod :one
select *
from public.staff_wage_periods
where id = $1;

-- name: CreateStaffWagePeriod :one
insert into public.staff_wage_periods (
  academic_year,
  period,
  currency
) values (
  $1, $2, coalesce(nullif($3, ''), 'LAK')
) returning *;

-- name: UpdateStaffWagePeriodCalculation :one
update public.staff_wage_periods
set gross_fees = $2,
    committee_total = $3,
    snack_total = $4,
    base_amount = $5,
    status = 'CALCULATED',
    calculated_at = now(),
    calculated_by = $6
where id = $1
returning *;

-- name: ApproveStaffWagePeriod :one
update public.staff_wage_periods
set status = 'APPROVED',
    approved_at = now(),
    approved_by = $2
where id = $1
returning *;

-- name: ListStaffWageAssignments :many
select *
from public.staff_wage_assignments
where wage_period_id = $1
order by created_at asc;

-- name: CreateStaffWageAssignment :one
insert into public.staff_wage_assignments (
  wage_period_id,
  profile_id,
  payee_name,
  duty,
  percent
) values (
  $1, $2, $3, coalesce($4, ''), $5
) returning *;

-- name: DeleteStaffWageAssignments :exec
delete from public.staff_wage_assignments
where wage_period_id = $1;

-- name: CreatePayout :one
insert into public.payouts (
  payout_type,
  round_id,
  exam_id,
  exam_committee_id,
  teacher_id,
  wage_period_id,
  wage_assignment_id,
  payee_name,
  rate_amount,
  percent,
  base_amount,
  amount,
  currency,
  status,
  created_by,
  notes
) values (
  $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12,
  coalesce(nullif($13, ''), 'LAK'), coalesce(nullif($14, ''), 'PENDING'), $15, coalesce($16, '')
) returning *;

-- name: ListPayoutsByRound :many
select *
from public.payouts
where round_id = $1
order by created_at asc;

-- name: ListPayoutsByWagePeriod :many
select *
from public.payouts
where wage_period_id = $1
order by created_at asc;

-- name: UpdatePayoutStatus :one
update public.payouts
set status = $2,
    approved_by = coalesce($3, approved_by),
    approved_at = case when $2 = 'APPROVED' then coalesce(approved_at, now()) else approved_at end,
    paid_at = case when $2 = 'PAID' then coalesce(paid_at, now()) else paid_at end
where id = $1
returning *;

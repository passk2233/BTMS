# BTMS migration index

Applied migrations and planned future migrations for the BTMS database.

Do **not** add blank `.sql` placeholders for planned entries. Supabase records
every SQL migration as applied, so a blank file becomes permanent history and
cannot later be filled in safely. Create a new timestamped migration only when
its schema and RLS design are reviewed.

| Migration | Scope | Status |
| --- | --- | --- |
| `20260928000000_bootstrap_identity_and_storage.sql` | `profiles`, `roles`, `user_roles`, `audit_logs`, storage buckets, RLS | ✅ Applied |
| `20261001000000_thesis_core.sql` | `students`, `teachers`, `theses`, `thesis_members`, `thesis_advisors`, `thesis_files`, `thesis_revisions`, RLS | ✅ Applied |
| `20261001100000_examinations.sql` | `exam_types`, `exams`, `exam_rooms`, `exam_committees`, `evaluation_criteria`, `evaluation_scores`, `exam_comments`, RLS | ✅ Applied |
| `20261006000000_exam_rounds_and_categories.sql` | `thesis_categories` (with global caps), `teachers` (affiliation, quota), `teacher_expertise` (primary/secondary eligibility), `exam_rounds`, `exam_round_rooms`, `exams` (round_id, attempt_no, decided_by, PASS/FAIL), `academic_stages` (18-stage timeline), RLS | ✅ Applied |
| `20261006010000_exam_finance.sql` | `fee_types`, `fee_rates`, `exam_fee_payments`, `committee_rates`, `round_snack_budgets`, `staff_wage_periods`, `staff_wage_assignments`, `payouts`, RLS | ✅ Applied |
| `<timestamp>_progress.sql` | stages and thesis progress / development tracking | ⚪ Planned |
| `<timestamp>_printing.sql` | rates, orders, items, deliveries | ⚪ Planned |
| `<timestamp>_notifications.sql` | notifications and Realtime publication settings | ⚪ Planned |

For each new direct-client table, include in the same migration:

1. foreign keys and indexes;
2. `ALTER TABLE ... ENABLE ROW LEVEL SECURITY`;
3. explicit policies for every permitted browser operation; and
4. a policy test for each role and an unauthenticated denial case.

Keep workflow writes, calculations, approval decisions, and all financial
changes behind the Go API. Each material status change must insert an
`audit_logs` record in the same database transaction.

# BTMS migration index

The only executable migration currently committed is
`20260928000000_bootstrap_identity_and_storage.sql`. It establishes the
cross-cutting identity, audit, and private-storage foundation without guessing
the domain ERD.

Do **not** add blank `.sql` placeholders for the entries below. Supabase records
every SQL migration as applied, so a blank file becomes permanent history and
cannot later be filled in safely. Create a new timestamped migration only when
its schema and RLS design are reviewed.

| Planned migration | Scope | Required decisions before creating it |
| --- | --- | --- |
| `<timestamp>_thesis_core.sql` | `students`, `teachers`, `theses`, members, advisors, thesis files, revisions | Group ownership, advisor assignment rules, thesis visibility, file-object association |
| `<timestamp>_progress.sql` | stages and thesis progress / development tracking | State-machine transitions, progress calculation authority, Realtime publication and read policies |
| `<timestamp>_examinations.sql` | exam types, exams, rooms, committees, criteria, scores, results, comments | Proposal/final distinctions, committee assignment, score calculation and result finalization |
| `<timestamp>_finance.sql` | fee/rate schedules, payments, receipts, committee payments, disbursements, transactions | Currency and rounding rule, rate snapshots, transaction boundaries, finance-only access |
| `<timestamp>_printing.sql` | rates, orders, items, deliveries | Cost calculation authority, evidence links, printing-staff access |
| `<timestamp>_notifications.sql` | notifications and Realtime publication settings | Recipient model, retention, direct-read policy |

For each new direct-client table, include in the same migration:

1. foreign keys and indexes;
2. `ALTER TABLE ... ENABLE ROW LEVEL SECURITY`;
3. explicit policies for every permitted browser operation; and
4. a policy test for each role and an unauthenticated denial case.

Keep workflow writes, calculations, approval decisions, and all financial
changes behind the Go API. Each material status change must insert an
`audit_logs` record in the same database transaction.

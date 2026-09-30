# Supabase workspace

This directory is the versioned database source of truth for BTMS. It contains
only migrations, repeatable seed data, and local Supabase CLI configuration.
Generated TypeScript types and sqlc output belong in the application folders and
must be regenerated from this schema rather than edited by hand.

## Local workflow

Install the Supabase CLI, start the local stack, and reset it whenever a clean
database is useful:

```powershell
npx supabase start
npx supabase db reset --local
npx supabase db lint --local
```

`config.toml` intentionally uses PostgreSQL 15 because it is the current local
default for this scaffold. Before linking a remote project, check its server
version and update `db.major_version` to match. The configuration contains no
secrets; keep project references, database passwords, and service keys out of
this directory.

For a remote development project, link it deliberately and inspect migration
history before pushing:

```powershell
npx supabase link --project-ref <project-ref>
npx supabase migration list --linked
npx supabase db push
```

Never run a reset against a shared remote database. Use an isolated development
or preview project for migration verification.

## What exists now

`20260928000000_bootstrap_identity_and_storage.sql` provides:

- `roles`, `profiles`, and many-to-many `user_roles` assignments for the seven
  roles in the implementation plan;
- a secure Auth trigger that creates a profile without granting a role;
- `audit_logs` as the shared audit-trail target;
- private storage buckets for thesis, exam, payment-proof, and financial files;
- RLS plus narrowly scoped direct-client read/upload policies; and
- `pgcrypto` for later UUID-based migrations.

The thesis, examination, progress, finance, and printing tables are not
invented yet. Their proposed migration boundaries are in
[`migrations/MIGRATION_INDEX.md`](migrations/MIGRATION_INDEX.md).

## Data-access and RLS contract

| Base table / service | Browser access in this scaffold | RLS / policy |
| --- | --- | --- |
| `public.profiles` | Read the signed-in user's profile | RLS enabled; `SELECT` only when `auth.uid() = id` |
| `public.roles` | Read role labels after authentication | RLS enabled; authenticated `SELECT` only |
| `public.user_roles` | Read the signed-in user's role assignments | RLS enabled; `SELECT` only when `auth.uid() = profile_id` |
| `public.audit_logs` | None | RLS enabled; no browser grant or policy |
| `storage.objects` in BTMS buckets | Upload and read files in the caller's UUID prefix | Storage RLS enabled; `INSERT` and `SELECT` only for `<auth.uid()>/...` paths |

There are no browser write policies for profiles, roles, role assignments, or
audit logs. The Go API owns account provisioning, role changes, workflow state
transitions, calculations, and all financial writes. Never put a database
password or Supabase service-role key in Next.js client code.

The initial storage policies intentionally permit only an object's owner-prefix.
When a domain migration creates `thesis_files`, `exam_documents`, or payment
records, extend the policy in that same migration with relationship-aware reads
for assigned advisors, committee members, finance officers, or printing staff.
Do not make a bucket public as a shortcut.

## Next migration

Create real, timestamped migrations only after the associated ERD and access
rules are approved:

```powershell
npx supabase migration new thesis_core
```

Each direct-client table must enable RLS and include its complete policy set in
the same migration. Add seed data only after its table, constraints, and
business rules exist. For finance, use `NUMERIC`, calculate authoritative
amounts in Go, snapshot any applicable rate, and write the business change plus
its audit entry in one transaction.

After schema changes, regenerate the frontend database types with the root
generation script and regenerate sqlc code from the backend query sources.

# BTMS

Bachelor's Thesis Examination & Financial Management System.

## Repository layout

```text
.
├── frontend/       Next.js App Router web application
├── backend/        Go + Gin API for all business workflows
├── supabase/       PostgreSQL migrations, seeds, and Supabase configuration
├── scripts/        Repeatable generation and verification utilities
└── .github/        Continuous-integration workflow
```

The database schema is the system's single source of truth. Migrations and SQL query inputs are versioned; generated TypeScript database types and sqlc Go code are regenerated, never hand-edited.

## Architecture boundary

Next.js talks directly to Supabase only for cookie-based authentication/session handling, permitted profile and general thesis reads, Storage uploads, and Realtime subscriptions. Every workflow, state transition, calculation, financial operation, and multi-table write goes through the Go API with a Supabase-issued bearer token.

Financial amounts are `NUMERIC` in PostgreSQL. The API derives amounts from authoritative records rather than accepting client-calculated totals, and financial writes must run in one transaction with an audit-log entry.

## Prerequisites

- Node.js 22+ and npm
- Go 1.26+
- Docker Desktop (optional for containerized web/API development)
- A Supabase project and CLI for applying migrations and generating database types
- `sqlc` for generating the Go query layer

## First run

1. Copy `frontend/.env.example` to `frontend/.env.local` and `backend/.env.example` to `backend/.env`.
2. Set the Supabase URL, publishable key, API URL, and database connection values. Do not commit either local environment file.
3. Apply `supabase/migrations` to a development Supabase project, then seed it with `supabase/seed.sql`.
4. Generate database types and sqlc code after the schema exists:

   ```powershell
   npm run generate:types -- -ProjectRef <your-project-ref>
   ```

5. Install and run each application:

   ```powershell
   npm install --prefix frontend
   npm run dev

   Set-Location backend
   go mod tidy
   go run ./cmd/server
   ```

The API health endpoint is `GET /healthz`.

## Development sequence

Follow the implementation plan: database → authentication → thesis/groups → proposal → examinations → progress/development → final/revision → finance → committee payments → printing → reports → notifications.

Before implementing production JWT middleware, confirm whether the Supabase project uses asymmetric signing keys (JWKS) or legacy HS256. The scaffold deliberately does not guess this security decision.

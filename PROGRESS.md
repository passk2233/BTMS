# Bachelor's Thesis Examination & Financial Management System (BTMS)
## Development Progress & Roadmap Tracker

> **Last Updated:** 2026-10-14  
> **Authoritative References:** [TIMELINE.md](TIMELINE.md) · [implementation-plan.md](file:///c:/Users/ASUS/OneDrive/เอกสาร/BTMS/implementation-plan.md) · [DESIGN.md](file:///c:/Users/ASUS/OneDrive/เอกสาร/BTMS/DESIGN.md) · [MIGRATION_INDEX.md](file:///c:/Users/ASUS/OneDrive/เอกสาร/BTMS/supabase/migrations/MIGRATION_INDEX.md) · [backend/README.md](file:///c:/Users/ASUS/OneDrive/เอกสาร/BTMS/backend/README.md) · [supabase/README.md](file:///c:/Users/ASUS/OneDrive/เอกสาร/BTMS/supabase/README.md)

> [!IMPORTANT]
> **Scope change (2026-10-14):** BTMS is a tool for **Staff to run the thesis process** and for the **Head to view reports**. Only `STAFF` and `HEAD` log in.
> - **Removed:** student self-service portal, live in-room committee scoring (Staff enters scores after each defense instead), and any timeline/schedule tracking ([TIMELINE.md](TIMELINE.md) is context only).
> - **Kept (Staff-operated):** finance (slips, receipts, honorariums) and printing/binding.
> - **Added:** Head reports (dashboard, Lao PDF, Excel).

---

## 1. Executive Summary

| Item | Status | Detail |
|---|:---:|---|
| **Remote Supabase Project** | 🟢 Connected | Project Ref: `ljpmspnzzsfocdrvnqkj` |
| **Foundation Schema** | 🟢 Live | Bootstrap migration applied (`20260928000000`) |
| **Backend API Scaffold** | 🟢 Complete | Go/Gin server, logging, health checks, route tree |
| **Frontend Scaffold** | 🟢 Complete | Next.js App Router, Supabase SSR helpers, API client |
| **Auth & Authorization** | 🟢 Complete | JWKS JWT middleware, RBAC middleware, user endpoints, frontend auth provider |
| **Operational Model** | 🟢 Updated | **2 Roles:** `STAFF` & `HEAD` (equal capabilities); Staff/Head registers Step 1 |
| **Official Report Printing** | 🟢 Complete | Printable official roster table matching university image (`ກຸ່ມ`, `ຫ້ອງ`, `ຊື່ຫົວຂໍ້`, `ຊື່ອາຈານທີ່ປຶກສາ`, `ໝາຍເຫດ` ສຳລັບນັກສຶກສາຕົກຮຸ່ນ & ຕ່າງຫ້ອງ) |
| **Student & Teacher Management** | 🟢 Complete | Full Student, Adviser Quota & Portfolio, and Committee Exam Panel management with backend APIs & UI |
| **Domain Schema & Workflows** | 🟡 Pending | Domain tables (`theses`, `exams`, `finance`, etc.) |
| **Head Reports** | ⚪ New | Dashboard + Lao PDF + Excel export |

---

## 2. Phase-by-Phase Roadmap Status

| Phase | Description | Weeks | Status | Key Deliverable |
|---|---|:---:|:---:|---|
| **Phase 1** | Requirement & Workflow Specification | 1–2 | ✅ Done | Workflows, roles, and architecture defined in `implementation-plan.md` |
| **Phase 2** | Database Design & ERD | 3–4 | 🟡 In Progress | Foundation migration completed; domain migrations pending |
| **Phase 3** | Supabase Setup & Foundation | 5 | ✅ Done | Auth trigger, roles, profiles, user_roles, audit logs, storage buckets, RLS |
| **Phase 4** | Go Backend Foundation | 6–7 | ✅ Done | Server, config, pool, routes, sqlc models, full build with 0 errors |
| **Phase 5** | Authentication & Authorization | 7 | ✅ Done | JWKS JWT middleware, RBAC middleware, user endpoints, frontend auth/route protection |
| **Phase 6** | Thesis Management | 8–9 | ✅ Done | Thesis schema, Go service/handlers, dual-language workspace UI, split-pane reviewer |
| **Phase 7** | Proposal Examination | 10 | ✅ Done | Examination schema, seeded criteria, Go service/scoring, live rubric UI → *to convert to Staff score entry* |
| **Phase 8** | Progress Tracking | 11 | 🟡 In Progress | 8-stage stepper UI, cohort breakdown, real-time sync UI built |
| **Phase 9** | Development Tracking | 11–12 | 🟡 In Progress | Multi-stage task breakdown UI (Requirements -> Design -> Engineering -> Testing) |
| **Phase 10** | Final Examination | 13 | ⚪ Scheduled | Final thesis submission, demo scoring, committee reviews |
| **Phase 11** | Revision & Completion | 14 | ⚪ Scheduled | Versioned thesis document uploads (`thesis_revisions`), approvals |
| **Phase 12** | Financial Management | 15 | 🟡 In Progress | Split-screen slip verification UI, payment ledger, receipt issuance UI |
| **Phase 13** | Committee Payment | 15–16 | ⚪ Scheduled | Multi-table financial transaction, committee rate calculations, disbursement |
| **Phase 14** | Printing Management | 16 | 🟡 In Progress | 4-column production Kanban board, automated print cost calculator |
| **Phase 15** | Dashboard & Reports | 17 | 🟡 In Progress | Role-aware dashboard, academic & financial analytics tables, PDF/Excel exports |
| **Phase 16** | Notification | 17 | ⚪ Scheduled | In-app alerts, Supabase Realtime event push |
| **Phase 17** | Testing & Hardening | 18–19 | ⚪ Scheduled | Unit, integration, RLS policy tests, financial transaction rollback checks |
| **Phase 18** | Production Deployment | 20 | ⚪ Scheduled | Vercel (Next.js), Docker/VPS (Go API), Supabase Cloud |

---

## 3. Detailed Completed Work (What Has Been Done)

### A. Database & Platform (Supabase)
- [x] **Bootstrap Migration Applied (`20260928000000_bootstrap_identity_and_storage.sql`)**:
  - `public.roles`: 7 core system roles (`ADMIN`, `STAFF`, `STUDENT`, `ADVISOR`, `COMMITTEE`, `FINANCE`, `PRINTING`).
  - `public.profiles`: User profiles referencing `auth.users(id)` with auto-profile creation trigger (`private.create_profile_for_auth_user()`).
  - `public.user_roles`: Many-to-many role mapping.
  - `public.audit_logs`: Immutable audit log table for critical business and financial state transitions.
  - `private.set_updated_at()`: Internal trigger function for automatic timestamp updates.
- [x] **Row Level Security (RLS)**:
  - Enabled on `profiles`, `roles`, `user_roles`, `audit_logs`.
  - Authenticated user can read only their own profile and assigned roles.
  - Client-side writes disallowed on identity and audit tables (writes reserved exclusively for Go API).
- [x] **Storage Buckets**:
  - Created 4 private buckets: `thesis-files`, `exam-documents`, `payment-proofs`, `financial-documents`.
  - Added initial storage RLS policies restricting upload and read to caller's user UUID prefix (`<auth.uid()>/...`).
- [x] **Supabase CLI Linked**: Linked to remote Supabase project (`ljpmspnzzsfocdrvnqkj`).

### B. Backend (Go + Gin)
- [x] **Application Bootstrap** ([backend/cmd/server/main.go](file:///c:/Users/ASUS/OneDrive/เอกสาร/BTMS/backend/cmd/server/main.go)):
  - Graceful shutdown handling OS signals (`SIGINT`, `SIGTERM`).
  - Database connectivity pre-flight verification before opening HTTP port.
  - Full dependency wiring: config → pool → queries → services → handlers → routes.
- [x] **Configuration Layer** ([backend/config/config.go](file:///c:/Users/ASUS/OneDrive/เอกสาร/BTMS/backend/config/config.go)):
  - Environment variable parsing with strict validation (`PORT`, `DATABASE_URL`, pool limits, CORS origins).
  - `AuthConfig`: `SUPABASE_JWKS_URL`, `SUPABASE_JWT_ISSUER`, `SUPABASE_JWKS_CACHE_TTL`.
- [x] **Database Pool** ([backend/db/pool.go](file:///c:/Users/ASUS/OneDrive/เอกสาร/BTMS/backend/db/pool.go)):
  - `pgxpool` configuration with explicit minimum and maximum pool connection parameters.
  - Simple protocol toggle for transaction poolers where prepared statements are not supported.
- [x] **Middleware**:
  - Request ID injection (`X-Request-ID`).
  - Structured JSON request logging via `log/slog`.
  - Safe panic recovery returning unified JSON error envelopes.
  - Origin-validated CORS middleware.
  - **JWT Authentication** ([backend/middleware/auth.go](file:///c:/Users/ASUS/OneDrive/เอกสาร/BTMS/backend/middleware/auth.go)): JWKS-based RS256 JWT validation with auto-refreshing key cache. Extracts `sub` (user ID) and `email` from Supabase tokens.
  - **RBAC** ([backend/middleware/rbac.go](file:///c:/Users/ASUS/OneDrive/เอกสาร/BTMS/backend/middleware/rbac.go)): `RequireRole(queries, roles...)` middleware that queries the database for authoritative role checks.
- [x] **Route Tree & Handlers**:
  - Operational health endpoints: `GET /healthz` (liveness) and `GET /readyz` (readiness with DB ping).
  - Public: `GET /api/auth` (stub).
  - Protected (JWT required): all domain routes.
  - **User endpoints (live)**:
    - `GET /api/me` — returns authenticated user's profile + roles.
    - `GET /api/users` — admin-only paginated user listing.
    - `POST /api/users/:id/roles` — admin role assignment.
    - `DELETE /api/users/:id/roles/:code` — admin role removal.
  - Domain route stubs: theses, exams, finance, etc. (return 501 Not Implemented).
- [x] **Service Layer** ([backend/service/user.go](file:///c:/Users/ASUS/OneDrive/เอกสาร/BTMS/backend/service/user.go)):
  - `UserService` with `GetCurrentUser`, `ListUsers`, `AssignRole`, `RemoveRole`.
  - Role code validation against the `roles` catalogue.
  - Clean pgtype → JSON conversion helpers.
- [x] **Error Handling Standard** ([backend/utils/errors.go](file:///c:/Users/ASUS/OneDrive/เอกสาร/BTMS/backend/utils/errors.go)):
  - Consistent `{ "error": { "code": "...", "message": "..." }, "request_id": "..." }` contract.
  - Error constructors: `Unauthorized` (401), `Forbidden` (403), `BadRequest` (400), `NotFound` (404), `Internal` (500), `NotImplemented` (501), `ServiceUnavailable` (503).
- [x] **Tooling Configuration**: `sqlc.yaml` configured for PostgreSQL + `pgx/v5`.

### C. Frontend (Next.js App Router)
- [x] **Directory Layout**: Route folders for auth, student, advisor, committee, staff, finance, and printing portals.
- [x] **Supabase SSR Setup**:
  - Browser client ([frontend/src/lib/supabase/client.ts](file:///c:/Users/ASUS/OneDrive/เอกสาร/BTMS/frontend/src/lib/supabase/client.ts)).
  - Server client ([frontend/src/lib/supabase/server.ts](file:///c:/Users/ASUS/OneDrive/เอกสาร/BTMS/frontend/src/lib/supabase/server.ts)).
  - Cookie-based session refresh + user extraction ([frontend/src/lib/supabase/middleware.ts](file:///c:/Users/ASUS/OneDrive/เอกสาร/BTMS/frontend/src/lib/supabase/middleware.ts)).
- [x] **API Client Helper**:
  - Type-safe fetch wrappers (`apiFetch` and `authenticatedApiFetch`) injecting Bearer token from Supabase session.
- [x] **Authentication & Authorization UI**:
  - **Auth Provider** ([frontend/src/components/auth-provider.tsx](file:///c:/Users/ASUS/OneDrive/เอกสาร/BTMS/frontend/src/components/auth-provider.tsx)): React context with Supabase auth state listener, profile + roles from Go API, `useAuth()` hook with `hasRole()`.
  - **Route Protection** ([frontend/src/middleware.ts](file:///c:/Users/ASUS/OneDrive/เอกสาร/BTMS/frontend/src/middleware.ts)): Unauthenticated users redirected to `/login` with `next` param; authenticated users on `/login` redirected to `/dashboard`.
  - **Login Page** ([frontend/src/app/login/](file:///c:/Users/ASUS/OneDrive/เอกสาร/BTMS/frontend/src/app/login/)): Email/password form with post-login redirect to original page.
  - **Dashboard** ([frontend/src/app/dashboard/page.tsx](file:///c:/Users/ASUS/OneDrive/เอกสาร/BTMS/frontend/src/app/dashboard/page.tsx)): Displays user profile card (name, email, roles, ID), sign-out button, navigation.
  - **Root Layout** wraps app in `<AuthProvider>` so all client components can use `useAuth()`.

---

## 4. Actionable Next Steps (What To Do Next)

### Priority Milestone 0: Scope Clean-up & Head Reports (scope change 2026-10-14)

- [ ] Restrict roles to `STAFF`/`HEAD`; remove student & committee portal routes.
- [ ] Convert live rubric UI into a Staff score-entry form.
- [ ] Head dashboard + printable Lao PDF and Excel exports.

---

### Priority Milestone 1: Phase 2 / Phase 6 — Core Thesis Migration (`thesis_core.sql`)
> **Reference**: [MIGRATION_INDEX.md](file:///c:/Users/ASUS/OneDrive/เอกสาร/BTMS/supabase/migrations/MIGRATION_INDEX.md)

- [ ] Create timestamped migration `<timestamp>_thesis_core.sql`:
  - `students`: student ID, department, faculty, profile reference.
  - `teachers`: academic title, department, profile reference.
  - `theses`: topic Thai/English, abstract, status state machine (`PROPOSED`, `TOPIC_APPROVED`, `IN_PROGRESS`, etc.).
  - `thesis_members`: student-to-thesis mapping, leadership flags.
  - `thesis_advisors`: primary advisor and co-advisor assignments.
  - `thesis_files` & `thesis_revisions`: uploaded document metadata linked to Supabase storage.
- [ ] Define **foreign keys**, **status constraints**, and **RLS policies** for students, advisors, and staff.
- [ ] Apply migration via `npx supabase db push` and regenerate TypeScript + Go models.
- [ ] Implement Go `ThesisService` and endpoints: `POST /api/theses`, `GET /api/theses`, `POST /api/theses/:id/submit`, `POST /api/theses/:id/approve`.

---

### Priority Milestone 2: Examinations, Realtime Progress & Financial Management
- [ ] **Phase 7 (Examinations)**: Migration `<timestamp>_examinations.sql` + Exam scheduling + Score calculation logic in Go.
- [ ] **Phase 8 & 9 (Progress)**: State transition engine + Realtime publication to Supabase Realtime.
- [ ] **Phase 12 & 13 (Finance)**: Fee schedules, payment proof verification, and single-transaction committee disbursements with audit logging.
- [ ] **Phase 14 (Printing)**: Printing order workflow and delivery tracking.

---

## 5. Architectural Invariants (Must Keep in Mind)

1. **PostgreSQL as Single Source of Truth**: All schema changes must start as timestamped migrations in `supabase/migrations/`. Never edit generated files (`database.types.ts`, `backend/db/sqlc/*.go`) manually.
2. **Data Boundary**:
   - Direct Frontend -> Supabase: Authentication, profile reads, direct file upload to storage, Realtime progress subscription (strictly governed by RLS).
   - Frontend -> Go -> PostgreSQL: All workflow transitions, calculations (scores, fees, payments), and multi-table operations.
3. **Financial Safety**:
   - Frontend never calculates monetary amounts.
   - Use PostgreSQL `NUMERIC` for monetary values (never `float`).
   - Every financial operation runs within a single atomic database transaction.
   - Every material status transition writes to `public.audit_logs`.
4. **Authentication Flow**:
   - Supabase Auth issues JWTs (asymmetric RS256 via JWKS).
   - Frontend sends JWT as `Authorization: Bearer <token>` to Go API.
   - Go API validates via JWKS endpoint with auto-refreshing key cache.
   - RBAC checks query the `user_roles` table on each request for authoritative role data.

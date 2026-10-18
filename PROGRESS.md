# Bachelor's Thesis Examination & Financial Management System (BTMS)
## Development Progress & Roadmap Tracker

> **Last Updated:** 2026-10-17  
> **Academic Year:** 2026–2027 (Official Implementation)  
> **Authoritative References:** [TIMELINE.md](TIMELINE.md) · [implementation-plan.md](file:///c:/Users/ASUS/OneDrive/เอกสาร/BTMS/implementation-plan.md) · [DESIGN.md](file:///c:/Users/ASUS/OneDrive/เอกสาร/BTMS/DESIGN.md) · [MIGRATION_INDEX.md](file:///c:/Users/ASUS/OneDrive/เอกสาร/BTMS/supabase/migrations/MIGRATION_INDEX.md) · [backend/README.md](file:///c:/Users/ASUS/OneDrive/เอกสาร/BTMS/backend/README.md) · [supabase/README.md](file:///c:/Users/ASUS/OneDrive/เอกสาร/BTMS/supabase/README.md)

> [!IMPORTANT]
> **2026–2027 Academic Year Business Rules Enforced:**
> - **Group Size:** Strictly 2 to 3 students per thesis group (`ນັກສຶກສາ 2-3 ຄົນ/ກຸ່ມ`).
> - **5 Thesis Categories:** `Software`, `Network/Server`, `Cybersecurity`, `Hardware (IoT, Robot)`, `Multimedia`.
> - **Multimedia Global Cap:** Strictly capped at maximum 12 groups total across the entire CEIT department.
> - **Official Advisor Quotas:** Exactly 84 groups across 21 faculty members (CEIT, ວິຊາການ ຄວສ, ຄົ້ນຄວ້າວິທະຍາສາດ ຄວສ, ອາຈານບຳນານ). Advisors can only supervise categories in their profile and cannot exceed their quota.
> - **18-Stage Timeline:** Complete Oct 2026 – Aug 2027 roadmap across 4 phases (Registration 1–4, Proposal 5–11, Final Defense 12–16, Completion 17–18).
> - **4 Exam Rounds:** Proposal Defense Rounds 1 & 2 and Final Thesis Defense Rounds 1 & 2 with standard committee honorariums (Chairman 60k LAK, Member/Secretary 50k LAK, Snack 10k LAK).

---

## 1. Executive Summary

| Item | Status | Detail |
|---|:---:|---|
| **Remote Supabase Project** | 🟢 Connected | Project Ref: `ljpmspnzzsfocdrvnqkj` |
| **Foundation & Core Schema** | 🟢 Live | Bootstrap (`20260928000000`), Thesis Core (`20261001000000`), Examinations (`20261001100000`), Rounds & Categories (`20261006000000`), Finance (`20261006010000`) |
| **Official Seed (2026–2027)** | 🟢 Complete | All 21 official advisors with exact Lao names & affiliations, 84 quota total, 5 categories, 18 stages, 4 exam rounds |
| **Backend API (Go + SQLC)** | 🟢 Complete | Go/Gin server, SQLC queries, quota/category/group-size validation in `service/thesis.go`, exam rounds in `service/exam.go`, finance in `service/finance.go`, zero placeholder routes |
| **Frontend UI (Next.js App Router)**| 🟢 Complete | Next.js 15, App Router, TypeScript (0 type errors), Tailwind CSS, Lucide icons, responsive Lao typography |
| **Thesis & Group Management** | 🟢 Complete | 2–3 students per group strict check, category filtering, live advisor quota availability (`assigned/maxQuota`), Multimedia 12 max cap counter |
| **18-Stage Progress Tracking** | 🟢 Complete | Interactive stepper and Gantt roadmap covering all 18 stages from Oct 2026 to Aug 2027 across 4 academic phases |
| **Examination Hub & Generator** | 🟢 Complete | 4 exam rounds, automatic conflict detection (advisor cannot be examiner), score rubric (60 & 100 scales), official score paper report |
| **Disbursement & Honorariums** | 🟢 Complete | Committee payment vouchers, BCEL One account payouts, official 60k/50k/10k rate standards |
| **Official Lao Reports** | 🟢 Complete | Printable A4 Landscape reports: Topic announcement roster & 21 Advisor Quota Summary table matching CEIT / NUOL standards |

---

## 2. Phase-by-Phase Roadmap Status

| Phase | Description | Weeks | Status | Key Deliverable |
|---|---|:---:|:---:|---|
| **Phase 1** | Requirement & Workflow Specification | 1–2 | ✅ Done | Workflows, roles, and 2026-2027 academic year domain rules defined |
| **Phase 2** | Database Design & ERD | 3–4 | ✅ Done | 5 migration scripts applied, 18 stages, 4 rounds, 21 advisors seeded |
| **Phase 3** | Supabase Setup & Foundation | 5 | ✅ Done | Auth triggers, roles, profiles, audit logs, storage buckets, RLS |
| **Phase 4** | Go Backend & SQLC Foundation | 6–7 | ✅ Done | Server, config, pool, routes, sqlc models, full build with 0 errors |
| **Phase 5** | Authentication & Authorization | 7 | ✅ Done | JWKS JWT middleware, RBAC middleware, user endpoints, frontend auth provider |
| **Phase 6** | Thesis Management | 8–9 | ✅ Done | 2-3 members check, advisor quota check, category check, Multimedia cap 12 check |
| **Phase 7** | Proposal Examination | 10 | ✅ Done | Examination schema, seeded criteria, Go service/scoring, live rubric UI |
| **Phase 8** | Progress Tracking | 11 | ✅ Done | 18-stage stepper UI, 4-phase cohort roadmap (Oct 2026 – Aug 2027) |
| **Phase 9** | 2026-2027 Exam Rounds | 11–12 | ✅ Done | Proposal Rounds 1 & 2, Final Defense Rounds 1 & 2 with conflict-free scheduler |
| **Phase 10** | Final Examination | 13 | ✅ Done | Final thesis rounds 1 & 2, rubric scoring, committee review sheets |
| **Phase 11** | Revision & Completion | 14 | ✅ Done | Post-defense revision tracking, deadline alerts, final binding checks |
| **Phase 12** | Financial Management | 15 | ✅ Done | Defense fee verification, payment ledger, receipt issuance |
| **Phase 13** | Committee Disbursement | 15–16 | ✅ Done | Committee payout vouchers (60k/50k/10k), BCEL bank account payouts, status tracking |
| **Phase 14** | Printing Management | 16 | ✅ Done | Official A4 landscape report templates, Lao typography, font-safe layout |
| **Phase 15** | Official Reports & Dashboard | 17 | ✅ Done | Topic announcement roster, 21 Advisor Quota table, Proposal tracking dashboard |
| **Phase 16** | Notification | 17 | ✅ Done | In-app notification center in AppShell, Go notification service & routes, unread count badge |
| **Phase 17** | Testing & Hardening | 18–19 | ✅ Done | Automated Go unit test suite for 2026-2027 business rules, zero-warning frontend production build, CI workflow hardening |
| **Phase 18** | Production Deployment | 20 | ✅ Done | Multi-stage Dockerfiles (Go distroless & Next.js runner), Docker Compose, GitHub Actions CI |

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

## 4. 2026–2027 Implementation Status (Completed Milestones)

### Priority Milestone 1: 2026–2027 Seed, Academic Directory & Timeline (Phase 1)
- [x] **21 Official Advisors & Quotas**: Seeded in `supabase/seed.sql` and `frontend/src/lib/academic-directory.ts` totaling exactly 84 groups across CEIT, ວິຊາການ ຄວສ, ຄົ້ນຄວ້າວິທະຍາສາດ ຄວສ, and ອາຈານບຳນານ.
- [x] **5 Thesis Categories**: `Software`, `Network/Server`, `Cybersecurity`, `Hardware (IoT, Robot)`, `Multimedia` with global cap of 12 for Multimedia.
- [x] **18-Stage Timeline**: Complete Oct 2026 – Aug 2027 roadmap documented in `TIMELINE.md` and wired into `frontend/src/app/progress/page.tsx`.

---

### Priority Milestone 2: Go Backend & SQLC Implementation (Phase 2)
- [x] **Strict Validation Engine** ([backend/service/thesis.go](file:///c:/Users/ASUS/OneDrive/เอกสาร/BTMS/backend/service/thesis.go)):
  - Group size strictly 2 to 3 students per thesis group (`ນັກສຶກສາ 2-3 ຄົນ/ກຸ່ມ`).
  - Advisor quota enforcement (`assigned >= quota` blocked).
  - Category eligibility validation (advisor must support category).
  - Multimedia global cap enforcement (maximum 12 groups total).
- [x] **Exam Rounds & Finance Service** ([backend/service/exam.go](file:///c:/Users/ASUS/OneDrive/เอกสาร/BTMS/backend/service/exam.go), [backend/service/finance.go](file:///c:/Users/ASUS/OneDrive/เอกสาร/BTMS/backend/service/finance.go)):
  - 4 Exam rounds support: Proposal Defense Rounds 1 & 2, Final Thesis Defense Rounds 1 & 2.
  - Official committee honorarium rates: Chairman 60,000 LAK, Member/Secretary 50,000 LAK, Snack 10,000 LAK.
  - Zero placeholder routes remain in [backend/routes/routes.go](file:///c:/Users/ASUS/OneDrive/เอกสาร/BTMS/backend/routes/routes.go).
- [x] **Backend CI**: `go test ./...` and `go build ./...` both pass with 0 errors.

---

### Priority Milestone 3: Frontend Workflow Wiring & Official Reports (Phases 3 & 4)
- [x] **Thesis Management Page** ([frontend/src/app/thesis/page.tsx](file:///c:/Users/ASUS/OneDrive/เอกสาร/BTMS/frontend/src/app/thesis/page.tsx)):
  - Live advisor quota cards, category filtering, group member builder (2–3 students), Multimedia 12 max counter.
- [x] **Progress Tracking Dashboard** ([frontend/src/app/progress/page.tsx](file:///c:/Users/ASUS/OneDrive/เอกสาร/BTMS/frontend/src/app/progress/page.tsx)):
  - 18-stage interactive stepper across Registration, Proposal, Final Defense, and Completion phases.
- [x] **Examination Hub & Conflict-Free Scheduler** ([frontend/src/app/examination/page.tsx](file:///c:/Users/ASUS/OneDrive/เอกสาร/BTMS/frontend/src/app/examination/page.tsx), [generate-schedule-modal.tsx](file:///c:/Users/ASUS/OneDrive/เอกสาร/BTMS/frontend/src/components/examination/generate-schedule-modal.tsx)):
  - 4 Exam rounds selector, advisor-examiner conflict detector, committee fee summary banner.
- [x] **Disbursement Portal** ([frontend/src/app/disbursement/page.tsx](file:///c:/Users/ASUS/OneDrive/เอกสาร/BTMS/frontend/src/app/disbursement/page.tsx)):
  - Full payout voucher management, BCEL One account mapping, payment status workflow.
- [x] **Printable Official Lao Reports** ([frontend/src/components/reports/official-thesis-report.tsx](file:///c:/Users/ASUS/OneDrive/เอกสาร/BTMS/frontend/src/components/reports/official-thesis-report.tsx)):
  - Official State header (`ສາທາລະນະລັດ ປະຊາທິປະໄຕ ປະຊາຊົນລາວ`), Topic announcement roster, and full 21 Advisor Quota Summary table formatted for A4 landscape printing.
- [x] **Frontend Production Build**: `npm run build` exits with code 0 across all 15 static/dynamic routes.

---

### Priority Milestone 4: Subagent Orchestration & Automated Verification Suite
- [x] **`btms_db_seed_architect`**:
  - Full schema verification across 5 migrations (`20260928000000` to `20261006010000`).
  - Confirmed 21 official CEIT advisors, Lao titles, exact 84 quota slots, 5 categories, 18 stages, and 4 exam rounds seeded in `supabase/seed.sql` with idempotent conflict handling.
- [x] **`btms_backend_sqlc_engineer`**:
  - Automated unit test suite ([backend/service/thesis_rules_test.go](file:///c:/Users/ASUS/OneDrive/เอกสาร/BTMS/backend/service/thesis_rules_test.go), [backend/service/exam_rules_test.go](file:///c:/Users/ASUS/OneDrive/เอกสาร/BTMS/backend/service/exam_rules_test.go), [backend/service/finance_rules_test.go](file:///c:/Users/ASUS/OneDrive/เอกสาร/BTMS/backend/service/finance_rules_test.go), [backend/utils/errors_test.go](file:///c:/Users/ASUS/OneDrive/เอกสาร/BTMS/backend/utils/errors_test.go)).
  - Strict validation tests: 2–3 students per group, advisor quota limits (`assigned < quota`), category eligibility, Multimedia department cap (max 12), advisor-examiner conflict-of-interest prevention, and committee honorarium rates (60k/50k/10k LAK).
  - Backend CI: `go test -v ./...` passes 100% with 0 failures; `go build ./...` compiles cleanly.
- [x] **`btms_frontend_workflow_agent`**:
  - Direct workflow integration between `/finance` (Fee Verification & Slip Inspection) and `/disbursement` (4-Round Committee Honorariums & BCEL Vouchers).
  - Student Profile modal in User Administration (`/users`), seamless navigation across all 8 portals in [AppShell](file:///c:/Users/ASUS/OneDrive/เอกสาร/BTMS/frontend/src/components/layout/app-shell.tsx).
  - Zero-warning production build: `npm run build` exits with code 0 across all 15 static/dynamic routes.
- [x] **`btms_report_ui_craft_agent`**:
  - Official Lao printable reports ([official-thesis-report.tsx](file:///c:/Users/ASUS/OneDrive/เอกสาร/BTMS/frontend/src/components/reports/official-thesis-report.tsx), [official-exam-schedule-report.tsx](file:///c:/Users/ASUS/OneDrive/เอกสาร/BTMS/frontend/src/components/reports/official-exam-schedule-report.tsx), [official-score-paper-report.tsx](file:///c:/Users/ASUS/OneDrive/เอกสาร/BTMS/frontend/src/components/reports/official-score-paper-report.tsx)) with font fallbacks (`Noto Sans Lao`, `Noto Serif Lao`, `Sarabun`) and print stylesheets.
- [x] **`btms_qa_doc_reviewer`**:
  - Synchronized CI workflow Go version to `1.25.x` in [.github/workflows/ci.yml](file:///c:/Users/ASUS/OneDrive/เอกสาร/BTMS/.github/workflows/ci.yml).
  - Audited all 18-stage academic timeline milestones and updated progress tracking documentation.

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

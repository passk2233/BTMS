# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Only **two people log in**. Students, advisors, and committee members never use the system directly — Staff records their data.

- **Staff (`STAFF`) — the operator**: Registers students and groups, assigns advisors within quota, records topics, schedules proposal/final defense rounds and panels, enters committee scores after each defense, tracks book submissions, verifies fee payments, and manages printing/binding.
- **Head (`HEAD`) — the reviewer**: Logs in to see a summary dashboard, and downloads printable Lao reports (PDF) and Excel exports. Has the same permissions as Staff but primarily reads.

## Product Purpose

BTMS (Bachelor's Thesis Examination & Financial Management System) is a **personal operations tool for the department staff member** who runs the 4th-year thesis process, and a **reporting window for the Head**. It replaces scattered spreadsheets with one place that records students, groups, topics, exam rounds, scores, payments and printing, and produces official Lao reports on demand.

BTMS does **not** track or enforce the department timeline. Real dates shift every year, so the timeline ([TIMELINE.md](TIMELINE.md)) is background context only.

## Positioning

Unlike generic educational management systems or ad-hoc project trackers, BTMS enforces an authoritative separation of concerns:
- **Authoritative Backend Truth**: The frontend never computes financial sums or decides state transitions; all business workflows, score consensus logic, and fee reconciliations run exclusively through the Go API inside transactional database operations with immutable audit logs.
- **Institutional Lao Academic Compliance**: Purpose-built for Lao university thesis administration standards, supporting dual-language (Lao/English) topic recording, advisor portfolios, and pixel-accurate generation of official departmental defense rosters and score sheets (`ກຸ່ມ`, `ຫ້ອງ`, `ຊື່ຫົວຂໍ້`, `ຊື່ອາຈານທີ່ປຶກສາ`, `ໝາຍເຫດ`).

## Operating Context

- **Staff desk (primary)**: Desktop/laptop; one operator handling a cohort of 50–200+ students in groups. Data entry speed and bulk actions matter most.
- **After each defense round**: Staff types in committee scores from paper score sheets (no live, in-room scoring by committee).
- **Slip verification**: Staff compares bank slips (Supabase Storage) against fee balances before issuing receipts.
- **Printing & binding**: Staff tracks final books through the print queue.
- **Head's review**: Head opens the dashboard or receives a printed Lao PDF / Excel file.

## Capabilities and Constraints

- **Capabilities**:
  - Two-role access (`STAFF`, `HEAD`) with JWKS-based JWT authentication.
  - Cohort onboarding, group formation, and advisor quota management.
  - Proposal and final defense rounds 1 & 2 with panel scheduling and conflict detection.
  - Staff-entered committee scores with backend score aggregation and pass/fail results.
  - Book submission tracking: proposal books, final books, format check.
  - Slip verification, payment ledger, receipts, and committee honorariums (Staff-operated).
  - Printing/binding board with cost calculation.
  - **Head reports**: on-screen dashboard, printable Lao PDF, and Excel export.
- **Out of scope**:
  - Timeline / schedule tracking against the department plan.
  - Student self-service portal (students do not log in).
  - Live in-room committee scoring (committee does not log in).
- **Constraints**:
  - PostgreSQL database schema is the single source of truth; all TypeScript and sqlc models are code-generated.
  - Financial calculations must strictly use PostgreSQL `NUMERIC` types to eliminate floating-point inaccuracies.
  - Multi-table writes and state modifications must execute in Go backend transactions paired with immutable `audit_logs` entries.

## Brand Commitments

- **Name**: BTMS (Bachelor's Thesis Examination & Financial Management System).
- **Voice and Tone**: Calm, authoritative, institutional, clear, and uncompromisingly trustworthy.
- **Visual Personality**: High-density SaaS ergonomics with precise academic typography, deliberate data density, high contrast, and structured visual status signaling.

## Evidence on Hand

- **Department thesis process (context only, not a feature)**: [TIMELINE.md](TIMELINE.md) from [Time Line.xlsx](file:///c:/Users/ASUS/OneDrive/เอกสาร/BTMS/Time%20Line.xlsx)
- Master architectural and workflow specification: [implementation-plan.md](file:///c:/Users/ASUS/OneDrive/เอกสาร/BTMS/implementation-plan.md)
- Complete UI/UX design specification and design token contract: [DESIGN.md](file:///c:/Users/ASUS/OneDrive/เอกสาร/BTMS/DESIGN.md)
- Engineering progress and phase delivery tracking: [PROGRESS.md](file:///c:/Users/ASUS/OneDrive/เอกสาร/BTMS/PROGRESS.md)
- Database migration catalog and identity schema: [MIGRATION_INDEX.md](file:///c:/Users/ASUS/OneDrive/เอกสาร/BTMS/supabase/migrations/MIGRATION_INDEX.md) and [20260928000000_bootstrap_identity_and_storage.sql](file:///c:/Users/ASUS/OneDrive/เอกสาร/BTMS/supabase/migrations/20260928000000_bootstrap_identity_and_storage.sql)

## Product Principles

1. **Academic Rigor Over Superficial Flourish**: Every interface component, table column, and metric card serves an explicit academic or financial function; visual clarity and data density take precedence over decorative filler.
2. **Authoritative Backend Truth**: The client renders verified state and collects user input; financial totals, grade consensus, and workflow state transitions belong exclusively to backend ACID transactions.
3. **Cognitive Ergonomics for High-Volume Work**: High-density layouts, compact information hierarchy, keyboard efficiency, and split-pane viewers eliminate redundant modal clicks and context switching.
4. **Uncompromising Financial & Academic Auditability**: Every grade submitted, proposal approved, slip verified, and honorarium disbursed creates an unalterable audit log entry with timestamp and actor attribution.

## Accessibility & Inclusion

- Adherence to WCAG 2.1 AA contrast standards across dark and light surfaces (primary text contrast exceeding 14:1, muted text exceeding 6.9:1).
- Full keyboard navigable data tables, rubric score inputs, and modal dialogues with visible focus rings (`focus-visible:ring-2 focus-visible:ring-sky-600`).
- Semantic HTML markup (`<th scope="col">`, `<th scope="row">`, `role="alert"`) and screen-reader accessible status indicators.
- Responsive, resilient layout down to tablet viewport widths (768px+) so the Head can review on a tablet.

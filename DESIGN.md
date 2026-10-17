# BTMS System Design & UI/UX Specification

> **Bachelor's Thesis Examination & Financial Management System**  
> **Status:** Authoritative Design Specification  
> **Target Platform:** Next.js (App Router, Tailwind CSS, TypeScript) + Go (Gin, pgx, sqlc) + Supabase (PostgreSQL, Auth, Storage, Realtime)  
> **Related Documents:** [implementation-plan.md](file:///c:/Users/ASUS/OneDrive/เอกสาร/BTMS/implementation-plan.md) · [PROGRESS.md](file:///c:/Users/ASUS/OneDrive/เอกสาร/BTMS/PROGRESS.md) · [MIGRATION_INDEX.md](file:///c:/Users/ASUS/OneDrive/เอกสาร/BTMS/supabase/migrations/MIGRATION_INDEX.md)

---

## 1. Design Vision & Guiding Principles

The Bachelor's Thesis Examination & Financial Management System (BTMS) is an academic SaaS platform that unifies academic thesis governance, multi-evaluator examination grading, and multi-tier financial reconciliations. Academic software often suffers from visual clutter, confusing navigation, and opaque workflows. BTMS replaces this with a calm, high-density, trustworthy, and modern web application.

```
                  ┌──────────────────────────────────────────────┐
                  │           BTMS DESIGN PRINCIPLES            │
                  ├──────────────────────────────────────────────┤
                  │  1. Academic Rigor with Modern SaaS Clarity │
                  │  2. Cognitive Ergonomics & High-Density UI   │
                  │  3. Uncompromising Financial Auditability    │
                  │  4. Real-time Awareness Without Distraction │
                  │  5. Accessibility & Responsive Reliability   │
                  └──────────────────────────────────────────────┘
```

### Core Design Principles

1. **Academic Rigor with Modern SaaS Clarity**:
   - High visual polish: Clean typography, balanced negative space, deliberate borders, and sophisticated color grading.
   - Avoid toy-like or purely decorative elements; every UI element serves an explicit academic or financial function.
2. **Cognitive Ergonomics & High-Density UI**:
   - Academics and staff manage dozens of thesis groups and complex rubrics. Information must be structured in compact, digestible layouts without overwhelming whitespace or endless scrolling.
   - Split-pane review interfaces (document viewer on the left, scoring rubric/comments on the right) prevent context switching.
3. **Uncompromising Financial Auditability & Transparency**:
   - Money and scores are never ambiguous. Financial figures use tabular numerals (`font-mono`), explicit currency markers (`THB`), and crystal-clear transaction states (`UNPAID`, `VERIFIED`, `DISBURSED`).
   - Destruction or state-altering actions (e.g., rejecting a thesis, approving a payout, finalizing scores) require two-step confirmation with contextual warnings.
4. **Real-time Awareness Without Distraction**:
   - Supabase Realtime drives status pills, live exam score consolidation, and notification feeds without demanding full-page reloads.
   - Subtle pulse indicators and toast alerts notify users of external updates smoothly.
5. **Accessibility & Responsive Reliability**:
   - Strict adherence to WCAG 2.1 AA contrast ratios (minimum 4.5:1 for normal text).
   - Fully keyboard-navigable dialogs, forms, and tables with visible focus rings.

---

## 2. Design System & Visual Tokens

The BTMS design system uses a curated palette built on Tailwind CSS utility conventions, elevated with custom CSS custom properties for theming and semantic consistency.

### 2.1 Color Palette & Semantic Tokens

```
+-------------------------------------------------------------------------------+
| PRIMARY BRAND (Deep Slate & Royal Sky)                                        |
| Slate 950: #020617 (Primary Headings)        Sky 600: #0284c7 (Primary Brand) |
| Slate 900: #0f172a (Sidebar / High Contrast) Sky 700: #0369a1 (Hover / Active)|
| Slate 700: #334155 (Sub-headings / Icons)    Sky 50:  #f0f9ff (Subtle Surface)|
+-------------------------------------------------------------------------------+
| SEMANTIC STATUS TOKENS                                                        |
| Emerald: #059669 / #ecfdf5 (Passed, Verified, Paid, Completed, Active)        |
| Amber:   #d97706 / #fffbeb (Under Review, Revision Required, Pending, In Prog) |
| Rose:    #e11d48 / #fff1f2 (Failed, Rejected, Overdue, Cancelled, Error)       |
| Sky:     #0284c7 / #f0f9ff (Scheduled, Submitted, New Notice, Draft Ready)    |
| Violet:  #7c3aed / #f5f3ff (Committee Review, Multi-Evaluator Deliberation)   |
| Slate:   #64748b / #f8fafc (Draft, Archived, Inactive, Unassigned)            |
+-------------------------------------------------------------------------------+
```

#### Detailed Token Mapping

| Token Name | Light Mode Value | Dark / Deep Surface Value | Intended Usage |
|---|---|---|---|
| `--color-bg-canvas` | `#f8fafc` (slate-50) | `#090d16` | Main application background |
| `--color-bg-surface` | `#ffffff` (white) | `#0f172a` (slate-900) | Content cards, tables, modal surfaces |
| `--color-bg-subtle` | `#f1f5f9` (slate-100) | `#1e293b` (slate-800) | Table headers, secondary buttons, badges |
| `--color-border-subtle` | `#e2e8f0` (slate-200) | `#334155` (slate-700) | Card dividers, input borders, table borders |
| `--color-border-hover` | `#cbd5e1` (slate-300) | `#475569` (slate-600) | Hovered inputs, active tab borders |
| `--color-text-primary` | `#0f172a` (slate-900) | `#f8fafc` (slate-50) | High-contrast body, primary titles |
| `--color-text-secondary` | `#475569` (slate-600) | `#94a3b8` (slate-400) | Descriptions, labels, table cell text |
| `--color-text-muted` | `#64748b` (slate-500) | `#64748b` (slate-500) | Timestamps, placeholder text, hints |
| `--color-brand-primary` | `#0284c7` (sky-600) | `#38bdf8` (sky-400) | Primary CTAs, active links, brand accents |
| `--color-brand-hover` | `#0369a1` (sky-700) | `#0ea5e9` (sky-500) | Primary CTA hover state |
| `--color-brand-light` | `#f0f9ff` (sky-50) | `#0c4a6e` (sky-900) | Selected menu items, highlighted rows |

### 2.2 Typography Scale

- **Latin Font:** `Inter`, `Plus Jakarta Sans`, `-apple-system`, `BlinkMacSystemFont`, `Segoe UI`, `sans-serif`
- **Lao Font:** `Noto Sans Lao`, `Noto Serif Lao`, `sans-serif` (essential for formal Lao academic titles, committee appointment documents, and student records)
- **Monospace (Numbers & Codes):** `JetBrains Mono`, `Fira Code`, `ui-monospace`, `monospace` (used for IDs, timestamps, scores, and monetary amounts in LAK / ₭)

#### Lao Academic & Governance Terminology (ຄຳສັບທາງວິຊາການພາສາລາວ)

| Module / Concept | English Term | Lao Localization (ພາສາລາວ) |
|---|---|---|
| **System Name** | Bachelor's Thesis & Financial Management System | ລະບົບຄຸ້ມຄອງການປ້ອງກັນບົດໂຄງການຈົບຊັ້ນ ແລະ ການເງິນ (BTMS) |
| **Role: Student** | Student | ນັກສຶກສາ |
| **Role: Advisor** | Thesis Advisor | ອາຈານທີ່ປຶກສາບົດ |
| **Role: Committee** | Examination Committee | ຄະນະກຳມະການສອບເສັງ |
| **Role: Staff** | Academic Staff | ພະນັກງານວິຊາການ |
| **Role: Finance** | Finance Officer | ພະນັກງານການເງິນ |
| **Role: Printing** | Printing Officer | ພະນັກງານໂຮງພິມ |
| **Role: Admin** | System Administrator | ຜູ້ດູແລລະບົບ |
| **Stage 1** | Topic Proposal | ສະເໜີຫົວຂໍ້ບົດໂຄງການ |
| **Stage 2** | Advisor Review | ອາຈານກວດສອບ |
| **Stage 3** | Proposal Examination | ສອບປ້ອງກັນໂຄງຮ່າງບົດ |
| **Stage 4** | Proposal Approved | ອະນຸມັດໂຄງຮ່າງ |
| **Stage 5** | Development | ພັດທະນາລະບົບຕົວຈິງ |
| **Stage 6** | Final Examination | ສອບປ້ອງກັນບົດຈົບຊັ້ນ |
| **Stage 7** | Revision | ປັບປຸງແກ້ໄຂຕາມຄຳເຫັນ |
| **Stage 8** | Completed | ສຳເລັດສົມບູນ |
| **Currency** | Lao Kip | ₭ (LAK - ກີບລາວ) |
| **Bank Transfer** | Mobile Banking Proof (BCEL One) | ສະລິບໂອນເງິນ BCEL One (ທະນາຄານການຄ້າຕ່າງປະເທດລາວ) |

| Level | Size / Line Height | Weight | Tracking | Usage |
|---|---|---|---|---|
| **Display** | 36px (2.25rem) / 2.5rem | Bold (700) | -0.025em | Main landing titles, high-level dashboards |
| **H1** | 28px (1.75rem) / 2rem | Bold (700) | -0.02em | Module page headers (`/thesis`, `/examination`) |
| **H2** | 20px (1.25rem) / 1.75rem | Semi-Bold (600) | -0.015em | Card headers, modal headings, section titles |
| **H3** | 16px (1.0rem) / 1.5rem | Semi-Bold (600) | -0.01em | Table subheaders, widget group labels |
| **Body Large** | 16px (1.0rem) / 1.5rem | Regular (400) | Normal | Hero leads, important descriptions |
| **Body** | 14px (0.875rem) / 1.375rem | Regular (400) | Normal | Standard UI copy, table rows, form inputs |
| **Caption / Small**| 12px (0.75rem) / 1.125rem | Medium (500) | +0.01em | Status pills, metadata tags, field helper text |
| **Micro / Mono** | 11px (0.6875rem) / 1rem | Medium (500) | +0.02em | UUIDs, hash strings, receipt codes, timestamps |

### 2.3 Spacing, Radius & Elevation

- **Base Spacing Grid:** 4px baseline, standard spacing units: `4px (1)`, `8px (2)`, `12px (3)`, `16px (4)`, `24px (6)`, `32px (8)`, `48px (12)`.
- **Border Radius Hierarchy**:
  - `rounded-md` (6px): Form inputs, dropdown options, badge pills.
  - `rounded-lg` (8px): Action buttons, modal dialogs, secondary cards.
  - `rounded-xl` (12px): Primary dashboard widgets, data table containers.
  - `rounded-full`: Avatars, circular indicators, state dots.
- **Shadow & Elevation Tiers**:
  - `shadow-none`: Flat embedded panels inside cards.
  - `shadow-xs`: `0 1px 2px 0 rgba(0, 0, 0, 0.04)` (form inputs, default buttons).
  - `shadow-sm`: `0 1px 3px 0 rgba(0, 0, 0, 0.08), 0 1px 2px -1px rgba(0, 0, 0, 0.04)` (standard card surface).
  - `shadow-md`: `0 4px 6px -1px rgba(0, 0, 0, 0.07), 0 2px 4px -2px rgba(0, 0, 0, 0.05)` (dropdown menus, popovers).
  - `shadow-xl`: `0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.08)` (modal dialogs, slide-overs).

---

## 3. Information Architecture & Navigation

The system operates on **2 equal administrative & academic roles**:
- **`STAFF` (ພະນັກງານວິຊາການ)**: Performs thesis registration, committee scheduling, score recording, and file archiving.
- **`HEAD` (ຫົວໜ້າພາກວິຊາ)**: Has identical operational capabilities as Staff, with leadership oversight.

> **Key Operational Model:** Students and external advisors do not require individual accounts. Instead, **students choose their topic, consult and secure agreement from their advisor, and bring the confirmation to Staff/Head**, who then registers the thesis into BTMS.

### 3.1 Step 1 Thesis Registration Specification (ຂັ້ນຕອນທີ 1: ລົງທະບຽນບົດໂຄງການ)

When students submit their proposal to Staff/Head, the system records:
1. **Thesis Topic (Lao & English)**:
   - ຫົວຂໍ້ບົດໂຄງການພາສາລາວ (`title_lao`)
   - ຫົວຂໍ້ບົດໂຄງການພາສາອັງກິດ (`title_en`)
2. **Advicees / Students (at most 3 students)**:
   - Student 1 (Leader): Name + Student ID (ລະຫັດນັກສຶກສາ)
   - Student 2 (Optional): Name + Student ID
   - Student 3 (Optional): Name + Student ID
3. **Thesis Advisor (ອາຈານທີ່ປຶກສາ)**:
   - Advisor Name + Academic Title + Department/Faculty
4. **Advisor Confirmation Document (ໃບຢັ້ງຢືນການຕົກລົງເປັນອາຈານທີ່ປຶກສາ)**:
   - PDF / image upload of the signed confirmation document where the advisor formally agrees to supervise the group.

### 3.2 Role-Based Navigation Matrix

Both `STAFF` and `HEAD` have full access to all modules:
- `/dashboard` (ແຜງຄວບຄຸມວິຊາການ)
- `/thesis` (ຄຸ້ມຄອງບົດໂຄງການ & ລົງທະບຽນບົດໃໝ່)
- `/examination` (ສູນການສອບເສັງ & ບັນທຶກຄະແນນກຳມະການ)
- `/progress` (ຕິດຕາມຄວາມຄືບໜ້າ 8 ຂັ້ນຕອນ)
- `/finance` (ກວດສອບສະລິບໂອນເງິນ & ໃບຮັບເງິນ)
- `/printing` (ຄຸ້ມຄອງຄິວພິມ & ເຂົ້າຮູບເຫຼັ້ມ)
- `/reports` (ລາຍງານສະຖິຕິວິຊາການ & ການເງິນ)
- `/users` (ຄຸ້ມຄອງບັນຊີພະນັກງານ Staff & Head)

| Module / Route | Student | Advisor | Committee | Staff | Finance | Printing | Admin |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| `/dashboard` | Student View | Advisor View | Committee View | Staff View | Finance View | Printing View | Master View |
| `/thesis` | My Thesis | Supervised | Assigned List | All Theses | View Only | — | Full Access |
| `/examination` | My Exam | Schedule/Score | Grading Room | Timetable/Rooms | — | — | Full Access |
| `/progress` | My Timeline | Group Milestone | — | Overview | — | — | Full Access |
| `/finance` | Pay Fees/Slips | — | — | Fee Monitor | Reconciliation | — | Full Access |
| `/disbursement`| — | — | My Claims | — | Payout Ledger | — | Full Access |
| `/printing` | Place Order | — | — | Printing Monitor| Payment Check | Print Queue | Full Access |
| `/reports` | — | Summary | — | Academic Report | Financial Report| Order Report | All Reports |
| `/users` | — | — | — | View Users | — | — | RBAC Manager |

---

## 4. User Personas & Experience Scenarios

### 4.1 The Student Persona (`STUDENT`)
- **Primary Goals:** Form a group, submit thesis proposal topic, monitor advisor approvals, prepare for proposal defense, track milestone progress, upload payment receipts, and submit final print order.
- **Pain Points:** Anxiety over unclear deadlines, uncertainty about whether advisor has reviewed the draft, payment verification delays.
- **UX Response:**
  - **Prominent Visual Progress Bar:** A linear 8-stage stepper (`Topic` → `Review` → `Proposal Exam` → `Approved` → `Development` → `Final Exam` → `Revision` → `Completed`) with actionable milestone flags.
  - **Status Alert Banners:** Immediate visual feedback when revisions are requested, accompanied by itemized comments.
  - **Seamless Slip Uploader:** Drag-and-drop bank transfer slip with automatic image preview, date/amount metadata validation, and instant `PENDING VERIFICATION` indicator.

### 4.2 The Advisor Persona (`ADVISOR`)
- **Primary Goals:** Supervise assigned groups, review topic proposals (Approve / Reject / Request Revision), check weekly development progress, and endorse final defense readiness.
- **Pain Points:** Multiple email chains, lost attachments, difficulty keeping track of which groups are lagging behind schedule.
- **UX Response:**
  - **Advisory Cockpit:** Group cards categorized into tabs (`Needs Review`, `In Progress`, `Exam Scheduled`, `Completed`).
  - **Side-by-Side Reviewer:** View uploaded thesis PDF directly next to comment notes and single-click approval buttons (`Approve`, `Request Changes`).

### 4.3 The Committee Member Persona (`COMMITTEE`)
- **Primary Goals:** Review assigned thesis documents prior to the defense, participate in proposal/final exams, evaluate criteria scores, and record deliberations.
- **Pain Points:** Calculating rubrics on paper, disparate scoring formats, post-exam paperwork bottlenecks.
- **UX Response:**
  - **Live Examination Room Screen:** A distraction-free scoring UI displaying student details, committee peers, and an interactive criteria scorecard.
  - **Auto-Tallying Scoring Rubric:** Sliders and number inputs that calculate weighted totals in real-time, showing whether the score meets the `PASS` threshold before submission.

### 4.4 The Finance Officer Persona (`FINANCE`)
- **Primary Goals:** Verify student exam fees, issue receipts, calculate committee remuneration rates, and disburse payments in bulk.
- **Pain Points:** Mismatched bank transfer slips, human calculation errors on committee rates, lack of audit trails.
- **UX Response:**
  - **Split-Screen Slip Verification:** Student receipt details on the left, high-resolution slip image with pan/zoom on the right.
  - **Single-Click Reconciliation:** `Verify & Issue Receipt` button triggers a Go API transaction that updates status and generates a verifiable receipt number.
  - **Committee Remuneration Matrix:** Table calculating exact payment entitlements by exam role (`Chairman: 150,000`, `Member: 100,000`) with batch `Disburse` execution.

### 4.5 The Printing Officer Persona (`PRINTING`)
- **Primary Goals:** Receive approved final thesis print orders, inspect page/color/binding configurations, manage press queue, and log delivery.
- **Pain Points:** Incorrect page count estimates, lack of notification when bindings are completed.
- **UX Response:**
  - **Kanban Production Board:** Columns for `Pending Order`, `In Press`, `Binding`, `Ready for Pickup`, `Delivered`.
  - **Cost Calculator Widget:** Automated calculation based on page counts, color ratios, and binding hardcover styles.

---

## 5. Screen Layouts & Wireframe Blueprints

### 5.1 Global App Shell

```
+------------------------------------------------------------------------------------------------+
| [BTMS Logo] | Dashboard > Thesis > CS-2026-001               [Search ⌘K]  [Role: STAFF] (Bell) (User)|
+--------------+---------------------------------------------------------------------------------+
| NAVIGATION   | WORKSPACE HEADER                                                                |
|              | CS-2026-001: Autonomous Drone Navigation System                                 |
| ◈ Dashboard  | Students: Alice Chen, Bob Smith | Advisor: Dr. K. Somchai                       |
| ◈ Theses     | Status: [PROPOSAL EXAM SCHEDULED] (Sky Pill) | Next: Exam on 15 Oct, 10:00 Room 402|
| ◈ Exams      +---------------------------------------------------------------------------------+
| ◈ Progress   | TABS: [Overview]  [Documents & Revisions]  [Committee & Scoring]  [Audit History]   |
| ◈ Finance    +---------------------------------------------------------------------------------+
| ◈ Printing   | TAB CONTENT: SPLIT-PANE DOCUMENT & EVALUATION VIEW                              |
| ◈ Reports    | ┌───────────────────────────────────────┬─────────────────────────────────────┐ │
| ◈ Users      | │ PDF PREVIEWER                         │ EVALUATION & NOTES PANEL            │ │
|              | │ ┌───────────────────────────────────┐ │ Committee: 3 Members Assigned       │ │
| ──────────── │ │ │                                   │ │ 1. Dr. A. Prasert (Chairman)        │ │
| ⚙ Settings   | │ │  Thesis Proposal Draft v2.1       │ │    Status: Scored (88/100)          │ │
| ⎋ Sign Out   | │ │                                   │ │ 2. Dr. B. Niran (Member)            │ │
|              | │ │                                   │ │    Status: Pending Evaluation       │ │
|              | │ └───────────────────────────────────┘ │ 3. Dr. C. Malee (Member)             │ │
|              | │ [Download PDF] [Upload New Revision] │    Status: Pending Evaluation       │ │
|              | └───────────────────────────────────────┴─────────────────────────────────────┘ │
+--------------+---------------------------------------------------------------------------------+
```

### 5.2 Real-time Examination Evaluation Interface (`/examination/[id]/grade`)

The grading interface is engineered for speed, focus, and zero calculation errors during live defenses:

```
+------------------------------------------------------------------------------------------------+
| ← Back to Exam Schedule | Exam: Proposal Defense - Group CS-2026-001          Time Left: 24:15 |
+------------------------------------------------------------------------------------------------+
| EVALUATION RUBRIC                                     | SCORING SUMMARY                        |
|                                                       |                                        |
| 1. Problem Definition & Scope (Weight: 20%)           | Overall Weighted Score:                |
|    Score (0-20): [ 18 ] ──●─────────                   | ┌────────────────────────────────────┐ │
|    Criteria: Clearly articulates problem, limitations. | │               86.5                 │ │
|                                                       | │             GRADE: A               │ │
| 2. Literature Review & Methodology (Weight: 30%)      | └────────────────────────────────────┘ │
|    Score (0-30): [ 26 ] ────────●───                   | Calculated Result:                     |
|    Criteria: Relevant references, sound methodology.   | [● PASS] [○ PASS W/ REVISION] [○ FAIL] |
|                                                       |                                        |
| 3. Feasibility & Work Plan (Weight: 30%)              | Committee Deliberation Notes:          |
|    Score (0-30): [ 25 ] ───────●────                   | ┌────────────────────────────────────┐ │
|    Criteria: Clear schedule, realistic milestones.    | │Strengths: Solid hardware design.   │ │
|                                                       | │Revisions: Refine drone sensor test │ │
| 4. Presentation & Q&A Response (Weight: 20%)          | │benchmarks before Chapter 3 review. │ │
|    Score (0-20): [ 17.5 ] ──────●───                   | └────────────────────────────────────┘ │
|                                                       |                                        |
|                                                       | [Save Draft]   [Submit Final Grade ➔]  |
+------------------------------------------------------------------------------------------------+
```

### 5.3 Financial Reconciliation & Slip Verification Interface (`/finance/verify/[id]`)

```
+------------------------------------------------------------------------------------------------+
| ← Back to Fee Ledger | Payment Verification: PAY-2026-0891                     [Status: PENDING] |
+------------------------------------------------------------------------------------------------+
| TRANSACTION DETAILS                                   | BANK TRANSFER PROOF (SLIP)             |
|                                                       |                                        |
| Student: Alice Chen (ID: 65010042)                    | ┌────────────────────────────────────┐ │
| Thesis: CS-2026-001                                   | │ [Slip Image Display]               │ │
| Fee Type: Proposal Examination Fee                    | │                                    │ │
| Authoritative Amount: 1,500.00 THB                    | │ SCB Bank Transfer                  │ │
| Reference Code: EXAM-PROP-65010042                    | │ Date: 2026-10-01 14:22:10          │ │
| Uploaded At: 2026-10-01 14:30:15                      | │ Amount: 1,500.00 THB               │ │
|                                                       | │ Ref: SCB88291049210                │ │
| Officer Notes / Receipt Memo:                         | │                                    │ │
| ┌───────────────────────────────────────────────────┐ │ [🔍 Zoom Slip]  [Open Full Resolution]│
| │Verified against SCB bank statement ending in 904. │ └────────────────────────────────────┘ │
| └───────────────────────────────────────────────────┘                                          |
|                                                       ACTIONS:                                 |
| [✕ Reject Slip with Reason]                           [✓ Approve & Issue Official Receipt]    |
+------------------------------------------------------------------------------------------------+
```

---

## 6. Component Architecture & Design Library

To ensure consistency, modularity, and rapid development across the application, UI components are classified into three structural tiers.

```
src/components/
├── ui/                     # Primitive / Atomic Design Components
│   ├── button.tsx          # Standard, outline, ghost, destructive, loading states
│   ├── badge.tsx           # Status pills (Emerald, Amber, Rose, Sky, Slate)
│   ├── card.tsx            # Surface containers, card headers, footers
│   ├── input.tsx           # Text, number, password with icon slots
│   ├── select.tsx          # Accessible dropdown select
│   ├── textarea.tsx        # Auto-resizing multi-line text field
│   ├── table.tsx           # High-density data table with header sorting
│   ├── modal.tsx           # Accessible dialog backdrop with focus trap
│   ├── sheet.tsx           # Slide-over drawer for preview & audit logs
│   ├── tabs.tsx            # Tabbed interface controllers
│   ├── stepper.tsx         # Milestone progress tracker
│   ├── avatar.tsx          # User initials / profile photo badge
│   └── tooltip.tsx         # Informational micro-popovers
├── composite/              # Feature-agnostic Composite Patterns
│   ├── page-header.tsx     # Standardized title + breadcrumb + actions bar
│   ├── data-table.tsx      # Table with search, status filters, and pagination
│   ├── file-dropzone.tsx   # Drag-and-drop file uploader with progress
│   ├── confirm-dialog.tsx  # Modal confirmation for destructive operations
│   ├── empty-state.tsx     # Visual empty data placeholder with action CTA
│   └── stat-card.tsx       # KPI metric display with delta percentage
└── domain/                 # Domain-Specific Business Components
    ├── thesis/
    │   ├── stage-stepper.tsx       # Interactive 8-stage thesis workflow bar
    │   ├── member-selector.tsx     # Student group picker with validation
    │   └── revision-history.tsx    # List of versioned thesis PDFs
    ├── exam/
    │   ├── scoring-rubric.tsx      # Multi-criteria scoring sliders & tally
    │   ├── committee-badge.tsx     # Chairman / Member status indicators
    │   └── verdict-banner.tsx      # PASS / REVISION / FAIL badge
    ├── finance/
    │   ├── slip-viewer.tsx         # Image preview with zoom/rotation controls
    │   ├── currency-display.tsx    # Monospace formatted THB amount
    │   └── receipt-card.tsx        # Printable receipt document preview
    └── printing/
        ├── order-kanban.tsx        # Drag-and-drop print queue columns
        └── cost-breakdown.tsx      # Itemized page and binding cost calculator
```

### 6.1 State & Status Badge Contract

Every status across all domains maps directly to a standardized visual token:

```typescript
// Standardized Status Pill Configurations
export const STATUS_VARIANTS = {
  // Thesis Statuses
  DRAFT: { label: "Draft", variant: "slate" },
  SUBMITTED: { label: "Submitted", variant: "sky" },
  UNDER_REVIEW: { label: "Under Review", variant: "amber" },
  APPROVED: { label: "Approved", variant: "emerald" },
  REVISION_REQUIRED: { label: "Revision Required", variant: "amber" },
  REJECTED: { label: "Rejected", variant: "rose" },
  COMPLETED: { label: "Completed", variant: "emerald" },

  // Examination Statuses
  SCHEDULED: { label: "Scheduled", variant: "sky" },
  IN_PROGRESS: { label: "Exam In Progress", variant: "violet" },
  PASS: { label: "Passed", variant: "emerald" },
  PASS_WITH_REVISION: { label: "Passed w/ Revision", variant: "amber" },
  FAIL: { label: "Failed", variant: "rose" },

  // Finance Statuses
  UNPAID: { label: "Unpaid", variant: "slate" },
  PENDING_VERIFICATION: { label: "Pending Verification", variant: "amber" },
  VERIFIED: { label: "Verified & Paid", variant: "emerald" },
  REFUNDED: { label: "Refunded", variant: "rose" },

  // Printing Statuses
  QUEUED: { label: "In Queue", variant: "slate" },
  PRINTING: { label: "In Press", variant: "sky" },
  BINDING: { label: "Binding", variant: "amber" },
  READY: { label: "Ready for Pickup", variant: "emerald" },
  DELIVERED: { label: "Delivered", variant: "emerald" },
} as const;
```

---

## 7. Interaction Flows & State Transitions

### 7.1 Thesis Proposal & Evaluation Lifecycle

```
[Student]
   │
   ├─► Creates Group (1-3 members)
   ├─► Fills Thesis Topic (TH/EN) & Abstract
   ├─► Uploads Proposal Document (.pdf)
   ▼
[Status: SUBMITTED]
   │
   ▼
[Advisor Review]
   │
   ├──► [REVISION_REQUIRED] ──► Student uploads updated PDF ──┐
   │                                                          │
   ├──► [REJECTED] ──► Topic cancelled                       │
   │                                                          │
   └──► [APPROVED] ◄──────────────────────────────────────────┘
           │
           ▼
[Staff Exam Scheduling]
   │
   ├─► Assigns Date, Time, Room
   ├─► Appoints Committee (Chairman + Members)
   ▼
[Status: EXAM SCHEDULED]
   │
   ▼
[Live Examination]
   │
   ├─► Committee inputs individual scores via Rubric UI
   ├─► Go API aggregates scores & calculates consensus
   ▼
[Result Generated]
   │
   ├──► [FAIL] ──► Must reschedule exam
   ├──► [PASS_WITH_REVISION] ──► Upload revision within 30 days
   └──► [PASS] ──► Advance to Development Phase
```

### 7.2 Financial Operation & Single Source of Truth Flow

To uphold the core architectural rule: **Frontend never computes money**, all transactions follow a strict command-and-verify flow:

```
[Next.js Client]             [Go API Service]              [PostgreSQL Database]
       │                             │                               │
       │ 1. Request Fee Slip Upload  │                               │
       ├────────────────────────────►│                               │
       │                             │ 2. Fetch Authoritative Rate   │
       │                             ├──────────────────────────────►│
       │                             │◄──────────────────────────────┤
       │ 3. Return Presigned URL     │                               │
       │◄────────────────────────────┤                               │
       │                             │                               │
       │ 4. Upload Slip to Supabase Storage                          │
       │────► [Supabase Storage Bucket: payment-proofs]              │
       │                             │                               │
       │ 5. POST /api/payments/verify│                               │
       ├────────────────────────────►│                               │
       │                             │ 6. BEGIN TRANSACTION          │
       │                             ├──────────────────────────────►│
       │                             │    • Update payment status    │
       │                             │    • Generate official receipt│
       │                             │    • Record financial audit   │
       │                             │ 7. COMMIT                     │
       │                             ├──────────────────────────────►│
       │ 8. Return Verified Receipt  │◄──────────────────────────────┤
       │◄────────────────────────────┤                               │
```

---

## 8. Accessibility & Usability (a11y) Standards

1. **Color Contrast**:
   - Primary text (`#0f172a` on `#f8fafc`) achieves a contrast ratio of `14.8:1` (exceeding WCAG AAA).
   - Muted secondary text (`#475569` on `#ffffff`) achieves a contrast ratio of `6.9:1` (exceeding WCAG AA).
   - Status badge text meets at least `4.5:1` against badge tinted backgrounds.
2. **Focus Management & Keyboard Navigation**:
   - All interactive controls (buttons, inputs, links, tabs) have explicit `focus-visible:ring-2 focus-visible:ring-sky-600 focus-visible:ring-offset-2` styling.
   - Modals and slide-over sheets capture focus upon opening and return focus to the triggering element upon close (`Escape` key closes overlays).
3. **Screen Reader Semantic Markup**:
   - Data tables include clear `<th scope="col">` and `<th scope="row">` tags.
   - Visual icons (e.g. checkmarks, status dots) include `aria-hidden="true"` accompanied by screen-reader only descriptive text (`<span className="sr-only">...</span>`).
4. **Form Ergonomics**:
   - All inputs feature persistent, explicit `<label>` elements (not relying purely on placeholders).
   - Validation errors display directly beneath the invalid input with `role="alert"` and high-contrast red styling (`text-rose-600`).

---

## 9. Implementation Roadmap & Design System Rollout

To bring this design specification into the living codebase, implementation follows this systematic sequence:

```text
Step 1: Design Tokens & CSS Foundations
        └── Update tailwind.config.ts and globals.css with complete semantic tokens,
            typography variables, and custom component utilities.

Step 2: Core Primitive Component Library (src/components/ui/)
        └── Build button.tsx, badge.tsx, card.tsx, input.tsx, select.tsx,
            table.tsx, modal.tsx, sheet.tsx, and stepper.tsx.

Step 3: Global Navigation Shell & Layout (src/components/composite/)
        └── Implement responsive AppSidebar, TopNav, PageHeader, and role-aware navigation.

Step 4: Domain Feature Screens
        ├── Thesis Management Workspace (List, Creation, Detail, Split-pane review)
        ├── Examination Hub (Timetable schedule, Live scoring room rubric)
        ├── Financial Reconciliation & Disbursement (Slip inspector, Committee rates)
        ├── Printing Management Board (Kanban queue, Cost calculator)
        └── Reports & Executive Dashboard (Visual KPI stat cards, charts, export tools)
```

---

*This document serves as the master UI/UX and system design specification for BTMS. All frontend components, page layouts, and user interactions must adhere to these tokens, guidelines, and structural patterns.*

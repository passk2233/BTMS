# Implementation Plan

## Bachelor's Thesis Examination & Financial Management System

**Technology Stack:** Next.js + Go + Supabase
**เอกสารนี้รวม:** แผนงานตาม Phase (เดิม) + Architecture ที่ปรับปรุงแล้ว (Data Boundary, Single Source of Truth, JWT/JWKS, pgx + sqlc, Transaction)

---

## 1. Technology Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js (App Router), TypeScript, Tailwind CSS, React Hook Form, Zod |
| Backend | Go, Gin, **pgx + sqlc** (ไม่ใช้ GORM เป็นหลัก) |
| Platform | Supabase: PostgreSQL, Auth, Storage, Realtime |
| Session | `@supabase/supabase-js` + `@supabase/ssr` (cookie-based) |
| Deployment | Next.js → Vercel, Go API → VPS / Docker, Supabase → Cloud |

---

## 2. System Architecture

```text
                    ┌───────────────────────┐
                    │        Next.js        │
                    │        TypeScript     │
                    └───────────┬───────────┘
                                │
               ┌────────────────┼────────────────┐
               ▼                ▼                ▼
          Supabase Auth     Supabase         Supabase
             / SSR          Storage          Realtime
               │                │                │
               └────────────────┼────────────────┘
                                │ REST (Bearer JWT)
                                ▼
                    ┌───────────────────────┐
                    │       Go + Gin        │
                    ├───────────────────────┤
                    │ Auth Middleware       │
                    │ Thesis Service        │
                    │ Exam Service          │
                    │ Progress Service      │
                    │ Finance Service       │
                    │ Disbursement Service  │
                    │ Printing Service      │
                    │ Report Service        │
                    └───────────┬───────────┘
                                │ pgx + sqlc
                                ▼
                    ┌───────────────────────┐
                    │ Supabase PostgreSQL   │
                    └───────────────────────┘
```

### 2.1 Data Access Boundary

**Next.js → Supabase โดยตรง** (RLS ต้องเปิดและกำหนด policy ครบ)

- Login / Session
- Upload File (Storage)
- Realtime Progress
- อ่าน Profile
- อ่าน Thesis ทั่วไป

**Next.js → Go → PostgreSQL** (Business Logic ทั้งหมด)

| งาน | Go |
|---|:-:|
| Submit / Approve Proposal | ✅ |
| Schedule Exam | ✅ |
| Calculate Score | ✅ |
| Calculate Progress | ✅ |
| Calculate Student Fee | ✅ |
| Calculate Committee Payment | ✅ |
| Disbursement | ✅ |
| Financial Report | ✅ |
| Multi-table Transaction | ✅ |
| Third-party Integration | ✅ |

### 2.2 กฎเรื่องเงิน

**Frontend ห้ามคำนวณยอดเงินแล้วส่งให้ Go** ให้ส่งเฉพาะ ID แล้ว Go คำนวณเอง

```json
{ "exam_id": "EX001" }
```

```text
Exam → Committee → Committee Role → Committee Rate → Calculate Amount → Create Payment
```

### 2.3 Single Source of Truth

> **PostgreSQL Schema เป็น Single Source of Truth**

```text
             PostgreSQL Schema
                    │
          ┌─────────┴─────────┐
          ▼                   ▼
   TypeScript Types          sqlc
   (database.types.ts)   (Go structs + queries)
          │                   │
          ▼                   ▼
       Next.js               Go
```

```bash
supabase gen types typescript \
  --project-id "$PROJECT_REF" \
  --schema public > src/types/database.types.ts
```

---

## 3. Engineering Rules

1. **Migration ต้องอยู่ใน Git** — ไม่แก้ Production DB ด้วยมือ
   ```text
   supabase/migrations/
   ├── 001_initial.sql
   ├── 002_thesis.sql
   ├── 003_exam.sql
   ├── 004_finance.sql
   └── ...
   ```
   Flow: `Developer → Migration → Git → CI/CD → Supabase`
2. **Generated Files ห้ามแก้มือ** — `database.types.ts`, `sqlc/*.go` ให้แก้ Schema / SQL แล้ว generate ใหม่
3. **Financial Operation ต้องอยู่ใน Transaction เดียว**
4. **เก็บจำนวนเงินเป็น `NUMERIC`** (ห้ามใช้ float) และตั้งค่าสกุลเงินให้ชัดเจน
5. **ทุกการเปลี่ยนสถานะสำคัญต้องเขียน `audit_logs`**
6. **RLS เปิดทุกตารางที่ Frontend เข้าถึงได้โดยตรง**

### ตัวอย่าง Transaction: จ่ายเงินกรรมการ

```text
BEGIN
 1. ตรวจ Exam
 2. ตรวจ Committee
 3. อ่าน Rate
 4. Calculate Amount
 5. Create Committee Payment
 6. Create Disbursement
 7. Create Financial Transaction
 8. Write Audit Log
COMMIT   (ผิดขั้นใด → ROLLBACK)
```

---

## 4. Authentication & Authorization

### 4.1 Roles (7 Roles)

```text
ADMIN, STAFF, STUDENT, ADVISOR, COMMITTEE, FINANCE, PRINTING
```

### 4.2 Flow

```text
Next.js → Supabase Login → Access Token
   → Authorization: Bearer <JWT> → Go Middleware
       ├── Verify Signature (JWKS)
       ├── Check exp / iss
       ├── Read sub
       └── Read role / claims
   → Handler (Allow / Deny)
```

- Go ตรวจ JWT ด้วย JWKS โดยไม่ต้องเรียก Auth server ทุก request:
  `https://<project-ref>.supabase.co/auth/v1/.well-known/jwks.json`
- **Decision ก่อนเขียน Middleware:** ตรวจสอบว่า Project ใช้ **asymmetric signing keys** หรือ legacy HS256
  - Asymmetric → verify ด้วย JWKS (cache keys)
  - Legacy HS256 → ใช้แนวทางอื่น (เช่น ตรวจกับ Auth server) ห้ามใช้ JWKS
- Role เก็บใน `profiles`/`roles` table และ Go ตรวจ permission ทุก endpoint

### 4.3 Next.js Session

```bash
npm install @supabase/supabase-js @supabase/ssr
```

ใช้ cookie-based session ผ่าน `@supabase/ssr` กับ Server Component, Client Component และ Middleware

---

## 5. Database Connection (Go)

- Go เป็น long-running Docker server → เชื่อมผ่าน Supabase Pooler และเลือก mode ตาม workload
  (Transaction pooler ใช้ port `6543`; Session mode ใช้รูปแบบอื่น — **ไม่ตายตัวว่า 6543 ถูกเสมอ**)
- กำหนด Pool แบบ explicit:

```go
config, err := pgxpool.ParseConfig(dbURL)
if err != nil {
    return err
}
config.MaxConns = 10 // starting point ปรับตาม workload / quota
config.MinConns = 2

pool, err := pgxpool.NewWithConfig(ctx, config)
```

- หมายเหตุ: Transaction pooler ไม่รองรับ prepared statements บางกรณี — ทดสอบกับ pgx config (`QueryExecModeSimpleProtocol` หากจำเป็น)

---

## 6. Roadmap (20 สัปดาห์)

| Phase | หัวข้อ | สัปดาห์ |
|---|---|---|
| 1 | Requirement | 1–2 |
| 2 | Database Design | 3–4 |
| 3 | Supabase Setup | 5 |
| 4 | Go Backend Foundation | 6–7 |
| 5 | Authentication & Authorization | 7 |
| 6 | Thesis Management | 8–9 |
| 7 | Proposal Examination | 10 |
| 8 | Progress Tracking | 11 |
| 9 | Development Tracking | 11–12 |
| 10 | Final Examination | 13 |
| 11 | Revision & Completion | 14 |
| 12 | Financial Management | 15 |
| 13 | Committee Payment | 15–16 |
| 14 | Printing Management | 16 |
| 15 | Dashboard & Reports | 17 |
| 16 | Notification | 17 |
| 17 | Testing | 18–19 |
| 18 | Deployment | 20 |

---

### Phase 1 — Requirement (Week 1–2)

**Thesis Workflow**

```text
Student → Create Group → Submit Topic → Advisor Review → Proposal Exam
→ Proposal Approved → Development → Final Thesis → Final Exam
→ Revision → Completed
```

**Financial Flow**

```text
Student Payment → Payment Verification → Exam → Committee Payment → Disbursement
```

**Printing Flow**

```text
Printing Request → Calculate Cost → Printing → Completed → Delivered
```

**Deliverables:** SRS, Use Case Diagram, Use Case Specification, System Workflow, Requirement List

---

### Phase 2 — Database Design (Week 3–4)

สร้าง ERD บน Supabase PostgreSQL

| Domain | Tables |
|---|---|
| User | `profiles`, `students`, `teachers`, `roles` |
| Thesis | `theses`, `thesis_members`, `thesis_advisors`, `thesis_files`, `thesis_revisions` |
| Progress | `thesis_stages`, `thesis_progress` |
| Examination | `exam_types`, `exams`, `exam_committees`, `exam_rooms`, `evaluation_criteria`, `evaluation_scores`, `exam_results`, `exam_comments` |
| Finance | `fee_types`, `fee_rates`, `payments`, `payment_details`, `receipts`, `committee_rates`, `committee_payments`, `disbursements`, `financial_transactions` |
| Printing | `printing_rates`, `printing_orders`, `printing_items`, `printing_deliveries` |
| System | `notifications`, `audit_logs` |

**Deliverables:** ERD, Migration files, Seed data (roles, exam types, stages, criteria, rates)

---

### Phase 3 — Supabase Setup (Week 5)

```text
Supabase Project → PostgreSQL → Tables → Foreign Keys → Indexes
→ Storage Buckets → Authentication → RLS
```

**Storage Buckets:** `thesis-files`, `exam-documents`, `payment-proofs`, `financial-documents`

**RLS ตัวอย่าง**

| Role | สิทธิ์ |
|---|---|
| Student | เห็น Thesis ของตัวเอง |
| Advisor | เห็น Thesis ที่ดูแล |
| Committee | เห็นเฉพาะการสอบที่ได้รับแต่งตั้ง |
| Finance | เห็นข้อมูลการเงิน |
| Printing | เห็นคำสั่งพิมพ์ |

**Deliverables:** Supabase project (dev/staging/prod), RLS policies พร้อมทดสอบ, Type generation script

---

### Phase 4 — Go Backend Foundation (Week 6–7)

```text
backend/
├── cmd/server/main.go
├── config/
├── db/
│   ├── queries/        # SQL สำหรับ sqlc
│   └── sqlc/           # generated (ห้ามแก้มือ)
├── repository/
├── service/
├── handler/
├── middleware/
├── routes/
├── utils/
└── storage/
```

**Services:** AuthService, ThesisService, ExamService, ProgressService, FinanceService, DisbursementService, PrintingService, NotificationService, FileService

**Setup:** `sqlc.yaml`, pgxpool, config/env, logging, error handling, health check, Dockerfile

---

### Phase 5 — Authentication & Authorization (Week 7)

- JWT middleware (JWKS + cache)
- Role/permission middleware
- API:

```http
GET  /api/me
GET  /api/users
POST /api/users
PUT  /api/users/:id
```

---

### Phase 6 — Thesis Management (Week 8–9)

Create Group, Add Members, Assign Advisor, Create Thesis, Submit Topic, Review Topic, Approve / Reject / Revision

```http
GET  /api/theses
POST /api/theses
GET  /api/theses/:id
PUT  /api/theses/:id

POST /api/theses/:id/submit
POST /api/theses/:id/review
POST /api/theses/:id/approve
POST /api/theses/:id/revision
```

---

### Phase 7 — Proposal Examination (Week 10)

- Exam Date / Time / Room / Committee
- Evaluation Criteria, Scores, Comments
- Result: `PASS`, `PASS_WITH_REVISION`, `FAIL`
- Go คำนวณคะแนนและผลสอบ (Frontend ไม่ส่งผลสรุปมาเอง)

---

### Phase 8 — Progress Tracking (Week 11)

```text
✓ Topic
✓ Review
✓ Proposal Exam
✓ Proposal Approved
● Development
○ Final Exam
○ Revision
○ Completed

Progress ████████████░░░░░░░ 60%
```

- Go คำนวณ Progress → เขียน DB → Frontend รับผ่าน **Supabase Realtime**
- Dashboard: Total Groups, Proposal Exam, Development, Final Exam, Revision, Completed

---

### Phase 9 — Development Tracking (Week 11–12)

```text
Development
├── Requirement
├── Analysis
├── System Design
├── Database
├── Backend
├── Frontend
├── Integration
└── Testing
```

Advisor อัปเดตสถานะ: `Not Started` / `In Progress` / `Completed`

---

### Phase 10 — Final Examination (Week 13)

```text
Final Thesis Submission → Schedule Final Exam → Committee Review
→ Product Demonstration → Evaluation → Result
```

เกณฑ์แยกจาก Proposal: Product, Functionality, Testing, Thesis Content, Presentation, Q&A

---

### Phase 11 — Revision & Completion (Week 14)

```text
Final Exam → Revision Required → Student Upload Revision
→ Advisor / Committee Review → Approved → Completed
```

Versioning: `thesis_v1.pdf`, `thesis_v2.pdf`, `thesis_final.pdf` (เก็บใน `thesis_revisions`)

---

### Phase 12 — Financial Management (Week 15)

- Fee types: Proposal Exam, Final Exam, Printing, Binding, Other
- ระบบคำนวณ Total / Paid / Remaining
- Status: `UNPAID` → `PARTIAL` → `PAID` → `VERIFIED`
- อัปโหลดหลักฐานการชำระ → Finance ตรวจสอบ → ออก Receipt

---

### Phase 13 — Committee Payment (Week 15–16)

```text
Exam → Committee List → Committee Role → Committee Rate
→ Payment Amount → Disbursement
```

ตัวอย่าง (สกุลเงินตามที่กำหนดในระบบ)

```text
Chairman       150,000
Committee 1    100,000
Committee 2    100,000
Total          350,000
```

Status: `PENDING` → `APPROVED` → `PAID`
ใช้ Transaction ตามข้อ 3

---

### Phase 14 — Printing Management (Week 16)

- Request: จำนวนเล่ม, จำนวนหน้า, สี/ขาวดำ, เข้าเล่ม
- Calculate Cost (Go) → Printing → Completed → Delivered
- Dashboard ฝ่ายพิมพ์: Pending / Printing / Completed / Delivered

---

### Phase 15 — Dashboard & Reports (Week 17)

- **Admin/Staff:** Total Thesis, Proposal Stage, Development, Final Exam, Revision, Completed
- **Finance:** Total Income, Committee Payment, Printing Expense, Other Expense, Balance
- **Reports:** Thesis, Exam, Student, Financial, Committee Payment, Printing
- **Export:** PDF, Excel, CSV

---

### Phase 16 — Notification (Week 17)

- Supabase Realtime สำหรับอัปเดตหน้าเว็บทันที
- เหตุการณ์: Proposal Approved, Exam Scheduled, Payment Verified, Revision Required, Thesis Completed
- Web Push เพิ่มภายหลัง

---

### Phase 17 — Testing (Week 18–19)

**Unit Test:** Score, Progress, Fee, Committee Payment, Printing Cost, Permission

**Integration Test:** Student → Proposal → Proposal Exam → Development → Final Exam → Revision → Completed → Finance → Committee Payment → Printing

**เพิ่มเติม:** RLS test, Transaction rollback test, JWT verification test (expired / wrong issuer / wrong role)

---

### Phase 18 — Deployment (Week 20)

```text
                Internet
                   │
        ┌──────────┴──────────┐
        ▼                     ▼
     Vercel               Go Server (Docker)
     Next.js                  │
        └──────────┬──────────┘
                   ▼
               Supabase
         (PostgreSQL / Storage / Auth)
```

- CI/CD: run migrations → sqlc generate check → tests → deploy
- Environments: dev / staging / production
- Backup, monitoring, secrets management, CORS

---

## 7. Project Structures

### Next.js

```text
src/
├── app/
│   ├── login/
│   ├── dashboard/
│   ├── thesis/
│   ├── examination/
│   ├── progress/
│   ├── finance/
│   ├── disbursement/
│   ├── printing/
│   ├── reports/
│   └── users/
├── components/
├── services/       # เรียก Go API
├── hooks/
├── types/          # database.types.ts (generated)
├── lib/            # supabase client (ssr)
└── utils/
```

### Go API Routes

```text
/api
├── auth        ├── payments
├── users       ├── fees
├── students    ├── disbursements
├── teachers    ├── printing
├── theses      ├── files
├── progress    ├── notifications
├── exams       └── reports
└── evaluation
```

---

## 8. Final System Modules

1. Authentication
2. User Management
3. Thesis & Group Management
4. Proposal Examination
5. Development Tracking
6. Final Examination
7. Revision Management
8. Progress Tracking
9. Financial Management
10. Committee Payment & Disbursement
11. Printing Management
12. Document Management
13. Notification
14. Dashboard & Reports
15. Audit Log

---

## 9. Recommended Build Order

```text
Database → Authentication → Thesis/Group → Proposal → Proposal Exam
→ Progress → Development → Final Exam → Revision → Finance
→ Committee Payment → Printing → Reports → Notification
```

---

## 10. Risks & Decisions to Resolve Early

| ประเด็น | การตัดสินใจ |
|---|---|
| JWT signing keys (asymmetric vs legacy HS256) | เลือกก่อนเขียน Go middleware |
| Pooler mode / MaxConns | ทดสอบกับ workload จริง |
| RLS vs Go permission ซ้ำซ้อน | กำหนดว่า RLS = ป้องกันชั้นข้อมูล, Go = ป้องกันชั้น Business |
| สกุลเงิน / rounding rule | กำหนดใน Requirement Phase |
| Rate เปลี่ยนตามเวลา | เก็บ rate ที่ใช้ ณ เวลาคำนวณไว้ใน payment record |

---

## 11. Summary

- **Supabase** = PostgreSQL + Auth + Storage + Realtime
- **Go** = ควบคุม Business Logic, การเงิน, Transaction ทั้งหมด
- **Next.js** = UI + Login/Session/Storage/Realtime โดยตรงกับ Supabase และเรียก Go สำหรับ workflow สำคัญ
- **PostgreSQL Schema** = Single Source of Truth → generate TypeScript types และ sqlc

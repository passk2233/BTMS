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

### 4.1 Roles (2 Core Roles — Equal Administrative & Academic Capabilities)

```text
STAFF (ພະນັກງານວິຊາການ), HEAD (ຫົວໜ້າພາກວິຊາ)
```

- ທັງສອງບົດບາດມີສິດທິຄົບຖ້ວນເທົ່າທຽມກັນໃນລະບົບ (Staff and Head can do everything the same).
- ນັກສຶກສາ ແລະ ອາຈານບໍ່ຈຳເປັນຕ້ອງມີບັນຊີເຂົ້າລະບົບໂດຍກົງ ແຕ່ດຳເນີນງານຜ່ານ Staff/Head ເປັນຜູ້ບັນທຶກ.

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

**Thesis Workflow (ຂະບວນການດຳເນີນງານລະບົບ)**

```text
Step 1: Student Intake & Group Numbering (ລົງທະບຽນບົດ & ອອກເລກກຸ່ມ)
        • รับข้อมูล: ชื่อหัวข้อ (ลาว + อังกฤษ), นักศึกษา (สูงสุด 3 คนต่อกลุ่ม รองรับต่างห้องเรียนและนักศึกษาตกทุน/ค้างปี), อาจารย์ที่ปรึกษา
        • ประเภทหัวข้อ (Category): DATABASE / IOT / NETWORK / MEDIA
        • แนบ/อัปโหลดเอกสารยืนยันจากอาจารย์ที่ปรึกษา (ໃບຢັ້ງຢືນການຕົກລົງເປັນທີ່ປຶກສາ)
        • ระบบออกเลขกลุ่ม (Group Number)
        • รายการและตารางรายงาน: ສາມາດຈັດຮຽງຕາມເລກກຸ່ມ (Group No.) ຫຼື ຈັດຮຽງຕາມຊື່ອາຈານທີ່ປຶກສາ (Sort by Advisor Name)
        • พิมพ์แบบฟอร์มรายงานทางการเพื่อเสนอลงนามยืนยันจากหัวหน้าภาควิชา (Print to confirm from Head of Department)
          (กรองหรือจัดกลุ่มตามประเภทหัวข้อได้)

Step 2: Proposal Submission & Examination Permission (ຍື່ນໂຄງຮ່າງ + ໃບສະເໜີສອບ + ຄ່າທຳນຽມ)
        • นักศึกษายื่นเล่ม Proposal ฉบับ Hard Copy
        • ยื่นเอกสารขออนุญาตเข้าสอบ (Paper for permission to be in test / ໃບສະເໜີຂໍສອບປ້ອງກັນ) ฉบับ Hard Copy
        • ชำระค่าธรรมเนียมการสอบ (Pay Fee)
        • เจ้าหน้าที่ (Staff/Head) บันทึกลงระบบเว็บ: บันทึกรับเล่ม Hard Copy, ยืนยันใบอนุญาตสอบ และบันทึกการชำระเงิน
        • กลุ่มต้องครบทั้ง 3 อย่าง (เล่ม + ใบขอสอบ + ค่าธรรมเนียม) จึงจะจัดเข้าตารางสอบได้

Step 3: Exam Schedule Generation & Committee Allocation (ຈັດຕາຕະລາງສອບ & ກຳມະການ)
        • จัดตารางภายใน "รอบสอบ" (Exam Round) ของปีการศึกษา (ดู Step 5)
        • ระบบสร้างตารางสอบอัตโนมัติ (วัน, เวลา, ห้องสอบ, คณะกรรมการ)
        • ห้องสอบแยกตามประเภท: ในรอบหนึ่ง แต่ละห้องรับเฉพาะหัวข้อประเภทเดียว (DATABASE / IOT / NETWORK / MEDIA)
        • กรรมการ 3 คนต่อกลุ่ม: ประธาน 1 คน (CHAIRMAN) + กรรมการ 2 คน (COMMITTEE)
          - เลือกจากอาจารย์ที่มีความเชี่ยวชาญตรงกับประเภทหัวข้อ (อาจารย์ 1 คนมีความเชี่ยวชาญได้หลายประเภท)
        • กฎเหล็ก (Critical Invariant): **อาจารย์ที่ปรึกษาห้ามเป็นกรรมการสอบของกลุ่มตนเองเด็ดขาด** (Must have NO advisor as a committee member)
        • กรรมการ 1 คนอยู่ 2 ห้องในเวลาเดียวกันไม่ได้
        • ระบบรองรับการปรับเปลี่ยน (Manual Adjustment) เมื่อกรรมการท่านใดติดภารกิจ/ไม่ว่างในช่วงเวลานั้น (Can adjust for not free at that time)
        • พิมพ์ตารางสอบเพื่อเสนอ Head ลงนาม

Step 4: Score Recording Paper Printing (ພິມໃບຄະແນນ & ໃບຕັດສິນຜົນການສອບ)
        • ระบบสั่งพิมพ์กระดาษบันทึกคะแนนและใบตัดสินผลการสอบ (Rubric Score Sheet) แบบว่าง 1 ใบต่อกรรมการ 1 คน (3 ใบต่อกลุ่ม)
        • มีช่องให้คะแนนตามเกณฑ์ (Criteria Rubric)
        • มีช่องบันทึกผลตัดสิน: ຜ່ານ (Pass) / ບໍ່ຜ່ານ (Not Pass / Fail)
        • มีช่องสำหรับกรรมการเขียนความเห็นและข้อเสนอแนะในการแก้ไข (In score paper will have comment section)

Step 5: Proposal Defense Evaluation & Multi-Attempt Retake Rules (ການສອບ & ສອບຄືນ)
        • กรรมการให้คะแนนและเขียนผลตัดสินลงใบกระดาษระหว่างสอบ
        • หลังสอบ Staff/Head ป้อนข้อมูลเข้าระบบ:
          - คะแนนรายเกณฑ์ของกรรมการแต่ละคน + ความเห็น
          - ผลตัดสินของคณะกรรมการ: PASS / FAIL
        • **คะแนนกับผลตัดสินแยกกัน:** ระบบไม่คำนวณผ่าน/ไม่ผ่านจากคะแนน
          คะแนนสูงแต่กรรมการตัดสินไม่ผ่าน = ไม่ผ่าน (คะแนนเก็บไว้เพื่อรายงานเท่านั้น)
        • รอบสอบ (Exam Rounds):
          - แต่ละปีการศึกษาเปิดรอบสอบตามความเหมาะสม จำนวนรอบไม่ตายตัว
          - แต่ละรอบเป็นช่วง Proposal หรือช่วง Final เช่น Proposal รอบ 1, 2 / Final รอบ 1, 2, 3
          - รอบสอบไม่ผูกกับประเภทการสอบ: กลุ่มที่ยังไม่ผ่าน Proposal สอบ Proposal ในช่วงรอบ Final ได้
            (ตัวอย่าง: สอบ Proposal ใน Final รอบ 1 แล้วสอบ Final ใน Final รอบ 3)
        • กฎการสอบซ่อม (Retake Policy):
          - สอบไม่ผ่าน → สอบใหม่ในรอบถัดไป ไม่จำกัดจำนวนครั้ง (attempt 1, 2, 3, ...)
          - การสอบซ่อม (attempt ≥ 2) กลุ่มจ่ายเฉพาะค่าธรรมเนียมสอบซ่อม (ไม่ต้องจ่ายค่าธรรมเนียมปกติซ้ำ) บันทึกแยกประเภท
            และกรรมการที่คุมสอบซ่อมได้เงินเพิ่ม (ดู Step 8)
          - ถ้าหมดรอบในปีการศึกษานั้น → ยกไปสอบในปีการศึกษาถัดไป

Step 6: Proposal Revision based on Comments & Hardcopy Resubmission (ແກ້ໄຂບົດຕາມຄຳເຫັນ & ສົ່ງ Hard Copy)
        • นักศึกษานำความเห็นและข้อเสนอแนะจากใบให้คะแนน (Score paper comments) ไปแก้ไขเล่ม Proposal
        • ส่งเล่ม Proposal ฉบับแก้ไขเป็น Hard Copy
        • เจ้าหน้าที่ตรวจสอบและบันทึกอนุมัติเล่มแก้ไขลงระบบ เพื่อเข้าสู่ระยะพัฒนา (Development Phase)

Step 7: Final Defense Phase — Identical to Proposal Flow (ການສອບບົດຈົບຊັ້ນຂັ້ນສຸດທ້າຍ)
        • ดำเนินการเหมือนรอบ Proposal ทุกประการ:
          - ยื่นเล่ม Final Thesis Hard Copy + ใบอนุญาตสอบ + ชำระค่าธรรมเนียม
          - บันทึกลงระบบ -> จัดตารางสอบ (อาจารย์ที่ปรึกษาห้ามเป็นกรรมการ, ปรับเปลี่ยนได้หากกรรมการไม่ว่าง)
          - พิมพ์ใบให้คะแนนพร้อมช่อง Comment
          - สอบตัดสิน (ไม่ผ่าน → สอบซ่อมในรอบถัดไปตามกฎเดียวกับ Proposal)
          - แก้ไขตาม Comment และส่งเล่มสมบูรณ์ (Hard Copy) เพื่อสำเร็จการศึกษา

Step 8: Money Distribution (ແບ່ງເງິນຫຼັງການສອບ)
        • จ่ายจากค่าธรรมเนียมสอบที่เก็บได้ (ค่าธรรมเนียมปกติ + ค่าธรรมเนียมสอบซ่อม บันทึกแยกประเภทกัน) แบ่งเป็น 3 ส่วน:
          - ค่ากรรมการสอบ — จ่ายทุกรอบสอบ ตามตำแหน่ง (ประธาน / กรรมการ) × จำนวนกลุ่มที่คุมสอบ
            กลุ่มที่เป็นการสอบซ่อม: กรรมการได้ค่ากรรมการปกติ + เงินเพิ่มสอบซ่อม
            (ยอดคงที่ต่อกลุ่มตามตำแหน่ง เท่ากันทุกครั้งที่สอบซ่อม ครั้งที่ 2, 3, 4, ...)
          - ค่าอาหารว่าง — เหมาจ่ายต่อรอบสอบ (ยอดเดียวต่อ 1 รอบ)
          - ค่าแรงผู้รับผิดชอบ — จ่าย 2 ครั้งต่อปีการศึกษา (ปิดช่วง Proposal / ปิดช่วง Final) ไม่ขึ้นกับจำนวนรอบ
            ฐานเงิน = (ค่าธรรมเนียมปกติ + ค่าธรรมเนียมสอบซ่อมของช่วงนั้น) − ค่ากรรมการทุกรอบในช่วง (รวมเงินเพิ่มสอบซ่อม) − ค่าอาหารว่างทุกรอบในช่วง
            ผู้รับผิดชอบกำหนดใหม่ทุกช่วง แต่ละคนได้ % ไม่เท่ากัน: ค่าแรง = ฐานเงิน × % ของคนนั้น
        • Head อนุมัติ → จ่ายเงิน → บันทึก audit log
```

**Financial Flow**

```text
Student Payment (ปกติ / สอบซ่อม แยกประเภท) → Payment Verification
→ ทุกรอบสอบ:          Committee Fee (+ Retake Bonus) + Round Snack (เหมา)
→ ปิดช่วง Proposal/Final: Staff Wage = (ค่าธรรมเนียม − ค่ากรรมการ − ค่าอาหารว่าง) × % รายคน
→ Head Approval → Disbursement
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
| Category | `thesis_categories` (DATABASE, IOT, NETWORK, MEDIA), `teacher_expertise` (teacher ↔ category, หลายต่อหลาย) |
| Examination | `exam_types`, `exam_rounds` (ปีการศึกษา, ช่วง PROPOSAL/FINAL, รอบที่), `exams` (+ `round_id`, `attempt_no`), `exam_committees` (CHAIRMAN ×1, COMMITTEE ×2), `exam_rooms`, `exam_round_rooms` (ห้อง ↔ ประเภท ในแต่ละรอบ), `evaluation_criteria`, `evaluation_scores`, `exam_comments` |
| Finance | `fee_types`, `fee_rates`, `payments`, `payment_details`, `receipts`, `committee_rates` (ตำแหน่ง CHAIRMAN / COMMITTEE × ปกติ / สอบซ่อม ต่อกลุ่ม), `round_snack_budgets` (ยอดเหมาต่อรอบ), `staff_wage_periods` (ปีการศึกษา + ช่วง PROPOSAL/FINAL + ฐานเงินที่คำนวณได้), `staff_wage_assignments` (ผู้รับผิดชอบ + หน้าที่ + % ต่อช่วง), `payouts`, `disbursements`, `financial_transactions` |
| Printing | `printing_rates`, `printing_orders`, `printing_items`, `printing_deliveries` |
| System | `notifications`, `audit_logs` |

> [!NOTE]
> `theses.category_code` อ้างอิง `thesis_categories`; ผลสอบ `exams.result` เป็นผลตัดสินของคณะกรรมการ (PASS / FAIL) ที่ป้อนเอง ไม่ได้คำนวณจาก `evaluation_scores`

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

- **Intake Verification:** Hardcopy Proposal + Examination Permission Paper + Fee payment recorded by Staff/Head
- **Scheduling Engine (ภายใน Exam Round):**
  - Automated room, time, date, and committee generation
  - Room is bound to one category per round; theses go to the room of their category
  - Committee = 1 CHAIRMAN + 2 COMMITTEE, chosen from teachers whose expertise includes the thesis category
  - No teacher in two rooms at the same time slot
  - **Critical Rule:** Advisor is strictly excluded from the examination committee (`advisor_id != committee_teacher_id`)
  - **Schedule Adjustment:** Interface for Staff/Head to reassign committee or reschedule when members are unavailable
- **Printable Proposal Score Sheet (ໃບໃຫ້ຄະແນນການປ້ອງກັນ ຫົວຂໍ້ບົດໂຄງການຈົບຊັ້ນ):**
  - Official university rubric criteria (Total = 60 points):
    1. ຄວາມຍາກງ່າຍຫຼືນະວັດຕະກຳ (Difficulty / Innovation): **5**
    2. ເນື້ອໃນບົດທີ 1 (Chapter 1 Content - Background, Scope): **10**
    3. ເນື້ອໃນບົດທີ 2 (Chapter 2 Content - Literature Review): **8**
    4. ເນື້ອໃນບົດທີ 3 (Chapter 3 Content - Methodology & Design): **20**
    5. ຄະແນນການນຳສະເໜີ (Presentation): **7**
    6. ຄະແນນການຕອບຄຳຖາມ (Q&A): **10**
  - Pass / Not Pass checkboxes: `[ ] ຜ່ານ` / `[ ] ບໍ່ຜ່ານ`
  - Perforated tear line (`✂ ຮອຍຈີກ`)
  - Bottom half: `ໃບໃຫ້ຄຳເຫັນການປ້ອງກັນບົດໂຄງການຈົບຊັ້ນ` with structured lined comments box & committee signature
- **Evaluation & Multi-Attempt Retake Logic:**
  - Staff enters per-committee scores + comments from the paper sheets after the exam
  - Staff enters the committee decision: `PASS` / `FAIL` (independent of scores)
  - Fail → schedule a new attempt (`attempt_no + 1`) in any later round, unlimited
  - No round left in the academic year → carry over to next year's rounds
  - A PROPOSAL exam may be scheduled in a FINAL-period round
- **Revision & Hardcopy Resubmission:**
  - Students review committee comments from the score paper to fix proposal
  - Submit revised hardcopy for Staff/Head verification before entering development
- Go คำนวณสรุปคะแนน (เพื่อรายงาน) แต่ผลผ่าน/ไม่ผ่านมาจากผลตัดสินของกรรมการที่ป้อนเข้าระบบ

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

- **Workflow Identical to Proposal Examination:**
  - **Intake:** Final Thesis Hard Copy + Examination Permission Paper + Final Fee payment recorded by Staff/Head
  - **Scheduling:** Automated room, time, date, and committee allocation with strict advisor exclusion (`advisor != committee`), with manual schedule adjustments for committee conflicts
  - **Score Paper Printing (ໃບໃຫ້ຄະແນນການປ້ອງກັນ ບົດໂຄງການຈົບຊັ້ນ):**
    - Official university final rubric criteria (Total = 60 points):
      1. ເນື້ອໃນບົດທີ 4: **7**
      2. ເນື້ອໃນບົດທີ 5: **5**
      3. ຄວາມສົມບູນຂອງເອກະສານ: **8**
      4. Poster: **3**
      5. ຄວາມສົມບູນຂອງຊິ້ນງານ: **10**
      6. ຄະແນນການນຳສະເໜີ: **10**
      7. ຕອບຄຳຖາມ: **17**
    - Pass / Not Pass checkboxes: `[ ] ຜ່ານ` / `[ ] ບໍ່ຜ່ານ`
    - Perforated tear line (`✂ ຮອຍຈີກ`)
    - Bottom half: `ໃບໃຫ້ຄຳເຫັນການປ້ອງກັນ ບົດໂຄງການຈົບຊັ້ນ` with structured lined comments box & committee signature
  - **Deliberation & Retake Policy:** committee decision PASS / FAIL (independent of scores); Fail → retake in a later round, unlimited, carry over to next academic year if no rounds remain
  - **Revision:** Students fix thesis based on comments and submit final approved hardcopy for graduation

---

### Phase 11 — Revision & Completion (Week 14)

```text
Final Exam → Revision Required → Student Upload Revision
→ Advisor / Committee Review → Approved → Completed
```

Versioning: `thesis_v1.pdf`, `thesis_v2.pdf`, `thesis_final.pdf` (เก็บใน `thesis_revisions`)

---

### Phase 12 — Financial Management (Week 15)

- Fee types: Proposal Exam, Proposal Retake, Final Exam, Final Retake, Printing, Binding, Other
- ค่าธรรมเนียมสอบซ่อม (attempt ≥ 2) เป็นรายการแยก ผูกกับ `exam_id` ของครั้งที่สอบซ่อม และแสดงแยกในรายงาน
  - กลุ่มจ่ายเฉพาะค่าสอบซ่อม (ไม่เก็บค่าธรรมเนียมปกติซ้ำ) ยอดเท่ากันทุกครั้งที่สอบซ่อม
  - นับรวมในฐานเงินค่าแรงผู้รับผิดชอบ
- ระบบคำนวณ Total / Paid / Remaining
- Status: `UNPAID` → `PARTIAL` → `PAID` → `VERIFIED`
- อัปโหลดหลักฐานการชำระ → Finance ตรวจสอบ → ออก Receipt

---

### Phase 13 — Committee Payment (Week 15–16)

```text
1) ค่ากรรมการ (หลังจบแต่ละรอบสอบ)
   Exams in Round → Committee → Role (CHAIRMAN / COMMITTEE) → Committee Rate
   ถ้า exam นั้น attempt_no ≥ 2 → + Retake Bonus ยอดคงที่ต่อกลุ่มตามตำแหน่ง (เท่ากันทุกครั้งที่ซ่อม, แยกเป็นอีกรายการใน payouts)

2) ค่าอาหารว่าง (หลังจบแต่ละรอบสอบ)
   Round → ยอดเหมาของรอบนั้น (1 รายการต่อรอบ)

3) ค่าแรงผู้รับผิดชอบ (2 ครั้งต่อปีการศึกษา: ปิดช่วง Proposal / ปิดช่วง Final)
   ฐานเงิน = ค่าธรรมเนียมที่เก็บในช่วงนั้น
            − ค่ากรรมการของทุกรอบในช่วง
            − ค่าอาหารว่างของทุกรอบในช่วง
   ผู้รับผิดชอบแต่ละคน = ฐานเงิน × % ของคนนั้น (กำหนดรายชื่อและ % ใหม่ทุกช่วง)
   เงินที่เหลือจากการแบ่ง = เงินคงเหลือของภาควิชา

→ Payouts → Head Approval → Disbursement
```

ตัวอย่างค่ากรรมการต่อ 1 กลุ่ม (สกุลเงินตามที่กำหนดในระบบ)

```text
Chairman       150,000
Committee 1    100,000
Committee 2    100,000
Total          350,000
```

- เก็บ rate / ยอดเหมา / % ที่ใช้ ณ เวลาคำนวณไว้ใน `payouts` (เปลี่ยนภายหลังไม่กระทบยอดเดิม)
- คำนวณ % ด้วย `NUMERIC` และกำหนด rounding rule ให้ชัด
- Validation: % รวมของผู้รับผิดชอบในช่วงเดียวกันต้องไม่เกิน 100%; ถ้าฐานเงิน ≤ 0 ไม่สร้างรายการค่าแรงและแจ้งเตือน Head
- คำนวณค่าแรงได้เมื่อทุกรอบในช่วงนั้นปิดแล้ว และค่ากรรมการ/ค่าอาหารว่างของทุกรอบถูกคำนวณครบแล้ว

Status: `PENDING` → `APPROVED` → `PAID`
ใช้ Transaction ตามข้อ 3

---

### Phase 14 — Printing Management (Week 16)

- Request: จำนวนเล่ม, จำนวนหน้า, สี/ขาวดำ, เข้าเล่ม
- Calculate Cost (Go) → Printing → Completed → Delivered
- Dashboard ฝ่ายพิมพ์: Pending / Printing / Completed / Delivered

---

### Phase 15 — Dashboard & Reports (Week 17)

- **Academic Year Cohort Metrics (ຈຳນວນກຸ່ມສົກຮຽນນີ້):**
  - แสดงจำนวนกลุ่มทั้งหมดในแต่ละปีการศึกษา (เช่น สกฮຽນ 2025–2026: 42 กลุ่ม, 124 นักศึกษา)
  - จำแนกตามห้องเรียน/สาขา (4IT1, 4IT2, 4IT3, 2IT-CON, 4Com2) และตัวกรองเลือกปีการศึกษา
- **Proposal Defense Pipeline & Audit Section (ຕິດຕາມຂະບວນການສອບໂຄງຮ່າງ):**
  1. **Sent Document & Hard Copy Book (ກຸ່ມທີ່ສົ່ງເອກະສານ & ເຫຼັ້ມແລ້ວ):**
     - ตรวจสอบการส่งเล่ม Hard Copy Proposal, ใบเสนอขอเข้าสอบ (Permission Paper), และสลิปชำระค่าธรรมเนียมสอบ
     - อัตราส่วนและเปอร์เซ็นต์ (เช่น 36/42 กลุ่ม, ค้างส่ง 6 กลุ่ม)
  2. **Passed Proposal Defense (ກຸ່ມທີ່ສອບຜ່ານໂຄງຮ່າງ):**
     - ตรวจสอบสถานะการสอบผ่านทั้งรอบปกติ (Round 1) และรอบสอบแก้ตัว (Retake 2 / Retake 3)
     - อัตราส่วนและคะแนนสอบเต็ม 60 คะแนน (เช่น 28/32 กลุ่มสอบผ่าน, ต้องสอบแก้ตัว 4 กลุ่ม)
     - ดูความเห็นและข้อเสนอแนะของกรรมการจากใบลงคะแนน (`ໃບໃຫ້ຄຳເຫັນການປ້ອງກັນ`)
  3. **Sent Hard Copy Book After Fix from Comments (ກຸ່ມທີ່ສົ່ງເຫຼັ້ມແກ້ໄຂຕາມຄຳເຫັນກຳມະການແລ້ວ):**
     - ติดตามการนำคอมเมนต์จากใบให้คะแนนไปปรับปรุงเล่ม และส่งเล่ม Hard Copy ฉบับแก้ไขให้ภาควิชา
     - ตรวจสอบลายเซ็นรับรองของอาจารย์ที่ปรึกษา (Advisor Endorsement Signature)
     - อัตราส่วนและกำหนดเวลาส่งเล่มแก้ไข (เช่น 22/28 กลุ่มที่ผ่านส่งแล้ว, ค้างส่ง 6 กลุ่ม)
- **Finance Dashboard:** Total Income, Committee Payment, Printing Expense, Other Expense, Balance
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
| ค่าอาหารว่าง | ✅ เหมาจ่ายต่อรอบสอบ |
| ค่าแรงผู้รับผิดชอบ | ✅ (ค่าธรรมเนียมช่วงนั้น − ค่ากรรมการ − ค่าอาหารว่าง) × % รายคน, จ่าย 2 ครั้งต่อปี, รายชื่อและ % กำหนดใหม่ทุกช่วง |
| ค่าธรรมเนียมนับเข้าช่วงไหน | สมมติฐาน: นับตามช่วงของรอบที่กลุ่มนั้นเข้าสอบ (เช่น สอบ Proposal ในรอบ Final → นับเข้าช่วง Final) — รอยืนยัน |
| อาจารย์ไม่พอในประเภทเดียว | ถ้าอาจารย์ที่เชี่ยวชาญมีไม่ถึง 3 คน (หลังตัดอาจารย์ที่ปรึกษา) ให้ Staff เลือกด้วยมือ |

---

## 11. Summary

- **Supabase** = PostgreSQL + Auth + Storage + Realtime
- **Go** = ควบคุม Business Logic, การเงิน, Transaction ทั้งหมด
- **Next.js** = UI + Login/Session/Storage/Realtime โดยตรงกับ Supabase และเรียก Go สำหรับ workflow สำคัญ
- **PostgreSQL Schema** = Single Source of Truth → generate TypeScript types และ sqlc

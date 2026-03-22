# Manual Testing Guide — Hostel Pro

Comprehensive manual testing checklist for QA verification. Covers all user roles, pages, API endpoints, edge cases, and cross-cutting concerns.

**Test Environment**: `http://localhost:3000` (dev server via `bun run dev`)
**Mock Mode**: All 3rd-party services default to mock — no external API keys needed.
**Mock OTP Code**: `123456` (accepted in mock SMS mode)

---

## Table of Contents

1. [Test Accounts & Roles](#1-test-accounts--roles)
2. [Public Pages (No Auth)](#2-public-pages-no-auth)
3. [Authentication & OTP](#3-authentication--otp)
4. [Student Dashboard & Features](#4-student-dashboard--features)
5. [Superintendent Dashboard & Features](#5-superintendent-dashboard--features)
6. [Trustee Dashboard & Features](#6-trustee-dashboard--features)
7. [Accounts Dashboard & Features](#7-accounts-dashboard--features)
8. [Parent Portal](#8-parent-portal)
9. [Application Flow (End-to-End)](#9-application-flow-end-to-end)
10. [Room Allocation Flow](#10-room-allocation-flow)
11. [Fee & Payment Flow](#11-fee--payment-flow)
12. [Leave Management Flow](#12-leave-management-flow)
13. [Document Management](#13-document-management)
14. [Interview Scheduling](#14-interview-scheduling)
15. [Notifications System](#15-notifications-system)
16. [Configuration Management](#16-configuration-management)
17. [Compliance & Audit](#17-compliance--audit)
18. [Exit & Clearance Flow](#18-exit--clearance-flow)
19. [Renewal Flow](#19-renewal-flow)
20. [API Direct Testing (curl/Postman)](#20-api-direct-testing-curlpostman)
21. [Security Testing](#21-security-testing)
22. [i18n / Language Testing](#22-i18n--language-testing)
23. [Responsive & Cross-Browser](#23-responsive--cross-browser)
24. [Error Handling & Edge Cases](#24-error-handling--edge-cases)
25. [Performance & Load](#25-performance--load)
26. [Accessibility Testing](#26-accessibility-testing)
27. [Device Session Management](#27-device-session-management)
28. [Financial Reconciliation](#28-financial-reconciliation)
29. [Timezone & Date Handling](#29-timezone--date-handling)
30. [DPDP Compliance & Data Lifecycle](#30-dpdp-compliance--data-lifecycle)
31. [Clearance Workflow (Detailed)](#31-clearance-workflow-detailed)

---

## 1. Test Accounts & Roles

Seed the database first: `DATABASE_URL=... bun run src/test/seed.ts`

| Role | Description | Key Permissions |
|------|-------------|-----------------|
| STUDENT | Hostel resident | View own data, apply for leave, pay fees, upload docs |
| SUPERINTENDENT | Hostel manager (per vertical) | Manage leaves, rooms, applications for their vertical |
| TRUSTEE | Board member | Approve applications, conduct interviews, view all data |
| ACCOUNTS | Finance staff | Manage fees, view payment reports, reconciliation |
| PARENT | Guardian | Read-only view of linked student's data |

---

## 2. Public Pages (No Auth)

These pages must load without any authentication.

### 2.1 Landing & Information Pages

| # | Test | Steps | Expected |
|---|------|-------|----------|
| 2.1.1 | Home page loads | Navigate to `/` | Page renders with hostel info, navigation visible |
| 2.1.2 | About page | Navigate to `/about` | Institution information displayed |
| 2.1.3 | Contact page | Navigate to `/contact` | Contact details and/or form visible |
| 2.1.4 | FAQ page | Navigate to `/faq` | FAQ items visible, expandable if accordion |
| 2.1.5 | Facilities page | Navigate to `/facilities` | Facility descriptions and images load |
| 2.1.6 | Gallery page | Navigate to `/gallery` | Images load correctly, grid/carousel works |
| 2.1.7 | Donations page | Navigate to `/donations` | Donation information visible |
| 2.1.8 | Trustees page | Navigate to `/trustees` | Trustee profiles/names displayed |
| 2.1.9 | News page | Navigate to `/news` | News items/announcements visible |
| 2.1.10 | DPDP Policy | Navigate to `/dpdp-policy` | Privacy policy text renders fully |
| 2.1.11 | Design system | Navigate to `/design-system` | Component showcase loads |

### 2.2 Application Flow (Public)

| # | Test | Steps | Expected |
|---|------|-------|----------|
| 2.2.1 | Apply landing | Navigate to `/apply` | Three verticals shown: Boys Hostel, Girls Ashram, Dharamshala |
| 2.2.2 | Boys Hostel form | Click Boys Hostel → fill contact → fill form | Multi-step form works, validation on each step |
| 2.2.3 | Girls Ashram form | Click Girls Ashram → fill contact → fill form | Same flow, different vertical |
| 2.2.4 | Dharamshala form | Click Dharamshala → fill contact → fill form | Same flow, different vertical |
| 2.2.5 | OTP verification | Fill phone → verify OTP (123456) | Verification step accepts mock OTP |
| 2.2.6 | Form submission | Complete all steps → submit | Success page shown with tracking number |
| 2.2.7 | Track application | Navigate to `/track` → enter tracking number + mobile | Application status displayed |
| 2.2.8 | Track invalid number | Enter non-existent tracking number | Error message shown, no crash |
| 2.2.9 | Institutions page | Navigate to `/institutions/[id]` | Institution details load |
| 2.2.10 | Admissions page | Navigate to `/admissions/[id]` | Admission info renders |

### 2.3 Public API Endpoints

| # | Test | Steps | Expected |
|---|------|-------|----------|
| 2.3.1 | Health check | `GET /api/health` | `{ status: "healthy", database: "connected" }` |
| 2.3.2 | Leave types | `GET /api/config/leave-types` | Returns `{ data: [...] }` |
| 2.3.3 | Blackout dates | `GET /api/config/blackout-dates` | Returns `{ data: [...] }` with active dates |
| 2.3.4 | Notification rules | `GET /api/config/notification-rules` | Returns `{ data: [...] }` |
| 2.3.5 | Interview slots | `GET /api/interviews/slots` | Returns available slots |

---

## 3. Authentication & OTP

### 3.1 Login Flow

| # | Test | Steps | Expected |
|---|------|-------|----------|
| 3.1.1 | Login page loads | Navigate to `/login` | Phone input field visible |
| 3.1.2 | Send OTP | Enter valid phone (10-15 digits) → click Send | OTP input appears, success message |
| 3.1.3 | Send OTP - invalid phone | Enter phone < 10 digits → click Send | Validation error shown |
| 3.1.4 | Verify OTP (correct) | Enter `123456` → click Verify | Redirected to dashboard |
| 3.1.5 | Verify OTP (wrong) | Enter `000000` → click Verify | Error: "Invalid OTP code" |
| 3.1.6 | Verify OTP (wrong length) | Enter `12345` (5 digits) → click Verify | Validation error |
| 3.1.7 | Resend OTP | Click resend link/button | New OTP sent, success message |
| 3.1.8 | Parent login | Navigate to `/login/parent` | Parent-specific login form |
| 3.1.9 | First time setup | Navigate to `/login/first-time-setup` | Setup form for new users |
| 3.1.10 | Forgot password | Navigate to `/login/forgot-password` | Recovery form displayed |

### 3.2 Session & Middleware

| # | Test | Steps | Expected |
|---|------|-------|----------|
| 3.2.1 | Protected page redirect | Try to access `/student` without login | Redirected to `/login?callbackUrl=/student` |
| 3.2.2 | Callback URL works | Login after redirect | Redirected back to original URL |
| 3.2.3 | Session persists | Login → close tab → reopen → navigate to dashboard | Still authenticated |
| 3.2.4 | Static files bypass | Load an image directly (e.g., `.png`, `.jpg`) | Served without auth check |
| 3.2.5 | API auth enforcement | Call `GET /api/users` without cookie | Returns 401 JSON error |

### 3.3 Role-Based Access

| # | Test | Steps | Expected |
|---|------|-------|----------|
| 3.3.1 | Student → superintendent page | Login as STUDENT → navigate to `/superintendent` | Redirected or forbidden |
| 3.3.2 | Student → API staff endpoint | Login as STUDENT → `GET /api/users` | 403 Forbidden |
| 3.3.3 | Parent → write API | Login as PARENT → `POST /api/leaves` | 403 Forbidden |
| 3.3.4 | Superintendent → accounts API | Login as SUPERINTENDENT → `GET /api/dashboard/accounts` | 403 Forbidden |
| 3.3.5 | Accounts → superintendent API | Login as ACCOUNTS → `GET /api/dashboard/superintendent` | 403 Forbidden |

---

## 4. Student Dashboard & Features

### 4.1 Dashboard

| # | Test | Steps | Expected |
|---|------|-------|----------|
| 4.1.1 | Dashboard loads | Login as STUDENT → navigate to `/student` | Dashboard with summary cards |
| 4.1.2 | Payment summary | Check payment section | Shows totalDue, totalPaid, totalPending, overdueFees |
| 4.1.3 | Room allocation | Check room section | Shows current room or "not allocated" |
| 4.1.4 | Unread notifications | Check notification badge | Shows correct unread count |

### 4.2 Student Pages

| # | Test | Steps | Expected |
|---|------|-------|----------|
| 4.2.1 | Fees page | Navigate to `/student/fees` | Fee list with status indicators |
| 4.2.2 | Leave page | Navigate to `/student/leave` | Leave requests list + create button |
| 4.2.3 | Documents page | Navigate to `/student/documents` | Document list + upload button |
| 4.2.4 | Room page | Navigate to `/student/room` | Room details or allocation status |
| 4.2.5 | Room check-in | Navigate to `/student/room/check-in` | Check-in form/confirmation |
| 4.2.6 | Exit request | Navigate to `/student/exit` | Exit request form or status |
| 4.2.7 | Renewal page | Navigate to `/student/renewal` | Renewal form or status |
| 4.2.8 | Mess page | Navigate to `/student/mess` | Mess schedule or preferences |
| 4.2.9 | Biometric page | Navigate to `/student/biometric` | Biometric registration status |
| 4.2.10 | Visitor page | Navigate to `/student/visitor` | Visitor log or request form |
| 4.2.11 | Manual/handbook | Navigate to `/student/manual` | Student handbook content |

---

## 5. Superintendent Dashboard & Features

### 5.1 Dashboard

| # | Test | Steps | Expected |
|---|------|-------|----------|
| 5.1.1 | Dashboard loads | Login as SUPERINTENDENT → `/superintendent` | Application stats + leave stats |
| 5.1.2 | Stats accuracy | Compare dashboard numbers with list pages | Counts match |
| 5.1.3 | Vertical scoping | Verify data is filtered to superintendent's vertical | Only own vertical data shown |

### 5.2 Superintendent Pages

| # | Test | Steps | Expected |
|---|------|-------|----------|
| 5.2.1 | Leaves management | Navigate to `/superintendent/leaves` | Pending leaves list with approve/reject |
| 5.2.2 | Approve leave | Select a pending leave → approve | Status changes to APPROVED |
| 5.2.3 | Reject leave | Select a pending leave → reject with reason | Status changes to REJECTED, reason saved |
| 5.2.4 | Rooms management | Navigate to `/superintendent/rooms` | Room list with occupancy |
| 5.2.5 | Create room | Click create → fill form → submit | New room appears in list |
| 5.2.6 | Audit trail | Navigate to `/superintendent/audit` | Audit logs visible |
| 5.2.7 | Configuration | Navigate to `/superintendent/config` | Leave types, blackout dates, notification rules |
| 5.2.8 | Clearance | Navigate to `/superintendent/clearance` | Exit clearance management |
| 5.2.9 | Renewals | Navigate to `/superintendent/renewal` | Renewal requests list |
| 5.2.10 | Manual | Navigate to `/superintendent/manual` | Admin handbook |

---

## 6. Trustee Dashboard & Features

### 6.1 Dashboard

| # | Test | Steps | Expected |
|---|------|-------|----------|
| 6.1.1 | Dashboard loads | Login as TRUSTEE → `/trustee` | Application stats + pending interviews count |
| 6.1.2 | Pending interviews | Verify count matches scheduled interviews | Numbers consistent |

### 6.2 Trustee Pages

| # | Test | Steps | Expected |
|---|------|-------|----------|
| 6.2.1 | Applications | Navigate to `/trustee/applications` | All applications across verticals |
| 6.2.2 | Approve application | Select app → change status to APPROVED | Status updates, approvedAt/By set |
| 6.2.3 | Reject application | Select app → reject with reason | Status updates, rejectionReason saved |
| 6.2.4 | Interviews | Navigate to `/trustee/interviews` | Interview schedule list |
| 6.2.5 | Schedule interview | Create new interview for an application | Interview created with SCHEDULED status |
| 6.2.6 | Complete interview | Mark interview as complete with score | Status → COMPLETED, score saved |
| 6.2.7 | Allocations | Navigate to `/trustee/allocations` | Room allocation overview |
| 6.2.8 | Reports | Navigate to `/trustee/reports` | Reporting dashboard |

---

## 7. Accounts Dashboard & Features

### 7.1 Dashboard

| # | Test | Steps | Expected |
|---|------|-------|----------|
| 7.1.1 | Dashboard loads | Login as ACCOUNTS → `/accounts` | Fee totals and payment stats |
| 7.1.2 | Fee breakdown | Verify PENDING/PAID/OVERDUE/WAIVED counts | Numbers match fees list |
| 7.1.3 | Payment breakdown | Verify payment status counts | Numbers match payments data |

### 7.2 Accounts Operations

| # | Test | Steps | Expected |
|---|------|-------|----------|
| 7.2.1 | Create fee | `POST /api/fees` with valid data | Fee created with PENDING status |
| 7.2.2 | Fee with all heads | Test each fee head enum value | All accepted: PROCESSING_FEE, SECURITY_DEPOSIT, HOSTEL_FEE, MESS_FEE, MAINTENANCE_FEE, ELECTRICITY_FEE, LAUNDRY_FEE, LATE_FEE, DAMAGE_CHARGE, OTHER |
| 7.2.3 | View student fees | `GET /api/fees?studentUserId=...` | Returns fees for that student |
| 7.2.4 | Fee summary | `GET /api/fees?summary=true&studentUserId=...` | Returns totalDue, totalPaid, totalPending, overdueFees |
| 7.2.5 | Communications log | `GET /api/communications` | SMS/email/WhatsApp logs visible |
| 7.2.6 | Audit logs | `GET /api/auditLogs` | Full audit trail accessible |

---

## 8. Parent Portal

### 8.1 Parent Dashboard

| # | Test | Steps | Expected |
|---|------|-------|----------|
| 8.1.1 | Dashboard loads | Login as PARENT → `/parent` | Shows linked students, recent fees, recent leaves |
| 8.1.2 | No linked students | Login as parent with no linked students | Empty state: "No students linked" |
| 8.1.3 | Multiple students | Parent with 2+ linked students | All students shown |

### 8.2 Parent Read-Only Access

| # | Test | Steps | Expected |
|---|------|-------|----------|
| 8.2.1 | View student info | Navigate to parent student view | Student details visible (name, vertical, room) |
| 8.2.2 | View fees | Check fees section or `/parent/leave` | Student's fees displayed |
| 8.2.3 | View leaves | Navigate to `/parent/leave` | Student's leave requests shown |
| 8.2.4 | No sensitive data | Inspect API responses | No passwords, internal remarks, or admin-only fields |
| 8.2.5 | Cannot modify | Try to submit any form (if any exist) | No write operations possible |
| 8.2.6 | Notifications | Check parent notifications | Parent's own + linked students' notifications |

---

## 9. Application Flow (End-to-End)

### 9.1 New Application (Boys Hostel)

| # | Test | Steps | Expected |
|---|------|-------|----------|
| 9.1.1 | Start application | Navigate to `/apply/boys-hostel/contact` | Contact form renders |
| 9.1.2 | Enter contact | Fill name, mobile, email → proceed | Moves to verify step |
| 9.1.3 | Verify phone | Enter OTP `123456` → verify | Moves to form step |
| 9.1.4 | Fill application | Fill all required fields (DOB, gender, etc.) | Form validates |
| 9.1.5 | Submit | Click submit | Success page with tracking number (format: BH-YYYY-NNNN) |
| 9.1.6 | Track status | Go to `/track` → enter tracking # + mobile | Shows DRAFT/SUBMITTED status |

### 9.2 Application Lifecycle

| # | Test | Steps | Expected |
|---|------|-------|----------|
| 9.2.1 | DRAFT → SUBMITTED | Student submits draft | Status transitions, submittedAt set |
| 9.2.2 | SUBMITTED → REVIEW | Superintendent reviews | Status transitions, reviewedAt set |
| 9.2.3 | REVIEW → INTERVIEW | Superintendent schedules interview | Status transitions |
| 9.2.4 | INTERVIEW → APPROVED | Trustee approves after interview | Status transitions, approvedAt/By set |
| 9.2.5 | INTERVIEW → REJECTED | Trustee rejects with reason | rejectedAt/By/Reason set |
| 9.2.6 | Student cannot update APPROVED | Student tries to edit approved app | 403 Forbidden |
| 9.2.7 | Student CAN update DRAFT | Student edits their draft app | Update succeeds |

### 9.3 Application for Each Vertical

| # | Test | Steps | Expected |
|---|------|-------|----------|
| 9.3.1 | Boys Hostel | Complete flow | Tracking format: BH-YYYY-NNNN |
| 9.3.2 | Girls Ashram | Complete flow | Tracking format: GA-YYYY-NNNN |
| 9.3.3 | Dharamshala | Complete flow | Tracking format: DH-YYYY-NNNN |

---

## 10. Room Allocation Flow

### 10.1 Room Management

| # | Test | Steps | Expected |
|---|------|-------|----------|
| 10.1.1 | List rooms | `GET /api/rooms` | Returns rooms with occupancy data |
| 10.1.2 | Filter by vertical | `GET /api/rooms?vertical=BOYS` | Only BOYS rooms returned |
| 10.1.3 | Filter by status | `GET /api/rooms?status=AVAILABLE` | Only available rooms |
| 10.1.4 | Create room | `POST /api/rooms` with valid data | Room created, status=AVAILABLE, occupiedCount=0 |
| 10.1.5 | Duplicate room same vertical | Create room with same number/vertical | 409 Conflict |
| 10.1.6 | Same number different vertical | Create A-101 in BOYS and GIRLS | Both succeed |

### 10.2 Allocation

| # | Test | Steps | Expected |
|---|------|-------|----------|
| 10.2.1 | Allocate student | `POST /api/allocations` | Allocation created, status=ACTIVE |
| 10.2.2 | Room occupancy updates | Check room after allocation | occupiedCount increments |
| 10.2.3 | Full room rejected | Allocate to room at capacity | 400: "Room is at full capacity" |
| 10.2.4 | Duplicate allocation | Allocate student who already has a room | 409: "Student already has an active room allocation" |
| 10.2.5 | Student sees own | Login as student → `GET /api/allocations` | Returns only their allocation |
| 10.2.6 | Check-in confirmation | `PUT /api/allocations/[id]` with checkInConfirmed=true | checkInConfirmedAt set |
| 10.2.7 | Inventory acknowledgment | `PUT /api/allocations/[id]` with inventoryAcknowledged=true | inventoryAcknowledgedAt set |

### 10.3 Vacate

| # | Test | Steps | Expected |
|---|------|-------|----------|
| 10.3.1 | Vacate room | `POST /api/allocations/[id]/vacate` | Status → CHECKED_OUT, vacatedAt set |
| 10.3.2 | Occupancy decreases | Check room after vacate | occupiedCount decrements |
| 10.3.3 | Student no allocation | Student checks allocation after vacate | Returns empty |

---

## 11. Fee & Payment Flow

### 11.1 Fee Management

| # | Test | Steps | Expected |
|---|------|-------|----------|
| 11.1.1 | Create fee | ACCOUNTS creates fee for student | Fee with PENDING status |
| 11.1.2 | List fees | Student views own fees | Only their fees shown |
| 11.1.3 | Fee summary | `GET /api/fees?summary=true` | Correct totalDue/totalPaid/totalPending/overdueFees |
| 11.1.4 | Overdue detection | Fee with past dueDate + PENDING status | Counted as overdue |
| 11.1.5 | Paid not overdue | Fee with past dueDate + PAID status | NOT counted as overdue |
| 11.1.6 | Waived counts as paid | Fee with WAIVED status | Included in totalPaid |

### 11.2 Payment Flow (Razorpay Mock)

| # | Test | Steps | Expected |
|---|------|-------|----------|
| 11.2.1 | Create order | `POST /api/payments` with feeId + amount | Returns orderId (order_mock_...), amount in paise, keyId |
| 11.2.2 | Verify payment | `POST /api/payments/verify` with valid data | Payment recorded, 201 |
| 11.2.3 | Invalid signature | Submit wrong signature in non-mock | 403: "Invalid payment signature" |
| 11.2.4 | Webhook - captured | `POST /api/payments/webhook` with payment.captured | Returns `{ status: "ok" }` |
| 11.2.5 | Webhook - failed | `POST /api/payments/webhook` with payment.failed | Returns `{ status: "ok" }`, logged as warning |
| 11.2.6 | Webhook - bad sig | Send webhook without valid signature | 400 |

### 11.3 Receipt

| # | Test | Steps | Expected |
|---|------|-------|----------|
| 11.3.1 | Receipt generation | After payment, generate receipt | PDF with student name, fees, totals |
| 11.3.2 | Receipt number format | Check receipt number | Format: RCP-YYYYMM-NNNNN |
| 11.3.3 | Receipt download | Download receipt via signed URL | PDF opens in browser |

---

## 12. Leave Management Flow

### 12.1 Student Creates Leave

| # | Test | Steps | Expected |
|---|------|-------|----------|
| 12.1.1 | Create leave | Fill leave form → submit | Leave created with PENDING status |
| 12.1.2 | All leave types | Test each: HOME_VISIT, SHORT_LEAVE, MEDICAL, EMERGENCY, OTHER | All accepted |
| 12.1.3 | Past start time | Set start time in the past | Error: "Start time must be in the future" |
| 12.1.4 | End before start | Set end before start | Error: "End time must be after start time" |
| 12.1.5 | Equal start/end | Set same date/time for both | Error: "End time must be after start time" |
| 12.1.6 | Overlapping leave | Create leave during existing PENDING/APPROVED period | Error: "overlapping leave request" |
| 12.1.7 | Valid date range | Future start, later end | Success |

### 12.2 Superintendent Manages Leaves

| # | Test | Steps | Expected |
|---|------|-------|----------|
| 12.2.1 | View pending | List leaves with status=PENDING | Shows pending leaves |
| 12.2.2 | Approve leave | Select → approve | Status=APPROVED, approvedBy/At set |
| 12.2.3 | Reject with reason | Select → reject with reason text | Status=REJECTED, reason saved |
| 12.2.4 | Student cancels | Student cancels own pending leave | Status=CANCELLED |
| 12.2.5 | Leave stats | `GET /api/leaves?stats=true` | Returns count per status |

### 12.3 Leave Edge Cases

| # | Test | Steps | Expected |
|---|------|-------|----------|
| 12.3.1 | Non-student create | SUPERINTENDENT tries to create leave | 403 Forbidden |
| 12.3.2 | View own only (student) | Student lists leaves | Only their own shown |
| 12.3.3 | Non-existent leave | PATCH with fake ID | 404 Not Found |

---

## 13. Document Management

### 13.1 Upload

| # | Test | Steps | Expected |
|---|------|-------|----------|
| 13.1.1 | Upload PDF | Upload valid PDF (<10MB) | Document created, 201 |
| 13.1.2 | Upload JPEG | Upload valid JPEG image | Success |
| 13.1.3 | Upload PNG | Upload valid PNG image | Success |
| 13.1.4 | Reject HTML | Upload text/html file | Error: "not allowed" |
| 13.1.5 | Reject oversized | Upload >10MB file | Error: "size exceeds" |
| 13.1.6 | At size limit | Upload exactly 10MB file | Accepted |
| 13.1.7 | Missing file | Submit without file | 400: "file and documentType are required" |
| 13.1.8 | Missing documentType | Submit without documentType | 400: "file and documentType are required" |

### 13.2 Download (Signed URLs)

| # | Test | Steps | Expected |
|---|------|-------|----------|
| 13.2.1 | Get signed URL | `GET /api/documents/[id]/url` | Returns URL with token + expiry |
| 13.2.2 | Download file | Use signed URL to download | File served with correct Content-Type |
| 13.2.3 | Missing token | Access storage URL without token | 401: "Missing signed URL token" |
| 13.2.4 | Tampered token | Access with wrong token | 403: "Invalid or expired signed URL" |
| 13.2.5 | Expired URL | Access after expiry time | 403: "Invalid or expired signed URL" |
| 13.2.6 | Non-existent file | Valid token but file deleted | 404: "File not found" |

### 13.3 Student Document Scope

| # | Test | Steps | Expected |
|---|------|-------|----------|
| 13.3.1 | Student own docs | `GET /api/student/documents` | Only own documents |
| 13.3.2 | Student upload | `POST /api/student/documents` | Allowed for STUDENT role |
| 13.3.3 | Non-student blocked | Non-STUDENT hits student doc endpoints | 403 |
| 13.3.4 | Student doc URL | `GET /api/student/documents/[id]/url` for own doc | Signed URL returned |
| 13.3.5 | Other student's doc | Try to get URL for another student's doc | 403: "You can only access your own documents" |

---

## 14. Interview Scheduling

### 14.1 CRUD

| # | Test | Steps | Expected |
|---|------|-------|----------|
| 14.1.1 | Create interview | Trustee creates with applicationId, date, time, mode | Status=SCHEDULED |
| 14.1.2 | List interviews | `GET /api/interviews` | Paginated list |
| 14.1.3 | Filter by status | `?status=SCHEDULED` | Only scheduled shown |
| 14.1.4 | Filter by application | `?applicationId=...` | Only for that application |
| 14.1.5 | Get by ID | `GET /api/interviews/[id]` | Full interview details |
| 14.1.6 | Update interview | `PUT /api/interviews/[id]` with new date | Date updated, scheduleDatetime recomputed |
| 14.1.7 | Non-existent | GET/PUT with fake ID | 404 |
| 14.1.8 | Student can't create | Student tries to POST interview | 403 |

### 14.2 Complete Interview

| # | Test | Steps | Expected |
|---|------|-------|----------|
| 14.2.1 | Complete with score | POST complete with finalScore: 85 | Status=COMPLETED, score saved |
| 14.2.2 | Complete without score | POST complete with just notes | Status=COMPLETED |
| 14.2.3 | Already completed | Try to complete again | 400: "Interview is already completed" |
| 14.2.4 | Complete cancelled | Try to complete cancelled interview | 400: "Cannot complete a cancelled interview" |
| 14.2.5 | Score boundary (0) | finalScore: 0 | Accepted |
| 14.2.6 | Score boundary (100) | finalScore: 100 | Accepted |
| 14.2.7 | Score too high | finalScore: 101 | 400 Validation error |
| 14.2.8 | Score negative | finalScore: -1 | 400 Validation error |

### 14.3 Interview Slots

| # | Test | Steps | Expected |
|---|------|-------|----------|
| 14.3.1 | Available slots | `GET /api/interviews/slots` | Only isAvailable=true |
| 14.3.2 | Filter by date | `?fromDate=2026-04-01` | Only future slots |
| 14.3.3 | Filter by vertical | `?vertical=BOYS` | Only BOYS vertical slots |
| 14.3.4 | Filter by mode | `?mode=ONLINE` | Only online slots |

---

## 15. Notifications System

### 15.1 List & Read

| # | Test | Steps | Expected |
|---|------|-------|----------|
| 15.1.1 | List notifications | `GET /api/notifications` | Returns user's notifications, newest first |
| 15.1.2 | Pagination | `?page=2&limit=5` | Page 2 with 5 items |
| 15.1.3 | Unread count | `GET /api/notifications/unread-count` | Returns `{ count: N }` |
| 15.1.4 | Mark as read | `PATCH /api/notifications/[id]/read` | read=true, readAt set |
| 15.1.5 | Mark all as read | `PATCH /api/notifications/read-all` | All unread → read |
| 15.1.6 | Count after read-all | Check unread count after mark-all | Returns `{ count: 0 }` |
| 15.1.7 | Wrong user's notification | Try to mark another user's notification | 404 |

### 15.2 Notification Types

Verify that these notification types display correctly:
- FEE_REMINDER
- LEAVE_APPROVED / LEAVE_REJECTED
- FEE_OVERDUE
- ROOM_ALLOCATION
- ANNOUNCEMENT

---

## 16. Configuration Management

### 16.1 Leave Types

| # | Test | Steps | Expected |
|---|------|-------|----------|
| 16.1.1 | List (public) | `GET /api/config/leave-types` (no auth) | Returns all types |
| 16.1.2 | Create | SUPERINTENDENT creates new type | 201 Created |
| 16.1.3 | Required name | Submit without name | 400 Validation |
| 16.1.4 | Student blocked | Student tries to create | 403 |

### 16.2 Blackout Dates

| # | Test | Steps | Expected |
|---|------|-------|----------|
| 16.2.1 | List (public) | `GET /api/config/blackout-dates` (no auth) | Only active dates |
| 16.2.2 | Create | SUPERINTENDENT creates blackout date | 201 |
| 16.2.3 | Required fields | Missing reason or dates | 400 |
| 16.2.4 | Optional vertical | Create without vertical | Applies to all verticals |

### 16.3 Notification Rules

| # | Test | Steps | Expected |
|---|------|-------|----------|
| 16.3.1 | List (public) | `GET /api/config/notification-rules` (no auth) | All rules |
| 16.3.2 | Create | SUPERINTENDENT creates rule | 201 |
| 16.3.3 | Update | `PUT` with id + changes | Rule updated |
| 16.3.4 | Delete | `DELETE ?id=...` | Rule removed |
| 16.3.5 | Delete missing id | `DELETE` without id param | 400: "Missing id parameter" |
| 16.3.6 | Delete non-existent | `DELETE ?id=fake-uuid` | 404 |

---

## 17. Compliance & Audit

### 17.1 Consent Tracking

| # | Test | Steps | Expected |
|---|------|-------|----------|
| 17.1.1 | List consents | `GET /api/compliance/consents` | User's consent records |
| 17.1.2 | Create consent | `POST /api/compliance/consents` | 201 with consentType, version |
| 17.1.3 | IP captured | Check created consent | ipAddress from x-forwarded-for header |
| 17.1.4 | User-agent captured | Check created consent | userAgent from request header |
| 17.1.5 | Digital signature | Include digitalSignature in POST | Saved correctly |
| 17.1.6 | Missing fields | POST without consentType or consentVersion | 400 Validation |

### 17.2 Audit Logs

| # | Test | Steps | Expected |
|---|------|-------|----------|
| 17.2.1 | List audit logs | `GET /api/auditLogs` (staff only) | Paginated logs |
| 17.2.2 | Filter by entity | `?entityType=USER` | Only USER logs |
| 17.2.3 | Filter by actor | `?actorId=...` | Only that actor's actions |
| 17.2.4 | Entity audit | `GET /api/audit/entity/USER/[id]` | Logs for that specific entity |
| 17.2.5 | Compliance audit | `GET /api/compliance/audit?actorId=...` | Actor's audit trail |
| 17.2.6 | Missing params | `GET /api/compliance/audit` (no params) | 400: "Provide actorId or entityType+entityId" |
| 17.2.7 | Student blocked | Student tries to access audit | 403 |

### 17.3 Data Retention (Cron)

| # | Test | Steps | Expected |
|---|------|-------|----------|
| 17.3.1 | Valid cron secret | `POST /api/admin/cron/data-retention` with x-cron-secret header | Archives old apps |
| 17.3.2 | Missing secret | POST without header | 401 |
| 17.3.3 | Wrong secret | POST with wrong value | 401 |
| 17.3.4 | Archive criteria | Only APPROVED/REJECTED apps >365 days old | Correct items archived |

---

## 18. Exit & Clearance Flow

### 18.1 Exit Request

| # | Test | Steps | Expected |
|---|------|-------|----------|
| 18.1.1 | Create exit request | Student fills reason, exit date, bank info → submit | Status=PENDING, 201 |
| 18.1.2 | List own requests | `GET /api/student/exit-request` | Only own requests |
| 18.1.3 | Get draft | `GET /api/student/exit-request/draft` | Returns pending request or null |
| 18.1.4 | Withdraw request | `POST /api/student/exit-request/withdraw` | Status → CANCELLED |
| 18.1.5 | No pending to withdraw | Withdraw when no pending request | 404: "No pending exit request found" |
| 18.1.6 | Non-student blocked | SUPERINTENDENT tries student exit endpoints | 403 |
| 18.1.7 | Optional bank details | Submit without bank info (null allowed) | Accepted with nulls |

---

## 19. Renewal Flow

### 19.1 Renewal CRUD

| # | Test | Steps | Expected |
|---|------|-------|----------|
| 19.1.1 | Student creates | Student submits renewal with period dates | Status=DRAFT, uses session userId |
| 19.1.2 | Staff creates for student | SUPERINTENDENT creates with explicit studentUserId | Accepted |
| 19.1.3 | Staff missing studentUserId | SUPERINTENDENT creates without studentUserId | 400: "studentUserId is required" |
| 19.1.4 | Consent given | Create with consentGiven=true | consentGivenAt timestamp set |
| 19.1.5 | Consent not given | Create with consentGiven=false | consentGivenAt is null |
| 19.1.6 | Student sees own | Student lists renewals | Only their own |
| 19.1.7 | Filter by status | `?status=DRAFT` | Only matching status |

---

## 20. API Direct Testing (curl/Postman)

Use these curl commands to test API endpoints directly. Replace `COOKIE` with a valid session cookie.

### 20.1 Health & Public

```bash
# Health check
curl -s localhost:3000/api/health | jq .

# Leave types (no auth)
curl -s localhost:3000/api/config/leave-types | jq .

# Send OTP
curl -s -X POST localhost:3000/api/otp/send \
  -H 'Content-Type: application/json' \
  -d '{"phone": "+919876543210"}' | jq .

# Verify OTP
curl -s -X POST localhost:3000/api/otp/verify \
  -H 'Content-Type: application/json' \
  -d '{"code": "123456"}' | jq .
```

### 20.2 Authenticated Endpoints

```bash
# List users (staff only)
curl -s localhost:3000/api/users \
  -H 'Cookie: better-auth.session_token=COOKIE' | jq .

# Create fee (ACCOUNTS/TRUSTEE)
curl -s -X POST localhost:3000/api/fees \
  -H 'Content-Type: application/json' \
  -H 'Cookie: better-auth.session_token=COOKIE' \
  -d '{
    "studentUserId": "uuid-here",
    "head": "HOSTEL_FEE",
    "name": "Hostel Fee March",
    "amount": "15000",
    "dueDate": "2026-04-15"
  }' | jq .

# Create leave (STUDENT only)
curl -s -X POST localhost:3000/api/leaves \
  -H 'Content-Type: application/json' \
  -H 'Cookie: better-auth.session_token=COOKIE' \
  -d '{
    "type": "HOME_VISIT",
    "startTime": "2026-04-01T09:00:00Z",
    "endTime": "2026-04-03T18:00:00Z",
    "reason": "Family function"
  }' | jq .
```

### 20.3 Error Response Validation

Every error should follow this format:
```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Resource not found",
    "status": 404
  }
}
```

Validation errors include `details`:
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input",
    "status": 400,
    "details": [
      { "field": "phone", "message": "String must contain at least 10 character(s)" }
    ]
  }
}
```

---

## 21. Security Testing

### 21.1 Authentication

| # | Test | Steps | Expected |
|---|------|-------|----------|
| 21.1.1 | Missing cookie | Any protected endpoint without cookie | 401 or redirect |
| 21.1.2 | Invalid cookie | Send garbage session token | 401 |
| 21.1.3 | Expired session | Use session >7 days old | 401 |
| 21.1.4 | OTP brute force | Send 10+ OTP verify requests rapidly | Should be rate-limited |

### 21.2 Authorization

| # | Test | Steps | Expected |
|---|------|-------|----------|
| 21.2.1 | Vertical isolation | SUPERINTENDENT of BOYS vertical accesses GIRLS data | Data filtered/forbidden |
| 21.2.2 | Student data isolation | Student A accesses Student B's fees/leaves | Only own data returned |
| 21.2.3 | Privilege escalation | Student calls `POST /api/rooms` | 403 |
| 21.2.4 | Parent write attempt | Parent calls any POST/PATCH/PUT/DELETE | 403 or blocked |
| 21.2.5 | Role mismatch on every protected endpoint | Iterate all endpoints with wrong role | All return 403 |

### 21.3 Input Validation

| # | Test | Steps | Expected |
|---|------|-------|----------|
| 21.3.1 | SQL injection | Send `'; DROP TABLE users;--` in name field | Escaped by Drizzle ORM, no effect |
| 21.3.2 | XSS in text fields | Send `<script>alert('xss')</script>` in name | Stored as text, not executed |
| 21.3.3 | Oversized payload | Send 100MB JSON body | Request rejected |
| 21.3.4 | Path traversal | Upload filename `../../../etc/passwd` | Filename sanitized, path stays in uploads/ |
| 21.3.5 | Invalid UUID | Send non-UUID where UUID expected | 400 validation error |
| 21.3.6 | Negative numbers | Send negative amount for fee | 400 validation error |

### 21.4 Signed URLs

| # | Test | Steps | Expected |
|---|------|-------|----------|
| 21.4.1 | Token reuse | Use same signed URL twice | Works (token valid until expiry) |
| 21.4.2 | Token modification | Change one char of token | 403 |
| 21.4.3 | Path modification | Change file path but keep token | 403 (token bound to path) |
| 21.4.4 | Expiry modification | Change expires param to future | 403 (token bound to expires) |

### 21.5 Cron Security

| # | Test | Steps | Expected |
|---|------|-------|----------|
| 21.5.1 | No secret header | `POST /api/admin/cron/data-retention` | 401 |
| 21.5.2 | Wrong secret | Send wrong x-cron-secret | 401 |
| 21.5.3 | Empty secret | Send empty x-cron-secret | 401 |

---

## 22. i18n / Language Testing

### 22.1 Language Toggle

| # | Test | Steps | Expected |
|---|------|-------|----------|
| 22.1.1 | Default language | Load any page | English content displayed |
| 22.1.2 | Switch to Hindi | Click language toggle → Hindi | All visible text in Hindi |
| 22.1.3 | Switch back to English | Click language toggle → English | All text back to English |
| 22.1.4 | Language persists | Switch to Hindi → navigate to other page | Hindi still active |
| 22.1.5 | Cookie-based | Check cookies after language switch | Locale cookie set |

### 22.2 Translation Coverage

For EVERY page, verify in BOTH English and Hindi:

| # | Test | Expected |
|---|------|----------|
| 22.2.1 | No missing keys | No `Namespace.key` or raw keys visible |
| 22.2.2 | No English in Hindi mode | All user-facing text translated (except proper nouns) |
| 22.2.3 | Buttons translate | All buttons show translated text |
| 22.2.4 | Error messages translate | Validation errors show in selected language |
| 22.2.5 | Placeholders translate | Form placeholders in selected language |
| 22.2.6 | Navigation translates | All nav items in selected language |

### 22.3 What Should NOT Translate

- Database field names (room numbers, tracking numbers)
- API keys and URLs
- Code/developer content
- Route paths

---

## 23. Responsive & Cross-Browser

### 23.1 Breakpoints

Test every dashboard page at these breakpoints:

| Breakpoint | Width | Device |
|-----------|-------|--------|
| Mobile | 375px | iPhone 14 |
| Tablet | 768px | iPad |
| Desktop | 1280px | Laptop |
| Large Desktop | 1920px | Monitor |

### 23.2 Key Responsive Checks

| # | Test | Expected |
|---|------|----------|
| 23.2.1 | Navigation collapses | Hamburger menu on mobile |
| 23.2.2 | Tables scroll | Tables horizontally scrollable on mobile |
| 23.2.3 | Forms full width | Form inputs span full width on mobile |
| 23.2.4 | Cards stack | Grid cards stack vertically on mobile |
| 23.2.5 | No horizontal overflow | No content overflows viewport |
| 23.2.6 | Touch targets | Buttons/links at least 44px touch target |
| 23.2.7 | Modal displays correctly | Modals fit mobile screen |

### 23.3 Cross-Browser

Test critical flows in:
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Mobile Safari (iOS)
- Chrome Android

---

## 24. Error Handling & Edge Cases

### 24.1 Network Errors

| # | Test | Steps | Expected |
|---|------|-------|----------|
| 24.1.1 | API timeout | Stop backend → trigger API call | Loading state → error message |
| 24.1.2 | DB disconnected | Stop PostgreSQL → `GET /api/health` | `{ status: "unhealthy", database: "disconnected" }` (503) |
| 24.1.3 | Page not found | Navigate to `/nonexistent` | 404 page rendered |
| 24.1.4 | API not found | `GET /api/nonexistent` | 404 response |

### 24.2 Data Edge Cases

| # | Test | Steps | Expected |
|---|------|-------|----------|
| 24.2.1 | Empty list | New user with no data | Empty state UI shown, not broken |
| 24.2.2 | Large pagination | Page 9999 with no data | Returns empty array, no crash |
| 24.2.3 | Zero fees | Student with no fees → summary | All zeros: `{ totalDue: 0, totalPaid: 0, totalPending: 0, overdueFees: 0 }` |
| 24.2.4 | Unicode names | Create application with Hindi name (हिन्दी) | Stored and displayed correctly |
| 24.2.5 | Special chars in filename | Upload file with spaces/parens: `my file (1).pdf` | Filename sanitized in storage path |
| 24.2.6 | Very long reason text | Submit leave with 5000-char reason | Accepted and stored |

### 24.3 Concurrent Operations

| # | Test | Steps | Expected |
|---|------|-------|----------|
| 24.3.1 | Double submit | Click submit twice rapidly | Only one record created |
| 24.3.2 | Concurrent allocations | Two superintendents allocate last bed simultaneously | One succeeds, other gets capacity error |

---

## 25. Performance & Load

### 25.1 Page Load

| # | Test | Expected |
|---|------|----------|
| 25.1.1 | Home page | < 3s first load |
| 25.1.2 | Dashboard | < 2s after auth |
| 25.1.3 | List pages | < 2s with default pagination |
| 25.1.4 | No layout shift | CLS < 0.1 |

### 25.2 API Response Times

| # | Test | Expected |
|---|------|----------|
| 25.2.1 | Health check | < 100ms |
| 25.2.2 | List endpoints (20 items) | < 500ms |
| 25.2.3 | Create operations | < 1s |
| 25.2.4 | Dashboard aggregates | < 1s |

### 25.3 Data Volume

| # | Test | Steps | Expected |
|---|------|-------|----------|
| 25.3.1 | 1000 applications | Seed 1000 apps → list with pagination | Pagination works, page loads in <2s |
| 25.3.2 | 500 notifications | Seed 500 notifications → unread count | Count returns in <200ms |
| 25.3.3 | 100 rooms | Seed 100 rooms → filter/paginate | Responsive filtering |

---

## 26. Accessibility Testing

### 26.1 Keyboard Navigation

| # | Test | Steps | Expected |
|---|------|-------|----------|
| 26.1.1 | Tab order | Tab through any page | Focus follows logical reading order |
| 26.1.2 | Focus visible | Tab through interactive elements | Clear focus indicator on every element |
| 26.1.3 | Skip to content | Press Tab on page load | "Skip to main content" link appears |
| 26.1.4 | Form navigation | Tab through login form | Phone → OTP → Submit navigable by keyboard |
| 26.1.5 | Modal trap | Open a modal → Tab | Focus stays within modal until closed |
| 26.1.6 | Escape closes modal | Open modal → press Escape | Modal closes, focus returns to trigger |
| 26.1.7 | Dropdown keyboard | Open dropdown → Arrow keys | Items navigable, Enter selects |
| 26.1.8 | Button activation | Focus a button → press Enter or Space | Button activates |

### 26.2 Screen Reader

| # | Test | Steps | Expected |
|---|------|-------|----------|
| 26.2.1 | Page headings | Use heading navigation (H key in NVDA/VoiceOver) | Logical heading hierarchy (h1 → h2 → h3) |
| 26.2.2 | Form labels | Navigate to form inputs | Every input has an associated label announced |
| 26.2.3 | Image alt text | Navigate images | Meaningful alt text (not "image.png") |
| 26.2.4 | Error announcements | Submit invalid form | Error message announced by screen reader |
| 26.2.5 | Status updates | Approve a leave / mark notification read | Live region announces the change |
| 26.2.6 | Table headers | Navigate data tables | Column/row headers announced for each cell |
| 26.2.7 | Button purpose | Navigate buttons | "Approve Leave" not just "Button" |
| 26.2.8 | Link purpose | Navigate links | Descriptive text, not "click here" |

### 26.3 Visual Accessibility

| # | Test | Steps | Expected |
|---|------|-------|----------|
| 26.3.1 | Color contrast | Check text against backgrounds (use axe-core or browser DevTools) | WCAG AA: 4.5:1 for normal text, 3:1 for large text |
| 26.3.2 | Not color-only | Status indicators (APPROVED/REJECTED) | Info conveyed by text/icon, not just color |
| 26.3.3 | Text resize | Zoom browser to 200% | Content reflows, nothing truncated or overlapping |
| 26.3.4 | Motion sensitivity | Check for animations | No flashing >3 times/sec; respects `prefers-reduced-motion` |
| 26.3.5 | Touch target size | Check mobile buttons | At least 44x44px target area |

### 26.4 Automated Checks

| # | Test | Tool | Expected |
|---|------|------|----------|
| 26.4.1 | axe-core scan | Browser extension or `@axe-core/playwright` | Zero critical/serious violations |
| 26.4.2 | Lighthouse accessibility | Chrome DevTools → Lighthouse | Score > 90 |
| 26.4.3 | WAVE scan | WAVE browser extension | No errors (warnings acceptable) |

---

## 27. Device Session Management

### 27.1 Session Tracking

| # | Test | Steps | Expected |
|---|------|-------|----------|
| 27.1.1 | Login creates session | Login → check device sessions | New session with deviceId, IP, userAgent |
| 27.1.2 | Session updates on activity | Make API call → check session | `lastUsedAt` updated |
| 27.1.3 | List active sessions | `getUserSessions(userId)` | Returns only active sessions, sorted by lastUsedAt desc |
| 27.1.4 | Multiple devices | Login from two browsers | Two active sessions listed |

### 27.2 Session Deactivation

| # | Test | Steps | Expected |
|---|------|-------|----------|
| 27.2.1 | Deactivate single | Deactivate one session | That session becomes inactive, others remain |
| 27.2.2 | Deactivate wrong user | Try to deactivate another user's session | 404 Not Found |
| 27.2.3 | Deactivate all | Logout from all devices | All sessions become inactive |
| 27.2.4 | Session not found | Deactivate non-existent session ID | 404 Not Found |

### 27.3 Concurrent Login

| # | Test | Steps | Expected |
|---|------|-------|----------|
| 27.3.1 | Same device re-login | Login again from same device | Session updated (upsert), not duplicated |
| 27.3.2 | Different device new login | Login from phone after laptop | Both sessions active |
| 27.3.3 | Session after deactivation | Deactivate session → try to use | API returns 401 |

---

## 28. Financial Reconciliation

### 28.1 Reconciliation Report

| # | Test | Steps | Expected |
|---|------|-------|----------|
| 28.1.1 | Basic reconciliation | Call `reconcile("2026-01-01", "2026-03-31")` | Returns totalFees, totalPayments, difference |
| 28.1.2 | No data period | Reconcile a period with no fees/payments | All zeros, no errors |
| 28.1.3 | All paid | Period where all fees are PAID | difference = 0, unmatchedFees = 0 |
| 28.1.4 | Unpaid fees | Period with PENDING fees | unmatchedFees > 0, difference > 0 |
| 28.1.5 | Mixed statuses | Fees: 3 PAID, 2 PENDING, 1 WAIVED | totalFees includes all, totalPayments only PAID status |
| 28.1.6 | Period boundaries | Fee created at exactly start date | Included in results |
| 28.1.7 | Period exclusion | Fee created 1 second before start | Not included |

### 28.2 Accounts Workflow

| # | Test | Steps | Expected |
|---|------|-------|----------|
| 28.2.1 | Monthly report | Reconcile current month | Dashboard shows matching numbers |
| 28.2.2 | Quarterly report | Reconcile Q1 (Jan-Mar) | Aggregates across 3 months |
| 28.2.3 | Difference investigation | When difference > 0 | unmatchedFees identifies pending items |
| 28.2.4 | Receipt cross-check | Compare payment records with receipts | Receipt numbers match payment records |

---

## 29. Timezone & Date Handling

### 29.1 Date Storage & Display

| # | Test | Steps | Expected |
|---|------|-------|----------|
| 29.1.1 | Dates stored in UTC | Check DB directly for createdAt/updatedAt | All timestamps in UTC |
| 29.1.2 | Display in IST | View leave request dates in UI | Shows IST (UTC+05:30) |
| 29.1.3 | Leave start/end | Create leave with IST times | Stored correctly in UTC, displayed in IST |
| 29.1.4 | Fee due dates | Create fee with due date | Date-only field (YYYY-MM-DD), no timezone shift |
| 29.1.5 | Blackout dates | Create blackout date | Date-only, consistent across timezones |

### 29.2 Edge Cases

| # | Test | Steps | Expected |
|---|------|-------|----------|
| 29.2.1 | Midnight IST | Create leave starting at 00:00 IST (18:30 UTC prev day) | Correctly maps to IST |
| 29.2.2 | Day boundary | Leave from March 31 23:00 IST to April 1 06:00 IST | Spans two days correctly |
| 29.2.3 | Overdue calculation | Fee due "2026-03-20" checked at 23:59 IST on March 20 | NOT overdue (same day) |
| 29.2.4 | Overdue next day | Same fee checked at 00:01 IST on March 21 | IS overdue |
| 29.2.5 | Audit log timestamps | Create entity → check audit log | Timestamp matches creation time |
| 29.2.6 | Session expiry | Session created 7 days ago + 1 second | Session should be expired |

### 29.3 Date Formatting

| # | Test | Steps | Expected |
|---|------|-------|----------|
| 29.3.1 | Short format | Date displayed in tables/lists | DD/MM/YYYY format (Indian convention) |
| 29.3.2 | Long format | Date displayed in detail views | e.g., "20 March 2026" or "20 मार्च 2026" |
| 29.3.3 | Relative format | Recent notifications | "Today", "Yesterday", "3 days ago" |
| 29.3.4 | Hindi date format | Switch to Hindi → view dates | Month names in Hindi |

---

## 30. DPDP Compliance & Data Lifecycle

### 30.1 Data Minimization

| # | Test | Steps | Expected |
|---|------|-------|----------|
| 30.1.1 | Parent sees minimal data | Parent API responses | No sensitive fields: passwords, internal remarks, bank details |
| 30.1.2 | Student sees own only | Student API responses | Cannot see other students' data |
| 30.1.3 | API responses minimal | Check all list endpoints | No unnecessary fields (e.g., no authUserId in public responses) |
| 30.1.4 | Log sanitization | Check server logs | No OTPs, passwords, tokens, Aadhaar numbers logged |

### 30.2 Consent Management

| # | Test | Steps | Expected |
|---|------|-------|----------|
| 30.2.1 | Consent before data collection | Application form | Consent checkbox required before submission |
| 30.2.2 | Consent version tracked | Create consent log | consentVersion stored and queryable |
| 30.2.3 | Consent with signature | Submit with digitalSignature | Signature stored |
| 30.2.4 | IP tracking | Submit consent via API | IP from x-forwarded-for saved |
| 30.2.5 | User-agent tracking | Submit consent | Browser user-agent saved |
| 30.2.6 | Consent history | Query user's consents | All consents shown, sorted by date desc |
| 30.2.7 | Duplicate consent check | `hasConsent(userId, type, version)` | Returns true if exists, false if not |

### 30.3 Data Retention

| # | Test | Steps | Expected |
|---|------|-------|----------|
| 30.3.1 | Auto-archive trigger | Run data retention cron | APPROVED/REJECTED apps >365 days → ARCHIVED |
| 30.3.2 | Recent apps untouched | Apps <365 days old | Status unchanged |
| 30.3.3 | DRAFT not archived | Draft app >365 days old | NOT archived (only APPROVED/REJECTED) |
| 30.3.4 | Retention stats | `getRetentionStats()` | Shows count of apps pending archive |
| 30.3.5 | Cron authentication | Cron endpoint without secret | 401 Unauthorized |

### 30.4 Encryption

| # | Test | Steps | Expected |
|---|------|-------|----------|
| 30.4.1 | Sensitive fields encrypted | Check DB for Aadhaar/bank details | Stored as encrypted string (not plaintext) |
| 30.4.2 | Decryption works | Read encrypted field via API | Returns plaintext to authorized user |
| 30.4.3 | Different ciphertext | Encrypt same value twice | Different ciphertext (random IV) |
| 30.4.4 | Unicode encryption | Encrypt Hindi text (हिन्दी) | Encrypts and decrypts correctly |

---

## 31. Clearance Workflow (Detailed)

### 31.1 Exit Request to Clearance

| # | Test | Steps | Expected |
|---|------|-------|----------|
| 31.1.1 | Student submits exit | Fill reason, exit date, bank details → submit | Exit request with PENDING status |
| 31.1.2 | Optional bank details | Submit without bank info | Accepted (fields nullable) |
| 31.1.3 | Forwarding address | Include forwarding address | Stored correctly |
| 31.1.4 | Withdraw request | Student withdraws pending request | Status → CANCELLED |
| 31.1.5 | Cannot withdraw approved | Try to withdraw after approval | 404 (no pending request) |

### 31.2 Clearance Process

| # | Test | Steps | Expected |
|---|------|-------|----------|
| 31.2.1 | Room clearance | Superintendent marks room cleared | roomCleared status updated |
| 31.2.2 | Library clearance | Check library return | libraryCleared status updated |
| 31.2.3 | Mess clearance | Check mess dues | messCleared status updated |
| 31.2.4 | Accounts clearance | Check fee balance | accountsCleared status updated |
| 31.2.5 | All cleared | All departments marked clear | Overall clearance status → CLEARED |
| 31.2.6 | Blocked clearance | One department has issues | Overall status stays PENDING, blocking item noted |

### 31.3 Clearance Items

| # | Test | Steps | Expected |
|---|------|-------|----------|
| 31.3.1 | Per-department items | List clearance items for an exit | Items grouped by department |
| 31.3.2 | Amount due | Item with outstanding amount | amountDue shown, amountPaid tracked |
| 31.3.3 | Item status workflow | PENDING → CLEARED | Status transitions correctly |
| 31.3.4 | Not applicable | Mark item as NOT_APPLICABLE | Skipped in clearance check |
| 31.3.5 | Blocked item | Mark item as BLOCKED with remarks | Prevents overall clearance |

---

## Appendix: Test Execution Checklist

Use this checklist to track testing progress:

```
Pre-Release Testing Checklist
==============================

[ ] 2. Public Pages (11 pages)
[ ] 3. Authentication & OTP (10 + 5 + 5 tests)
[ ] 4. Student Dashboard (11 pages)
[ ] 5. Superintendent Dashboard (10 pages)
[ ] 6. Trustee Dashboard (8 pages)
[ ] 7. Accounts Dashboard (6 operations)
[ ] 8. Parent Portal (6 tests)
[ ] 9. Application Flow (10 tests)
[ ] 10. Room Allocation (10 tests)
[ ] 11. Fee & Payment (9 tests)
[ ] 12. Leave Management (12 tests)
[ ] 13. Document Management (13 tests)
[ ] 14. Interview Scheduling (16 tests)
[ ] 15. Notifications (7 tests)
[ ] 16. Configuration (10 tests)
[ ] 17. Compliance & Audit (10 tests)
[ ] 18. Exit & Clearance (7 tests)
[ ] 19. Renewal Flow (7 tests)
[ ] 20. API Direct Testing (verified)
[ ] 21. Security Testing (16 tests)
[ ] 22. i18n Testing (both languages)
[ ] 23. Responsive Testing (3 breakpoints)
[ ] 24. Error Handling (10 tests)
[ ] 25. Performance (baseline verified)
[ ] 26. Accessibility Testing (keyboard, screen reader, contrast)
[ ] 27. Device Session Management (multi-device, deactivation)
[ ] 28. Financial Reconciliation (period reports, matching)
[ ] 29. Timezone & Date Handling (UTC storage, IST display)
[ ] 30. DPDP Compliance (minimization, consent, retention, encryption)
[ ] 31. Clearance Workflow (department clearances, items)

Sign-off: _________________ Date: _____________
```

# Phase 10: Frontend Design Implementation

## Goal

Rebuild all frontend pages and components using the design reference files in `design/` as the visual/structural guide. Replace placeholder pages with production-quality UI that matches the design system.

## Scope

### Design Reference Files (115 total)
- **17 pages** (11,048 lines) — landing, login, apply, track, dashboards, config
- **79 components** across 14 categories — UI, forms, feedback, data, layout, navigation, documents, fees, tracking, print, communication
- **3 utility files** — constants.ts, utils.ts (cn helper), types.ts
- **2 lib files** — API client, response helpers

### Work Breakdown

#### Task 10.1: CSS Design System (globals.css)
Add all 28 CSS variables used by the design reference:
```
--bg-page, --bg-brand, --bg-accent, --bg-inverse, --bg-primary, --bg-secondary
--surface-primary, --surface-secondary
--text-primary, --text-secondary, --text-inverse, --text-link, --text-on-accent
--border-primary
--state-{success,warning,error,info}-{bg,border,text}
--font-serif
--radius-md
```
Plus utility classes: `.nav-link`, `.text-caption`, `.text-heading-*`, `.text-body`, `.btn-secondary`

**Test**: Visual inspection — dev server shows correct colors/typography

#### Task 10.2: Shared Components — UI Primitives
Adapt from `design/components/ui/`:
- `Button.tsx` (177 lines) — variants: primary, secondary, ghost, destructive; sizes: sm, md, lg
- `Badge.tsx` (53 lines) — status badge with color variants
- `Chip.tsx` (106 lines) — removable chip/tag
- `Tag.tsx` (48 lines) — label tag

Plus from `design/components/`:
- `constants.ts` — SIZE_CLASSES, BUTTON_VARIANT_CLASSES, STATUS_BADGE_CLASSES
- `utils.ts` — cn() classname merge utility

**i18n**: No user-facing text in primitives — just props
**Test**: Unit test each component renders with variants

#### Task 10.3: Shared Components — Forms
Adapt from `design/components/forms/`:
- `Input.tsx` (166 lines) — text input with label, error, help text
- `Select.tsx` (166 lines) — dropdown select
- `Textarea.tsx` (149 lines) — multi-line input
- `Checkbox.tsx` (171 lines) — checkbox with label
- `Radio.tsx` (249 lines) — radio group
- `Toggle.tsx` (167 lines) — toggle switch
- `DatePicker.tsx` (145 lines) — date input
- `FileUpload.tsx` (234 lines) — drag-drop file upload
- `OtpInput.tsx` (85 lines) — OTP digit boxes
- `SearchField.tsx` (211 lines) — search with icon
- `FormWizard.tsx` (231 lines) — multi-step form container
- `Stepper.tsx` (186 lines) — step progress indicator

**i18n**: Labels and placeholders through props, validation messages through t()
**Test**: Unit test each renders, accepts input, shows error state

#### Task 10.4: Shared Components — Feedback & Data
Adapt from `design/components/feedback/`:
- `Modal.tsx` (180 lines) — dialog
- `Alert.tsx` (135 lines) — alert banner
- `Banner.tsx` (129 lines) — info/warning banner
- `Toast.tsx` (128 lines) + `ToastContainer.tsx` (245 lines)
- `Spinner.tsx` (65 lines) — loading spinner
- `EmptyState.tsx` (106 lines) — empty data illustration
- `SidePanel.tsx` (195 lines) — slide-over
- `Tooltip.tsx` (108 lines)

Adapt from `design/components/data/`:
- `Table.tsx` (243 lines) — data table with sorting
- `Tabs.tsx` (178 lines) — tab navigation
- `Card.tsx` (91 lines) — card container
- `Accordion.tsx` (202 lines)
- `List.tsx` (100 lines)

**Test**: Unit test each renders

#### Task 10.5: Layout Components
Adapt from `design/components/layout/`:
- `Container.tsx` (56 lines)
- `Grid.tsx` (61 lines)
- `Flex.tsx` (91 lines)
- `Spacer.tsx` (48 lines)

Adapt from `design/components/navigation/`:
- `Navigation.tsx` (306 lines) — sidebar navigation with role-based links
  - **CRITICAL**: Links must use `/student/...` NOT `/dashboard/student/...` (BUG-003)

**Test**: Navigation unit test — no /dashboard/ prefix in links

#### Task 10.6: Landing Page
Rebuild `src/app/page.tsx` using `design/pages/page.tsx` (824 lines):
- Header with logo, nav links
- Hero section with gradient background, CTA buttons
- Values & Mission section (3 cards)
- Discipline & Safety highlights (4 cards)
- Amenities showcase
- Hostel verticals section (3 cards)
- Application process steps
- Footer

**i18n**: All user-facing strings through `t('common.*')` — add keys to messages/
**Test**: Page renders, all sections visible, no hardcoded strings

#### Task 10.7: Login Pages
Rebuild using `design/pages/login.tsx` (200 lines), `login-parent.tsx` (290 lines), `login-first-time-setup.tsx` (350 lines):
- OTP-based login form
- Parent login variant
- First-time password setup

**i18n**: All labels, buttons, messages through t()
**Test**: Form renders, inputs have data-testid

#### Task 10.8: Application Flow Pages
Rebuild using `design/pages/apply.tsx` (321 lines), `apply-contact.tsx` (374 lines), `apply-form.tsx` (1014 lines):
- Vertical selection page
- Contact/OTP step — **email field always visible and required** (CHANGE-3)
- Multi-step form (personal, academic, hostel, references, documents, review)

**i18n**: All form labels and validation messages through t()
**Test**: Email field is visible and required

#### Task 10.9: Track Page
Rebuild using `design/pages/track.tsx` (263 lines), `track-result.tsx` (639 lines):
- Tracking form with state machine (idle/loading/found/notFound/error)
- Result display with application details
- **No infinite spinner** (BUG-005)

**i18n**: All strings through t()
**Test**: State machine handles all states, no stuck spinner

#### Task 10.10: Student Dashboard
Rebuild using `design/pages/dashboard-student.tsx` (187 lines), `dashboard-student-fees.tsx` (456 lines), `dashboard-student-room.tsx` (387 lines):
- Welcome card with student info
- Quick action cards (fees, leave, room, documents)
- Fees page with summary cards and fee list
- Room page with allocation info or **empty state** (BUG-011)

**Links**: All use `/student/...` NOT `/dashboard/student/...` (BUG-003)
**Empty states**: Show message not error (BUG-004, BUG-011)
**Test**: Links have correct prefix, empty states show informational message

#### Task 10.11: Superintendent Dashboard
Rebuild using `design/pages/dashboard-superintendent.tsx` (1666 lines), `dashboard-superintendent-config.tsx` (814 lines):
- Application stats overview
- Pending applications list
- Room occupancy overview
- Leave management
- Config page with leave types and blackout dates (PUT/DELETE working — CHANGE-5)

**Test**: Config page has all CRUD operations

#### Task 10.12: Trustee Dashboard
Rebuild using `design/pages/dashboard-trustee.tsx` (1665 lines):
- Cross-vertical application overview
- Interview scheduling
- Allocation management
- Reports section

#### Task 10.13: Domain Components
Adapt from `design/components/`:
- `tracking/` — TrackingIdForm, OtpVerification, TrackingPage
- `fees/` — PaymentFlowModal (440 lines), PaymentReceipt (351 lines)
- `documents/` — DocumentUploadCard, DocumentPreviewModal, DocumentUploadsList, EnhancedFileUpload, Undertaking components
- `print/` — Receipt, A4Page, PrintContainer, Letter

#### Task 10.14: Translation Key Parity + Hardcoded String Scan
- Add all translation keys used by rebuilt pages to messages/en/*.json
- Add corresponding Hindi translations to messages/hi/*.json
- Run hardcoded string scan — zero violations
- Run translation parity check — en/ and hi/ have matching keys

**Test**: T8 (translation key convention), D2 (no hardcoded strings)

#### Task 10.15: Visual Verification + Gate
- Run dev server, visually verify each page matches design reference
- Run full phase gate: typecheck → lint → unit tests → integration → build
- Verify CI passes
- Commit and push

## Execution Order

```
10.1 (CSS) → 10.2 (UI) → 10.3 (Forms) → 10.4 (Feedback/Data)
     ↓
10.5 (Layout/Nav) → 10.6 (Landing) → 10.7 (Login) → 10.8 (Apply)
     ↓
10.9 (Track) → 10.10 (Student) → 10.11 (Superintendent) → 10.12 (Trustee)
     ↓
10.13 (Domain Components) → 10.14 (i18n) → 10.15 (Gate)
```

Tasks 10.1-10.5 (shared components) can be done first, then pages 10.6-10.12 can be parallelized.

## Bug Prevention Checklist

| Bug | Safeguard in this phase |
|-----|------------------------|
| BUG-003 | Navigation links use `/student/...` not `/dashboard/student/...` |
| BUG-004 | Parent dashboard shows empty state message not error |
| BUG-005 | Track page state machine resolves all states |
| BUG-011 | Student room page shows "pending" not error |
| BUG-012 | LanguageToggle uses router.refresh() |
| CHANGE-3 | Application form email field always required |
| CHANGE-5 | Config page has PUT/DELETE handlers |
| Audit: hardcoded strings | All text through t() |

## Estimated Size

~15,000 lines of frontend code across ~80 files (components + pages + translations).

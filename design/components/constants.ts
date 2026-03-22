// components/constants.ts - Constants for component configuration

// Component size mappings
export const SIZE_CLASSES = {
  sm: 'text-sm px-3 py-1.5',
  md: 'text-base px-4 py-2',
  lg: 'text-lg px-6 py-3',
} as const;

// Button variant mappings
export const BUTTON_VARIANT_CLASSES = {
  primary: 'bg-gold-500 text-navy-950 hover:bg-gold-600 focus:ring-gold-500',
  secondary: 'bg-white text-navy-700 border border-gray-300 hover:bg-gray-50 focus:ring-navy-500',
  ghost: 'text-navy-700 hover:bg-gray-100 focus:ring-navy-500',
  destructive: 'bg-red-500 text-white hover:bg-red-600 focus:ring-red-500',
} as const;

// Input variant mappings (includes hover states with disabled override)
export const INPUT_VARIANT_CLASSES = {
  default: 'border-gray-300 hover:border-gray-400 disabled:hover:border-gray-300 focus:border-gold-500 focus:ring-gold-500',
  error: 'border-red-500 hover:border-red-600 disabled:hover:border-red-500 focus:border-red-500 focus:ring-red-500',
  success: 'border-green-500 hover:border-green-600 disabled:hover:border-green-500 focus:border-green-500 focus:ring-green-500',
} as const;

// Status badge mappings
export const STATUS_BADGE_CLASSES = {
  default: 'bg-gray-100 text-gray-800',
  success: 'bg-green-100 text-green-800',
  warning: 'bg-yellow-100 text-yellow-800',
  error: 'bg-red-100 text-red-800',
  info: 'bg-blue-100 text-blue-800',
} as const;

// Form field spacing
export const FORM_SPACING = {
  field: 'space-y-1',
  group: 'space-y-4',
  section: 'space-y-6',
} as const;

// Animation durations
export const ANIMATIONS = {
  fast: 'duration-150',
  normal: 'duration-200',
  slow: 'duration-300',
} as const;

// Z-index layers
export const Z_INDEX = {
  dropdown: 'z-50',
  sticky: 'z-40',
  modal: 'z-50',
  tooltip: 'z-50',
  toast: 'z-50',
} as const;

// Container widths
export const CONTAINER_WIDTHS = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  '3xl': 'max-w-3xl',
  '4xl': 'max-w-4xl',
  '5xl': 'max-w-5xl',
  '6xl': 'max-w-6xl',
  '7xl': 'max-w-7xl',
  full: 'max-w-full',
} as const;

// Shadow levels
export const SHADOWS = {
  none: 'shadow-none',
  sm: 'shadow-sm',
  md: 'shadow-md',
  lg: 'shadow-lg',
  xl: 'shadow-xl',
  card: 'shadow-card',
} as const;

// Border radius
export const BORDER_RADIUS = {
  none: 'rounded-none',
  sm: 'rounded-sm',
  md: 'rounded-md',
  lg: 'rounded-lg',
  xl: 'rounded-xl',
  '2xl': 'rounded-2xl',
  '3xl': 'rounded-3xl',
  full: 'rounded-full',
} as const;

// Application statuses
export const APPLICATION_STATUSES = {
  DRAFT: 'Draft',
  SUBMITTED: 'Submitted',
  REVIEW: 'Under Review',
  INTERVIEW: 'Interview Scheduled',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
  ARCHIVED: 'Archived',
} as const;

// Payment statuses
export const PAYMENT_STATUSES = {
  PAID: 'Paid',
  UNPAID: 'Unpaid',
  OVERDUE: 'Overdue',
  PARTIAL: 'Partial',
} as const;

// Document verification statuses
export const VERIFICATION_STATUSES = {
  PENDING: 'Pending',
  VERIFIED: 'Verified',
  REJECTED: 'Rejected',
  EXPIRED: 'Expired',
} as const;

// Hostel verticals
export const HOSTEL_VERTICALS = {
  BOYS_HOSTEL: 'Boys Hostel',
  GIRLS_ASHRAM: 'Girls Ashram',
  DHARAMSHALA: 'Dharamshala',
} as const;

// User roles
export const USER_ROLES = {
  STUDENT: 'Student',
  SUPERINTENDENT: 'Superintendent',
  TRUSTEE: 'Trustee',
  ACCOUNTS: 'Accounts',
  PARENT: 'Parent',
  ADMIN: 'Administrator',
} as const;

// Fee heads
export const FEE_HEADS = {
  HOSTEL_FEES: 'Hostel Fees',
  SECURITY_DEPOSIT: 'Security Deposit',
  MAINTENANCE: 'Maintenance Fee',
  MESS_FEES: 'Mess Fees',
  LATE_FEE: 'Late Fee',
} as const;
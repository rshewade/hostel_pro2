/**
 * Data Retention and Timezone Conventions
 * 
 * Defines retention policies, data lifecycle, and timezone handling
 * for documents and undertakings in compliance with DPDP Act.
 */

// ============================================================================
// DATA RETENTION POLICIES
// ============================================================================

/**
 * Retention Policy Categories
 * 
 * Each category defines how long data should be retained and the
 * lifecycle events (archive, delete) that should occur.
 */

export type RetentionCategory =
  | 'application_documents'           // Documents uploaded during application
  | 'student_records'                  // Active student records
  | 'financial_records'                // Payment and financial documents
  | 'audit_logs'                       // System audit logs
  | 'consent_records'                  // DPDP consent history
  | 'archived_applications'            // Rejected/exited applications
  | 'undertakings'                     // Acknowledged undertakings
  | 'signatures'                       // Digital signatures
  | 'preview_cache'                    // Generated document previews
  | 'temporary_files'                  // Temporary upload files;

export interface RetentionPolicy {
  category: RetentionCategory;
  
  // Retention period in months (0 = indefinite)
  retentionPeriodMonths: number;
  
  // Auto-archive after X months
  autoArchive: boolean;
  archiveAfterMonths: number;
  
  // Auto-delete after X months
  autoDelete: boolean;
  deleteAfterMonths: number;
  
  // Requires manual approval before deletion
  requiresManualApproval: boolean;
  
  // Compliance requirements (laws, regulations)
  complianceRequirements: string[];
  
  // Data minimization strategy (what to strip after archival)
  dataMinimization?: {
    fieldsToStrip: string[];
    pseudonymizationFields?: string[];
  };
  
  // Notification before deletion (days in advance)
  deletionNoticeDays?: number;
  
  // Who can override this policy
  overrideRoles: string[];
}

/**
 * Default Retention Policies
 */
export const RETENTION_POLICIES: Record<RetentionCategory, RetentionPolicy> = {
  // Application documents: Keep for 7 years after admission or 1 year after rejection
  application_documents: {
    category: 'application_documents',
    retentionPeriodMonths: 84, // 7 years for admitted, 12 months for rejected
    autoArchive: true,
    archiveAfterMonths: 24, // Archive after 2 years
    autoDelete: false,
    deleteAfterMonths: 84,
    requiresManualApproval: true,
    complianceRequirements: [
      'DPDP Act Section 4.2(b) - Data retention',
      'Educational Records Retention Policy',
      'Hostel Management Regulations'
    ],
    dataMinimization: {
      fieldsToStrip: [],
    },
    deletionNoticeDays: 30,
    overrideRoles: ['legal_compliance', 'admin'],
  },

  // Student records: Keep for 7 years after exit
  student_records: {
    category: 'student_records',
    retentionPeriodMonths: 84, // 7 years
    autoArchive: true,
    archiveAfterMonths: 12, // Archive 1 year after exit
    autoDelete: false,
    deleteAfterMonths: 84,
    requiresManualApproval: true,
    complianceRequirements: [
      'DPDP Act Section 4.2(b) - Data retention',
      'Educational Records Retention Policy',
      'Right to Information Act'
    ],
    deletionNoticeDays: 60,
    overrideRoles: ['legal_compliance', 'admin', 'trustee'],
  },

  // Financial records: Keep for 7 years (tax compliance)
  financial_records: {
    category: 'financial_records',
    retentionPeriodMonths: 84, // 7 years for tax compliance
    autoArchive: true,
    archiveAfterMonths: 36, // Archive after 3 years
    autoDelete: false,
    deleteAfterMonths: 84,
    requiresManualApproval: true,
    complianceRequirements: [
      'Income Tax Act Section 139(9)',
      'DPDP Act Section 4.2(b)',
      'Financial Records Retention Policy'
    ],
    deletionNoticeDays: 60,
    overrideRoles: ['legal_compliance', 'admin', 'accounts', 'trustee'],
  },

  // Audit logs: Keep for 3 years
  audit_logs: {
    category: 'audit_logs',
    retentionPeriodMonths: 36, // 3 years
    autoArchive: true,
    archiveAfterMonths: 12, // Archive after 1 year
    autoDelete: true,
    deleteAfterMonths: 36,
    requiresManualApproval: false,
    complianceRequirements: [
      'DPDP Act Section 8 - Accountability',
      'System Audit Requirements'
    ],
    dataMinimization: {
      fieldsToStrip: ['ipAddress', 'userAgent', 'deviceFingerprint'],
    },
    deletionNoticeDays: 30,
    overrideRoles: ['legal_compliance', 'admin'],
  },

  // Consent records: Keep for 5 years after last consent
  consent_records: {
    category: 'consent_records',
    retentionPeriodMonths: 60, // 5 years
    autoArchive: true,
    archiveAfterMonths: 24, // Archive after 2 years
    autoDelete: false,
    deleteAfterMonths: 60,
    requiresManualApproval: true,
    complianceRequirements: [
      'DPDP Act Section 5 - Consent Management',
      'GDPR Article 7 - Conditions for Consent'
    ],
    deletionNoticeDays: 60,
    overrideRoles: ['legal_compliance', 'admin'],
  },

  // Archived applications (rejected/exited): Keep for 1 year then delete PII
  archived_applications: {
    category: 'archived_applications',
    retentionPeriodMonths: 12, // 1 year
    autoArchive: true,
    archiveAfterMonths: 0, // Archive immediately
    autoDelete: true,
    deleteAfterMonths: 12,
    requiresManualApproval: false,
    complianceRequirements: [
      'DPDP Act Section 4.2(b) - Data minimization'
    ],
    dataMinimization: {
      fieldsToStrip: ['mobile', 'email', 'address', 'parentDetails'],
      pseudonymizationFields: ['name', 'trackingNumber'],
    },
    deletionNoticeDays: 30,
    overrideRoles: ['legal_compliance', 'admin'],
  },

  // Undertakings: Keep for 5 years after student exit
  undertakings: {
    category: 'undertakings',
    retentionPeriodMonths: 60, // 5 years
    autoArchive: true,
    archiveAfterMonths: 12, // Archive after 1 year
    autoDelete: false,
    deleteAfterMonths: 60,
    requiresManualApproval: true,
    complianceRequirements: [
      'DPDP Act Section 5 - Consent Management',
      'Legal Document Retention Policy'
    ],
    deletionNoticeDays: 60,
    overrideRoles: ['legal_compliance', 'admin'],
  },

  // Digital signatures: Keep for 5 years
  signatures: {
    category: 'signatures',
    retentionPeriodMonths: 60, // 5 years
    autoArchive: true,
    archiveAfterMonths: 12, // Archive after 1 year
    autoDelete: false,
    deleteAfterMonths: 60,
    requiresManualApproval: true,
    complianceRequirements: [
      'DPDP Act Section 5 - Consent Management',
      'Digital Signature Guidelines'
    ],
    deletionNoticeDays: 60,
    overrideRoles: ['legal_compliance', 'admin'],
  },

  // Preview cache: Delete after 30 days
  preview_cache: {
    category: 'preview_cache',
    retentionPeriodMonths: 1, // 1 month
    autoArchive: false,
    archiveAfterMonths: 0,
    autoDelete: true,
    deleteAfterMonths: 1,
    requiresManualApproval: false,
    complianceRequirements: [],
    deletionNoticeDays: 0,
    overrideRoles: ['admin'],
  },

  // Temporary files: Delete after 24 hours
  temporary_files: {
    category: 'temporary_files',
    retentionPeriodMonths: 0, // Less than 1 month
    autoArchive: false,
    archiveAfterMonths: 0,
    autoDelete: true,
    deleteAfterMonths: 0,
    requiresManualApproval: false,
    complianceRequirements: [],
    deletionNoticeDays: 0,
    overrideRoles: ['admin'],
  },
} as const;

// ============================================================================
// DATA LIFECYCLE MANAGEMENT
// ============================================================================

export interface DataLifecycle {
  id: string;
  entityId: string;
  entityType: string;
  category: RetentionCategory;
  
  // Lifecycle stages
  createdAt: string;
  archivedAt?: string;
  deletedAt?: string;
  
  // Expiry
  expiresAt: string;
  
  // Status
  status: 'active' | 'archived' | 'expired' | 'deleted';
  
  // Retention policy
  retentionPolicy: RetentionPolicy;
  
  // Extension tracking
  isExtended: boolean;
  extendedBy?: string;
  extendedAt?: string;
  extendedUntil?: string;
  extensionReason?: string;
  
  // Deletion tracking
  deletionScheduledFor?: string;
  deletionNotifiedAt?: string;
  deletionApprovedBy?: string;
  deletionApprovedAt?: string;
}

export interface DataRetentionInfo {
  category: RetentionCategory;
  createdAt: string;
  expiresAt: string;
  isArchived: boolean;
  archivedAt?: string;
  isDeleted: boolean;
  deletedAt?: string;
  retentionPolicy: RetentionPolicy;
  daysUntilExpiry: number;
  daysUntilArchive: number;
  canDelete: boolean;
  requiresApproval: boolean;
}

// ============================================================================
// DATA DELETION REQUESTS
// ============================================================================

export type DeletionRequestStatus = 'pending' | 'approved' | 'rejected' | 'completed' | 'cancelled';

export interface DataDeletionRequest {
  id: string;
  entityType: string;
  entityId: string;
  category: RetentionCategory;
  
  status: DeletionRequestStatus;
  
  requestedBy: {
    id: string;
    name: string;
    role: string;
  };
  requestedAt: string;
  requestReason: string;
  
  approvedBy?: {
    id: string;
    name: string;
    role: string;
  };
  approvedAt?: string;
  approvalNotes?: string;
  
  rejectedBy?: {
    id: string;
    name: string;
    role: string;
  };
  rejectedAt?: string;
  rejectionReason?: string;
  
  scheduledFor?: string;
  completedAt?: string;
  deletedBy?: string;
  
  // Deletion report
  deletionReport?: {
    recordsDeleted: number;
    filesDeleted: number;
    storageFreed: number; // in bytes
    pseudonymizedRecords: number;
  };
}

// ============================================================================
// TIMEZONE CONVENTIONS
// ============================================================================

/**
 * Timezone Standards
 * 
 * All timestamps are stored in UTC and converted to IST for display
 */
export const TIMEZONE_STANDARDS = {
  STORAGE_TIMEZONE: 'UTC',
  DISPLAY_TIMEZONE: 'Asia/Kolkata',
  DATABASE_TIMEZONE: 'UTC',
  API_TIMEZONE: 'UTC',
  REPORTING_TIMEZONE: 'Asia/Kolkata',
  AUDIT_TIMEZONE: 'UTC',
} as const;

export type TimezoneStandard = keyof typeof TIMEZONE_STANDARDS;

/**
 * Timestamp Information
 */
export interface TimestampInfo {
  utc: string;                      // ISO 8601 UTC timestamp
  ist: string;                      // ISO 8601 IST timestamp
  formattedIst: string;            // Formatted IST date/time
  timezone: string;                 // Timezone identifier
  offset: string;                   // UTC offset (e.g., +05:30)
  unixTimestamp: number;            // Unix timestamp in seconds
  dayOfWeek: string;                // Day of week
}

/**
 * Convert UTC timestamp to TimestampInfo
 */
export function toTimestampInfo(utcTimestamp: string): TimestampInfo {
  const date = new Date(utcTimestamp);
  const istOffset = 5.5 * 60 * 60 * 1000; // +05:30 in milliseconds
  const istDate = new Date(date.getTime() + istOffset);
  
  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  
  return {
    utc: utcTimestamp,
    ist: istDate.toISOString(),
    formattedIst: istDate.toLocaleString('en-IN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
      timeZone: 'Asia/Kolkata'
    }),
    timezone: 'Asia/Kolkata',
    offset: '+05:30',
    unixTimestamp: Math.floor(date.getTime() / 1000),
    dayOfWeek: daysOfWeek[istDate.getDay()],
  };
}

/**
 * Convert IST date to UTC timestamp
 */
export function istToUtc(istDateString: string): string {
  // Handle ISO 8601 strings with timezone offset
  const istDate = new Date(istDateString);
  
  // If the string has a timezone offset, JavaScript will parse it correctly
  // We just need to return it as UTC
  const utcTime = istDate.getTime() - (istDate.getTimezoneOffset() * 60 * 1000);
  const utcDate = new Date(utcTime);
  
  return utcDate.toISOString();
}

/**
 * Get current UTC timestamp
 */
export function nowUtc(): string {
  return new Date().toISOString();
}

/**
 * Get current IST timestamp info
 */
export function nowIst(): TimestampInfo {
  return toTimestampInfo(nowUtc());
}

/**
 * Add months to a timestamp
 */
export function addMonths(utcTimestamp: string, months: number): string {
  const date = new Date(utcTimestamp);
  date.setMonth(date.getMonth() + months);
  return date.toISOString();
}

/**
 * Calculate days difference
 */
export function daysBetween(from: string, to: string): number {
  const fromDate = new Date(from);
  const toDate = new Date(to);
  const diffTime = Math.abs(toDate.getTime() - fromDate.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

// ============================================================================
// DATE FORMATTING HELPERS
// ============================================================================

/**
 * Format date for display (IST)
 */
export function formatDateIst(utcTimestamp: string, format: 'short' | 'long' | 'relative' = 'short'): string {
  const timestamp = toTimestampInfo(utcTimestamp);
  
  switch (format) {
    case 'short':
      return timestamp.formattedIst;
      
    case 'long':
      return `${timestamp.dayOfWeek}, ${timestamp.formattedIst}`;
      
    case 'relative':
      const now = nowIst();
      const daysAgo = Math.floor((now.unixTimestamp - timestamp.unixTimestamp) / 86400);
      
      if (daysAgo === 0) return 'Today';
      if (daysAgo === 1) return 'Yesterday';
      if (daysAgo < 7) return `${daysAgo} days ago`;
      if (daysAgo < 30) return `${Math.floor(daysAgo / 7)} weeks ago`;
      if (daysAgo < 365) return `${Math.floor(daysAgo / 30)} months ago`;
      return `${Math.floor(daysAgo / 365)} years ago`;
      
    default:
      return timestamp.formattedIst;
  }
}

/**
 * Format date range for display
 */
export function formatDateRangeIst(start: string, end: string): string {
  const startDate = toTimestampInfo(start);
  const endDate = toTimestampInfo(end);
  
  const sameDay = startDate.ist.split('T')[0] === endDate.ist.split('T')[0];
  const sameMonth = startDate.ist.slice(0, 7) === endDate.ist.slice(0, 7);
  const sameYear = startDate.ist.slice(0, 4) === endDate.ist.slice(0, 4);
  
  if (sameDay) {
    return startDate.formattedIst;
  } else if (sameMonth && sameYear) {
    return `${startDate.ist.split('T')[0]} to ${endDate.ist.split('T')[0]}`;
  } else {
    return `${startDate.ist.split('T')[0]} to ${endDate.ist.split('T')[0]}`;
  }
}

// ============================================================================
// RETENTION POLICY HELPERS
// ============================================================================

/**
 * Get retention policy for category
 */
export function getRetentionPolicy(category: RetentionCategory): RetentionPolicy {
  return RETENTION_POLICIES[category];
}

/**
 * Calculate expiry date based on retention policy
 */
export function calculateExpiryDate(
  createdAt: string,
  category: RetentionCategory,
  exitDate?: string
): string {
  const policy = getRetentionPolicy(category);
  
  // For student records, expiry is based on exit date
  if (category === 'student_records' && exitDate) {
    return addMonths(exitDate, policy.retentionPeriodMonths);
  }
  
  // For application documents, check if admitted or rejected
  if (category === 'application_documents') {
    // If rejected, use 12 months. If admitted, use 84 months.
    // This would be determined by application status
    return addMonths(createdAt, policy.retentionPeriodMonths);
  }
  
  // Default: use retention period from creation date
  return addMonths(createdAt, policy.retentionPeriodMonths);
}

/**
 * Calculate archive date based on retention policy
 */
export function calculateArchiveDate(
  createdAt: string,
  category: RetentionCategory
): string | null {
  const policy = getRetentionPolicy(category);
  
  if (!policy.autoArchive) {
    return null;
  }
  
  return addMonths(createdAt, policy.archiveAfterMonths);
}

/**
 * Get retention info for entity
 */
export function getRetentionInfo(
  createdAt: string,
  category: RetentionCategory,
  exitDate?: string
): DataRetentionInfo {
  const policy = getRetentionPolicy(category);
  const now = nowUtc();
  
  const expiryDate = calculateExpiryDate(createdAt, category, exitDate);
  const archiveDate = calculateArchiveDate(createdAt, category);
  
  const isArchived = archiveDate ? new Date(archiveDate) < new Date(now) : false;
  const isDeleted = new Date(expiryDate) < new Date(now);

  const daysUntilExpiry = daysBetween(now, expiryDate);
  const daysUntilArchive = archiveDate ? daysBetween(now, archiveDate) : -1;

  return {
    category,
    createdAt,
    expiresAt: expiryDate,
    isArchived,
    archivedAt: (isArchived && archiveDate) ? archiveDate : undefined,
    isDeleted,
    deletedAt: isDeleted ? expiryDate : undefined,
    retentionPolicy: policy,
    daysUntilExpiry,
    daysUntilArchive,
    canDelete: policy.autoDelete && daysUntilExpiry <= 0,
    requiresApproval: policy.requiresManualApproval,
  };
}

// ============================================================================
// EXPORT ALL CONSTANTS AND FUNCTIONS
// ============================================================================

// All types are already exported individually above


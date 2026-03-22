/**
 * Audit and Consent Metadata Model
 * 
 * Defines comprehensive metadata for documents and undertakings including:
 * - Device/context information capture
 * - DPDP consent logging
 * - Digital signature tracking
 * - Audit trail management
 * - Version control
 */

// ============================================================================
// ACTOR AND ROLE TYPES
// ============================================================================

export type ActorRole = 
  | 'applicant'
  | 'student'
  | 'parent'
  | 'local_guardian'
  | 'superintendent'
  | 'trustee'
  | 'accounts'
  | 'legal_compliance'
  | 'system'
  | 'admin';

export interface Actor {
  id: string;
  name: string;
  role: ActorRole;
  userId?: string;
  email?: string;
  mobile?: string;
}

// ============================================================================
// DEVICE AND CONTEXT INFORMATION
// ============================================================================

export interface DeviceContext {
  ip?: string;
  userAgent?: string;
  browser?: string;
  browserVersion?: string;
  os?: string;
  osVersion?: string;
  deviceType?: 'desktop' | 'mobile' | 'tablet' | 'unknown';
  deviceFingerprint?: string;
  geolocation?: {
    city?: string;
    region?: string;
    country?: string;
    latitude?: number;
    longitude?: number;
  };
  timezone?: string;
  screenResolution?: string;
  language?: string;
}

export interface SessionInfo {
  sessionId: string;
  startedAt: string;
  expiresAt?: string;
  ip?: string;
  lastActivityAt: string;
}

// ============================================================================
// DPDP CONSENT TRACKING
// ============================================================================

export type ConsentType = 
  | 'data_collection'
  | 'data_processing'
  | 'data_sharing'
  | 'document_upload'
  | 'undertaking_acknowledgement'
  | 'third_party_service'
  | 'analytics_tracking'
  | 'marketing_communication';

export type ConsentPurpose = 
  | 'admission_processing'
  | 'hostel_management'
  | 'safety_monitoring'
  | 'financial_management'
  | 'communication'
  | 'compliance'
  | 'legal_requirements';

export interface DPDPConsent {
  id: string;
  consentType: ConsentType;
  purpose: ConsentPurpose;
  dataCategories: string[];
  version: string;
  grantedAt: string;
  grantedBy: Actor;
  expiresAt?: string;
  withdrawnAt?: string;
  withdrawnBy?: Actor;
  withdrawalReason?: string;
  consentText: string;
  legalBasis?: string;
  deviceContext: DeviceContext;
  sessionInfo: SessionInfo;
}

export interface ConsentHistory {
  consents: DPDPConsent[];
  currentVersion: string;
  requiresReconsent: boolean;
  lastReconsentRequired?: string;
}

// ============================================================================
// DIGITAL SIGNATURE
// ============================================================================

export type SignatureType = 'typed' | 'drawn' | 'digital_certificate' | 'biometric';

export interface DigitalSignature {
  id: string;
  type: SignatureType;
  value: string;
  signedAt: string;
  signedBy: Actor;
  ipAddress?: string;
  deviceFingerprint?: string;
  userAgent?: string;
  signatureHash?: string;
  certificateId?: string;
  expiryDate?: string;
}

// ============================================================================
// AUDIT LOG ENTRY
// ============================================================================

export type AuditActionType =
  | 'document_upload'
  | 'document_verify'
  | 'document_reject'
  | 'document_download'
  | 'document_view'
  | 'document_delete'
  | 'undertaking_acknowledge'
  | 'consent_grant'
  | 'consent_withdraw'
  | 'signature_capture'
  | 'status_change'
  | 'metadata_update'
  | 'version_create'
  | 'print_request'
  | 'export_request'
  | 'bulk_operation';

export interface AuditLogEntry {
  id: string;
  entityType: 'document' | 'undertaking' | 'application' | 'consent';
  entityId: string;
  action: AuditActionType;
  actor: Actor;
  timestamp: string;
  previousState?: Record<string, any>;
  newState?: Record<string, any>;
  changes?: Record<string, { from: any; to: any }>;
  deviceContext: DeviceContext;
  sessionInfo: SessionInfo;
  reason?: string;
  relatedEntityId?: string;
  relatedEntityType?: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface AuditTrail {
  id: string;
  entityId: string;
  entityType: string;
  entries: AuditLogEntry[];
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// VERSION CONTROL
// ============================================================================

export interface VersionInfo {
  version: string;
  createdAt: string;
  createdBy: Actor;
  changeType: 'initial' | 'update' | 'restore' | 'reversion';
  description?: string;
  checksum?: string;
  deviceContext: DeviceContext;
}

export interface VersionHistory {
  currentVersion: string;
  versions: VersionInfo[];
  canRollback: boolean;
  rollbackDeadline?: string;
}

// ============================================================================
// DOCUMENT METADATA (COMPREHENSIVE)
// ============================================================================

export interface DocumentAuditMetadata {
  uploadedAt?: string;
  uploadedBy?: Actor;
  uploadDeviceContext?: DeviceContext;
  uploadSessionInfo?: SessionInfo;
  
  verifiedAt?: string;
  verifiedBy?: Actor;
  verifyDeviceContext?: DeviceContext;
  verifySessionInfo?: SessionInfo;
  
  rejectedAt?: string;
  rejectedBy?: Actor;
  rejectDeviceContext?: DeviceContext;
  rejectSessionInfo?: SessionInfo;
  rejectionReason?: string;
  
  lastViewedAt?: string;
  lastViewedBy?: Actor;
  viewCount: number;
  
  downloadedAt?: string;
  downloadedBy?: Actor;
  downloadCount: number;
  
  fileName?: string;
  fileSize?: number;
  fileHash?: string;
  fileMimeType?: string;
  virusScanStatus?: 'pending' | 'scanning' | 'clean' | 'infected';
  virusScanTimestamp?: string;
  
  version?: string;
  versionHistory?: VersionHistory;
  
  auditTrail?: AuditTrail;
  
  createdAt: string;
  updatedAt: string;
  expiresAt?: string;
  
  dpdpConsent?: ConsentHistory;
  digitalSignature?: DigitalSignature;
}

export interface DocumentWithMetadata {
  id: string;
  type: string;
  title: string;
  status: string;
  required: boolean;
  metadata: DocumentAuditMetadata;
  fileUrl?: string;
  previewUrl?: string;
}

// ============================================================================
// UNDERTAKING METADATA (COMPREHENSIVE)
// ============================================================================

export interface UndertakingAuditMetadata {
  acknowledgedAt?: string;
  acknowledgedBy?: Actor;
  acknowledgeDeviceContext?: DeviceContext;
  acknowledgeSessionInfo?: SessionInfo;
  
  required: boolean;
  dueDate?: string;
  overdueDate?: string;
  
  isBlocking: boolean;
  blockReason?: string;
  
  version?: string;
  versionHistory?: VersionHistory;
  
  completedAt?: string;
  completedBy?: Actor;
  
  viewCount: number;
  lastViewedAt?: string;
  lastViewedBy?: Actor;
  
  auditTrail?: AuditTrail;
  
  createdAt: string;
  updatedAt: string;
  expiresAt?: string;
  
  dpdpConsent?: ConsentHistory;
  digitalSignature?: DigitalSignature;
}

export interface UndertakingWithMetadata {
  id: string;
  type: string;
  title: string;
  description: string;
  status: string;
  category: string;
  metadata: UndertakingAuditMetadata;
  content?: string;
  consentItems?: string[];
}

// ============================================================================
// DATA RETENTION POLICY
// ============================================================================

export type RetentionCategory =
  | 'application_documents'
  | 'student_records'
  | 'financial_records'
  | 'audit_logs'
  | 'consent_records'
  | 'archived_applications';

export interface RetentionPolicy {
  category: RetentionCategory;
  retentionPeriodMonths: number;
  autoArchive: boolean;
  archiveAfterMonths: number;
  autoDelete: boolean;
  deleteAfterMonths: number;
  requiresManualApproval: boolean;
  complianceRequirements: string[];
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
  extensionReason?: string;
  extendedUntil?: string;
}

// ============================================================================
// TIME ZONE CONVENTIONS
// ============================================================================

export const TIMEZONE_CONVENTIONS = {
  STORAGE_TIMEZONE: 'UTC',
  DISPLAY_TIMEZONE: 'Asia/Kolkata',
  DATABASE_TIMEZONE: 'UTC',
  API_TIMEZONE: 'UTC',
  REPORTING_TIMEZONE: 'Asia/Kolkata',
} as const;

export type TimezoneConvention = keyof typeof TIMEZONE_CONVENTIONS;

export interface TimestampInfo {
  utc: string;
  ist: string;
  formattedIst: string;
  timezone: string;
  offset: string;
  unixTimestamp: number;
  dayOfWeek: string;
}

export function convertToIST(utcTimestamp: string): string {
  const date = new Date(utcTimestamp);
  return date.toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });
}

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
    dayOfWeek: daysOfWeek[istDate.getDay()]
  };
}

// ============================================================================
// API REQUEST CONTEXT
// ============================================================================

export interface APIRequestContext {
  requestId: string;
  timestamp: string;
  clientIp: string;
  userAgent: string;
  sessionId: string;
  userId?: string;
  role?: ActorRole;
  deviceContext: DeviceContext;
}

export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  metadata?: {
    requestId: string;
    timestamp: string;
    processingTimeMs: number;
    version: string;
  };
}

// ============================================================================
// WEBSOCKET EVENT TYPES
// ============================================================================

export type WebSocketEventType =
  | 'document_status_update'
  | 'document_upload_progress'
  | 'undertaking_status_update'
  | 'consent_update'
  | 'audit_log_entry'
  | 'system_notification'
  | 'session_expiry';

export interface WebSocketEvent<T = any> {
  type: WebSocketEventType;
  eventId: string;
  timestamp: string;
  entityType?: string;
  entityId?: string;
  data?: T;
  actor?: Actor;
}

export interface WebSocketSubscription {
  id: string;
  entityType: string;
  entityId: string;
  eventTypes: WebSocketEventType[];
  filters?: Record<string, any>;
}

// ============================================================================
// ERROR TYPES
// ============================================================================

export type ErrorCode =
  | 'INVALID_DOCUMENT_TYPE'
  | 'FILE_SIZE_EXCEEDED'
  | 'VIRUS_DETECTED'
  | 'CONSENT_REQUIRED'
  | 'SIGNATURE_REQUIRED'
  | 'VERSION_MISMATCH'
  | 'DUPLICATE_UPLOAD'
  | 'EXPIRED_DOCUMENT'
  | 'BLOCKING_UNDERTAKING'
  | 'PERMISSION_DENIED'
  | 'VALIDATION_ERROR'
  | 'SYSTEM_ERROR';

export interface ErrorMetadata {
  code: ErrorCode;
  message: string;
  timestamp: string;
  context?: Record<string, any>;
  stackTrace?: string;
  requestId?: string;
}

// ============================================================================
// EXPORT ALL TYPES
// ============================================================================

// All types are already exported individually above

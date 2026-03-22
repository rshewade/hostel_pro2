/**
 * API and WebSocket Integration Documentation
 * 
 * Describes API endpoints, WebSocket integration, data formats,
 * and error handling patterns for documents and undertakings.
 */

// ============================================================================
// API ENDPOINT DEFINITIONS
// ============================================================================

/**
 * Base URL: /api/v1
 * All endpoints require authentication unless marked as public
 */

// ----------------------------------------------------------------------------
// Document Management Endpoints
// ----------------------------------------------------------------------------

export interface DocumentUploadRequest {
  applicationId: string;
  documentType: string;
  file: File;
  metadata?: {
    fileName?: string;
    uploadedBy?: string;
    deviceContext?: {
      userAgent?: string;
      deviceType?: string;
      ip?: string;
    };
  };
}

export interface DocumentUploadResponse {
  id: string;
  applicationId: string;
  documentType: string;
  status: 'uploading' | 'uploaded' | 'verifying' | 'verified' | 'rejected' | 'error';
  metadata: {
    uploadedAt: string;
    uploadedBy: string;
    fileName: string;
    fileSize: number;
    fileHash: string;
    uploadDeviceContext: any;
  };
  fileUrl: string;
  previewUrl?: string;
}

export interface DocumentVerifyRequest {
  documentId: string;
  verified: boolean;
  rejectionReason?: string;
  notes?: string;
}

export interface DocumentVerifyResponse {
  id: string;
  status: 'verified' | 'rejected';
  verifiedAt: string;
  verifiedBy: string;
  rejectionReason?: string;
  notes?: string;
}

export interface DocumentListQuery {
  applicationId?: string;
  status?: string;
  type?: string;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface DocumentListResponse {
  documents: DocumentUploadResponse[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * Document Endpoints
 */
export const DOCUMENT_API = {
  /**
   * POST /api/v1/documents/upload
   * Upload a document for an application
   * 
   * Uploads: multipart/form-data
   * 
   * Success: 201 Created
   * Error: 400, 401, 403, 413, 500
   */
  UPLOAD: '/api/v1/documents/upload',

  /**
   * GET /api/v1/documents/:id
   * Get document details with full metadata
   * 
   * Success: 200 OK
   * Error: 401, 403, 404
   */
  GET: '/api/v1/documents/:id',

  /**
   * GET /api/v1/documents
   * List documents with optional filtering
   * 
   * Query params: applicationId, status, type, page, pageSize, sortBy, sortOrder
   * 
   * Success: 200 OK
   * Error: 401, 403
   */
  LIST: '/api/v1/documents',

  /**
   * PATCH /api/v1/documents/:id/verify
   * Verify or reject a document
   * 
   * Body: { verified: boolean, rejectionReason?: string, notes?: string }
   * 
   * Success: 200 OK
   * Error: 400, 401, 403, 404, 409
   */
  VERIFY: '/api/v1/documents/:id/verify',

  /**
   * DELETE /api/v1/documents/:id
   * Delete a document (soft delete)
   * 
   * Success: 204 No Content
   * Error: 401, 403, 404, 409
   */
  DELETE: '/api/v1/documents/:id',

  /**
   * GET /api/v1/documents/:id/download
   * Download document file
   * 
   * Success: 200 OK (file stream)
   * Error: 401, 403, 404
   */
  DOWNLOAD: '/api/v1/documents/:id/download',

  /**
   * GET /api/v1/documents/:id/preview
   * Get document preview
   * 
   * Success: 200 OK (image or PDF preview)
   * Error: 401, 403, 404, 415
   */
  PREVIEW: '/api/v1/documents/:id/preview',

  /**
   * GET /api/v1/documents/:id/audit
   * Get audit trail for document
   * 
   * Query params: limit, offset
   * 
   * Success: 200 OK
   * Error: 401, 403, 404
   */
  AUDIT: '/api/v1/documents/:id/audit',

  /**
   * GET /api/v1/documents/:id/versions
   * Get version history for document
   * 
   * Success: 200 OK
   * Error: 401, 403, 404
   */
  VERSIONS: '/api/v1/documents/:id/versions',

  /**
   * POST /api/v1/documents/:id/rollback
   * Rollback to previous version
   * 
   * Body: { version: string, reason?: string }
   * 
   * Success: 200 OK
   * Error: 400, 401, 403, 404, 409
   */
  ROLLBACK: '/api/v1/documents/:id/rollback',
} as const;

// ----------------------------------------------------------------------------
// Undertaking Management Endpoints
// ----------------------------------------------------------------------------

export interface UndertakingAcknowledgeRequest {
  undertakingId: string;
  acknowledged: boolean;
  digitalSignature?: {
    type: 'typed' | 'drawn';
    value: string;
  };
  consentItems?: {
    id: string;
    consent: boolean;
  }[];
  deviceContext?: {
    userAgent?: string;
    deviceType?: string;
    ip?: string;
  };
}

export interface UndertakingAcknowledgeResponse {
  id: string;
  status: 'completed' | 'pending' | 'required';
  acknowledgedAt: string;
  acknowledgedBy: string;
  digitalSignature?: {
    type: string;
    value: string;
    signedAt: string;
    ipAddress?: string;
    deviceFingerprint?: string;
  };
  dpdpConsent?: {
    id: string;
    consentType: string;
    grantedAt: string;
    version: string;
  };
}

export interface UndertakingListQuery {
  applicationId?: string;
  status?: string;
  type?: string;
  category?: string;
  showCompleted?: boolean;
  showBlocking?: boolean;
  page?: number;
  pageSize?: number;
  sortBy?: 'dueDate' | 'priority' | 'status' | 'type';
  sortOrder?: 'asc' | 'desc';
}

export interface UndertakingListResponse {
  undertakings: UndertakingAcknowledgeResponse[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * Undertaking Endpoints
 */
export const UNDERTAKING_API = {
  /**
   * GET /api/v1/undertakings/:id
   * Get undertaking details with full metadata
   * 
   * Success: 200 OK
   * Error: 401, 403, 404
   */
  GET: '/api/v1/undertakings/:id',

  /**
   * GET /api/v1/undertakings
   * List undertakings with optional filtering
   * 
   * Query params: applicationId, status, type, category, showCompleted, 
   *               showBlocking, page, pageSize, sortBy, sortOrder
   * 
   * Success: 200 OK
   * Error: 401, 403
   */
  LIST: '/api/v1/undertakings',

  /**
   * POST /api/v1/undertakings/:id/acknowledge
   * Acknowledge an undertaking
   * 
   * Body: { acknowledged: boolean, digitalSignature?: {...}, consentItems?: [...] }
   * 
   * Success: 200 OK
   * Error: 400, 401, 403, 404, 409
   */
  ACKNOWLEDGE: '/api/v1/undertakings/:id/acknowledge',

  /**
   * GET /api/v1/undertakings/:id/audit
   * Get audit trail for undertaking
   * 
   * Query params: limit, offset
   * 
   * Success: 200 OK
   * Error: 401, 403, 404
   */
  AUDIT: '/api/v1/undertakings/:id/audit',

  /**
   * GET /api/v1/undertakings/:id/versions
   * Get version history for undertaking
   * 
   * Success: 200 OK
   * Error: 401, 403, 404
   */
  VERSIONS: '/api/v1/undertakings/:id/versions',

  /**
   * GET /api/v1/undertakings/:id/consents
   * Get DPDP consent history for undertaking
   * 
   * Success: 200 OK
   * Error: 401, 403, 404
   */
  CONSENTS: '/api/v1/undertakings/:id/consents',

  /**
   * POST /api/v1/undertakings/:id/withdraw-consent
   * Withdraw consent for undertaking
   * 
   * Body: { reason: string }
   * 
   * Success: 200 OK
   * Error: 400, 401, 403, 404
   */
  WITHDRAW_CONSENT: '/api/v1/undertakings/:id/withdraw-consent',
} as const;

// ----------------------------------------------------------------------------
// Consent Management Endpoints
// ----------------------------------------------------------------------------

export interface ConsentGrantRequest {
  consentType: string;
  purpose: string;
  dataCategories: string[];
  consentText: string;
  legalBasis?: string;
}

export interface ConsentGrantResponse {
  id: string;
  consentType: string;
  purpose: string;
  dataCategories: string[];
  version: string;
  grantedAt: string;
  grantedBy: {
    id: string;
    name: string;
    role: string;
  };
  deviceContext: {
    ip?: string;
    userAgent?: string;
    deviceType?: string;
  };
  sessionInfo: {
    sessionId: string;
    startedAt: string;
  };
}

/**
 * Consent Endpoints
 */
export const CONSENT_API = {
  /**
   * POST /api/v1/consents/grant
   * Grant consent for data processing
   * 
   * Body: ConsentGrantRequest
   * 
   * Success: 201 Created
   * Error: 400, 401, 403, 409
   */
  GRANT: '/api/v1/consents/grant',

  /**
   * POST /api/v1/consents/:id/withdraw
   * Withdraw consent
   * 
   * Body: { reason: string }
   * 
   * Success: 200 OK
   * Error: 400, 401, 403, 404, 409
   */
  WITHDRAW: '/api/v1/consents/:id/withdraw',

  /**
   * GET /api/v1/consents/:id
   * Get consent details
   * 
   * Success: 200 OK
   * Error: 401, 403, 404
   */
  GET: '/api/v1/consents/:id',

  /**
   * GET /api/v1/consents
   * List consents for current user
   * 
   * Query params: consentType, status, active, page, pageSize
   * 
   * Success: 200 OK
   * Error: 401, 403
   */
  LIST: '/api/v1/consents',

  /**
   * GET /api/v1/consents/history
   * Get consent history for user
   * 
   * Success: 200 OK
   * Error: 401, 403
   */
  HISTORY: '/api/v1/consents/history',
} as const;

// ----------------------------------------------------------------------------
// Audit Trail Endpoints
// ----------------------------------------------------------------------------

export interface AuditLogQuery {
  entityType?: string;
  entityId?: string;
  action?: string;
  actorId?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface AuditLogResponse {
  entries: {
    id: string;
    entityType: string;
    entityId: string;
    action: string;
    actor: {
      id: string;
      name: string;
      role: string;
    };
    timestamp: string;
    previousState?: any;
    newState?: any;
    changes?: Record<string, { from: any; to: any }>;
    deviceContext: {
      ip?: string;
      userAgent?: string;
      deviceType?: string;
    };
    reason?: string;
  }[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * Audit Trail Endpoints
 */
export const AUDIT_API = {
  /**
   * GET /api/v1/audit/logs
   * Get audit log entries with filtering
   * 
   * Query params: entityType, entityId, action, actorId, startDate, endDate,
   *               page, pageSize, sortBy, sortOrder
   * 
   * Success: 200 OK
   * Error: 401, 403
   */
  LOGS: '/api/v1/audit/logs',

  /**
   * GET /api/v1/audit/export
   * Export audit logs as CSV/PDF
   * 
   * Query params: entityType, entityId, startDate, endDate, format
   * 
   * Success: 200 OK (file download)
   * Error: 401, 403
   */
  EXPORT: '/api/v1/audit/export',
} as const;

// ============================================================================
// WEBSOCKET INTEGRATION
// ============================================================================

/**
 * WebSocket Endpoint: wss://api.example.com/ws
 * Authentication: WebSocket subprotocol with JWT token
 */

/**
 * WebSocket Message Types
 */
export enum WebSocketMessageType {
  // Client -> Server
  SUBSCRIBE = 'subscribe',
  UNSUBSCRIBE = 'unsubscribe',
  HEARTBEAT = 'heartbeat',
  
  // Server -> Client
  DOCUMENT_STATUS_UPDATE = 'document_status_update',
  DOCUMENT_UPLOAD_PROGRESS = 'document_upload_progress',
  UNDERTAKING_STATUS_UPDATE = 'undertaking_status_update',
  CONSENT_UPDATE = 'consent_update',
  AUDIT_LOG_ENTRY = 'audit_log_entry',
  SYSTEM_NOTIFICATION = 'system_notification',
  SESSION_EXPIRY = 'session_expiry',
  ERROR = 'error',
}

/**
 * Subscribe to entity updates
 */
export interface WebSocketSubscribeMessage {
  type: WebSocketMessageType.SUBSCRIBE;
  payload: {
    subscriptionId: string;
    entityType: 'document' | 'undertaking' | 'consent' | 'audit';
    entityId: string;
    eventTypes: string[];
    filters?: Record<string, any>;
  };
}

/**
 * Unsubscribe from entity updates
 */
export interface WebSocketUnsubscribeMessage {
  type: WebSocketMessageType.UNSUBSCRIBE;
  payload: {
    subscriptionId: string;
  };
}

/**
 * Heartbeat message
 */
export interface WebSocketHeartbeatMessage {
  type: WebSocketMessageType.HEARTBEAT;
  payload: {
    timestamp: string;
  };
}

/**
 * Document status update event
 */
export interface DocumentStatusUpdateEvent {
  type: WebSocketMessageType.DOCUMENT_STATUS_UPDATE;
  eventId: string;
  timestamp: string;
  payload: {
    documentId: string;
    applicationId: string;
    status: string;
    previousStatus: string;
    actor: {
      id: string;
      name: string;
      role: string;
    };
    reason?: string;
  };
}

/**
 * Document upload progress event
 */
export interface DocumentUploadProgressEvent {
  type: WebSocketMessageType.DOCUMENT_UPLOAD_PROGRESS;
  eventId: string;
  timestamp: string;
  payload: {
    documentId: string;
    applicationId: string;
    progress: number;
    uploadedBytes: number;
    totalBytes: number;
    speed: number;
    eta: number;
  };
}

/**
 * Undertaking status update event
 */
export interface UndertakingStatusUpdateEvent {
  type: WebSocketMessageType.UNDERTAKING_STATUS_UPDATE;
  eventId: string;
  timestamp: string;
  payload: {
    undertakingId: string;
    applicationId: string;
    status: string;
    previousStatus: string;
    actor: {
      id: string;
      name: string;
      role: string;
    };
  };
}

/**
 * Consent update event
 */
export interface ConsentUpdateEvent {
  type: WebSocketMessageType.CONSENT_UPDATE;
  eventId: string;
  timestamp: string;
  payload: {
    consentId: string;
    consentType: string;
    status: 'granted' | 'withdrawn';
    actor: {
      id: string;
      name: string;
      role: string;
    };
    reason?: string;
  };
}

/**
 * Audit log entry event
 */
export interface AuditLogEntryEvent {
  type: WebSocketMessageType.AUDIT_LOG_ENTRY;
  eventId: string;
  timestamp: string;
  payload: {
    entityType: string;
    entityId: string;
    action: string;
    actor: {
      id: string;
      name: string;
      role: string;
    };
    timestamp: string;
    changes?: Record<string, { from: any; to: any }>;
  };
}

/**
 * Error event
 */
export interface WebSocketErrorEvent {
  type: WebSocketMessageType.ERROR;
  eventId: string;
  timestamp: string;
  payload: {
    code: string;
    message: string;
    details?: any;
  };
}

// ============================================================================
// ERROR HANDLING
// ============================================================================

/**
 * Standard Error Response Format
 */
export interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
    timestamp: string;
    requestId: string;
  };
}

/**
 * Error Codes
 */
export const ERROR_CODES = {
  // Document Errors
  INVALID_DOCUMENT_TYPE: 'INVALID_DOCUMENT_TYPE',
  FILE_SIZE_EXCEEDED: 'FILE_SIZE_EXCEEDED',
  FILE_TYPE_NOT_ALLOWED: 'FILE_TYPE_NOT_ALLOWED',
  VIRUS_DETECTED: 'VIRUS_DETECTED',
  DOCUMENT_NOT_FOUND: 'DOCUMENT_NOT_FOUND',
  DUPLICATE_UPLOAD: 'DUPLICATE_UPLOAD',
  DOCUMENT_ALREADY_VERIFIED: 'DOCUMENT_ALREADY_VERIFIED',
  
  // Undertaking Errors
  UNDERTAKING_NOT_FOUND: 'UNDERTAKING_NOT_FOUND',
  UNDERTAKING_ALREADY_ACKNOWLEDGED: 'UNDERTAKING_ALREADY_ACKNOWLEDGED',
  BLOCKING_UNDERTAKING: 'BLOCKING_UNDERTAKING',
  SIGNATURE_REQUIRED: 'SIGNATURE_REQUIRED',
  CONSENT_REQUIRED: 'CONSENT_REQUIRED',
  
  // Consent Errors
  CONSENT_NOT_FOUND: 'CONSENT_NOT_FOUND',
  CONSENT_ALREADY_GRANTED: 'CONSENT_ALREADY_GRANTED',
  CONSENT_CANNOT_BE_WITHDRAWN: 'CONSENT_CANNOT_BE_WITHDRAWN',
  
  // Validation Errors
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  VERSION_MISMATCH: 'VERSION_MISMATCH',
  EXPIRED_DOCUMENT: 'EXPIRED_DOCUMENT',
  
  // Authorization Errors
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  PERMISSION_DENIED: 'PERMISSION_DENIED',
  
  // System Errors
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
} as const;

/**
 * HTTP Status Codes
 */
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  PAYLOAD_TOO_LARGE: 413,
  UNSUPPORTED_MEDIA_TYPE: 415,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const;

// ============================================================================
// DATA FORMAT SPECIFICATIONS
// ============================================================================

/**
 * Timestamp Format: ISO 8601 (UTC)
 * Example: "2025-12-27T10:30:00.000Z"
 */
export const TIMESTAMP_FORMAT = 'ISO_8601_UTC';

/**
 * File Size Limitations
 */
export const FILE_SIZE_LIMITS = {
  DOCUMENT_MAX_SIZE: 5 * 1024 * 1024, // 5 MB
  IMAGE_MAX_SIZE: 2 * 1024 * 1024,    // 2 MB
  PDF_MAX_SIZE: 5 * 1024 * 1024,     // 5 MB
  BATCH_UPLOAD_MAX_SIZE: 20 * 1024 * 1024, // 20 MB
} as const;

/**
 * Allowed File Types
 */
export const ALLOWED_FILE_TYPES = {
  IMAGES: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
  DOCUMENTS: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  ALL: [
    'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
    'application/pdf', 'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ],
} as const;

/**
 * Pagination Defaults
 */
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
} as const;

// ============================================================================
// API CLIENT UTILITY FUNCTIONS
// ============================================================================

/**
 * Create API request headers
 */
export function createHeaders(accessToken?: string, additionalHeaders?: Record<string, string>): HeadersInit {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...additionalHeaders,
  };

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  return headers;
}

/**
 * Handle API errors
 */
export function handleApiError(error: any): ErrorResponse {
  if (error.response) {
    return {
      success: false,
      error: {
        code: error.response.data?.error?.code || 'UNKNOWN_ERROR',
        message: error.response.data?.error?.message || 'An error occurred',
        details: error.response.data?.error?.details,
        timestamp: new Date().toISOString(),
        requestId: error.response.data?.metadata?.requestId || '',
      },
    };
  }

  return {
    success: false,
    error: {
      code: 'NETWORK_ERROR',
      message: error.message || 'Network error occurred',
      timestamp: new Date().toISOString(),
      requestId: '',
    },
  };
}



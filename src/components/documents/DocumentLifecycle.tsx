'use client';

import { Badge } from '../ui/Badge';
import { 
  Clock, 
  Upload, 
  CheckCircle2, 
  AlertCircle, 
  XCircle,
  RefreshCw,
  Info
} from 'lucide-react';
import { cn } from '../utils';

export type DocumentLifecycleStatus = 
  | 'pending'
  | 'uploading'
  | 'uploaded'
  | 'verifying'
  | 'verified'
  | 'rejected'
  | 'error'
  | 'cancelled';

export interface DocumentStateTransition {
  from: DocumentLifecycleStatus;
  to: DocumentLifecycleStatus;
  triggerBy: 'applicant' | 'admin' | 'system';
  reason?: string;
}

export interface DocumentLifecycleMetadata {
  status: DocumentLifecycleStatus;
  transitions: DocumentStateTransition[];
  createdAt: string;
  updatedAt: string;
  uploadedBy?: string;
  uploadedAt?: string;
  verifiedBy?: string;
  verifiedAt?: string;
  rejectedBy?: string;
  rejectedAt?: string;
  rejectionReason?: string;
  errorMessage?: string;
}

export interface DocumentLifecycleConfig {
  status: DocumentLifecycleStatus;
  label: string;
  description: string;
  variant: 'default' | 'success' | 'warning' | 'error' | 'info';
  icon: React.ReactNode;
  color: string;
  canTransitionTo: DocumentLifecycleStatus[];
  triggerBy?: 'applicant' | 'admin' | 'system';
}

const DOCUMENT_LIFECYCLE_CONFIG: Record<DocumentLifecycleStatus, DocumentLifecycleConfig> = {
  pending: {
    status: 'pending',
    label: 'Pending',
    description: 'Document not yet uploaded',
    variant: 'default',
    icon: <Clock className="w-3 h-3" />,
    color: 'var(--color-gray-600)',
    canTransitionTo: ['uploading', 'cancelled'],
    triggerBy: 'applicant'
  },
  uploading: {
    status: 'uploading',
    label: 'Uploading',
    description: 'Document is being uploaded',
    variant: 'info',
    icon: <RefreshCw className="w-3 h-3 animate-spin" />,
    color: 'var(--color-blue-600)',
    canTransitionTo: ['uploaded', 'error', 'cancelled'],
    triggerBy: 'system'
  },
  uploaded: {
    status: 'uploaded',
    label: 'Uploaded',
    description: 'Document uploaded and awaiting verification',
    variant: 'info',
    icon: <Upload className="w-3 h-3" />,
    color: 'var(--color-blue-600)',
    canTransitionTo: ['verifying', 'rejected', 'error'],
    triggerBy: 'system'
  },
  verifying: {
    status: 'verifying',
    label: 'Verifying',
    description: 'Document is being reviewed by admin',
    variant: 'info',
    icon: <RefreshCw className="w-3 h-3 animate-spin" />,
    color: 'var(--color-blue-600)',
    canTransitionTo: ['verified', 'rejected', 'error'],
    triggerBy: 'system'
  },
  verified: {
    status: 'verified',
    label: 'Verified',
    description: 'Document verified and approved',
    variant: 'success',
    icon: <CheckCircle2 className="w-3 h-3" />,
    color: 'var(--color-green-600)',
    canTransitionTo: [],
    triggerBy: 'admin'
  },
  rejected: {
    status: 'rejected',
    label: 'Rejected',
    description: 'Document rejected by admin',
    variant: 'error',
    icon: <XCircle className="w-3 h-3" />,
    color: 'var(--color-red-600)',
    canTransitionTo: ['uploading', 'cancelled'],
    triggerBy: 'admin'
  },
  error: {
    status: 'error',
    label: 'Error',
    description: 'Upload or processing error',
    variant: 'error',
    icon: <AlertCircle className="w-3 h-3" />,
    color: 'var(--color-red-600)',
    canTransitionTo: ['uploading', 'cancelled'],
    triggerBy: 'system'
  },
  cancelled: {
    status: 'cancelled',
    label: 'Cancelled',
    description: 'Upload cancelled by user',
    variant: 'default',
    icon: <XCircle className="w-3 h-3" />,
    color: 'var(--color-gray-600)',
    canTransitionTo: ['uploading'],
    triggerBy: 'applicant'
  }
};

export interface StatusLifecycleBadgeProps {
  status: DocumentLifecycleStatus;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  className?: string;
}

const StatusLifecycleBadge = ({
  status,
  size = 'md',
  showIcon = true,
  className
}: StatusLifecycleBadgeProps) => {
  const config = DOCUMENT_LIFECYCLE_CONFIG[status];

  return (
    <Badge
      variant={config.variant}
      size={size}
      className={cn(className)}
    >
      {showIcon && (
        <span className="flex items-center gap-1">
          {config.icon}
          {config.label}
        </span>
      )}
      {!showIcon && config.label}
    </Badge>
  );
};

export interface DocumentStatusHistoryProps {
  metadata: DocumentLifecycleMetadata;
  showTitle?: boolean;
  className?: string;
}

const DocumentStatusHistory = ({
  metadata,
  showTitle = true,
  className
}: DocumentStatusHistoryProps) => {
  return (
    <div className={cn('space-y-2', className)}>
      {showTitle && (
        <h4 className="font-medium text-sm mb-3" style={{ color: 'var(--text-primary)' }}>
          Status History
        </h4>
      )}

      {/* Created */}
      <div className="flex items-start gap-2 text-xs">
        <Clock className="w-3 h-3 flex-shrink-0 mt-0.5" style={{ color: 'var(--color-gray-600)' }} />
        <div>
          <span style={{ color: 'var(--text-secondary)' }}>Created: </span>
          <span style={{ color: 'var(--text-primary)' }}>
            {new Date(metadata.createdAt).toLocaleString()}
          </span>
        </div>
      </div>

      {/* Uploaded */}
      {metadata.uploadedAt && metadata.uploadedBy && (
        <div className="flex items-start gap-2 text-xs">
          <Upload className="w-3 h-3 flex-shrink-0 mt-0.5" style={{ color: 'var(--color-blue-600)' }} />
          <div>
            <span style={{ color: 'var(--text-secondary)' }}>Uploaded: </span>
            <span style={{ color: 'var(--text-primary)' }}>
              {new Date(metadata.uploadedAt).toLocaleString()} by {metadata.uploadedBy}
            </span>
          </div>
        </div>
      )}

      {/* Verified */}
      {metadata.verifiedAt && metadata.verifiedBy && (
        <div className="flex items-start gap-2 text-xs">
          <CheckCircle2 className="w-3 h-3 flex-shrink-0 mt-0.5" style={{ color: 'var(--color-green-600)' }} />
          <div>
            <span style={{ color: 'var(--text-secondary)' }}>Verified: </span>
            <span style={{ color: 'var(--text-primary)' }}>
              {new Date(metadata.verifiedAt).toLocaleString()} by {metadata.verifiedBy}
            </span>
          </div>
        </div>
      )}

      {/* Rejected */}
      {metadata.rejectedAt && metadata.rejectedBy && (
        <div className="flex items-start gap-2 text-xs">
          <XCircle className="w-3 h-3 flex-shrink-0 mt-0.5" style={{ color: 'var(--color-red-600)' }} />
          <div>
            <span style={{ color: 'var(--text-secondary)' }}>Rejected: </span>
            <span style={{ color: 'var(--text-primary)' }}>
              {new Date(metadata.rejectedAt).toLocaleString()} by {metadata.rejectedBy}
            </span>
            {metadata.rejectionReason && (
              <>
                <br />
                <span style={{ color: 'var(--text-secondary)' }}>Reason: </span>
                <span style={{ color: 'var(--text-primary)' }}>{metadata.rejectionReason}</span>
              </>
            )}
          </div>
        </div>
      )}

      {/* Updated */}
      {metadata.updatedAt && metadata.updatedAt !== metadata.createdAt && (
        <div className="flex items-start gap-2 text-xs">
          <RefreshCw className="w-3 h-3 flex-shrink-0 mt-0.5" style={{ color: 'var(--color-gray-600)' }} />
          <div>
            <span style={{ color: 'var(--text-secondary)' }}>Last updated: </span>
            <span style={{ color: 'var(--text-primary)' }}>
              {new Date(metadata.updatedAt).toLocaleString()}
            </span>
          </div>
        </div>
      )}

      {/* Error */}
      {metadata.errorMessage && (
        <div className="flex items-start gap-2 text-xs p-2 rounded" style={{ backgroundColor: 'var(--color-red-50)' }}>
          <AlertCircle className="w-3 h-3 flex-shrink-0 mt-0.5" style={{ color: 'var(--color-red-600)' }} />
          <div>
            <span style={{ color: 'var(--text-secondary)' }}>Error: </span>
            <span style={{ color: 'var(--text-primary)' }}>{metadata.errorMessage}</span>
          </div>
        </div>
      )}

      {/* Transitions */}
      {metadata.transitions.length > 0 && (
        <div className="mt-3 pt-3 border-t" style={{ borderColor: 'var(--border-primary)' }}>
          <p className="text-xs mb-2" style={{ color: 'var(--text-secondary)' }}>
            State Transitions:
          </p>
          {metadata.transitions.map((transition, index) => (
            <div key={index} className="flex items-start gap-2 text-xs mb-2">
              <Info className="w-3 h-3 flex-shrink-0 mt-0.5" style={{ color: 'var(--color-blue-600)' }} />
              <div>
                <span style={{ color: 'var(--text-secondary)' }}>
                  {DOCUMENT_LIFECYCLE_CONFIG[transition.from].label} →{' '}
                  {DOCUMENT_LIFECYCLE_CONFIG[transition.to].label}
                </span>
                <span style={{ color: 'var(--text-secondary)' }}>
                  {' '}by {transition.triggerBy}
                </span>
                {transition.reason && (
                  <>
                    <br />
                    <span style={{ color: 'var(--text-secondary)' }}>Reason: {transition.reason}</span>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export interface DocumentStatusTooltipProps {
  status: DocumentLifecycleStatus;
  description?: string;
  className?: string;
}

const DocumentStatusTooltip = ({
  status,
  description,
  className
}: DocumentStatusTooltipProps) => {
  const config = DOCUMENT_LIFECYCLE_CONFIG[status];

  return (
    <div className={cn('text-xs', className)} style={{ color: 'var(--text-secondary)' }}>
      <span style={{ color: config.color }}>{config.label}:</span>
      {description || config.description}
    </div>
  );
};

export {
  DOCUMENT_LIFECYCLE_CONFIG,
  StatusLifecycleBadge,
  DocumentStatusHistory,
  DocumentStatusTooltip
};

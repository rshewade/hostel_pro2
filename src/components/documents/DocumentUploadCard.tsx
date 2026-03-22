'use client';

import { forwardRef, useState } from 'react';
import { cn } from '../utils';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { FileUpload } from '../forms/FileUpload';
import { 
  FileText, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  Download,
  Eye,
  Upload
} from 'lucide-react';
import type { BaseComponentProps } from '../types';

export type DocumentStatus = 'pending' | 'uploaded' | 'verified' | 'rejected' | 'error';

export type DocumentType = 
  | 'student_declaration'
  | 'parent_consent'
  | 'local_guardian_undertaking'
  | 'hostel_rules'
  | 'admission_terms';

export interface DocumentMetadata {
  uploadedAt?: string;
  uploadedBy?: string;
  verifiedAt?: string;
  verifiedBy?: string;
  rejectionReason?: string;
  fileName?: string;
  fileSize?: number;
}

export interface DocumentUploadCardProps extends BaseComponentProps {
  type: DocumentType;
  title?: string;
  description?: string;
  status: DocumentStatus;
  required: boolean;
  file?: File | null;
  metadata?: DocumentMetadata;
  onFileChange?: (file: File | null) => void;
  onPreview?: () => void;
  onDownload?: () => void;
  instruction?: string;
  helperText?: string;
  disabled?: boolean;
  accept?: string;
  maxSize?: number;
}

const DOCUMENT_LABELS: Record<DocumentType, { title: string; description: string; instruction?: string }> = {
  student_declaration: {
    title: 'Student Declaration',
    description: 'Declaration by the student confirming adherence to hostel rules and regulations',
    instruction: 'Please sign on the declaration document and upload a scanned copy or clear photograph'
  },
  parent_consent: {
    title: 'Parent Consent',
    description: 'Consent from parent/guardian for hostel accommodation and activities',
    instruction: 'Parent or guardian must sign this document. Upload a signed copy'
  },
  local_guardian_undertaking: {
    title: 'Local Guardian Undertaking',
    description: 'Undertaking by local guardian (if applicable)',
    instruction: 'Only required if local guardian is appointed. Upload signed undertaking'
  },
  hostel_rules: {
    title: 'Hostel Rules Acceptance',
    description: 'Acknowledgment of hostel rules and regulations',
    instruction: 'Review the hostel rules carefully and acknowledge your acceptance'
  },
  admission_terms: {
    title: 'Admission Terms & Conditions',
    description: 'Terms and conditions for hostel admission',
    instruction: 'Please read and accept the admission terms and conditions'
  }
};

const STATUS_CONFIG: Record<DocumentStatus, { 
  variant: 'default' | 'success' | 'warning' | 'error' | 'info';
  icon: React.ReactNode;
  label: string;
}> = {
  pending: {
    variant: 'default',
    icon: <Clock className="w-3 h-3" />,
    label: 'Pending'
  },
  uploaded: {
    variant: 'info',
    icon: <Upload className="w-3 h-3" />,
    label: 'Uploaded'
  },
  verified: {
    variant: 'success',
    icon: <CheckCircle2 className="w-3 h-3" />,
    label: 'Verified'
  },
  rejected: {
    variant: 'error',
    icon: <AlertCircle className="w-3 h-3" />,
    label: 'Rejected'
  },
  error: {
    variant: 'error',
    icon: <AlertCircle className="w-3 h-3" />,
    label: 'Error'
  }
};

const DocumentUploadCard = forwardRef<HTMLDivElement, DocumentUploadCardProps>(({
  className,
  type,
  title,
  description,
  status,
  required,
  file,
  metadata,
  onFileChange,
  onPreview,
  onDownload,
  instruction,
  helperText,
  disabled = false,
  accept = '.jpg,.jpeg,.pdf',
  maxSize = 5 * 1024 * 1024,
  'data-testid': testId,
}, ref) => {
  const [showInstructions, setShowInstructions] = useState(false);

  const defaultDocInfo = DOCUMENT_LABELS[type];
  const statusConfig = STATUS_CONFIG[status];

  const canUpload = !disabled && status !== 'verified';
  const canPreview = status === 'uploaded' || status === 'verified';
  const canDownload = status === 'uploaded' || status === 'verified';

  return (
    <div
      ref={ref}
      className={cn(
        'border rounded-lg p-4 transition-all',
        status === 'rejected' && 'border-red-300 bg-red-50',
        status === 'verified' && 'border-green-300 bg-green-50',
        'card'
      )}
      style={{ borderColor: status === 'rejected' ? 'var(--color-red-300)' : 'var(--border-primary)' }}
      data-testid={testId}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2 flex-1">
          <FileText className="w-5 h-5 flex-shrink-0" style={{ color: 'var(--color-blue-600)' }} />
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>
              {title || defaultDocInfo.title}
              {required && <span className="text-red-500 ml-1">*</span>}
            </h4>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
              {description || defaultDocInfo.description}
            </p>
          </div>
        </div>

        {/* Status Badge */}
        <Badge variant={statusConfig.variant} size="sm">
          <span className="flex items-center gap-1">
            {statusConfig.icon}
            {statusConfig.label}
          </span>
        </Badge>
      </div>

      {/* Instructions Toggle */}
      {instruction && (
        <button
          type="button"
          onClick={() => setShowInstructions(!showInstructions)}
          className="text-xs font-medium mb-3 flex items-center gap-1 hover:underline"
          style={{ color: 'var(--color-blue-600)' }}
        >
          <AlertCircle className="w-3 h-3" />
          {showInstructions ? 'Hide Instructions' : 'View Instructions'}
        </button>
      )}

      {/* Instructions Content */}
      {showInstructions && instruction && (
        <div className="mb-3 p-2 rounded text-xs" style={{ backgroundColor: 'var(--color-blue-50)' }}>
          <p className="font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
            Instructions:
          </p>
          <p style={{ color: 'var(--text-secondary)' }}>{instruction}</p>
        </div>
      )}

      {/* File Upload */}
      {canUpload && (
        <FileUpload
          label=""
          value={file || null}
          onChange={onFileChange}
          disabled={disabled}
          required={required}
          accept={accept}
          maxSize={maxSize}
          showPreview={false}
          helperText={helperText}
        />
      )}

      {/* Metadata Display */}
      {(status === 'uploaded' || status === 'verified') && metadata && (
        <div className="mt-3 space-y-1">
          {metadata.fileName && (
            <div className="flex items-center justify-between text-xs">
              <span style={{ color: 'var(--text-secondary)' }}>File:</span>
              <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
                {metadata.fileName}
              </span>
            </div>
          )}
          {metadata.uploadedAt && (
            <div className="flex items-center justify-between text-xs">
              <span style={{ color: 'var(--text-secondary)' }}>Uploaded:</span>
              <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
                {new Date(metadata.uploadedAt).toLocaleString()}
              </span>
            </div>
          )}
          {metadata.uploadedBy && (
            <div className="flex items-center justify-between text-xs">
              <span style={{ color: 'var(--text-secondary)' }}>Uploaded by:</span>
              <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
                {metadata.uploadedBy}
              </span>
            </div>
          )}
          {status === 'verified' && metadata.verifiedBy && (
            <>
              <div className="flex items-center justify-between text-xs">
                <span style={{ color: 'var(--text-secondary)' }}>Verified by:</span>
                <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
                  {metadata.verifiedBy}
                </span>
              </div>
              {metadata.verifiedAt && (
                <div className="flex items-center justify-between text-xs">
                  <span style={{ color: 'var(--text-secondary)' }}>Verified on:</span>
                  <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
                    {new Date(metadata.verifiedAt).toLocaleString()}
                  </span>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Rejection Reason */}
      {status === 'rejected' && metadata?.rejectionReason && (
        <div className="mt-3 p-2 rounded text-xs" style={{ backgroundColor: 'var(--color-red-50)' }}>
          <p className="font-medium mb-1 flex items-center gap-1" style={{ color: 'var(--color-red-700)' }}>
            <AlertCircle className="w-3 h-3" />
            Rejection Reason:
          </p>
          <p style={{ color: 'var(--text-secondary)' }}>{metadata.rejectionReason}</p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="mt-3 flex gap-2">
        {canPreview && onPreview && (
          <Button
            variant="secondary"
            size="sm"
            onClick={onPreview}
            leftIcon={<Eye className="w-4 h-4" />}
            fullWidth
          >
            Preview
          </Button>
        )}
        {canDownload && onDownload && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onDownload}
            leftIcon={<Download className="w-4 h-4" />}
            fullWidth
          >
            Download
          </Button>
        )}
      </div>
    </div>
  );
});

DocumentUploadCard.displayName = 'DocumentUploadCard';

export { DocumentUploadCard };

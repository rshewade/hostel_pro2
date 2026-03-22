'use client';

import { forwardRef } from 'react';
import { cn } from '../utils';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { DocumentUploadCard, DocumentStatus, DocumentType, DocumentMetadata } from './DocumentUploadCard';
import { FileText, CheckCircle2, AlertTriangle, Upload } from 'lucide-react';
import type { BaseComponentProps } from '../types';

export interface DocumentConfig {
  type: DocumentType;
  title?: string;
  description?: string;
  instruction?: string;
  required: boolean;
  status: DocumentStatus;
  file?: File | null;
  metadata?: DocumentMetadata;
}

export interface DocumentUploadsListProps extends BaseComponentProps {
  documents: DocumentConfig[];
  onFileChange?: (type: DocumentType, file: File | null) => void;
  onPreview?: (type: DocumentType) => void;
  onDownload?: (type: DocumentType) => void;
  disabled?: boolean;
  loading?: boolean;
  helperText?: string;
}

const DocumentUploadsList = forwardRef<HTMLDivElement, DocumentUploadsListProps>(({
  className,
  documents,
  onFileChange,
  onPreview,
  onDownload,
  disabled = false,
  loading = false,
  helperText,
  'data-testid': testId,
}, ref) => {
  const getOverallStatus = (): { status: 'complete' | 'partial' | 'pending'; percentage: number } => {
    if (documents.length === 0) return { status: 'pending', percentage: 0 };

    const uploaded = documents.filter(d => d.status === 'uploaded' || d.status === 'verified').length;
    const required = documents.filter(d => d.required).length;
    const requiredUploaded = documents.filter(d => d.required && (d.status === 'uploaded' || d.status === 'verified')).length;

    if (required === 0) {
      return { status: 'complete', percentage: 100 };
    }

    const percentage = Math.round((requiredUploaded / required) * 100);

    if (requiredUploaded === required) {
      return { status: 'complete', percentage };
    } else if (requiredUploaded > 0) {
      return { status: 'partial', percentage };
    } else {
      return { status: 'pending', percentage: 0 };
    }
  };

  const overall = getOverallStatus();

  return (
    <div
      ref={ref}
      className={cn('space-y-4', className)}
      data-testid={testId}
    >
      {/* Overall Status Header */}
      <div className="border rounded-lg p-4" style={{ borderColor: 'var(--border-primary)' }}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5" style={{ color: 'var(--color-blue-600)' }} />
            <h3 className="font-medium" style={{ color: 'var(--text-primary)' }}>
              Document Uploads
            </h3>
          </div>

          {overall.status === 'complete' ? (
            <Badge variant="success" size="md">
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                Complete
              </span>
            </Badge>
          ) : overall.status === 'partial' ? (
            <Badge variant="warning" size="md">
              <span className="flex items-center gap-1">
                <Upload className="w-3 h-3" />
                {overall.percentage}% Complete
              </span>
            </Badge>
          ) : (
            <Badge variant="default" size="md">
              Pending
            </Badge>
          )}
        </div>

        {/* Progress Bar */}
        <div className="w-full h-2 rounded-full overflow-hidden mb-3" style={{ backgroundColor: 'var(--color-gray-200)' }}>
          <div
            className="h-full transition-all duration-300"
            style={{
              width: `${overall.percentage}%`,
              backgroundColor: overall.status === 'complete' 
                ? 'var(--color-green-500)' 
                : overall.status === 'partial' 
                  ? 'var(--color-gold-500)' 
                  : 'var(--color-gray-400)'
            }}
          />
        </div>

        {helperText && (
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            {helperText}
          </p>
        )}

        {/* Document Summary */}
        <div className="mt-3 text-sm" style={{ color: 'var(--text-secondary)' }}>
          <p>
            {documents.filter(d => d.status === 'uploaded' || d.status === 'verified').length} of {documents.length} documents uploaded
            {documents.some(d => d.required && d.status === 'pending') && (
              <span className="text-red-600 ml-2">
                (including {documents.filter(d => d.required && d.status === 'pending').length} required)
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Document Cards Grid */}
      {loading ? (
        <div className="text-center py-8">
          <div className="inline-flex items-center gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
            <svg
              className="animate-spin h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Loading documents...
          </div>
        </div>
      ) : (
        <div className="grid gap-4">
          {documents.map((doc, index) => (
            <DocumentUploadCard
              key={`${doc.type}-${index}`}
              type={doc.type}
              title={doc.title}
              description={doc.description}
              instruction={doc.instruction}
              status={doc.status}
              required={doc.required}
              file={doc.file}
              metadata={doc.metadata}
              onFileChange={(file) => onFileChange?.(doc.type, file)}
              onPreview={() => onPreview?.(doc.type)}
              onDownload={() => onDownload?.(doc.type)}
              disabled={disabled || doc.status === 'verified'}
              data-testid={`document-${doc.type}`}
            />
          ))}
        </div>
      )}

      {/* Warning for Missing Required Documents */}
      {documents.some(d => d.required && d.status === 'pending') && (
        <div className="flex items-start gap-2 p-3 rounded text-sm" style={{ backgroundColor: 'var(--color-amber-50)' }}>
          <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: 'var(--color-amber-600)' }} />
          <div>
            <p className="font-medium" style={{ color: 'var(--text-primary)' }}>
              Required Documents Pending
            </p>
            <p style={{ color: 'var(--text-secondary)' }}>
              Please upload all required documents before submitting your application.
            </p>
          </div>
        </div>
      )}
    </div>
  );
});

DocumentUploadsList.displayName = 'DocumentUploadsList';

export { DocumentUploadsList };

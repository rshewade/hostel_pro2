'use client';

import { forwardRef } from 'react';
import { cn } from '../utils';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { A4Page, Letter } from '../print';
import type { BaseComponentProps } from '../types';
import type { DocumentType, DocumentStatus } from './DocumentUploadCard';
import type { UndertakingType } from './UndertakingCard';

export interface DocumentPrintViewProps extends BaseComponentProps {
  documentType: DocumentType;
  title: string;
  description?: string;
  status: DocumentStatus;
  fileName?: string;
  uploadedBy?: string;
  uploadedAt?: string;
  verifiedBy?: string;
  verifiedAt?: string;
  referenceNumber?: string;
  organizationName?: string;
  logoUrl?: string;
  onPrint?: () => void;
}

const DOCUMENT_TITLES: Record<DocumentType, string> = {
  student_declaration: 'Student Declaration',
  parent_consent: 'Parent Consent',
  local_guardian_undertaking: 'Local Guardian Undertaking',
  hostel_rules: 'Hostel Rules Acceptance',
  admission_terms: 'Admission Terms & Conditions'
};

const DocumentPrintView = forwardRef<HTMLDivElement, DocumentPrintViewProps>(({
  className,
  documentType,
  title,
  description,
  status,
  fileName,
  uploadedBy,
  uploadedAt,
  verifiedBy,
  verifiedAt,
  referenceNumber,
  organizationName = 'Seth Hirachand Gumanji Jain Trust',
  logoUrl,
  onPrint,
  'data-testid': testId,
}, ref) => {
  const docTitle = DOCUMENT_TITLES[documentType] || title;
  
  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = () => {
    switch (status) {
      case 'uploaded':
      case 'verified':
        return 'var(--color-green-600)';
      case 'rejected':
      case 'error':
        return 'var(--color-red-600)';
      default:
        return 'var(--color-gray-600)';
    }
  };

  return (
    <div
      ref={ref}
      className={cn('print:hidden', className)}
      data-testid={testId}
    >
      {/* Hidden on-screen, visible when printing */}
      <A4Page
        header={
          <div className="flex items-center justify-between border-b border-gray-200 print:border-black pb-4">
            <div className="flex items-center gap-4">
              {logoUrl && (
                <img 
                  src={logoUrl} 
                  alt={organizationName}
                  className="h-12 w-auto"
                />
              )}
              <div>
                <h1 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
                  {docTitle}
                </h1>
                {referenceNumber && (
                  <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                    Reference: {referenceNumber}
                  </p>
                )}
              </div>
            </div>
            <Badge size="sm">{status.toUpperCase()}</Badge>
          </div>
        }
        footer={
          <div className="flex items-center justify-between pt-4 text-xs" style={{ color: 'var(--text-secondary)' }}>
            <div>
              <span>Generated on: {new Date().toLocaleDateString()}</span>
              {fileName && <span className="ml-4">File: {fileName}</span>}
            </div>
            <div className="flex gap-2">
              {onPrint && (
                <Button 
                  variant="secondary" 
                  size="sm"
                  onClick={onPrint}
                >
                  Print Document
                </Button>
              )}
            </div>
          </div>
        }
      >
        {/* Document Header Section */}
        <div className="mb-6 pb-6 border-b-2 border-gray-200 print:border-black">
          <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
            {docTitle}
          </h2>
          
          {description && (
            <p className="text-base mb-4" style={{ color: 'var(--text-secondary)' }}>
              {description}
            </p>
          )}
          
          {/* Document Metadata */}
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span style={{ color: 'var(--text-secondary)' }}>Status:</span>
              <span className="font-medium" style={{ color: getStatusColor() }}>
                {status.toUpperCase()}
              </span>
            </div>
            
            {fileName && (
              <div className="flex justify-between">
                <span style={{ color: 'var(--text-secondary)' }}>File Name:</span>
                <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
                  {fileName}
                </span>
              </div>
            )}
            
            {uploadedBy && uploadedAt && (
              <div className="flex justify-between">
                <span style={{ color: 'var(--text-secondary)' }}>Uploaded:</span>
                <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
                  {formatDate(uploadedAt)} by {uploadedBy}
                </span>
              </div>
            )}
            
            {verifiedBy && verifiedAt && (
              <div className="flex justify-between">
                <span style={{ color: 'var(--text-secondary)' }}>Verified:</span>
                <span className="font-medium" style={{ color: getStatusColor() }}>
                  {formatDate(verifiedAt)} by {verifiedBy}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Document Body - Content Placeholder */}
        <div className="min-h-[400mm] flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--color-blue-100)' }}>
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                fill="none" 
                viewBox="0 0 24 24" 
                className="w-8 h-8" 
                style={{ color: 'var(--color-blue-600)' }}
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M9 12h6m-6 0H6a2 2 0 00-2 2V6a2 2 0 002 2h12a2 2 0 002 2zm2 2a2 2 0 002-2 2V6a2 2 0 002 2z" 
                />
              </svg>
            </div>
            <p className="text-lg font-medium mt-4" style={{ color: 'var(--text-primary)' }}>
              Document Content
            </p>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              This section should be populated with the actual document content when rendering for print.
            </p>
          </div>
        </div>

        {/* Signature Block */}
        <div className="mt-8 pt-8 border-t-4 border-gray-200 print:border-black">
          <div className="grid grid-cols-2 gap-8">
            <div>
              <p className="font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                Uploaded By:
              </p>
              <p className="text-base" style={{ color: 'var(--text-secondary)' }}>
                {uploadedBy || 'N/A'}
              </p>
              <p className="text-xs mt-2" style={{ color: 'var(--text-secondary)' }}>
                Date: {formatDate(uploadedAt)}
              </p>
            </div>
            
            <div>
              <p className="font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                Signature:
              </p>
              <div className="border-t-2 border-gray-300 pt-4 mt-4">
                <p className="text-4 italic" style={{ color: 'var(--text-secondary)' }}>
                  Digitally signed at {new Date().toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </A4Page>
    </div>
  );
});

DocumentPrintView.displayName = 'DocumentPrintView';

export { DocumentPrintView };

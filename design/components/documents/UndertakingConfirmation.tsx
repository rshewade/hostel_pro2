'use client';

import { forwardRef } from 'react';
import { cn } from '../utils';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import {
  CheckCircle2,
  FileText,
  Calendar,
  Clock,
  Download,
  Share,
  Printer
} from 'lucide-react';
import type { BaseComponentProps } from '../types';

export interface AcknowledgementData {
  id: string;
  type: string;
  title: string;
  acknowledgedAt: string;
  acknowledgedBy: string;
  expiresAt?: string;
  version?: string;
  ipAddress?: string;
  deviceInfo?: string;
  consentText?: string[];
}

export interface UndertakingConfirmationProps extends BaseComponentProps {
  acknowledgement: AcknowledgementData;
  onDownload?: () => void;
  onShare?: () => void;
  onPrint?: () => void;
  onViewDetails?: () => void;
  showMetadata?: boolean;
}

const UndertakingConfirmation = forwardRef<HTMLDivElement, UndertakingConfirmationProps>(({
  className,
  acknowledgement,
  onDownload,
  onShare,
  onPrint,
  onViewDetails,
  showMetadata = true,
  'data-testid': testId,
}, ref) => {
  const isExpired = acknowledgement.expiresAt && new Date(acknowledgement.expiresAt) < new Date();

  return (
    <div
      ref={ref}
      className={cn('border rounded-lg p-6', className)}
      style={{ borderColor: 'var(--border-primary)' }}
      data-testid={testId}
    >
      {/* Success Header */}
      <div className="text-center mb-6">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full" style={{ backgroundColor: 'var(--color-green-100)' }}>
          <CheckCircle2 className="w-6 h-6" style={{ color: 'var(--color-green-600)' }} />
        </div>
        
        <h2 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
          Acknowledgement Confirmed
        </h2>
        
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          Your acknowledgement has been successfully recorded
        </p>
      </div>

      {/* Acknowledgement Details Card */}
      <div className="border rounded-lg p-4 mb-4" style={{ backgroundColor: 'var(--color-gray-50)', borderColor: 'var(--border-primary)' }}>
        <div className="flex items-start gap-3">
          <FileText className="w-5 h-5 flex-shrink-0" style={{ color: 'var(--color-blue-600)' }} />
          
          <div className="flex-1">
            <h3 className="font-medium text-sm mb-1" style={{ color: 'var(--text-primary)' }}>
              {acknowledgement.title}
            </h3>
            <p className="text-xs mb-3" style={{ color: 'var(--text-secondary)' }}>
              {acknowledgement.type}
            </p>

            {/* Acknowledgement Timestamp */}
            <div className="flex items-center gap-2 text-xs mb-2">
              <Calendar className="w-3 h-3 flex-shrink-0" style={{ color: 'var(--color-green-600)' }} />
              <span style={{ color: 'var(--text-secondary)' }}>
                Acknowledged on: <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
                  {new Date(acknowledgement.acknowledgedAt).toLocaleString()}
                </span>
              </span>
            </div>

            {/* Acknowledged By */}
            <div className="flex items-center gap-2 text-xs">
              <CheckCircle2 className="w-3 h-3 flex-shrink-0" style={{ color: 'var(--color-blue-600)' }} />
              <span style={{ color: 'var(--text-secondary)' }}>
                Acknowledged by: <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
                  {acknowledgement.acknowledgedBy}
                </span>
              </span>
            </div>

            {/* Version */}
            {acknowledgement.version && (
              <div className="mt-2 pt-2 border-t text-xs" style={{ borderColor: 'var(--border-primary)' }}>
                <span style={{ color: 'var(--text-secondary)' }}>
                  Version: <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
                    {acknowledgement.version}
                  </span>
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Expiry Warning */}
        {isExpired && (
          <div className="mt-3 pt-3 border-t flex items-start gap-2 text-xs" style={{ borderColor: 'var(--border-primary)' }}>
            <Clock className="w-3 h-3 flex-shrink-0 mt-0.5" style={{ color: 'var(--color-amber-600)' }} />
            <div>
              <p className="font-medium" style={{ color: 'var(--color-amber-700)' }}>
                Acknowledgement has expired
              </p>
              <p style={{ color: 'var(--text-secondary)' }}>
                This acknowledgement expired on {new Date(acknowledgement.expiresAt!).toLocaleDateString()}. 
                Please renew your acknowledgement to continue.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Metadata Section */}
      {showMetadata && (
        <div className="mb-6 space-y-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
          <div className="flex items-center justify-between p-2 rounded" style={{ backgroundColor: 'var(--color-gray-100)' }}>
            <span>Reference ID:</span>
            <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
              {acknowledgement.id}
            </span>
          </div>

          {acknowledgement.ipAddress && (
            <div className="flex items-center justify-between p-2 rounded" style={{ backgroundColor: 'var(--color-gray-100)' }}>
              <span>IP Address:</span>
              <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
                {acknowledgement.ipAddress}
              </span>
            </div>
          )}

          {acknowledgement.deviceInfo && (
            <div className="flex items-center justify-between p-2 rounded" style={{ backgroundColor: 'var(--color-gray-100)' }}>
              <span>Device:</span>
              <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
                {acknowledgement.deviceInfo}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Consented Items */}
      {acknowledgement.consentText && acknowledgement.consentText.length > 0 && (
        <div className="mb-6 border rounded-lg p-4" style={{ borderColor: 'var(--border-primary)' }}>
          <h4 className="text-sm font-medium mb-3" style={{ color: 'var(--text-primary)' }}>
            Items Acknowledged:
          </h4>
          <ul className="space-y-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
            {acknowledgement.consentText.map((item, index) => (
              <li key={index} className="flex items-start gap-2">
                <CheckCircle2 className="w-3 h-3 flex-shrink-0 mt-0.5" style={{ color: 'var(--color-green-600)' }} />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2">
        {onViewDetails && (
          <Button
            variant="secondary"
            size="md"
            onClick={onViewDetails}
            leftIcon={<FileText className="w-4 h-4" />}
          >
            View Details
          </Button>
        )}

        {onDownload && (
          <Button
            variant="secondary"
            size="md"
            onClick={onDownload}
            leftIcon={<Download className="w-4 h-4" />}
          >
            Download Copy
          </Button>
        )}

        {onPrint && (
          <Button
            variant="ghost"
            size="md"
            onClick={onPrint}
            leftIcon={<Printer className="w-4 h-4" />}
          >
            Print
          </Button>
        )}

        {onShare && (
          <Button
            variant="ghost"
            size="md"
            onClick={onShare}
            leftIcon={<Share className="w-4 h-4" />}
          >
            Share
          </Button>
        )}
      </div>

      {/* Legal Notice */}
      <div className="mt-6 pt-4 border-t text-xs" style={{ borderColor: 'var(--border-primary)' }}>
        <p className="mb-2 font-medium" style={{ color: 'var(--text-primary)' }}>
          Legal Notice:
        </p>
        <p style={{ color: 'var(--text-secondary)' }}>
          This acknowledgement constitutes a legally binding commitment. 
          By acknowledging, you confirm that you have read, understood, and agreed to 
          all terms and conditions specified above. This record will be stored 
          for audit purposes and may be used for future reference.
          Any false statement or misrepresentation may result in disciplinary action.
        </p>
      </div>
    </div>
  );
});

UndertakingConfirmation.displayName = 'UndertakingConfirmation';

export { UndertakingConfirmation };

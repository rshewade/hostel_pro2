'use client';

import { forwardRef } from 'react';
import { cn } from '../utils';
import { Button } from '../ui/Button';
import { A4Page } from '../print';
import { UndertakingType, UndertakingStatus } from './UndertakingCard';
import type { BaseComponentProps } from '../types';

export interface UndertakingPrintViewProps extends BaseComponentProps {
  undertakingType: UndertakingType;
  title: string;
  description: string;
  status: UndertakingStatus;
  acknowledgedAt: string;
  acknowledgedBy: string;
  expiresAt?: string;
  referenceNumber?: string;
  version?: string;
  consentItems?: string[];
  signature?: string;
  organizationName?: string;
  logoUrl?: string;
}

const UNDERTAKING_TITLES: Record<UndertakingType, string> = {
  dpdp_consent_renewal: 'DPDP Consent Renewal',
  hostel_rules_acknowledgement: 'Hostel Rules Acknowledgement',
  code_of_conduct: 'Code of Conduct Acceptance',
  emergency_contact_verification: 'Emergency Contact Verification',
  payment_terms_acceptance: 'Payment Terms Acceptance',
  leave_policy_acknowledgement: 'Leave Policy Acknowledgement',
  general_rules_update: 'General Rules Update'
};

const UndertakingPrintView = forwardRef<HTMLDivElement, UndertakingPrintViewProps>(({
  className,
  undertakingType,
  title,
  description,
  status,
  acknowledgedAt,
  acknowledgedBy,
  expiresAt,
  referenceNumber,
  version,
  consentItems,
  signature,
  organizationName = 'Seth Hirachand Gumanji Jain Trust',
  logoUrl,
  'data-testid': testId,
}, ref) => {
  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const isExpired = expiresAt && new Date(expiresAt) < new Date();

  const statusColor = () => {
    switch (status) {
      case 'completed':
        return 'var(--color-green-600)';
      case 'overdue':
        return 'var(--color-red-600)';
      default:
        return 'var(--color-gray-600)';
    }
  };

  return (
    <A4Page
      className={className}
      header={
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img 
              src={logoUrl || '/logo.png'}
              alt={organizationName}
              className="h-12 w-auto"
            />
            <div>
              <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                {organizationName}
              </h1>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                {UNDERTAKING_TITLES[undertakingType]}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Ref: {referenceNumber}
            </p>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Version: {version}
            </p>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Date: {formatDate(new Date().toISOString())}
            </p>
          </div>
        </div>
      }
      footer={
        <div className="flex items-center justify-between pt-4 border-t" style={{ borderColor: 'var(--color-gray-200)' }}>
          <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            <p>Acknowledged on: <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
              {formatDate(acknowledgedAt)}
            </span></p>
            <p>By: <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
              {acknowledgedBy}
            </span></p>
          </div>
          <div className="text-right text-sm" style={{ color: 'var(--text-secondary)' }}>
            <p>Page 1 of 1</p>
          </div>
        </div>
      }
    >
      {/* Title Section */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
          {title}
        </h2>
        {isExpired && (
          <div className="mt-2 p-3 rounded" style={{ backgroundColor: 'var(--color-amber-50)', border: '1px solid var(--color-amber-500)' }}>
            <p className="text-sm font-medium" style={{ color: 'var(--color-amber-700)' }}>
              EXPIRED - This undertaking has expired on {formatDate(expiresAt)}
            </p>
          </div>
        )}
      </div>

      {/* Description */}
      <div className="mb-8 text-justify leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
        {description}
      </div>

      {/* Consent Items */}
      {consentItems && consentItems.length > 0 && (
        <div className="mb-8 p-6 border-2" style={{ borderColor: 'var(--color-gray-200)' }}>
          <h3 className="text-xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
            Items Acknowledged
          </h3>
          <ul className="space-y-2" style={{ listStyleType: 'none' }}>
            {consentItems.map((item, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-2xl mr-3" style={{ color: 'var(--color-green-600)' }}>
                  ✓
                </span>
                <span style={{ color: 'var(--text-secondary)' }}>
                  {item}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Signature Section */}
      {(signature || (consentItems && consentItems.length > 0)) && (
        <div className="mb-8 p-6 border-2" style={{ borderColor: 'var(--color-gray-200)' }}>
          <h3 className="text-xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
            Digital Signature
          </h3>
          {consentItems && consentItems.length > 0 && (
            <div className="mt-4 space-y-4">
              {consentItems.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <span className="text-lg">✓</span>
                  <span style={{ color: 'var(--text-secondary)' }}>
                    {item}
                  </span>
                </div>
              ))}
            </div>
          )}
          {signature && (
            <div className="mt-8 pt-8 border-t" style={{ borderColor: 'var(--color-gray-200)' }}>
              <div className="space-y-4">
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  I, <span className="font-medium">{acknowledgedBy}</span>, hereby acknowledge and agree to the undertaking titled "{title}" as described above.
                </p>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  This digital acknowledgement, submitted on <span className="font-medium">{formatDate(acknowledgedAt)}</span>,
                </p>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  serves as a legally binding confirmation equivalent to my handwritten signature.
                </p>
              </div>
              <div className="mt-8 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-16 h-16 border-b-2" style={{ borderColor: 'var(--color-gray-200)' }} />
                  <div>
                    <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                      Signed on: <span className="font-medium">{formatDate(acknowledgedAt)}</span>
                    </p>
                    <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                      By: <span className="font-medium">{acknowledgedBy}</span> (Digitally Signed)
                    </p>
                  </div>
                </div>
                <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                  IP Address: <span className="font-mono" style={{ color: 'var(--text-primary)' }}>
                    {/* Would be logged from backend */}
                    192.168.1.X
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Legal Notice */}
      <div className="mt-12 pt-8 border-t-2 text-xs" style={{ borderColor: 'var(--color-gray-200)' }}>
        <div className="max-w-3xl mx-auto mb-4">
          <p className="font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
            Legal Notice:
          </p>
          <p className="mb-4" style={{ color: 'var(--text-secondary)' }}>
            This document constitutes a legally binding acknowledgement. By signing digitally,
            you confirm that you have read, understood, and agreed to all terms and conditions
            specified above. This record will be stored for audit purposes and may be used
            for future reference. Any false statement or misrepresentation may result in disciplinary action.
          </p>
          <div className="space-y-2">
            <p style={{ color: 'var(--text-secondary)' }}>
              <strong>DPDP Compliance:</strong> This acknowledgement is governed by the
              applicable data protection laws and regulations. Your data will be processed
              in accordance with the stated privacy policy.
            </p>
            <p style={{ color: 'var(--text-secondary)' }}>
              <strong>Audit Trail:</strong> All acknowledgements are logged with timestamp,
              user identification, IP address, and device information for compliance
              and security purposes.
            </p>
            <p style={{ color: 'var(--text-secondary)' }}>
              <strong>Revocation:</strong> Undertakings may be revoked or updated only through formal
              administrative processes. Any unauthorized changes to this document will be
              considered invalid.
            </p>
          </div>
        </div>
      </div>
    </A4Page>
  );
});

UndertakingPrintView.displayName = 'UndertakingPrintView';

export { UndertakingPrintView };

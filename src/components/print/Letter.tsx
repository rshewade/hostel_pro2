'use client';

import { cn } from '../utils';
import { A4Page } from './A4Page';
import type { BaseComponentProps } from '../types';

/**
 * Letter - Formal letter/undertaking template
 *
 * Usage: Use for official letters, undertakings, admission letters,
 * and formal correspondence requiring signatures.
 */

export interface LetterProps extends BaseComponentProps {
  /** Organization/institution name */
  organizationName?: string;
  /** Organization logo URL */
  logoUrl?: string;
  /** Organization address lines */
  organizationAddress?: string[];
  /** Contact information */
  contactInfo?: {
    phone?: string;
    email?: string;
    website?: string;
  };
  /** Letter reference number */
  referenceNumber?: string;
  /** Letter date */
  date?: string;
  /** Subject line */
  subject?: string;
  /** Salutation (e.g., "Dear Sir/Madam,") */
  salutation?: string;
  /** Closing (e.g., "Yours faithfully,") */
  closing?: string;
  /** Signature image URL */
  signatureUrl?: string;
  /** Signatory name */
  signatoryName?: string;
  /** Signatory designation */
  signatoryDesignation?: string;
  /** Show seal/stamp placeholder */
  showSealPlaceholder?: boolean;
}

const Letter = ({
  children,
  className,
  organizationName = 'Seth Hirachand Gumanji Jain Trust',
  logoUrl,
  organizationAddress = [],
  contactInfo,
  referenceNumber,
  date,
  subject,
  salutation = 'Dear Sir/Madam,',
  closing = 'Yours faithfully,',
  signatureUrl,
  signatoryName,
  signatoryDesignation,
  showSealPlaceholder = false,
  ...props
}: LetterProps) => {
  // Letter header
  const letterHeader = (
    <div className="flex items-start gap-4">
      {/* Logo */}
      {logoUrl && (
        <div className="flex-shrink-0">
          <img
            src={logoUrl}
            alt={organizationName}
            className="h-16 w-auto print:h-[15mm]"
          />
        </div>
      )}

      {/* Organization info */}
      <div className="flex-1 text-center">
        <h1 className="text-lg font-bold text-navy-900 print:text-black">
          {organizationName}
        </h1>
        {organizationAddress.length > 0 && (
          <div className="text-xs text-gray-600 print:text-gray-700 mt-1">
            {organizationAddress.map((line, i) => (
              <p key={i}>{line}</p>
            ))}
          </div>
        )}
        {contactInfo && (
          <div className="text-xs text-gray-500 print:text-gray-600 mt-1">
            {contactInfo.phone && <span>Tel: {contactInfo.phone}</span>}
            {contactInfo.email && <span className="ml-3">Email: {contactInfo.email}</span>}
          </div>
        )}
      </div>

      {/* Spacer for logo balance */}
      {logoUrl && <div className="w-16 flex-shrink-0" />}
    </div>
  );

  return (
    <A4Page
      header={letterHeader}
      className={cn('letter-container', className)}
      {...props}
    >
      {/* Reference and Date */}
      <div className="flex items-center justify-between text-sm mb-6">
        {referenceNumber && (
          <div>
            <span className="text-gray-600">Ref: </span>
            <span className="font-medium">{referenceNumber}</span>
          </div>
        )}
        {date && (
          <div>
            <span className="text-gray-600">Date: </span>
            <span className="font-medium">{date}</span>
          </div>
        )}
      </div>

      {/* Subject */}
      {subject && (
        <div className="mb-6">
          <p className="font-semibold">
            <span className="underline">Subject:</span> {subject}
          </p>
        </div>
      )}

      {/* Salutation */}
      <p className="mb-4">{salutation}</p>

      {/* Letter body */}
      <div className="space-y-4 text-justify leading-relaxed">
        {children}
      </div>

      {/* Closing and signature */}
      <div className="mt-8">
        <p className="mb-16">{closing}</p>

        <div className="flex items-end justify-between">
          {/* Signature block */}
          <div>
            {signatureUrl && (
              <img
                src={signatureUrl}
                alt="Signature"
                className="h-12 w-auto mb-2"
              />
            )}
            {signatoryName && (
              <p className="font-semibold">{signatoryName}</p>
            )}
            {signatoryDesignation && (
              <p className="text-sm text-gray-600">{signatoryDesignation}</p>
            )}
          </div>

          {/* Seal placeholder */}
          {showSealPlaceholder && (
            <div className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-full flex items-center justify-center text-xs text-gray-400 print:border-gray-500">
              Seal
            </div>
          )}
        </div>
      </div>
    </A4Page>
  );
};

/**
 * Undertaking - Specific variant of Letter for undertaking documents
 */
export interface UndertakingProps extends Omit<LetterProps, 'subject' | 'salutation' | 'closing'> {
  /** Undertaking title */
  title?: string;
  /** Person giving the undertaking */
  declarantName?: string;
  /** Guardian/parent name if applicable */
  guardianName?: string;
  /** Witness name */
  witnessName?: string;
  /** Place of signing */
  place?: string;
}

const Undertaking = ({
  children,
  title = 'UNDERTAKING',
  declarantName,
  guardianName,
  witnessName,
  place,
  date,
  ...props
}: UndertakingProps) => {
  return (
    <A4Page {...props}>
      {/* Title */}
      <div className="text-center mb-8">
        <h1 className="text-xl font-bold underline">{title}</h1>
      </div>

      {/* Undertaking body */}
      <div className="space-y-4 text-justify leading-relaxed">
        {children}
      </div>

      {/* Signature section */}
      <div className="mt-12 grid grid-cols-2 gap-8">
        {/* Declarant signature */}
        <div>
          <div className="border-t border-gray-400 pt-2 mt-16">
            <p className="font-semibold">Signature of Declarant</p>
            {declarantName && (
              <p className="text-sm text-gray-600">Name: {declarantName}</p>
            )}
          </div>
        </div>

        {/* Guardian signature if applicable */}
        {guardianName && (
          <div>
            <div className="border-t border-gray-400 pt-2 mt-16">
              <p className="font-semibold">Signature of Parent/Guardian</p>
              <p className="text-sm text-gray-600">Name: {guardianName}</p>
            </div>
          </div>
        )}
      </div>

      {/* Witness and place/date */}
      <div className="mt-8 flex items-end justify-between">
        {witnessName && (
          <div>
            <div className="border-t border-gray-400 pt-2 mt-8 w-48">
              <p className="text-sm font-medium">Witness</p>
              <p className="text-sm text-gray-600">Name: {witnessName}</p>
            </div>
          </div>
        )}

        <div className="text-right text-sm">
          {place && <p>Place: {place}</p>}
          {date && <p>Date: {date}</p>}
        </div>
      </div>
    </A4Page>
  );
};

Letter.displayName = 'Letter';
Undertaking.displayName = 'Undertaking';

export { Letter, Undertaking };

'use client';

import { cn } from '../utils';
import type { BaseComponentProps } from '../types';

/**
 * Receipt - Receipt/voucher container optimized for print
 *
 * Dimensions: Half A4 width (105mm x ~148mm) or thermal receipt width (80mm)
 *
 * Usage: Use for payment receipts, acknowledgements, and vouchers.
 */

export interface ReceiptProps extends BaseComponentProps {
  /** Receipt title */
  title?: string;
  /** Receipt number */
  receiptNumber?: string;
  /** Date of receipt */
  date?: string;
  /** Organization header */
  organizationName?: string;
  /** Organization address */
  organizationAddress?: string;
  /** Show dotted border (for cut line) */
  showCutLine?: boolean;
  /** Receipt size */
  size?: 'thermal' | 'half-a4' | 'a5';
}

const Receipt = ({
  children,
  className,
  title = 'Receipt',
  receiptNumber,
  date,
  organizationName,
  organizationAddress,
  showCutLine = true,
  size = 'half-a4',
  ...props
}: ReceiptProps) => {
  // Size classes
  const sizeClasses = {
    'thermal': 'max-w-[80mm] print:max-w-[80mm]',
    'half-a4': 'max-w-[105mm] print:max-w-[105mm]',
    'a5': 'max-w-[148mm] print:max-w-[148mm]',
  };

  return (
    <div
      className={cn(
        // Base dimensions
        'w-full mx-auto',
        sizeClasses[size],

        // Background
        'bg-white',

        // Border (cut line)
        showCutLine && [
          'border-2 border-dashed border-gray-300',
          'print:border-gray-500',
        ],

        // Print styles
        'print:shadow-none',
        'print:break-inside-avoid',

        // Typography
        'text-xs print:text-[9pt]',
        'font-sans text-gray-900 print:text-black',

        className
      )}
      {...props}
    >
      {/* Receipt content */}
      <div className="p-4 print:p-[10mm]">
        {/* Organization header */}
        {organizationName && (
          <div className="text-center mb-4 pb-3 border-b border-gray-200 print:border-gray-400">
            <h2 className="font-bold text-sm print:text-[11pt]">
              {organizationName}
            </h2>
            {organizationAddress && (
              <p className="text-[10px] print:text-[8pt] text-gray-600 mt-1">
                {organizationAddress}
              </p>
            )}
          </div>
        )}

        {/* Receipt title and number */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-sm print:text-[10pt]">
            {title}
          </h3>
          {receiptNumber && (
            <span className="font-mono text-[10px] print:text-[8pt] text-gray-600">
              #{receiptNumber}
            </span>
          )}
        </div>

        {/* Date */}
        {date && (
          <p className="text-[10px] print:text-[8pt] text-gray-500 mb-4">
            Date: {date}
          </p>
        )}

        {/* Receipt body */}
        <div className="space-y-2">
          {children}
        </div>

        {/* Footer */}
        <div className="mt-6 pt-3 border-t border-gray-200 print:border-gray-400 text-center">
          <p className="text-[10px] print:text-[8pt] text-gray-500">
            Thank you
          </p>
        </div>
      </div>
    </div>
  );
};

/**
 * ReceiptRow - Line item for receipts
 */
export interface ReceiptRowProps extends BaseComponentProps {
  label: string;
  value: string | React.ReactNode;
  bold?: boolean;
}

const ReceiptRow = ({
  label,
  value,
  bold = false,
  className,
}: ReceiptRowProps) => {
  return (
    <div
      className={cn(
        'flex items-center justify-between gap-2',
        bold && 'font-semibold',
        className
      )}
    >
      <span className="text-gray-700">{label}</span>
      <span className="text-right">{value}</span>
    </div>
  );
};

/**
 * ReceiptDivider - Dotted divider for receipts
 */
const ReceiptDivider = ({ className }: { className?: string }) => {
  return (
    <div
      className={cn(
        'border-t border-dashed border-gray-300 my-2',
        className
      )}
    />
  );
};

Receipt.displayName = 'Receipt';
ReceiptRow.displayName = 'ReceiptRow';
ReceiptDivider.displayName = 'ReceiptDivider';

export { Receipt, ReceiptRow, ReceiptDivider };

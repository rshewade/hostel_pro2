'use client';

import { useRef } from 'react';
import { Button } from '@/components/ui/Button';
import { DollarSignIcon } from '@/components/ui/IconDollarSign';
import { FileTextIcon } from '@/components/ui/IconFileText';
import { CreditCardIcon } from '@/components/ui/IconCreditCard';

interface PaymentReceiptProps {
  receipt: {
    transactionId: string;
    feeId: string;
    feeName: string;
    feeBreakdown: {
      totalAmount: number;
      processingFee?: number;
      convenienceFee?: number;
      taxAmount?: number;
      finalAmount: number;
    };
    payerDetails: {
      name: string;
      email: string;
      phone: string;
      vertical: string;
      academicYear: string;
    };
    paymentDetails: {
      method: 'UPI' | 'QR Code' | 'Card' | 'Net Banking';
      paymentDate: Date;
      status: 'PAID' | 'PENDING' | 'FAILED';
      referenceNumber?: string;
    };
  };
  onDownload?: () => void;
}

export function PaymentReceipt({ receipt, onDownload }: PaymentReceiptProps) {
  const receiptRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div
        ref={receiptRef}
        className="bg-white p-8 rounded-lg shadow-lg border"
        style={{ borderColor: 'var(--border-primary)' }}
      >
        {/* Header */}
        <div className="text-center mb-8 pb-6 border-b" style={{ borderColor: 'var(--border-primary)' }}>
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: 'var(--bg-accent)' }}>
              <span className="text-2xl">🏛️</span>
            </div>
            <div className="text-left">
              <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                Sheth Hirachand Gumanji Jain
              </h1>
              <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                Boarding & Hostel Management
              </p>
            </div>
          </div>
          <div className="inline-block px-4 py-2 rounded-full text-sm font-semibold" style={{ background: 'var(--color-green-100)', color: 'var(--color-green-700)' }}>
            PAYMENT RECEIPT
          </div>
        </div>

        {/* Transaction Details */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                Transaction ID
              </p>
              <p className="text-lg font-mono font-semibold" style={{ color: 'var(--text-primary)' }}>
                {receipt.transactionId}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                Status
              </p>
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                receipt.paymentDetails.status === 'PAID' ? 'bg-green-100 text-green-800' :
                receipt.paymentDetails.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {receipt.paymentDetails.status}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                Payment Date & Time
              </p>
              <p className="font-medium" style={{ color: 'var(--text-primary)' }}>
                {receipt.paymentDetails.paymentDate.toLocaleString('en-IN', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                Payment Method
              </p>
              <p className="font-medium" style={{ color: 'var(--text-primary)' }}>
                {receipt.paymentDetails.method}
              </p>
            </div>
          </div>
        </div>

        {/* Payment Details */}
        <div className="mb-8 p-6 rounded-lg" style={{ background: 'var(--bg-page)' }}>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <DollarSignIcon className="w-5 h-5" />
            Payment Details
          </h3>

          <div className="space-y-3">
            <div className="flex justify-between items-center pb-2 border-b" style={{ borderColor: 'var(--border-primary)' }}>
              <div>
                <p className="font-medium" style={{ color: 'var(--text-primary)' }}>
                  {receipt.feeName}
                </p>
                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                  Fee ID: {receipt.feeId}
                </p>
              </div>
              <p className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>
                ₹{receipt.feeBreakdown.totalAmount.toLocaleString('en-IN')}
              </p>
            </div>

            {receipt.feeBreakdown.processingFee && (
              <div className="flex justify-between text-sm">
                <span style={{ color: 'var(--text-secondary)' }}>Processing Fee</span>
                <span style={{ color: 'var(--text-primary)' }}>₹{receipt.feeBreakdown.processingFee.toLocaleString('en-IN')}</span>
              </div>
            )}

            {receipt.feeBreakdown.convenienceFee && (
              <div className="flex justify-between text-sm">
                <span style={{ color: 'var(--text-secondary)' }}>Convenience Fee</span>
                <span style={{ color: 'var(--text-primary)' }}>₹{receipt.feeBreakdown.convenienceFee.toLocaleString('en-IN')}</span>
              </div>
            )}

            {receipt.feeBreakdown.taxAmount && (
              <div className="flex justify-between text-sm">
                <span style={{ color: 'var(--text-secondary)' }}>Tax (GST 18%)</span>
                <span style={{ color: 'var(--text-primary)' }}>₹{receipt.feeBreakdown.taxAmount.toLocaleString('en-IN')}</span>
              </div>
            )}

            <div className="flex justify-between items-center pt-3 mt-3 border-t-2" style={{ borderColor: 'var(--border-primary)' }}>
              <span className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
                Total Amount Paid
              </span>
              <span className="text-2xl font-bold" style={{ color: 'var(--color-blue-600)' }}>
                ₹{receipt.feeBreakdown.finalAmount.toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        </div>

        {/* Payer Details */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <FileTextIcon className="w-5 h-5" />
            Payer Information
          </h3>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                Payer Name
              </p>
              <p className="font-medium" style={{ color: 'var(--text-primary)' }}>
                {receipt.payerDetails.name}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                Vertical
              </p>
              <p className="font-medium" style={{ color: 'var(--text-primary)' }}>
                {receipt.payerDetails.vertical}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                Email
              </p>
              <p className="font-medium" style={{ color: 'var(--text-primary)' }}>
                {receipt.payerDetails.email}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                Phone
              </p>
              <p className="font-medium" style={{ color: 'var(--text-primary)' }}>
                {receipt.payerDetails.phone}
              </p>
            </div>
            <div className="col-span-2">
              <p className="text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                Academic Year
              </p>
              <p className="font-medium" style={{ color: 'var(--text-primary)' }}>
                {receipt.payerDetails.academicYear}
              </p>
            </div>
          </div>
        </div>

        {/* Additional Payment Info */}
        {receipt.paymentDetails.referenceNumber && (
          <div className="mb-8 p-4 rounded-lg" style={{ background: 'var(--bg-page)' }}>
            <div className="flex items-center gap-3">
              <CreditCardIcon className="w-5 h-5" color="var(--text-primary)" />
              <div className="flex-1">
                <p className="text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                  Reference Number (Bank/UPI)
                </p>
                <p className="text-base font-mono font-semibold" style={{ color: 'var(--text-primary)' }}>
                  {receipt.paymentDetails.referenceNumber}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Terms & Conditions */}
        <div className="mb-8 p-4 rounded-lg text-xs" style={{ background: 'var(--color-blue-50)', borderLeft: '4px solid var(--color-blue-500)' }}>
          <h4 className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
            Terms & Conditions
          </h4>
          <ul className="space-y-1" style={{ color: 'var(--text-secondary)' }}>
            <li>• This is an electronically generated receipt and does not require signature</li>
            <li>• Please retain this receipt for your records and future reference</li>
            <li>• For any discrepancies, contact Accounts within 7 working days</li>
            <li>• This payment is non-refundable as per hostel policy</li>
          </ul>
        </div>

        {/* DPDP Compliance Notice */}
        <div className="mb-8 p-4 rounded-lg text-xs" style={{ background: 'var(--color-green-50)', borderLeft: '4px solid var(--color-green-500)' }}>
          <div className="flex items-start gap-2">
            <span className="text-lg">🔒</span>
            <div>
              <h4 className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                Data Protection & Privacy (DPDP) Compliance Notice
              </h4>
              <p className="mb-2" style={{ color: 'var(--text-secondary)' }}>
                Your payment information is encrypted and processed securely in compliance with the Data Protection and Privacy Principles Act. This receipt contains sensitive financial and personal information.
              </p>
              <ul className="space-y-1" style={{ color: 'var(--text-secondary)' }}>
                <li>• Transaction details are logged for audit purposes</li>
                <li>• Financial data is stored securely with restricted access</li>
                <li>• Personal information will only be used for fee management</li>
                <li>• You can request data deletion per DPDP regulations</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center pt-6 border-t" style={{ borderColor: 'var(--border-primary)' }}>
          <div className="flex justify-center items-center gap-3 mb-3">
            <span className="text-xl">🏛️</span>
            <div className="text-left">
              <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                Sheth Hirachand Gumanji Jain
              </p>
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                Boarding & Hostel Management
              </p>
            </div>
          </div>
          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
            Receipt generated electronically on{' '}
            {new Date().toLocaleString('en-IN', {
              day: '2-digit',
              month: 'long',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </p>
          <div className="mt-3 flex items-center justify-center gap-6 text-xs" style={{ color: 'var(--text-secondary)' }}>
            <span>📍 Address Line 1, City, State - 123456</span>
            <span>📞 +91 12345 67890</span>
            <span>✉️ info@jainhostel.edu</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 justify-center mt-6 no-print">
        <Button
          variant="primary"
          size="md"
          leftIcon={<FileTextIcon className="w-4 h-4" />}
          onClick={handlePrint}
        >
          Print Receipt
        </Button>
        {onDownload && (
          <Button
            variant="secondary"
            size="md"
            leftIcon={<FileTextIcon className="w-4 h-4" />}
            onClick={onDownload}
          >
            Download PDF
          </Button>
        )}
      </div>

      {/* Print-specific styles */}
      <style jsx global>{`
        @media print {
          .no-print {
            display: none !important;
          }

          body {
            background: white !important;
          }

          @page {
            margin: 10mm;
            size: A4;
          }
        }
      `}</style>
    </div>
  );
}

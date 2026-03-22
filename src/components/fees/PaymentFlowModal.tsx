'use client';

import { useState } from 'react';
import { Modal } from '@/components/feedback/Modal';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/data/Card';
import { Badge } from '@/components/ui/Badge';
import { PaymentReceipt } from './PaymentReceipt';

interface PaymentMethod {
  id: string;
  name: string;
  icon: string;
  description: string;
  securityNote: string;
}

interface PaymentFlowModalProps {
  isOpen: boolean;
  onClose: () => void;
  feeId: string;
  feeName: string;
  amount: number;
  onPaymentComplete?: () => void;
}

const PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: 'upi',
    name: 'UPI Payment',
    icon: '📱',
    description: 'Pay instantly using any UPI app (Google Pay, PhonePe, Paytm, etc.)',
    securityNote: 'Secured by UPI with bank-level encryption',
  },
  {
    id: 'qr',
    name: 'QR Code',
    icon: '📷',
    description: 'Scan QR code using any UPI app or payment scanner',
    securityNote: 'One-time secure QR code linked to your payment',
  },
];

export function PaymentFlowModal({
  isOpen,
  onClose,
  feeId,
  feeName,
  amount,
  onPaymentComplete,
}: PaymentFlowModalProps) {
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [paymentStep, setPaymentStep] = useState<'select' | 'processing' | 'success' | 'failed' | 'pending'>('select');
  const [paymentDetails, setPaymentDetails] = useState<{ paymentLink?: string; qrCode?: string }>({});
  const [isPolling, setIsPolling] = useState(false);

  // Mock receipt data (in real implementation, this would come from backend)
  const generateReceiptData = () => ({
    transactionId: `TXN-${Date.now()}`,
    feeId,
    feeName,
    feeBreakdown: {
      totalAmount: amount,
      processingFee: 0,
      convenienceFee: 0,
      taxAmount: Math.round(amount * 0.18),
      finalAmount: amount,
    },
    payerDetails: {
      name: 'Rahul Kumar',
      email: 'rahul.kumar@example.com',
      phone: '+91 98765 43210',
      vertical: 'Boys Hostel',
      academicYear: '2024-25',
    },
    paymentDetails: {
      method: (selectedMethod === 'upi' ? 'UPI' : 'QR Code') as 'UPI' | 'QR Code',
      paymentDate: new Date(),
      status: 'PAID' as const,
      referenceNumber: `REF-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
    },
  });

  const handleMethodSelect = (methodId: string) => {
    setSelectedMethod(methodId);
    // In real implementation, this would call /payments/create
    // and get payment link/QR code
    setPaymentStep('processing');

    // Simulate API call
    setTimeout(() => {
      if (methodId === 'upi') {
        setPaymentDetails({
          paymentLink: 'upi://pay?pa=jainhostel@upi&pn=JainHostel&am=' + amount + '&cu=INR',
        });
      } else if (methodId === 'qr') {
        setPaymentDetails({
          qrCode: 'data:image/svg+xml;base64,placeholder-qr-code-data',
        });
      }
      setIsPolling(true);

      // Simulate polling for payment status
      simulatePaymentPolling();
    }, 1500);
  };

  const simulatePaymentPolling = () => {
    // In real implementation, this would poll /payments/status every few seconds
    const pollInterval = setInterval(() => {
      console.log('Polling payment status...');

      // Simulate payment completion after 5 seconds
      setTimeout(() => {
        clearInterval(pollInterval);
        setIsPolling(false);

        // Simulate: 70% success, 15% pending, 15% failed
        const random = Math.random();
        if (random < 0.7) {
          setPaymentStep('success');
          if (onPaymentComplete) {
            onPaymentComplete();
          }
        } else if (random < 0.85) {
          setPaymentStep('pending');
        } else {
          setPaymentStep('failed');
        }
      }, 5000);
    }, 2000);
  };

  const resetPayment = () => {
    setSelectedMethod(null);
    setPaymentStep('select');
    setPaymentDetails({});
    setIsPolling(false);
  };

  const getStepTitle = () => {
    switch (paymentStep) {
      case 'select':
        return 'Select Payment Method';
      case 'processing':
        return 'Complete Your Payment';
      case 'success':
        return 'Payment Successful!';
      case 'failed':
        return 'Payment Failed';
      case 'pending':
        return 'Payment Pending';
      default:
        return 'Payment';
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={getStepTitle()}
      size={paymentStep === 'success' ? 'full' : 'lg'}
      closable={paymentStep === 'select' || paymentStep === 'failed' || paymentStep === 'pending'}
      footer={
        (paymentStep === 'success' || paymentStep === 'failed' || paymentStep === 'pending') && (
          <div className="flex gap-3 justify-end">
            {paymentStep === 'failed' && (
              <Button variant="secondary" onClick={resetPayment}>
                Try Again
              </Button>
            )}
            {paymentStep === 'pending' && (
              <Button variant="secondary" onClick={() => {
                // Simulate rechecking status
                setIsPolling(true);
                setTimeout(() => {
                  setIsPolling(false);
                  setPaymentStep('success');
                }, 2000);
              }}>
                Check Status
              </Button>
            )}
            <Button variant="primary" onClick={onClose}>
              {paymentStep === 'success' ? 'Done' : 'Close'}
            </Button>
          </div>
        )
      }
    >
      {paymentStep === 'select' && (
        <div>
          <div className="mb-6 p-4 rounded-lg" style={{ background: 'var(--bg-page)' }}>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                Paying for
              </span>
              <Badge variant="info" size="sm">{feeId}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                {feeName}
              </span>
              <span className="text-2xl font-bold" style={{ color: 'var(--color-blue-600)' }}>
                ₹{amount.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
              Choose your payment method:
            </h3>

            {PAYMENT_METHODS.map((method) => (
              <div
                key={method.id}
                onClick={() => handleMethodSelect(method.id)}
                className="cursor-pointer"
              >
                <Card
                  padding="md"
                  shadow="sm"
                  border={true}
                  hover={true}
                  className={`transition-all duration-200 ${
                    selectedMethod === method.id ? 'border-2 border-blue-500' : 'border border-gray-200'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className="text-3xl flex-shrink-0">{method.icon}</div>
                    <div className="flex-1">
                      <h4 className="text-lg font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
                        {method.name}
                      </h4>
                      <p className="text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>
                        {method.description}
                      </p>
                      <div className="flex items-center gap-2">
                        <span className="text-xs">🔒</span>
                        <span className="text-xs" style={{ color: 'var(--color-600)' }}>
                          {method.securityNote}
                        </span>
                      </div>
                    </div>
                    {selectedMethod === method.id && (
                      <div className="flex-shrink-0">
                        <span className="text-2xl">✓</span>
                      </div>
                    )}
                  </div>
                </Card>
              </div>
            ))}
          </div>
        </div>
      )}

      {paymentStep === 'processing' && (
        <div className="text-center py-8">
          <div className="mb-6 flex justify-center">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-blue-600"></div>
          </div>
          <h3 className="text-xl font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
            Processing Payment...
          </h3>
          <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
            Please complete your payment in the {selectedMethod === 'upi' ? 'UPI app' : 'scanner'}. We'll automatically verify once done.
          </p>

          {selectedMethod === 'upi' && paymentDetails.paymentLink && (
            <div className="mb-6 p-4 rounded-lg" style={{ background: 'var(--bg-page)' }}>
              <h4 className="text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                Payment Instructions:
              </h4>
              <ol className="text-sm text-left space-y-2" style={{ color: 'var(--text-secondary)' }}>
                <li>1. Tap the button below to open your UPI app</li>
                <li>2. Verify the payment amount: ₹{amount.toLocaleString('en-IN')}</li>
                <li>3. Enter your UPI PIN and confirm</li>
                <li>4. Wait for payment confirmation here</li>
              </ol>
              <Button
                variant="primary"
                size="md"
                className="mt-4 w-full"
                onClick={() => window.location.href = paymentDetails.paymentLink!}
              >
                Open UPI App
              </Button>
            </div>
          )}

          {selectedMethod === 'qr' && paymentDetails.qrCode && (
            <div className="mb-6 p-4 rounded-lg" style={{ background: 'var(--bg-page)' }}>
              <h4 className="text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                Scan QR Code:
              </h4>
              <div className="flex justify-center mb-4">
                <div className="w-48 h-48 bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
                  <div className="text-center">
                    <div className="text-6xl mb-2">📷</div>
                    <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                      QR Code
                    </p>
                    <p className="text-xs mt-2" style={{ color: 'var(--text-secondary)' }}>
                      (Will be loaded from backend)
                    </p>
                  </div>
                </div>
              </div>
              <ol className="text-sm text-left space-y-2" style={{ color: 'var(--text-secondary)' }}>
                <li>1. Open any UPI app (GPay, PhonePe, Paytm)</li>
                <li>2. Tap "Scan QR" in the app</li>
                <li>3. Point your camera at the QR code above</li>
                <li>4. Verify amount: ₹{amount.toLocaleString('en-IN')} and pay</li>
                <li>5. Wait for confirmation here</li>
              </ol>
            </div>
          )}

          {isPolling && (
            <div className="flex items-center justify-center gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
              <div className="animate-pulse">●</div>
              <span>Checking payment status...</span>
            </div>
          )}
        </div>
      )}

      {paymentStep === 'success' && (
        <div className="py-4 max-h-[80vh] overflow-auto">
          <div className="mb-4 text-center">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3" style={{ background: 'var(--color-green-100)' }}>
              <span className="text-4xl">✅</span>
            </div>
            <h3 className="text-xl font-bold" style={{ color: 'var(--color-green-600)' }}>
              Payment Successful!
            </h3>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Your payment has been received successfully. Below is your receipt.
            </p>
          </div>
          <PaymentReceipt receipt={generateReceiptData()} />
        </div>
      )}

      {paymentStep === 'pending' && (
        <div className="text-center py-8">
          <div className="mb-6 flex justify-center">
            <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ background: 'var(--color-yellow-100)' }}>
              <span className="text-5xl">⏳</span>
            </div>
          </div>
          <h3 className="text-2xl font-bold mb-3" style={{ color: 'var(--color-gold-600)' }}>
            Payment Pending
          </h3>
          <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
            Your payment of <strong>₹{amount.toLocaleString('en-IN')}</strong> for <strong>{feeName}</strong> is being processed. This usually takes a few minutes.
          </p>
          <div className="mb-6 p-4 rounded-lg text-left" style={{ background: 'var(--bg-page)' }}>
            <h4 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
              What happens next?
            </h4>
            <ul className="space-y-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
              <li className="flex items-start gap-2">
                <span className="mt-1">1.</span>
                <span>Your payment is being verified by the payment gateway</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1">2.</span>
                <span>Once verified, your fee status will be updated automatically</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1">3.</span>
                <span>You'll receive a confirmation via email and SMS</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1">4.</span>
                <span>Your receipt will be available in the fee history</span>
              </li>
            </ul>
          </div>
          <div className="mb-6 p-4 rounded-lg" style={{ background: 'var(--color-blue-50)' }}>
            <div className="flex items-start gap-2">
              <span className="text-xl">💡</span>
              <div className="text-left">
                <h4 className="text-sm font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
                  Troubleshooting Tips
                </h4>
                <ul className="text-sm space-y-1" style={{ color: 'var(--text-secondary)' }}>
                  <li>• If you've completed payment but it's still pending, wait 5-10 minutes</li>
                  <li>• Check your payment app's transaction history</li>
                  <li>• Refresh this page to see updated status</li>
                  <li>• If pending for more than 15 minutes, contact support</li>
                </ul>
              </div>
            </div>
          </div>
          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
            Transaction ID: <strong>TXN-{Date.now()}</strong>
          </p>
          <p className="text-xs mt-2" style={{ color: 'var(--text-secondary)' }}>
            Need help? Contact <a href="mailto:accounts@jainhostel.edu" className="underline">accounts@jainhostel.edu</a> or call +91 12345 67890
          </p>
        </div>
      )}

      {paymentStep === 'failed' && (
        <div className="text-center py-8">
          <div className="mb-6 flex justify-center">
            <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ background: 'var(--color-red-100)' }}>
              <span className="text-5xl">❌</span>
            </div>
          </div>
          <h3 className="text-2xl font-bold mb-3" style={{ color: 'var(--color-red-600)' }}>
            Payment Failed
          </h3>
          <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
            We couldn't complete your payment. This could be due to:
          </p>
          <ul className="text-sm text-left mb-6 space-y-2" style={{ color: 'var(--text-secondary)' }}>
            <li>• Insufficient funds in your account</li>
            <li>• Network connectivity issues</li>
            <li>• UPI app or payment gateway issues</li>
            <li>• Transaction timed out</li>
          </ul>
          <div className="p-4 rounded-lg mb-6" style={{ background: 'var(--color-yellow-50)' }}>
            <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
              <strong>💡 Tip:</strong> If amount was deducted from your account, please contact support with transaction ID: TXN-{Date.now()}
            </p>
          </div>
          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
            Need help? Contact <a href="mailto:accounts@jainhostel.edu" className="underline">accounts@jainhostel.edu</a>
          </p>
        </div>
      )}
    </Modal>
  );
}

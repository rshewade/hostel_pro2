'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/data/Card';
import { Badge } from '@/components/ui/Badge';
import { DollarSignIcon } from '@/components/ui/IconDollarSign';
import { CreditCardIcon } from '@/components/ui/IconCreditCard';
import { FileTextIcon } from '@/components/ui/IconFileText';
import { PaymentFlowModal } from '@/components/fees/PaymentFlowModal';

interface FeeItem {
  id: string;
  name: string;
  description: string;
  amount: number;
  paidAmount: number;
  status: 'PAID' | 'PENDING' | 'FAILED' | 'OVERDUE';
  dueDate: string;
}

interface PaymentSummary {
  totalAmount: number;
  totalPaid: number;
  outstanding: number;
  nextDueDate: string;
}

export default function StudentFeesPage() {
  const [vertical] = useState('Boys Hostel');
  const [selectedPaymentId, setSelectedPaymentId] = useState<string | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedFee, setSelectedFee] = useState<{ id: string; name: string; amount: number } | null>(null);

  const feeItems: FeeItem[] = [
    {
      id: '1',
      name: 'Processing Fee',
      description: 'One-time application processing charge',
      amount: 5000,
      paidAmount: 5000,
      status: 'PAID',
      dueDate: '2024-01-15',
    },
    {
      id: '2',
      name: 'Hostel Fees',
      description: 'Accommodation charges for academic year 2024-25',
      amount: 60000,
      paidAmount: 30000,
      status: 'PENDING',
      dueDate: '2024-01-30',
    },
    {
      id: '3',
      name: 'Security Deposit',
      description: 'Refundable security deposit (held until check-out)',
      amount: 10000,
      paidAmount: 0,
      status: 'PENDING',
      dueDate: '2024-01-30',
    },
    {
      id: '4',
      name: 'Key Deposit',
      description: 'Refundable deposit for room and locker keys',
      amount: 2000,
      paidAmount: 0,
      status: 'PENDING',
      dueDate: '2024-02-15',
    },
  ];

  const paymentSummary: PaymentSummary = {
    totalAmount: feeItems.reduce((sum, item) => sum + item.amount, 0),
    totalPaid: feeItems.reduce((sum, item) => sum + item.paidAmount, 0),
    outstanding: feeItems.reduce((sum, item) => sum + (item.amount - item.paidAmount), 0),
    nextDueDate: feeItems.filter(item => item.status !== 'PAID').sort((a, b) =>
      new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
    )[0]?.dueDate || 'N/A',
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PAID':
        return <Badge variant="success" size="md">Paid</Badge>;
      case 'PENDING':
        return <Badge variant="warning" size="md">Pending</Badge>;
      case 'FAILED':
        return <Badge variant="error" size="md">Failed</Badge>;
      case 'OVERDUE':
        return <Badge variant="error" size="md">Overdue</Badge>;
      default:
        return <Badge variant="default" size="md">{status}</Badge>;
    }
  };

  const handlePayNow = (itemId: string) => {
    const fee = feeItems.find((item) => item.id === itemId);
    if (fee) {
      setSelectedPaymentId(itemId);
      setSelectedFee({
        id: fee.id,
        name: fee.name,
        amount: fee.amount - fee.paidAmount,
      });
      setIsPaymentModalOpen(true);
    }
  };

  const handleClosePaymentModal = () => {
    setIsPaymentModalOpen(false);
    setSelectedPaymentId(null);
    setSelectedFee(null);
  };

  const handlePaymentComplete = () => {
    // Update fee item status to PAID (in real app, this would be from backend)
    const updatedFeeItems = feeItems.map((item) =>
      item.id === selectedPaymentId
        ? { ...item, paidAmount: item.amount, status: 'PAID' as const }
        : item
    );
    // In real implementation, you'd update state or refetch from API
    console.log('Payment completed, updating fee status');
  };

  return (
    <div style={{ background: 'var(--bg-page)' }} className="min-h-screen">
      <header className="px-4 py-4 border-b" style={{ borderColor: 'var(--border-primary)' }}>
        <div className="mx-auto max-w-6xl flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Image src="/logo.png" alt="Logo" width={40} height={40} />
            <div>
              <h1 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                Fee Payments
              </h1>
              <span className="px-3 py-1 rounded-full text-xs font-medium" style={{ background: 'var(--bg-accent)', color: 'var(--text-on-accent)' }}>
                {vertical}
              </span>
            </div>
          </div>
          <nav className="flex items-center gap-6">
            <a href="/dashboard/student" className="text-sm" style={{ color: 'var(--text-link)' }}>Dashboard</a>
            <a href="/dashboard/student/fees" className="text-sm font-semibold" style={{ color: 'var(--text-link)' }}>Fees</a>
            <a href="/dashboard/student/leave" className="text-sm" style={{ color: 'var(--text-link)' }}>Leave</a>
            <a href="/dashboard/student/documents" className="text-sm" style={{ color: 'var(--text-link)' }}>Documents</a>
            <Button variant="ghost" size="sm">Logout</Button>
          </nav>
        </div>
      </header>

      <main className="px-6 py-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 p-6 rounded-lg" style={{ background: 'var(--surface-primary)' }}>
            <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
              Fee Overview
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-lg" style={{ background: 'var(--bg-page)' }}>
                <div className="flex items-center gap-2 mb-2">
                  <DollarSignIcon className="w-5 h-5" color="var(--color-blue-600)" />
                  <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Total Amount</span>
                </div>
                <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                  ₹{paymentSummary.totalAmount.toLocaleString('en-IN')}
                </p>
              </div>

              <div className="p-4 rounded-lg" style={{ background: 'var(--bg-page)' }}>
                <div className="flex items-center gap-2 mb-2">
                  <CreditCardIcon className="w-5 h-5" color="var(--color-green-600)" />
                  <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Amount Paid</span>
                </div>
                <p className="text-2xl font-bold" style={{ color: 'var(--color-green-600)' }}>
                  ₹{paymentSummary.totalPaid.toLocaleString('en-IN')}
                </p>
              </div>

              <div className="p-4 rounded-lg" style={{ background: 'var(--bg-page)' }}>
                <div className="flex items-center gap-2 mb-2">
                  <DollarSignIcon className="w-5 h-5" color="var(--color-gold-600)" />
                  <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Outstanding</span>
                </div>
                <p className="text-2xl font-bold" style={{ color: 'var(--color-gold-600)' }}>
                  ₹{paymentSummary.outstanding.toLocaleString('en-IN')}
                </p>
              </div>

              <div className="p-4 rounded-lg" style={{ background: 'var(--bg-page)' }}>
                <div className="flex items-center gap-2 mb-2">
                  <FileTextIcon className="w-5 h-5" color="var(--text-primary)" />
                  <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Next Due Date</span>
                </div>
                <p className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                  {paymentSummary.nextDueDate !== 'N/A' ? new Date(paymentSummary.nextDueDate).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  }) : 'No pending dues'}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                Fee Details
              </h3>
            </div>

            {feeItems.map((item) => (
              <Card
                key={item.id}
                padding="lg"
                shadow="md"
                className="hover:shadow-lg transition-shadow duration-200"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                          {item.name}
                        </h4>
                        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                          {item.description}
                        </p>
                      </div>
                      <div className="ml-4">
                        {getStatusBadge(item.status)}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                      <div>
                        <p className="text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                          Total Amount
                        </p>
                        <p className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>
                          ₹{item.amount.toLocaleString('en-IN')}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                          Paid
                        </p>
                        <p className="text-base font-semibold" style={{ color: 'var(--color-green-600)' }}>
                          ₹{item.paidAmount.toLocaleString('en-IN')}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                          Outstanding
                        </p>
                        <p className="text-base font-semibold" style={{ color: item.status === 'PAID' ? 'var(--color-green-600)' : 'var(--color-gold-600)' }}>
                          ₹{(item.amount - item.paidAmount).toLocaleString('en-IN')}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                          Due Date
                        </p>
                        <p className="text-base font-medium" style={{ color: 'var(--text-primary)' }}>
                          {new Date(item.dueDate).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                  </div>

                  {item.status !== 'PAID' && (
                    <div className="flex-shrink-0">
                      <Button
                        variant="primary"
                        size="md"
                        onClick={() => handlePayNow(item.id)}
                      >
                        Pay Now
                      </Button>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>

          <div className="mt-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                Payment History
              </h3>
              <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                Showing last 3 payments
              </span>
            </div>

            <Card padding="md" shadow="md">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-primary)' }}>
                      <th className="text-left py-3 px-4 font-medium" style={{ color: 'var(--text-primary)' }}>
                        Transaction ID
                      </th>
                      <th className="text-left py-3 px-4 font-medium" style={{ color: 'var(--text-primary)' }}>
                        Fee Name
                      </th>
                      <th className="text-left py-3 px-4 font-medium" style={{ color: 'var(--text-primary)' }}>
                        Amount
                      </th>
                      <th className="text-left py-3 px-4 font-medium" style={{ color: 'var(--text-primary)' }}>
                        Method
                      </th>
                      <th className="text-left py-3 px-4 font-medium" style={{ color: 'var(--text-primary)' }}>
                        Date
                      </th>
                      <th className="text-left py-3 px-4 font-medium" style={{ color: 'var(--text-primary)' }}>
                        Status
                      </th>
                      <th className="text-center py-3 px-4 font-medium" style={{ color: 'var(--text-primary)' }}>
                        Receipt
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ borderBottom: '1px solid var(--border-primary)' }}>
                      <td className="py-3 px-4">
                        <span className="font-mono" style={{ color: 'var(--text-primary)' }}>
                          TXN-1735448000000
                        </span>
                      </td>
                      <td className="py-3 px-4 font-medium" style={{ color: 'var(--text-primary)' }}>
                        Processing Fee
                      </td>
                      <td className="py-3 px-4 font-semibold" style={{ color: 'var(--text-primary)' }}>
                        ₹5,000
                      </td>
                      <td className="py-3 px-4" style={{ color: 'var(--text-secondary)' }}>
                        UPI
                      </td>
                      <td className="py-3 px-4" style={{ color: 'var(--text-secondary)' }}>
                        15 Jan 2024, 10:30 AM
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant="success" size="sm">Paid</Badge>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Button variant="ghost" size="xs" onClick={() => {}}>
                          Download
                        </Button>
                      </td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid var(--border-primary)' }}>
                      <td className="py-3 px-4">
                        <span className="font-mono" style={{ color: 'var(--text-primary)' }}>
                          TXN-1735448000001
                        </span>
                      </td>
                      <td className="py-3 px-4 font-medium" style={{ color: 'var(--text-primary)' }}>
                        Hostel Fees (Partial)
                      </td>
                      <td className="py-3 px-4 font-semibold" style={{ color: 'var(--text-primary)' }}>
                        ₹30,000
                      </td>
                      <td className="py-3 px-4" style={{ color: 'var(--text-secondary)' }}>
                        QR Code
                      </td>
                      <td className="py-3 px-4" style={{ color: 'var(--text-secondary)' }}>
                        20 Jan 2024, 2:15 PM
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant="success" size="sm">Paid</Badge>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Button variant="ghost" size="xs" onClick={() => {}}>
                          Download
                        </Button>
                      </td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4">
                        <span className="font-mono" style={{ color: 'var(--text-primary)' }}>
                          TXN-1735448000002
                        </span>
                      </td>
                      <td className="py-3 px-4 font-medium" style={{ color: 'var(--text-primary)' }}>
                        Hostel Fees (Partial)
                      </td>
                      <td className="py-3 px-4 font-semibold" style={{ color: 'var(--text-primary)' }}>
                        ₹30,000
                      </td>
                      <td className="py-3 px-4" style={{ color: 'var(--text-secondary)' }}>
                        UPI
                      </td>
                      <td className="py-3 px-4" style={{ color: 'var(--text-secondary)' }}>
                        25 Jan 2024, 11:45 AM
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant="warning" size="sm">Pending</Badge>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Button variant="ghost" size="xs" disabled onClick={() => {}}>
                          Pending
                        </Button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </Card>
          </div>

          <div className="mt-8 p-4 rounded-lg" style={{ background: 'var(--bg-page)', borderLeft: '4px solid var(--color-blue-500)' }}>
            <div className="flex items-start gap-3">
              <FileTextIcon className="w-5 h-5 mt-0.5 flex-shrink-0" color="var(--color-blue-600)" />
              <div>
                <h4 className="text-sm font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
                  Data Protection and Financial Privacy Notice
                </h4>
                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                  Your payment information is encrypted and processed securely in compliance with Data Protection and Privacy Principles (DPDP) Act. All transactions are logged with timestamps for audit purposes. Your financial data is stored securely and will only be used for fee management purposes. For any queries regarding your payments, please contact the Accounts department.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 text-center">
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
              Need help? Contact <a href="mailto:accounts@jainhostel.edu" className="underline">accounts@jainhostel.edu</a> or call +91 12345 67890
            </p>
          </div>
        </div>
      </main>

      {selectedFee && (
        <PaymentFlowModal
          isOpen={isPaymentModalOpen}
          onClose={handleClosePaymentModal}
          feeId={selectedFee.id}
          feeName={selectedFee.name}
          amount={selectedFee.amount}
          onPaymentComplete={handlePaymentComplete}
        />
      )}
    </div>
  );
}

'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components';

export default function StudentDashboard() {
  const [vertical] = useState('Boys Hostel');
  const [status] = useState('CHECKED_IN');
  const [academicYear] = useState('2024-25');
  const [currentPeriod] = useState('SEMESTER_2');
  const [renewalDaysRemaining] = useState(30);

  return (
    <div style={{ background: 'var(--bg-page)' }} className="min-h-screen">
      <header className="px-4 py-4 border-b" style={{ borderColor: 'var(--border-primary)' }}>
        <div className="mx-auto max-w-6xl flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Image src="/logo.png" alt="Logo" width={40} height={40} />
            <div>
              <h1 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                Student Dashboard
              </h1>
              <span className="px-3 py-1 rounded-full text-xs font-medium" style={{ background: 'var(--bg-accent)', color: 'var(--text-on-accent)' }}>
                {vertical}
              </span>
            </div>
          </div>
          <nav className="flex items-center gap-6">
            <a href="/dashboard/student" className="text-sm" style={{ color: 'var(--text-link)' }}>Dashboard</a>
            <a href="/dashboard/student/fees" className="text-sm" style={{ color: 'var(--text-link)' }}>Fees</a>
            <a href="/dashboard/student/leave" className="text-sm" style={{ color: 'var(--text-link)' }}>Leave</a>
            <a href="/dashboard/student/documents" className="text-sm" style={{ color: 'var(--text-link)' }}>Documents</a>
            <Button variant="ghost" size="sm">Logout</Button>
          </nav>
        </div>
      </header>

      <main className="px-6 py-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 p-6 rounded-lg" style={{ background: 'var(--surface-primary)' }}>
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-heading-2 mb-2" style={{ color: 'var(--text-primary)' }}>
                  Welcome, Student!
                </h2>
                <p className="text-body" style={{ color: 'var(--text-secondary)' }}>
                  You are logged in as <strong>Student</strong> at <strong>{vertical}</strong>
                </p>
                <p className="text-body-sm mt-2" style={{ color: 'var(--text-secondary)' }}>
                  Academic Year: <strong>{academicYear}</strong> | Current Period: <strong>{currentPeriod.replace('_', ' ')}</strong>
                </p>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-medium text-white" style={{ background: 'var(--color-green-600)' }}>
                Checked-in
              </span>
            </div>
          </div>

          {renewalDaysRemaining <= 30 && (
            <div className="mb-8 p-4 rounded-lg border-l-4" style={{ background: 'var(--bg-page)', borderLeftColor: 'var(--color-gold-500)' }}>
              <div className="flex items-start gap-3">
                <span className="text-2xl">🔔</span>
                <div>
                  <h3 className="text-heading-4 mb-2" style={{ color: 'var(--text-primary)' }}>
                    DPDP Consent Renewal Required
                  </h3>
                  <p className="text-body-sm mb-3" style={{ color: 'var(--text-secondary)' }}>
                    Your 6-month stay renewal is approaching. Please review and update your Data Protection and Privacy Principles consent before completing your renewal.
                  </p>
                  <div className="flex gap-3">
                    <Button variant="primary" size="sm">
                      Review Consent
                    </Button>
                    <a href="/dpdp-policy" className="text-sm" style={{ color: 'var(--text-link)' }}>
                      Read Full Policy
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
            <div className="card p-6 text-center">
              <div className="text-3xl mb-3">💳</div>
              <h3 className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Pay Fees</h3>
              <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>View and pay your pending dues</p>
              <Button variant="primary" size="md" fullWidth>Go to Fees</Button>
            </div>

            <div className="card p-6 text-center">
              <div className="text-3xl mb-3">📄</div>
              <h3 className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Download Letters</h3>
              <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>Get admission and official documents</p>
              <Button variant="primary" size="md" fullWidth>View Documents</Button>
            </div>

            <div className="card p-6 text-center">
              <div className="text-3xl mb-3">🏖️</div>
              <h3 className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Apply for Leave</h3>
              <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>Request leave from hostel</p>
              <Button variant="primary" size="md" fullWidth>Apply Leave</Button>
            </div>

            <div className="card p-6 text-center">
              <div className="text-3xl mb-3">🛏️</div>
              <h3 className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Room Details</h3>
              <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>View your room information</p>
              <Button variant="primary" size="md" fullWidth>View Room</Button>
            </div>

            <div className="card p-6 text-center">
              <div className="text-3xl mb-3">📜</div>
              <h3 className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Renewal</h3>
              <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>Renew your stay for next semester</p>
              <Button variant="primary" size="md" fullWidth>Renew Now</Button>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-3 lg:grid-cols-4 mb-8">
            <div className="card p-6 md:col-span-2">
              <h3 className="text-heading-4 mb-4" style={{ color: 'var(--text-primary)' }}>Notifications</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 rounded" style={{ background: 'var(--bg-page)' }}>
                  <span className="text-red-500 text-lg">⚠</span>
                  <div>
                    <p className="text-body font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Fee payment due</p>
                    <p className="text-body-sm" style={{ color: 'var(--text-secondary)' }}>Due date: December 31, 2025</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded" style={{ background: 'var(--bg-page)' }}>
                  <span style={{ color: 'var(--color-gold-600)' }} className="text-lg">📢</span>
                  <div>
                    <p className="text-body font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Renewal reminder</p>
                    <p className="text-body-sm" style={{ color: 'var(--text-secondary)' }}>Your 6-month renewal is due in 30 days</p>
                  </div>
                </div>
                {renewalDaysRemaining <= 30 && (
                  <div className="flex items-start gap-3 p-3 rounded" style={{ background: 'var(--color-gold-50)', borderLeft: '3px solid var(--color-gold-500)' }}>
                    <span className="text-xl">🔔</span>
                    <div>
                      <p className="text-body font-medium mb-1" style={{ color: 'var(--text-primary)' }}>DPDP Consent Renewal Required</p>
                      <p className="text-body-sm" style={{ color: 'var(--text-secondary)' }}>Please review and accept updated DPDP consent as part of your renewal process</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="card p-6">
            <h3 className="text-heading-4 mb-4" style={{ color: 'var(--text-primary)' }}>Quick Profile</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-body-sm" style={{ color: 'var(--text-secondary)' }}>Room No:</span>
                <span className="text-body font-medium" style={{ color: 'var(--text-primary)' }}>A-201</span>
              </div>
              <div className="flex justify-between">
                <span className="text-body-sm" style={{ color: 'var(--text-secondary)' }}>Joining Date:</span>
                <span className="text-body font-medium" style={{ color: 'var(--text-primary)' }}>August 15, 2024</span>
              </div>
              <div className="flex justify-between">
                <span className="text-body-sm" style={{ color: 'var(--text-secondary)' }}>Academic Year:</span>
                <span className="text-body font-medium" style={{ color: 'var(--text-primary)' }}>{academicYear}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-body-sm" style={{ color: 'var(--text-secondary)' }}>Current Period:</span>
                <span className="text-body font-medium" style={{ color: 'var(--text-primary)' }}>{currentPeriod.replace('_', ' ')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-body-sm" style={{ color: 'var(--text-secondary)' }}>Renewal Due:</span>
                <span className="text-body font-medium" style={{ color: renewalDaysRemaining <= 30 ? 'var(--color-gold-600)' : 'var(--text-primary)' }}>
                  {renewalDaysRemaining} days
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-body-sm" style={{ color: 'var(--text-secondary)' }}>Status:</span>
                <span className="px-2 py-1 rounded text-xs font-medium text-white" style={{ background: 'var(--color-green-600)' }}>Checked-in</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

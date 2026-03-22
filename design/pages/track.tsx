'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Input } from '../../components/forms/Input';
import { Button } from '../../components/ui/Button';
import { cn } from '../../components/utils';

export default function TrackingPage() {
  const [trackingId, setTrackingId] = useState('');
  const [mobile, setMobile] = useState('');
  const [step, setStep] = useState<'input' | 'otp' | 'loading'>('input');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [resendTimer, setResendTimer] = useState(0);

  const handleTrackingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingId.trim() || !mobile.trim()) {
      setError('Please enter both tracking ID and mobile number');
      return;
    }

    setError('');
    setStep('loading');

    try {
      // Simulate API call to verify tracking ID and send OTP
      const response = await fetch('http://localhost:4001/applications?tracking_number=' + trackingId);
      const applications = await response.json();

      if (applications.length === 0) {
        setError('Application not found with this tracking ID');
        setStep('input');
        return;
      }

      const application = applications[0];
      if (application.applicant_mobile !== mobile) {
        setError('Mobile number does not match the application');
        setStep('input');
        return;
      }

      // Send OTP
      await fetch('/api/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: mobile, vertical: application.vertical })
      });

      setStep('otp');
      setResendTimer(60);
      const timer = setInterval(() => {
        setResendTimer((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

    } catch (err) {
      setError('Failed to verify application. Please try again.');
      setStep('input');
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp.trim() || otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    setError('');
    setStep('loading');

    try {
      // Verify OTP
      const response = await fetch('/api/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: otp, phone: mobile })
      });

      if (response.ok) {
        // Redirect to tracking detail page
        window.location.href = `/track/${trackingId}`;
      } else {
        setError('Invalid OTP. Please try again.');
        setStep('otp');
      }
    } catch (err) {
      setError('Failed to verify OTP. Please try again.');
      setStep('otp');
    }
  };

  const handleResendOtp = async () => {
    if (resendTimer > 0) return;

    try {
      await fetch('/api/otp/resend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: mobile })
      });
      setResendTimer(60);
      setError('');
    } catch (err) {
      setError('Failed to resend OTP. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="px-6 py-4 border-b bg-white">
        <div className="mx-auto max-w-6xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image
              src="/logo.png"
              alt="Hirachand Gumanji Family Charitable Trust"
              width={48}
              height={48}
              className="h-12 w-auto"
            />
            <div>
              <h1 className="text-lg font-semibold">Hirachand Gumanji Family</h1>
              <p className="text-caption">Charitable Trust</p>
            </div>
          </div>
          <Link href="/" className="text-sm text-blue-600 hover:underline">
            ← Back to Home
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-6 py-12">
        <div className="mx-auto max-w-md">
          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-2">Track Your Application</h2>
              <p className="text-gray-600">Enter your tracking ID and mobile number to view your application status</p>
            </div>

            {step === 'input' && (
              <form onSubmit={handleTrackingSubmit} className="space-y-6">
                <Input
                  id="trackingId"
                  label="Tracking ID"
                  type="text"
                  placeholder="e.g., BH2024001"
                  value={trackingId}
                  onChange={(e) => setTrackingId(e.target.value.toUpperCase())}
                  required
                  helperText="Enter the tracking number from your application confirmation"
                  autoFocus
                />

                <Input
                  id="mobile"
                  label="Mobile Number"
                  type="tel"
                  placeholder="+91XXXXXXXXXX"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  required
                  helperText="Enter the mobile number used during application"
                />

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                    {error}
                  </div>
                )}

                <Button type="submit" className="w-full">
                  Continue
                </Button>
              </form>
            )}

            {step === 'otp' && (
              <form onSubmit={handleOtpSubmit} className="space-y-6">
                <Input
                  id="otp"
                  label="Enter OTP"
                  type="text"
                  inputMode="numeric"
                  placeholder="000000"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  maxLength={6}
                  required
                  helperText={`OTP sent to ${mobile}`}
                />

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                    {error}
                  </div>
                )}

                <Button type="submit" className="w-full">
                  Verify OTP
                </Button>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={resendTimer > 0}
                    className={cn(
                      'text-sm',
                      resendTimer > 0 ? 'text-gray-400 cursor-not-allowed' : 'text-blue-600 hover:underline'
                    )}
                  >
                    {resendTimer > 0 ? `Resend OTP in ${resendTimer}s` : 'Resend OTP'}
                  </button>
                </div>
              </form>
            )}

            {step === 'loading' && (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Processing...</p>
              </div>
            )}
          </div>

          <div className="mt-8 space-y-4">
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-1">Secure Tracking</h4>
                  <p className="text-sm text-gray-600">
                    Your tracking ID and mobile number are used only to verify your identity and retrieve your application status.
                    All data transmission is encrypted and complies with DPDP Act, 2023.
                  </p>
                </div>
              </div>
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-500">
                Need help? Contact our admissions team at{' '}
                <a href="tel:+912224141234" className="text-blue-600 hover:underline">+91 22 2414 1234</a>
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
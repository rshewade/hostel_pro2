'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, Shield, RefreshCw, Phone, Mail, Clock } from 'lucide-react';

export default function ContactOTPPage() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [contactMethod, setContactMethod] = useState<'phone' | 'email'>('phone');
  const [otpSent, setOtpSent] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  // Pure validation function (no setState) - safe for render
  const isInputValid = () => {
    if (contactMethod === 'phone') {
      return phoneNumber && /^[6-9]\d{9}$/.test(phoneNumber);
    } else {
      return email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }
  };

  // Validation with error setting - only call in event handlers
  const validateInput = () => {
    const newErrors: string[] = [];

    if (contactMethod === 'phone' && !phoneNumber) {
      newErrors.push('Phone number is required');
    } else if (contactMethod === 'phone' && !/^[6-9]\d{9}$/.test(phoneNumber)) {
      newErrors.push('Please enter a valid 10-digit phone number');
    }

    if (contactMethod === 'email' && !email) {
      newErrors.push('Email is required');
    } else if (contactMethod === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.push('Please enter a valid email address');
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleSendOTP = async () => {
    if (!validateInput()) return;
    
    setOtpSent(true);
    setResendTimer(60);
    
    // API Call: POST /otp/send
    try {
      const response = await fetch('/api/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          [contactMethod]: contactMethod === 'phone' ? phoneNumber : email,
          vertical: 'boys-hostel' // This would come from previous step
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        // Success - navigate to OTP verification with token
        window.location.href = `/apply/boys-hostel/verify?token=${encodeURIComponent(data.token)}`;
      } else {
        const error = await response.json();
        setErrors([error.message || 'Failed to send OTP']);
        setOtpSent(false);
        setResendTimer(0);
      }
    } catch (err) {
      setErrors(['Network error. Please try again.']);
      setOtpSent(false);
      setResendTimer(0);
    }
  };

  const handleResendOTP = () => {
    if (resendTimer > 0) return;
    handleSendOTP();
  };

  return (
    <div className="min-h-screen" style={{ background: "var(--bg-page)" }}>
      {/* Header */}
      <header
        className="px-6 py-4 border-b"
        style={{
          backgroundColor: "var(--surface-primary)",
          borderColor: "var(--border-primary)",
        }}
      >
        <div className="mx-auto max-w-6xl flex items-center justify-between">
          <Link href="/apply" className="flex items-center gap-3">
            <ArrowLeft className="w-5 h-5" style={{ color: "var(--text-secondary)" }} />
            <div>
              <h1
                className="text-lg font-semibold"
                style={{ color: "var(--text-primary)", fontFamily: "var(--font-serif)" }}
              >
                Boys Hostel Application
              </h1>
              <p className="text-caption">Step 2 of 4</p>
            </div>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/" className="nav-link">Home</Link>
            <Link href="/apply" className="nav-link">Apply Now</Link>
            <Link href="/check-status" className="nav-link">Check Status</Link>
            <Link href="/login" className="nav-link">Login</Link>
          </nav>
        </div>
      </header>

      {/* Progress Header */}
      <section className="px-6 py-4" style={{ backgroundColor: "var(--surface-secondary)" }}>
        <div className="mx-auto max-w-4xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium"
                  style={{ backgroundColor: "var(--bg-accent)" }}
                >
                  1
                </div>
                <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                  Select Vertical
                </span>
              </div>
              <div className="h-px w-16" style={{ backgroundColor: "var(--border-primary)" }}></div>
              <div className="flex items-center gap-2">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium"
                  style={{ backgroundColor: "var(--bg-accent)" }}
                >
                  2
                </div>
                <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                  Contact Details
                </span>
              </div>
              <div className="h-px w-16" style={{ backgroundColor: "var(--border-primary)" }}></div>
              <div className="flex items-center gap-2 opacity-50">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium"
                  style={{ backgroundColor: "var(--color-gray-400)" }}
                >
                  3
                </div>
                <span className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
                  OTP Verification
                </span>
              </div>
              <div className="h-px w-16" style={{ backgroundColor: "var(--border-primary)" }}></div>
              <div className="flex items-center gap-2 opacity-50">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium"
                  style={{ backgroundColor: "var(--color-gray-400)" }}
                >
                  4
                </div>
                <span className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
                  Application Form
                </span>
              </div>
            </div>
            <div className="text-sm" style={{ color: "var(--text-secondary)" }}>
              <span>Step 2 of 4</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="px-6 py-12">
        <div className="mx-auto max-w-2xl">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: "var(--text-primary)" }}>
              Verify Your Identity
            </h2>
            <p className="text-lg mb-8" style={{ color: "var(--text-secondary)" }}>
              We'll send a One-Time Password (OTP) to verify your contact details
            </p>
          </div>

          {/* Contact Method Selection */}
          <div className="card p-8 mb-8">
            <h3 className="text-xl font-semibold mb-6" style={{ color: "var(--text-primary)" }}>
              Choose Contact Method
            </h3>
            <div className="grid gap-4 md:grid-cols-2 mb-8">
              <button
                className={`p-6 rounded-lg border-2 transition-all ${
                  contactMethod === 'phone'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                onClick={() => setContactMethod('phone')}
              >
                <Phone className="w-8 h-8 mx-auto mb-3" style={{ color: contactMethod === 'phone' ? 'var(--color-blue-600)' : 'var(--color-gray-600)' }} />
                <h4 className="font-semibold mb-2">Mobile Number</h4>
                <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                  Fast and secure OTP verification via SMS
                </p>
              </button>
              
              <button
                className={`p-6 rounded-lg border-2 transition-all ${
                  contactMethod === 'email'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                onClick={() => setContactMethod('email')}
              >
                <Mail className="w-8 h-8 mx-auto mb-3" style={{ color: contactMethod === 'email' ? 'var(--color-blue-600)' : 'var(--color-gray-600)' }} />
                <h4 className="font-semibold mb-2">Email Address</h4>
                <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                  Receive OTP via email verification
                </p>
              </button>
            </div>

            {/* Contact Input */}
            {contactMethod === 'phone' && (
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-primary)" }}>
                  Mobile Number
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="Enter 10-digit mobile number"
                    className="w-full px-4 py-3 border rounded-lg text-lg"
                    style={{
                      borderColor: errors.includes('Phone number') ? 'var(--color-red-500)' : 'var(--border-primary)',
                      paddingLeft: '48px'
                    }}
                  />
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5" style={{ color: "var(--color-gray-400)" }} />
                </div>
                <p className="text-sm mt-2" style={{ color: "var(--text-secondary)" }}>
                  We'll send a 6-digit OTP to this number
                </p>
              </div>
            )}

            {contactMethod === 'email' && (
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-primary)" }}>
                  Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    className="w-full px-4 py-3 border rounded-lg text-lg"
                    style={{
                      borderColor: errors.includes('Email') ? 'var(--color-red-500)' : 'var(--border-primary)',
                      paddingLeft: '48px'
                    }}
                  />
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5" style={{ color: "var(--color-gray-400)" }} />
                </div>
                <p className="text-sm mt-2" style={{ color: "var(--text-secondary)" }}>
                  We'll send a 6-digit OTP to this email
                </p>
              </div>
            )}
          </div>

          {/* Security Notice */}
          <div className="flex items-start gap-3 mb-8 p-4 rounded-lg" style={{ backgroundColor: "var(--color-blue-50)" }}>
            <Shield className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
            <div>
              <h4 className="font-semibold mb-2" style={{ color: "var(--text-primary)" }}>
                Your Security Matters
              </h4>
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                This OTP is valid for 10 minutes and can only be used once. 
                Never share your OTP with anyone.
              </p>
            </div>
          </div>

          {/* Error Display */}
          {errors.length > 0 && (
            <div className="card p-4 mb-6 border-l-4" style={{ borderLeftColor: "var(--color-red-500)" }}>
              <h4 className="font-semibold mb-2" style={{ color: "var(--color-red-600)" }}>
                Please Fix The Following:
              </h4>
              <ul className="space-y-1">
                {errors.map((error, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <span className="text-red-500">•</span>
                    <span className="text-sm" style={{ color: "var(--color-red-600)" }}>{error}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Action Buttons */}
          {!otpSent ? (
            <button
              onClick={handleSendOTP}
              disabled={!isInputValid()}
              className="btn-primary w-full text-lg py-4 flex items-center justify-center gap-2"
            >
              Send OTP
              <ArrowRight className="w-5 h-5" />
            </button>
          ) : (
            <div className="space-y-4">
              <div className="card p-4 text-center">
                <h4 className="font-semibold mb-2" style={{ color: "var(--text-primary)" }}>
                  OTP Sent Successfully!
                </h4>
                <p className="text-sm mb-4" style={{ color: "var(--text-secondary)" }}>
                  Please check your {contactMethod === 'phone' ? 'SMS messages' : 'email'} for the 6-digit code.
                </p>
                
                {resendTimer > 0 ? (
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" style={{ color: "var(--color-blue-600)" }} />
                    <span className="text-sm" style={{ color: "var(--text-primary)" }}>
                      Resend OTP in {resendTimer}s
                    </span>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <button
                      onClick={handleResendOTP}
                      className="btn-outline w-full flex items-center justify-center gap-2"
                    >
                      <RefreshCw className="w-4 h-4" />
                      Resend OTP
                    </button>
                    <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                      Didn't receive? Check spam folder or try with different contact method
                    </p>
                  </div>
                )}
              </div>

              {/* Alternate Contact */}
              <div className="text-center">
                <p className="text-sm mb-3" style={{ color: "var(--text-secondary)" }}>
                  Having trouble? Contact admissions office directly:
                </p>
                <Link
                  href="tel:+912224141234"
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  +91 22 2414 1234
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
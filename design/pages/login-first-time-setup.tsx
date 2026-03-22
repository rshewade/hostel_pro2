'use client';

import { useState, useId, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button, Input } from '@/components';

type PasswordChangeFormData = {
  newPassword: string;
  confirmPassword: string;
};

function FirstTimeSetupContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';

  const [formData, setFormData] = useState<PasswordChangeFormData>({
    newPassword: '',
    confirmPassword: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [dpdpConsent, setDpdpConsent] = useState(false);
  const [success, setSuccess] = useState(false);

  const passwordStrength = {
    hasMinLength: formData.newPassword.length >= 8,
    hasUpperCase: /[A-Z]/.test(formData.newPassword),
    hasLowerCase: /[a-z]/.test(formData.newPassword),
    hasNumber: /[0-9]/.test(formData.newPassword),
    hasSpecialChar: /[!@#$%^&*]/.test(formData.newPassword),
  };

  const getPasswordStrength = () => {
    const criteriaMet = Object.values(passwordStrength).filter(Boolean).length;
    if (criteriaMet <= 2) return { label: 'Weak', color: 'bg-red-50 text-red-700' };
    if (criteriaMet <= 3) return { label: 'Fair', color: 'bg-yellow-50 text-yellow-700' };
    return { label: 'Strong', color: 'bg-green-50 text-green-700' };
  };

  const strength = getPasswordStrength();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    // Validate password match
    if (formData.newPassword !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // Validate DPDP consent
    if (!dpdpConsent) {
      setError('Please accept the DPDP consent to continue');
      return;
    }

    // Validate password strength
    if (strength.label === 'Weak') {
      setError('Password does not meet minimum security requirements. Please use a stronger password.');
      return;
    }

    setLoading(true);

    try {
      // Simulate API call - replace with actual API endpoint
      const response = await fetch('/api/auth/first-time-setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          newPassword: formData.newPassword,
          dpdpConsent,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        // Auto-redirect after 2 seconds
        setTimeout(() => {
          const redirectPath = getRoleRedirectPath(data.role);
          router.push(redirectPath);
        }, 2000);
      } else {
        setError(data.error || 'Failed to update password. Please try again.');
      }
    } catch (err) {
      setError('Unable to connect. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const getRoleRedirectPath = (role: string): string => {
    switch (role) {
      case 'student':
        return '/dashboard/student';
      case 'superintendent':
        return '/dashboard/superintendent';
      case 'trustee':
        return '/dashboard/trustee';
      case 'accounts':
        return '/dashboard/accounts';
      case 'parent':
        return '/dashboard/parent';
      default:
        return '/';
    }
  };

  const newPasswordId = useId();
  const confirmPasswordId = useId();

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-page)' }}>
        <div className="w-full max-w-md mx-auto p-6">
          <div className="text-center mb-8">
            <div
              className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
              style={{ background: 'var(--bg-accent)' }}
            >
              <svg
                className="w-8 h-8"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                style={{ color: 'var(--text-on-accent)' }}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L17 11m-0 0l-6 0m6 5a2 2 0 002 2h3a2 2 0 002-2V7a2 2 0 00-2 2h-2m2 5a2 2 0 012 2h5a2 2 0 012 2z"
                />
              </svg>
            </div>
            <h1
              className="text-heading-1 mb-2"
              style={{ fontFamily: 'var(--font-serif)', color: 'var(--text-primary)' }}
            >
              Password Updated Successfully
            </h1>
            <p className="text-body mb-6" style={{ color: 'var(--text-secondary)' }}>
              You will be redirected to your dashboard shortly...
            </p>
            <div className="w-16 h-1 mx-auto mb-6" style={{ background: 'var(--color-green-500)' }}></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-8" style={{ background: 'var(--bg-page)' }}>
      <div className="w-full max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <img
            src="/logo.png"
            alt="Seth Hirachand Gumanji Jain Hostel"
            className="h-16 w-auto mx-auto mb-4"
          />
          <h1
            className="text-heading-1 mb-2"
            style={{ fontFamily: 'var(--font-serif)', color: 'var(--text-primary)' }}
          >
            First-Time Password Change
          </h1>
          <p className="text-body" style={{ color: 'var(--text-secondary)' }}>
            For security purposes, please set a new password before accessing your account
          </p>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="mb-4 p-4 rounded-md bg-red-50 border-l-4" style={{ borderLeftColor: 'var(--color-red-500)' }}>
            <p className="text-body-sm" style={{ color: 'var(--color-red-700)' }}>
              {error}
            </p>
          </div>
        )}

        {/* Password Change Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* New Password Field */}
          <Input
            id={newPasswordId}
            type="password"
            label="New Password"
            placeholder="Enter your new password"
            value={formData.newPassword}
            onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
            required
            autoComplete="new-password"
            helperText="Minimum 8 characters with mix of uppercase, lowercase, numbers, and special characters"
          />

          {/* Confirm Password Field */}
          <Input
            id={confirmPasswordId}
            type="password"
            label="Confirm New Password"
            placeholder="Re-enter your new password"
            value={formData.confirmPassword}
            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
            required
            autoComplete="new-password"
            error={formData.newPassword !== formData.confirmPassword && formData.confirmPassword ? 'Passwords do not match' : undefined}
          />

          {/* Password Strength Indicator */}
          {formData.newPassword && (
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-body-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                  Password Strength
                </span>
                <span
                  className="px-3 py-1 rounded-full text-xs font-semibold"
                  style={{ background: strength.color }}
                >
                  {strength.label}
                </span>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-body-sm">
                  <span className={passwordStrength.hasMinLength ? 'text-green-600' : 'text-gray-400'}>
                    {passwordStrength.hasMinLength ? '✓' : '○'}
                  </span>
                  <span style={{ color: 'var(--text-secondary)' }}>Minimum 8 characters</span>
                </div>
                <div className="flex items-center gap-2 text-body-sm">
                  <span className={passwordStrength.hasUpperCase ? 'text-green-600' : 'text-gray-400'}>
                    {passwordStrength.hasUpperCase ? '✓' : '○'}
                  </span>
                  <span style={{ color: 'var(--text-secondary)' }}>One uppercase letter</span>
                </div>
                <div className="flex items-center gap-2 text-body-sm">
                  <span className={passwordStrength.hasLowerCase ? 'text-green-600' : 'text-gray-400'}>
                    {passwordStrength.hasLowerCase ? '✓' : '○'}
                  </span>
                  <span style={{ color: 'var(--text-secondary)' }}>One lowercase letter</span>
                </div>
                <div className="flex items-center gap-2 text-body-sm">
                  <span className={passwordStrength.hasNumber ? 'text-green-600' : 'text-gray-400'}>
                    {passwordStrength.hasNumber ? '✓' : '○'}
                  </span>
                  <span style={{ color: 'var(--text-secondary)' }}>One number</span>
                </div>
                <div className="flex items-center gap-2 text-body-sm">
                  <span className={passwordStrength.hasSpecialChar ? 'text-green-600' : 'text-gray-400'}>
                    {passwordStrength.hasSpecialChar ? '✓' : '○'}
                  </span>
                  <span style={{ color: 'var(--text-secondary)' }}>One special character (!@#$%^&*)</span>
                </div>
              </div>
            </div>
          )}

          {/* DPDP Consent Checkbox */}
          <div className="p-4 rounded-lg mb-4" style={{ background: 'var(--surface-secondary)' }}>
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={dpdpConsent}
                onChange={(e) => setDpdpConsent(e.target.checked)}
                required
                className="mt-1 h-5 w-5 rounded border-gray-300 text-gold-600 focus:ring-gold-500"
              />
              <div className="flex-1">
                <span className="text-body font-medium mb-1 block" style={{ color: 'var(--text-primary)' }}>
                  I accept the Data Protection and Privacy Principles
                </span>
                <p className="text-body-sm" style={{ color: 'var(--text-secondary)' }}>
                  I consent to the collection, storage, and processing of my personal data as per the Digital Personal Data Protection (DPDP) Act. I understand that my data will be used for hostel management purposes and that I can withdraw this consent at any time.
                </p>
                <Link
                  href="/dpdp-policy"
                  className="text-sm text-gold-600 hover:underline"
                  target="_blank"
                >
                  Read Full DPDP Policy →
                </Link>
              </div>
            </label>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            variant="primary"
            size="md"
            fullWidth
            loading={loading}
            disabled={loading || !dpdpConsent || strength.label === 'Weak'}
          >
            {loading ? 'Updating Password...' : 'Set New Password & Continue'}
          </Button>
        </form>

        {/* Security Information */}
        <div className="mt-8 p-4 rounded-lg border" style={{ borderColor: 'var(--border-primary)' }}>
          <h3 className="text-heading-4 mb-3" style={{ color: 'var(--text-primary)' }}>
            Security Guidelines
          </h3>
          <ul className="space-y-2 text-body-sm" style={{ color: 'var(--text-secondary)' }}>
            <li>• Password must be at least 8 characters long</li>
            <li>• Include uppercase and lowercase letters, numbers, and special characters</li>
            <li>• Do not use easily guessable information (birthdays, phone numbers)</li>
            <li>• Change your password regularly</li>
            <li>• Never share your password with anyone</li>
          </ul>
        </div>

        {/* Help Link */}
        <div className="text-center mt-6">
          <Link
            href="/login/help"
            className="text-body-sm"
            style={{ color: 'var(--text-link)' }}
          >
            Need help? Contact Support
          </Link>
        </div>
      </div>
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-page)' }}>
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  );
}

export default function FirstTimeSetupPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <FirstTimeSetupContent />
    </Suspense>
  );
}

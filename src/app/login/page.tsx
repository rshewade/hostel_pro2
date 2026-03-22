'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

export default function LoginPage() {
  const t = useTranslations('common');
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const getRoleRedirectPath = (role: string): string => {
    // Links use /student/... NOT /dashboard/student/... (BUG-003)
    switch (role?.toUpperCase()) {
      case 'STUDENT': return '/student';
      case 'SUPERINTENDENT': return '/superintendent';
      case 'TRUSTEE': return '/trustee';
      case 'ACCOUNTS': return '/accounts';
      case 'PARENT': return '/parent';
      default: return '/';
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (res.ok) {
        if (data.requiresPasswordChange) {
          router.push('/login/first-time-setup');
        } else {
          router.push(getRoleRedirectPath(data.role));
        }
      } else {
        setError(data.error?.message || t('error.generic'));
      }
    } catch {
      setError(t('error.generic'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-page)' }}>
      <div className="w-full max-w-md mx-auto p-6">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--bg-accent)' }}>
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--text-on-accent)' }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <h1 className="text-heading-1 mb-2" style={{ fontFamily: 'var(--font-serif)', color: 'var(--text-primary)' }}>
            {t('welcome', { name: '' })}
          </h1>
          <p className="text-body" style={{ color: 'var(--text-secondary)' }}>
            {t('login')}
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="alert alert-error mb-4">
            <p className="text-body-sm">{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="input-label" htmlFor="username">Email</label>
            <input
              id="username"
              type="text"
              className="input-field"
              placeholder="Enter email or mobile"
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
              autoFocus
              autoComplete="username"
              data-testid="email-input"
            />
          </div>

          <div>
            <label className="input-label" htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              className="input-field"
              placeholder="Enter password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              data-testid="password-input"
            />
          </div>

          <button
            type="submit"
            className="btn-primary w-full"
            disabled={loading}
            data-testid="login-button"
          >
            {loading ? t('loading') : t('login')}
          </button>
        </form>

        {/* Links */}
        <div className="text-center mt-6 space-y-3">
          <Link href="/login/parent" className="text-sm font-medium hover:underline block" style={{ color: 'var(--text-link)' }}>
            Parent/Guardian OTP Login →
          </Link>
          <Link href="/" className="text-body-sm block" style={{ color: 'var(--text-secondary)' }}>
            ← {t('back')} {t('nav.home')}
          </Link>
        </div>
      </div>
    </div>
  );
}

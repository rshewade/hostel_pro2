'use client';

import { useTranslations } from 'next-intl';

export default function LoginPage() {
  const t = useTranslations('common');

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="card w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-6">{t('login')}</h1>
        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              className="w-full border rounded-md px-3 py-2"
              data-testid="email-input"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input
              type="password"
              className="w-full border rounded-md px-3 py-2"
              data-testid="password-input"
            />
          </div>
          <button
            type="submit"
            className="btn-primary w-full"
            data-testid="login-button"
          >
            {t('login')}
          </button>
        </form>
      </div>
    </main>
  );
}

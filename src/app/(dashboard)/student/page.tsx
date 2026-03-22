import Link from 'next/link';
import { getTranslations } from 'next-intl/server';

export default async function StudentDashboard() {
  const t = await getTranslations('common');

  const quickActions = [
    { icon: '💳', href: '/student/fees', titleKey: 'nav.fees' as const, desc: 'emptyState.noFees' as const },
    { icon: '📄', href: '/student/documents', titleKey: 'nav.documents' as const, desc: 'emptyState.noData' as const },
    { icon: '🏖️', href: '/student/leave', titleKey: 'nav.leaves' as const, desc: 'emptyState.noData' as const },
    { icon: '🛏️', href: '/student/room', titleKey: 'nav.rooms' as const, desc: 'emptyState.noRoom' as const },
  ];

  return (
    <div>
      {/* Welcome Card */}
      <div className="mb-8 p-6 rounded-lg" style={{ background: 'var(--surface-primary)', border: '1px solid var(--border-primary)' }}>
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-heading-2 mb-2" style={{ color: 'var(--text-primary)' }}>
              {t('welcome', { name: t('appName') })}
            </h2>
            <p className="text-body" style={{ color: 'var(--text-secondary)' }}>
              {t('nav.dashboard')}
            </p>
          </div>
          <span className="badge badge-success">Active</span>
        </div>
      </div>

      {/* Quick Actions — links use /student/... NOT /dashboard/student/... (BUG-003) */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        {quickActions.map((action) => (
          <Link key={action.href} href={action.href} className="card p-6 text-center hover:shadow-lg transition-shadow" data-testid={`action-${action.href.split('/').pop()}`}>
            <div className="text-3xl mb-3">{action.icon}</div>
            <h3 className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>{t(action.titleKey)}</h3>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{t(action.desc)}</p>
          </Link>
        ))}
      </div>

      {/* Quick Profile */}
      <div className="card p-6">
        <h3 className="text-heading-3 mb-4" style={{ color: 'var(--text-primary)' }}>{t('nav.profile')}</h3>
        <div className="space-y-3" data-testid="profile-section">
          <div className="flex justify-between py-2 border-b" style={{ borderColor: 'var(--border-primary)' }}>
            <span className="text-body-sm" style={{ color: 'var(--text-secondary)' }}>{t('nav.rooms')}</span>
            <span className="text-body font-medium" style={{ color: 'var(--text-primary)' }}>{t('emptyState.noRoom')}</span>
          </div>
          <div className="flex justify-between py-2 border-b" style={{ borderColor: 'var(--border-primary)' }}>
            <span className="text-body-sm" style={{ color: 'var(--text-secondary)' }}>{t('nav.fees')}</span>
            <span className="text-body font-medium" style={{ color: 'var(--text-primary)' }}>{t('emptyState.noFees')}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

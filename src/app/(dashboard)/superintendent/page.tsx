import Link from 'next/link';
import { getTranslations } from 'next-intl/server';

export default async function SuperintendentDashboard() {
  const t = await getTranslations('common');

  const stats = [
    { label: t('nav.applications'), value: '0', variant: 'info' },
    { label: t('nav.rooms'), value: '0', variant: 'success' },
    { label: t('nav.leaves'), value: '0', variant: 'warning' },
    { label: t('nav.documents'), value: '0', variant: 'neutral' },
  ];

  const navItems = [
    { href: '/superintendent/rooms', icon: '🛏️', label: t('nav.rooms') },
    { href: '/superintendent/leaves', icon: '🏖️', label: t('nav.leaves') },
    { href: '/superintendent/audit', icon: '📋', label: t('nav.settings') },
    { href: '/superintendent/config', icon: '⚙️', label: t('nav.settings') },
    { href: '/superintendent/clearance', icon: '✅', label: t('nav.settings') },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-heading-2 mb-2" style={{ color: 'var(--text-primary)' }}>{t('nav.dashboard')}</h1>
        <p className="text-body" style={{ color: 'var(--text-secondary)' }}>Superintendent Overview</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-4 mb-8">
        {stats.map((stat) => (
          <div key={stat.label} className="stat-card">
            <div className="stat-card-label">{stat.label}</div>
            <div className="stat-card-value">{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Quick Navigation */}
      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-5 mb-8">
        {navItems.map((item) => (
          <Link key={item.href} href={item.href} className="card p-4 text-center hover:shadow-lg transition-shadow" data-testid={`nav-${item.href.split('/').pop()}`}>
            <div className="text-2xl mb-2">{item.icon}</div>
            <span className="text-body-sm font-medium" style={{ color: 'var(--text-primary)' }}>{item.label}</span>
          </Link>
        ))}
      </div>

      {/* Recent Applications */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-heading-3" style={{ color: 'var(--text-primary)' }}>{t('nav.applications')}</h3>
          <span className="badge badge-neutral">0 {t('emptyState.noData')}</span>
        </div>
        <div className="text-center py-8" data-testid="empty-state">
          <div className="text-3xl mb-3 opacity-50">📋</div>
          <p className="text-body-sm" style={{ color: 'var(--text-secondary)' }}>{t('emptyState.noData')}</p>
        </div>
      </div>
    </div>
  );
}

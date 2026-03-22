import Link from 'next/link';
import { getTranslations } from 'next-intl/server';

export default async function TrusteeDashboard() {
  const t = await getTranslations('common');

  const stats = [
    { label: t('nav.applications'), value: '0', color: 'var(--state-info-text)' },
    { label: t('nav.rooms'), value: '0', color: 'var(--state-success-text)' },
    { label: t('nav.fees'), value: '₹0', color: 'var(--text-primary)' },
  ];

  const navItems = [
    { href: '/trustee/applications', icon: '📋', label: t('nav.applications') },
    { href: '/trustee/interviews', icon: '🎙️', label: t('nav.settings') },
    { href: '/trustee/allocations', icon: '🛏️', label: t('nav.rooms') },
    { href: '/trustee/reports', icon: '📊', label: t('nav.settings') },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-heading-2 mb-2" style={{ color: 'var(--text-primary)' }}>{t('nav.dashboard')}</h1>
        <p className="text-body" style={{ color: 'var(--text-secondary)' }}>Trustee Overview — All Verticals</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3 mb-8">
        {stats.map((stat) => (
          <div key={stat.label} className="stat-card">
            <div className="stat-card-label">{stat.label}</div>
            <div className="stat-card-value" style={{ color: stat.color }}>{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Navigation */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        {navItems.map((item) => (
          <Link key={item.href} href={item.href} className="card p-5 text-center hover:shadow-lg transition-shadow" data-testid={`nav-${item.href.split('/').pop()}`}>
            <div className="text-3xl mb-3">{item.icon}</div>
            <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{item.label}</span>
          </Link>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="card">
        <h3 className="text-heading-3 mb-4" style={{ color: 'var(--text-primary)' }}>{t('nav.applications')}</h3>
        <div className="text-center py-8" data-testid="empty-state">
          <div className="text-3xl mb-3 opacity-50">📋</div>
          <p className="text-body-sm" style={{ color: 'var(--text-secondary)' }}>{t('emptyState.noData')}</p>
        </div>
      </div>
    </div>
  );
}

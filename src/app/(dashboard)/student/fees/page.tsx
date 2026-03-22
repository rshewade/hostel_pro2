import { getTranslations } from 'next-intl/server';

export default async function StudentFeesPage() {
  const t = await getTranslations('common');

  return (
    <div>
      <h1 className="text-heading-2 mb-6" style={{ color: 'var(--text-primary)' }}>{t('nav.fees')}</h1>

      {/* Fee Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3 mb-8">
        <div className="stat-card">
          <div className="stat-card-label">{t('nav.fees')} Due</div>
          <div className="stat-card-value">₹0</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-label">{t('nav.fees')} Paid</div>
          <div className="stat-card-value" style={{ color: 'var(--state-success-text)' }}>₹0</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-label">Waived</div>
          <div className="stat-card-value" style={{ color: 'var(--text-secondary)' }}>₹0</div>
        </div>
      </div>

      {/* Fee List — empty state shows message not error (BUG-004) */}
      <div className="card">
        <h3 className="text-heading-3 mb-4" style={{ color: 'var(--text-primary)' }}>Fee Details</h3>
        <div className="text-center py-12" data-testid="empty-state">
          <div className="text-4xl mb-4 opacity-50">💳</div>
          <p className="text-body" style={{ color: 'var(--text-secondary)' }}>{t('emptyState.noFees')}</p>
        </div>
      </div>
    </div>
  );
}

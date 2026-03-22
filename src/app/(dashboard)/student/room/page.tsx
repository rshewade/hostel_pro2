import { getTranslations } from 'next-intl/server';

export default async function StudentRoomPage() {
  const t = await getTranslations('common');

  return (
    <div>
      <h1 className="text-heading-2 mb-6" style={{ color: 'var(--text-primary)' }}>{t('nav.rooms')}</h1>

      {/* Room info or empty state — shows message NOT error (BUG-011) */}
      <div className="card">
        <div className="text-center py-12" data-testid="empty-state">
          <div className="text-4xl mb-4 opacity-50">🛏️</div>
          <h3 className="text-heading-3 mb-2" style={{ color: 'var(--text-primary)' }}>
            {t('emptyState.noRoom')}
          </h3>
          <p className="text-body-sm" style={{ color: 'var(--text-secondary)' }}>
            {t('emptyState.noData')}
          </p>
          <span className="badge badge-warning mt-4 inline-flex">
            {t('emptyState.noRoom')}
          </span>
        </div>
      </div>
    </div>
  );
}

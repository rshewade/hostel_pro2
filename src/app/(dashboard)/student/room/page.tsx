import { getTranslations } from 'next-intl/server';

export default async function StudentRoomPage() {
  const t = await getTranslations('common');

  // Empty state shows informational message, NOT error (prevents BUG-011)
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">{t('nav.rooms')}</h1>
      <div className="card" data-testid="empty-state">
        <p className="text-gray-500">{t('emptyState.noRoom')}</p>
      </div>
    </div>
  );
}

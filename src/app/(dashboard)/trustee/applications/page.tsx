import { getTranslations } from 'next-intl/server';

export default async function Page() {
  const t = await getTranslations('common');
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">{t('nav.applications')}</h1>
      <div className="card" data-testid="empty-state"><p className="text-gray-500">{t('emptyState.noData')}</p></div>
    </div>
  );
}

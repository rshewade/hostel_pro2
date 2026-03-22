import { getTranslations } from 'next-intl/server';

export default async function HomePage() {
  const t = await getTranslations('common');

  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-navy-900 mb-4">
          {t('appName')}
        </h1>
        <p className="text-navy-500 text-lg">
          {t('nav.home')}
        </p>
      </div>
    </main>
  );
}

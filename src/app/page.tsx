import { getTranslations } from 'next-intl/server';

export default async function HomePage() {
  const t = await getTranslations('common');

  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">{t('appName')}</h1>
        <p className="text-lg text-gray-500">{t('nav.home')}</p>
      </div>
    </main>
  );
}

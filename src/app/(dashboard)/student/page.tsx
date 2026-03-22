import { getTranslations } from 'next-intl/server';

export default async function StudentDashboard() {
  const t = await getTranslations('common');

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">{t('nav.dashboard')}</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <a href="/student/fees" className="card hover:shadow-md transition-shadow" data-testid="fees-card">
          <h3 className="font-semibold">{t('nav.fees')}</h3>
        </a>
        <a href="/student/leave" className="card hover:shadow-md transition-shadow" data-testid="leave-card">
          <h3 className="font-semibold">{t('nav.leaves')}</h3>
        </a>
        <a href="/student/room" className="card hover:shadow-md transition-shadow" data-testid="room-card">
          <h3 className="font-semibold">{t('nav.rooms')}</h3>
        </a>
        <a href="/student/documents" className="card hover:shadow-md transition-shadow" data-testid="documents-card">
          <h3 className="font-semibold">{t('nav.documents')}</h3>
        </a>
      </div>
    </div>
  );
}

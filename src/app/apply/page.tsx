import { getTranslations } from 'next-intl/server';
import Link from 'next/link';

export default async function ApplyPage() {
  const t = await getTranslations('common');

  const verticals = [
    { id: 'boys-hostel', label: 'Boys Hostel', vertical: 'BOYS' },
    { id: 'girls-ashram', label: 'Girls Ashram', vertical: 'GIRLS' },
    { id: 'dharamshala', label: 'Dharamshala', vertical: 'DHARAMSHALA' },
  ];

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-2xl p-6">
        <h1 className="text-3xl font-bold text-center mb-8">{t('nav.applications')}</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {verticals.map((v) => (
            <Link
              key={v.id}
              href={`/apply/${v.id}/contact`}
              className="card text-center hover:shadow-lg transition-shadow"
              data-testid={`vertical-${v.id}`}
            >
              <h3 className="text-lg font-semibold">{v.label}</h3>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}

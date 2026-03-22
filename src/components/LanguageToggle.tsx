'use client';

import { useRouter } from 'next/navigation';
import { localeNames, type Locale } from '@/i18n/config';

export function LanguageToggle() {
  const router = useRouter();

  const switchLocale = (locale: Locale) => {
    document.cookie = `locale=${locale};path=/;max-age=31536000`;
    router.refresh(); // Forces server re-render with new locale (prevents BUG-012)
  };

  return (
    <div className="flex gap-2" data-testid="language-toggle">
      {(Object.entries(localeNames) as [Locale, string][]).map(([locale, name]) => (
        <button
          key={locale}
          onClick={() => switchLocale(locale)}
          className="text-sm px-2 py-1 rounded hover:bg-gray-100"
          data-testid={`lang-${locale}`}
        >
          {name}
        </button>
      ))}
    </div>
  );
}

import { getRequestConfig } from 'next-intl/server';
import { cookies } from 'next/headers';
import { defaultLocale, locales, type Locale } from './config';

export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  const localeCookie = cookieStore.get('locale')?.value;
  const locale: Locale = locales.includes(localeCookie as Locale)
    ? (localeCookie as Locale)
    : defaultLocale;

  // Load messages for the locale
  // Each locale has a directory with multiple JSON files — merge them here
  const common = (await import(`../../messages/${locale}/common.json`)).default;

  return {
    locale,
    messages: common,
  };
});

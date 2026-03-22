import { getRequestConfig } from 'next-intl/server';
import { cookies } from 'next/headers';
import { defaultLocale, locales, type Locale } from './config';

export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  const localeCookie = cookieStore.get('locale')?.value;
  const locale: Locale = locales.includes(localeCookie as Locale)
    ? (localeCookie as Locale)
    : defaultLocale;

  let messages;
  if (locale === 'hi') {
    messages = (await import('../../messages/hi/common.json')).default;
  } else {
    messages = (await import('../../messages/en/common.json')).default;
  }

  return {
    locale,
    messages,
  };
});

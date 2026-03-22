import { getRequestConfig } from 'next-intl/server';
import { defaultLocale, locales, type Locale } from './config';

export default getRequestConfig(async ({ requestLocale }) => {
  // Use requestLocale from next-intl if available, otherwise default
  let locale: Locale = defaultLocale;

  const requested = await requestLocale;
  if (requested && locales.includes(requested as Locale)) {
    locale = requested as Locale;
  } else {
    // Try reading cookie manually (only works during request, not build)
    try {
      const { cookies } = await import('next/headers');
      const cookieStore = await cookies();
      const localeCookie = cookieStore.get('locale')?.value;
      if (localeCookie && locales.includes(localeCookie as Locale)) {
        locale = localeCookie as Locale;
      }
    } catch {
      // During build, cookies() is not available — use default
    }
  }

  const common = (await import(`../../messages/${locale}/common.json`)).default;

  return {
    locale,
    messages: {
      common,
    },
  };
});

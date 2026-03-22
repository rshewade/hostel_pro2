import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { LanguageToggle } from '@/components/LanguageToggle';

export default async function HomePage() {
  const t = await getTranslations('common');

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-page)' }}>
      {/* Header */}
      <header className="px-6 py-4 border-b" style={{ backgroundColor: 'var(--surface-primary)', borderColor: 'var(--border-primary)' }}>
        <div className="mx-auto max-w-6xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--bg-accent)' }}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--text-on-accent)' }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-semibold" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-serif)' }}>
                {t('appName')}
              </h1>
              <p className="text-caption">Hostel Management System</p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <nav className="hidden md:flex items-center gap-6">
              <Link href="/apply" className="nav-link">{t('nav.applications')}</Link>
              <Link href="/track" className="nav-link">{t('search')}</Link>
              <Link href="/login" className="nav-link">{t('login')}</Link>
            </nav>
            <LanguageToggle />
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 px-6" style={{ backgroundColor: 'var(--bg-brand)', backgroundImage: 'linear-gradient(rgba(26, 54, 93, 0.9), rgba(26, 54, 93, 0.95))' }}>
        <div className="mx-auto max-w-6xl text-center">
          <div className="w-20 h-20 mx-auto mb-8 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--bg-accent)' }}>
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--text-on-accent)' }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6" style={{ color: 'var(--text-inverse)', fontFamily: 'var(--font-serif)' }}>
            {t('welcome', { name: t('appName') })}
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto" style={{ color: 'var(--color-navy-200)' }}>
            {t('nav.home')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/apply" className="btn-primary text-lg px-8 py-4" data-testid="cta-apply">
              {t('nav.applications')}
            </Link>
            <Link href="/track" className="btn-secondary text-lg px-8 py-4" data-testid="cta-track">
              {t('search')}
            </Link>
            <Link href="/login" className="btn-primary text-lg px-8 py-4" style={{ backgroundColor: 'var(--color-gold-100)', color: 'var(--color-gold-800)' }} data-testid="cta-login">
              {t('login')}
            </Link>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="px-6 py-16" style={{ backgroundColor: 'var(--bg-page)' }}>
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
              {t('nav.about')}
            </h2>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {[
              { icon: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z', title: t('nav.home') },
              { icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253', title: t('nav.rooms') },
              { icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z', title: t('nav.settings') },
            ].map((item, i) => (
              <div key={i} className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--bg-accent)' }}>
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--text-on-accent)' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>{item.title}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Hostels Section */}
      <section className="px-6 py-16" style={{ backgroundColor: 'var(--surface-secondary)' }}>
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
              {t('nav.rooms')}
            </h2>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {[
              { name: 'Boys Hostel', vertical: 'BOYS', color: '#2563eb' },
              { name: 'Girls Ashram', vertical: 'GIRLS', color: '#9333ea' },
              { name: 'Dharamshala', vertical: 'DHARAMSHALA', color: '#059669' },
            ].map((hostel) => (
              <Link key={hostel.vertical} href={`/apply/${hostel.vertical.toLowerCase()}/contact`} className="card hover:shadow-lg transition-all text-center" data-testid={`hostel-${hostel.vertical.toLowerCase()}`}>
                <div className="w-14 h-14 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ backgroundColor: hostel.color }}>
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>{hostel.name}</h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-8 border-t" style={{ backgroundColor: 'var(--surface-primary)', borderColor: 'var(--border-primary)' }}>
        <div className="mx-auto max-w-6xl text-center">
          <p className="text-caption">&copy; {new Date().getFullYear()} {t('appName')}</p>
        </div>
      </footer>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';

type TrackState = 'idle' | 'loading' | 'found' | 'notFound' | 'error';

export default function TrackPage() {
  const t = useTranslations('common');
  const [state, setState] = useState<TrackState>('idle');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [mobile, setMobile] = useState('');

  const handleTrack = async () => {
    if (!trackingNumber || !mobile) return;
    setState('loading');

    try {
      const res = await fetch(`/api/applications/track/${trackingNumber}?mobile=${mobile}`);
      if (res.status === 404) {
        setState('notFound');
      } else if (res.ok) {
        setState('found');
      } else {
        setState('error');
      }
    } catch {
      setState('error');
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="card w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-6">{t('search')}</h1>

        <div className="space-y-4">
          <input
            type="text"
            placeholder="BH-2026-0001"
            value={trackingNumber}
            onChange={(e) => setTrackingNumber(e.target.value)}
            className="w-full border rounded-md px-3 py-2"
            data-testid="tracking-input"
          />
          <input
            type="tel"
            placeholder="+919876543210"
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
            className="w-full border rounded-md px-3 py-2"
            data-testid="mobile-input"
          />
          <button onClick={handleTrack} className="btn-primary w-full" data-testid="track-button">
            {t('search')}
          </button>
        </div>

        {/* State machine — no infinite spinner (prevents BUG-005) */}
        {state === 'loading' && (
          <div className="mt-4 text-center" data-testid="loading-spinner">
            <p>{t('loading')}</p>
          </div>
        )}
        {state === 'found' && (
          <div className="mt-4 p-4 bg-green-50 rounded" data-testid="track-result">
            <p className="text-green-700">Application found!</p>
          </div>
        )}
        {state === 'notFound' && (
          <div className="mt-4 p-4 bg-yellow-50 rounded" data-testid="track-not-found">
            <p className="text-yellow-700">{t('error.notFound')}</p>
          </div>
        )}
        {state === 'error' && (
          <div className="mt-4 p-4 bg-red-50 rounded">
            <p className="text-red-700">{t('error.generic')}</p>
            <button onClick={handleTrack} className="mt-2 text-sm underline" data-testid="retry-button">
              {t('retry')}
            </button>
          </div>
        )}
      </div>
    </main>
  );
}

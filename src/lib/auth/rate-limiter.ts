import { RateLimitError } from '@/lib/errors';

interface RateLimitEntry {
  count: number;
  windowStart: number;
}

const WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const MAX_REQUESTS = 5;
const store = new Map<string, RateLimitEntry>();

/**
 * Check OTP rate limit. Max 5 per phone per 10 minutes.
 * Throws RateLimitError if exceeded.
 */
export function checkOtpRateLimit(phone: string): void {
  const now = Date.now();
  const key = `otp:${phone}`;
  const entry = store.get(key);

  if (!entry || now - entry.windowStart > WINDOW_MS) {
    store.set(key, { count: 1, windowStart: now });
    return;
  }

  if (entry.count >= MAX_REQUESTS) {
    const retryAfterSec = Math.ceil((WINDOW_MS - (now - entry.windowStart)) / 1000);
    throw new RateLimitError(`Too many OTP requests. Try again in ${retryAfterSec} seconds.`);
  }

  entry.count++;
}

/** Reset for testing */
export function resetOtpRateLimit(phone: string): void {
  store.delete(`otp:${phone}`);
}

/** Clear all for testing */
export function clearAllRateLimits(): void {
  store.clear();
}

import { RateLimitError } from '@/lib/errors';

interface RateLimitEntry {
  count: number;
  windowStart: number;
}

const WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const MAX_REQUESTS = 5;

// In-memory rate limit store. In production, use Redis.
const store = new Map<string, RateLimitEntry>();

/**
 * Check OTP rate limit for a phone number.
 * Max 5 OTP requests per phone per 10 minutes.
 * Throws RateLimitError if exceeded.
 */
export function checkOtpRateLimit(phone: string): void {
  const now = Date.now();
  const key = `otp:${phone}`;
  const entry = store.get(key);

  if (!entry || now - entry.windowStart > WINDOW_MS) {
    // New window
    store.set(key, { count: 1, windowStart: now });
    return;
  }

  if (entry.count >= MAX_REQUESTS) {
    const retryAfterMs = WINDOW_MS - (now - entry.windowStart);
    const retryAfterSec = Math.ceil(retryAfterMs / 1000);
    throw new RateLimitError(
      `Too many OTP requests. Try again in ${retryAfterSec} seconds.`
    );
  }

  entry.count++;
}

/**
 * Reset rate limit for a phone number (for testing).
 */
export function resetOtpRateLimit(phone: string): void {
  store.delete(`otp:${phone}`);
}

/**
 * Clear all rate limits (for testing).
 */
export function clearAllRateLimits(): void {
  store.clear();
}

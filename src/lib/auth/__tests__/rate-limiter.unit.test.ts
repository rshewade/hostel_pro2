import { describe, it, expect, beforeEach } from 'vitest';
import { checkOtpRateLimit, clearAllRateLimits } from '../rate-limiter';
import { RateLimitError } from '@/lib/errors';

describe('OTP Rate Limiter', () => {
  beforeEach(() => {
    clearAllRateLimits();
  });

  it('allows 5 requests within the window', () => {
    const phone = '+919876543210';
    for (let i = 0; i < 5; i++) {
      expect(() => checkOtpRateLimit(phone)).not.toThrow();
    }
  });

  it('blocks 6th request within the window', () => {
    const phone = '+919876543211';
    for (let i = 0; i < 5; i++) {
      checkOtpRateLimit(phone);
    }
    expect(() => checkOtpRateLimit(phone)).toThrow(RateLimitError);
  });

  it('different phone numbers have independent limits', () => {
    const phone1 = '+919876543212';
    const phone2 = '+919876543213';
    for (let i = 0; i < 5; i++) {
      checkOtpRateLimit(phone1);
    }
    // phone1 is at limit, phone2 should still work
    expect(() => checkOtpRateLimit(phone2)).not.toThrow();
    expect(() => checkOtpRateLimit(phone1)).toThrow(RateLimitError);
  });

  it('error message includes retry time', () => {
    const phone = '+919876543214';
    for (let i = 0; i < 5; i++) {
      checkOtpRateLimit(phone);
    }
    try {
      checkOtpRateLimit(phone);
    } catch (err) {
      expect(err).toBeInstanceOf(RateLimitError);
      expect((err as RateLimitError).message).toContain('Try again in');
      expect((err as RateLimitError).status).toBe(429);
    }
  });
});

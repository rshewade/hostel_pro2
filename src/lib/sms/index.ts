import { MockSmsProvider } from './mock';

export interface SmsProvider {
  sendOtp(phone: string, otp: string): Promise<void>;
}

/**
 * Get the SMS provider based on SMS_MODE env var.
 * Default: mock (OTP=123456, logs to console).
 */
export function getSmsProvider(): SmsProvider {
  const mode = process.env.SMS_MODE || 'mock';

  if (mode === 'live') {
    // Lazy-load Twilio to avoid requiring credentials in dev/test
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { TwilioSmsProvider } = require('./twilio');
    return new TwilioSmsProvider();
  }

  return new MockSmsProvider();
}

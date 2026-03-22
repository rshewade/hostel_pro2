import { MockSmsProvider } from './mock';

export interface SmsProvider {
  sendOtp(phone: string, otp: string): Promise<void>;
}

export function getSmsProvider(): SmsProvider {
  if (process.env.SMS_MODE === 'live') {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { TwilioSmsProvider } = require('./twilio');
    return new TwilioSmsProvider();
  }
  return new MockSmsProvider();
}

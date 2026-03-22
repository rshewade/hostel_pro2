import type { SmsProvider } from './index';

/**
 * Mock SMS provider for development and testing.
 * OTP is always 123456. No real SMS is sent.
 */
export class MockSmsProvider implements SmsProvider {
  async sendOtp(phone: string, otp: string): Promise<void> {
    console.log(`[MOCK SMS] OTP ${otp} sent to ${phone}`);
  }
}

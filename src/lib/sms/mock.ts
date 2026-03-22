import type { SmsProvider } from './index';

export class MockSmsProvider implements SmsProvider {
  async sendOtp(phone: string, otp: string): Promise<void> {
    console.log(`[MOCK SMS] OTP ${otp} sent to ${phone}`);
  }
}

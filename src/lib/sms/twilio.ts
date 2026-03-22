import type { SmsProvider } from './index';

export class TwilioSmsProvider implements SmsProvider {
  async sendOtp(phone: string, otp: string): Promise<void> {
    const sid = process.env.TWILIO_ACCOUNT_SID;
    const token = process.env.TWILIO_AUTH_TOKEN;
    const from = process.env.TWILIO_PHONE_NUMBER;
    if (!sid || !token || !from) throw new Error('Twilio credentials not configured');

    const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${btoa(`${sid}:${token}`)}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({ To: phone, From: from, Body: `Your Hostel Pro code: ${otp}` }).toString(),
    });
    if (!res.ok) throw new Error(`Twilio SMS failed: ${res.status}`);
  }
}

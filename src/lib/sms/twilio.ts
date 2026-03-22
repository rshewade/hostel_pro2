import type { SmsProvider } from './index';

/**
 * Live Twilio SMS provider.
 * Requires TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER env vars.
 */
export class TwilioSmsProvider implements SmsProvider {
  async sendOtp(phone: string, otp: string): Promise<void> {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const from = process.env.TWILIO_PHONE_NUMBER;

    if (!accountSid || !authToken || !from) {
      throw new Error(
        'Twilio credentials not configured. Set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER.'
      );
    }

    const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
    const body = new URLSearchParams({
      To: phone,
      From: from,
      Body: `Your Hostel Pro verification code is: ${otp}`,
    });

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${btoa(`${accountSid}:${authToken}`)}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: body.toString(),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Twilio SMS failed: ${response.status} ${error}`);
    }
  }
}

import { getSmsProvider } from '@/lib/sms';

export async function sendSmsNotification(phone: string, message: string): Promise<void> {
  const provider = getSmsProvider();
  await provider.sendOtp(phone, message); // Reuses SMS provider interface
}

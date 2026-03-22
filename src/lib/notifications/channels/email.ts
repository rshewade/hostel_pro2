import { logger } from '@/lib/logger';

export async function sendEmailNotification(to: string, subject: string, body: string): Promise<void> {
  const provider = process.env.EMAIL_PROVIDER || 'console';

  if (provider === 'console') {
    logger.info(`[MOCK EMAIL] To: ${to} | Subject: ${subject} | Body: ${body}`);
    return;
  }

  // TODO: Implement Resend, SendGrid, SES providers
  logger.warn(`Email provider '${provider}' not yet implemented, falling back to console`);
  logger.info(`[EMAIL] To: ${to} | Subject: ${subject}`);
}

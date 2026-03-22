import { logger } from '@/lib/logger';

export async function sendWhatsAppNotification(phone: string, message: string): Promise<void> {
  if (process.env.WHATSAPP_MODE !== 'live') {
    logger.info(`[MOCK WHATSAPP] To: ${phone} | Message: ${message}`);
    return;
  }

  // TODO: Implement Twilio WhatsApp API
  logger.warn('WhatsApp live mode not yet implemented');
}

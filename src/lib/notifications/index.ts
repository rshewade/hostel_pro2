import { logger } from '@/lib/logger';
import { renderTemplate } from './template';

export interface NotifyParams {
  event: string;
  context: Record<string, string>;
  recipients: { userId?: string; phone?: string; email?: string };
  metadata?: Record<string, unknown>;
}

/**
 * Dispatch notifications to all enabled channels based on notification rules.
 * Errors are logged but never thrown — graceful degradation.
 */
export async function notify(params: NotifyParams): Promise<void> {
  try {
    // Always create in-app notification
    if (params.recipients.userId) {
      const { createInAppNotification } = await import('./channels/in-app');
      await createInAppNotification({
        userId: params.recipients.userId,
        event: params.event,
        context: params.context,
        metadata: params.metadata,
      });
    }

    // Check notification mode
    if (process.env.NOTIFICATION_MODE === 'mock' || !process.env.NOTIFICATION_MODE) {
      logger.info(`[MOCK NOTIFICATION] Event: ${params.event}`, { recipients: params.recipients, context: params.context });
      return;
    }

    // In live mode, dispatch to other channels based on rules
    // TODO: Query notification_rules table and dispatch to SMS/email/WhatsApp
  } catch (err) {
    logger.error('Notification dispatch failed', {
      event: params.event,
      error: err instanceof Error ? err.message : String(err),
    });
  }
}

export { renderTemplate };

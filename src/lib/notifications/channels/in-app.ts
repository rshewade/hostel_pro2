import { db } from '@/lib/db';
import { notifications } from '@/lib/db/schema';
import { renderTemplate } from '../template';

export async function createInAppNotification(params: {
  userId: string;
  event: string;
  context: Record<string, string>;
  metadata?: Record<string, unknown>;
}) {
  const title = params.event.replace(/_/g, ' ').toLowerCase().replace(/^\w/, c => c.toUpperCase());
  const message = renderTemplate(`Notification: {{event}}`, { event: params.event, ...params.context });

  await db.insert(notifications).values({
    userId: params.userId,
    type: 'SYSTEM' as any,
    title,
    message,
    metadata: params.metadata,
  });
}

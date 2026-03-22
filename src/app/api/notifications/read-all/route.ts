import { requireAuth } from '@/lib/auth/middleware';
import { resolveUserId } from '@/lib/auth/resolve-user';
import { handleApiError } from '@/lib/api/error-handler';
import { successResponse } from '@/lib/api/response';
import { markAllAsRead } from '@/lib/services/notifications';

export async function PATCH() {
  try {
    const session = await requireAuth();
    const userId = await resolveUserId(session);
    await markAllAsRead(userId);
    return successResponse({ success: true });
  } catch (err) { return handleApiError(err); }
}

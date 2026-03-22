import { requireAuth } from '@/lib/auth/middleware';
import { resolveUserId } from '@/lib/auth/resolve-user';
import { handleApiError } from '@/lib/api/error-handler';
import { successResponse } from '@/lib/api/response';
import { getUnreadCount } from '@/lib/services/notifications';

export async function GET() {
  try {
    const session = await requireAuth();
    const userId = await resolveUserId(session);
    const count = await getUnreadCount(userId);
    return successResponse({ count });
  } catch (err) {
    return handleApiError(err);
  }
}

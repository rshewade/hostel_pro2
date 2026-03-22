import { requireAuth } from '@/lib/auth/middleware';
import { resolveUserId } from '@/lib/auth/resolve-user';
import { handleApiError } from '@/lib/api/error-handler';
import { successResponse } from '@/lib/api/response';
import { getUnreadCount } from '@/lib/services/notifications';

export async function GET() {
  try {
    const session = await requireAuth();
    const userId = await resolveUserId(session);
    return successResponse({ count: await getUnreadCount(userId) });
  } catch (err) { return handleApiError(err); }
}

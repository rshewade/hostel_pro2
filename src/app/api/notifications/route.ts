import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth/middleware';
import { resolveUserId } from '@/lib/auth/resolve-user';
import { handleApiError } from '@/lib/api/error-handler';
import { paginatedResponse } from '@/lib/api/response';
import { paginationSchema } from '@/lib/validations/common';
import { listNotifications } from '@/lib/services/notifications';

export async function GET(req: NextRequest) {
  try {
    const session = await requireAuth();
    const userId = await resolveUserId(session);
    const params = paginationSchema.parse(Object.fromEntries(req.nextUrl.searchParams));
    const result = await listNotifications(userId, { page: params.page, limit: params.limit });
    return paginatedResponse(result.data, result.total, params.page, params.limit);
  } catch (err) { return handleApiError(err); }
}

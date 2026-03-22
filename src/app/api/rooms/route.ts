import { NextRequest } from 'next/server';
import { requireAuth, requireRole } from '@/lib/auth/middleware';
import { handleApiError } from '@/lib/api/error-handler';
import { successResponse, paginatedResponse } from '@/lib/api/response';
import { paginationSchema } from '@/lib/validations/common';
import { createRoomSchema } from '@/lib/validations/rooms';
import { resolveUserId } from '@/lib/auth/resolve-user';
import { createRoom, listRooms } from '@/lib/services/rooms';

export async function GET(req: NextRequest) {
  try {
    await requireAuth();
    const params = paginationSchema.parse(Object.fromEntries(req.nextUrl.searchParams));
    const vertical = req.nextUrl.searchParams.get('vertical') || undefined;
    const result = await listRooms({ vertical, page: params.page, limit: params.limit });
    return paginatedResponse(result.data, result.total, params.page, params.limit);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth();
    requireRole(session, ['SUPERINTENDENT', 'TRUSTEE']);
    const userId = await resolveUserId(session);
    const body = createRoomSchema.parse(await req.json());
    const room = await createRoom(body, userId);
    return successResponse(room, 201);
  } catch (err) {
    return handleApiError(err);
  }
}

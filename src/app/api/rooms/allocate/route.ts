import { NextRequest } from 'next/server';
import { requireAuth, requireRole } from '@/lib/auth/middleware';
import { resolveUserId } from '@/lib/auth/resolve-user';
import { handleApiError } from '@/lib/api/error-handler';
import { successResponse } from '@/lib/api/response';
import { allocateRoomSchema } from '@/lib/validations/rooms';
import { allocateRoom } from '@/lib/services/rooms';

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth();
    requireRole(session, ['SUPERINTENDENT', 'TRUSTEE']);
    const userId = await resolveUserId(session);
    const body = allocateRoomSchema.parse(await req.json());
    return successResponse(await allocateRoom(body, userId), 201);
  } catch (err) { return handleApiError(err); }
}

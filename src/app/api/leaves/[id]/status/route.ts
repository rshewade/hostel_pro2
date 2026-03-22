import { NextRequest } from 'next/server';
import { requireAuth, requireRole } from '@/lib/auth/middleware';
import { resolveUserId } from '@/lib/auth/resolve-user';
import { handleApiError } from '@/lib/api/error-handler';
import { successResponse } from '@/lib/api/response';
import { updateLeaveStatusSchema } from '@/lib/validations/leaves';
import { updateLeaveStatus } from '@/lib/services/leaves';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth();
    requireRole(session, ['SUPERINTENDENT', 'TRUSTEE']);
    const userId = await resolveUserId(session);
    const { id } = await params;
    const body = updateLeaveStatusSchema.parse(await req.json());
    const leave = await updateLeaveStatus(id, body, userId);
    return successResponse(leave);
  } catch (err) {
    return handleApiError(err);
  }
}

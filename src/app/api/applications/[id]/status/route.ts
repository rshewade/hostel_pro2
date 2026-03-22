import { NextRequest } from 'next/server';
import { requireAuth, requireRole } from '@/lib/auth/middleware';
import { resolveUserId } from '@/lib/auth/resolve-user';
import { handleApiError } from '@/lib/api/error-handler';
import { successResponse } from '@/lib/api/response';
import { updateStatusSchema } from '@/lib/validations/applications';
import { updateApplicationStatus } from '@/lib/services/applications';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireAuth();
    requireRole(session, ['SUPERINTENDENT', 'TRUSTEE']);
    const userId = await resolveUserId(session);
    const { id } = await params;
    const body = updateStatusSchema.parse(await req.json());
    return successResponse(await updateApplicationStatus(id, body, userId));
  } catch (err) { return handleApiError(err); }
}

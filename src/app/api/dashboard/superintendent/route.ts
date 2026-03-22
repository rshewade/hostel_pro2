import { requireAuth, requireRole } from '@/lib/auth/middleware';
import { handleApiError } from '@/lib/api/error-handler';
import { successResponse } from '@/lib/api/response';
import { getApplicationStats } from '@/lib/services/applications';

export async function GET() {
  try {
    const session = await requireAuth();
    requireRole(session, ['SUPERINTENDENT']);
    return successResponse({ applicationStats: await getApplicationStats(session.user.role) });
  } catch (err) { return handleApiError(err); }
}

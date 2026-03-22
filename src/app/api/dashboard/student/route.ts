import { requireAuth, requireRole } from '@/lib/auth/middleware';
import { resolveUserId } from '@/lib/auth/resolve-user';
import { handleApiError } from '@/lib/api/error-handler';
import { successResponse } from '@/lib/api/response';
import { getPaymentSummary } from '@/lib/services/payments';
import { getStudentLeaves } from '@/lib/services/leaves';
import { getStudentAllocation } from '@/lib/services/rooms';

export async function GET() {
  try {
    const session = await requireAuth();
    requireRole(session, ['STUDENT']);
    const userId = await resolveUserId(session);
    const [fees, leaves, room] = await Promise.all([getPaymentSummary(userId), getStudentLeaves(userId), getStudentAllocation(userId)]);
    return successResponse({ fees, recentLeaves: leaves.slice(0, 5), room });
  } catch (err) { return handleApiError(err); }
}

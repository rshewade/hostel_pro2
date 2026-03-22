import { requireAuth, requireRole } from '@/lib/auth/middleware';
import { handleApiError } from '@/lib/api/error-handler';
import { successResponse } from '@/lib/api/response';

export async function GET() {
  try {
    const session = await requireAuth();
    requireRole(session, ['ACCOUNTS']);
    return successResponse({ message: 'Accounts dashboard' });
  } catch (err) { return handleApiError(err); }
}

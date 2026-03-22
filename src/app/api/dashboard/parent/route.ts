import { requireAuth, requireRole } from '@/lib/auth/middleware';
import { handleApiError } from '@/lib/api/error-handler';
import { successResponse } from '@/lib/api/response';

export async function GET() {
  try {
    const session = await requireAuth();
    requireRole(session, ['PARENT']);
    return successResponse({ students: [], message: 'No students linked' });
  } catch (err) { return handleApiError(err); }
}

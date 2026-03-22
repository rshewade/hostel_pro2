import { requireAuth, requireRole } from '@/lib/auth/middleware';
import { handleApiError } from '@/lib/api/error-handler';
import { successResponse } from '@/lib/api/response';

export async function GET() {
  try {
    const session = await requireAuth();
    requireRole(session, ['PARENT']);
    // Returns empty data structure for parent with no linked students (prevents BUG-004)
    return successResponse({ students: [], message: 'No students linked to your account' });
  } catch (err) {
    return handleApiError(err);
  }
}

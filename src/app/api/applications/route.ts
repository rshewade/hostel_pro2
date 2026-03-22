import { NextRequest } from 'next/server';
import { requireAuth, requireRole } from '@/lib/auth/middleware';
import { resolveUserId } from '@/lib/auth/resolve-user';
import { handleApiError } from '@/lib/api/error-handler';
import { successResponse, paginatedResponse } from '@/lib/api/response';
import { createApplicationSchema } from '@/lib/validations/applications';
import { paginationSchema } from '@/lib/validations/common';
import { createApplication, listApplications } from '@/lib/services/applications';

/**
 * GET /api/applications — List applications (authenticated, role-filtered)
 */
export async function GET(req: NextRequest) {
  try {
    const session = await requireAuth();
    const userId = await resolveUserId(session);
    const params = paginationSchema.parse(Object.fromEntries(req.nextUrl.searchParams));
    const status = req.nextUrl.searchParams.get('status') || undefined;
    const userRole = session.user.role;

    const result = await listApplications({
      userId,
      userRole,
      status,
      page: params.page,
      limit: params.limit,
    });

    return paginatedResponse(result.data, result.total, params.page, params.limit);
  } catch (err) {
    return handleApiError(err);
  }
}

/**
 * POST /api/applications — Submit new application (PUBLIC — no requireAuth)
 * This is a public endpoint. Do NOT call requireAuth(). (Prevents BUG-001)
 */
export async function POST(req: NextRequest) {
  try {
    // NO requireAuth() — public form submission
    const body = createApplicationSchema.parse(await req.json());
    const application = await createApplication(body);
    return successResponse(application, 201);
  } catch (err) {
    return handleApiError(err);
  }
}

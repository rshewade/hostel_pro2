import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth/middleware';
import { resolveUserId } from '@/lib/auth/resolve-user';
import { handleApiError } from '@/lib/api/error-handler';
import { successResponse, paginatedResponse } from '@/lib/api/response';
import { createApplicationSchema } from '@/lib/validations/applications';
import { paginationSchema } from '@/lib/validations/common';
import { createApplication, listApplications } from '@/lib/services/applications';

export async function GET(req: NextRequest) {
  try {
    const session = await requireAuth();
    const userId = await resolveUserId(session);
    const params = paginationSchema.parse(Object.fromEntries(req.nextUrl.searchParams));
    const status = req.nextUrl.searchParams.get('status') || undefined;
    const result = await listApplications({ userId, userRole: session.user.role, status, page: params.page, limit: params.limit });
    return paginatedResponse(result.data, result.total, params.page, params.limit);
  } catch (err) { return handleApiError(err); }
}

// PUBLIC endpoint — no requireAuth (prevents BUG-001)
export async function POST(req: NextRequest) {
  try {
    const body = createApplicationSchema.parse(await req.json());
    const app = await createApplication(body);
    return successResponse(app, 201);
  } catch (err) { return handleApiError(err); }
}

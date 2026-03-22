import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth/middleware';
import { resolveUserId } from '@/lib/auth/resolve-user';
import { handleApiError } from '@/lib/api/error-handler';
import { successResponse, paginatedResponse } from '@/lib/api/response';
import { paginationSchema } from '@/lib/validations/common';
import { createLeaveSchema } from '@/lib/validations/leaves';
import { createLeaveRequest, listLeaves } from '@/lib/services/leaves';

export async function GET(req: NextRequest) {
  try {
    const session = await requireAuth();
    const userId = await resolveUserId(session);
    const params = paginationSchema.parse(Object.fromEntries(req.nextUrl.searchParams));
    const result = await listLeaves({ studentUserId: session.user.role === 'STUDENT' ? userId : undefined, page: params.page, limit: params.limit });
    return paginatedResponse(result.data, result.total, params.page, params.limit);
  } catch (err) { return handleApiError(err); }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth();
    const userId = await resolveUserId(session);
    const body = createLeaveSchema.parse(await req.json());
    return successResponse(await createLeaveRequest(body, userId), 201);
  } catch (err) { return handleApiError(err); }
}

import { NextRequest } from 'next/server';
import { requireAuth, requireRole } from '@/lib/auth/middleware';
import { handleApiError } from '@/lib/api/error-handler';
import { paginatedResponse } from '@/lib/api/response';
import { paginationSchema } from '@/lib/validations/common';
import { listUsers } from '@/lib/services/users';

export async function GET(req: NextRequest) {
  try {
    const session = await requireAuth();
    requireRole(session, ['SUPERINTENDENT', 'TRUSTEE', 'ACCOUNTS']);
    const params = paginationSchema.parse(Object.fromEntries(req.nextUrl.searchParams));
    const result = await listUsers({ role: req.nextUrl.searchParams.get('role') || undefined, page: params.page, limit: params.limit });
    return paginatedResponse(result.data, result.total, params.page, params.limit);
  } catch (err) { return handleApiError(err); }
}

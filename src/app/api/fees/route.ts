import { NextRequest } from 'next/server';
import { requireAuth, requireRole } from '@/lib/auth/middleware';
import { resolveUserId } from '@/lib/auth/resolve-user';
import { handleApiError } from '@/lib/api/error-handler';
import { successResponse, paginatedResponse } from '@/lib/api/response';
import { paginationSchema } from '@/lib/validations/common';
import { createFeeSchema } from '@/lib/validations/payments';
import { createFee, listFees, getPaymentSummary } from '@/lib/services/payments';

export async function GET(req: NextRequest) {
  try {
    const session = await requireAuth();
    const userId = await resolveUserId(session);
    if (req.nextUrl.searchParams.get('summary') === 'true') return successResponse(await getPaymentSummary(userId));
    const params = paginationSchema.parse(Object.fromEntries(req.nextUrl.searchParams));
    const result = await listFees({ studentUserId: req.nextUrl.searchParams.get('mine') === 'true' ? userId : undefined, page: params.page, limit: params.limit });
    return paginatedResponse(result.data, result.total, params.page, params.limit);
  } catch (err) { return handleApiError(err); }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth();
    requireRole(session, ['SUPERINTENDENT', 'TRUSTEE', 'ACCOUNTS']);
    const body = createFeeSchema.parse(await req.json());
    return successResponse(await createFee(body), 201);
  } catch (err) { return handleApiError(err); }
}

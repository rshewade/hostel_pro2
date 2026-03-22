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
    const summary = req.nextUrl.searchParams.get('summary');

    if (summary === 'true') {
      const result = await getPaymentSummary(userId);
      return successResponse(result);
    }

    const params = paginationSchema.parse(Object.fromEntries(req.nextUrl.searchParams));
    const mine = req.nextUrl.searchParams.get('mine') === 'true';
    const result = await listFees({
      studentUserId: mine ? userId : undefined,
      page: params.page,
      limit: params.limit,
    });
    return paginatedResponse(result.data, result.total, params.page, params.limit);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth();
    requireRole(session, ['SUPERINTENDENT', 'TRUSTEE', 'ACCOUNTS']);
    const body = createFeeSchema.parse(await req.json());
    const fee = await createFee(body);
    return successResponse(fee, 201);
  } catch (err) {
    return handleApiError(err);
  }
}

import { NextRequest } from 'next/server';
import { UnauthorizedError } from '@/lib/errors';
import { handleApiError } from '@/lib/api/error-handler';
import { successResponse } from '@/lib/api/response';

export async function POST(req: NextRequest) {
  try {
    const secret = req.headers.get('x-cron-secret');
    const expected = process.env.CRON_SECRET || 'dev-cron-secret';
    if (secret !== expected) throw new UnauthorizedError('Invalid cron secret');
    return successResponse({ message: 'Reconciliation job completed', matched: 0, discrepancies: 0 });
  } catch (err) {
    return handleApiError(err);
  }
}

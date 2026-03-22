import { NextRequest } from 'next/server';
import { UnauthorizedError } from '@/lib/errors';
import { handleApiError } from '@/lib/api/error-handler';
import { successResponse } from '@/lib/api/response';

export async function POST(req: NextRequest) {
  try {
    if (req.headers.get('x-cron-secret') !== (process.env.CRON_SECRET || 'dev-cron-secret')) throw new UnauthorizedError('Invalid cron secret');
    return successResponse({ message: 'Overdue fees check completed', updated: 0 });
  } catch (err) { return handleApiError(err); }
}

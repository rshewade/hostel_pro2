import { NextRequest } from 'next/server';
import { handleApiError } from '@/lib/api/error-handler';
import { successResponse } from '@/lib/api/response';
import { getApplicationByTracking } from '@/lib/services/applications';

/**
 * GET /api/applications/track/[trackingNumber] — Public tracking
 * No requireAuth — public endpoint
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ trackingNumber: string }> }
) {
  try {
    const { trackingNumber } = await params;
    const mobile = req.nextUrl.searchParams.get('mobile') || '';
    const application = await getApplicationByTracking(trackingNumber, mobile);
    return successResponse(application);
  } catch (err) {
    return handleApiError(err);
  }
}

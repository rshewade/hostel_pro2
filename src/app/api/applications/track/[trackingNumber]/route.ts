import { NextRequest } from 'next/server';
import { handleApiError } from '@/lib/api/error-handler';
import { successResponse } from '@/lib/api/response';
import { getApplicationByTracking } from '@/lib/services/applications';

export async function GET(req: NextRequest, { params }: { params: Promise<{ trackingNumber: string }> }) {
  try {
    const { trackingNumber } = await params;
    const mobile = req.nextUrl.searchParams.get('mobile') || '';
    return successResponse(await getApplicationByTracking(trackingNumber, mobile));
  } catch (err) { return handleApiError(err); }
}

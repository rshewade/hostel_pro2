import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth/middleware';
import { handleApiError } from '@/lib/api/error-handler';
import { successResponse } from '@/lib/api/response';
import { markAsRead } from '@/lib/services/notifications';

export async function PATCH(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth();
    const { id } = await params;
    const notification = await markAsRead(id);
    return successResponse(notification);
  } catch (err) {
    return handleApiError(err);
  }
}

import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth/middleware';
import { handleApiError } from '@/lib/api/error-handler';
import { successResponse } from '@/lib/api/response';
import { markAsRead } from '@/lib/services/notifications';

export async function PATCH(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAuth();
    const { id } = await params;
    return successResponse(await markAsRead(id));
  } catch (err) { return handleApiError(err); }
}

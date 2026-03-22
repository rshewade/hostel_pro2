import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth/middleware';
import { handleApiError } from '@/lib/api/error-handler';
import { successResponse } from '@/lib/api/response';
import { updateApplicationSchema } from '@/lib/validations/applications';
import { getApplicationById, updateApplication } from '@/lib/services/applications';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth();
    const { id } = await params;
    const application = await getApplicationById(id);
    return successResponse(application);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth();
    const { id } = await params;
    const body = updateApplicationSchema.parse(await req.json());
    const application = await updateApplication(id, body);
    return successResponse(application);
  } catch (err) {
    return handleApiError(err);
  }
}

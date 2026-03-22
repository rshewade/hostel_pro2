import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth/middleware';
import { resolveUserId } from '@/lib/auth/resolve-user';
import { handleApiError } from '@/lib/api/error-handler';
import { successResponse } from '@/lib/api/response';
import { updateProfileSchema } from '@/lib/validations/users';
import { getUserById, updateUserProfile } from '@/lib/services/users';

export async function GET() {
  try {
    const session = await requireAuth();
    const userId = await resolveUserId(session);
    const user = await getUserById(userId);
    return successResponse(user);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await requireAuth();
    const userId = await resolveUserId(session);
    const body = updateProfileSchema.parse(await req.json());
    const user = await updateUserProfile(userId, body);
    return successResponse(user);
  } catch (err) {
    return handleApiError(err);
  }
}

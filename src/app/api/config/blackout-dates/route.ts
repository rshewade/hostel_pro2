import { NextRequest } from 'next/server';
import { z } from 'zod';
import { requireAuth, requireRole } from '@/lib/auth/middleware';
import { handleApiError } from '@/lib/api/error-handler';
import { successResponse } from '@/lib/api/response';
import { listBlackoutDates, createBlackoutDate, updateBlackoutDate, deleteBlackoutDate } from '@/lib/services/config';

export async function GET() {
  try { await requireAuth(); return successResponse(await listBlackoutDates()); } catch (err) { return handleApiError(err); }
}
export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth(); requireRole(session, ['SUPERINTENDENT', 'TRUSTEE']);
    return successResponse(await createBlackoutDate(z.object({ name: z.string(), startDate: z.string(), endDate: z.string(), verticals: z.array(z.string()).optional(), reason: z.string().optional() }).parse(await req.json())), 201);
  } catch (err) { return handleApiError(err); }
}
export async function PUT(req: NextRequest) {
  try {
    const session = await requireAuth(); requireRole(session, ['SUPERINTENDENT', 'TRUSTEE']);
    const { id, ...data } = z.object({ id: z.string().uuid(), name: z.string().optional(), startDate: z.string().optional(), endDate: z.string().optional() }).parse(await req.json());
    return successResponse(await updateBlackoutDate(id, data));
  } catch (err) { return handleApiError(err); }
}
export async function DELETE(req: NextRequest) {
  try {
    const session = await requireAuth(); requireRole(session, ['SUPERINTENDENT', 'TRUSTEE']);
    return successResponse(await deleteBlackoutDate(z.object({ id: z.string().uuid() }).parse(await req.json()).id));
  } catch (err) { return handleApiError(err); }
}

import { NextRequest } from 'next/server';
import { z } from 'zod';
import { requireAuth, requireRole } from '@/lib/auth/middleware';
import { handleApiError } from '@/lib/api/error-handler';
import { successResponse } from '@/lib/api/response';
import { listBlackoutDates, createBlackoutDate, updateBlackoutDate, deleteBlackoutDate } from '@/lib/services/config';

const createSchema = z.object({ name: z.string().min(1), startDate: z.string(), endDate: z.string(), verticals: z.array(z.string()).optional(), reason: z.string().optional() });
const updateSchema = z.object({ id: z.string().uuid(), name: z.string().optional(), startDate: z.string().optional(), endDate: z.string().optional(), verticals: z.array(z.string()).optional(), reason: z.string().optional() });
const deleteSchema = z.object({ id: z.string().uuid() });

export async function GET() {
  try { await requireAuth(); return successResponse(await listBlackoutDates()); } catch (err) { return handleApiError(err); }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth(); requireRole(session, ['SUPERINTENDENT', 'TRUSTEE']);
    return successResponse(await createBlackoutDate(createSchema.parse(await req.json())), 201);
  } catch (err) { return handleApiError(err); }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await requireAuth(); requireRole(session, ['SUPERINTENDENT', 'TRUSTEE']);
    const { id, ...data } = updateSchema.parse(await req.json());
    return successResponse(await updateBlackoutDate(id, data));
  } catch (err) { return handleApiError(err); }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await requireAuth(); requireRole(session, ['SUPERINTENDENT', 'TRUSTEE']);
    return successResponse(await deleteBlackoutDate(deleteSchema.parse(await req.json()).id));
  } catch (err) { return handleApiError(err); }
}

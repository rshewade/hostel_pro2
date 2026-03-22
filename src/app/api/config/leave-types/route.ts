import { NextRequest } from 'next/server';
import { z } from 'zod';
import { requireAuth, requireRole } from '@/lib/auth/middleware';
import { handleApiError } from '@/lib/api/error-handler';
import { successResponse } from '@/lib/api/response';
import { listLeaveTypes, createLeaveType, updateLeaveType, deleteLeaveType } from '@/lib/services/config';

export async function GET() {
  try { await requireAuth(); return successResponse(await listLeaveTypes()); } catch (err) { return handleApiError(err); }
}
export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth(); requireRole(session, ['SUPERINTENDENT', 'TRUSTEE']);
    return successResponse(await createLeaveType(z.object({ name: z.string().min(1), maxDays: z.number().optional(), requiresApproval: z.boolean().optional() }).parse(await req.json())), 201);
  } catch (err) { return handleApiError(err); }
}
export async function PUT(req: NextRequest) {
  try {
    const session = await requireAuth(); requireRole(session, ['SUPERINTENDENT', 'TRUSTEE']);
    const { id, ...data } = z.object({ id: z.string().uuid(), name: z.string().optional(), maxDays: z.number().optional(), isActive: z.boolean().optional() }).parse(await req.json());
    return successResponse(await updateLeaveType(id, data));
  } catch (err) { return handleApiError(err); }
}
export async function DELETE(req: NextRequest) {
  try {
    const session = await requireAuth(); requireRole(session, ['SUPERINTENDENT', 'TRUSTEE']);
    const { id } = z.object({ id: z.string().uuid() }).parse(await req.json());
    return successResponse(await deleteLeaveType(id));
  } catch (err) { return handleApiError(err); }
}

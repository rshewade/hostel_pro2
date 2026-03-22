import { NextRequest } from 'next/server';
import { z } from 'zod';
import { requireAuth, requireRole } from '@/lib/auth/middleware';
import { handleApiError } from '@/lib/api/error-handler';
import { successResponse } from '@/lib/api/response';
import { listLeaveTypes, createLeaveType, updateLeaveType, deleteLeaveType } from '@/lib/services/config';

const createSchema = z.object({ name: z.string().min(1), maxDays: z.number().int().optional(), requiresApproval: z.boolean().optional() });
const updateSchema = z.object({ id: z.string().uuid(), name: z.string().min(1).optional(), maxDays: z.number().int().optional(), requiresApproval: z.boolean().optional(), isActive: z.boolean().optional() });
const deleteSchema = z.object({ id: z.string().uuid() });

export async function GET() {
  try { await requireAuth(); return successResponse(await listLeaveTypes()); } catch (err) { return handleApiError(err); }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth(); requireRole(session, ['SUPERINTENDENT', 'TRUSTEE']);
    const body = createSchema.parse(await req.json());
    return successResponse(await createLeaveType(body), 201);
  } catch (err) { return handleApiError(err); }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await requireAuth(); requireRole(session, ['SUPERINTENDENT', 'TRUSTEE']);
    const { id, ...data } = updateSchema.parse(await req.json());
    return successResponse(await updateLeaveType(id, data));
  } catch (err) { return handleApiError(err); }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await requireAuth(); requireRole(session, ['SUPERINTENDENT', 'TRUSTEE']);
    const { id } = deleteSchema.parse(await req.json());
    return successResponse(await deleteLeaveType(id));
  } catch (err) { return handleApiError(err); }
}

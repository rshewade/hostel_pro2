import { db } from '@/lib/db';
import { applications, users } from '@/lib/db/schema';
import { eq, and, ne, desc, sql } from 'drizzle-orm';
import { NotFoundError, ConflictError } from '@/lib/errors';
import { logger } from '@/lib/logger';
import type { CreateApplicationInput, UpdateApplicationInput, UpdateStatusInput } from '@/lib/validations/applications';

export async function checkDuplicateEmail(email: string): Promise<void> {
  const [existingUser] = await db.select({ id: users.id }).from(users).where(eq(users.email, email));
  if (existingUser) throw new ConflictError('An account with this email already exists. Please log in instead.');

  const [existingApp] = await db.select({ id: applications.id }).from(applications)
    .where(and(eq(applications.applicantEmail, email), ne(applications.currentStatus, 'REJECTED'), ne(applications.currentStatus, 'ARCHIVED')));
  if (existingApp) throw new ConflictError('An application with this email is already in progress.');
}

export async function createApplication(data: CreateApplicationInput) {
  await checkDuplicateEmail(data.applicantEmail);
  const [app] = await db.insert(applications).values({
    applicantName: data.applicantName,
    applicantMobile: data.applicantMobile,
    applicantEmail: data.applicantEmail,
    dateOfBirth: data.dateOfBirth,
    gender: data.gender,
    vertical: data.vertical,
    type: data.type || 'NEW',
    currentStatus: 'SUBMITTED',
    submittedAt: new Date(),
    data: data.data,
  }).returning();
  return app;
}

export async function getApplicationById(id: string) {
  const [app] = await db.select().from(applications).where(eq(applications.id, id));
  if (!app) throw new NotFoundError('Application not found');
  return app;
}

export async function getApplicationByTracking(trackingNumber: string, mobile: string) {
  const [app] = await db.select().from(applications)
    .where(and(eq(applications.trackingNumber, trackingNumber), eq(applications.applicantMobile, mobile)));
  if (!app) throw new NotFoundError('Application not found');
  return app;
}

export async function updateApplication(id: string, data: UpdateApplicationInput) {
  const [app] = await db.update(applications).set(data).where(eq(applications.id, id)).returning();
  if (!app) throw new NotFoundError('Application not found');
  return app;
}

export async function updateApplicationStatus(id: string, data: UpdateStatusInput, actorId: string) {
  const updateData: Record<string, unknown> = { currentStatus: data.status };
  if (data.status === 'APPROVED') updateData.approvedBy = actorId;
  if (data.status === 'REJECTED') { updateData.rejectedBy = actorId; updateData.rejectionReason = data.rejectionReason; }

  const [app] = await db.update(applications).set(updateData).where(eq(applications.id, id)).returning();
  if (!app) throw new NotFoundError('Application not found');

  if (data.status === 'APPROVED') {
    try { await createStudentAccount(app); } catch (err) {
      logger.error('Failed to create student account on approval', { applicationId: id, error: err instanceof Error ? err.message : String(err) });
    }
  }
  return app;
}

async function createStudentAccount(app: typeof applications.$inferSelect) {
  const { auth } = await import('@/lib/auth');
  const last4 = (app.trackingNumber || '').slice(-4);
  const dob = app.dateOfBirth;
  const ddmm = dob ? `${dob.slice(8, 10)}${dob.slice(5, 7)}` : '0101';
  const tempPassword = `HP${last4}#${ddmm}`;

  const authUser = await auth.api.signUpEmail({
    body: { email: app.applicantEmail, password: tempPassword, name: app.applicantName },
  });
  if (!authUser?.user?.id) { logger.error('Failed to create auth user'); return; }

  const { createUserProfile } = await import('./users');
  const appUser = await createUserProfile({
    betterAuthUserId: authUser.user.id, role: 'STUDENT', vertical: app.vertical,
    fullName: app.applicantName, email: app.applicantEmail, mobile: app.applicantMobile,
  });

  await db.update(applications).set({ studentUserId: appUser.id }).where(eq(applications.id, app.id));
  logger.info('Student account created on approval', { applicationId: app.id, studentUserId: appUser.id });
}

export async function listApplications(options: { userId?: string; userRole?: string; vertical?: string; status?: string; page?: number; limit?: number }) {
  const { page = 1, limit = 20 } = options;
  const conditions = [];
  if (options.userRole === 'STUDENT' && options.userId) conditions.push(eq(applications.studentUserId, options.userId));
  if (options.vertical) conditions.push(eq(applications.vertical, options.vertical as any));
  if (options.status) conditions.push(eq(applications.currentStatus, options.status as any));

  const where = conditions.length > 0 ? and(...conditions) : undefined;
  const data = await db.select().from(applications).where(where).orderBy(desc(applications.createdAt)).limit(limit).offset((page - 1) * limit);
  const [countResult] = await db.select({ count: sql<number>`count(*)` }).from(applications).where(where);
  return { data, total: Number(countResult.count) };
}

export async function getApplicationStats(_userRole?: string, userVertical?: string) {
  const conditions = [];
  if (userVertical) conditions.push(eq(applications.vertical, userVertical as any));
  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const result = await db.select({ status: applications.currentStatus, count: sql<number>`count(*)` })
    .from(applications).where(where).groupBy(applications.currentStatus);
  const stats: Record<string, number> = {};
  for (const row of result) stats[row.status] = Number(row.count);
  return stats;
}

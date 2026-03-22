import { db } from '@/lib/db';
import { applications, users } from '@/lib/db/schema';
import { eq, and, desc, sql, ne } from 'drizzle-orm';
import { NotFoundError, ConflictError } from '@/lib/errors';
import { logger } from '@/lib/logger';
import type { CreateApplicationInput, UpdateApplicationInput, UpdateStatusInput } from '@/lib/validations/applications';

/**
 * Check for duplicate email before creating application (CHANGE-4).
 */
export async function checkDuplicateEmail(email: string): Promise<void> {
  // Check if email already belongs to a registered user
  const [existingUser] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email));

  if (existingUser) {
    throw new ConflictError(
      'An account with this email already exists. Please log in instead.'
    );
  }

  // Check if email has a non-rejected/non-archived application in progress
  const [existingApp] = await db
    .select({ id: applications.id })
    .from(applications)
    .where(
      and(
        eq(applications.applicantEmail, email),
        ne(applications.currentStatus, 'REJECTED'),
        ne(applications.currentStatus, 'ARCHIVED')
      )
    );

  if (existingApp) {
    throw new ConflictError(
      'An application with this email is already in progress. Use the tracking page to check status.'
    );
  }
}

/**
 * Create a new application. Status defaults to SUBMITTED (CHANGE-6).
 * Email is required (CHANGE-3). Duplicate check runs first (CHANGE-4).
 */
export async function createApplication(data: CreateApplicationInput) {
  // Check for duplicate email
  await checkDuplicateEmail(data.applicantEmail);

  const [application] = await db
    .insert(applications)
    .values({
      applicantName: data.applicantName,
      applicantMobile: data.applicantMobile,
      applicantEmail: data.applicantEmail,
      dateOfBirth: data.dateOfBirth,
      gender: data.gender,
      vertical: data.vertical,
      type: data.type || 'NEW',
      currentStatus: 'SUBMITTED', // Default SUBMITTED, not DRAFT (CHANGE-6)
      submittedAt: new Date(),
      data: data.data,
    })
    .returning();

  return application;
}

/**
 * Get application by ID.
 */
export async function getApplicationById(id: string) {
  const [application] = await db
    .select()
    .from(applications)
    .where(eq(applications.id, id));

  if (!application) throw new NotFoundError('Application not found');
  return application;
}

/**
 * Get application by tracking number and mobile (for public tracking).
 */
export async function getApplicationByTracking(trackingNumber: string, mobile: string) {
  const [application] = await db
    .select()
    .from(applications)
    .where(
      and(
        eq(applications.trackingNumber, trackingNumber),
        eq(applications.applicantMobile, mobile)
      )
    );

  if (!application) throw new NotFoundError('Application not found');
  return application;
}

/**
 * Update application details (non-status fields).
 */
export async function updateApplication(id: string, data: UpdateApplicationInput) {
  const [application] = await db
    .update(applications)
    .set(data)
    .where(eq(applications.id, id))
    .returning();

  if (!application) throw new NotFoundError('Application not found');
  return application;
}

/**
 * Update application status. Triggers DB validation for valid transitions.
 * On APPROVED: auto-creates student account (CHANGE-1).
 */
export async function updateApplicationStatus(
  id: string,
  data: UpdateStatusInput,
  actorId: string
) {
  const updateData: Record<string, unknown> = {
    currentStatus: data.status,
  };

  if (data.status === 'APPROVED') {
    updateData.approvedBy = actorId;
  }
  if (data.status === 'REJECTED') {
    updateData.rejectedBy = actorId;
    updateData.rejectionReason = data.rejectionReason;
  }

  const [application] = await db
    .update(applications)
    .set(updateData)
    .where(eq(applications.id, id))
    .returning();

  if (!application) throw new NotFoundError('Application not found');

  // Auto-create student account on approval (CHANGE-1)
  if (data.status === 'APPROVED') {
    try {
      await createStudentAccount(application);
    } catch (err) {
      logger.error('Failed to auto-create student account', {
        applicationId: id,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  return application;
}

/**
 * Auto-create student account on application approval (CHANGE-1/2).
 * Temp password: HP<last4tracking>#<DDMM_DOB>
 */
async function createStudentAccount(application: typeof applications.$inferSelect) {
  const { auth } = await import('@/lib/auth');
  const trackingNumber = application.trackingNumber || '';
  const last4 = trackingNumber.slice(-4);
  const dob = application.dateOfBirth;
  const ddmm = dob ? `${dob.slice(8, 10)}${dob.slice(5, 7)}` : '0101';
  const tempPassword = `HP${last4}#${ddmm}`;

  // Create Better Auth user
  const authUser = await auth.api.signUpEmail({
    body: {
      email: application.applicantEmail,
      password: tempPassword,
      name: application.applicantName,
    },
  });

  if (!authUser?.user?.id) {
    logger.error('Failed to create Better Auth user for approved application');
    return;
  }

  // Create app user profile
  const { createUserProfile } = await import('./users');
  const appUser = await createUserProfile({
    betterAuthUserId: authUser.user.id,
    role: 'STUDENT',
    vertical: application.vertical,
    fullName: application.applicantName,
    email: application.applicantEmail,
    mobile: application.applicantMobile,
  });

  // Link application to new student user
  await db
    .update(applications)
    .set({ studentUserId: appUser.id })
    .where(eq(applications.id, application.id));

  logger.info('Student account created on approval', {
    applicationId: application.id,
    studentUserId: appUser.id,
    email: application.applicantEmail,
  });
}

/**
 * List applications with filters and pagination.
 */
export async function listApplications(options: {
  userId?: string;
  userRole?: string;
  vertical?: string;
  status?: string;
  page?: number;
  limit?: number;
}) {
  const { page = 1, limit = 20 } = options;
  const offset = (page - 1) * limit;

  const conditions = [];

  // Students see only their own applications
  if (options.userRole === 'STUDENT' && options.userId) {
    conditions.push(eq(applications.studentUserId, options.userId));
  }

  // Filter by vertical for superintendents
  if (options.vertical) {
    conditions.push(eq(applications.vertical, options.vertical as any));
  }

  // Filter by status
  if (options.status) {
    conditions.push(eq(applications.currentStatus, options.status as any));
  }

  let query = db.select().from(applications);
  if (conditions.length > 0) {
    query = query.where(and(...conditions)) as any;
  }

  const data = await (query as any)
    .orderBy(desc(applications.createdAt))
    .limit(limit)
    .offset(offset);

  const [countResult] = await db
    .select({ count: sql<number>`count(*)` })
    .from(applications)
    .where(conditions.length > 0 ? and(...conditions) : undefined);

  return { data, total: Number(countResult.count) };
}

/**
 * Get application statistics for dashboard.
 */
export async function getApplicationStats(userRole?: string, userVertical?: string) {
  const conditions = [];
  if (userVertical) {
    conditions.push(eq(applications.vertical, userVertical as any));
  }

  const result = await db
    .select({
      status: applications.currentStatus,
      count: sql<number>`count(*)`,
    })
    .from(applications)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .groupBy(applications.currentStatus);

  const stats: Record<string, number> = {};
  for (const row of result) {
    stats[row.status] = Number(row.count);
  }
  return stats;
}

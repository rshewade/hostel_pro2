import { pgTable, uuid, text, date, timestamp, jsonb, index } from 'drizzle-orm/pg-core';
import { applicationStatusEnum, applicationTypeEnum, verticalTypeEnum } from './enums';
import { users } from './users';

export const applications = pgTable('applications', {
  id: uuid('id').defaultRandom().primaryKey(),
  trackingNumber: text('tracking_number').unique(),
  type: applicationTypeEnum('type').notNull().default('NEW'),
  parentApplicationId: uuid('parent_application_id'),
  applicantName: text('applicant_name').notNull(),
  applicantMobile: text('applicant_mobile').notNull(),
  applicantEmail: text('applicant_email').notNull(), // REQUIRED (CHANGE-3)
  dateOfBirth: date('date_of_birth').notNull(),
  gender: text('gender').notNull(),
  vertical: verticalTypeEnum('vertical').notNull(),
  currentStatus: applicationStatusEnum('current_status').notNull().default('SUBMITTED'), // SUBMITTED not DRAFT (CHANGE-6)
  submittedAt: timestamp('submitted_at', { withTimezone: true }),
  reviewedAt: timestamp('reviewed_at', { withTimezone: true }),
  interviewScheduledAt: timestamp('interview_scheduled_at', { withTimezone: true }),
  interviewCompletedAt: timestamp('interview_completed_at', { withTimezone: true }),
  approvedAt: timestamp('approved_at', { withTimezone: true }),
  rejectedAt: timestamp('rejected_at', { withTimezone: true }),
  approvedBy: uuid('approved_by').references(() => users.id),
  rejectedBy: uuid('rejected_by').references(() => users.id),
  rejectionReason: text('rejection_reason'),
  studentUserId: uuid('student_user_id').references(() => users.id),
  data: jsonb('data'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index('idx_applications_tracking_number').on(table.trackingNumber),
  index('idx_applications_applicant_mobile').on(table.applicantMobile),
  index('idx_applications_vertical').on(table.vertical),
  index('idx_applications_current_status').on(table.currentStatus),
  index('idx_applications_student_user_id').on(table.studentUserId),
]);

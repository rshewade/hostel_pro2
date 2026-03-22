import { pgTable, uuid, text, bigint, timestamp, jsonb, index } from 'drizzle-orm/pg-core';
import { documentStatusEnum, documentTypeEnum } from './enums';
import { users } from './users';
import { applications } from './applications';

export const documents = pgTable('documents', {
  id: uuid('id').defaultRandom().primaryKey(),
  applicationId: uuid('application_id').references(() => applications.id),
  studentUserId: uuid('student_user_id').references(() => users.id),
  documentType: documentTypeEnum('document_type').notNull(),
  bucketId: text('bucket_id').notNull(),
  storagePath: text('storage_path'),
  storageUrl: text('storage_url'),
  fileName: text('file_name').notNull(),
  fileSize: bigint('file_size', { mode: 'number' }),
  mimeType: text('mime_type'),
  status: documentStatusEnum('status').notNull().default('UPLOADED'),
  verifiedAt: timestamp('verified_at', { withTimezone: true }),
  verifiedBy: uuid('verified_by').references(() => users.id),
  uploadedBy: uuid('uploaded_by').notNull().references(() => users.id),
  thumbnailUrl: text('thumbnail_url'),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index('idx_documents_application_id').on(table.applicationId),
  index('idx_documents_student_user_id').on(table.studentUserId),
  index('idx_documents_document_type').on(table.documentType),
  index('idx_documents_status').on(table.status),
  index('idx_documents_bucket_id').on(table.bucketId),
]);

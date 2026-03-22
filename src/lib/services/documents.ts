import { db } from '@/lib/db';
import { documents } from '@/lib/db/schema';
import { eq, and, desc, sql } from 'drizzle-orm';
import { NotFoundError } from '@/lib/errors';

export async function createDocument(data: {
  applicationId?: string;
  studentUserId?: string;
  documentType: string;
  bucketId: string;
  storagePath?: string;
  fileName: string;
  fileSize?: number;
  mimeType?: string;
  uploadedBy: string;
}) {
  const [doc] = await db.insert(documents).values({
    applicationId: data.applicationId,
    studentUserId: data.studentUserId,
    documentType: data.documentType as any,
    bucketId: data.bucketId,
    storagePath: data.storagePath,
    fileName: data.fileName,
    fileSize: data.fileSize,
    mimeType: data.mimeType,
    uploadedBy: data.uploadedBy,
    status: 'UPLOADED',
  }).returning();
  return doc;
}

export async function getDocumentById(id: string) {
  const [doc] = await db.select().from(documents).where(eq(documents.id, id));
  if (!doc) throw new NotFoundError('Document not found');
  return doc;
}

export async function listDocuments(options: { applicationId?: string; studentUserId?: string; page?: number; limit?: number }) {
  const { page = 1, limit = 20 } = options;
  const conditions = [];
  if (options.applicationId) conditions.push(eq(documents.applicationId, options.applicationId));
  if (options.studentUserId) conditions.push(eq(documents.studentUserId, options.studentUserId));

  const data = await db.select().from(documents)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(documents.createdAt))
    .limit(limit).offset((page - 1) * limit);

  const [countResult] = await db.select({ count: sql<number>`count(*)` }).from(documents)
    .where(conditions.length > 0 ? and(...conditions) : undefined);

  return { data, total: Number(countResult.count) };
}

export async function verifyDocument(id: string, status: 'VERIFIED' | 'REJECTED', verifiedBy: string, rejectionReason?: string) {
  const [doc] = await db.update(documents).set({
    status: status as any,
    verifiedAt: new Date(),
    verifiedBy,
  }).where(eq(documents.id, id)).returning();
  if (!doc) throw new NotFoundError('Document not found');
  return doc;
}

export async function deleteDocument(id: string) {
  const [doc] = await db.delete(documents).where(eq(documents.id, id)).returning();
  if (!doc) throw new NotFoundError('Document not found');
  return doc;
}

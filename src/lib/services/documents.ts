import { db } from '@/lib/db';
import { documents } from '@/lib/db/schema';
import { eq, and, desc, sql } from 'drizzle-orm';
import { NotFoundError } from '@/lib/errors';

export async function createDocument(data: { applicationId?: string; studentUserId?: string; documentType: string; bucketId: string; storagePath?: string; fileName: string; fileSize?: number; mimeType?: string; uploadedBy: string }) {
  const [doc] = await db.insert(documents).values({ ...data, documentType: data.documentType as any, status: 'UPLOADED' }).returning();
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
  const where = conditions.length > 0 ? and(...conditions) : undefined;
  const data = await db.select().from(documents).where(where).orderBy(desc(documents.createdAt)).limit(limit).offset((page - 1) * limit);
  const [c] = await db.select({ count: sql<number>`count(*)` }).from(documents).where(where);
  return { data, total: Number(c.count) };
}

export async function verifyDocument(id: string, status: 'VERIFIED' | 'REJECTED', verifiedBy: string) {
  const [doc] = await db.update(documents).set({ status: status as any, verifiedAt: new Date(), verifiedBy }).where(eq(documents.id, id)).returning();
  if (!doc) throw new NotFoundError('Document not found');
  return doc;
}

export async function deleteDocument(id: string) {
  const [doc] = await db.delete(documents).where(eq(documents.id, id)).returning();
  if (!doc) throw new NotFoundError('Document not found');
  return doc;
}

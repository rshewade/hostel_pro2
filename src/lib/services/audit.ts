import { db } from '@/lib/db';
import { auditLogs } from '@/lib/db/schema';
import { eq, and, desc, sql } from 'drizzle-orm';

export async function createAuditLog(data: {
  entityType: string;
  action: string;
  entityId?: string;
  actorId?: string;
  actorRole?: string;
  actorEmail?: string;
  ipAddress?: string;
  userAgent?: string;
  oldValues?: Record<string, unknown>;
  newValues?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}) {
  const [log] = await db.insert(auditLogs).values(data).returning();
  return log;
}

/**
 * Query audit logs by entity. Filters on BOTH entityType AND entityId.
 * (Prevents audit bug from previous build where entityType was ignored)
 */
export async function getAuditLogsByEntity(entityType: string, entityId: string, limit = 100) {
  return db.select().from(auditLogs)
    .where(and(eq(auditLogs.entityType, entityType), eq(auditLogs.entityId, entityId)))
    .orderBy(desc(auditLogs.createdAt))
    .limit(limit);
}

export async function getAuditLogsByActor(actorId: string, limit = 100) {
  return db.select().from(auditLogs)
    .where(eq(auditLogs.actorId, actorId))
    .orderBy(desc(auditLogs.createdAt))
    .limit(limit);
}

export async function queryAuditLogs(options: {
  entityType?: string;
  actorId?: string;
  action?: string;
  page?: number;
  limit?: number;
}) {
  const { page = 1, limit = 50 } = options;
  const conditions = [];
  if (options.entityType) conditions.push(eq(auditLogs.entityType, options.entityType));
  if (options.actorId) conditions.push(eq(auditLogs.actorId, options.actorId));
  if (options.action) conditions.push(eq(auditLogs.action, options.action));

  const data = await db.select().from(auditLogs)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(auditLogs.createdAt))
    .limit(limit).offset((page - 1) * limit);

  const [countResult] = await db.select({ count: sql<number>`count(*)` }).from(auditLogs)
    .where(conditions.length > 0 ? and(...conditions) : undefined);

  return { data, total: Number(countResult.count) };
}

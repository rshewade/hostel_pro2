import { describe, it, expect } from 'vitest';
import * as fs from 'fs';

describe('AuditService — source code verification', () => {
  it('getAuditLogsByEntity filters on BOTH entityType AND entityId (audit bug fix)', () => {
    const source = fs.readFileSync('src/lib/services/audit.ts', 'utf8');
    // Must use and() with both params — not just entityId
    expect(source).toContain('and(eq(auditLogs.entityType, entityType), eq(auditLogs.entityId, entityId))');
  });
});

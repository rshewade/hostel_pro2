/**
 * Test data factories — creates real records in the test database.
 * Each factory accepts overrides for customization and returns the created record.
 * Used by integration tests — never by unit tests (which don't touch the DB).
 */

// Factories will be populated as schemas are created in Phase 1.
// Skeleton for now to satisfy imports.

let counter = 0;
export function uniqueId(): string {
  counter++;
  return `test-${counter}-${Date.now()}`;
}

export function uniqueEmail(): string {
  return `test-${uniqueId()}@test.com`;
}

export function uniquePhone(): string {
  const num = String(counter).padStart(10, '0');
  return `+91${num}`;
}

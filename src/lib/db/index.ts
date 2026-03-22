import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

function createDb() {
  const connectionString = process.env.DATABASE_URL!;
  const client = postgres(connectionString, {
    max: 10,
    idle_timeout: 30,
  });
  return drizzle(client);
}

// globalThis caching prevents connection pool exhaustion during Next.js hot reloads (BUG-009)
const globalForDb = globalThis as unknown as {
  db: ReturnType<typeof createDb>;
};

export const db = globalForDb.db ?? createDb();

if (process.env.NODE_ENV !== 'production') {
  globalForDb.db = db;
}

import { betterAuth } from 'better-auth';
import { Pool } from 'pg';
import { phoneNumber, admin, username } from 'better-auth/plugins';

// globalThis-cached pg.Pool to prevent connection exhaustion (BUG-009)
const globalForPool = globalThis as unknown as { authPool: Pool };
const pool =
  globalForPool.authPool ??
  new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 5,
    idleTimeoutMillis: 30000,
  });
if (process.env.NODE_ENV !== 'production') {
  globalForPool.authPool = pool;
}

export const auth = betterAuth({
  database: pool,
  emailAndPassword: {
    enabled: true,
  },
  trustedOrigins: [
    'http://localhost:3005',
    'http://localhost:3001',
    'http://localhost:3002',
    'http://51.68.196.242:3005',
    process.env.BETTER_AUTH_URL || '',
    process.env.EXTERNAL_URL || '',
  ].filter(Boolean),
  plugins: [
    phoneNumber({
      sendOTP: async ({ phoneNumber: phone, code }) => {
        // Delegate to SMS provider (mock or live)
        const { getSmsProvider } = await import('@/lib/sms');
        const provider = getSmsProvider();
        await provider.sendOtp(phone, code);
      },
    }),
    username(),
    admin(),
  ],
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
  },
});

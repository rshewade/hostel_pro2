function required(key: string): string {
  const val = process.env[key];
  if (!val) throw new Error(`Missing required env var: ${key}`);
  return val;
}

function optional(key: string, fallback: string): string {
  return process.env[key] || fallback;
}

export const env = {
  DATABASE_URL: required('DATABASE_URL'),
  BETTER_AUTH_SECRET: required('BETTER_AUTH_SECRET'),
  BETTER_AUTH_URL: required('BETTER_AUTH_URL'),
  EXTERNAL_URL: optional('EXTERNAL_URL', 'http://51.68.196.242:3005'),
  ENCRYPTION_KEY: optional('ENCRYPTION_KEY', ''),
  HASH_SALT: optional('HASH_SALT', 'dev-salt'),
  UPLOAD_DIR: optional('UPLOAD_DIR', './uploads'),
  SIGNED_URL_SECRET: optional('SIGNED_URL_SECRET', 'dev-signed-url-secret'),
  SMS_MODE: optional('SMS_MODE', 'mock') as 'mock' | 'live',
  RAZORPAY_MODE: optional('RAZORPAY_MODE', 'mock') as 'mock' | 'live',
  NOTIFICATION_MODE: optional('NOTIFICATION_MODE', 'mock') as 'mock' | 'live',
  EMAIL_PROVIDER: optional('EMAIL_PROVIDER', 'console') as 'console' | 'resend' | 'sendgrid' | 'ses',
  WHATSAPP_MODE: optional('WHATSAPP_MODE', 'mock') as 'mock' | 'live',
  EMAIL_FROM: optional('EMAIL_FROM', 'noreply@hostelpro.local'),
  CRON_SECRET: optional('CRON_SECRET', 'dev-cron-secret'),
};

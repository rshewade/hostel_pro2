import { createHmac } from 'crypto';

const DEFAULT_EXPIRY = 3600;

function getSecret(): string {
  const s = process.env.SIGNED_URL_SECRET;
  if (!s) throw new Error('SIGNED_URL_SECRET not configured');
  return s;
}

export function signUrl(filePath: string, expiresInSeconds = DEFAULT_EXPIRY): string {
  const expiresAt = Math.floor(Date.now() / 1000) + expiresInSeconds;
  const payload = `${filePath}|${expiresAt}`;
  const sig = createHmac('sha256', getSecret()).update(payload).digest('hex');
  const token = Buffer.from(`${payload}|${sig}`).toString('base64url');
  return `/api/storage/${token}`;
}

export function verifySignedUrl(token: string): { valid: boolean; filePath?: string; error?: string } {
  try {
    const decoded = Buffer.from(token, 'base64url').toString();
    const parts = decoded.split('|');
    if (parts.length !== 3) return { valid: false, error: 'Invalid token format' };
    const [filePath, expiresAtStr, sig] = parts;
    if (Date.now() / 1000 > parseInt(expiresAtStr, 10)) return { valid: false, error: 'Token expired' };
    const expected = createHmac('sha256', getSecret()).update(`${filePath}|${expiresAtStr}`).digest('hex');
    if (sig !== expected) return { valid: false, error: 'Invalid signature' };
    return { valid: true, filePath };
  } catch { return { valid: false, error: 'Token verification failed' }; }
}

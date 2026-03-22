import { createHmac } from 'crypto';

const DEFAULT_EXPIRY_SECONDS = 3600; // 1 hour

function getSecret(): string {
  const secret = process.env.SIGNED_URL_SECRET;
  if (!secret) throw new Error('SIGNED_URL_SECRET not configured');
  return secret;
}

/**
 * Generate a signed URL token for a file path.
 * Token format: base64url(filePath|expiresAt|signature)
 */
export function signUrl(filePath: string, expiresInSeconds = DEFAULT_EXPIRY_SECONDS): string {
  const secret = getSecret();
  const expiresAt = Math.floor(Date.now() / 1000) + expiresInSeconds;
  const payload = `${filePath}|${expiresAt}`;
  const signature = createHmac('sha256', secret).update(payload).digest('hex');
  const token = Buffer.from(`${payload}|${signature}`).toString('base64url');
  return `/api/storage/${token}`;
}

/**
 * Verify a signed URL token and return the file path if valid.
 */
export function verifySignedUrl(token: string): { valid: boolean; filePath?: string; error?: string } {
  try {
    const secret = getSecret();
    const decoded = Buffer.from(token, 'base64url').toString();
    const parts = decoded.split('|');

    if (parts.length !== 3) {
      return { valid: false, error: 'Invalid token format' };
    }

    const [filePath, expiresAtStr, signature] = parts;
    const expiresAt = parseInt(expiresAtStr, 10);

    // Check expiry
    if (Date.now() / 1000 > expiresAt) {
      return { valid: false, error: 'Token expired' };
    }

    // Verify signature
    const expectedSignature = createHmac('sha256', secret)
      .update(`${filePath}|${expiresAtStr}`)
      .digest('hex');

    if (signature !== expectedSignature) {
      return { valid: false, error: 'Invalid signature' };
    }

    return { valid: true, filePath };
  } catch {
    return { valid: false, error: 'Token verification failed' };
  }
}

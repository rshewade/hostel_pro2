import { createCipheriv, createDecipheriv, randomBytes, createHmac } from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;

function getKey(): Buffer {
  const key = process.env.ENCRYPTION_KEY;
  if (!key) throw new Error('ENCRYPTION_KEY not configured');
  if (key.length !== 64) throw new Error('ENCRYPTION_KEY must be 64 hex characters (256 bits)');
  return Buffer.from(key, 'hex');
}

/**
 * Check if a value is in encrypted format (iv:authTag:ciphertext).
 */
export function isEncrypted(value: string): boolean {
  if (!value || typeof value !== 'string') return false;
  const parts = value.split(':');
  if (parts.length !== 3) return false;
  // Each part should be valid base64
  return parts.every(p => /^[A-Za-z0-9+/]+=*$/.test(p) && p.length > 0);
}

/**
 * Encrypt a plaintext string using AES-256-GCM.
 * Returns: iv:authTag:ciphertext (base64-encoded)
 */
export function encrypt(plaintext: string): string {
  const key = getKey();
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(plaintext, 'utf8', 'base64');
  encrypted += cipher.final('base64');
  const authTag = cipher.getAuthTag();

  return `${iv.toString('base64')}:${authTag.toString('base64')}:${encrypted}`;
}

/**
 * Decrypt an encrypted string.
 * THROWS on non-encrypted input — never silently returns plaintext.
 * (Prevents crypto plaintext passthrough from previous build audit)
 */
export function decrypt(encrypted: string): string {
  if (!process.env.ENCRYPTION_KEY) {
    throw new Error('ENCRYPTION_KEY not configured');
  }

  if (!isEncrypted(encrypted)) {
    throw new Error('Cannot decrypt: value is not in encrypted format (expected iv:authTag:ciphertext)');
  }

  const key = getKey();
  const [ivB64, authTagB64, ciphertextB64] = encrypted.split(':');
  const iv = Buffer.from(ivB64, 'base64');
  const authTag = Buffer.from(authTagB64, 'base64');

  const decipher = createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(ciphertextB64, 'base64', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

/**
 * HMAC-SHA256 hash (one-way, for comparison).
 */
export function hash(value: string): string {
  const salt = process.env.HASH_SALT || 'default-salt';
  return createHmac('sha256', salt).update(value).digest('hex');
}

/**
 * Encrypt specific fields on an object.
 */
export function encryptFields<T extends Record<string, unknown>>(
  data: T,
  fields: (keyof T)[]
): T {
  const result = { ...data };
  for (const field of fields) {
    const value = result[field];
    if (typeof value === 'string' && value.length > 0) {
      (result as any)[field] = encrypt(value);
    }
  }
  return result;
}

/**
 * Decrypt specific fields on an object.
 */
export function decryptFields<T extends Record<string, unknown>>(
  data: T,
  fields: (keyof T)[]
): T {
  const result = { ...data };
  for (const field of fields) {
    const value = result[field];
    if (typeof value === 'string' && isEncrypted(value)) {
      (result as any)[field] = decrypt(value);
    }
  }
  return result;
}

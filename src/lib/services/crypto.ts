import { createCipheriv, createDecipheriv, randomBytes, createHmac } from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;

function getKey(): Buffer {
  const key = process.env.ENCRYPTION_KEY;
  if (!key) throw new Error('ENCRYPTION_KEY not configured');
  if (key.length !== 64) throw new Error('ENCRYPTION_KEY must be 64 hex characters (256 bits)');
  return Buffer.from(key, 'hex');
}

export function isEncrypted(value: string): boolean {
  if (!value || typeof value !== 'string') return false;
  const parts = value.split(':');
  if (parts.length !== 3) return false;
  return parts.every(p => /^[A-Za-z0-9+/]+=*$/.test(p) && p.length > 0);
}

export function encrypt(plaintext: string): string {
  const key = getKey();
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, key, iv);
  let encrypted = cipher.update(plaintext, 'utf8', 'base64');
  encrypted += cipher.final('base64');
  const authTag = cipher.getAuthTag();
  return `${iv.toString('base64')}:${authTag.toString('base64')}:${encrypted}`;
}

/** THROWS on non-encrypted input — never silently returns plaintext (audit fix) */
export function decrypt(encrypted: string): string {
  if (!process.env.ENCRYPTION_KEY) throw new Error('ENCRYPTION_KEY not configured');
  if (!isEncrypted(encrypted)) throw new Error('Cannot decrypt: value is not in encrypted format');
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

export function hash(value: string): string {
  const salt = process.env.HASH_SALT || 'default-salt';
  return createHmac('sha256', salt).update(value).digest('hex');
}

export function encryptFields<T extends Record<string, unknown>>(data: T, fields: (keyof T)[]): T {
  const result = { ...data };
  for (const field of fields) {
    const v = result[field];
    if (typeof v === 'string' && v.length > 0) (result as any)[field] = encrypt(v);
  }
  return result;
}

export function decryptFields<T extends Record<string, unknown>>(data: T, fields: (keyof T)[]): T {
  const result = { ...data };
  for (const field of fields) {
    const v = result[field];
    if (typeof v === 'string' && isEncrypted(v)) (result as any)[field] = decrypt(v);
  }
  return result;
}

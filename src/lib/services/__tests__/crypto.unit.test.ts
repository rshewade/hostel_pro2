import { describe, it, expect } from 'vitest';

process.env.ENCRYPTION_KEY = 'a'.repeat(64);
process.env.HASH_SALT = 'test-salt';

import { encrypt, decrypt, isEncrypted, hash, encryptFields, decryptFields } from '../crypto';

describe('CryptoService', () => {
  it('encrypt/decrypt roundtrip', () => {
    const plain = 'Hello, World!';
    const enc = encrypt(plain);
    expect(enc).not.toBe(plain);
    expect(decrypt(enc)).toBe(plain);
  });

  it('different ciphertext per call (random IV)', () => {
    const a = encrypt('test');
    const b = encrypt('test');
    expect(a).not.toBe(b);
  });

  it('decrypt throws on plaintext (audit fix)', () => {
    expect(() => decrypt('hello')).toThrow('not in encrypted format');
  });

  it('decrypt throws on empty string', () => {
    expect(() => decrypt('')).toThrow('not in encrypted format');
  });

  it('decrypt throws on tampered ciphertext', () => {
    const enc = encrypt('secret');
    const tampered = enc.slice(0, -5) + 'XXXXX';
    expect(() => decrypt(tampered)).toThrow();
  });

  it('isEncrypted detects correctly', () => {
    expect(isEncrypted(encrypt('test'))).toBe(true);
    expect(isEncrypted('hello')).toBe(false);
    expect(isEncrypted('')).toBe(false);
  });

  it('hash is consistent', () => {
    expect(hash('test')).toBe(hash('test'));
    expect(hash('a')).not.toBe(hash('b'));
  });

  it('encryptFields/decryptFields roundtrip', () => {
    const data = { name: 'John', phone: '+91999' };
    const enc = encryptFields(data, ['phone']);
    expect(enc.name).toBe('John');
    expect(isEncrypted(enc.phone as string)).toBe(true);
    const dec = decryptFields(enc, ['phone']);
    expect(dec.phone).toBe('+91999');
  });
});

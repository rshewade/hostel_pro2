import { describe, it, expect, beforeAll } from 'vitest';

process.env.SIGNED_URL_SECRET = 'test-secret-key';

import { signUrl, verifySignedUrl } from '../signed-urls';

describe('Signed URLs', () => {
  it('sign and verify roundtrip', () => {
    const url = signUrl('test/file.pdf');
    const token = url.replace('/api/storage/', '');
    const result = verifySignedUrl(token);
    expect(result.valid).toBe(true);
    expect(result.filePath).toBe('test/file.pdf');
  });

  it('expired URL is rejected', () => {
    const url = signUrl('test/file.pdf', -1); // Already expired
    const token = url.replace('/api/storage/', '');
    const result = verifySignedUrl(token);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('expired');
  });

  it('tampered signature is rejected', () => {
    const url = signUrl('test/file.pdf');
    const token = url.replace('/api/storage/', '');
    const tampered = token.slice(0, -5) + 'XXXXX';
    const result = verifySignedUrl(tampered);
    expect(result.valid).toBe(false);
  });

  it('modified file path is rejected', () => {
    const url = signUrl('test/file.pdf');
    const token = url.replace('/api/storage/', '');
    const decoded = Buffer.from(token, 'base64url').toString();
    const parts = decoded.split('|');
    parts[0] = 'hacked/path.pdf';
    const modified = Buffer.from(parts.join('|')).toString('base64url');
    const result = verifySignedUrl(modified);
    expect(result.valid).toBe(false);
  });
});

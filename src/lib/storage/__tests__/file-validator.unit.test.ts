import { describe, it, expect } from 'vitest';
import { validateFile, generateStoragePath } from '../file-validator';
import { ValidationError } from '@/lib/errors';

describe('File Validator', () => {
  it('accepts PDF', () => {
    expect(() => validateFile({ type: 'application/pdf', size: 1024, name: 'doc.pdf' })).not.toThrow();
  });

  it('accepts JPEG', () => {
    expect(() => validateFile({ type: 'image/jpeg', size: 1024, name: 'photo.jpg' })).not.toThrow();
  });

  it('accepts PNG', () => {
    expect(() => validateFile({ type: 'image/png', size: 1024, name: 'img.png' })).not.toThrow();
  });

  it('rejects EXE', () => {
    expect(() => validateFile({ type: 'application/x-executable', size: 1024, name: 'malware.exe' })).toThrow(ValidationError);
  });

  it('rejects JavaScript', () => {
    expect(() => validateFile({ type: 'application/javascript', size: 1024, name: 'script.js' })).toThrow(ValidationError);
  });

  it('rejects file > 10MB', () => {
    expect(() => validateFile({ type: 'application/pdf', size: 11 * 1024 * 1024, name: 'big.pdf' })).toThrow(ValidationError);
  });

  it('rejects path traversal in name (..)', () => {
    expect(() => validateFile({ type: 'application/pdf', size: 1024, name: '../etc/passwd' })).toThrow(ValidationError);
  });

  it('rejects null byte in name', () => {
    expect(() => validateFile({ type: 'application/pdf', size: 1024, name: 'file\0.pdf' })).toThrow(ValidationError);
  });
});

describe('generateStoragePath', () => {
  it('generates path with category, userId, and sanitized filename', () => {
    const path = generateStoragePath('documents', 'user-123', 'my file (1).pdf');
    expect(path).toContain('documents/user-123/');
    expect(path).toContain('my_file__1_.pdf');
    expect(path).not.toContain(' ');
  });
});

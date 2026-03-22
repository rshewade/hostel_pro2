import { ValidationError } from '@/lib/errors';

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf',
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

/**
 * Validate a file for upload. Throws ValidationError on failure.
 * Uses ALLOWLIST (not blocklist) for MIME types.
 */
export function validateFile(file: { type: string; size: number; name: string }): void {
  // Check MIME type (allowlist)
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    throw new ValidationError(
      `File type '${file.type}' not allowed. Accepted: ${ALLOWED_MIME_TYPES.join(', ')}`,
      [{ field: 'file', message: `Unsupported file type: ${file.type}` }]
    );
  }

  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    const maxMB = MAX_FILE_SIZE / (1024 * 1024);
    throw new ValidationError(
      `File size ${(file.size / (1024 * 1024)).toFixed(1)}MB exceeds maximum ${maxMB}MB`,
      [{ field: 'file', message: `File too large (max ${maxMB}MB)` }]
    );
  }

  // Check file name for path traversal
  if (file.name.includes('..') || file.name.includes('/') || file.name.includes('\\') || file.name.includes('\0')) {
    throw new ValidationError(
      'Invalid file name',
      [{ field: 'file', message: 'File name contains invalid characters' }]
    );
  }
}

/**
 * Generate a safe storage path for an uploaded file.
 */
export function generateStoragePath(category: string, userId: string, fileName: string): string {
  const timestamp = Date.now();
  const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
  return `${category}/${userId}/${timestamp}_${safeName}`;
}

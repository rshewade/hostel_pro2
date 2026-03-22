import { ValidationError } from '@/lib/errors';

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export function validateFile(file: { type: string; size: number; name: string }): void {
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    throw new ValidationError(`File type '${file.type}' not allowed. Accepted: ${ALLOWED_MIME_TYPES.join(', ')}`, [{ field: 'file', message: `Unsupported file type: ${file.type}` }]);
  }
  if (file.size > MAX_FILE_SIZE) {
    throw new ValidationError(`File size exceeds maximum ${MAX_FILE_SIZE / (1024 * 1024)}MB`, [{ field: 'file', message: 'File too large' }]);
  }
  if (file.name.includes('..') || file.name.includes('/') || file.name.includes('\\') || file.name.includes('\0')) {
    throw new ValidationError('Invalid file name', [{ field: 'file', message: 'File name contains invalid characters' }]);
  }
}

export function generateStoragePath(category: string, userId: string, fileName: string): string {
  const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
  return `${category}/${userId}/${Date.now()}_${safeName}`;
}

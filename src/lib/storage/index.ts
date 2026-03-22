import { join, resolve } from 'path';
import { mkdir, unlink, readdir, stat } from 'fs/promises';

const UPLOAD_DIR = process.env.UPLOAD_DIR || './uploads';

function safePath(relativePath: string): string {
  // Prevent path traversal
  if (relativePath.includes('..') || relativePath.includes('\0')) {
    throw new Error('Invalid file path: path traversal detected');
  }
  const resolved = resolve(join(UPLOAD_DIR, relativePath));
  if (!resolved.startsWith(resolve(UPLOAD_DIR))) {
    throw new Error('Invalid file path: outside upload directory');
  }
  return resolved;
}

/**
 * Upload a file to local filesystem.
 */
export async function upload(relativePath: string, data: Buffer | Uint8Array): Promise<void> {
  const fullPath = safePath(relativePath);
  const dir = fullPath.substring(0, fullPath.lastIndexOf('/'));
  await mkdir(dir, { recursive: true });
  await Bun.write(fullPath, data);
}

/**
 * Download a file from local filesystem.
 */
export async function download(relativePath: string): Promise<Uint8Array> {
  const fullPath = safePath(relativePath);
  const file = Bun.file(fullPath);
  if (!(await file.exists())) {
    throw new Error(`File not found: ${relativePath}`);
  }
  return new Uint8Array(await file.arrayBuffer());
}

/**
 * Delete a file from local filesystem.
 */
export async function remove(relativePath: string): Promise<void> {
  const fullPath = safePath(relativePath);
  try {
    await unlink(fullPath);
  } catch (err: any) {
    if (err.code !== 'ENOENT') throw err;
  }
}

/**
 * List files in a directory.
 */
export async function list(directory: string): Promise<string[]> {
  const fullPath = safePath(directory);
  try {
    return await readdir(fullPath);
  } catch (err: any) {
    if (err.code === 'ENOENT') return [];
    throw err;
  }
}

/**
 * Check if a file exists.
 */
export async function exists(relativePath: string): Promise<boolean> {
  const fullPath = safePath(relativePath);
  try {
    await stat(fullPath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get the absolute upload directory path.
 */
export function getUploadDir(): string {
  return resolve(UPLOAD_DIR);
}

import { join, resolve } from 'path';
import { mkdir, unlink, readdir, stat } from 'fs/promises';

const UPLOAD_DIR = process.env.UPLOAD_DIR || './uploads';

function safePath(relativePath: string): string {
  if (relativePath.includes('..') || relativePath.includes('\0')) throw new Error('Invalid file path: path traversal detected');
  const resolved = resolve(join(UPLOAD_DIR, relativePath));
  if (!resolved.startsWith(resolve(UPLOAD_DIR))) throw new Error('Invalid file path: outside upload directory');
  return resolved;
}

export async function upload(relativePath: string, data: Buffer | Uint8Array): Promise<void> {
  const fullPath = safePath(relativePath);
  const dir = fullPath.substring(0, fullPath.lastIndexOf('/'));
  await mkdir(dir, { recursive: true });
  await Bun.write(fullPath, data);
}

export async function download(relativePath: string): Promise<Uint8Array> {
  const fullPath = safePath(relativePath);
  const file = Bun.file(fullPath);
  if (!(await file.exists())) throw new Error(`File not found: ${relativePath}`);
  return new Uint8Array(await file.arrayBuffer());
}

export async function remove(relativePath: string): Promise<void> {
  try { await unlink(safePath(relativePath)); } catch (err: any) { if (err.code !== 'ENOENT') throw err; }
}

export async function list(directory: string): Promise<string[]> {
  try { return await readdir(safePath(directory)); } catch (err: any) { if (err.code === 'ENOENT') return []; throw err; }
}

export async function exists(relativePath: string): Promise<boolean> {
  try { await stat(safePath(relativePath)); return true; } catch { return false; }
}

export function getUploadDir(): string { return resolve(UPLOAD_DIR); }

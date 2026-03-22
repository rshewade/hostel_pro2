import { NextRequest, NextResponse } from 'next/server';
import { verifySignedUrl } from '@/lib/storage/signed-urls';
import { download } from '@/lib/storage';

const MIME_MAP: Record<string, string> = {
  '.pdf': 'application/pdf',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
};

function getMimeType(filePath: string): string {
  const ext = filePath.substring(filePath.lastIndexOf('.')).toLowerCase();
  return MIME_MAP[ext] || 'application/octet-stream';
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const result = verifySignedUrl(token);

  if (!result.valid || !result.filePath) {
    return NextResponse.json(
      { error: { code: 'FORBIDDEN', message: result.error || 'Invalid or expired URL', status: 403 } },
      { status: 403 }
    );
  }

  try {
    const data = await download(result.filePath);
    const mimeType = getMimeType(result.filePath);

    return new NextResponse(Buffer.from(data), {
      headers: {
        'Content-Type': mimeType,
        'Content-Length': String(data.length),
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch {
    return NextResponse.json(
      { error: { code: 'NOT_FOUND', message: 'File not found', status: 404 } },
      { status: 404 }
    );
  }
}

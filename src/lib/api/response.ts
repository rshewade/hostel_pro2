import { NextResponse } from 'next/server';

export function successResponse<T>(data: T, status = 200): NextResponse {
  return NextResponse.json({ data }, { status });
}

export function paginatedResponse<T>(data: T[], total: number, page: number, limit: number): NextResponse {
  return NextResponse.json({
    data,
    pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
  });
}

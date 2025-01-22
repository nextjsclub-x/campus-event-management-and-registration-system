import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function responseTimeMiddleware(_request: NextRequest) {
  const start = Date.now();

  const response = NextResponse.next();

  response.headers.set('X-Response-Time', `${Date.now() - start}ms`);

  return response;
}

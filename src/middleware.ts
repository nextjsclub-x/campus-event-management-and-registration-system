import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from '@/utils/jwt';

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;

  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  try {
    const payload = await verifyToken(token);
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-id', payload.id.toString());
    requestHeaders.set('x-user-role', payload.role);

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  } catch (error) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/api/admin/:path*',
    '/api/activities/:path*',
    '/api/announcements/:path*',
    '/api/categories/:path*',
    '/api/comments/:path*',
    '/api/feedbacks/:path*',
    '/api/registrations/:path*',
    '/api/user/:path*',
  ],
};

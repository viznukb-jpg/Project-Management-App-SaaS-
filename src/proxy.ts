import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const tokenNameVariants: string[] = [
  'authjs.session-token',
  '__Secure-authjs.session-token',
  'next-auth.session-token',
  '__Secure-next-auth.session-token',
];

function getTokenFromCookies(request: NextRequest) {
  for (const variant of tokenNameVariants) {
    const token = request.cookies.get(variant)?.value;
    if (token) return token;
  }
  return undefined;
}

export function proxy(request: NextRequest) {
  const token = getTokenFromCookies(request);

  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/dashboard')) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  if (token && (pathname === '/login' || pathname === '/register')) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/login', '/register'],
};

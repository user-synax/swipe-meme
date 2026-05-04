import { NextResponse } from 'next/server';

export function middleware(req) {
  const token = req.cookies.get('token')?.value;
  const { pathname } = req.nextUrl;

  // Define public routes
  const isAuthRoute = pathname.startsWith('/auth/login') || pathname.startsWith('/auth/register');
  const isApiAuthRoute = pathname.startsWith('/api/auth');
  const isPublicFile = pathname.includes('.') || pathname.startsWith('/_next');

  // If there's no token and it's not a public route, redirect to login
  if (!token && !isAuthRoute && !isApiAuthRoute && !isPublicFile && pathname !== '/') {
    return NextResponse.redirect(new URL('/auth/login', req.url));
  }

  // If there's a token and user is on auth routes, redirect to home
  if (token && isAuthRoute) {
    return NextResponse.redirect(new URL('/', req.url));
  }

  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};

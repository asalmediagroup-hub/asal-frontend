import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Check if the path starts with /admin
    if (pathname.startsWith('/admin')) {
        // Get the token from cookies
        const token = request.cookies.get('token')?.value;

        // If no token, redirect to login
        if (!token) {
            const loginUrl = new URL('/auth/login', request.url);
            // Add the current path as a redirect parameter
            loginUrl.searchParams.set('redirect', pathname);
            return NextResponse.redirect(loginUrl);
        }
    }

    return NextResponse.next();
}

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

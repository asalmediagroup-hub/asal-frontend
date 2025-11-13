import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Detect domain from host header
    const host = request.headers.get('host') || '';
    const isAdminDomain = host.includes('admin.asalmediacorp.com');
    const isMainDomain = host.includes('asalmediacorp.com') && !host.includes('admin.');

    // Redirect root path on admin subdomain to /admin
    if (isAdminDomain && pathname === '/') {
        return NextResponse.redirect(new URL('/admin', request.url));
    }

    // Block access to /auth/login and /admin routes on main domain (asalmediacorp.com)
    // Allow access on admin subdomain (admin.asalmediacorp.com)
    if (isMainDomain) {
        if (pathname.startsWith('/auth/login') || pathname.startsWith('/admin')) {
            return new NextResponse('Page Not Found', { status: 404 });
        }
    }

    // Check if the path starts with /admin (authentication check for allowed domains)
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

import NextAuth from "next-auth";
import createMiddleware from 'next-intl/middleware';
import { NextResponse } from "next/server";
import { authConfig } from "./auth.config";
import { routing } from './i18n/routing';
import rateLimit from "./lib/rate-limit";

const intlMiddleware = createMiddleware(routing);
const { auth } = NextAuth(authConfig);

const limiter = rateLimit({
  interval: 60 * 1000, // 60 seconds
  uniqueTokenPerInterval: 500, // Max 500 users per second
});

// Define route access permissions
const ROUTE_PERMISSIONS: Record<string, string[]> = {
  '/admin': ['DIRECTOR', 'ADMIN'],
  '/teacher': ['DIRECTOR', 'ADMIN', 'TEACHER'],
  '/staff': ['DIRECTOR', 'ADMIN', 'STAFF'],
  '/student': ['DIRECTOR', 'ADMIN', 'STUDENT'],
};

// Public routes that don't require authentication
const PUBLIC_PATTERNS = [
  '/',
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/courses',
  '/about',
  '/contact',
  '/careers',
  '/legal',
];

function isPublicPath(pathname: string): boolean {
  // Remove locale prefix for checking
  const pathWithoutLocale = pathname.replace(/^\/(en|pa)/, '') || '/';

  return PUBLIC_PATTERNS.some(pattern => {
    if (pattern === '/') return pathWithoutLocale === '/';
    return pathWithoutLocale.startsWith(pattern);
  });
}

function getRequiredRoles(pathname: string): string[] | null {
  // Remove locale prefix
  const pathWithoutLocale = pathname.replace(/^\/(en|pa)/, '') || '/';

  for (const [route, roles] of Object.entries(ROUTE_PERMISSIONS)) {
    if (pathWithoutLocale.startsWith(route)) {
      return roles;
    }
  }
  return null;
}

export default auth(async (req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  // Access role from the extended session user (set in auth.config.ts callbacks)
  const userRole = (req.auth?.user as any)?.role as string | undefined;

  // Rate Limiting Logic
  try {
    const ip = req.headers.get("x-forwarded-for") ?? "127.0.0.1";
    const isLogin = nextUrl.pathname.endsWith("/login");
    const limit = isLogin ? 10 : 100;

    await limiter.check(limit, ip + (isLogin ? "_login" : ""));
  } catch {
    return new NextResponse("Too Many Requests", { status: 429 });
  }

  // Check if it's a public route
  if (isPublicPath(nextUrl.pathname)) {
    return intlMiddleware(req);
  }

  // For protected routes, check authentication
  if (!isLoggedIn) {
    const locale = nextUrl.pathname.match(/^\/(en|pa)/)?.[1] || 'en';
    const loginUrl = new URL(`/${locale}/login`, nextUrl.origin);
    loginUrl.searchParams.set('callbackUrl', nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Check role-based access
  const requiredRoles = getRequiredRoles(nextUrl.pathname);

  if (requiredRoles && userRole) {
    if (!requiredRoles.includes(userRole)) {
      // User doesn't have permission, redirect to appropriate dashboard
      const locale = nextUrl.pathname.match(/^\/(en|pa)/)?.[1] || 'en';

      // Redirect to their appropriate dashboard based on role
      let redirectPath = `/${locale}`;
      switch (userRole) {
        case 'STUDENT':
          redirectPath = `/${locale}/student`;
          break;
        case 'TEACHER':
          redirectPath = `/${locale}/teacher`;
          break;
        case 'STAFF':
          redirectPath = `/${locale}/staff`;
          break;
        case 'ADMIN':
        case 'DIRECTOR':
          redirectPath = `/${locale}/admin`;
          break;
      }

      return NextResponse.redirect(new URL(redirectPath, nextUrl.origin));
    }
  }

  return intlMiddleware(req);
});

export const config = {
  matcher: ['/', '/(en|pa)/:path*', '/((?!api|_next|_vercel|.*\\..*).*)'],
};

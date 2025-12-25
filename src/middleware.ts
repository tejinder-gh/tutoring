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

export default auth(async (req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;

  // Rate Limiting Logic
  try {
    // 10 requests per minute per IP for sensitive routes (e.g. login)
    // 100 requests per minute per IP for other routes
    const ip = req.headers.get("x-forwarded-for") ?? "127.0.0.1";
    const isLogin = nextUrl.pathname.endsWith("/login");
    const limit = isLogin ? 10 : 100;

    await limiter.check(limit, ip + (isLogin ? "_login" : ""));
  } catch {
    return new NextResponse("Too Many Requests", { status: 429 });
  }

  const isIntlRoute = routing.locales.some((locale) =>
    nextUrl.pathname.startsWith(`/${locale}`)
  );

  const isPublicRoute =
    nextUrl.pathname === "/" ||
    (!isIntlRoute && !nextUrl.pathname.startsWith("/admin") && !nextUrl.pathname.startsWith("/teacher") && !nextUrl.pathname.startsWith("/student"));

  if (isPublicRoute) {
    return intlMiddleware(req);
  }

  return intlMiddleware(req);
});

export const config = {
  // Same matcher
  matcher: ['/', '/(en|pa)/:path*', '/((?!api|_next|_vercel|.*\\..*).*)'],
};

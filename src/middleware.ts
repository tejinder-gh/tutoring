import NextAuth from "next-auth";
import createMiddleware from 'next-intl/middleware';
import { authConfig } from "./auth.config";
import { routing } from './i18n/routing';

const intlMiddleware = createMiddleware(routing);
const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;

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

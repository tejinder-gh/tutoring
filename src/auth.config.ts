import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 hours
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;

      // Remove locale prefix to check the actual route
      const pathWithoutLocale = nextUrl.pathname.replace(/^\/(en|pa)/, '');

      const isOnDashboard = pathWithoutLocale.startsWith("/admin") ||
                            pathWithoutLocale.startsWith("/teacher") ||
                            pathWithoutLocale.startsWith("/student");

      if (isOnDashboard) {
        if (isLoggedIn) return true;
        return false; // Redirect unauthenticated users to login page
      } else if (isLoggedIn && (nextUrl.pathname === "/login" || nextUrl.pathname === "/en/login" || nextUrl.pathname === "/pa/login")) {
        // Redirect logged-in users to their respective dashboard
        const role = (auth.user as any).role;
        if (role === "ADMIN" || role === "DIRECTOR") return Response.redirect(new URL("/admin", nextUrl));
        if (role === "TEACHER") return Response.redirect(new URL("/teacher", nextUrl));
        return Response.redirect(new URL("/student", nextUrl));
      }
      return true;
    },
    jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role?.name;
        token.permissions = (user as any).role?.permissions;
        token.id = user.id;
      }
      return token;
    },
    session({ session, token }) {
      if (token && session.user) {
        (session.user as any).role = token.role;
        (session.user as any).permissions = token.permissions;
        (session.user as any).id = token.id;
      }
      return session;
    },
  },
  providers: [], // Configured in auth.ts
} satisfies NextAuthConfig;

import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnDashboard = nextUrl.pathname.startsWith("/admin") ||
                            nextUrl.pathname.startsWith("/teacher") ||
                            nextUrl.pathname.startsWith("/student");

      if (isOnDashboard) {
        if (isLoggedIn) return true;
        return false; // Redirect unauthenticated users to login page
      } else if (isLoggedIn && nextUrl.pathname === "/login") {
        // Redirect logged-in users to their respective dashboard
        const role = (auth.user as any).role;
        if (role === "ADMIN") return Response.redirect(new URL("/admin", nextUrl));
        if (role === "TEACHER") return Response.redirect(new URL("/teacher", nextUrl));
        return Response.redirect(new URL("/student", nextUrl));
      }
      return true;
    },
    jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
        token.id = user.id;
      }
      return token;
    },
    session({ session, token }) {
      if (token && session.user) {
        (session.user as any).role = token.role;
        (session.user as any).id = token.id;
      }
      return session;
    },
  },
  providers: [], // Configured in auth.ts
} satisfies NextAuthConfig;

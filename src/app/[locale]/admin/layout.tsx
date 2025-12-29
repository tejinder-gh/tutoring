import { auth } from "@/auth";
import Sidebar from "@/components/Sidebar";
import { SessionProvider } from "next-auth/react";
import { redirect } from "next/navigation";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // Basic auth check - user must be logged in
  if (!session?.user) {
    redirect('/login');
  }

  // Individual pages will check their own specific permission requirements
  // This layout just ensures the user is authenticated

  return (
    <SessionProvider session={session}>
      <div className="min-h-screen bg-background text-foreground">
        <Sidebar role="ADMIN" />
        <div className="pl-64 flex flex-col min-h-screen">
          <main className="flex-1 p-8">
            {children}
          </main>
          <footer className="border-t border-border p-6 text-center text-xs text-text-muted bg-background/50">
            <p>&copy; {new Date().getFullYear()} big O  Tutoring. All rights reserved.</p>
            <p className="mt-1">Admin Console v1.0.0</p>
          </footer>
        </div>
      </div>
    </SessionProvider>
  );
}

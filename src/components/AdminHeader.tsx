"use client";

import { Bell, LogOut, Search, Settings, User } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";

export default function AdminHeader() {
  const { data: session } = useSession();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  return (
    <header className="bg-background border-b border-border h-16 px-8 flex items-center justify-between sticky top-0 z-30">
      {/* Search Bar (Visual Only for now) */}
      <div className="relative w-96 hidden md:block">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
        <input
          type="text"
          placeholder="Search students, courses, or batches..."
          className="w-full bg-accent/20 border border-border rounded-lg pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
        />
      </div>

      <div className="flex items-center gap-6 ml-auto">
        {/* Notifications */}
        <button className="relative text-text-muted hover:text-foreground transition-colors p-2 rounded-full hover:bg-accent/50">
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-background"></span>
        </button>

        {/* User Profile */}
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-3 hover:bg-accent/50 p-2 rounded-lg transition-all"
          >
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30">
              <User size={16} className="text-primary" />
            </div>
            <div className="text-left hidden sm:block">
              <div className="text-sm font-semibold text-foreground leading-none">
                {session?.user?.name || "Admin User"}
              </div>
              <div className="text-xs text-text-muted mt-1">Administrator</div>
            </div>
          </button>

          {/* Dropdown Menu */}
          {showProfileMenu && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowProfileMenu(false)}
              ></div>
              <div className="absolute right-0 top-full mt-2 w-56 bg-background border border-border rounded-xl shadow-xl z-20 py-2 animate-in fade-in zoom-in-95 duration-200">
                <div className="px-4 py-3 border-b border-border">
                  <p className="text-sm font-medium text-foreground">Signed in as</p>
                  <p className="text-xs text-text-muted truncate">{session?.user?.email}</p>
                </div>

                <div className="py-2">
                    <Link
                    href="/admin/settings"
                    className="flex items-center gap-2 px-4 py-2 text-sm text-text-muted hover:text-foreground hover:bg-accent/50 transition-colors"
                    onClick={() => setShowProfileMenu(false)}
                    >
                    <Settings size={16} />
                    Settings
                    </Link>
                </div>

                <div className="border-t border-border pt-2">
                  <button
                    onClick={() => signOut({ callbackUrl: "/login" })}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-500 hover:bg-red-500/10 transition-colors"
                  >
                    <LogOut size={16} />
                    Sign Out
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

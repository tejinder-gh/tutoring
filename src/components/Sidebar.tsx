"use client";

import { siteConfig } from "@/config/site";
import {
  BookOpen,
  Calendar,
  FileText,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  Shield,
  Users
} from "lucide-react";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface SidebarProps {
  role: "ADMIN" | "TEACHER" | "STUDENT";
}

export default function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname();

  const links = {
    ADMIN: [
      { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
      { href: "/admin/users", label: "Users & Staff", icon: Users },
      { href: "/admin/courses", label: "Curriculum", icon: BookOpen },
      { href: "/admin/batches", label: "Batches", icon: Calendar },
      { href: "/admin/finance", label: "Finance", icon: FileText },
      { href: "/admin/settings/roles", label: "Roles", icon: Shield },
    ],
    TEACHER: [
      { href: "/teacher", label: "Dashboard", icon: LayoutDashboard },
      { href: "/teacher/courses", label: "My Courses", icon: BookOpen },
      { href: "/teacher/assignments", label: "Assignments", icon: FileText },
      { href: "/teacher/attendance", label: "Attendance", icon: Calendar },
      { href: "/teacher/schedule", label: "Schedule", icon: Calendar },
    ],
    STUDENT: [
      { href: "/student", label: "Dashboard", icon: LayoutDashboard },
      { href: "/student/learn", label: "My Learning", icon: GraduationCap },
      { href: "/student/assignments", label: "Assignments", icon: FileText },
      { href: "/student/queries", label: "My Queries", icon: MessageSquare },
      { href: "/student/schedule", label: "My Schedule", icon: Calendar },
      { href: "/student/payments", label: "Payments", icon: FileText },
    ],
  };

  const navItems = links[role];

  return (
    <div className="flex bg-background border-r border-border h-screen flex-col w-64 fixed left-0 top-0 overflow-y-auto">
      <div className="p-6 border-b border-border">
        <Link href={`/${role.toLowerCase()}`} className="flex items-center gap-2 font-bold text-xl text-primary hover:opacity-80 transition-opacity">
          <GraduationCap /> {/* Or Logo */}
          <span>{siteConfig.shortName}</span>
        </Link>
        <div className="mt-2 text-xs font-medium text-text-muted bg-accent/50 px-2 py-1 rounded inline-block">
          {role} PORTAL
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-medium
                ${isActive
                  ? "bg-primary/10 text-primary"
                  : "text-text-muted hover:bg-accent hover:text-foreground"
                }`}
            >
              <item.icon size={20} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border">
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex w-full items-center gap-3 px-4 py-3 rounded-lg text-red-500 hover:bg-red-500/10 transition-colors font-medium"
        >
          <LogOut size={20} />
          Sign Out
        </button>
      </div>
    </div>
  );
}

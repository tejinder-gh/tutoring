"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const tabs = [
    { href: "/admin/settings/general", label: "General" },
    { href: "/admin/settings/roles", label: "Roles & Permissions" },
    { href: "/admin/settings/audit", label: "Audit Logs" },
  ];

  return (
    <div className="p-6">
      <div className="flex items-center gap-4 mb-8 border-b border-border">
        {tabs.map((tab) => {
          const isActive = pathname.startsWith(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors ${isActive
                  ? "border-primary text-primary"
                  : "border-transparent text-text-muted hover:text-foreground hover:border-border"
                }`}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>
      {children}
    </div>
  );
}

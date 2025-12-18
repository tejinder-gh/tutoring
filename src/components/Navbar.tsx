"use client";

import { Link, usePathname, useRouter } from "@/i18n/routing";
import { Languages, Moon, Sun } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useTheme } from "./ThemeContext";

export default function Navbar() {
  const { toggleTheme, theme } = useTheme();
  const t = useTranslations("nav");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const toggleLanguage = () => {
    const nextLocale = locale === "en" ? "pa" : "en";
    router.replace(pathname, { locale: nextLocale });
  };

  return (
    <header className="fixed inset-x-0 top-0 z-40 h-16 bg-background border-b border-border flex items-center px-6">
      <div className="container flex items-center gap-6">
        <Link href="/" className="text-lg font-bold text-foreground">
          Future Ready
        </Link>

        <nav className="ml-auto flex items-center gap-4">
          <Link
            href="/courses"
            className="text-text-muted hover:text-foreground transition"
          >
            {t("courses")}
          </Link>
          <Link
            href="/register"
            className="text-text-muted hover:text-foreground transition"
          >
            {t("register")}
          </Link>
          <Link
            href="/login"
            className="text-text-muted hover:text-foreground transition"
          >
            {t("login")}
          </Link>

          <div className="flex items-center gap-2 border-l border-border pl-4">
            <button
              onClick={toggleLanguage}
              aria-label="Toggle language"
              className="p-2 rounded-lg bg-accent text-foreground border border-border hover:opacity-90 transition flex items-center gap-2 text-sm font-medium"
            >
              <Languages size={18} />
              <span className="hidden sm:inline">
                {locale === "en" ? "ਪੰਜਾਬੀ" : "English"}
              </span>
            </button>

            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="p-2 rounded-lg bg-accent text-foreground border border-border hover:opacity-90 transition"
            >
              {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>
        </nav>
      </div>
    </header>
  );
}

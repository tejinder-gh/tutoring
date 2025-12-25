"use client";

import NotificationBell from "@/components/NotificationBell";
import { siteConfig } from "@/config/site";
import { Link, usePathname, useRouter } from "@/i18n/routing";
import { Languages, Menu, Moon, Sun, X } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import { useTheme } from "./ThemeContext";

export default function Navbar() {
  const { toggleTheme, theme } = useTheme();
  const t = useTranslations("nav");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  // State for mobile menu overlay visibility
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleLanguage = () => {
    const nextLocale = locale === "en" ? "pa" : "en";
    router.replace(pathname, { locale: nextLocale });
  };

  return (
    <header className="fixed inset-x-0 top-0 z-40 h-16 bg-background border-b border-border flex items-center px-6">
      <div className="container flex items-center gap-6">
        <Link href="/" className="font-bold text-primary text-2xl">
          {siteConfig.shortName}
        </Link>

        <nav className="ml-auto hidden md:flex items-center gap-4">
          <Link
            href="/courses"
            className="text-text-muted hover:text-foreground transition"
          >
            {t("courses")}
          </Link>
          <Link
            href="/about"
            className="text-text-muted hover:text-foreground transition"
          >
            {t("about")}
          </Link>
          <Link
            href="/contact"
            className="text-text-muted hover:text-foreground transition"
          >
            {t("contact")}
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
            <NotificationBell />
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

        {/* Mobile Menu Toggle */}
        <button
          className="ml-auto md:hidden p-2 text-foreground"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {
        isMobileMenuOpen && (
          <div className="absolute top-16 left-0 w-full bg-background border-b border-border md:hidden animate-in slide-in-from-top-5">
            <div className="flex flex-col p-6 gap-4">
              <Link
                href="/courses"
                className="text-lg font-medium text-foreground hover:text-primary transition"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {t("courses")}
              </Link>
              <Link
                href="/about"
                className="text-lg font-medium text-foreground hover:text-primary transition"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {t("about")}
              </Link>
              <Link
                href="/contact"
                className="text-lg font-medium text-foreground hover:text-primary transition"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {t("contact")}
              </Link>

              <div className="flex items-center gap-4 mt-4 pt-4 border-t border-border">
                <Link
                  href="/login"
                  className="px-6 py-2 rounded-xl border border-border text-foreground font-medium"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {t("login")}
                </Link>
                <Link
                  href="/register"
                  className="px-6 py-2 rounded-xl bg-primary text-white font-medium"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {t("register")}
                </Link>
              </div>

              <div className="flex items-center gap-2 mt-4">
                <button
                  onClick={toggleLanguage}
                  className="p-2 rounded-lg bg-accent text-foreground border border-border flex items-center gap-2 text-sm font-medium"
                >
                  <Languages size={18} />
                  <span>{locale === "en" ? "ਪੰਜਾਬੀ" : "English"}</span>
                </button>
                <button
                  onClick={toggleTheme}
                  className="p-2 rounded-lg bg-accent text-foreground border border-border"
                >
                  {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
                </button>
              </div>
            </div>
          </div>
        )
      }
    </header >
  );
}

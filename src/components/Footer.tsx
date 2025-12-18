"use client";

import { Link } from "@/i18n/routing";
import { Facebook, Github, Instagram, Linkedin, MapPin, Twitter } from "lucide-react";
import { useTranslations } from "next-intl";

export default function Footer() {
  const t = useTranslations("footer");
  const navT = useTranslations("nav");

  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-muted/30 border-t border-border mt-auto">
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Column */}
          <div className="space-y-4">
            <Link href="/" className="text-xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Future Ready
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
              {t("description")}
            </p>
            <div className="flex items-center gap-4 text-muted-foreground">
              <a href="#" className="hover:text-primary transition-colors">
                <Twitter size={20} />
              </a>
              <a href="#" className="hover:text-primary transition-colors">
                <Github size={20} />
              </a>
              <a href="#" className="hover:text-primary transition-colors">
                <Linkedin size={20} />
              </a>
              <a href="#" className="hover:text-primary transition-colors">
                <Instagram size={20} />
              </a>
              <a href="#" className="hover:text-primary transition-colors">
                <Facebook size={20} />
              </a>
            </div>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="font-semibold mb-4 text-foreground">{t("links.company")}</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li>
                <Link href="/about" className="hover:text-primary transition-colors">
                  {t("links.about")}
                </Link>
              </li>
              <li>
                <Link href="/careers" className="hover:text-primary transition-colors">
                  {t("links.careers")}
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-primary transition-colors">
                  {t("links.contact")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources/Legal */}
          <div>
            <h3 className="font-semibold mb-4 text-foreground">{t("links.legal")}</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li>
                <Link href="/legal/privacy" className="hover:text-primary transition-colors">
                  {t("links.privacy")}
                </Link>
              </li>
              <li>
                <Link href="/legal/terms" className="hover:text-primary transition-colors">
                  {t("links.terms")}
                </Link>
              </li>
               <li>
                <Link href="/courses" className="hover:text-primary transition-colors">
                  {t("links.courses")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
             <h3 className="font-semibold mb-4 text-foreground">{t("contact")}</h3>
             <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                    <MapPin size={16} className="mt-1 shrink-0 text-primary" />
                    <span>{t("address")}</span>
                </li>
             </ul>
          </div>
        </div>

        <div className="border-t border-border mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-muted-foreground">
          <p>© {currentYear} {t("copyright")}</p>
        </div>
      </div>
    </footer>
  );
}

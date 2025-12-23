"use client";

import { Link } from "@/i18n/routing";
import { ArrowLeft, FileQuestion } from "lucide-react";
import { useTranslations } from "next-intl";

export default function NotFound() {
  const t = useTranslations("errors.notFound");

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4 text-center">
      <div className="w-24 h-24 bg-accent/30 rounded-full flex items-center justify-center mb-6 animate-pulse">
        <FileQuestion className="text-primary w-12 h-12" />
      </div>
      <h1 className="text-4xl md:text-6xl font-black text-foreground mb-4">
        404
      </h1>
      <h2 className="text-xl md:text-2xl font-bold text-foreground mb-4">
        {t("title")}
      </h2>
      <p className="text-text-muted max-w-md mb-8">
        {t("description")}
      </p>

      <Link
        href="/"
        className="inline-flex items-center gap-2 px-8 py-3 bg-primary text-black font-bold rounded-xl hover:opacity-90 transition-opacity"
      >
        <ArrowLeft size={20} />
        {t("backToHome")}
      </Link>
    </div>
  );
}

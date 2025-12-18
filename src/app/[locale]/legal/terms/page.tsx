"use client";

import { useTranslations } from "next-intl";

export default function TermsPage() {
  const t = useTranslations("legal.terms");

  return (
    <div className="min-h-screen bg-background py-20 px-6">
      <div className="container mx-auto max-w-3xl">
        <h1 className="text-4xl font-black mb-8">{t("title")}</h1>
        <div className="prose dark:prose-invert max-w-none">
            <p className="text-lg text-muted-foreground leading-relaxed">
                {t("content")}
            </p>
            {/* Add more legal text as needed */}
        </div>
      </div>
    </div>
  );
}

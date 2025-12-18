"use client";

import { Briefcase } from "lucide-react";
import { useTranslations } from "next-intl";

export default function CareersPage() {
  const t = useTranslations("careers");

  return (
    <div className="min-h-screen bg-background">
       <section className="relative py-20 px-6 bg-accent/5 border-b border-border">
        <div className="container mx-auto text-center max-w-3xl">
          <h1 className="text-4xl md:text-5xl font-black mb-6 bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent">
            {t("title")}
          </h1>
          <p className="text-xl text-muted-foreground font-medium leading-relaxed">
            {t("subtitle")}
          </p>
        </div>
      </section>

      <section className="py-24 px-6 container mx-auto text-center">
        <div className="max-w-md mx-auto p-12 rounded-3xl border-2 border-dashed border-border flex flex-col items-center gap-6">
            <div className="w-16 h-16 rounded-full bg-accent flex items-center justify-center text-muted-foreground">
                <Briefcase size={32} />
            </div>
            <p className="text-lg text-muted-foreground font-medium">
                {t("noOpenings")}
            </p>
        </div>
      </section>
    </div>
  );
}

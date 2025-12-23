"use client";

import { CheckCircle2, Trophy, User } from "lucide-react";
import { useTranslations } from "next-intl";

export default function AboutPage() {
  const t = useTranslations("about");

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-20 px-6 bg-accent/5 border-b border-border">
        <div className="container mx-auto text-center max-w-3xl">
          <h1 className="text-4xl md:text-5xl font-black mb-6 bg-linear-to-r from-foreground to-foreground/60 bg-clip-text text-transparent">
            {t("hero.title")}
          </h1>
          <p className="text-xl text-muted-foreground font-medium leading-relaxed">
            {t("hero.subtitle")}
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto grid md:grid-cols-2 gap-12 items-center max-w-6xl">
          <div className="space-y-6">
            <h2 className="text-3xl font-bold flex items-center gap-3">
              <Trophy className="text-primary" size={32} />
              {t("mission.title")}
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              {t("mission.content")}
            </p>
          </div>
          <div className="p-8 rounded-3xl from-indigo-100 to-blue-200 bg-linear-to-br border border-border">
            <h3 className="text-xl font-bold mb-6">{t("values.title")}</h3>
            <div className="space-y-4">
              {[1, 2, 3].map((num) => (
                <div key={num} className="flex items-center gap-4 bg-background p-4 rounded-xl border border-border shadow-sm">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                    <CheckCircle2 size={20} />
                  </div>
                  <span className="font-medium text-foreground">{t(`values.${num}`)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stats/Team Placeholder */}
      <section className="py-20 px-6 bg-accent/5 border-t border-border">
        <div className="container mx-auto text-center max-w-6xl">
          <div className="mb-16">
            <h2 className="text-3xl font-bold mb-4">{t("team.title")}</h2>
            <p className="text-muted-foreground text-lg">{t("team.subtitle")}</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[1, 2, 3].map((num) => (
              <div key={num} className="p-8 rounded-3xl bg-card border border-border shadow-sm hover:shadow-elegant transition-all duration-300">
                <div className="w-24 h-24 rounded-full bg-linear-to-br from-primary/20 to-secondary/20 mx-auto mb-6 flex items-center justify-center">
                  <User size={40} className="text-foreground/70" />
                </div>
                <h3 className="text-xl font-bold mb-1">{t(`team.members.${num}.name`)}</h3>
                <div className="text-sm font-semibold text-primary mb-4">{t(`team.members.${num}.role`)}</div>
                <p className="text-muted-foreground">{t(`team.members.${num}.bio`)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

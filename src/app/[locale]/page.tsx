"use client";

import { Link } from "@/i18n/routing";
import { AlertCircle, Award, CheckCircle2, TrendingUp, Users } from "lucide-react";
import { useTranslations } from "next-intl";

export default function HomePage() {
  const t = useTranslations();

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative flex items-center justify-center px-6 py-24 lg:py-32 bg-background overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
        <div className="max-w-4xl w-full text-center relative z-10">
          <div className="mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <h1 className="text-4xl sm:text-6xl font-black mb-6 bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent leading-[1.1]">
              {t("hero.title")}
            </h1>
            <p className="text-xl text-text-muted max-w-2xl mx-auto font-medium">
              {t("hero.subtitle")}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
            <Link
              href="/register"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-10 py-5 rounded-2xl bg-primary text-black font-black shadow-xl shadow-primary/20 hover:scale-[1.03] active:scale-[0.97] transition-all"
            >
              {t("cta.apply")}
            </Link>

            <Link
              href="/courses"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-10 py-5 rounded-2xl bg-accent text-foreground border border-border font-bold hover:bg-accent/80 hover:scale-[1.03] active:scale-[0.97] transition-all"
            >
              {t("cta.viewCourses")}
            </Link>
          </div>
        </div>
      </section>

      {/* Problem & Solution Section */}
      <section className="py-24 border-y border-border bg-accent/5">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-black mb-4">{t("problemSolution.title")}</h2>
            <p className="text-text-muted font-medium italic">{t("problemSolution.subtitle")}</p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
            {/* The Problem */}
            <div className="p-8 rounded-3xl bg-red-500/5 border border-red-500/10 space-y-6">
              <h3 className="text-2xl font-black text-red-500 flex items-center gap-3">
                <AlertCircle size={28} />
                {t("problemSolution.problemTitle")}
              </h3>
              <div className="space-y-4">
                {Object.entries(t.raw("problemSolution.problems")).map(([key, value]: [string, any]) => (
                  <div key={key} className="flex items-start gap-3 p-4 rounded-xl bg-background/50 border border-border hover:border-red-500/30 transition-all group">
                    <div className="w-6 h-6 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 shrink-0 mt-0.5">
                      <span className="text-xs font-bold font-mono">!</span>
                    </div>
                    <span className="text-text-muted font-medium">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Our Solution */}
            <div className="p-8 rounded-3xl bg-primary/5 border border-primary/10 space-y-6">
              <h3 className="text-2xl font-black text-primary flex items-center gap-3">
                <CheckCircle2 size={28} />
                {t("problemSolution.solutionTitle")}
              </h3>
              <div className="space-y-4">
                {Object.entries(t.raw("problemSolution.solutions")).map(([key, value]: [string, any]) => (
                  <div key={key} className="flex items-start gap-3 p-4 rounded-xl bg-background/50 border border-border hover:border-primary/30 transition-all group">
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0 mt-0.5">
                      <CheckCircle2 size={14} />
                    </div>
                    <span className="text-foreground/90 font-medium">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust & Stats Section */}
      <section className="py-24">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center p-8 rounded-3xl border border-border bg-accent/5 hover:bg-accent/10 transition-colors">
              <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center mx-auto mb-4">
                <TrendingUp size={24} />
              </div>
              <p className="text-3xl font-black mb-1">65-75%</p>
              <p className="text-sm font-bold text-foreground mb-1 uppercase tracking-wider">{t("trust.stats.placementLabel")}</p>
              <p className="text-xs text-text-muted font-medium">{t("trust.stats.placementSub")}</p>
            </div>

            <div className="text-center p-8 rounded-3xl border border-primary/20 bg-primary/5 scale-105 shadow-xl shadow-primary/5">
              <div className="w-12 h-12 bg-primary text-black rounded-xl flex items-center justify-center mx-auto mb-4">
                <Users size={24} />
              </div>
              <p className="text-3xl font-black mb-1">₹4.5L - 12L</p>
              <p className="text-sm font-bold text-foreground mb-1 uppercase tracking-wider">{t("trust.stats.salaryLabel")}</p>
              <p className="text-xs text-text-muted font-medium">{t("trust.stats.salarySub")}</p>
            </div>

            <div className="text-center p-8 rounded-3xl border border-border bg-accent/5 hover:bg-accent/10 transition-colors">
              <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center mx-auto mb-4">
                <Award size={24} />
              </div>
              <p className="text-3xl font-black mb-1">100%</p>
              <p className="text-sm font-bold text-foreground mb-1 uppercase tracking-wider">{t("trust.stats.assuranceLabel")}</p>
              <p className="text-xs text-text-muted font-medium">{t("trust.stats.assuranceSub")}</p>
            </div>
          </div>

          <div className="mt-20 pt-12 border-t border-border/50 max-w-2xl mx-auto text-center">
            <p className="text-lg text-text-muted italic leading-relaxed">
              {t.rich("trust.quote", {
                highlight: (chunks) => <span className="text-primary font-black">{chunks}</span>
              })}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

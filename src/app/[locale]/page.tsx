"use client";

import { Link } from "@/i18n/routing";
import { ArrowRight, CheckCircle2, ShieldCheck, Sparkles, TrendingUp } from "lucide-react";
import { useTranslations } from "next-intl";

export default function HomePage() {
  const t = useTranslations();

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* Hero Section - Apple-inspired */}
      <section className="relative pt-24 pb-32 lg:pt-32 lg:pb-48 overflow-hidden">
        {/* Gradient Mesh Background */}
        <div className="absolute inset-0 gradient-mesh opacity-60 -z-10" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl -z-10 animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-secondary/5 rounded-full blur-3xl -z-10" />

        <div className="container mx-auto px-6 text-center z-10 relative">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full glass shadow-elegant text-primary text-sm font-semibold mb-12 animate-in fade-in slide-in-from-bottom-4">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary"></span>
            </span>
            Now Accepting Applications for Batch 5
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-6xl md:text-7xl lg:text-6xl font-black mb-10 tracking-tight leading-[1.05] animate-in fade-in slide-in-from-bottom-6 duration-700">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-foreground via-foreground to-foreground/70">
              {t("hero.title")}
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg sm:text-xl md:text-2xl text-text-muted max-w-3xl mx-auto font-normal mb-16 leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
            {t("hero.subtitle")}
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-5 animate-in fade-in slide-in-from-bottom-10 duration-700 delay-200">
            <Link
              href="/register"
              className="group relative px-10 py-5 rounded-2xl gradient-primary text-white font-bold text-md shadow-elegant hover:shadow-2xl hover:scale-105 transition-all duration-300 overflow-hidden"
            >
              <span className="relative z-10 flex items-center gap-2">
                {t("cta.apply")}
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>

            <Link
              href="/courses"
              className="px-10 py-5 rounded-2xl glass hover:bg-accent transition-all duration-300 text-foreground font-bold text-md shadow-elegant hover:shadow-2xl"
            >
              {t("cta.viewCourses")}
            </Link>
          </div>
        </div>
      </section>

      {/* USP Section - Job Placement Guarantee */}
      <section className="py-24 bg-linear-to-b from-primary/90 to-primary text-primary-foreground relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/patterns/grid.svg')] opacity-10" />
        <div className="container mx-auto px-6 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white font-bold text-sm mb-8 animate-pulse">
            <ShieldCheck size={18} />
            {t("usp.badge")}
          </div>

          <h2 className="text-4xl md:text-5xl font-black mb-6 tracking-tight text-white">{t("usp.title")}</h2>
          <p className="text-lg md:text-xl text-blue-100 max-w-3xl mx-auto mb-16 leading-relaxed">{t("usp.subtitle")}</p>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[1, 2, 3].map((num) => (
              <div key={num} className="p-8 rounded-3xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-colors">
                <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center mx-auto mb-6 text-white">
                  <CheckCircle2 size={32} />
                </div>
                <p className="text-xl font-bold text-white leading-tight">{t(`usp.features.${num}`)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* The Gap - Redesigned with Positive Framing */}
      <section className="pt-32 px-6 bg-linear-to-b from-background to-accent/20">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-4xl md:text-4xl font-black mb-6 tracking-tight leading-tight">{t("theGap.title")}</h2>
            <p className="text-xl md:text-2xl text-text-muted font-normal">{t("theGap.subtitle")}</p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Left Side - Where Most Stop */}
            <div className="group p-10 lg:p-12 rounded-3xl bg-white border border-border/50 shadow-elegant hover:shadow-2xl transition-all duration-500">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-14 h-14 rounded-2xl bg-text-muted/10 flex items-center justify-center">
                  <TrendingUp size={28} className="text-text-muted" />
                </div>
                <h3 className="text-2xl lg:text-3xl font-bold">{t("theGap.leftTitle")}</h3>
              </div>
              <ul className="space-y-5">
                {Object.entries(t.raw("theGap.comparison.left")).map(([key, value]: [string, any]) => (
                  <li key={key} className="flex gap-4 items-start text-text-muted">
                    <span className="w-2 h-2 rounded-full bg-text-muted/40 mt-2.5 shrink-0" />
                    <span className="text-lg">{value}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Right Side - Where We Take You */}
            <div className="relative p-10 lg:p-12 rounded-3xl gradient-primary text-white shadow-2xl transform lg:-translate-y-12 overflow-hidden">
              {/* Glow Effect */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full blur-3xl" />

              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center">
                    <Sparkles size={28} className="text-white" />
                  </div>
                  <h3 className="text-2xl lg:text-3xl font-bold">{t("theGap.rightTitle")}</h3>
                </div>
                <ul className="space-y-5">
                  {Object.entries(t.raw("theGap.comparison.right")).map(([key, value]: [string, any]) => (
                    <li key={key} className="flex gap-4 items-start">
                      <CheckCircle2 size={22} className="mt-0.5 shrink-0 text-white" />
                      <span className="text-lg font-medium text-white/95">{value}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="py-24 px-6 bg-background bg-linear-to-b from-background to-accent/20">
        <div className="container mx-auto max-w-7xl">

          <div className="mt-20 p-10 lg:p-12 rounded-3xl glass <border border-border/50 shadow-elegant">
            <h3 className="text-2xl lg:text-3xl font-black mb-4">{t("courses.prReview.title")}</h3>
            <p className="text-text-muted text-lg mb-8">{t("courses.prReview.subtitle")}</p>
            <div className="grid md:grid-cols-3 gap-6 mb-6">
              {t.raw("courses.prReview.criteria").map((criterion: any, idx: number) => (
                <div key={idx} className="p-6 rounded-2xl bg-accent/50 border border-border/50">
                  <div className="font-bold text-lg mb-2">{criterion.name}</div>
                  <div className="text-sm text-text-muted mb-3">{criterion.focus}</div>
                  <div className="text-xs font-bold text-primary">{criterion.scale}</div>
                </div>
              ))}
            </div>
            <p className="text-sm font-semibold text-center text-primary">{t("courses.prReview.passingScore")}</p>
          </div>
        </div>
      </section>
      {/* Course Tiers - Comprehensive */}
      <section className="py-24 text-primary-foreground bg-primary relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/patterns/grid.svg')] opacity-10" />
        <div className="container mx-auto px-6 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white font-bold text-sm mb-8 animate-pulse">
            <ShieldCheck size={18} />
            {t("usp.badge")}
          </div>

          <h2 className="text-4xl md:text-5xl font-black mb-6 tracking-tight text-white">{t("usp.title")}</h2>
          <p className="text-lg md:text-xl text-blue-100 max-w-3xl mx-auto mb-16 leading-relaxed">{t("usp.subtitle")}</p>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[1, 2, 3].map((num) => (
              <div key={num} className="p-8 rounded-3xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-colors">
                <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center mx-auto mb-6 text-white">
                  <CheckCircle2 size={32} />
                </div>
                <p className="text-xl font-bold text-white leading-tight">{t(`usp.features.${num}`)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="py-12 px-6 bg-background bg-linear-to-b from-background to-accent/20">

        <div className="container mx-auto max-w-7xl">
          {/* Analogy Section */}
          <div className="mt-20 p-10 lg:p-12 rounded-3xl bg-linear-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 border border-border/50 shadow-elegant">
            <h3 className="text-2xl lg:text-3xl font-black mb-4 text-center">{t("analogy.title")}</h3>
            <p className="text-text-muted text-lg mb-10 text-center max-w-3xl mx-auto">{t("analogy.subtitle")}</p>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 rounded-2xl gradient-primary mx-auto mb-4 flex items-center justify-center text-white font-black text-2xl">1</div>
                <h4 className="text-xl font-bold mb-3">{t("analogy.tiers.junior.role")}</h4>
                <p className="text-text-muted">{t("analogy.tiers.junior.description")}</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-purple-600 dark:bg-purple-500 mx-auto mb-4 flex items-center justify-center text-white font-black text-2xl">2</div>
                <h4 className="text-xl font-bold mb-3">{t("analogy.tiers.intermediate.role")}</h4>
                <p className="text-text-muted">{t("analogy.tiers.intermediate.description")}</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-secondary to-orange-600 mx-auto mb-4 flex items-center justify-center text-white font-black text-2xl">3</div>
                <h4 className="text-xl font-bold mb-3">{t("analogy.tiers.senior.role")}</h4>
                <p className="text-text-muted">{t("analogy.tiers.senior.description")}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quote Section - Enhanced */}
      {/* <section className="py-32 border-t border-border bg-gradient-to-b from-accent/20 to-accent/5">
        <div className="container mx-auto px-6 text-center max-w-4xl">
          <blockquote className="text-3xl md:text-5xl font-serif italic leading-tight text-foreground/90">
            {t.rich("trust.quote", {
              highlight: (chunks) => (
                <span className="text-primary not-italic font-black relative px-2">
                  {chunks}
                  <span className="absolute inset-x-0 bottom-2 h-4 bg-primary/20 -z-10 -rotate-1 rounded" />
                </span>
              ),
            })}
          </blockquote>
        </div>
      </section> */}
    </div>
  );
}

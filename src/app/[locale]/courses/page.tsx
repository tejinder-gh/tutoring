"use client";

import { Link } from "@/i18n/routing";
import { ArrowRight, BookOpen, CheckCircle2, Code2, Rocket } from "lucide-react";
import { useTranslations } from "next-intl";

export default function CoursesPage() {
  const t = useTranslations("courses");

  const roadmaps = [
    {
      id: "fundamentals",
      slug: "fundamentals",
      icon: BookOpen,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      id: "handsOn",
      slug: "full-stack-training",
      icon: Code2,
      color: "text-primary",
      bgColor: "bg-primary/10",
      featured: true,
    },
    {
      id: "career",
      slug: "career-advancement",
      icon: Rocket,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
    },
  ];

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background">
      <div className="container px-6 py-20 mx-auto">
        <div className="max-w-3xl mb-20">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-foreground mb-6">
            {t("title")}
          </h1>
          <p className="text-xl text-text-muted leading-relaxed">
            {t("subtitle")}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {roadmaps.map((item) => {
            const track = t.raw(`roadmap.${item.id}`);
            return (
              <div
                key={item.id}
                className={`group relative flex flex-col p-8 rounded-3xl border transition-all duration-300 hover:shadow-2xl
                  ${item.featured
                    ? 'border-primary bg-accent/10 shadow-xl shadow-primary/5 scale-105 z-10'
                    : 'border-border bg-accent/5 hover:border-border/80'
                  }`}
              >
                {item.featured && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-black text-xs font-black px-4 py-1 rounded-full shadow-lg">
                    MOST POPULAR
                  </div>
                )}

                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110 ${item.bgColor} ${item.color}`}>
                  <item.icon size={28} />
                </div>

                <h3 className="text-2xl font-bold text-foreground mb-2">
                  {track.title}
                </h3>
                <p className="text-sm font-semibold text-primary mb-4 uppercase tracking-wider">
                  {track.subtitle}
                </p>
                <p className="text-text-muted mb-8 line-clamp-3">
                  {track.description}
                </p>

                <div className="space-y-3 mb-10 flex-1">
                  {Object.values(track.features).map((feature: any, idx) => (
                    <div key={idx} className="flex items-start gap-3 text-sm text-foreground/80">
                      <CheckCircle2 size={18} className="text-primary shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>

                <Link
                  href={`/courses/${item.slug}`}
                  className={`flex items-center justify-center gap-2 py-4 rounded-xl font-bold transition-all
                    ${item.featured
                      ? 'bg-primary text-black hover:opacity-90'
                      : 'bg-accent text-foreground hover:bg-accent/80'
                    }`}
                >
                  {track.cta} <ArrowRight size={18} />
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

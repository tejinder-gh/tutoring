"use client";

import { Link } from "@/i18n/routing";
import { ArrowRight, BookOpen, Rocket, Users } from "lucide-react";
import { useTranslations } from "next-intl";

export default function CoursesPage() {
  const t = useTranslations("courses");

  // Helper to get tier data properly typed/handled
  const tiers = ['tier1', 'tier2', 'tier3'];

  return (
    <div className="min-h-screen bg-background py-20 px-6">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-20 max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-black mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary to-indigo-600">
            {t("title")}
          </h1>
          <p className="text-xl text-muted-foreground leading-relaxed">
            {t("subtitle")}
          </p>
        </div>

        <div className="space-y-16">
          {tiers.map((tierKey, index) => {
             // Access raw data for nested arrays/objects
             const tierData = t.raw(`tiers.${tierKey}`);

             return (
              <div key={tierKey} className="relative rounded-3xl border border-border bg-card overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-300">
                {/* Header */}
                <div className="p-8 md:p-10 border-b border-border bg-accent/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                  <div>
                    <div className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary font-bold text-sm mb-4">
                      {tierData.role}
                    </div>
                    <h2 className="text-3xl font-bold mb-2">{tierData.title}</h2>
                    <p className="text-muted-foreground font-medium max-w-2xl">{tierData.description}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2 shrink-0">
                     <span className="text-sm font-semibold text-muted-foreground">Experience equivalent</span>
                     <span className="text-2xl font-black text-foreground">{tierData.experience}</span>
                  </div>
                </div>

                {/* Modules Grid */}
                <div className="p-8 md:p-10">
                   <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                      <BookOpen className="text-primary" size={20} />
                      Modules & Outcomes
                   </h3>
                   <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-6 mb-10">
                      {tierData.modules.map((module: any, idx: number) => (
                        <div key={idx} className="p-5 rounded-2xl bg-background border border-border/50 hover:border-primary/30 transition-colors">
                           <div className="flex justify-between items-start mb-2">
                              <span className="text-xs font-black text-primary uppercase tracking-wide">{module.code}</span>
                           </div>
                           <h4 className="font-bold text-lg mb-2">{module.title}</h4>
                           <div className="space-y-1 text-sm">
                              <p className="text-muted-foreground"><strong className="text-foreground">Tech:</strong> {module.tech}</p>
                              <p className="text-muted-foreground"><strong className="text-foreground">Outcome:</strong> {module.outcome}</p>
                           </div>
                        </div>
                      ))}
                   </div>

                   {/* Footer Info: Soft Skills & Capstone */}
                   <div className="grid md:grid-cols-2 gap-8 pt-8 border-t border-border">
                      <div className="flex gap-4">
                         <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                            <Users size={24} />
                         </div>
                         <div>
                            <h4 className="font-bold mb-1">Soft Skills Focus</h4>
                            <p className="text-sm text-muted-foreground mb-1">{tierData.softSkills.focus}</p>
                            <p className="text-xs font-semibold text-primary bg-primary/5 px-2 py-1 rounded inline-block">Measurable: {tierData.softSkills.key}</p>
                         </div>
                      </div>

                       <div className="flex gap-4">
                         <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                            <Rocket size={24} />
                         </div>
                         <div>
                            <h4 className="font-bold mb-1">Capstone Requirement</h4>
                            <p className="text-sm text-muted-foreground">{tierData.capstone}</p>
                         </div>
                      </div>
                   </div>
                </div>
              </div>
             )
          })}
        </div>

        <div className="mt-20 text-center">
             <Link href="/register" className="inline-flex items-center gap-2 px-10 py-5 rounded-2xl bg-primary text-white font-bold text-lg shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all">
                Start Your Journey <ArrowRight size={20} />
             </Link>
        </div>
      </div>
    </div>
  );
}

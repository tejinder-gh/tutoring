"use client";

import { Link } from "@/i18n/routing";
import { ArrowRight, BookOpen, CheckCircle, Rocket, ShieldCheck, Users } from "lucide-react";
import { useTranslations } from "next-intl";
import Divider from "../../../components/lib/SectionDivision";

const getColor = (index: number) => {
   const COLOR_SCHEMES = [
      // Tier 1: Blue/Indigo
      {
         name: 'blue-indigo',
         gradient: 'from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950',
         gradientButton: 'from-blue-600 to-indigo-600',
         badge: 'bg-primary/10 text-primary',
         title: 'text-primary',
         iconColor: 'text-primary',
         iconBg: 'bg-blue-100 dark:bg-blue-900/30 text-primary',
         outcome: 'text-primary',
         softSkillBg: 'bg-accent/50',
         softSkillBorder: 'border-blue-200/50 dark:border-blue-800/50',
         softSkillText: 'text-primary',
         cardBorder: 'border-border/50',
         cardHover: 'hover:shadow-elegant'
      },
      // Tier 2: Purple/Pink
      {
         name: 'purple-pink',
         gradient: 'from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950',
         gradientButton: 'from-purple-600 to-pink-600',
         badge: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
         title: 'text-purple-600 dark:text-purple-400',
         iconColor: 'text-purple-600 dark:text-purple-400',
         iconBg: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
         outcome: 'text-purple-600 dark:text-purple-400',
         softSkillBg: 'bg-purple-50 dark:bg-purple-900/10',
         softSkillBorder: 'border-purple-200/50 dark:border-purple-800/50',
         softSkillText: 'text-purple-600 dark:text-purple-400',
         cardBorder: 'border-border/50',
         cardHover: 'hover:shadow-elegant'
      },
      // Tier 3: Amber/Orange
      {
         name: 'amber-orange',
         gradient: 'from-amber-50 to-orange-50 dark:from-amber-950 dark:to-orange-950',
         gradientButton: 'from-amber-600 to-orange-600',
         badge: 'bg-secondary/10 text-secondary',
         title: 'text-secondary',
         iconColor: 'text-secondary',
         iconBg: 'bg-orange-100 dark:bg-orange-900/30 text-secondary',
         outcome: 'text-secondary',
         softSkillBg: 'bg-orange-50 dark:bg-orange-900/10',
         softSkillBorder: 'border-orange-200/50 dark:border-orange-800/50',
         softSkillText: 'text-secondary',
         cardBorder: 'border-border/50',
         cardHover: 'hover:shadow-elegant'
      },
      // Additional schemes for expansion
      // Emerald/Teal
      {
         name: 'emerald-teal',
         gradient: 'from-emerald-50 to-teal-50 dark:from-emerald-950 dark:to-teal-950',
         gradientButton: 'from-emerald-600 to-teal-600',
         badge: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
         title: 'text-emerald-600 dark:text-emerald-400',
         iconColor: 'text-emerald-600 dark:text-emerald-400',
         iconBg: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400',
         outcome: 'text-emerald-600 dark:text-emerald-400',
         softSkillBg: 'bg-emerald-50 dark:bg-emerald-900/10',
         softSkillBorder: 'border-emerald-200/50 dark:border-emerald-800/50',
         softSkillText: 'text-emerald-600 dark:text-emerald-400',
         cardBorder: 'border-border/50',
         cardHover: 'hover:shadow-elegant'
      },
      // Rose/Pink
      {
         name: 'rose-pink',
         gradient: 'from-rose-50 to-pink-50 dark:from-rose-950 dark:to-pink-950',
         gradientButton: 'from-rose-600 to-pink-600',
         badge: 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
         title: 'text-rose-600 dark:text-rose-400',
         iconColor: 'text-rose-600 dark:text-rose-400',
         iconBg: 'bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400',
         outcome: 'text-rose-600 dark:text-rose-400',
         softSkillBg: 'bg-rose-50 dark:bg-rose-900/10',
         softSkillBorder: 'border-rose-200/50 dark:border-rose-800/50',
         softSkillText: 'text-rose-600 dark:text-rose-400',
         cardBorder: 'border-border/50',
         cardHover: 'hover:shadow-elegant'
      },
      // Cyan/Sky
      {
         name: 'cyan-sky',
         gradient: 'from-cyan-50 to-sky-50 dark:from-cyan-950 dark:to-sky-950',
         gradientButton: 'from-cyan-600 to-sky-600',
         badge: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400',
         title: 'text-cyan-600 dark:text-cyan-400',
         iconColor: 'text-cyan-600 dark:text-cyan-400',
         iconBg: 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400',
         outcome: 'text-cyan-600 dark:text-cyan-400',
         softSkillBg: 'bg-cyan-50 dark:bg-cyan-900/10',
         softSkillBorder: 'border-cyan-200/50 dark:border-cyan-800/50',
         softSkillText: 'text-cyan-600 dark:text-cyan-400',
         cardBorder: 'border-border/50',
         cardHover: 'hover:shadow-elegant'
      },
      // Lime/Emerald
      {
         name: 'lime-emerald',
         gradient: 'from-lime-50 to-emerald-50 dark:from-lime-950 dark:to-emerald-950',
         gradientButton: 'from-lime-600 to-emerald-600',
         badge: 'bg-lime-500/10 text-lime-700 dark:text-lime-400',
         title: 'text-lime-700 dark:text-lime-400',
         iconColor: 'text-lime-700 dark:text-lime-400',
         iconBg: 'bg-lime-100 dark:bg-lime-900/30 text-lime-700 dark:text-lime-400',
         outcome: 'text-lime-700 dark:text-lime-400',
         softSkillBg: 'bg-lime-50 dark:bg-lime-900/10',
         softSkillBorder: 'border-lime-200/50 dark:border-lime-800/50',
         softSkillText: 'text-lime-700 dark:text-lime-400',
         cardBorder: 'border-border/50',
         cardHover: 'hover:shadow-elegant'
      },
      // Slate/Gray (Neutral)
      // {
      //    name: 'slate-gray',
      //    gradient: 'from-slate-50 to-gray-50 dark:from-slate-950 dark:to-gray-950',
      //    gradientButton: 'from-slate-600 to-gray-600',
      //    badge: 'bg-slate-500/10 text-slate-700 dark:text-slate-300',
      //    title: 'text-slate-700 dark:text-slate-300',
      //    iconColor: 'text-slate-600 dark:text-slate-400',
      //    iconBg: 'bg-slate-100 dark:bg-slate-900/30 text-slate-600 dark:text-slate-400',
      //    outcome: 'text-slate-600 dark:text-slate-400',
      //    softSkillBg: 'bg-slate-50 dark:bg-slate-900/10',
      //    softSkillBorder: 'border-slate-200/50 dark:border-slate-800/50',
      //    softSkillText: 'text-slate-600 dark:text-slate-400',
      //    cardBorder: 'border-border/50',
      //    cardHover: 'hover:shadow-elegant'
      // }
   ];
   return COLOR_SCHEMES[index % COLOR_SCHEMES.length];
};

const CourseCard = ({ tierData, t, index }: { tierData: any, t: any, index: number }) => {
   const colorScheme = getColor(index);
   return <div key={tierData.title} className={`relative rounded-3xl border border-border bg-card overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group ${colorScheme.cardHover}`}>
      {/* Header */}
      <div className={`p-8 md:p-10 border-b border-border bg-linear-to-br ${colorScheme.gradient} flex flex-col md:flex-row justify-between items-start md:items-center gap-6`}>
         <div>
            <div className={`inline-block px-4 py-1.5 rounded-full font-bold text-sm mb-4 ${colorScheme.badge}`}>
               {tierData.role}
            </div>
            <h2 className="text-3xl font-bold mb-2 text-foreground">{tierData.title}</h2>
            <p className="text-muted-foreground font-medium max-w-2xl">{tierData.description}</p>
         </div>
         <div className="flex flex-col items-end gap-2 shrink-0">
            <span className="text-sm font-semibold text-muted-foreground">{t("courseLength")}</span>
            <span className="text-2xl font-black text-foreground">{tierData.courseLength}</span>
            <Link href={`/contact/${tierData.title}`} className={`inline-flex items-center gap-2 px-6 py-3 mt-4 rounded-2xl bg-linear-to-r ${colorScheme.gradientButton} text-white font-bold text-lg shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all`}>
               {t("knowMore")}
            </Link>
         </div>
      </div>

      {/* Modules Grid */}
      <div className="p-8 md:p-10">
         <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
            <BookOpen className={colorScheme.title} size={20} />
            {t("modulesAndOutcomes")}
         </h3>
         <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-6">
            {tierData.modules.map((module: any, idx: number) => (
               <div key={idx} className="p-6 rounded-2xl glass border border-border/50 hover:shadow-elegant transition-all duration-300">
                  <div className="flex justify-between items-start mb-2">
                     <span className={`text-xs font-black uppercase tracking-wide ${colorScheme.title}`}>{module.code}</span>
                  </div>
                  <h4 className="font-bold text-lg mb-3">{module.title}</h4>
                  <div className="space-y-2 text-sm">
                     <p className="text-muted-foreground mb-3">{module.tech}</p>
                     <div className="text-xs font-bold text-foreground/80 flex items-start gap-2 bg-accent/30 p-2 rounded-lg">
                        <CheckCircle size={16} className={`mt-0.5 shrink-0 ${colorScheme.iconColor}`} />
                        <span>{module.outcome}</span>
                     </div>
                  </div>
               </div>
            ))}
         </div>
      </div>

      {/* Footer Info: Soft Skills & Capstone */}
      <div className="p-8 md:p-10 border-t border-border/50">
         <div className="grid md:grid-cols-2 gap-6">
            {/* Soft Skills Card */}
            <div className={`p-6 rounded-2xl ${colorScheme.softSkillBg} border ${colorScheme.softSkillBorder}`}>
               <div className="flex items-center gap-3 mb-3">
                  <div className={`p-2 rounded-lg ${colorScheme.iconBg}`}>
                     <Users size={20} className={colorScheme.iconColor} />
                  </div>
                  <h5 className="text-lg font-bold">{t("softSkillsFocus")}</h5>
               </div>
               <p className="text-text-muted mb-3 text-sm">{tierData.softSkills.focus}</p>
               <p className={`text-xs font-bold px-2 py-1 rounded inline-block bg-white/50 dark:bg-black/20 ${colorScheme.softSkillText}`}>Measurable: {tierData.softSkills.assessment}</p>
            </div>

            {/* Capstone Card */}
            <div className={`p-6 rounded-2xl ${colorScheme.softSkillBg} border ${colorScheme.softSkillBorder}`}>
               <div className="flex items-center gap-3 mb-3">
                  <div className={`p-2 rounded-lg ${colorScheme.iconBg}`}>
                     <Rocket size={20} className={colorScheme.iconColor} />
                  </div>
                  <h5 className="text-lg font-bold">{t("capstoneRequirement")}</h5>
               </div>
               <p className="text-text-muted text-sm">{tierData.capstone}</p>
            </div>
         </div>
      </div>
   </div>
}
export default function CoursesPage() {
   const t = useTranslations("courses");

   // Helper to get tier data properly typed/handled
   const tiers = t.raw(`tiers`);
   console.log(tiers);
   const partneredTiers: any[] = [];
   return (
      <div className="min-h-screen bg-background py-20 px-6">
         <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-20 max-w-3xl mx-auto">
               <h1 className="text-4xl md:text-5xl font-black mb-6 bg-clip-text text-transparent bg-linear-to-r from-primary to-primary">
                  {t("title")}
               </h1>
               <p className="text-xl text-muted-foreground leading-relaxed mb-8">
                  {t("subtitle")}
               </p>

               {/* Money Back Guarantee Badge - Premium Gold */}
               <div className="inline-flex flex-col md:flex-row items-center gap-4 p-5 rounded-2xl bg-emerald-100 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-700/50 text-left shadow-lg shadow-emerald-500/10">
                  <div className="w-14 h-14 rounded-xl bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center shrink-0 text-emerald-600 dark:text-emerald-500">
                     <ShieldCheck size={28} />
                  </div>
                  <div>
                     <div className="text-sm font-bold text-emerald-600 dark:text-emerald-500 mb-0.5 uppercase tracking-wide">
                        {t("guarantee.badge")}
                     </div>
                     <div className="font-bold text-xl text-foreground mb-1">
                        {t("guarantee.title")}
                     </div>
                     <div className="text-sm text-muted-foreground max-w-xl">
                        {t("guarantee.description")}
                     </div>
                  </div>
               </div>
            </div>

            <div className="space-y-16">
               {Object.values(tiers).map((tier: any, index: number) => {
                  // Access raw data for nested arrays/objects
                  // const tierData = t.raw(`tiers.${tierKey}`);
                  if (tier.parteneredWith) {
                     partneredTiers.push(tier);
                  } else
                     return (
                        <div key={index} className="relative">
                           {/* Roadmap Connector */}
                           {index > 0 && (
                              <div className="absolute -top-16 left-1/2 -translate-x-1/2 h-16 w-1 bg-gradient-to-b from-border/0 via-primary/20 to-border/0 flex items-center justify-center">
                                 <div className="w-3 h-3 rounded-full bg-primary/20" />
                              </div>
                           )}

                           {/* Step Label */}
                           {tier.step && (
                              <div className="absolute -top-5 left-8 z-10">
                                 <span className="bg-background border border-border px-3 py-1 rounded-full text-xs font-bold text-muted-foreground uppercase tracking-widest shadow-sm">
                                    {tier.step}
                                 </span>
                              </div>
                           )}

                           <CourseCard tierData={tier} t={t} index={index} />
                        </div>
                     )
               })}
            </div>
            {partneredTiers.length > 0 && <Divider title={t("partneredTiers")} />}
            <div className="space-y-16">
               {partneredTiers.map((tier: any, index: number) => {
                  // Access raw data for nested arrays/objects
                  return <CourseCard key={index} tierData={tier} t={t} index={index + Object.keys(tiers).length - partneredTiers.length} />
               })}
            </div>
            <div className="mt-20 text-center">
               <Link href="/register" className="inline-flex items-center gap-2 px-10 py-5 rounded-2xl bg-primary text-white font-bold text-lg shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all">
                  {t("startYourJourney")} <ArrowRight size={20} />
               </Link>
            </div>
         </div>
      </div>
   );
}

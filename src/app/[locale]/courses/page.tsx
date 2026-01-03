"use client";

import CourseDetailsModal from "@/components/CourseDetailsModal";
import { Link } from "@/i18n/routing";
import { ArrowRight, BookOpen, CheckCircle, Rocket, ShieldCheck, Users } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import Divider from "../../../components/lib/SectionDivision";

const getColor = (index: number) => {
   // Simplified color schemes to match the app's theme
   const COLOR_SCHEMES = [
      // Primary: Indigo/Blue based
      {
         name: 'primary-theme',
         gradient: 'from-primary/5 to-primary/10 dark:from-primary/10 dark:to-primary/20',
         gradientButton: 'from-primary to-primary/90',
         badge: 'bg-primary/10 text-primary',
         title: 'text-foreground',
         iconColor: 'text-primary',
         iconBg: 'bg-primary/10 text-primary',
         outcome: 'text-primary',
         softSkillBg: 'bg-primary/5',
         softSkillBorder: 'border-primary/20',
         softSkillText: 'text-primary',
         cardBorder: 'border-border',
         cardHover: 'hover:shadow-elegant hover:border-primary/30'
      },
      // Secondary: Purple/Violet based (Complementary)
      {
         name: 'secondary-theme',
         gradient: 'from-secondary/5 to-secondary/10 dark:from-secondary/10 dark:to-secondary/20',
         gradientButton: 'from-secondary to-secondary/90',
         badge: 'bg-secondary/10 text-secondary',
         title: 'text-foreground',
         iconColor: 'text-secondary',
         iconBg: 'bg-secondary/10 text-secondary',
         outcome: 'text-secondary',
         softSkillBg: 'bg-secondary/5',
         softSkillBorder: 'border-secondary/20',
         softSkillText: 'text-secondary',
         cardBorder: 'border-border',
         cardHover: 'hover:shadow-elegant hover:border-secondary/30'
      }
   ];
   return (COLOR_SCHEMES[index % COLOR_SCHEMES.length] || COLOR_SCHEMES[0])!;
};

export const CourseCard = ({ tierData, t, index, onOpenModal }: { tierData: any, t: any, index: number, onOpenModal?: (tier: any, scheme: any) => void }) => {
   const colorScheme = getColor(index);
   return <div key={tierData.title} className={`relative rounded-3xl border border-border bg-card overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group ${colorScheme.cardHover}`}>
      {/* Header */}
      <div className={`p-8 md:p-10 border-b border-border bg-linear-to-br ${colorScheme.gradient} flex flex-col md:flex-row justify-between items-start md:items-center gap-6`}>
         <div>
            <div className="flex flex-wrap gap-2 mb-4">
               {tierData.popular && (
                  <div className="inline-block px-4 py-1.5 rounded-full font-bold text-sm bg-linear-to-r from-amber-500 to-orange-500 text-white shadow-md">
                     {tierData.popular}
                  </div>
               )}
               <div className={`inline-block px-4 py-1.5 rounded-full font-bold text-sm ${colorScheme.badge}`}>
                  {tierData.role}
               </div>
            </div>
            <h2 className="text-3xl font-bold mb-2 text-foreground">{tierData.title}</h2>
            <p className="text-muted-foreground font-medium max-w-2xl">{tierData.description}</p>
         </div>
         <div className="flex flex-col items-end gap-2 shrink-0">
            <span className="text-sm font-semibold text-muted-foreground">{t("courseLength")}</span>
            <span className="text-2xl font-black text-foreground">{tierData.courseLength}</span>
            {onOpenModal && <button
               onClick={() => { onOpenModal(tierData, colorScheme) }}
               className={`inline-flex items-center gap-2 px-6 py-3 mt-4 rounded-2xl bg-linear-to-r ${colorScheme.gradientButton} text-white font-bold text-lg shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all`}>
               {t("knowMore")}
            </button>}
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
   const partneredTiers: any[] = [];

   const [selectedTier, setSelectedTier] = useState<any>(null);
   const [selectedColorScheme, setSelectedColorScheme] = useState<any>(null);
   const [isModalOpen, setIsModalOpen] = useState(false);

   // Expose handler to window for Code component access if needed, or better, lift state up
   // For now, let's just pass the handler down or use context.
   // Wait, CourseCard is defined *inside* the file but outside the component?
   // Ah, CourseCard is a separate component. I need to pass the handler to it.

   const handleOpenModal = (tier: any, scheme: any) => {
      setSelectedTier(tier);
      setSelectedColorScheme(scheme);
      setIsModalOpen(true);
   };

   // Patching the window object is messy. Let's update CourseCard signature.

   return (
      <div className="min-h-screen bg-background py-20 px-6">
         <CourseDetailsModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            tierData={selectedTier}
            colorScheme={selectedColorScheme}
            title={selectedTier?.title}
         />
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
                              <div className="absolute -top-16 left-1/2 -translate-x-1/2 h-16 w-1 bg-linear-to-b from-border/0 via-primary/20 to-border/0 flex items-center justify-center">
                                 <div className="w-3 h-3 rounded-full bg-primary/20" />
                              </div>
                           )}

                           {/* Step Label */}
                           {
                              <div className="absolute -top-5 left-8 z-10">
                                 <span className="bg-background border border-border px-3 py-1 rounded-full text-xs font-bold text-muted-foreground uppercase tracking-widest shadow-sm">
                                    {t(`step`) + " " + (index > 10 ? (index + 1) : "0" + (index + 1))}
                                 </span>
                              </div>
                           }

                           <CourseCard key={index} tierData={tier} t={t} index={index} onOpenModal={handleOpenModal} />
                        </div>
                     )
               })}
            </div>
            {partneredTiers.length > 0 && <Divider title={t("partneredTiers")} />}
            <div className="space-y-16">
               {partneredTiers.map((tier: any, index: number) => {
                  // Access raw data for nested arrays/objects
                  return <CourseCard key={index} tierData={tier} t={t} index={index + Object.keys(tiers).length + 1 - partneredTiers.length} onOpenModal={handleOpenModal} />
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

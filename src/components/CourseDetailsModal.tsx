"use client";

import { Link } from "@/i18n/routing";
import { CheckCircle2, Rocket, Users, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

interface CourseDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  tierData: any;
  colorScheme: any;
  title: string;
}

/**
 * Modal component for displaying detailed course tier information.
 * Uses a portal to render outside the main DOM hierarchy.
 *
 * @param isOpen - Controls modal visibility
 * @param onClose - Handler to close the modal
 * @param tierData - The data object for the specific course tier
 * @param colorScheme - The color theme associated with the tier
 * @param title - Title of the modal/tier
 */
export default function CourseDetailsModal({
  isOpen,
  onClose,
  tierData,
  colorScheme,
  title
}: CourseDetailsModalProps) {
  const t = useTranslations("courses.modal");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!mounted || !isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-background rounded-3xl shadow-2xl border border-border animate-in fade-in zoom-in-95 duration-200">

        {/* Header */}
        <div className={`sticky top-0 z-10 flex items-center justify-between p-6 border-b border-border bg-background/80 backdrop-blur-md`}>
          <div>
            <div className={`inline-block px-3 py-1 rounded-full text-xs font-bold mb-2 ${colorScheme.badge}`}>
              {tierData.role}
            </div>
            <h2 className="text-2xl font-bold">{tierData.title}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-accent transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-8">
          {/* Description */}
          <p className="text-lg text-muted-foreground leading-relaxed">
            {tierData.description}
          </p>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Modules List */}
            <div className="space-y-6">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <span className={`p-2 rounded-lg ${colorScheme.iconBg}`}>
                  <Rocket size={20} className={colorScheme.iconColor} />
                </span>
                Curriculum Breakdown
              </h3>
              <div className="space-y-4">
                {tierData.modules.map((module: any, idx: number) => (
                  <div key={idx} className="p-4 rounded-xl border border-border bg-card/50">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-bold text-foreground">{module.title}</span>
                      <span className={`text-[10px] font-black uppercase ${colorScheme.title}`}>{module.code}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{module.details}</p>
                    <div className="flex items-start gap-2 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 size={14} className="mt-0.5 shrink-0" />
                      <span>Outcome: {module.outcome}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Sidebar Info */}
            <div className="space-y-6">
              {/* Soft Skills */}
              <div className={`p-6 rounded-2xl ${colorScheme.softSkillBg} border ${colorScheme.softSkillBorder}`}>
                <h4 className="font-bold flex items-center gap-2 mb-3">
                  <Users size={18} className={colorScheme.iconColor} />
                  Soft Skills Focus
                </h4>
                <p className="text-sm text-foreground/80 mb-4">{tierData.softSkills.details}</p>
                <div className="text-xs font-semibold bg-background/50 p-2 rounded-lg">
                  Assessment: {tierData.softSkills.assessment}
                </div>
              </div>

              {/* Capstone */}
              <div className="p-6 rounded-2xl bg-accent/20 border border-border">
                <h4 className="font-bold mb-2">Final Capstone</h4>
                <p className="text-sm text-muted-foreground">{tierData.capstone}</p>
              </div>

              {/* CTA */}
              <div className="pt-4">
                <Link
                  href="/contact"
                  className={`w-full block text-center py-4 rounded-xl font-bold text-white shadow-lg transform transition active:scale-95 bg-gradient-to-r ${colorScheme.gradientButton}`}
                >
                  Apply for {title} Track
                </Link>
                <p className="text-xs text-center text-muted-foreground mt-3">
                  Limited seats available for next batch
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

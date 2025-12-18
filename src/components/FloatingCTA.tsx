"use client";

import { Link } from "@/i18n/routing";
import { Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";

export default function FloatingCTA({ seatsLeft = 10 }: { seatsLeft?: number }) {
  const t = useTranslations("floating");

  return (
    <div className="fixed bottom-8 right-8 z-50 group">
      <Link
        href="/register"
        className="flex items-center gap-4 bg-primary text-black font-black px-6 py-4 rounded-2xl shadow-2xl shadow-primary/30 hover:scale-105 active:scale-95 transition-all duration-300"
      >
        <div className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-black opacity-40"></span>
          <Sparkles className="relative inline-flex h-3 w-3" />
        </div>
        <div className="flex flex-col leading-tight">
          <span className="text-[10px] uppercase tracking-widest opacity-70">
            {t("applyNow")}
          </span>
          <span className="text-sm font-bold">
            {t("seatsLeft", { count: seatsLeft })}
          </span>
        </div>
      </Link>
    </div>
  );
}

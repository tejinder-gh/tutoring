"use client";

import { AlertTriangle, RefreshCcw } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("errors.general");

  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Application Error:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4 text-center">
      <div className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center mb-6">
        <AlertTriangle className="text-red-500 w-12 h-12" />
      </div>
      <h1 className="text-3xl font-bold text-foreground mb-4">
        {t("title")}
      </h1>
      <p className="text-text-muted max-w-md mb-8">
        {t("description")}
      </p>

      <div className="flex gap-4">
        <button
          onClick={reset}
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-black font-bold rounded-xl hover:opacity-90 transition-opacity"
        >
          <RefreshCcw size={20} />
          {t("tryAgain")}
        </button>
      </div>
      {error.digest && (
        <p className="mt-8 text-xs text-text-muted font-mono">
          Error ID: {error.digest}
        </p>
      )}
    </div>
  );
}

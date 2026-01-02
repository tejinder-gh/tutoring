"use client";

import { Download, Loader2 } from "lucide-react";
import { useState } from "react";

interface ExportButtonProps {
  label: string;
  exportAction: () => Promise<{ csv: string; filename: string }>;
  variant?: "primary" | "secondary";
}

export function ExportButton({ label, exportAction, variant = "secondary" }: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const { csv, filename } = await exportAction();

      // Create blob and download
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Export failed:", error);
      alert("Export failed. Please try again.");
    }
    setIsExporting(false);
  };

  return (
    <button
      onClick={handleExport}
      disabled={isExporting}
      className={`inline-flex items-center gap-2 px-4 py-2 font-medium rounded-lg disabled:opacity-50 text-sm transition ${variant === "primary"
          ? "bg-primary text-primary-foreground hover:opacity-90"
          : "bg-accent text-foreground hover:bg-accent/80"
        }`}
    >
      {isExporting ? (
        <Loader2 size={16} className="animate-spin" />
      ) : (
        <Download size={16} />
      )}
      {isExporting ? "Exporting..." : label}
    </button>
  );
}

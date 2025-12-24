"use client";

import { logLeadActivity } from "@/app/actions/lead";
import { Loader2, Send } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LogActivityForm({ leadId }: { leadId: string }) {
  const [type, setType] = useState("NOTE");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!notes.trim()) return;

    setLoading(true);
    try {
      await logLeadActivity(leadId, type, notes);
      setNotes("");
      router.refresh(); // Refresh to show new activity
    } catch (error) {
      console.error(error);
      alert("Failed to log activity");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
      <h3 className="text-sm font-semibold mb-3">Log Activity</h3>

      <div className="flex gap-2 mb-3">
        {["NOTE", "CALL", "EMAIL", "WHATSAPP"].map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setType(t)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors border ${type === t
                ? "bg-slate-900 text-white border-slate-900 dark:bg-white dark:text-slate-900"
                : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50 dark:bg-slate-900 dark:text-slate-400 dark:border-slate-700"
              }`}
          >
            {t}
          </button>
        ))}
      </div>

      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder={`Add a ${type.toLowerCase()} note...`}
        className="w-full text-sm p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-1000 resize-none focus:outline-none focus:ring-2 focus:ring-primary/20"
        rows={3}
      />

      <div className="flex justify-end mt-2">
        <button
          type="submit"
          disabled={loading || !notes.trim()}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-xs font-bold rounded-lg hover:opacity-90 disabled:opacity-50 transition-opacity"
        >
          {loading ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
          Log Activity
        </button>
      </div>
    </form>
  );
}

"use client";

import { formatDistanceToNow } from "date-fns";
import { Mail, MessageSquare, Phone, RefreshCw, StickyNote } from "lucide-react";

type Activity = {
  id: string;
  type: string;
  notes: string;
  createdBy: string;
  createdAt: Date;
};

const icons: Record<string, any> = {
  CALL: Phone,
  EMAIL: Mail,
  NOTE: StickyNote,
  STATUS_CHANGE: RefreshCw,
  WHATSAPP: MessageSquare
};

export default function ActivityFeed({ activities }: { activities: Activity[] }) {
  if (activities.length === 0) {
    return (
      <div className="text-center py-8 text-slate-500 text-sm">
        No activity recorded yet.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {activities.map((activity, index) => {
        const Icon = icons[activity.type] || StickyNote;

        return (
          <div key={activity.id} className="relative flex gap-4">
            {/* Timeline Line */}
            {index !== activities.length - 1 && (
              <div className="absolute left-3.5 top-8 bottom-[-24px] w-0.5 bg-slate-200 dark:bg-slate-800" />
            )}

            <div className="relative z-10 w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center border border-slate-200 dark:border-slate-700 shrink-0">
              <Icon size={14} className="text-slate-500 dark:text-slate-400" />
            </div>

            <div className="flex-1 pb-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-foreground uppercase tracking-wider">
                  {activity.type.replace("_", " ")}
                </span>
                <span className="text-xs text-text-muted">
                  {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                </span>
              </div>
              <div className="text-sm text-foreground bg-slate-50 dark:bg-slate-900/50 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                {activity.notes}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  subtext?: string;
  trend?: 'up' | 'down' | 'neutral';
}

export default function StatCard({ title, value, icon: Icon, subtext, trend }: StatCardProps) {
  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
          <h3 className="text-2xl font-bold mt-2 text-slate-900 dark:text-white">{value}</h3>
        </div>
        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-blue-600 dark:text-blue-400">
          <Icon size={24} />
        </div>
      </div>
      {subtext && (
        <p className="mt-4 text-xs text-slate-400">
          {subtext}
        </p>
      )}
    </div>
  );
}

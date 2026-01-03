import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  subtext?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  trendLabel?: string;
}

export default function StatCard({ title, value, icon: Icon, subtext, trend, trendValue, trendLabel }: StatCardProps) {
  const trendColor = trend === 'up' ? 'text-green-500' : trend === 'down' ? 'text-red-500' : 'text-slate-500';

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
      {(subtext || trendValue) && (
        <div className="mt-4 flex items-center gap-2 text-xs">
          {trendValue && (
            <span className={`font-semibold ${trendColor}`}>
              {trend === 'up' ? '+' : ''}{trendValue}
            </span>
          )}
          <span className="text-slate-400">
            {trendLabel || subtext}
          </span>
        </div>
      )}
    </div>
  );
}

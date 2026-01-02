"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
// Given previous tool outputs, I haven't seen specific UI lib components, but commonly Next.js projects use them.
// I will stick to standard Tailwind classes to be safe, like in previous components.

import { ArrowLeft, ArrowRight, Clock, Database, MousePointer } from "lucide-react";

interface AuditLog {
  id: string;
  action: string;
  entity: string;
  entityId: string | null;
  createdAt: Date;
  user: {
    name: string;
    email: string;
  };
  details?: any;
}

interface Props {
  initialLogs: AuditLog[];
  initialTotal: number;
  initialPage: number;
  initialTotalPages: number;
}

export function AuditLogTable({ initialLogs, initialTotal, initialPage, initialTotalPages }: Props) {
  const router = useRouter();
  const [page, setPage] = useState(initialPage);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    router.push(`?page=${newPage}`);
  };

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-accent/50 text-text-muted font-medium border-b border-border">
            <tr>
              <th className="px-6 py-4">User</th>
              <th className="px-6 py-4">Action</th>
              <th className="px-6 py-4">Entity</th>
              <th className="px-6 py-4">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {initialLogs.map((log) => (
              <tr key={log.id} className="hover:bg-accent/5 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs text-primary font-bold">
                      {log.user.name[0]}
                    </div>
                    <div className="flex flex-col">
                      <span className="font-medium text-foreground">{log.user.name}</span>
                      <span className="text-xs text-text-muted">{log.user.email}</span>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs font-bold ${log.action.includes('DELETE') ? 'bg-red-500/10 text-red-500' :
                      log.action.includes('UPDATE') ? 'bg-blue-500/10 text-blue-500' :
                        log.action.includes('CREATE') ? 'bg-green-500/10 text-green-500' :
                          'bg-slate-500/10 text-slate-500'
                    }`}>
                    <MousePointer size={12} />
                    {log.action}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-1 font-mono text-xs text-text-muted">
                      <Database size={12} />
                      {log.entity}
                    </div>
                    <span className="text-xs font-mono opacity-60 truncate max-w-[150px]">
                      {log.entityId}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 text-text-muted">
                  <div className="flex items-center gap-1.5 text-xs">
                    <Clock size={12} />
                    {new Date(log.createdAt).toLocaleString()}
                  </div>
                </td>
              </tr>
            ))}
            {initialLogs.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-text-muted">
                  No logs found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="p-4 border-t border-border flex items-center justify-between bg-accent/20">
        <span className="text-xs text-text-muted">
          Page {page} of {initialTotalPages} (Total {initialTotal} events)
        </span>
        <div className="flex gap-2">
          <button
            onClick={() => handlePageChange(page - 1)}
            disabled={page <= 1}
            className="p-2 border border-border rounded disabled:opacity-50 hover:bg-card"
          >
            <ArrowLeft size={16} />
          </button>
          <button
            onClick={() => handlePageChange(page + 1)}
            disabled={page >= initialTotalPages}
            className="p-2 border border-border rounded disabled:opacity-50 hover:bg-card"
          >
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

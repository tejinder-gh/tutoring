"use client";

import { Leave } from "@prisma/client";
import { format } from "date-fns";

interface LeaveHistoryTableProps {
  leaves: Leave[];
}

export function LeaveHistoryTable({ leaves }: LeaveHistoryTableProps) {
  if (leaves.length === 0) {
    return (
      <div className="text-center py-12 bg-card border border-border rounded-xl border-dashed">
        <p className="text-text-muted">No leave history found.</p>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-accent/50 text-text-muted font-medium border-b border-border">
            <tr>
              <th className="px-4 py-3">Applied On</th>
              <th className="px-4 py-3">Dates</th>
              <th className="px-4 py-3">Duration</th>
              <th className="px-4 py-3">Reason</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {leaves.map((leave) => {
              const start = new Date(leave.startDate);
              const end = new Date(leave.endDate);
              const duration = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

              return (
                <tr key={leave.id} className="hover:bg-accent/5">
                  <td className="px-4 py-3 text-text-muted">
                    {format(new Date(leave.createdAt), "MMM d, yyyy")}
                  </td>
                  <td className="px-4 py-3 font-medium">
                    {format(start, "MMM d")} - {format(end, "MMM d, yyyy")}
                  </td>
                  <td className="px-4 py-3">
                    {duration} day{duration > 1 ? "s" : ""}
                  </td>
                  <td className="px-4 py-3 text-text-muted max-w-xs truncate" title={leave.reason}>
                    {leave.reason}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={leave.status} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles = {
    PENDING: "bg-yellow-500/10 text-yellow-500",
    APPROVED: "bg-green-500/10 text-green-500",
    REJECTED: "bg-red-500/10 text-red-500",
  };

  return (
    <span className={`px-2 py-1 rounded text-xs font-bold ${styles[status as keyof typeof styles] || "bg-gray-500/10 text-gray-500"}`}>
      {status}
    </span>
  );
}

"use client";

import { updateLeaveStatus } from "@/app/actions/leaves";
import type { Leave } from "@prisma/client";
import { format } from "date-fns";
import { Check, X } from "lucide-react";
import { useState, useTransition } from "react";

type LeaveWithUser = Leave & {
  user: {
    name: string;
    email: string;
    role: {
      name: string;
    } | null;
  };
};

export function AdminLeaveTable({ leaves }: { leaves: LeaveWithUser[] }) {
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleAction = (id: string, action: "APPROVED" | "REJECTED") => {
    setProcessingId(id);
    startTransition(async () => {
      await updateLeaveStatus(id, action);
      setProcessingId(null);
    });
  };

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-accent/50 text-text-muted font-medium border-b border-border">
            <tr>
              <th className="px-4 py-3">Applicant</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Dates</th>
              <th className="px-4 py-3">Reason</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {leaves.map((leave) => {
              const start = new Date(leave.startDate);
              const end = new Date(leave.endDate);
              const duration = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

              return (
                <tr key={leave.id} className="hover:bg-accent/5">
                  <td className="px-4 py-3 font-medium">
                    {leave.user.name}
                    <div className="text-xs text-text-muted">{leave.user.email}</div>
                  </td>
                  <td className="px-4 py-3 text-xs uppercase text-text-muted font-bold tracking-wide">
                    {leave.user.role?.name || "N/A"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium">{format(start, "MMM d")} - {format(end, "MMM d")}</div>
                    <div className="text-xs text-text-muted">{duration} days</div>
                  </td>
                  <td className="px-4 py-3 text-text-muted max-w-xs truncate" title={leave.reason}>
                    {leave.reason}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={leave.status} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    {leave.status === 'PENDING' && (
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => handleAction(leave.id, "APPROVED")}
                          disabled={isPending || processingId === leave.id}
                          className="p-1.5 bg-green-500/10 text-green-500 rounded hover:bg-green-500/20 disabled:opacity-50"
                          title="Approve"
                        >
                          <Check size={16} />
                        </button>
                        <button
                          onClick={() => handleAction(leave.id, "REJECTED")}
                          disabled={isPending || processingId === leave.id}
                          className="p-1.5 bg-red-500/10 text-red-500 rounded hover:bg-red-500/20 disabled:opacity-50"
                          title="Reject"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
            {leaves.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-text-muted">
                  No leave requests found.
                </td>
              </tr>
            )}
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

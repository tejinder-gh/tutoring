"use client";

import type { QueryWithDetails } from "@/app/actions/communication";
import { replyToQuery, updateQueryStatus } from "@/app/actions/communication";
import { QueryStatus } from "@prisma/client";
import { format } from "date-fns";
import { AlertCircle, CheckCircle, Clock, Filter, MessageSquare, Send, User } from "lucide-react";
import { useState, useTransition } from "react";

export function QueryList({ initialQueries }: { initialQueries: QueryWithDetails[] }) {
  const [filterStatus, setFilterStatus] = useState<QueryStatus | "ALL">("ALL");
  const [selectedQuery, setSelectedQuery] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [isPending, startTransition] = useTransition();

  const filteredQueries = initialQueries.filter(
    (q) => filterStatus === "ALL" || q.status === filterStatus
  );

  const handleStatusUpdate = (id: string, status: QueryStatus) => {
    startTransition(async () => {
      await updateQueryStatus(id, status);
    });
  };

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedQuery || !replyText.trim()) return;

    startTransition(async () => {
      await replyToQuery(selectedQuery, replyText);
      setReplyText("");
      // potentially close expanded view or show success
    });
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex items-center gap-4 bg-card p-4 rounded-xl border border-border">
        <div className="flex items-center gap-2 text-text-muted">
          <Filter size={18} />
          <span className="text-sm font-medium">Filter Status:</span>
        </div>
        <div className="flex gap-2">
          {["ALL", "OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${filterStatus === status
                ? "bg-primary text-primary-foreground"
                : "bg-accent hover:bg-accent/70 text-text-muted"
                }`}
            >
              {status.replace("_", " ")}
            </button>
          ))}
        </div>
      </div>

      {/* Query List */}
      <div className="grid gap-4">
        {filteredQueries.map((query) => (
          <div
            key={query.id}
            className={`bg-card border rounded-xl overflow-hidden transition-all ${selectedQuery === query.id ? "ring-2 ring-primary/20 border-primary" : "border-border"
              }`}
          >
            {/* Header / Summary Row */}
            <div
              className="p-4 flex items-start gap-4 cursor-pointer hover:bg-accent/5"
              onClick={() => setSelectedQuery(selectedQuery === query.id ? null : query.id)}
            >
              {/* Priority Indicator */}
              <div
                className={`mt-1 w-2 h-2 rounded-full shrink-0 ${query.priority === "URGENT"
                  ? "bg-red-500 animate-pulse"
                  : query.priority === "HIGH"
                    ? "bg-orange-500"
                    : query.priority === "NORMAL"
                      ? "bg-blue-500"
                      : "bg-slate-400"
                  }`}
                title={`Priority: ${query.priority}`}
              />

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-1">
                  <h3 className="font-bold text-foreground truncate pr-4">
                    {query.subject}
                  </h3>
                  <span className="text-xs text-text-muted whitespace-nowrap">
                    {format(new Date(query.createdAt), "MMM d, h:mm a")}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-sm text-text-muted mb-2">
                  <span className="flex items-center gap-1">
                    <User size={14} />
                    {query.student.name}
                  </span>
                  <span>•</span>
                  <StatusBadge status={query.status} />
                </div>

                <p className="text-sm text-text-muted line-clamp-2">
                  {query.message}
                </p>
              </div>
            </div>

            {/* Expanded Content */}
            {selectedQuery === query.id && (
              <div className="border-t border-border bg-accent/5 p-4 md:p-6 animate-in slide-in-from-top-2">
                {/* Full Message */}
                <div className="mb-6">
                  <h4 className="text-xs font-bold uppercase text-text-muted mb-2">
                    Message
                  </h4>
                  <div className="bg-background p-4 rounded-lg border border-border text-sm leading-relaxed">
                    {query.message}
                  </div>
                </div>

                {/* Response Section */}
                {query.response ? (
                  <div className="mb-6">
                    <h4 className="text-xs font-bold uppercase text-text-muted mb-2 flex items-center gap-2">
                      <CheckCircle size={14} className="text-green-500" />
                      Resolution Response
                      <span className="font-normal normal-case ml-auto opacity-70">
                        by {query.resolvedBy?.name}
                      </span>
                    </h4>
                    <div className="bg-green-500/10 p-4 rounded-lg border border-green-500/20 text-sm leading-relaxed text-foreground">
                      {query.response}
                    </div>
                  </div>
                ) : (
                  <div className="mb-6">
                    <h4 className="text-xs font-bold uppercase text-text-muted mb-2">
                      Reply
                    </h4>
                    <form onSubmit={handleReply}>
                      <textarea
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        className="w-full min-h-[100px] p-3 rounded-lg border border-border bg-background text-sm focus:ring-2 focus:ring-primary/20 outline-none resize-y"
                        placeholder="Type your response here..."
                        disabled={isPending}
                      />
                      <div className="flex justify-end mt-2">
                        <button
                          type="submit"
                          disabled={!replyText.trim() || isPending}
                          className="btn-primary flex items-center gap-2 text-xs"
                        >
                          <Send size={14} />
                          {isPending ? "Sending..." : "Send Reply & Resolve"}
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-wrap gap-2 pt-4 border-t border-border">
                  <span className="text-xs font-medium text-text-muted mr-auto flex items-center">
                    Actions:
                  </span>
                  {query.status !== "IN_PROGRESS" && query.status !== "RESOLVED" && query.status !== "CLOSED" && (
                    <button
                      onClick={() => handleStatusUpdate(query.id, "IN_PROGRESS")}
                      disabled={isPending}
                      className="px-3 py-1.5 bg-blue-500/10 text-blue-500 rounded-md text-xs font-bold hover:bg-blue-500/20 transition disabled:opacity-50"
                    >
                      Mark In Progress
                    </button>
                  )}

                  {query.status !== "CLOSED" && (
                    <button
                      onClick={() => handleStatusUpdate(query.id, "CLOSED")}
                      disabled={isPending}
                      className="px-3 py-1.5 bg-slate-500/10 text-slate-500 rounded-md text-xs font-bold hover:bg-slate-500/20 transition disabled:opacity-50"
                    >
                      Close Ticket
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}

        {filteredQueries.length === 0 && (
          <div className="text-center py-12 bg-card border border-border rounded-xl border-dashed">
            <MessageSquare size={40} className="mx-auto text-text-muted opacity-20 mb-3" />
            <h3 className="font-medium text-text-muted">No queries found</h3>
            <p className="text-xs text-text-muted/60">
              {filterStatus === "ALL" ? "No support tickets have been created yet." : `No ${filterStatus.toLowerCase().replace('_', ' ')} tickets found.`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: QueryStatus }) {
  const styles = {
    OPEN: "bg-slate-500/10 text-slate-500",
    IN_PROGRESS: "bg-blue-500/10 text-blue-500",
    RESOLVED: "bg-green-500/10 text-green-500",
    CLOSED: "bg-slate-500/20 text-slate-500 line-through opacity-70",
  };

  const icons = {
    OPEN: <AlertCircle size={12} />,
    IN_PROGRESS: <Clock size={12} />,
    RESOLVED: <CheckCircle size={12} />,
    CLOSED: <CheckCircle size={12} />,
  };

  return (
    <span
      className={`flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wide border border-transparent ${styles[status] || styles.OPEN
        }`}
    >
      {icons[status] || icons.OPEN}
      {status.replace("_", " ")}
    </span>
  );
}

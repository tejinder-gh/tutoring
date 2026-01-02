"use client";

import { createQueryReply, resolveQuery } from "@/lib/actions/communication";
import { CheckCircle, Clock, MessageSquare, Search, X } from "lucide-react";
import { useMemo, useState, useTransition } from "react";

interface Query {
  id: string;
  subject: string;
  message: string;
  status: string;
  priority: string;
  createdAt: Date;
  student: {
    name: string;
    email: string;
  };
  response?: string | null;
}

export function QueryList({ initialQueries }: { initialQueries: Query[] }) {
  const [queries, setQueries] = useState(initialQueries);
  const [selectedQuery, setSelectedQuery] = useState<Query | null>(null);
  const [replyText, setReplyText] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isPending, startTransition] = useTransition();

  // Filter queries based on search term
  const filteredQueries = useMemo(() => {
    if (!searchTerm.trim()) return queries;
    const term = searchTerm.toLowerCase();
    return queries.filter(
      (q) =>
        q.subject.toLowerCase().includes(term) ||
        q.message.toLowerCase().includes(term) ||
        q.student.name.toLowerCase().includes(term) ||
        q.student.email.toLowerCase().includes(term)
    );
  }, [queries, searchTerm]);

  const handleResolve = async (id: string) => {
    startTransition(async () => {
      const success = await resolveQuery(id);
      if (success) {
        setQueries(q => q.map(i => i.id === id ? { ...i, status: "RESOLVED" } : i));
        if (selectedQuery?.id === id) {
          setSelectedQuery(prev => prev ? { ...prev, status: "RESOLVED" } : null);
        }
      }
    });
  };

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedQuery) return;

    startTransition(async () => {
      const success = await createQueryReply(selectedQuery.id, replyText);
      if (success) {
        setQueries(q => q.map(i => i.id === selectedQuery.id ? { ...i, status: "RESOLVED", response: replyText } : i));
        setSelectedQuery(prev => prev ? { ...prev, status: "RESOLVED", response: replyText } : null);
        setReplyText("");
      }
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
      {/* List Queries */}
      <div className="lg:col-span-1 bg-background border border-border rounded-xl flex flex-col overflow-hidden">
        <div className="p-4 border-b border-border bg-accent/10">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted h-4 w-4" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search queries..."
              className="w-full pl-9 pr-10 py-2 bg-background border border-border rounded-lg text-sm"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-foreground"
              >
                <X size={14} />
              </button>
            )}
          </div>
          {searchTerm && (
            <p className="text-xs text-text-muted mt-2">
              Showing {filteredQueries.length} of {queries.length} queries
            </p>
          )}
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-2">
          {filteredQueries.map(q => (
            <div
              key={q.id}
              onClick={() => setSelectedQuery(q)}
              className={`p-4 rounded-lg cursor-pointer transition border ${selectedQuery?.id === q.id
                ? "bg-primary/10 border-primary"
                : "bg-card hover:bg-accent border-border"
                }`}
            >
              <div className="flex justify-between items-start mb-2">
                <span className={`text-xs px-2 py-0.5 rounded font-bold ${q.priority === 'URGENT' ? 'bg-red-500/20 text-red-500' :
                  q.priority === 'HIGH' ? 'bg-orange-500/20 text-orange-500' :
                    'bg-blue-500/20 text-blue-500'
                  }`}>
                  {q.priority}
                </span>
                <span className={`text-xs ${q.status === 'OPEN' ? 'text-yellow-500' : 'text-green-500'
                  }`}>
                  {q.status}
                </span>
              </div>
              <h4 className="font-bold text-sm mb-1 truncate">{q.subject}</h4>
              <p className="text-xs text-text-muted mb-2">{q.student.name}</p>
              <div className="flex items-center gap-2 text-[10px] text-text-muted">
                <Clock size={10} />
                {new Date(q.createdAt).toLocaleDateString()}
              </div>
            </div>
          ))}
          {queries.length === 0 && (
            <div className="p-8 text-center text-text-muted text-sm">
              No queries found
            </div>
          )}
        </div>
      </div>

      {/* Detail View */}
      <div className="lg:col-span-2 bg-background border border-border rounded-xl flex flex-col h-full overflow-hidden">
        {selectedQuery ? (
          <>
            <div className="p-6 border-b border-border bg-accent/5">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-xl font-bold mb-2">{selectedQuery.subject}</h2>
                  <div className="flex items-center gap-4 text-sm text-text-muted">
                    <span className="flex items-center gap-1">
                      <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                        {selectedQuery.student.name[0]}
                      </div>
                      {selectedQuery.student.name}
                    </span>
                    <span>•</span>
                    <span>{selectedQuery.student.email}</span>
                  </div>
                </div>
                {selectedQuery.status !== 'RESOLVED' && (
                  <button
                    onClick={() => handleResolve(selectedQuery.id)}
                    disabled={isPending}
                    className="btn-outline text-xs"
                  >
                    <CheckCircle size={14} className="mr-1" />
                    Mark Resolved
                  </button>
                )}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="bg-accent/10 p-4 rounded-lg border border-border">
                <p className="text-sm whitespace-pre-wrap">{selectedQuery.message}</p>
              </div>

              {selectedQuery.response && (
                <div className="space-y-2 pl-4 border-l-2 border-primary">
                  <span className="text-xs font-bold text-primary block">Staff Response</span>
                  <p className="text-sm text-text-muted">{selectedQuery.response}</p>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-border bg-accent/5">
              {selectedQuery.status === 'RESOLVED' ? (
                <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg text-center text-sm text-green-500 flex items-center justify-center gap-2">
                  <CheckCircle size={16} />
                  This ticket has been resolved
                </div>
              ) : (
                <form onSubmit={handleReply} className="space-y-4">
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Type your reply here..."
                    className="w-full h-32 p-3 bg-background border border-border rounded-lg text-sm resize-none focus:ring-2 focus:ring-primary/20 outline-none"
                    required
                  />
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={isPending || !replyText.trim()}
                      className="btn-primary"
                    >
                      {isPending ? "Sending..." : "Send Reply"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-text-muted">
            <MessageSquare size={48} className="mb-4 opacity-20" />
            <p>Select a query to view details</p>
          </div>
        )}
      </div>
    </div>
  );
}

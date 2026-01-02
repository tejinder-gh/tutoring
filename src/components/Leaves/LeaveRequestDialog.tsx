"use client";

import { createLeaveRequest } from "@/app/actions/leaves";
import { Calendar, Loader2, X } from "lucide-react";
import { useState, useTransition } from "react";

export function LeaveRequestDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const startDate = new Date(formData.get("startDate") as string);
    const endDate = new Date(formData.get("endDate") as string);
    const reason = formData.get("reason") as string;

    if (endDate < startDate) {
      alert("End date cannot be before start date");
      return;
    }

    startTransition(async () => {
      const res = await createLeaveRequest({ startDate, endDate, reason });
      if (res.success) {
        setIsOpen(false);
      } else {
        alert("Failed to submit request");
      }
    });
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="btn-primary flex items-center gap-2"
      >
        <Calendar size={16} /> Apply for Leave
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-background border border-border rounded-xl p-6 w-full max-w-md relative animate-in zoom-in-95 shadow-xl">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-text-muted hover:text-foreground"
            >
              <X size={20} />
            </button>

            <h2 className="text-xl font-bold mb-1">Apply for Leave</h2>
            <p className="text-sm text-text-muted mb-4">Request time off from work.</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">From</label>
                  <input
                    name="startDate"
                    type="date"
                    required
                    className="w-full p-2 rounded border border-border bg-background focus:ring-2 focus:ring-primary/20 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">To</label>
                  <input
                    name="endDate"
                    type="date"
                    required
                    className="w-full p-2 rounded border border-border bg-background focus:ring-2 focus:ring-primary/20 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Reason</label>
                <textarea
                  name="reason"
                  required
                  rows={3}
                  className="w-full p-2 rounded border border-border bg-background resize-none focus:ring-2 focus:ring-primary/20 outline-none"
                  placeholder="e.g. Personal emergency, Sick leave..."
                />
              </div>

              <div className="flex justify-end gap-2 mt-6">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="btn-outline"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="btn-primary flex items-center gap-2"
                >
                  {isPending && <Loader2 size={16} className="animate-spin" />}
                  {isPending ? "Submitting..." : "Submit Request"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

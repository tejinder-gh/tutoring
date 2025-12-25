
"use client";

import { createEvent, getBatchesForTeacher } from "@/app/actions/events";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

interface ScheduleEventDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ScheduleEventDialog({ isOpen, onClose, onSuccess }: ScheduleEventDialogProps) {
  const [loading, setLoading] = useState(false);
  const [batches, setBatches] = useState<{ id: string; name: string; courseName: string }[]>([]);

  const [formData, setFormData] = useState({
    title: "",
    type: "TEST",
    batchId: "",
    startTime: "",
    endTime: "",
    description: ""
  });

  useEffect(() => {
    if (isOpen) {
      // Fetch valid batches for this teacher
      const loadBatches = async () => {
        const data = await getBatchesForTeacher();
        setBatches(data);
        if (data.length > 0) {
          setFormData(prev => ({ ...prev, batchId: data[0].id }));
        }
      };
      loadBatches();
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await createEvent({
        title: formData.title,
        type: formData.type as any, // "TEST" | "DEADLINE" | "CLASS" | "WORKSHOP" | "OTHER"
        batchId: formData.batchId,
        startTime: formData.startTime,
        endTime: formData.endTime,
        description: formData.description
      });
      onSuccess();
      onClose();
      // Reset form?
    } catch (error) {
      console.error(error);
      alert("Failed to create event");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-background rounded-xl border border-border shadow-elegant animate-in fade-in zoom-in duration-200">
        <div className="p-6 border-b border-border">
          <h2 className="text-xl font-semibold text-foreground">Schedule Event</h2>
          <p className="text-sm text-text-muted mt-1">Add a test, deadline, or extra class.</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Event Title</label>
            <input
              required
              type="text"
              className="w-full px-3 py-2 bg-background border border-border rounded-md focus:ring-2 focus:ring-primary focus:outline-none text-foreground"
              placeholder="e.g. Mid-term Exam"
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Type</label>
              <select
                className="w-full px-3 py-2 bg-background border border-border rounded-md focus:ring-2 focus:ring-primary focus:outline-none text-foreground"
                value={formData.type}
                onChange={e => setFormData({ ...formData, type: e.target.value })}
              >
                <option value="TEST">Test/Exam</option>
                <option value="DEADLINE">Deadline</option>
                <option value="CLASS">Extra Class</option>
                <option value="WORKSHOP">Workshop</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Batch</label>
              <select
                className="w-full px-3 py-2 bg-background border border-border rounded-md focus:ring-2 focus:ring-primary focus:outline-none text-foreground"
                value={formData.batchId}
                onChange={e => setFormData({ ...formData, batchId: e.target.value })}
              >
                {batches.map(b => (
                  <option key={b.id} value={b.id}>{b.courseName} - {b.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Start Time</label>
              <input
                required
                type="datetime-local"
                className="w-full px-3 py-2 bg-background border border-border rounded-md focus:ring-2 focus:ring-primary focus:outline-none text-foreground text-sm"
                value={formData.startTime}
                onChange={e => setFormData({ ...formData, startTime: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">End Time</label>
              <input
                required
                type="datetime-local"
                className="w-full px-3 py-2 bg-background border border-border rounded-md focus:ring-2 focus:ring-primary focus:outline-none text-foreground text-sm"
                value={formData.endTime}
                onChange={e => setFormData({ ...formData, endTime: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Description (Optional)</label>
            <textarea
              className="w-full px-3 py-2 bg-background border border-border rounded-md focus:ring-2 focus:ring-primary focus:outline-none text-foreground min-h-[80px]"
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-foreground hover:bg-accent rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-primary hover:opacity-90 rounded-md transition-colors flex items-center gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Create Event
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

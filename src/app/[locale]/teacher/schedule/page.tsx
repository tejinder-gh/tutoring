"use client";

import { getMySchedule } from "@/app/actions/calendar";
import { requestLeave } from "@/app/actions/leave";
import LeaveRequestModal from "@/components/Calendar/LeaveRequestModal";
import ScheduleEventDialog from "@/components/Calendar/ScheduleEventDialog";
import WeeklySchedule from "@/components/Calendar/WeeklySchedule";
import { Plus } from "lucide-react";
import { useEffect, useState } from "react";

export default function TeacherSchedulePage() {
  const [date, setDate] = useState(new Date());
  const [events, setEvents] = useState<any[]>([]);
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch schedule when date changes
  useEffect(() => {
    const fetchSchedule = async () => {
      setLoading(true);
      try {
        const data = await getMySchedule(date);
        setEvents(data);
      } catch (error) {
        console.error("Failed to fetch schedule:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSchedule();
  }, [date]);

  const handleLeaveSubmit = async (data: { startDate: string; endDate: string; reason: string }) => {
    await requestLeave(data);
    // Refresh schedule
    const newData = await getMySchedule(date);
    setEvents(newData);
  };

  return (
    <div className="p-8 space-y-6 max-h-screen overflow-hidden flex flex-col">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Schedule Overview</h1>
          <p className="text-text-muted">
            View your upcoming classes and manage leave requests.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setIsEventModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary hover:opacity-90 text-white rounded-lg transition-colors font-medium shadow-sm transition-transform active:scale-95"
          >
            <Plus size={20} />
            Add Event
          </button>
          <button
            onClick={() => setIsLeaveModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-accent hover:bg-accent/80 text-foreground border border-border rounded-lg transition-colors font-medium shadow-sm"
          >
            <Plus size={20} />
            Request Leave
          </button>
        </div>
      </div>

      <div className="flex-1 min-h-0">
        {loading ? (
          <div className="h-full flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : (
          <WeeklySchedule
            events={events}
            onDateChange={setDate}
            currentUserRole="TEACHER"
          />
        )}
      </div>

      <LeaveRequestModal
        isOpen={isLeaveModalOpen}
        onClose={() => setIsLeaveModalOpen(false)}
        onSubmit={handleLeaveSubmit}
      />

      <ScheduleEventDialog
        isOpen={isEventModalOpen}
        onClose={() => setIsEventModalOpen(false)}
        onSuccess={async () => {
          const newData = await getMySchedule(date);
          setEvents(newData);
        }}
      />
    </div>
  );
}

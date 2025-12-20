"use client";

import { getMySchedule } from "@/app/actions/calendar";
import { requestLeave } from "@/app/actions/leave";
import LeaveRequestModal from "@/components/Calendar/LeaveRequestModal";
import WeeklySchedule from "@/components/Calendar/WeeklySchedule";
import { Plus } from "lucide-react";
import { useEffect, useState } from "react";

export default function StudentSchedulePage() {
  const [date, setDate] = useState(new Date());
  const [events, setEvents] = useState<any[]>([]);
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
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
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">My Schedule</h1>
          <p className="text-slate-500 dark:text-slate-400">
            View your classes and manage your leaves.
          </p>
        </div>
        <button
          onClick={() => setIsLeaveModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium shadow-sm"
        >
          <Plus size={20} />
          Request Leave
        </button>
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
            currentUserRole="STUDENT"
          />
        )}
      </div>

      <LeaveRequestModal
        isOpen={isLeaveModalOpen}
        onClose={() => setIsLeaveModalOpen(false)}
        onSubmit={handleLeaveSubmit}
      />
    </div>
  );
}

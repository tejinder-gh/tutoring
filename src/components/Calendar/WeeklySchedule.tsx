"use client";

import { addDays, format, isSameDay, parseISO, startOfWeek } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';

interface Event {
  id: string;
  title: string;
  startTime: string; // ISO string
  endTime: string;   // ISO string
  color?: string;
  type?: 'CLASS' | 'LEAVE' | 'OTHER';
}

interface WeeklyScheduleProps {
  events: Event[];
  onDateChange?: (date: Date) => void;
  currentUserRole?: string;
}

const HOURS = Array.from({ length: 14 }, (_, i) => i + 8); // 8 AM to 9 PM

export default function WeeklySchedule({ events, onDateChange, currentUserRole }: WeeklyScheduleProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const startDate = startOfWeek(currentDate, { weekStartsOn: 1 }); // Monday
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(startDate, i));

  const handlePrevWeek = () => {
    const newDate = addDays(currentDate, -7);
    setCurrentDate(newDate);
    onDateChange?.(newDate);
  };

  const handleNextWeek = () => {
    const newDate = addDays(currentDate, 7);
    setCurrentDate(newDate);
    onDateChange?.(newDate);
  };

  const getEventsForCell = (day: Date, hour: number) => {
    return events.filter(event => {
      const eventStart = parseISO(event.startTime);
      return isSameDay(eventStart, day) && eventStart.getHours() === hour;
    });
  };

  const getDayEvents = (day: Date) => {
    return events.filter(event => {
      const eventStart = parseISO(event.startTime);
      return isSameDay(eventStart, day) && event.type === 'LEAVE';
    });
  }

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-slate-200 dark:border-slate-800">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center space-x-4">
          <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100">
            {format(startDate, 'MMMM yyyy')}
          </h2>
          <div className="flex space-x-2">
            <button onClick={handlePrevWeek} className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400">
              <ChevronLeft size={20} />
            </button>
            <button onClick={handleNextWeek} className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400">
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
        <div>
          {/* Legend or actions */}
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-blue-100 dark:bg-blue-900 border border-blue-300"></span>
              <span>Classes</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-100 dark:bg-red-900 border border-red-300"></span>
              <span>Direct Leave</span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-auto">
        <div className="min-w-[800px]">
          {/* Days Header */}
          <div className="grid grid-cols-8 border-b border-slate-200 dark:border-slate-800 sticky top-0 bg-white dark:bg-slate-900 z-10">
            <div className="p-4 text-center text-sm font-medium text-slate-500 border-r border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
              Time
            </div>
            {weekDays.map((day) => {
              const isToday = isSameDay(day, new Date());
              const leaves = getDayEvents(day);
              const isOnLeave = leaves.length > 0;

              return (
                <div key={day.toString()} className={`p-4 text-center border-r border-slate-200 dark:border-slate-800 ${isToday ? 'bg-blue-50/50 dark:bg-blue-900/20' : ''}`}>
                  <div className={`text-sm font-medium ${isToday ? 'text-blue-600 dark:text-blue-400' : 'text-slate-700 dark:text-slate-300'}`}>
                    {format(day, 'EEE')}
                  </div>
                  <div className={`text-2xl font-semibold mt-1 ${isToday ? 'text-blue-700 dark:text-blue-300' : 'text-slate-900 dark:text-white'}`}>
                    {format(day, 'd')}
                  </div>
                  {isOnLeave && (
                    <div className="mt-1 text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300 inline-block">
                      On Leave
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Time Slots */}
          {HOURS.map((hour) => (
            <div key={hour} className="grid grid-cols-8 border-b border-slate-100 dark:border-slate-800/50">
              {/* Time Label */}
              <div className="p-2 text-center text-xs text-slate-400 border-r border-slate-200 dark:border-slate-800 relative py-6">
                <span className="absolute -top-2 left-0 right-0 text-center bg-white dark:bg-slate-900 px-1">
                  {format(new Date().setHours(hour, 0), 'ha')}
                </span>
              </div>

              {/* Day Cells */}
              {weekDays.map((day) => {
                const cellEvents = getEventsForCell(day, hour);
                const isToday = isSameDay(day, new Date());

                return (
                  <div key={`${day}-${hour}`} className={`p-1 border-r border-slate-200 dark:border-slate-800 min-h-[60px] relative hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${isToday ? 'bg-blue-50/10' : ''}`}>
                    {cellEvents.map((event) => (
                      <div
                        key={event.id}
                        className={`p-2 rounded text-xs mb-1 shadow-sm border leading-tight cursor-pointer overflow-hidden
                                    ${event.type === 'LEAVE'
                            ? 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/50 dark:text-red-200 dark:border-red-800'
                            : 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/50 dark:text-blue-200 dark:border-blue-800'
                          }`}
                        title={`${event.title} (${format(parseISO(event.startTime), 'h:mm a')} - ${format(parseISO(event.endTime), 'h:mm a')})`}
                      >
                        <div className="font-semibold truncate">{event.title}</div>
                        <div className="opacity-75">{format(parseISO(event.startTime), 'h:mm a')}</div>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

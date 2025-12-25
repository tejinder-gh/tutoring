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
  type?: 'CLASS' | 'LEAVE' | 'TEST' | 'DEADLINE' | 'OTHER';
  status?: string;
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
    <div className="flex flex-col h-full bg-background rounded-[var(--radius-default)] shadow-elegant border border-border">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center space-x-4">
          <h2 className="text-xl font-semibold text-foreground">
            {format(startDate, 'MMMM yyyy')}
          </h2>
          <div className="flex space-x-2">
            <button onClick={handlePrevWeek} className="p-1 rounded-full hover:bg-accent text-text-muted transition-colors">
              <ChevronLeft size={20} />
            </button>
            <button onClick={handleNextWeek} className="p-1 rounded-full hover:bg-accent text-text-muted transition-colors">
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
        <div>
          {/* Legend or actions */}
          <div className="flex items-center gap-4 text-sm font-medium text-text-muted">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-primary"></span>
              <span>Classes</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-secondary"></span>
              <span>Deadlines/Tests</span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-auto">
        <div className="min-w-[800px]">
          {/* Days Header */}
          <div className="grid grid-cols-8 border-b border-border sticky top-0 bg-background/95 backdrop-blur z-10">
            <div className="p-4 text-center text-sm font-medium text-text-muted border-r border-border bg-accent/20">
              Time
            </div>
            {weekDays.map((day) => {
              const isToday = isSameDay(day, new Date());
              const leaves = getDayEvents(day);
              const isOnLeave = leaves.length > 0;

              return (
                <div key={day.toString()} className={`p-4 text-center border-r border-border ${isToday ? 'bg-primary/5' : ''}`}>
                  <div className={`text-sm font-medium ${isToday ? 'text-primary' : 'text-text-muted'}`}>
                    {format(day, 'EEE')}
                  </div>
                  <div className={`text-2xl font-semibold mt-1 ${isToday ? 'text-primary' : 'text-foreground'}`}>
                    {format(day, 'd')}
                  </div>
                  {isOnLeave && (
                    <div className="mt-1 text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300 inline-block font-medium">
                      On Leave
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Time Slots */}
          {HOURS.map((hour) => (
            <div key={hour} className="grid grid-cols-8 border-b border-border last:border-0">
              {/* Time Label */}
              <div className="p-2 text-center text-xs text-text-muted border-r border-border relative py-6 bg-accent/5">
                <span className="absolute -top-2 left-0 right-0 text-center bg-background px-1 border border-border rounded-full text-[10px] w-fit mx-auto">
                  {format(new Date().setHours(hour, 0), 'ha')}
                </span>
              </div>

              {/* Day Cells */}
              {weekDays.map((day) => {
                const cellEvents = getEventsForCell(day, hour);
                const isToday = isSameDay(day, new Date());

                return (
                  <div key={`${day}-${hour}`} className={`p-1 border-r border-border min-h-[60px] relative hover:bg-accent/40 transition-colors ${isToday ? 'bg-primary/5' : ''}`}>
                    {cellEvents.map((event) => {
                      // Color mapping logic based on event type
                      let bgClass = 'bg-primary/10 border-primary/20 text-primary';

                      if (event.type === 'LEAVE') {
                        bgClass = event.status === 'PENDING'
                          ? 'bg-orange-500/10 border-orange-500/20 text-orange-600'
                          : 'bg-red-500/10 border-red-500/20 text-red-600';
                      } else if (event.type === 'TEST') {
                        bgClass = 'bg-purple-500/10 border-purple-500/20 text-purple-600 dark:text-purple-400';
                      } else if (event.type === 'DEADLINE') {
                        bgClass = 'bg-secondary/10 border-secondary/20 text-secondary';
                      }

                      return (
                        <div
                          key={event.id}
                          className={`p-2 rounded-md text-xs mb-1 border leading-tight cursor-pointer overflow-hidden relative group hover:shadow-sm transition-all ${bgClass}`}
                          title={`${event.title} (${format(parseISO(event.startTime), 'h:mm a')} - ${format(parseISO(event.endTime), 'h:mm a')})`}
                        >
                          <div className="font-semibold truncate">{event.title}</div>
                          <div className="opacity-80 text-[10px] uppercase tracking-wider font-medium mt-0.5">
                            {format(parseISO(event.startTime), 'h:mm a')}
                          </div>
                        </div>
                      );
                    })}
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

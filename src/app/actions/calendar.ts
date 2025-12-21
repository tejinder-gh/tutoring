"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { addDays, set, startOfWeek } from "date-fns";

export async function getMySchedule(date: Date) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const userId = session.user.id;
  const startDate = startOfWeek(date, { weekStartsOn: 1 });
  const endDate = addDays(startDate, 7);

  // 1. Fetch User Leaves
  const leaves = await prisma.leave.findMany({
    where: {
      userId: userId,
      status: { in: ['APPROVED', 'PENDING'] },
      OR: [
        { startDate: { lte: endDate }, endDate: { gte: startDate } }
      ]
    }
  });

  const leaveEvents = leaves.map(leave => ({
    id: leave.id,
    title: `Leave: ${leave.reason} (${leave.status})`,
    startTime: leave.startDate.toISOString(),
    endTime: leave.endDate.toISOString(),
    type: 'LEAVE',
    status: leave.status
  }));

  // 2. Fetch Classes (Enrollments -> Batch -> Schedule)
  // Logic: For each active enrollment, get batch schedule, expand to current week
  const enrollments = await prisma.enrollment.findMany({
    where: {
      studentProfile: { userId: userId },
      status: 'ACTIVE',
      batch: { isActive: true }
    },
    include: {
      batch: true,
      course: true
    }
  });

  // Also fetch for Teachers
  // const teacherBatches = ...

  const classEvents: any[] = [];

  for (const enrollment of enrollments) {
      const batch = enrollment.batch;
      if (batch?.schedule) {
          const schedule = batch.schedule as Record<string, string>; // e.g., { "mon": "10:00-12:00" }

          // Map day names to index (0 = Sun, 1 = Mon...)
          const dayMap: Record<string, number> = {
              "sun": 0, "mon": 1, "tue": 2, "wed": 3, "thu": 4, "fri": 5, "sat": 6
          };

          Object.entries(schedule).forEach(([dayKey, timeRange]) => {
              const dayIndex = dayMap[dayKey.toLowerCase()];
              if (dayIndex === undefined) return;

              // Find the date for this day in the requested week
              // weekDays from startOfWeek(Monday) -> 0..6
              // startOfWeek (Mon) is day 1.

              // Let's iterate 7 days of the requested week
              for (let i = 0; i < 7; i++) {
                  const currentDayDate = addDays(startDate, i);
                  if (currentDayDate.getDay() === dayIndex) {
                      // Found the matching day
                      const [startStr, endStr] = timeRange.split('-');
                      if (!startStr || !endStr) continue;

                      // Parse time "10:00"
                      const [startH, startM] = startStr.split(':').map(Number);
                      const [endH, endM] = endStr.split(':').map(Number);

                      const startDateTime = set(currentDayDate, { hours: startH, minutes: startM });
                      const endDateTime = set(currentDayDate, { hours: endH, minutes: endM });

                      classEvents.push({
                          id: `${batch.id}-${currentDayDate.toISOString()}`,
                          title: `${enrollment.course.title} (${batch.name})`,
                          startTime: startDateTime.toISOString(),
                          endTime: endDateTime.toISOString(),
                          type: 'CLASS'
                      });
                  }
              }
          });
      }
  }

  return [...leaveEvents, ...classEvents];
}

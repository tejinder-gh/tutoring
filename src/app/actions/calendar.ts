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

  const leaveEvents = leaves.map((leave: any) => ({
    id: leave.id,
    title: `Leave: ${leave.reason} (${leave.status})`,
    startTime: leave.startDate.toISOString(),
    endTime: leave.endDate.toISOString(),
    type: 'LEAVE',
    status: leave.status
  }));

  // 2. Fetch Classes (Enrollments -> Batch -> Schedule)
  // Logic: For each active enrollment, get batch schedule, expand to current week
  // Also fetch events for these batches

  // Check if User is Student or Teacher and get relevant batch IDs
  let relevantBatchIds: string[] = [];

  const studentProfile = await prisma.studentProfile.findUnique({
      where: { userId },
      include: {
          enrollments: {
              where: { status: 'ACTIVE' },
              include: { batch: true }
          }
      }
  });

  if (studentProfile) {
      relevantBatchIds = studentProfile.enrollments
          .map((e: any) => e.batchId)
          .filter((id: any): id is string => !!id);
  }

  const teacherProfile = await prisma.teacherProfile.findUnique({
      where: { userId },
      include: {
          courses: {
              include: {
                  batches: {
                      where: { isActive: true }
                  }
              }
          }
      }
  });

  if (teacherProfile) {
      const teacherBatchIds = teacherProfile.courses.flatMap((c: any) => c.batches.map((b: any) => b.id));
      relevantBatchIds = [...new Set([...relevantBatchIds, ...teacherBatchIds]) as any];
  }

  // Fetch batches with their details
  const batches = await prisma.batch.findMany({
      where: { id: { in: relevantBatchIds }, isActive: true },
      include: { course: true }
  });

  const classEvents: any[] = [];

  for (const batch of batches) {
      if (batch?.schedule) {
          const schedule = batch.schedule as Record<string, string>; // e.g., { "mon": "10:00-12:00" }

          const dayMap: Record<string, number> = {
              "sun": 0, "mon": 1, "tue": 2, "wed": 3, "thu": 4, "fri": 5, "sat": 6
          };

          Object.entries(schedule).forEach(([dayKey, timeRange]) => {
              const dayIndex = dayMap[dayKey.toLowerCase()];
              if (dayIndex === undefined) return;

              for (let i = 0; i < 7; i++) {
                  const currentDayDate = addDays(startDate, i);
                  if (currentDayDate.getDay() === dayIndex) {
                      const [startStr, endStr] = timeRange.split('-');
                      if (!startStr || !endStr) continue;

                      const [startH, startM] = startStr.split(':').map(Number);
                      const [endH, endM] = endStr.split(':').map(Number);

                      const startDateTime = set(currentDayDate, { hours: startH, minutes: startM });
                      const endDateTime = set(currentDayDate, { hours: endH, minutes: endM });

                      classEvents.push({
                          id: `${batch.id}-${currentDayDate.toISOString()}`,
                          title: `${batch.course.title} (${batch.name})`,
                          startTime: startDateTime.toISOString(),
                          endTime: endDateTime.toISOString(),
                          type: 'CLASS',
                          batchId: batch.id
                      });
                  }
              }
          });
      }
  }

  // 3. Fetch Batch Events (Tests, Deadlines, etc.)
  const customEvents = await prisma.event.findMany({
    where: {
      batchId: { in: relevantBatchIds },
      startTime: { gte: startDate, lte: endDate }
    },
    include: {
        batch: { include: { course: true } }
    }
  });

  const mappedCustomEvents = customEvents.map((event: any) => ({
      id: event.id,
      title: `${event.title} (${event.batch?.name || 'Class'})`,
      startTime: event.startTime.toISOString(),
      endTime: event.endTime.toISOString(),
      type: event.type,
      batchId: event.batchId
  }));

  return [...leaveEvents, ...classEvents, ...mappedCustomEvents];
}

"use server";

import { prisma } from "@/lib/prisma";
import { AttendanceStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";

export async function submitAttendance(batchId: string, formData: FormData) {
  const dateStr = formData.get("date") as string;
  const date = new Date(dateStr);

  const entries = Array.from(formData.entries());

  // Filter for student status entries directly
  const studentEntries = entries.filter(([key]) => key.startsWith("status_"));

  // We loop through entries to upsert
  // optimized loop below replaces 'updates' mapping which was unused


  for (const [key, value] of studentEntries) {
     const userId = key.replace("status_", "");
      const status = value as AttendanceStatus;

      const existing = await prisma.attendance.findFirst({
          where: { userId, date }
      });

      if (existing) {
          await prisma.attendance.update({
              where: { id: existing.id },
              data: { status }
          });
      } else {
          await prisma.attendance.create({
              data: { userId, date, status }
          });
      }
  }

  revalidatePath(`/teacher/attendance/${batchId}`);
}

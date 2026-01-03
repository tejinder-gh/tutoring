"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function submitAssignment(assignmentId: string, studentId: string, fileUrl: string) {

  await db.submission.create({
    data: {
      assignmentId,
      studentId,
      fileUrl,
    },
  });

  revalidatePath("/student/assignments");
}

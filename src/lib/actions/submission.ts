"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function submitAssignment(assignmentId: string, studentId: string, fileUrl: string) {

  await prisma.submission.create({
    data: {
      assignmentId,
      studentId,
      fileUrl,
    },
  });

  revalidatePath("/student/assignments");
}

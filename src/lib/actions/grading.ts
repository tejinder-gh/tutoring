"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function submitGrade(submissionId: string, formData: FormData) {
  const grade = parseInt(formData.get("grade") as string);
  const feedback = formData.get("feedback") as string;

  await db.submission.update({
    where: { id: submissionId },
    data: {
      grade,
      feedback,
    },
  });

  revalidatePath("/teacher/assignments");
}

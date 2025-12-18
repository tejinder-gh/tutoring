"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createBatch(formData: FormData) {
  const name = formData.get("name") as string;
  const courseId = formData.get("courseId") as string;
  const startDateStr = formData.get("startDate") as string;
  const endDateStr = formData.get("endDate") as string;

  if (!name || !courseId || !startDateStr) {
    throw new Error("Missing required fields");
  }

  const startDate = new Date(startDateStr);
  const endDate = endDateStr ? new Date(endDateStr) : null;

  await prisma.batch.create({
    data: {
      name,
      courseId,
      startDate,
      endDate,
    },
  });

  revalidatePath("/admin/batches");
  redirect("/admin/batches");
}

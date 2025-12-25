"use server";

import { prisma } from "@/lib/prisma";
import { FeeFrequency } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createBatch(formData: FormData) {
  const name = formData.get("name") as string;
  const courseId = formData.get("courseId") as string;
  const startDateStr = formData.get("startDate") as string;
  const endDateStr = formData.get("endDate") as string;

  // Financials
  const fee = formData.get("fee") ? parseFloat(formData.get("fee") as string) : 0;
  const feeFrequency = (formData.get("feeFrequency") as FeeFrequency) || "ONE_TIME";
  const teacherCompensation = formData.get("teacherCompensation")
    ? parseFloat(formData.get("teacherCompensation") as string)
    : 0;
  const teacherCommission = formData.get("teacherCommission")
    ? parseFloat(formData.get("teacherCommission") as string)
    : 0;
  const monthlyOverHeadCost = formData.get("monthlyOverHeadCost")
    ? parseFloat(formData.get("monthlyOverHeadCost") as string)
    : 0;

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
      fee,
      feeFrequency,
      teacherCompensation,
      teacherCommission,
      monthlyOverHeadCost,
    },
  });

  revalidatePath("/admin/batches");
  redirect("/admin/batches");
}

export async function updateBatch(id: string, formData: FormData) {
  const name = formData.get("name") as string;
  const startDateStr = formData.get("startDate") as string;
  const endDateStr = formData.get("endDate") as string;

  // Financials
  const fee = formData.get("fee") ? parseFloat(formData.get("fee") as string) : 0;
  const feeFrequency = (formData.get("feeFrequency") as FeeFrequency) || "ONE_TIME";
  const teacherCompensation = formData.get("teacherCompensation")
    ? parseFloat(formData.get("teacherCompensation") as string)
    : 0;
  const teacherCommission = formData.get("teacherCommission")
    ? parseFloat(formData.get("teacherCommission") as string)
    : 0;
  const monthlyOverHeadCost = formData.get("monthlyOverHeadCost")
    ? parseFloat(formData.get("monthlyOverHeadCost") as string)
    : 0;

  if (!name || !startDateStr) {
    throw new Error("Missing required fields");
  }

  const startDate = new Date(startDateStr);
  const endDate = endDateStr ? new Date(endDateStr) : null;

  await prisma.batch.update({
    where: { id },
    data: {
      name,
      startDate,
      endDate,
      fee,
      feeFrequency,
      teacherCompensation,
      teacherCommission,
      monthlyOverHeadCost,
    },
  });

  revalidatePath("/admin/batches");
  revalidatePath(`/admin/batches/${id}`);
  redirect("/admin/batches");
}

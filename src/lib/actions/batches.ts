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

// =============================================================================
// BATCH ENROLLMENT ACTIONS
// =============================================================================

export async function getEnrollableStudents(batchId: string) {
  // Get students not already enrolled in this batch
  const batch = await prisma.batch.findUnique({
    where: { id: batchId },
    include: { enrollments: { select: { studentProfileId: true } } },
  });

  if (!batch) return [];

  const enrolledStudentIds = batch.enrollments.map((e: { studentProfileId: string }) => e.studentProfileId);

  const students = await prisma.studentProfile.findMany({
    where: {
      id: { notIn: enrolledStudentIds },
    },
    include: {
      user: { select: { id: true, name: true, email: true } },
    },
  });

  return students.map((s) => ({
    id: s.id,
    userId: s.userId,
    name: s.user.name,
    email: s.user.email,
  }));
}

export async function enrollStudentInBatch(batchId: string, studentProfileId: string, discount = 0) {
  const batch = await prisma.batch.findUnique({ where: { id: batchId } });
  if (!batch) throw new Error("Batch not found");

  // Check if already enrolled
  const existing = await prisma.enrollment.findFirst({
    where: { batchId, studentProfileId },
  });

  if (existing) throw new Error("Student already enrolled");

  const enrollment = await prisma.enrollment.create({
    data: {
      batchId,
      studentProfileId,
      courseId: batch.courseId,
      discount,
      status: "ACTIVE",
    },
  });

  // Also update student's batch reference
  await prisma.studentProfile.update({
    where: { id: studentProfileId },
    data: { batchId },
  });

  revalidatePath(`/admin/batches/${batchId}`);
  return { success: true, enrollment };
}

export async function removeStudentFromBatch(batchId: string, studentProfileId: string) {
  await prisma.enrollment.deleteMany({
    where: { batchId, studentProfileId },
  });

  // Clear student's batch reference
  await prisma.studentProfile.update({
    where: { id: studentProfileId },
    data: { batchId: null },
  });

  revalidatePath(`/admin/batches/${batchId}`);
  return { success: true };
}

export async function getBatchEnrollments(batchId: string) {
  const enrollments = await prisma.enrollment.findMany({
    where: { batchId },
    include: {
      studentProfile: {
        include: {
          user: { select: { id: true, name: true, email: true } },
        },
      },
    },
  });

  return enrollments.map((e) => ({
    id: e.id,
    studentProfileId: e.studentProfileId,
    studentName: e.studentProfile.user.name,
    studentEmail: e.studentProfile.user.email,
    status: e.status,
    discount: Number(e.discount || 0),
    enrolledAt: e.enrolledAt,
  }));
}

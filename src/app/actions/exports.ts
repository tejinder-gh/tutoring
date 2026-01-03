"use server";

import { requirePermission } from "@/lib/permissions";
import { db } from "@/lib/db";

// Export students to CSV format
export async function exportStudentsCSV() {
  await requirePermission("read", "user");

  const students = await db.studentProfile.findMany({
    include: {
      user: {
        select: {
          name: true,
          email: true,
          phone: true,
          createdAt: true,
        },
      },
      batch: {
        select: { name: true },
      },
    },
  });

  const headers = ["Name", "Email", "Phone", "Batch", "Joined Date"];
  const rows = students.map((s) => [
    s.user.name,
    s.user.email,
    s.user.phone || "",
    s.batch?.name || "Not Enrolled",
    new Date(s.user.createdAt).toLocaleDateString(),
  ]);

  const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

  return { csv, filename: `students_${new Date().toISOString().split("T")[0]}.csv` };
}

// Export payments to CSV format
export async function exportPaymentsCSV(startDate?: string, endDate?: string) {
  await requirePermission("read", "course"); // payment exports require course read access

  const where: { createdAt?: { gte?: Date; lte?: Date } } = {};
  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) where.createdAt.gte = new Date(startDate);
    if (endDate) where.createdAt.lte = new Date(endDate);
  }

  const payments = await db.paymentReceipts.findMany({
    where,
    include: {
      user: { select: { name: true, email: true } },
      course: { select: { title: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const headers = ["Date", "Student", "Email", "Course", "Amount Paid", "Expected", "Pending", "Payment Method"];
  const rows = payments.map((p: {
    createdAt: Date;
    user: { name: string; email: string };
    course: { title: string } | null;
    amountPaid: { toString: () => string };
    expectedAmount: { toString: () => string };
    pendingAmount: { toString: () => string };
    paymentMethod: string | null;
  }) => [
    new Date(p.createdAt).toLocaleDateString(),
    p.user.name,
    p.user.email,
    p.course?.title || "",
    Number(p.amountPaid).toFixed(2),
    Number(p.expectedAmount).toFixed(2),
    Number(p.pendingAmount).toFixed(2),
    p.paymentMethod || "",
  ]);

  const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

  return { csv, filename: `payments_${new Date().toISOString().split("T")[0]}.csv` };
}

// Export leads to CSV format
export async function exportLeadsCSV() {
  await requirePermission("read", "user"); // lead exports require user read access

  const leads = await db.lead.findMany({
    orderBy: { createdAt: "desc" },
  });

  const headers = ["Name", "Email", "Phone", "Source", "Status", "Course Interest", "Created Date"];
  const rows = leads.map((l) => [
    l.name,
    l.email || "",
    l.phone,
    l.source || "",
    l.status,
    l.courseInterest || "",
    new Date(l.createdAt).toLocaleDateString(),
  ]);

  const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

  return { csv, filename: `leads_${new Date().toISOString().split("T")[0]}.csv` };
}

// Export batches to CSV format
export async function exportBatchesCSV() {
  await requirePermission("read", "batch");

  const batches = await db.batch.findMany({
    include: {
      course: { select: { title: true } },
      _count: { select: { students: true, enrollments: true } },
    },
    orderBy: { startDate: "desc" },
  });

  const headers = ["Name", "Course", "Start Date", "End Date", "Fee", "Students", "Status"];
  const rows = batches.map((b) => [
    b.name,
    b.course.title,
    new Date(b.startDate).toLocaleDateString(),
    b.endDate ? new Date(b.endDate).toLocaleDateString() : "Ongoing",
    Number(b.fee).toFixed(2),
    b._count.enrollments.toString(),
    b.isActive ? "Active" : "Inactive",
  ]);

  const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

  return { csv, filename: `batches_${new Date().toISOString().split("T")[0]}.csv` };
}

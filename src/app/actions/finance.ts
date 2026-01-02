"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// TEACHER ACTIONS

export async function getTeacherSalaries() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const teacherProfile = await prisma.teacherProfile.findUnique({
    where: { userId: session.user.id },
  });

  if (!teacherProfile) return [];

  const salaries = await prisma.salary.findMany({
      where: { teacherProfileId: teacherProfile.id },
      include: {
          receipts: {
              orderBy: { paymentDate: 'desc' }
          }
      }
  });

  return salaries.flatMap(s => s.receipts.map(r => ({ ...r, baseSalary: s.baseSalary })));
}

export async function getTeacherSalaryStructure() {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const teacherProfile = await prisma.teacherProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!teacherProfile) return null;

    return await prisma.salary.findFirst({
        where: {
            teacherProfileId: teacherProfile.id,
            isActive: true
        }
    });
}

// STAFF ACTIONS

export async function getStaffSalaries() {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const staffProfile = await prisma.staffProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!staffProfile) return [];

    const salaries = await prisma.salary.findMany({
        where: { staffProfileId: staffProfile.id },
        include: {
            receipts: {
                orderBy: { paymentDate: 'desc' }
            }
        }
    });

    return salaries.flatMap(s => s.receipts.map(r => ({ ...r, baseSalary: s.baseSalary })));
}

export async function getStaffSalaryStructure() {
      const session = await auth();
      if (!session?.user?.id) throw new Error("Unauthorized");

      const staffProfile = await prisma.staffProfile.findUnique({
        where: { userId: session.user.id },
      });

      if (!staffProfile) return null;

      return await prisma.salary.findFirst({
          where: {
              staffProfileId: staffProfile.id,
              isActive: true
          }
      });
}

export async function updateBankDetails(details: { bankName: string; accountNumber: string; ifsc: string }) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    // Check if Teacher
    const teacherProfile = await prisma.teacherProfile.findUnique({ where: { userId: session.user.id }});
    if (teacherProfile) {
        await prisma.teacherProfile.update({
            where: { id: teacherProfile.id },
            data: { bankDetails: details }
        });
        revalidatePath("/teacher/finance");
        return { success: true };
    }

    // Check if Staff
    const staffProfile = await prisma.staffProfile.findUnique({ where: { userId: session.user.id }});
    if (staffProfile) {
        await prisma.staffProfile.update({
            where: { id: staffProfile.id },
            data: { bankDetails: details }
        });
        revalidatePath("/staff/finance");
        return { success: true };
    }

    throw new Error("Profile not found");
}

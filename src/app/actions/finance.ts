"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

// TEACHER ACTIONS

export async function getTeacherSalaries() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const teacherProfile = await db.teacherProfile.findUnique({
    where: { userId: session.user.id },
  });

  if (!teacherProfile) return [];

  const salaries = await db.salary.findMany({
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

    const teacherProfile = await db.teacherProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!teacherProfile) return null;

    return await db.salary.findFirst({
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

    const staffProfile = await db.staffProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!staffProfile) return [];

    const salaries = await db.salary.findMany({
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

      const staffProfile = await db.staffProfile.findUnique({
        where: { userId: session.user.id },
      });

      if (!staffProfile) return null;

      return await db.salary.findFirst({
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
    const teacherProfile = await db.teacherProfile.findUnique({ where: { userId: session.user.id }});
    if (teacherProfile) {
        await db.teacherProfile.update({
            where: { id: teacherProfile.id },
            data: { bankDetails: details }
        });
        revalidatePath("/teacher/finance");
        return { success: true };
    }

    // Check if Staff
    const staffProfile = await db.staffProfile.findUnique({ where: { userId: session.user.id }});
    if (staffProfile) {
        await db.staffProfile.update({
            where: { id: staffProfile.id },
            data: { bankDetails: details }
        });
        revalidatePath("/staff/finance");
        return { success: true };
    }

    throw new Error("Profile not found");
}

// ADMIN PAYROLL ACTIONS

export async function getPendingPayroll() {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    // Get all active teachers with their salary structures
    const teachers = await db.teacherProfile.findMany({
        where: {
            user: { isActive: true }
        },
        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                    email: true
                }
            },
            salaries: {
                where: { isActive: true },
                include: {
                    receipts: {
                        orderBy: { paymentDate: 'desc' },
                        take: 1
                    }
                }
            }
        }
    });

    // Get all active staff with their salary structures
    const staff = await db.staffProfile.findMany({
        where: {
            user: { isActive: true }
        },
        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                    email: true
                }
            },
            salaries: {
                where: { isActive: true },
                include: {
                    receipts: {
                        orderBy: { paymentDate: 'desc' },
                        take: 1
                    }
                }
            }
        }
    });

    // Format the data for the UI
    const teacherPayroll = teachers.map(t => ({
        profileId: t.id,
        userId: t.user.id,
        name: t.user.name,
        email: t.user.email,
        type: 'TEACHER' as const,
        salary: t.salaries[0] || null,
        lastPayment: t.salaries[0]?.receipts[0] || null
    }));

    const staffPayroll = staff.map(s => ({
        profileId: s.id,
        userId: s.user.id,
        name: s.user.name,
        email: s.user.email,
        type: 'STAFF' as const,
        salary: s.salaries[0] || null,
        lastPayment: s.salaries[0]?.receipts[0] || null
    }));

    return [...teacherPayroll, ...staffPayroll];
}

export async function processSalaryPayment(data: {
    salaryId: string;
    amount: number;
    paymentMethod: string;
    reference?: string;
    notes?: string;
}) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    try {
        const receipt = await db.salaryReceipt.create({
            data: {
                salaryId: data.salaryId,
                amount: data.amount,
                paymentMethod: data.paymentMethod as any,
                reference: data.reference ?? null,
                notes: data.notes ?? null,
                paymentDate: new Date()
            },
            include: {
                salary: {
                    include: {
                        teacherProfile: {
                            include: {
                                user: {
                                    include: { role: true }
                                }
                            }
                        },
                        staffProfile: {
                            include: {
                                user: {
                                    include: { role: true }
                                }
                            }
                        }
                    }
                }
            }
        });

        // Get the user (teacher or staff)
        const user = receipt.salary.teacherProfile?.user || receipt.salary.staffProfile?.user;

        // Create notification
        if (user) {
            await db.notification.create({
                data: {
                    userId: user.id,
                    title: 'Salary Processed',
                    message: `Your salary of ₹${data.amount} has been processed.`,
                    type: 'SUCCESS',
                    link: user.role?.name === 'TEACHER' ? '/teacher/finance' : '/staff/finance'
                }
            });
        }

        revalidatePath("/admin/finance/payroll");
        return { success: true, data: receipt };
    } catch (error) {
        console.error("Failed to process salary payment:", error);
        return { success: false, error: "Failed to process payment" };
    }
}

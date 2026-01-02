"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createStaff(data: {
  name: string;
  email: string;
  department: string;
  designation: string;
}) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Unauthorized" };

  try {
     // TODO: Transaction?
     // 1. Create User
     const user = await prisma.user.create({
         data: {
             name: data.name,
             email: data.email,
             password: "temp_password_hash", // In real app, send invite email
             role: {
                 connectOrCreate: {
                     where: { name: "STAFF" },
                     create: { name: "STAFF" }
                 }
             }
         }
     });

     // 2. Create Profile
     const profile = await prisma.staffProfile.create({
         data: {
             userId: user.id,
             department: data.department,
             designation: data.designation
         }
     });

     revalidatePath("/admin/staff");
     return { success: true, data: { user, profile } };
  } catch (error) {
    console.error("Failed to create staff:", error);
    return { success: false, error: "Failed to create staff" };
  }
}

export async function upsertSalaryStructure(staffProfileId: string, data: {
    baseSalary: number;
    allowances: number;
    deductions: number;
    effectiveFrom: string;
}) {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: "Unauthorized" };

    try {
        const salary = await prisma.salary.create({
            data: {
                staffProfileId,
                baseSalary: data.baseSalary,
                allowances: data.allowances,
                deductions: data.deductions,
                effectiveFrom: new Date(data.effectiveFrom),
            }
        });

        // Deactivate old salaries? (Assume latest is active logic or manual management)

        return { success: true, data: salary };
    } catch (error) {
        console.error("Failed to update salary:", error);
        return { success: false, error: "Failed to update salary" };
    }
}

export async function processSalaryPayment(salaryId: string, amount: number) {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: "Unauthorized" };

    try {
        const receipt = await prisma.salaryReceipt.create({
            data: {
                salaryId,
                amount,
                paymentMethod: "BANK_TRANSFER",
                paymentDate: new Date()
            }
        });

        return { success: true, data: receipt };
    } catch (error) {
        console.error("Failed to process payment:", error);
        return { success: false, error: "Failed to process payment" };
    }
}

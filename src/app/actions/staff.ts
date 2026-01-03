"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
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
     // Use transaction for atomic user + profile creation
     const result = await db.$transaction(async (tx) => {
       // 1. Create User
       const user = await tx.user.create({
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
       const profile = await tx.staffProfile.create({
         data: {
           userId: user.id,
           department: data.department,
           designation: data.designation
         }
       });

       return { user, profile };
     });

     revalidatePath("/admin/staff");
     return { success: true, data: result };
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
        const salary = await db.salary.create({
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
        const receipt = await db.salaryReceipt.create({
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

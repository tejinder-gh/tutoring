"use server";

import { auth } from "@/auth";
import { requirePermission } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export interface ExpenseData {
  title: string;
  amount: number;
  category: string;
  date: Date;
  description?: string;
  branchId?: string;
}

export async function getExpenses(filters?: {
  startDate?: Date;
  endDate?: Date;
  branchId?: string;
  category?: string;
}) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  await requirePermission("read", "finance");

  const where: any = {};

  if (filters?.startDate && filters?.endDate) {
    where.date = {
      gte: filters.startDate,
      lte: filters.endDate,
    };
  }

  if (filters?.branchId) {
    where.branchId = filters.branchId;
  }

  if (filters?.category && filters.category !== "ALL") {
    where.category = filters.category;
  }

  return await prisma.expense.findMany({
    where,
    orderBy: { date: "desc" },
    include: {
      branch: { select: { name: true } }
    }
  });
}

export async function addExpense(data: ExpenseData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  await requirePermission("manage", "finance");

  const expense = await prisma.expense.create({
    data: {
      ...data,
      recordedBy: session.user.id,
    },
  });

  revalidatePath("/admin/finance/expenses");
  return { success: true, data: expense };
}

export async function updateExpense(id: string, data: Partial<ExpenseData>) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  await requirePermission("manage", "finance");

  const expense = await prisma.expense.update({
    where: { id },
    data,
  });

  revalidatePath("/admin/finance/expenses");
  return { success: true, data: expense };
}

export async function deleteExpense(id: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  await requirePermission("manage", "finance");

  await prisma.expense.delete({
    where: { id },
  });

  revalidatePath("/admin/finance/expenses");
  return { success: true };
}

export async function getExpenseCategories() {
  // Return unique categories used in the DB + default ones
  const defaults = ["OPERATIONAL", "RENT", "UTILITIES", "SALARY", "MARKETING", "EQUIPMENT", "OTHER"];

  const used = await prisma.expense.groupBy({
    by: ['category'],
  });

  const usedCats = used.map(u => u.category);
  return Array.from(new Set([...defaults, ...usedCats]));
}

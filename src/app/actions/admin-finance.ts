"use server";

import { auth } from "@/auth";
import { requirePermission } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { endOfMonth, startOfMonth, subMonths } from "date-fns";

// =============================================================================
// ADMIN FINANCE OVERVIEW
// =============================================================================

export interface FinanceOverview {
  totalRevenue: number;
  thisMonthRevenue: number;
  pendingPayments: number;
  pendingPaymentsCount: number;
  totalDisbursed: number;
  pendingSalaries: number;
  pendingSalariesCount: number;
  totalExpenses: number;
  netProfit: number;
}

export async function getFinanceOverview(): Promise<FinanceOverview> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  await requirePermission("read", "finance");

  const now = new Date();
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);

  const [
    totalRevenueResult,
    thisMonthRevenueResult,
    pendingPaymentsResult,
    totalDisbursedResult,
    pendingSalariesResult,
    totalExpensesResult,
  ] = await Promise.all([
    // Total revenue (all time)
    prisma.paymentReceipts.aggregate({
      _sum: { amountPaid: true },
    }),
    // This month's revenue
    prisma.paymentReceipts.aggregate({
      where: {
        paymentDate: { gte: monthStart, lte: monthEnd },
      },
      _sum: { amountPaid: true },
    }),
    // Pending payments (where pendingAmount > 0)
    prisma.paymentReceipts.aggregate({
      where: { pendingAmount: { gt: 0 } },
      _sum: { pendingAmount: true },
      _count: true,
    }),
    // Total salary disbursed
    prisma.salaryReceipt.aggregate({
      _sum: { amount: true },
    }),
    // Pending salaries (active salaries without recent receipt)
    prisma.salary.findMany({
      where: { isActive: true },
      include: {
        receipts: {
          where: {
            paymentDate: { gte: monthStart },
          },
        },
        teacherProfile: { include: { user: true } },
        staffProfile: { include: { user: true } },
      },
    }),
    // Total Expenses
    prisma.expense.aggregate({
        where: {
            date: { gte: monthStart, lte: monthEnd }
        },
        _sum: { amount: true }
    })
  ]);

  // Calculate pending salaries (active salaries not paid this month)
  const unpaidSalaries = pendingSalariesResult.filter(
    (s) => s.receipts.length === 0
  );
  const pendingSalaryAmount = unpaidSalaries.reduce(
    (sum, s) =>
      sum +
      (Number(s.baseSalary) + Number(s.allowances) - Number(s.deductions)),
    0
  );

  return {
    totalRevenue: Number(totalRevenueResult._sum.amountPaid || 0),
    thisMonthRevenue: Number(thisMonthRevenueResult._sum.amountPaid || 0),
    pendingPayments: Number(pendingPaymentsResult._sum.pendingAmount || 0),
    pendingPaymentsCount: pendingPaymentsResult._count || 0,
    totalDisbursed: Number(totalDisbursedResult._sum.amount || 0),
    pendingSalaries: pendingSalaryAmount,
    pendingSalariesCount: unpaidSalaries.length,
    totalExpenses: Number(totalExpensesResult._sum.amount || 0),
    netProfit: Number(thisMonthRevenueResult._sum.amountPaid || 0) - Number(totalExpensesResult._sum.amount || 0) - Number(totalDisbursedResult._sum.amount || 0) // Revenue - Expenses - Salaries Paid
  };
}

// =============================================================================
// PAYMENT RECEIPTS
// =============================================================================

export interface PaymentReceiptWithDetails {
  id: string;
  amountPaid: number;
  expectedAmount: number;
  pendingAmount: number;
  paymentDate: Date;
  paymentMethod: string;
  reference: string | null;
  notes: string | null;
  user: {
    id: string;
    name: string;
    email: string;
  };
  course: {
    id: string;
    title: string;
  } | null;
}

export async function getRecentPayments(
  page = 1,
  limit = 20
): Promise<{ payments: PaymentReceiptWithDetails[]; total: number }> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  await requirePermission("read", "finance");

  const skip = (page - 1) * limit;

  const [payments, total] = await Promise.all([
    prisma.paymentReceipts.findMany({
      skip,
      take: limit,
      orderBy: { paymentDate: "desc" },
      include: {
        user: { select: { id: true, name: true, email: true } },
        course: { select: { id: true, title: true } },
      },
    }),
    prisma.paymentReceipts.count(),
  ]);

  return {
    payments: payments.map((p) => ({
      ...p,
      amountPaid: Number(p.amountPaid),
      expectedAmount: Number(p.expectedAmount),
      pendingAmount: Number(p.pendingAmount),
    })),
    total,
  };
}

// =============================================================================
// SALARY MANAGEMENT
// =============================================================================

export interface SalaryWithDetails {
  id: string;
  baseSalary: number;
  allowances: number;
  deductions: number;
  netSalary: number;
  effectiveFrom: Date;
  isActive: boolean;
  paidThisMonth: boolean;
  employee: {
    id: string;
    name: string;
    email: string;
    type: "TEACHER" | "STAFF";
    department?: string;
  };
}

export async function getPendingSalaries(): Promise<SalaryWithDetails[]> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  await requirePermission("manage", "finance");

  const monthStart = startOfMonth(new Date());

  const salaries = await prisma.salary.findMany({
    where: { isActive: true },
    include: {
      receipts: {
        where: { paymentDate: { gte: monthStart } },
      },
      teacherProfile: { include: { user: true } },
      staffProfile: { include: { user: true } },
    },
  });

  return salaries.map((s) => {
    const baseSalary = Number(s.baseSalary);
    const allowances = Number(s.allowances);
    const deductions = Number(s.deductions);

    return {
      id: s.id,
      baseSalary,
      allowances,
      deductions,
      netSalary: baseSalary + allowances - deductions,
      effectiveFrom: s.effectiveFrom,
      isActive: s.isActive,
      paidThisMonth: s.receipts.length > 0,
      employee: s.teacherProfile
        ? {
            id: s.teacherProfile.userId,
            name: s.teacherProfile.user.name,
            email: s.teacherProfile.user.email,
            type: "TEACHER" as const,
            department: s.teacherProfile.domain,
          }
        : {
            id: s.staffProfile!.userId,
            name: s.staffProfile!.user.name,
            email: s.staffProfile!.user.email,
            type: "STAFF" as const,
            department: s.staffProfile!.department,
          },
    };
  });
}

export async function processSalaryPayment(
  salaryId: string,
  amount: number,
  reference?: string
) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  await requirePermission("manage", "finance");

  const salary = await prisma.salary.findUnique({ where: { id: salaryId } });
  if (!salary) throw new Error("Salary record not found");

  const receipt = await prisma.salaryReceipt.create({
    data: {
      salaryId,
      amount,
      paymentMethod: "BANK_TRANSFER",
      reference: reference ?? null,
      paymentDate: new Date(),
    },
  });

  return { success: true, data: receipt };
}

export async function processBulkSalaryPayment(salaryIds: string[]) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  await requirePermission("manage", "finance");

  const salaries = await prisma.salary.findMany({
    where: { id: { in: salaryIds } },
  });

  const receipts = await prisma.$transaction(
    salaries.map((s) =>
      prisma.salaryReceipt.create({
        data: {
          salaryId: s.id,
          amount:
            Number(s.baseSalary) + Number(s.allowances) - Number(s.deductions),
          paymentMethod: "BANK_TRANSFER",
          paymentDate: new Date(),
        },
      })
    )
  );

  return { success: true, count: receipts.length };
}

// =============================================================================
// BATCH PROFITABILITY
// =============================================================================

export interface BatchProfitability {
  batchId: string;
  batchName: string;
  courseName: string;
  enrolledStudents: number;
  fee: number;
  feeFrequency: string;
  teacherCompensation: number;
  teacherCommission: number;
  monthlyOverhead: number;
  revenue: number;
  costs: number;
  profit: number;
  profitMargin: number;
}

export async function getBatchProfitability(): Promise<BatchProfitability[]> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  await requirePermission("read", "finance");

  const batches = await prisma.batch.findMany({
    where: { isActive: true },
    include: {
      course: true,
      students: true,
      enrollments: { where: { status: "ACTIVE" } },
    },
  });

  return batches.map((batch) => {
    const studentCount = batch.enrollments.length;
    const fee = Number(batch.fee);
    const teacherComp = Number(batch.teacherCompensation);
    const teacherComm = Number(batch.teacherCommission);
    const overhead = Number(batch.monthlyOverHeadCost);

    // Calculate based on formula from schema comments:
    // (totalNoOfParticipants * fee)*feeFrequency - teacherCompensation - totalNoOfParticipants*teacherCommission - monthlyOverHeadCost*batchDuration
    const feeMultiplier = batch.feeFrequency === "MONTHLY" ? 1 : 1; // Simplified for single month view
    const revenue = studentCount * fee * feeMultiplier;
    const costs = teacherComp + studentCount * teacherComm + overhead;
    const profit = revenue - costs;
    const profitMargin = revenue > 0 ? (profit / revenue) * 100 : 0;

    return {
      batchId: batch.id,
      batchName: batch.name,
      courseName: batch.course.title,
      enrolledStudents: studentCount,
      fee,
      feeFrequency: batch.feeFrequency,
      teacherCompensation: teacherComp,
      teacherCommission: teacherComm,
      monthlyOverhead: overhead,
      revenue,
      costs,
      profit,
      profitMargin: Math.round(profitMargin * 100) / 100,
    };
  });
}

// =============================================================================
// REVENUE TRENDS
// =============================================================================

export async function getRevenueTrends(months = 6) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  await requirePermission("read", "finance");

  const trends = [];
  const now = new Date();

  for (let i = months - 1; i >= 0; i--) {
    const monthStart = startOfMonth(subMonths(now, i));
    const monthEnd = endOfMonth(subMonths(now, i));

    const result = await prisma.paymentReceipts.aggregate({
      where: {
        paymentDate: { gte: monthStart, lte: monthEnd },
      },
      _sum: { amountPaid: true },
      _count: true,
    });

    trends.push({
      month: monthStart.toLocaleDateString("en-US", {
        month: "short",
        year: "2-digit",
      }),
      revenue: Number(result._sum.amountPaid || 0),
      transactions: result._count,
    });
  }

  return trends;
}

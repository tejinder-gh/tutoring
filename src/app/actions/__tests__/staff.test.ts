/**
 * @jest-environment node
 */
import { auth } from '@/auth';
import { db } from "@/lib/db";
import { createStaff, processSalaryPayment, upsertSalaryStructure } from '../staff';

// Mock dependencies
jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: { create: jest.fn() },
    staffProfile: { create: jest.fn() },
    salary: { create: jest.fn() },
    salaryReceipt: { create: jest.fn() },
    $transaction: jest.fn(),
  },
}));

jest.mock('@/auth', () => ({
  auth: jest.fn(),
}));

jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
}));

describe('Staff & Financial Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (auth as jest.Mock).mockResolvedValue({ user: { id: 'admin-1' } });
  });

  test('createStaff should create user and profile', async () => {
    // Mock $transaction to execute the callback with a mock tx
    (db.$transaction as jest.Mock).mockImplementation(async (callback) => {
      const mockTx = {
        user: {
          create: jest.fn().mockResolvedValue({ id: 'u1', email: 'staff@test.com' })
        },
        staffProfile: {
          create: jest.fn().mockResolvedValue({ id: 'sp1', userId: 'u1' })
        }
      };
      return callback(mockTx);
    });

    const result = await createStaff({
        name: 'Staff One',
        email: 'staff@test.com',
        department: 'HR',
        designation: 'Manager'
    });

    expect(result.success).toBe(true);
    expect(db.$transaction).toHaveBeenCalled();
  });

  test('upsertSalaryStructure should create salary record', async () => {
      (db.salary.create as jest.Mock).mockResolvedValue({ id: 'sal-1', baseSalary: 5000 });

      const result = await upsertSalaryStructure('sp1', {
          baseSalary: 5000,
          allowances: 1000,
          deductions: 500,
          effectiveFrom: '2025-01-01'
      });

      expect(result.success).toBe(true);
      expect(db.salary.create).toHaveBeenCalledWith(expect.objectContaining({
          data: expect.objectContaining({ baseSalary: 5000 })
      }));
  });

  test('processSalaryPayment should create receipt', async () => {
      (db.salaryReceipt.create as jest.Mock).mockResolvedValue({ id: 'rec-1', amount: 5500 });

      const result = await processSalaryPayment('sal-1', 5500);

      expect(result.success).toBe(true);
      expect(db.salaryReceipt.create).toHaveBeenCalled();
  });
});

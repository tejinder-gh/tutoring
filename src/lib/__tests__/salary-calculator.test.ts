import { calculateHourlyPay, calculateSalary } from '../salary-calculator';

describe('Salary Calculator', () => {
  describe('calculateSalary', () => {
    test('should calculate basic salary correctly', () => {
      expect(calculateSalary(50000, 5000, 2000)).toBe(53000);
    });

    test('should include commission', () => {
      // Base: 1000, Commission: 100 * 5 students = 500. Total: 1500.
      expect(calculateSalary(1000, 0, 0, 100, 5)).toBe(1500);
    });

    test('should handle complex case', () => {
      // Base: 20000
      // Allowances: 5000
      // Commission: 500 * 10 = 5000
      // Gross: 30000
      // Deductions: 2000
      // Net: 28000
      expect(calculateSalary(20000, 5000, 2000, 500, 10)).toBe(28000);
    });

    test('should returns 0 if deductions exceed earnings', () => {
        expect(calculateSalary(1000, 0, 2000)).toBe(0);
    });

    test('should throw error for negative values', () => {
        expect(() => calculateSalary(-100)).toThrow();
    });
  });

  describe('calculateHourlyPay', () => {
      test('should calculate correctly', () => {
          expect(calculateHourlyPay(10, 50)).toBe(500);
      });
  });
});

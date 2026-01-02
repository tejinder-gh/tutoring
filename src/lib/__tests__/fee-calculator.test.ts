import { calculateFinalFee, calculatePendingAmount, calculateTax } from '../fee-calculator';

describe('Fee Calculator', () => {
  describe('calculateFinalFee', () => {
    test('should return base fee if no discount', () => {
      expect(calculateFinalFee(1000)).toBe(1000);
    });

    test('should apply percentage discount correctly', () => {
      expect(calculateFinalFee(1000, 10, 'PERCENTAGE')).toBe(900);
      expect(calculateFinalFee(1000, 50, 'PERCENTAGE')).toBe(500);
    });

    test('should apply fixed discount correctly', () => {
      expect(calculateFinalFee(1000, 100, 'FIXED')).toBe(900);
      expect(calculateFinalFee(1000, 1000, 'FIXED')).toBe(0);
    });

    test('should not return negative fee', () => {
      expect(calculateFinalFee(1000, 1200, 'FIXED')).toBe(0);
      expect(calculateFinalFee(1000, 120, 'PERCENTAGE')).toBe(0); // Capped implicitly by math or logic
    });

    test('should throw error for negative inputs', () => {
      expect(() => calculateFinalFee(-100)).toThrow();
      expect(() => calculateFinalFee(100, -10)).toThrow();
    });

    test('should cap percentage discount at 100%', () => {
        expect(calculateFinalFee(100, 150, 'PERCENTAGE')).toBe(0);
    });
  });

  describe('calculatePendingAmount', () => {
    test('should calculate pending amount correctly', () => {
      expect(calculatePendingAmount(1000, 400)).toBe(600);
    });

    test('should return 0 if fully paid or overpaid', () => {
      expect(calculatePendingAmount(1000, 1000)).toBe(0);
      expect(calculatePendingAmount(1000, 1200)).toBe(0);
    });
  });

  describe('calculateTax', () => {
      test('should calculate tax correctly', () => {
          expect(calculateTax(100, 18)).toBe(18);
          expect(calculateTax(1000, 5)).toBe(50);
      });
  });
});

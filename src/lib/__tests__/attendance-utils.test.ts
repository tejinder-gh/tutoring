import { calculateAttendanceStats, isAttendanceSufficient } from '../attendance-utils';

describe('Attendance Utils', () => {
  describe('calculateAttendanceStats', () => {
    test('should return 0 stats for empty records', () => {
        const stats = calculateAttendanceStats([]);
        expect(stats.total).toBe(0);
        expect(stats.percentage).toBe(0);
    });

    test('should calculate 100% attendance', () => {
        const records = [{ status: 'PRESENT' }, { status: 'PRESENT' }] as any;
        const stats = calculateAttendanceStats(records);
        expect(stats.percentage).toBe(100);
        expect(stats.present).toBe(2);
    });

    test('should count LATE as attended', () => {
        const records = [{ status: 'PRESENT' }, { status: 'LATE' }] as any;
        const stats = calculateAttendanceStats(records);
        expect(stats.percentage).toBe(100);
        expect(stats.late).toBe(1);
    });

    test('should calculate 50% attendance', () => {
        const records = [{ status: 'PRESENT' }, { status: 'ABSENT' }] as any;
        const stats = calculateAttendanceStats(records);
        expect(stats.percentage).toBe(50);
        expect(stats.absent).toBe(1);
    });

    test('should handle excused (currently counted in total but not present)', () => {
        // Based on implementation: (Present + Late) / Total
        const records = [{ status: 'PRESENT' }, { status: 'EXCUSED' }] as any;
        const stats = calculateAttendanceStats(records);
        expect(stats.percentage).toBe(50);
        expect(stats.excused).toBe(1);
    });
  });

  describe('isAttendanceSufficient', () => {
      test('should return true if percentage >= required', () => {
          expect(isAttendanceSufficient(75, 75)).toBe(true);
          expect(isAttendanceSufficient(80, 75)).toBe(true);
      });

      test('should return false if percentage < required', () => {
          expect(isAttendanceSufficient(74.9, 75)).toBe(false);
      });
  });
});

export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';

interface AttendanceRecord {
  status: AttendanceStatus;
}

/**
 * Calculates attendance statistics.
 * @param records Array of attendance records.
 * @returns Object containing counts and percentage.
 */
export function calculateAttendanceStats(records: AttendanceRecord[]) {
  const total = records.length;
  if (total === 0) {
    return {
      total: 0,
      present: 0,
      absent: 0,
      late: 0,
      excused: 0,
      percentage: 0,
    };
  }

  let present = 0;
  let absent = 0;
  let late = 0;
  let excused = 0;

  records.forEach((record) => {
    switch (record.status) {
      case 'PRESENT':
        present++;
        break;
      case 'ABSENT':
        absent++;
        break;
      case 'LATE':
        late++;
        break;
      case 'EXCUSED':
        excused++;
        break;
    }
  });

  // Late counts as 0.5 present? Or just present?
  // Usually Late implies present but late.
  // Absent is absent.
  // Excused might not count against percentage?
  // For simplicity: Percentage = ((Present + Late) / Total) * 100
  // Or exclude excused from total?
  // Let's assume standard: (Present + Late) / (Total - Excused) * 100 ?
  // Or just (Present + Late) / Total * 100

  // Let's go with: Present and Late count as 'Attended'.
  const attendedCount = present + late;
  const percentage = (attendedCount / total) * 100;

  return {
    total,
    present,
    absent,
    late,
    excused,
    percentage: Number(percentage.toFixed(2)),
  };
}

/**
 * Checks if attendance meets the minimum requirement.
 * @param percentage Current attendance percentage.
 * @param required Minimum required percentage (default 75).
 */
export function isAttendanceSufficient(percentage: number, required: number = 75): boolean {
  return percentage >= required;
}

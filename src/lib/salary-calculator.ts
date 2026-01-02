/**
 * Calculates the total salary for a staff member.
 * @param baseBase The monthly base salary.
 * @param allowances Additional allowances.
 * @param deductions Deductions.
 * @param commissionPerStudent Commission amount per student (for teachers).
 * @param studentCount Number of students (for commission calculation).
 * @returns The final salary amount.
 */
export function calculateSalary(
  baseSalary: number,
  allowances: number = 0,
  deductions: number = 0,
  commissionPerStudent: number = 0,
  studentCount: number = 0
): number {
  if (baseSalary < 0) throw new Error('Base salary cannot be negative');
  if (allowances < 0) throw new Error('Allowances cannot be negative');
  if (deductions < 0) throw new Error('Deductions cannot be negative');
  if (commissionPerStudent < 0) throw new Error('Commission cannot be negative');
  if (studentCount < 0) throw new Error('Student count cannot be negative');

  const totalCommission = commissionPerStudent * studentCount;
  const grossSalary = baseSalary + allowances + totalCommission;
  const netSalary = grossSalary - deductions;

  return Math.max(0, Number(netSalary.toFixed(2)));
}

/**
 * Calculates the hourly pay if applicable (optional utility).
 * @param hoursWorked Number of hours worked.
 * @param hourlyRate Hourly rate.
 * @returns Total pay.
 */
export function calculateHourlyPay(hoursWorked: number, hourlyRate: number): number {
    if (hoursWorked < 0 || hourlyRate < 0) throw new Error('Inputs cannot be negative');
    return Number((hoursWorked * hourlyRate).toFixed(2));
}

export type DiscountType = 'PERCENTAGE' | 'FIXED';

/**
 * Calculates the final fee after applying discount.
 * @param baseFee The original price of the course or item.
 * @param discount The discount value.
 * @param discountType The type of discount (Percentage or Fixed amount).
 * @returns The final fee, rounded to 2 decimal places. Does not return negative values.
 */
export function calculateFinalFee(
  baseFee: number,
  discount: number = 0,
  discountType: DiscountType = 'PERCENTAGE'
): number {
  if (baseFee < 0) throw new Error('Base fee cannot be negative');
  if (discount < 0) throw new Error('Discount cannot be negative');

  let finalFee = baseFee;

  if (discountType === 'PERCENTAGE') {
    // Cap discount at 100%
    const effectiveDiscount = Math.min(discount, 100);
    finalFee = baseFee - (baseFee * effectiveDiscount) / 100;
  } else {
    finalFee = baseFee - discount;
  }

  // Ensure no negative fee
  return Math.max(0, Number(finalFee.toFixed(2)));
}

/**
 * Calculates the pending amount.
 * @param totalExpected The total amount that should be paid.
 * @param amountPaid The amount already paid.
 * @returns The pending amount.
 */
export function calculatePendingAmount(
  totalExpected: number,
  amountPaid: number
): number {
  if (totalExpected < 0) throw new Error('Total expected amount cannot be negative');
  if (amountPaid < 0) throw new Error('Amount paid cannot be negative');

  const pending = totalExpected - amountPaid;
  return Math.max(0, Number(pending.toFixed(2)));
}

/**
 * Calculates tax (e.g. GST).
 * @param amount The amount to tax.
 * @param taxRate Percentage tax rate (e.g. 18 for 18%).
 * @returns The tax amount.
 */
export function calculateTax(amount: number, taxRate: number): number {
    return Number(((amount * taxRate) / 100).toFixed(2));
}

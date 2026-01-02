"use client";

import { processSalaryPayment } from "@/app/actions/finance";
import { Loader2, X } from "lucide-react";
import { useState, useTransition } from "react";

type PayrollEntry = {
  profileId: string;
  userId: string;
  name: string;
  email: string;
  type: 'TEACHER' | 'STAFF';
  salary: {
    id: string;
    baseSalary: any;
    allowances: any;
    deductions: any;
  } | null;
};

export function ProcessPaymentDialog({
  entry,
  netSalary,
  onClose
}: {
  entry: PayrollEntry;
  netSalary: number;
  onClose: () => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [customAmount, setCustomAmount] = useState(netSalary.toString());

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!entry.salary) return;

    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const res = await processSalaryPayment({
        salaryId: entry.salary!.id,
        amount: Number(customAmount),
        paymentMethod: formData.get("paymentMethod") as string,
        reference: formData.get("reference") as string || undefined,
        notes: formData.get("notes") as string || undefined
      });

      if (res.success) {
        onClose();
      } else {
        alert("Failed to process payment");
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-background border border-border rounded-xl p-6 w-full max-w-md relative animate-in zoom-in-95 shadow-xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-text-muted hover:text-foreground"
        >
          <X size={20} />
        </button>

        <h2 className="text-xl font-bold mb-1">Process Salary Payment</h2>
        <p className="text-sm text-text-muted mb-4">
          For {entry.name} ({entry.type})
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Salary Breakdown */}
          <div className="bg-accent/20 p-4 rounded-lg space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-text-muted">Base Salary:</span>
              <span className="font-medium">₹{Number(entry.salary?.baseSalary).toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-green-600">
              <span>Allowances:</span>
              <span>+₹{Number(entry.salary?.allowances).toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-red-600">
              <span>Deductions:</span>
              <span>-₹{Number(entry.salary?.deductions).toLocaleString()}</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-border font-bold text-base">
              <span>Net Salary:</span>
              <span>₹{netSalary.toLocaleString()}</span>
            </div>
          </div>

          {/* Payment Amount */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Payment Amount (₹)
            </label>
            <input
              type="number"
              value={customAmount}
              onChange={(e) => setCustomAmount(e.target.value)}
              min="0"
              step="0.01"
              required
              className="w-full p-2 rounded border border-border bg-background focus:ring-2 focus:ring-primary/20 outline-none"
            />
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Payment Method
            </label>
            <select
              name="paymentMethod"
              required
              className="w-full p-2 rounded border border-border bg-background focus:ring-2 focus:ring-primary/20 outline-none"
            >
              <option value="BANK_TRANSFER">Bank Transfer</option>
              <option value="CASH">Cash</option>
              <option value="UPI">UPI</option>
              <option value="CHEQUE">Cheque</option>
            </select>
          </div>

          {/* Reference */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Transaction Reference (Optional)
            </label>
            <input
              name="reference"
              type="text"
              placeholder="e.g., TXN123456"
              className="w-full p-2 rounded border border-border bg-background focus:ring-2 focus:ring-primary/20 outline-none"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Notes (Optional)
            </label>
            <textarea
              name="notes"
              rows={2}
              placeholder="Any additional notes..."
              className="w-full p-2 rounded border border-border bg-background resize-none focus:ring-2 focus:ring-primary/20 outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="btn-outline"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="btn-primary flex items-center gap-2"
            >
              {isPending && <Loader2 size={16} className="animate-spin" />}
              {isPending ? "Processing..." : "Process Payment"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

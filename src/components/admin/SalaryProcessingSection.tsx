"use client";

import type { SalaryWithDetails } from "@/app/actions/admin-finance";
import { processBulkSalaryPayment, processSalaryPayment } from "@/app/actions/admin-finance";
import { ArrowUpRight, CheckCircle, DollarSign } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";

export function SalaryProcessingSection({
  pendingSalaries,
}: {
  pendingSalaries: SalaryWithDetails[];
}) {
  const [isPending, startTransition] = useTransition();
  const [selectedSalaries, setSelectedSalaries] = useState<string[]>([]);
  const [processedCount, setProcessedCount] = useState(0);

  const handleProcessSalary = (salaryId: string, amount: number) => {
    if (!confirm("Are you sure you want to process this salary payment?")) return;
    startTransition(async () => {
      try {
        await processSalaryPayment(salaryId, amount);
        setProcessedCount(prev => prev + 1);
        toast.success("Payment processed successfully");
      } catch (error) {
        toast.error("Failed to process payment");
      }
    });
  };

  const handleBulkProcess = () => {
    if (selectedSalaries.length === 0) return;
    if (!confirm(`Are you sure you want to process ${selectedSalaries.length} salary payments?`)) return;

    startTransition(async () => {
      try {
        await processBulkSalaryPayment(selectedSalaries);
        setProcessedCount(prev => prev + selectedSalaries.length);
        setSelectedSalaries([]);
        toast.success("Bulk payments processed successfully");
      } catch (error) {
        toast.error("Failed to process payments");
      }
    });
  };

  const toggleSelection = (salaryId: string) => {
    setSelectedSalaries((prev) =>
      prev.includes(salaryId)
        ? prev.filter((id) => id !== salaryId)
        : [...prev, salaryId]
    );
  };

  // Filter out salaries that are already paid (though the pendingSalaries prop typically won't have them if filtered by parent,
  // but let's be safe or just show them differently)
  const unpaidSalaries = pendingSalaries.filter(s => !s.paidThisMonth);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold">Pending Salary Payments</h2>
          <p className="text-sm text-text-muted">{unpaidSalaries.length} employees waiting for payment</p>
        </div>

        {selectedSalaries.length > 0 && (
          <button
            onClick={handleBulkProcess}
            disabled={isPending}
            className="btn-primary flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium hover:opacity-90 disabled:opacity-50"
          >
            <DollarSign size={16} />
            Process {selectedSalaries.length} Selected
          </button>
        )}
      </div>

      {unpaidSalaries.length === 0 ? (
        <div className="bg-card border border-border rounded-xl p-12 text-center">
          <CheckCircle size={48} className="mx-auto text-green-500 mb-4" />
          <p className="text-lg font-medium">All salaries processed!</p>
          <p className="text-text-muted">No pending payments for this month so far.</p>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-accent/30 text-text-muted">
              <tr>
                <th className="p-4 text-left w-10">
                  <input
                    type="checkbox"
                    checked={selectedSalaries.length === unpaidSalaries.length && unpaidSalaries.length > 0}
                    onChange={(e) =>
                      setSelectedSalaries(
                        e.target.checked ? unpaidSalaries.map((s) => s.id) : []
                      )
                    }
                    className="rounded border-gray-300 focus:ring-primary"
                  />
                </th>
                <th className="p-4 text-left font-medium">Employee</th>
                <th className="p-4 text-left font-medium">Role</th>
                <th className="p-4 text-right font-medium hidden sm:table-cell">Base Salary</th>
                <th className="p-4 text-right font-medium hidden sm:table-cell">Allowances</th>
                <th className="p-4 text-right font-medium hidden sm:table-cell">Deductions</th>
                <th className="p-4 text-right font-medium">Net Salary</th>
                <th className="p-4 text-center font-medium">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {unpaidSalaries.map((salary) => {
                const netSalary = Number(salary.baseSalary) + Number(salary.allowances) - Number(salary.deductions);

                return (
                  <tr key={salary.id} className="hover:bg-accent/10 transition-colors">
                    <td className="p-4">
                      <input
                        type="checkbox"
                        checked={selectedSalaries.includes(salary.id)}
                        onChange={() => toggleSelection(salary.id)}
                        className="rounded border-gray-300 focus:ring-primary"
                      />
                    </td>
                    <td className="p-4">
                      <div>
                        <p className="font-medium text-foreground">{salary.employee.name}</p>
                        <p className="text-xs text-text-muted">{salary.employee.email}</p>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`text-xs px-2 py-1 rounded font-medium ${salary.employee.type === 'TEACHER' ? 'bg-blue-500/10 text-blue-500' : 'bg-purple-500/10 text-purple-500'
                        }`}>
                        {salary.employee.type}
                      </span>
                    </td>
                    <td className="p-4 text-right hidden sm:table-cell">
                      ₹{Number(salary.baseSalary).toLocaleString()}
                    </td>
                    <td className="p-4 text-right text-green-500 hidden sm:table-cell">
                      +₹{Number(salary.allowances).toLocaleString()}
                    </td>
                    <td className="p-4 text-right text-red-500 hidden sm:table-cell">
                      -₹{Number(salary.deductions).toLocaleString()}
                    </td>
                    <td className="p-4 text-right font-bold text-foreground">
                      ₹{netSalary.toLocaleString()}
                    </td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => handleProcessSalary(salary.id, netSalary)}
                        disabled={isPending}
                        className="p-2 hover:bg-green-500/10 text-green-500 rounded transition"
                        title="Process Payment"
                      >
                        <ArrowUpRight size={18} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

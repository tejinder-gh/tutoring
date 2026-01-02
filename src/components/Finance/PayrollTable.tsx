"use client";

import { format } from "date-fns";
import { DollarSign } from "lucide-react";
import { useState } from "react";
import { ProcessPaymentDialog } from "./ProcessPaymentDialog";

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
  lastPayment: {
    paymentDate: Date;
    amount: any;
  } | null;
};

export function PayrollTable({ payroll }: { payroll: PayrollEntry[] }) {
  const [selectedEntry, setSelectedEntry] = useState<PayrollEntry | null>(null);

  const calculateNetSalary = (salary: PayrollEntry['salary']) => {
    if (!salary) return 0;
    const base = Number(salary.baseSalary);
    const allowances = Number(salary.allowances);
    const deductions = Number(salary.deductions);
    return base + allowances - deductions;
  };

  return (
    <>
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-accent/50 text-text-muted font-medium border-b border-border">
              <tr>
                <th className="px-4 py-3">Employee</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Base Salary</th>
                <th className="px-4 py-3">Allowances</th>
                <th className="px-4 py-3">Deductions</th>
                <th className="px-4 py-3">Net Salary</th>
                <th className="px-4 py-3">Last Payment</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {payroll.map((entry) => {
                const netSalary = calculateNetSalary(entry.salary);

                return (
                  <tr key={entry.userId} className="hover:bg-accent/5">
                    <td className="px-4 py-3">
                      <div className="font-medium">{entry.name}</div>
                      <div className="text-xs text-text-muted">{entry.email}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${entry.type === 'TEACHER'
                          ? 'bg-blue-500/10 text-blue-500'
                          : 'bg-purple-500/10 text-purple-500'
                        }`}>
                        {entry.type}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {entry.salary ? `₹${Number(entry.salary.baseSalary).toLocaleString()}` : '-'}
                    </td>
                    <td className="px-4 py-3 text-green-600">
                      {entry.salary ? `+₹${Number(entry.salary.allowances).toLocaleString()}` : '-'}
                    </td>
                    <td className="px-4 py-3 text-red-600">
                      {entry.salary ? `-₹${Number(entry.salary.deductions).toLocaleString()}` : '-'}
                    </td>
                    <td className="px-4 py-3 font-bold">
                      {entry.salary ? `₹${netSalary.toLocaleString()}` : '-'}
                    </td>
                    <td className="px-4 py-3 text-text-muted">
                      {entry.lastPayment
                        ? format(new Date(entry.lastPayment.paymentDate), 'MMM d, yyyy')
                        : 'Never'
                      }
                    </td>
                    <td className="px-4 py-3 text-right">
                      {entry.salary ? (
                        <button
                          onClick={() => setSelectedEntry(entry)}
                          className="btn-primary text-xs flex items-center gap-1 ml-auto"
                        >
                          <DollarSign size={14} />
                          Process
                        </button>
                      ) : (
                        <span className="text-xs text-text-muted">No salary set</span>
                      )}
                    </td>
                  </tr>
                );
              })}
              {payroll.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-text-muted">
                    No employees found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedEntry && (
        <ProcessPaymentDialog
          entry={selectedEntry}
          netSalary={calculateNetSalary(selectedEntry.salary)}
          onClose={() => setSelectedEntry(null)}
        />
      )}
    </>
  );
}

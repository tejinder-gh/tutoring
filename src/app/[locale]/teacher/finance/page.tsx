import {
  getTeacherSalaries,
  getTeacherSalaryStructure,
} from "@/app/actions/finance";
import { auth } from "@/auth";
import { BankDetailsForm } from "@/components/Finance/BankDetailsForm";
import { prisma } from "@/lib/prisma";
import { BadgeIndianRupee, Calendar, CreditCard } from "lucide-react";
import { redirect } from "next/navigation";

export default async function TeacherFinancePage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const salaryStructure = await getTeacherSalaryStructure();
  const receipts = await getTeacherSalaries();

  const teacherProfile = await prisma.teacherProfile.findUnique({
    where: { userId: session.user.id },
  });

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">My Finance</h1>
      <p className="text-text-muted mb-8">
        View your salary structure and payment history
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {/* Active Salary Card */}
        <div className="bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 p-6 rounded-xl shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <BadgeIndianRupee size={80} />
          </div>
          <div className="flex items-center gap-3 mb-4 relative">
            <div className="p-3 bg-primary/20 rounded-lg text-primary shadow-inner">
              <BadgeIndianRupee size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-text-muted uppercase tracking-wider">
                Current Base Salary
              </p>
              <h3 className="text-3xl font-bold tracking-tight">
                {salaryStructure
                  ? `₹${Number(salaryStructure.baseSalary).toLocaleString()}`
                  : "Not Set"}
              </h3>
            </div>
          </div>
          {salaryStructure && (
            <div className="space-y-3 text-sm text-text-muted border-t border-primary/10 pt-4 relative">
              <div className="flex justify-between items-center px-2 py-1 rounded hover:bg-white/5">
                <span>Allowances</span>
                <span className="font-medium text-green-500 bg-green-500/10 px-2 py-0.5 rounded">
                  +{Number(salaryStructure.allowances)}
                </span>
              </div>
              <div className="flex justify-between items-center px-2 py-1 rounded hover:bg-white/5">
                <span>Deductions</span>
                <span className="font-medium text-red-500 bg-red-500/10 px-2 py-0.5 rounded">
                  -{Number(salaryStructure.deductions)}
                </span>
              </div>
              <div className="flex justify-between pt-3 border-t border-primary/10 font-bold text-foreground text-lg">
                <span>Net Monthly</span>
                <span>
                  ₹
                  {(
                    Number(salaryStructure.baseSalary) +
                    Number(salaryStructure.allowances) -
                    Number(salaryStructure.deductions)
                  ).toLocaleString()}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Bank Details Card */}
        <div className="md:col-span-1 lg:col-span-1">
          <BankDetailsForm initialDetails={teacherProfile?.bankDetails} />
        </div>
      </div>

      <h2 className="text-xl font-bold mb-4">Payment History</h2>
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-accent/50 text-text-muted font-medium border-b border-border">
            <tr>
              <th className="px-6 py-4">Date</th>
              <th className="px-6 py-4">Amount</th>
              <th className="px-6 py-4">Method</th>
              <th className="px-6 py-4">Reference</th>
              <th className="px-6 py-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {receipts.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-6 py-8 text-center text-text-muted"
                >
                  No payment records found.
                </td>
              </tr>
            ) : (
              receipts.map((receipt) => (
                <tr
                  key={receipt.id}
                  className="hover:bg-accent/5 transition-colors"
                >
                  <td className="px-6 py-4 font-medium">
                    <div className="flex items-center gap-2">
                      <Calendar size={14} className="text-text-muted" />
                      {new Date(receipt.paymentDate).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-green-600 font-bold">
                    ₹{Number(receipt.amount).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 capitalize">
                    <div className="flex items-center gap-2">
                      <CreditCard size={14} className="text-text-muted" />
                      {receipt.paymentMethod.toLowerCase().replace("_", " ")}
                    </div>
                  </td>
                  <td className="px-6 py-4 font-mono text-xs text-text-muted">
                    {receipt.reference || "-"}
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-green-500/20 text-green-500 rounded text-xs font-bold">
                      PAID
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

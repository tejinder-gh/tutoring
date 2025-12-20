import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { format } from 'date-fns';

export default async function PaymentHistoryPage() {
  const session = await auth();
  if (!session?.user?.id) return <div>Unauthorized</div>;

  const payments = await prisma.paymentReceipts.findMany({
    where: { userId: session.user.id },
    orderBy: { paymentDate: 'desc' },
    include: { course: true }
  });

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Payment History</h1>

      <div className="bg-white dark:bg-slate-900 rounded-lg shadow border border-slate-200 dark:border-slate-800 overflow-hidden">
        {payments.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            No payment history found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                <tr>
                  <th className="p-4 font-medium">Date</th>
                  <th className="p-4 font-medium">Description</th>
                  <th className="p-4 font-medium">Reference</th>
                  <th className="p-4 font-medium">Method</th>
                  <th className="p-4 font-medium text-right">Amount</th>
                  <th className="p-4 font-medium text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {payments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50">
                    <td className="p-4 text-slate-700 dark:text-slate-300">
                      {format(payment.paymentDate, 'MMM d, yyyy')}
                    </td>
                    <td className="p-4 font-medium text-slate-900 dark:text-white">
                      {payment.course?.title || payment.notes || 'Course Fee'}
                    </td>
                    <td className="p-4 text-slate-500 font-mono text-xs">
                      {payment.reference}
                    </td>
                    <td className="p-4 text-slate-600 dark:text-slate-400">
                      {payment.paymentMethod}
                    </td>
                    <td className="p-4 text-right font-medium text-slate-900 dark:text-white">
                      ₹{Number(payment.amountPaid).toLocaleString()}
                    </td>
                    <td className="p-4 text-center">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                        Paid
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

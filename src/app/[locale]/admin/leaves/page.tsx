"use client";

import { getPendingLeaves, updateLeaveStatus } from '@/app/actions/leave';
import { format } from 'date-fns';
import { Check, Loader2, X } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function LeaveApprovalPage() {
  const [leaves, setLeaves] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    loadLeaves();
  }, []);

  const loadLeaves = async () => {
    setLoading(true);
    try {
      const data = await getPendingLeaves();
      setLeaves(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (leaveId: string, status: 'APPROVED' | 'REJECTED') => {
    setProcessingId(leaveId);
    try {
      await updateLeaveStatus(leaveId, status);
      // Optimistic update or reload
      setLeaves(prev => prev.filter(l => l.id !== leaveId));
    } catch (error) {
      alert('Failed to update status');
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">Leave Requests</h1>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
        {loading ? (
          <div className="p-8 flex justify-center"><Loader2 className="animate-spin" /></div>
        ) : leaves.length === 0 ? (
          <div className="p-8 text-center text-slate-500">No pending leave requests.</div>
        ) : (
          <table className="w-full text-left">
            <thead className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="p-4 font-medium">Employee/Student</th>
                <th className="p-4 font-medium">Role</th>
                <th className="p-4 font-medium">Dates</th>
                <th className="p-4 font-medium">Reason</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {leaves.map((leave) => (
                <tr key={leave.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50">
                  <td className="p-4">
                    <div className="font-medium">{leave.user.name}</div>
                    <div className="text-xs text-slate-500">{leave.user.email}</div>
                  </td>
                  <td className="p-4 text-sm text-slate-600 dark:text-slate-400">
                    {leave.user.role?.name || 'N/A'}
                  </td>
                  <td className="p-4 text-sm">
                    <div className="font-medium text-slate-900 dark:text-white">
                      {format(new Date(leave.startDate), 'MMM d')} - {format(new Date(leave.endDate), 'MMM d, yyyy')}
                    </div>
                  </td>
                  <td className="p-4 text-sm text-slate-600 dark:text-slate-400 max-w-xs truncate" title={leave.reason}>
                    {leave.reason}
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleAction(leave.id, 'APPROVED')}
                        disabled={!!processingId}
                        className="p-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 disabled:opacity-50"
                        title="Approve"
                      >
                        {processingId === leave.id ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                      </button>
                      <button
                        onClick={() => handleAction(leave.id, 'REJECTED')}
                        disabled={!!processingId}
                        className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 disabled:opacity-50"
                        title="Reject"
                      >
                        {processingId === leave.id ? <Loader2 size={16} className="animate-spin" /> : <X size={16} />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

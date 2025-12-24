import { getLeads } from '@/app/actions/lead';
import LeadStatusBadge from '@/components/CRM/LeadStatusBadge';
import { requirePermission } from '@/lib/permissions';
import { Plus } from 'lucide-react';
import Link from 'next/link';

export default async function LeadsPage({ searchParams }: { searchParams: { page?: string } }) {
  await requirePermission('read', 'marketing'); // Using 'marketing' as closest permission for CRM

  const page = Number(searchParams.page) || 1;
  const { leads, total } = await getLeads(page);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Lead Management</h1>
          <p className="text-text-muted">Track and convert potential students</p>
        </div>
        <Link href="/admin/leads/new">
          <button className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground font-medium rounded-lg hover:opacity-90">
            <Plus size={16} />
            Add Lead
          </button>
        </Link>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 font-medium">
              <tr>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Source</th>
                <th className="px-6 py-4">Contact</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {leads.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                    No leads found.
                  </td>
                </tr>
              ) : (
                leads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-foreground">
                      <Link href={`/admin/leads/${lead.id}`} className="hover:underline text-blue-600 dark:text-blue-400">
                        {lead.name}
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      <LeadStatusBadge status={lead.status} />
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400 capitalize">
                      {lead.source.toLowerCase()}
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                      <div className="flex flex-col">
                        <span>{lead.phone}</span>
                        <span className="text-xs opacity-70">{lead.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                      {new Date(lead.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <Link
                        href={`/admin/leads/${lead.id}`}
                        className="text-xs font-semibold text-primary hover:underline"
                      >
                        View Details
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Simple Pagination */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
          <span className="text-xs text-slate-500">
            Page {page} of {Math.ceil(total / 20)}
          </span>
          <div className="flex gap-2">
            {page > 1 && (
              <Link href={`/admin/leads?page=${page - 1}`} className="px-3 py-1 text-xs border rounded bg-white dark:bg-slate-800 hover:bg-slate-50">
                Previous
              </Link>
            )}
            {page * 20 < total && (
              <Link href={`/admin/leads?page=${page + 1}`} className="px-3 py-1 text-xs border rounded bg-white dark:bg-slate-800 hover:bg-slate-50">
                Next
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

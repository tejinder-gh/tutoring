import { getLeadById } from '@/app/actions/lead';
import ActivityFeed from '@/components/CRM/ActivityFeed';
import LeadStatusBadge from '@/components/CRM/LeadStatusBadge';
import LogActivityForm from '@/components/CRM/LogActivityForm';
import { requirePermission } from '@/lib/permissions';
import { ArrowLeft, Calendar, Mail, Phone } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export default async function LeadDetailsPage({ params }: { params: { leadId: string } }) {
  await requirePermission('read', 'marketing');

  const lead = await getLeadById(params.leadId);
  if (!lead) notFound();

  return (
    <div>
      <div className="mb-6">
        <Link href="/admin/leads" className="text-sm text-slate-500 hover:text-foreground inline-flex items-center gap-1 mb-2">
          <ArrowLeft size={14} /> Back to Leads
        </Link>
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              {lead.name}
              <LeadStatusBadge status={lead.status} />
            </h1>
            <p className="text-text-muted mt-1">Acquired from {lead.source}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Info */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
            <h3 className="font-semibold mb-4 text-foreground">Contact Information</h3>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600">
                  <Phone size={16} />
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase font-medium">Phone</p>
                  <p className="text-sm font-medium text-foreground">{lead.phone}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center text-purple-600">
                  <Mail size={16} />
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase font-medium">Email</p>
                  <p className="text-sm font-medium text-foreground">{lead.email || "N/A"}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center text-orange-600">
                  <Calendar size={16} />
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase font-medium">Created</p>
                  <p className="text-sm font-medium text-foreground">{new Date(lead.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
            <h3 className="font-semibold mb-2 text-foreground">Internal Notes</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 whitespace-pre-wrap">
              {lead.notes || "No initial notes provided."}
            </p>
          </div>
        </div>

        {/* Right Column: Activity Feed */}
        <div className="lg:col-span-2 space-y-6">
          <LogActivityForm leadId={lead.id} />

          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
            <h3 className="font-semibold mb-6 text-foreground">Activity Timeline</h3>
            <ActivityFeed activities={lead.activities as any} />
            {/* Casting 'as any' because Prisma JSON/Date types can be strictly typed differenlty from our simple UI type.
                        In real app, we use mapper. */}
          </div>
        </div>
      </div>
    </div>
  );
}

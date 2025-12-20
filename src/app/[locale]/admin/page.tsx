import { auth } from '@/../auth';
import { requirePermission } from '@/lib/permissions';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  await requirePermission('read', 'user');
  const session = await auth();

  const leads = await prisma.lead.findMany({
    orderBy: { createdAt: 'desc' },
  });

  // Fetch users with ROLE = STUDENT
  const students = await prisma.user.findMany({
    where: { role: { name: 'STUDENT' } },
    include: { studentProfile: true },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
          <p className="text-text-muted">Welcome back, {session?.user?.name}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-accent/20 rounded-xl p-6 border border-border">
          <div className="text-4xl font-bold text-foreground mb-2">{leads.length}</div>
          <div className="text-text-muted">Total Leads</div>
        </div>
        <div className="bg-accent/20 rounded-xl p-6 border border-border">
          <div className="text-4xl font-bold text-foreground mb-2">{students.length}</div>
          <div className="text-text-muted">Enrolled Students</div>
        </div>
        <div className="bg-primary/10 rounded-xl p-6 border border-primary/30">
          <div className="text-4xl font-bold text-primary mb-2">
            {(() => {
              // eslint-disable-next-line react-hooks/purity
              const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);
              return leads.filter(l => new Date(l.createdAt) > cutoff).length;
            })()}
          </div>
          <div className="text-text-muted">Leads (Last 24h)</div>
        </div>
      </div>

      {/* Leads Table */}
      <div className="bg-accent/10 rounded-xl border border-border overflow-hidden mb-12">
        <div className="p-4 border-b border-border">
          <h2 className="text-xl font-semibold text-foreground">Recent Leads</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-accent/20">
              <tr>
                <th className="text-left p-4 text-sm font-medium text-text-muted">Name</th>
                <th className="text-left p-4 text-sm font-medium text-text-muted">Phone</th>
                <th className="text-left p-4 text-sm font-medium text-text-muted">Email</th>
                <th className="text-left p-4 text-sm font-medium text-text-muted">Status</th>
                <th className="text-left p-4 text-sm font-medium text-text-muted">Date</th>
              </tr>
            </thead>
            <tbody>
              {leads.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-text-muted">
                    No leads yet.
                  </td>
                </tr>
              ) : (
                leads.slice(0, 20).map((lead) => (
                  <tr key={lead.id} className="border-t border-border hover:bg-accent/10">
                    <td className="p-4 text-foreground font-medium">{lead.name}</td>
                    <td className="p-4 text-foreground">{lead.phone}</td>
                    <td className="p-4 text-foreground">{lead.email}</td>
                    <td className="p-4">
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-primary/20 text-primary">
                        {lead.status}
                      </span>
                    </td>
                    <td className="p-4 text-text-muted text-sm">
                      {new Date(lead.createdAt).toLocaleDateString('en-IN')}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-accent/10 rounded-xl border border-border overflow-hidden">
        <div className="p-4 border-b border-border">
          <h2 className="text-xl font-semibold text-foreground">Registered Students</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-accent/20">
              <tr>
                <th className="text-left p-4 text-sm font-medium text-text-muted">Name</th>
                <th className="text-left p-4 text-sm font-medium text-text-muted">Email</th>
                <th className="text-left p-4 text-sm font-medium text-text-muted">Phone</th>
                <th className="text-left p-4 text-sm font-medium text-text-muted">Role</th>
                <th className="text-left p-4 text-sm font-medium text-text-muted">Joined</th>
              </tr>
            </thead>
            <tbody>
              {students.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-text-muted">
                    No students enrolled yet.
                  </td>
                </tr>
              ) : (
                students.slice(0, 20).map((student) => (
                  <tr key={student.id} className="border-t border-border hover:bg-accent/10">
                    <td className="p-4 text-foreground font-medium">{student.name}</td>
                    <td className="p-4 text-foreground">{student.email}</td>
                    <td className="p-4 text-foreground">{student.phone || 'N/A'}</td>
                    <td className="p-4">
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-secondary/20 text-secondary">
                        {student.role}
                      </span>
                    </td>
                    <td className="p-4 text-text-muted text-sm">
                      {new Date(student.createdAt).toLocaleDateString('en-IN')}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

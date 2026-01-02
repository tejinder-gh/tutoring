import { requirePermission } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import { Briefcase, Mail, Phone, Plus, Users } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminStaffPage() {
  await requirePermission("read", "user");

  const staffProfiles = await prisma.staffProfile.findMany({
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
        },
      },
    },
    orderBy: { joiningDate: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Staff Management</h1>
          <p className="text-text-muted">Manage non-teaching staff members</p>
        </div>
        <Link href="/admin/staff/new">
          <button className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground font-medium rounded-lg hover:opacity-90">
            <Plus size={16} />
            Add Staff Member
          </button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-500/10 rounded-lg text-blue-500">
              <Users size={24} />
            </div>
            <div>
              <p className="text-sm text-text-muted">Total Staff</p>
              <p className="text-2xl font-bold">{staffProfiles.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-500/10 rounded-lg text-green-500">
              <Briefcase size={24} />
            </div>
            <div>
              <p className="text-sm text-text-muted">Departments</p>
              <p className="text-2xl font-bold">
                {new Set(staffProfiles.map((s) => s.department)).size}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Staff Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-accent/30 text-text-muted">
              <tr>
                <th className="text-left p-4 font-medium">Employee</th>
                <th className="text-left p-4 font-medium">Department</th>
                <th className="text-left p-4 font-medium">Designation</th>
                <th className="text-left p-4 font-medium">Joined</th>
                <th className="text-left p-4 font-medium">Contact</th>
                <th className="text-left p-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {staffProfiles.map((profile) => (
                <tr key={profile.id} className="hover:bg-accent/10">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                        {profile.user.name[0]}
                      </div>
                      <div>
                        <div className="font-medium">{profile.user.name}</div>
                        <div className="text-xs text-text-muted">
                          ID: {profile.id.slice(-6)}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="px-2 py-1 bg-blue-500/10 text-blue-500 rounded text-xs font-medium">
                      {profile.department}
                    </span>
                  </td>
                  <td className="p-4 text-text-muted">{profile.designation}</td>
                  <td className="p-4 text-text-muted text-sm">
                    {format(new Date(profile.joiningDate), "MMM d, yyyy")}
                  </td>
                  <td className="p-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm">
                        <Mail size={12} className="text-text-muted" />
                        <span className="text-xs">{profile.user.email}</span>
                      </div>
                      {profile.user.phone && (
                        <div className="flex items-center gap-2 text-sm">
                          <Phone size={12} className="text-text-muted" />
                          <span className="text-xs">{profile.user.phone}</span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="p-4">
                    <Link
                      href={`/admin/staff/${profile.id}`}
                      className="text-sm text-primary hover:underline"
                    >
                      View Details
                    </Link>
                  </td>
                </tr>
              ))}
              {staffProfiles.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-text-muted">
                    No staff members found. Add one to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

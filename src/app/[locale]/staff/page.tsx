import { getStaffSalaryStructure } from "@/app/actions/finance";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Bell, Calendar, DollarSign, User } from "lucide-react";
import { redirect } from "next/navigation";

export default async function StaffDashboard() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const staffProfile = await prisma.staffProfile.findUnique({
    where: { userId: session.user.id },
    include: { user: true }
  });

  if (!staffProfile) {
    // In a real app, maybe redirect to an onboarding or error page
    return <div className="p-8">Staff profile not found. Please contact Admin.</div>;
  }

  const salaryStructure = await getStaffSalaryStructure();

  // Get recent announcements (type ALL or specifically for everyone)
  const announcements = await prisma.announcement.findMany({
    where: { effect: "ALL" },
    take: 5,
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-2">Welcome, {session.user.name}</h1>
      <p className="text-text-muted mb-8">Staff Dashboard - {staffProfile.department} Department</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-card border border-border p-6 rounded-xl flex items-center gap-4">
          <div className="p-3 bg-blue-500/10 text-blue-500 rounded-lg">
            <User size={24} />
          </div>
          <div>
            <p className="text-sm text-text-muted">Designation</p>
            <p className="font-bold">{staffProfile.designation}</p>
          </div>
        </div>
        <div className="bg-card border border-border p-6 rounded-xl flex items-center gap-4">
          <div className="p-3 bg-green-500/10 text-green-500 rounded-lg">
            <DollarSign size={24} />
          </div>
          <div>
            <p className="text-sm text-text-muted">Base Salary</p>
            <p className="font-bold">
              {salaryStructure ? `$${Number(salaryStructure.baseSalary).toLocaleString()}` : "Not Set"}
            </p>
          </div>
        </div>
        <div className="bg-card border border-border p-6 rounded-xl flex items-center gap-4">
          <div className="p-3 bg-purple-500/10 text-purple-500 rounded-lg">
            <Calendar size={24} />
          </div>
          <div>
            <p className="text-sm text-text-muted">Joining Date</p>
            <p className="font-bold">{new Date(staffProfile.joiningDate).toLocaleDateString()}</p>
          </div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl p-6">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Bell size={20} /> Announcements
        </h2>
        <div className="space-y-4">
          {announcements.length === 0 ? (
            <p className="text-text-muted">No recent announcements.</p>
          ) : (
            announcements.map(announcement => (
              <div key={announcement.id} className="p-4 bg-accent/30 rounded-lg border border-border/50">
                <h3 className="font-bold">{announcement.title}</h3>
                <p className="text-sm text-text-muted mt-1">{announcement.content}</p>
                <p className="text-xs text-text-muted mt-2 text-right">
                  {new Date(announcement.createdAt).toLocaleDateString()}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

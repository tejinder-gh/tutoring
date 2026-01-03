import { updateTeacherProfile } from "@/app/actions/teacher-profile";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Briefcase, Edit3, GraduationCap, Mail, Phone, User } from "lucide-react";
import { redirect } from "next/navigation";

export default async function TeacherProfilePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const teacher = await prisma.teacherProfile.findUnique({
    where: { userId: session.user.id },
    include: { user: true },
  });

  if (!teacher) return <div>Profile not found</div>;

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Profile</h1>
          <p className="text-text-muted mt-1">Manage your personal and professional information</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sidebar Info Card */}
        <div className="space-y-6">
          <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
            <div className="h-32 bg-primary/10 relative"></div>
            <div className="px-6 pb-6 relative">
              <div className="w-24 h-24 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center text-3xl font-bold border-4 border-background absolute -top-12 shadow-sm">
                {teacher.user.name.charAt(0)}
              </div>
              <div className="mt-14 space-y-1">
                <h2 className="text-xl font-bold">{teacher.user.name}</h2>
                <p className="text-text-muted text-sm">{teacher.domain} Instructor</p>
              </div>

              <div className="mt-6 space-y-3 pt-6 border-t border-border">
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="text-text-muted" size={16} />
                  <span>{teacher.user.email}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="text-text-muted" size={16} />
                  <span>{teacher.user.phone || "No phone added"}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <User className="text-text-muted" size={16} />
                  <span>Teacher ID: {teacher.id.slice(0, 8)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Edit Form */}
        <div className="lg:col-span-2">
          <div className="bg-card border border-border rounded-xl p-8 shadow-sm">
            <div className="flex items-center gap-2 mb-6 pb-4 border-b border-border">
              <Edit3 className="text-primary" size={20} />
              <h2 className="text-xl font-bold">Edit Profile Details</h2>
            </div>

            <form action={async (formData) => {
              "use server";
              await updateTeacherProfile(formData);
            }} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Briefcase size={14} className="text-text-muted" />
                    Teaching Domain
                  </label>
                  <input
                    type="text"
                    name="domain"
                    defaultValue={teacher.domain}
                    className="w-full bg-accent/20 border border-border rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                    placeholder="e.g. Physics, Web Development"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <GraduationCap size={14} className="text-text-muted" />
                    Qualification
                  </label>
                  <input
                    type="text"
                    name="qualification"
                    defaultValue={teacher.qualification || ""}
                    className="w-full bg-accent/20 border border-border rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-primary/20 transition-all"
                    placeholder="e.g. PhD in Mathematics"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Bio / About Me</label>
                <textarea
                  name="bio"
                  rows={4}
                  defaultValue={teacher.bio || ""}
                  className="w-full bg-accent/20 border border-border rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary/20 transition-all min-h-[120px]"
                  placeholder="Tell us a bit about yourself..."
                />
                <p className="text-xs text-text-muted text-right">Visible to students on your course pages</p>
              </div>

              <div className="pt-4 flex justify-end">
                <button type="submit" className="bg-primary text-primary-foreground font-bold px-8 py-2.5 rounded-lg hover:opacity-90 transition-all shadow-sm">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

import { createTeacherAnnouncement, replyToQuery } from "@/app/actions/teacher-communication";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Bell, MessageSquare, Send } from "lucide-react";
import { redirect } from "next/navigation";

export default async function TeacherCommunicationPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const teacherProfile = await prisma.teacherProfile.findUnique({
    where: { userId: session.user.id },
    include: { courses: true }
  });

  if (!teacherProfile) return <div>Access Denied</div>;

  const courseIds = teacherProfile.courses.map(c => c.id);

  const queries = await prisma.query.findMany({
    where: {
      student: {
        studentProfile: {
          enrollments: {
            some: {
              courseId: { in: courseIds }
            }
          }
        }
      }
    },
    include: {
      student: true
    },
    orderBy: { createdAt: 'desc' }
  });

  const announcements = await prisma.announcement.findMany({
    where: { authorId: session.user.id },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Communication Hub</h1>
        <p className="text-text-muted mt-1">Manage announcements and student queries</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Left Col: Announcements */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <Bell size={20} className="text-primary" />
              Post Announcement
            </h3>
            <form action={async (formData) => {
              "use server";
              await createTeacherAnnouncement(formData);
            }} className="space-y-4">
              <div>
                <input name="title" placeholder="Title" required className="w-full bg-accent/20 border border-border rounded-lg px-3 py-2 text-sm" />
              </div>
              <div>
                <textarea name="content" placeholder="Message..." required rows={3} className="w-full bg-accent/20 border border-border rounded-lg px-3 py-2 text-sm" />
              </div>
              <div>
                <select name="courseId" className="w-full bg-accent/20 border border-border rounded-lg px-3 py-2 text-sm text-muted-foreground">
                  <option value="">All My Courses</option>
                  {teacherProfile.courses.map(c => (
                    <option key={c.id} value={c.id}>{c.title}</option>
                  ))}
                </select>
              </div>
              <button type="submit" className="w-full bg-primary text-primary-foreground font-bold py-2 rounded-lg text-sm hover:opacity-90">
                Post Announcement
              </button>
            </form>
          </div>

          <div className="space-y-4">
            <h3 className="font-bold text-lg">My Announcements</h3>
            {announcements.map(ann => (
              <div key={ann.id} className="bg-accent/10 border border-border p-4 rounded-xl">
                <h4 className="font-semibold">{ann.title}</h4>
                <p className="text-sm text-text-muted mt-1 line-clamp-2">{ann.content}</p>
                <p className="text-xs text-text-muted mt-2">{new Date(ann.createdAt).toLocaleDateString()}</p>
              </div>
            ))}
            {announcements.length === 0 && <p className="text-text-muted text-sm italic">No announcements posted.</p>}
          </div>
        </div>

        {/* Right Col: Student Queries */}
        <div className="lg:col-span-2 space-y-6">
          <h3 className="font-bold text-lg flex items-center gap-2">
            <MessageSquare size={20} className="text-secondary" />
            Student Queries
          </h3>

          <div className="space-y-4">
            {queries.map(query => (
              <div key={query.id} className={`bg-card border rounded-xl p-6 shadow-sm ${query.status === 'OPEN' ? 'border-l-4 border-l-secondary' : 'border-l-4 border-l-green-500'}`}>
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-bold text-lg">{query.subject}</h4>
                    <p className="text-xs text-text-muted">
                      From <span className="text-foreground font-medium">{query.student.name}</span> • {new Date(query.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-bold ${query.status === 'OPEN' ? 'bg-secondary/10 text-secondary' : 'bg-green-500/10 text-green-600'}`}>
                    {query.status}
                  </span>
                </div>

                <p className="text-sm text-foreground mb-4 bg-accent/20 p-3 rounded-lg">
                  {query.message}
                </p>

                {query.response ? (
                  <div className="mt-4 pl-4 border-l-2 border-border">
                    <p className="text-xs font-bold text-text-muted uppercase mb-1">Your Reply</p>
                    <p className="text-sm">{query.response}</p>
                  </div>
                ) : (
                  <form action={async (formData) => {
                    "use server";
                    await replyToQuery(query.id, formData);
                  }} className="mt-4 flex gap-3">
                    <input
                      name="response"
                      placeholder="Type your reply..."
                      className="flex-1 bg-accent/20 border border-border rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-primary/20"
                      required
                    />
                    <button type="submit" className="bg-primary/10 text-primary hover:bg-primary hover:text-white px-4 py-2 rounded-lg transition-colors">
                      <Send size={18} />
                    </button>
                  </form>
                )}
              </div>
            ))}

            {queries.length === 0 && (
              <div className="p-12 text-center border-2 border-dashed border-border rounded-xl bg-accent/5">
                <MessageSquare className="mx-auto h-12 w-12 text-text-muted mb-4" />
                <h3 className="text-lg font-medium">No pending queries</h3>
                <p className="text-text-muted">Great job! All student questions have been answered.</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

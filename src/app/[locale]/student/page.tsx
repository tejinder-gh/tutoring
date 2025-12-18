import { auth } from "@/../auth";
import { prisma } from "@/lib/prisma"; // Fixed import

export const dynamic = 'force-dynamic';

export default async function StudentDashboard() {
  const session = await auth();
  if (!session?.user) return <div>Unauthorized</div>;

  const profile = await prisma.studentProfile.findUnique({
    where: { userId: session.user.id },
    include: {
        batch: { include: { course: true } }
    }
  });

  const announcements = await prisma.announcement.findMany({
      take: 3,
      orderBy: { createdAt: 'desc' },
      include: { author: { select: { name: true } } }
  });

  return (
    <div>
        <div className="mb-8">
            <h1 className="text-3xl font-bold">Welcome back, {session.user.name}</h1>
            {profile?.batch && (
                <p className="text-text-muted mt-2">
                    Enrolled in: <span className="text-primary font-semibold">{profile.batch.course.title}</span> ({profile.batch.name})
                </p>
            )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-accent/20 border border-border p-6 rounded-xl">
                <h3 className="font-bold text-xl mb-4">Latest Announcements</h3>
                <div className="space-y-4">
                    {announcements.map(ann => (
                        <div key={ann.id} className="border-b border-border/50 pb-4 last:border-0 last:pb-0">
                            <h4 className="font-semibold">{ann.title}</h4>
                            <p className="text-sm text-text-muted mt-1">{ann.content}</p>
                            <p className="text-xs text-text-muted mt-2">Posted by {ann.author.name}</p>
                        </div>
                    ))}
                    {announcements.length === 0 && <p className="text-text-muted">No announcements yet.</p>}
                </div>
            </div>

             {/* Simple Stats or Quick Links */}
             <div className="grid grid-cols-2 gap-4">
                <a href="/student/assignments" className="bg-primary/20 border border-primary/30 p-6 rounded-xl flex flex-col items-center justify-center hover:bg-primary/30 transition-all">
                    <span className="text-2xl font-bold mb-1">Assignments</span>
                    <span className="text-xs text-text-muted">View Pending</span>
                </a>
                 <a href="/student/queries" className="bg-secondary/20 border border-secondary/30 p-6 rounded-xl flex flex-col items-center justify-center hover:bg-secondary/30 transition-all">
                    <span className="text-2xl font-bold mb-1">Support</span>
                    <span className="text-xs text-text-muted">Ask Query</span>
                </a>
             </div>
        </div>
    </div>
  );
}

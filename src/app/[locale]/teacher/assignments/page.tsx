import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const dynamic = 'force-dynamic';

export default async function TeacherAssignmentsPage() {
  const session = await auth();
  if (!session?.user) return <div>Unauthorized</div>;

  // Fetch courses taught by this teacher
  const teacherProfile = await prisma.teacherProfile.findUnique({
    where: { userId: session.user.id },
    include: {
      courses: {
        include: {
          curriculum: {
            include: {
              assignments: {
                include: {
                  _count: { select: { submissions: true } }
                }
              }
            }
          }
        }
      }
    }
  });

  if (!teacherProfile) {
    return <div>Teacher profile not found.</div>;
  }

  const assignments = teacherProfile.courses.flatMap(c =>
    (c.curriculum?.assignments || []).map(a => ({ ...a, courseTitle: c.title }))
  );

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Assignments & Grading</h1>

      <div className="space-y-4">
        {assignments.map((assignment: any) => (
          <Link
            href={`/teacher/assignments/${assignment.id}`}
            key={assignment.id}
            className="block bg-accent/20 border border-border p-6 rounded-xl hover:border-primary/50 transition-all"
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold text-lg">{assignment.title}</h3>
                <p className="text-text-muted text-sm">{assignment.courseTitle}</p>
              </div>
              <div className="text-right">
                <span className="block font-bold text-2xl text-primary">{assignment._count.submissions}</span>
                <span className="text-xs text-text-muted">Submissions</span>
              </div>
            </div>
          </Link>
        ))}

        {assignments.length === 0 && <p className="text-text-muted">No assignments created yet.</p>}
      </div>
    </div>
  );
}

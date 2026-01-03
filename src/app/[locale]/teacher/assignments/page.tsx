import { auth } from "@/auth";
import { db } from "@/lib/db";
import Link from "next/link";

export const dynamic = 'force-dynamic';

export default async function TeacherAssignmentsPage() {
  const session = await auth();
  if (!session?.user?.id) return <div>Unauthorized</div>;

  // Fetch courses taught by this teacher
  // 1. Get Teacher Profile ID
  const teacherProfile = await db.teacherProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true }
  });

  if (!teacherProfile) {
    return <div>Teacher profile not found.</div>;
  }

  // 2. Get Courses with Effective Curriculum (Teacher's version OR Default)
  const courses = await db.course.findMany({
    where: { teachers: { some: { id: teacherProfile.id } } },
    include: {
      curriculums: {
        where: {
          OR: [
            { teacherId: teacherProfile.id },
            { teacherId: null }
          ]
        },
        include: {
          assignments: {
            include: {
              _count: { select: { submissions: true } }
            }
          }
        }
      }
    }
  });

  const assignments = courses.flatMap(c => {
    // Prefer teacher's version, fallback to default (null)
    const effectiveCurriculum =
      c.curriculums.find(curr => curr.teacherId === teacherProfile.id) ||
      c.curriculums.find(curr => curr.teacherId === null);

    return (effectiveCurriculum?.assignments || []).map(a => ({ ...a, courseTitle: c.title }));
  });

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

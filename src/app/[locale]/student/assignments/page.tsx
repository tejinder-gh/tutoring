import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import AssignmentCard from "./AssignmentCard";

export const dynamic = 'force-dynamic';

export default async function StudentAssignmentsPage() {
  const session = await auth();
  if (!session?.user) return <div>Unauthorized</div>;

  const profile = await prisma.studentProfile.findUnique({
    where: { userId: session.user.id },
    include: {
      batch: {
        include: {
          course: {
            include: {
              curriculum: {
                include: {
                  assignments: {
                    include: {
                      submissions: {
                        where: { studentId: session.user.id }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  });

  if (!profile || !profile.batch) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold">Not Enrolled</h2>
        <p className="text-text-muted">You are not currently enrolled in any active batch.</p>
      </div>
    );
  }

  const assignments = profile.batch.course.curriculum?.assignments || [];

  return (
    <div>
      <h1 className="text-3xl font-bold mb-2">My Assignments</h1>
      <p className="text-text-muted mb-8">
        Course: <span className="text-primary font-semibold">{profile.batch.course.title}</span>
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {assignments.map((assignment: any) => (
          <AssignmentCard key={assignment.id} assignment={assignment} userId={session?.user?.id || ""} />
        ))}
        {assignments.length === 0 && <p>No assignments found for this course.</p>}
      </div>
    </div>
  );
}

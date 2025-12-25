
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ArrowLeft, FileText, Video } from "lucide-react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

interface PageProps {
  params: Promise<{ courseId: string }>;
}

export default async function TeacherCourseDetailPage(props: PageProps) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const params = await props.params;

  // Verify teacher access to this course
  const teacherProfile = await prisma.teacherProfile.findUnique({
    where: { userId: session.user.id },
    include: { courses: { where: { id: params.courseId } } }
  });

  if (!teacherProfile || teacherProfile.courses.length === 0) {
    // Either not a teacher or not assigned to this course
    return (
      <div className="container mx-auto py-8">
        <div className="p-8 text-center border-2 border-red-200 bg-red-50 rounded-lg">
          <h1 className="text-2xl font-bold text-red-700 mb-2">Access Denied</h1>
          <p className="text-red-600">You are not assigned to teach this course or it does not exist.</p>
          <Link href="/teacher/courses" className="mt-4 inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2">
            Back to My Courses
          </Link>
        </div>
      </div>
    );
  }

  const course = await prisma.course.findUnique({
    where: { id: params.courseId },
    include: {
      curriculum: {
        include: {
          modules: {
            orderBy: { order: "asc" },
            include: {
              lessons: true,
            },
          },
          assignments: {
            orderBy: { createdAt: 'desc' }
          }
        }
      }
    },
  });

  if (!course) return notFound();

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <Link
          href="/teacher/courses"
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft size={16} /> Back to My Courses
        </Link>
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold">{course.title}</h1>
            <p className="text-muted-foreground mt-2 max-w-2xl">
              {course.description}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content: Modules List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">Curriculum</h2>
          </div>

          <div className="space-y-4">
            {course.curriculum?.modules.map((module) => (
              <div
                key={module.id}
                className="border rounded-xl overflow-hidden bg-muted/10"
              >
                <div className="p-4 bg-muted/20 border-b flex justify-between items-center">
                  <h3 className="font-semibold text-lg flex gap-2 items-center">
                    <span className="text-muted-foreground text-sm">
                      Module {module.order}:
                    </span>
                    {module.title}
                  </h3>
                </div>

                <div className="divide-y divide-border/50">
                  {module.lessons.map((lesson) => (
                    <div
                      key={lesson.id}
                      className="p-4 flex items-center gap-3 hover:bg-muted/5 text-sm"
                    >
                      {lesson.contentUrl && lesson.contentUrl.includes("mp4") ? (
                        <Video size={16} className="text-primary" />
                      ) : (
                        <FileText size={16} className="text-secondary" />
                      )}
                      <span>{lesson.title}</span>
                    </div>
                  ))}
                  {module.lessons.length === 0 && (
                    <div className="p-4 text-sm text-muted-foreground italic">No lessons in this module.</div>
                  )}
                </div>
              </div>
            ))}
            {(!course.curriculum?.modules || course.curriculum.modules.length === 0) && (
              <div className="p-8 text-center border border-dashed rounded-lg bg-muted/10">
                <p className="text-muted-foreground">No modules defined yet.</p>
              </div>
            )}
          </div>

        </div>

        {/* Sidebar: Assignments & Course Stats */}
        <div className="space-y-6">
          <div className="bg-muted/20 border p-6 rounded-xl">
            <h3 className="font-bold mb-4">Assignments</h3>
            <div className="space-y-4">
              {course.curriculum?.assignments.map((assignment) => (
                <div key={assignment.id} className="p-3 bg-background rounded-lg border shadow-sm">
                  <h4 className="font-semibold text-sm">{assignment.title}</h4>
                  <p className="text-xs text-muted-foreground mt-1 truncate">{assignment.description}</p>
                  <div className="mt-2 text-xs flex justify-between">
                    <span className={assignment.dueInDays ? "text-primary" : "text-muted-foreground"}>
                      Due: {assignment.dueInDays ? `In ${assignment.dueInDays} days` : 'No deadline'}
                    </span>
                  </div>
                </div>
              ))}
              {(!course.curriculum?.assignments || course.curriculum.assignments.length === 0) && <p className="text-sm text-muted-foreground">No assignments yet.</p>}
            </div>
          </div>

          <div className="bg-muted/20 border p-6 rounded-xl">
            <h3 className="font-bold mb-4">Course Info</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Modules</span>
                <span>{course.curriculum?.modules.length || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Lessons</span>
                <span>{course.curriculum?.modules.reduce((acc, m) => acc + m.lessons.length, 0) || 0}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

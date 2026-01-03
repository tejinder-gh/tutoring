
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { BarChart, BookOpen, Clock } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function TeacherCoursesPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  // Get teacher profile
  const teacherProfile = await db.teacherProfile.findUnique({
    where: {
      userId: session.user.id,
    },
    include: {
      courses: true,
    },
  });

  if (!teacherProfile) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="p-8 border border-red-200 bg-red-50 rounded-xl text-center">
          <h1 className="text-2xl font-bold mb-2 text-red-700">Access Denied</h1>
          <p className="text-red-600">You do not have a teacher profile associated with your account.</p>
        </div>
      </div>
    );
  }

  const courses = teacherProfile.courses;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Courses</h1>
          <p className="text-text-muted mt-1">Manage and update your assigned courses.</p>
        </div>
      </div>

      {courses.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 border-2 border-dashed border-border rounded-xl bg-accent/5">
          <div className="p-4 bg-accent/50 rounded-full mb-4">
            <BookOpen className="h-8 w-8 text-text-muted" />
          </div>
          <h3 className="text-xl font-medium text-foreground">No courses assigned</h3>
          <p className="text-text-muted mt-2 max-w-sm text-center">
            You haven't been assigned to teach any courses yet. Please contact the administrator.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <div key={course.id} className="group bg-card border border-border rounded-xl overflow-hidden flex flex-col h-full hover:border-primary/50 hover:shadow-lg transition-all duration-300">
              {/* Cover Image Area */}
              <div className="h-48 bg-gradient-to-br from-primary/80 to-secondary/80 relative p-6 flex flex-col justify-end">
                {course.thumbnailUrl && (
                  <div className="absolute inset-0 bg-black/20">
                    <img src={course.thumbnailUrl} alt={course.title} className="w-full h-full object-cover mix-blend-overlay opacity-50 transition-transform duration-500 group-hover:scale-105" />
                  </div>
                )}
                <div className="relative z-10">
                  <span className="inline-flex items-center rounded-lg bg-background/20 backdrop-blur-md border border-white/20 px-2.5 py-1 text-xs font-semibold text-white mb-3">
                    {course.level}
                  </span>
                  <h3 className="text-xl font-bold text-white leading-tight drop-shadow-md line-clamp-2">
                    {course.title}
                  </h3>
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col space-y-4">
                <p className="text-text-muted line-clamp-2 text-sm flex-1">
                  {course.description || "No description provided."}
                </p>

                <div className="flex items-center gap-4 text-sm font-medium text-text-muted">
                  <div className="flex items-center gap-1.5 bg-accent/30 px-2.5 py-1 rounded-md">
                    <Clock className="w-3.5 h-3.5 text-primary" />
                    <span>{course.duration ? `${course.duration}h` : "flexible"}</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-accent/30 px-2.5 py-1 rounded-md">
                    <BarChart className="w-3.5 h-3.5 text-secondary" />
                    <span className={course.isActive ? "text-green-600 dark:text-green-400" : "text-text-muted"}>
                      {course.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>

                <div className="pt-4 mt-auto grid grid-cols-2 gap-3">
                  <Link
                    href={`/teacher/courses/${course.id}`}
                    className="flex justify-center items-center px-4 py-2 text-sm font-semibold text-primary-foreground bg-primary rounded-lg hover:opacity-90 transition-all shadow-sm active:scale-95"
                  >
                    Manage
                  </Link>
                  <Link
                    href={`/courses/${course.slug}`}
                    className="flex justify-center items-center px-4 py-2 text-sm font-semibold text-foreground bg-background border border-border rounded-lg hover:bg-accent hover:text-accent-foreground transition-all shadow-sm active:scale-95"
                  >
                    Preview
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

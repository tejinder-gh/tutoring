
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { BarChart, BookOpen, Clock } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function TeacherCoursesPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  // Get teacher profile
  const teacherProfile = await prisma.teacherProfile.findUnique({
    where: {
      userId: session.user.id,
    },
    include: {
      courses: true,
    },
  });

  if (!teacherProfile) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4 text-red-600">Access Denied</h1>
        <p>You do not have a teacher profile associated with your account.</p>
      </div>
    );
  }

  const courses = teacherProfile.courses;

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">My Courses</h1>
      </div>

      {courses.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed rounded-lg bg-gray-50/50">
          <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-xl font-medium text-gray-900">No courses assigned</h3>
          <p className="text-gray-500 mt-2 max-w-sm mx-auto">
            You haven't been assigned to teach any courses yet. Please contact the administrator.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <div key={course.id} className="group bg-card rounded-xl border shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col h-full ring-1 ring-border">
              {/* Cover Image Area */}
              <div className="h-40 bg-gradient-to-br from-indigo-500 to-purple-600 relative p-6 flex flex-col justify-end">
                {course.thumbnailUrl && (
                  <div className="absolute inset-0">
                    <img src={course.thumbnailUrl} alt={course.title} className="w-full h-full object-cover opacity-50 transition-opacity group-hover:opacity-40" />
                  </div>
                )}
                <div className="relative z-10">
                  <span className="inline-flex items-center rounded-full bg-white/20 backdrop-blur-sm px-2.5 py-0.5 text-xs font-medium text-white ring-1 ring-inset ring-white/30 mb-2">
                    {course.level}
                  </span>
                  <h3 className="text-xl font-bold text-white leading-tight drop-shadow-sm line-clamp-2">
                    {course.title}
                  </h3>
                </div>
              </div>

              <div className="p-6 flex-1 flex flex-col">
                <p className="text-muted-foreground line-clamp-3 mb-6 text-sm flex-1">
                  {course.description || "No description provided."}
                </p>

                <div className="grid grid-cols-2 gap-4 mb-6 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-indigo-500" />
                    <span>{course.duration ? `${course.duration}h` : "flexible"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <BarChart className="w-4 h-4 text-purple-500" />
                    <span>{course.isActive ? "Active" : "Inactive"}</span>
                  </div>
                </div>

                <div className="flex gap-3 pt-4 border-t mt-auto">
                  <Link
                    href={`/teacher/courses/${course.id}`}
                    className="flex-1 inline-flex justify-center items-center px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
                  >
                    Manage
                  </Link>
                  <Link
                    href={`/courses/${course.slug}`}
                    className="flex-1 inline-flex justify-center items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
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

import { auth } from "@/../auth";
import ProgressBar from "@/components/ProgressBar";
import { getEnrolledCourses } from "@/lib/actions/progress";
import { BookOpen, GraduationCap, PlayCircle } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function MyLearningPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const enrolledCourses = await getEnrolledCourses();

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
          <GraduationCap className="text-primary" />
          My Learning
        </h1>
        <p className="text-text-muted mt-2">
          Continue learning from where you left off
        </p>
      </div>

      {/* Course Grid */}
      {enrolledCourses.length === 0 ? (
        <div className="text-center py-20 bg-accent/20 rounded-2xl border border-border">
          <BookOpen className="mx-auto text-text-muted mb-4" size={48} />
          <h2 className="text-xl font-bold text-foreground mb-2">
            No Courses Yet
          </h2>
          <p className="text-text-muted mb-6">
            You haven&apos;t enrolled in any courses yet.
          </p>
          <Link
            href="/courses"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-black font-bold rounded-xl hover:opacity-90 transition-opacity"
          >
            Browse Courses
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {enrolledCourses.map((course) => (
            <Link
              key={course.id}
              href={`/student/learn/${course.courseId}`}
              className="group bg-card border border-border rounded-2xl overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
            >
              {/* Thumbnail */}
              <div className="aspect-video bg-accent/30 relative overflow-hidden">
                {course.courseThumbnail ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={course.courseThumbnail}
                    alt={course.courseTitle}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
                    <BookOpen className="text-primary" size={48} />
                  </div>
                )}

                {/* Play button overlay */}
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-lg flex items-center justify-center">
                    <PlayCircle className="text-white" size={32} />
                  </div>
                </div>

                {/* Progress badge */}
                <div className="absolute top-3 right-3 bg-background/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold">
                  {course.progressPercent}% complete
                </div>
              </div>

              {/* Content */}
              <div className="p-5">
                <h3 className="font-bold text-lg text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                  {course.courseTitle}
                </h3>

                {/* Stats */}
                <div className="flex items-center gap-4 text-sm text-text-muted mb-4">
                  <span>
                    {course.completedLessons}/{course.totalLessons} lessons
                  </span>
                </div>

                {/* Progress bar */}
                <ProgressBar
                  value={course.progressPercent}
                  size="sm"
                  showLabel={false}
                />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

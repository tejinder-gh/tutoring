import { auth } from "@/../auth";
import CourseSidebar from "@/components/CourseSidebar";
import { getCourseWithProgress } from "@/lib/actions/progress";
import { ArrowRight, BookOpen, CheckCircle } from "lucide-react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ courseId: string }>;
};

export default async function CoursePlayerPage({ params }: Props) {
  const { courseId } = await params;
  const session = await auth();
  if (!session?.user) redirect("/login");

  const course = await getCourseWithProgress(courseId);
  if (!course) notFound();

  // Find first incomplete lesson or first lesson
  const allLessons = course.modules.flatMap((m) => m.lessons);
  const nextLesson =
    allLessons.find((l) => !l.completed) || allLessons[0];

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <div className="w-80 shrink-0 hidden lg:block border-r border-border">
        <CourseSidebar
          courseId={courseId}
          courseTitle={course.title}
          modules={course.modules}
          progressPercent={course.progressPercent}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8">
        <div className="max-w-4xl mx-auto">
          {/* Course Header */}
          <div className="mb-10">
            <Link
              href="/student/learn"
              className="text-sm text-text-muted hover:text-primary transition-colors mb-4 inline-block"
            >
              ← Back to My Learning
            </Link>
            <h1 className="text-4xl font-black text-foreground mt-2">
              {course.title}
            </h1>
            {course.description && (
              <p className="text-text-muted mt-3 text-lg">
                {course.description}
              </p>
            )}
          </div>

          {/* Progress Overview */}
          <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-2xl p-6 mb-10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-foreground">
                Your Progress
              </h2>
              <span className="text-3xl font-black text-primary">
                {course.progressPercent}%
              </span>
            </div>
            <div className="h-3 bg-accent/50 rounded-full overflow-hidden mb-3">
              <div
                className="h-full bg-gradient-to-r from-primary to-primary/80 rounded-full transition-all duration-500"
                style={{ width: `${course.progressPercent}%` }}
              />
            </div>
            <p className="text-sm text-text-muted">
              {course.completedLessons} of {course.totalLessons} lessons
              completed
            </p>
          </div>

          {/* Continue Button */}
          {nextLesson && (
            <Link
              href={`/student/learn/${courseId}/${nextLesson.id}`}
              className="flex items-center justify-between w-full p-6 bg-primary text-black rounded-2xl hover:opacity-90 transition-opacity mb-10"
            >
              <div>
                <p className="text-sm font-bold opacity-80">
                  {allLessons.find((l) => !l.completed)
                    ? "Continue Learning"
                    : "Start from Beginning"}
                </p>
                <p className="text-xl font-black mt-1">{nextLesson.title}</p>
              </div>
              <ArrowRight size={24} />
            </Link>
          )}

          {/* Module List */}
          <h2 className="text-2xl font-bold text-foreground mb-6">
            Course Content
          </h2>
          <div className="space-y-4">
            {course.modules.map((module, idx) => {
              const completedCount = module.lessons.filter(
                (l) => l.completed
              ).length;

              return (
                <div
                  key={module.id}
                  className="border border-border rounded-2xl overflow-hidden bg-card"
                >
                  {/* Module Header */}
                  <div className="p-5 bg-accent/30 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <span className="text-sm font-bold text-primary bg-primary/10 px-3 py-1 rounded-lg">
                        Module {idx + 1}
                      </span>
                      <h3 className="font-bold text-foreground">
                        {module.title}
                      </h3>
                    </div>
                    <span className="text-sm text-text-muted">
                      {completedCount}/{module.lessons.length} lessons
                    </span>
                  </div>

                  {/* Lessons */}
                  <div className="divide-y divide-border/50">
                    {module.lessons.map((lesson) => (
                      <Link
                        key={lesson.id}
                        href={`/student/learn/${courseId}/${lesson.id}`}
                        className="flex items-center gap-4 p-4 hover:bg-accent/20 transition-colors group"
                      >
                        {lesson.completed ? (
                          <CheckCircle
                            className="text-green-500 shrink-0"
                            size={20}
                          />
                        ) : (
                          <BookOpen
                            className="text-text-muted shrink-0 group-hover:text-primary transition-colors"
                            size={20}
                          />
                        )}
                        <span
                          className={`font-medium ${lesson.completed
                              ? "text-text-muted"
                              : "text-foreground"
                            } group-hover:text-primary transition-colors`}
                        >
                          {lesson.title}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

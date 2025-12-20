import { auth } from "@/auth";
import CourseSidebar from "@/components/CourseSidebar";
import LessonContent from "@/components/LessonContent";
import VideoPlayer from "@/components/VideoPlayer";
import { getCourseWithProgress, getLesson } from "@/lib/actions/progress";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  Download,
  FileText,
  Image,
  Link2,
  Video
} from "lucide-react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import MarkCompleteButton from "./MarkCompleteButton";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ courseId: string; lessonId: string }>;
};

const resourceIcons: Record<string, React.ElementType> = {
  VIDEO: Video,
  DOCUMENT: FileText,
  PDF: FileText,
  LINK: Link2,
  IMAGE: Image,
};

export default async function LessonViewerPage({ params }: Props) {
  const { courseId, lessonId } = await params;
  const session = await auth();
  if (!session?.user) redirect("/login");

  const [lesson, course] = await Promise.all([
    getLesson(lessonId),
    getCourseWithProgress(courseId),
  ]);

  if (!lesson || !course) notFound();

  return (
    <div className="min-h-screen flex">
      {/* Sidebar - hidden on mobile */}
      <div className="w-80 shrink-0 hidden lg:block fixed left-0 top-0 h-screen overflow-y-auto">
        <CourseSidebar
          courseId={courseId}
          courseTitle={course.title}
          modules={course.modules}
          currentLessonId={lessonId}
          progressPercent={course.progressPercent}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 lg:ml-80">
        <div className="p-6 md:p-10">
          <div className="max-w-4xl mx-auto">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-text-muted mb-6">
              <Link
                href="/student/learn"
                className="hover:text-primary transition-colors"
              >
                My Learning
              </Link>
              <span>/</span>
              <Link
                href={`/student/learn/${courseId}`}
                className="hover:text-primary transition-colors"
              >
                {lesson.course.title}
              </Link>
              <span>/</span>
              <span className="text-foreground font-medium truncate max-w-[200px]">
                {lesson.title}
              </span>
            </div>

            {/* Video Player */}
            {lesson.videoUrl && (
              <div className="mb-8">
                <VideoPlayer
                  src={lesson.videoUrl}
                  title={lesson.title}
                  initialTime={lesson.watchTime}
                />
              </div>
            )}

            {/* Lesson Header */}
            <div className="mb-8">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm text-primary font-bold mb-2">
                    {lesson.moduleTitle}
                  </p>
                  <h1 className="text-3xl font-black text-foreground">
                    {lesson.title}
                  </h1>
                </div>
                <MarkCompleteButton
                  lessonId={lessonId}
                  completed={lesson.completed}
                />
              </div>
            </div>

            {/* Lesson Content */}
            <div className="mb-10">
              <LessonContent content={lesson.content} />
            </div>

            {/* Resources */}
            {lesson.resources.length > 0 && (
              <div className="mb-10 p-6 bg-accent/20 border border-border rounded-2xl">
                <h3 className="font-bold text-lg text-foreground mb-4">
                  Resources
                </h3>
                <div className="space-y-3">
                  {lesson.resources.map((resource) => {
                    const Icon = resourceIcons[resource.type] || FileText;
                    return (
                      <a
                        key={resource.id}
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-3 bg-background border border-border rounded-xl hover:border-primary/50 transition-colors group"
                      >
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-black transition-colors">
                          <Icon size={20} />
                        </div>
                        <span className="flex-1 font-medium text-foreground group-hover:text-primary transition-colors">
                          {resource.title}
                        </span>
                        <Download
                          size={16}
                          className="text-text-muted group-hover:text-primary transition-colors"
                        />
                      </a>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between gap-4 pt-6 border-t border-border">
              {lesson.prevLesson ? (
                <Link
                  href={`/student/learn/${courseId}/${lesson.prevLesson.id}`}
                  className="flex items-center gap-3 px-5 py-3 bg-accent/50 border border-border rounded-xl hover:border-primary/50 transition-colors group"
                >
                  <ArrowLeft
                    size={18}
                    className="text-text-muted group-hover:text-primary transition-colors"
                  />
                  <div className="text-left">
                    <p className="text-xs text-text-muted">Previous</p>
                    <p className="font-medium text-foreground group-hover:text-primary transition-colors text-sm truncate max-w-[150px]">
                      {lesson.prevLesson.title}
                    </p>
                  </div>
                </Link>
              ) : (
                <div />
              )}

              {lesson.nextLesson ? (
                <Link
                  href={`/student/learn/${courseId}/${lesson.nextLesson.id}`}
                  className="flex items-center gap-3 px-5 py-3 bg-primary text-black rounded-xl hover:opacity-90 transition-opacity"
                >
                  <div className="text-right">
                    <p className="text-xs opacity-80">Next</p>
                    <p className="font-bold text-sm truncate max-w-[150px]">
                      {lesson.nextLesson.title}
                    </p>
                  </div>
                  <ArrowRight size={18} />
                </Link>
              ) : (
                <Link
                  href={`/student/learn/${courseId}`}
                  className="flex items-center gap-3 px-5 py-3 bg-green-500 text-white rounded-xl hover:opacity-90 transition-opacity"
                >
                  <CheckCircle size={18} />
                  <span className="font-bold">Complete Course</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

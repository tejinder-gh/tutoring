import { auth } from "@/auth";
import LessonEditor from "@/components/LessonEditor";
import { getLessonContentForEdit } from "@/lib/actions/lessons";
import { AlertCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

type Props = {
  params: Promise<{ courseId: string; lessonId: string }>;
};

export default async function EditLessonPage({ params }: Props) {
  const { courseId, lessonId } = await params;
  const session = await auth();

  if (!session?.user) redirect("/login");

  const role = (session.user as any).role?.name;
  if (!role || !['ADMIN', 'TEACHER', 'DIRECTOR'].includes(role)) {
    redirect("/");
  }

  const result = await getLessonContentForEdit(lessonId);

  if (!result.success || !result.lesson) {
    notFound();
  }

  const { lesson } = result;

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Link
            href={`/admin/courses/${courseId}`}
            className="inline-flex items-center gap-2 text-sm text-text-muted hover:text-primary transition-colors"
          >
            <ArrowLeft size={16} />
            Back to Course
          </Link>
        </div>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-black text-foreground mb-2">
            Edit Lesson: {lesson.title}
          </h1>
          <p className="text-text-muted">
            Edit lesson content using markdown or MDX format
          </p>
        </div>

        {/* Storage Info */}
        <div className="mb-6 p-4 bg-accent/20 border border-border rounded-xl">
          <div className="flex items-start gap-3">
            <AlertCircle size={20} className="text-primary flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-bold text-foreground mb-1">
                File-Based Storage
              </p>
              <p className="text-text-muted">
                {lesson.contentUrl ? (
                  <>
                    Content is stored in:{" "}
                    <a
                      href={lesson.contentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      {lesson.contentUrl.split("/").pop()}
                    </a>
                  </>
                ) : (
                  <>
                    This lesson uses inline storage. Saving will migrate it to
                    file-based storage.
                  </>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Lesson Metadata */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-card border border-border rounded-xl">
            <p className="text-sm text-text-muted mb-1">Content Type</p>
            <p className="font-bold text-foreground">
              {lesson.contentType || "markdown"}
            </p>
          </div>
          <div className="p-4 bg-card border border-border rounded-xl">
            <p className="text-sm text-text-muted mb-1">Video URL</p>
            <p className="font-bold text-foreground truncate">
              {lesson.videoUrl || "None"}
            </p>
          </div>
          <div className="p-4 bg-card border border-border rounded-xl">
            <p className="text-sm text-text-muted mb-1">Lesson Order</p>
            <p className="font-bold text-foreground">{lesson.order}</p>
          </div>
        </div>

        {/* Editor */}
        <LessonEditor
          lessonId={lessonId}
          initialContent={lesson.editableContent}
          onSave={(contentUrl) => {
            console.log("Lesson saved with URL:", contentUrl);
            // Could add additional logic here, like showing a success toast
          }}
        />

        {/* Help Section */}
        <div className="mt-8 p-6 bg-accent/20 border border-border rounded-xl">
          <h3 className="font-bold text-foreground mb-3">Markdown Guide</h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm text-text-muted">
            <div>
              <p className="font-semibold text-foreground mb-2">Headings</p>
              <code className="block bg-background p-2 rounded">
                # H1<br />
                ## H2<br />
                ### H3
              </code>
            </div>
            <div>
              <p className="font-semibold text-foreground mb-2">
                Emphasis
              </p>
              <code className="block bg-background p-2 rounded">
                **bold**<br />
                *italic*<br />
                ~~strikethrough~~
              </code>
            </div>
            <div>
              <p className="font-semibold text-foreground mb-2">Lists</p>
              <code className="block bg-background p-2 rounded">
                - Bullet point<br />
                1. Numbered item
              </code>
            </div>
            <div>
              <p className="font-semibold text-foreground mb-2">Code</p>
              <code className="block bg-background p-2 rounded">
                `inline code`<br />
                ```language<br />
                code block<br />
                ```
              </code>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

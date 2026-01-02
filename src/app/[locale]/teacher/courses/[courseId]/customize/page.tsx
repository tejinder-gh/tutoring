import {
  createLesson,
  createModule,
  publishCurriculum,
  updateModule
} from "@/app/actions/curriculum-editor";
import { auth } from "@/auth";
import { Link } from "@/i18n/routing";
import { prisma } from "@/lib/prisma";
import { AlertCircle, ArrowLeft, CheckCircle, Edit, Plus, Trash2 } from "lucide-react";
import { redirect } from "next/navigation";

export default async function CustomizeCurriculumPage({ params }: { params: { courseId: string } }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { courseId } = params;

  // Ensure teacher owns this version
  const teacherProfile = await prisma.teacherProfile.findUnique({
    where: { userId: session.user.id }
  });

  if (!teacherProfile) return <div>Access Denied</div>;

  const curriculum = await prisma.curriculum.findUnique({
    where: {
      courseId_teacherId: {
        courseId,
        teacherId: teacherProfile.id
      }
    },
    include: {
      modules: {
        orderBy: { order: 'asc' },
        include: {
          lessons: { orderBy: { order: 'asc' } }
        }
      }
    }
  });

  if (!curriculum) {
    return (
      <div className="p-8 text-center max-w-2xl mx-auto mt-20 bg-card border border-border rounded-xl">
        <h2 className="text-xl font-bold text-red-500 mb-2">Curriculum Draft Not Found</h2>
        <p className="text-muted-foreground mb-6">It looks like the draft hasn't been created correctly. Please go back and try again.</p>
        <Link href={`/teacher/courses/${courseId}`} className="bg-primary text-primary-foreground px-6 py-2.5 rounded-lg font-bold hover:opacity-90">
          Back to Course
        </Link>
      </div>
    )
  }

  const isPublished = curriculum.status === 'APPROVED';

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link href={`/teacher/courses/${courseId}`} className="text-sm text-text-muted hover:text-primary flex items-center gap-1 mb-2">
            <ArrowLeft size={14} /> Back to Course
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">Customize Curriculum</h1>
            {isPublished ? (
              <span className="bg-green-500/10 text-green-600 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 uppercase tracking-wide border border-green-500/20">
                <CheckCircle size={12} /> Live
              </span>
            ) : (
              <span className="bg-yellow-500/10 text-yellow-600 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 uppercase tracking-wide border border-yellow-500/20">
                <AlertCircle size={12} /> Draft
              </span>
            )}
          </div>
          <p className="text-text-muted mt-1 max-w-2xl">
            {isPublished
              ? "This version is live. Students will see these changes immediately."
              : "You are editing a draft. Publish your changes to make them visible to students."}
          </p>
        </div>
        <div className="flex gap-3">
          {!isPublished && (
            <form action={async () => {
              "use server";
              await publishCurriculum(curriculum.id);
            }}>
              <button type="submit" className="bg-green-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-green-700 transition-all shadow-md active:scale-95">
                Publish Changes
              </button>
            </form>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Main Content: Modules & Lessons */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between bg-accent/30 p-4 rounded-xl border border-border">
            <h2 className="font-bold text-lg flex items-center gap-2">
              Modules & Lessons
              <span className="bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-full font-bold">{curriculum.modules.length}</span>
            </h2>
            <form action={async () => {
              "use server";
              await createModule(curriculum.id, "New Module");
            }}>
              <button type="submit" className="flex items-center gap-2 text-sm font-bold bg-background text-foreground hover:text-primary border border-border hover:border-primary/50 px-4 py-2 rounded-lg transition-colors shadow-sm">
                <Plus size={16} /> Add Module
              </button>
            </form>
          </div>

          <div className="space-y-6">
            {curriculum.modules.map((module) => (
              <div key={module.id} className="bg-card border border-border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                {/* Module Header */}
                <div className="p-4 bg-accent/20 border-b border-border flex items-center justify-between group">
                  <div className="flex items-center gap-4 flex-1">
                    <span className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-sm font-bold border border-primary/20">
                      {module.order}
                    </span>
                    <form action={async (formData) => {
                      "use server";
                      await updateModule(module.id, formData);
                    }} className="flex-1">
                      <input
                        name="title"
                        defaultValue={module.title}
                        className="w-full bg-transparent font-bold text-lg text-foreground focus:bg-background focus:ring-2 focus:ring-primary/20 rounded px-2 py-1 outline-none transition-all placeholder:text-muted-foreground/50"
                        placeholder="Module Title"
                      />
                      <button type="submit" hidden></button>
                    </form>
                  </div>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    {/* Delete would go here */}
                    <button className="text-muted-foreground hover:text-red-500 p-2 rounded-lg hover:bg-red-500/10 transition-colors" title="Delete Module">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>

                {/* Lessons List */}
                <div className="p-4 space-y-3">
                  {module.lessons.map(lesson => (
                    <div key={lesson.id} className="flex items-center justify-between p-3.5 rounded-xl bg-background border border-border hover:border-primary/50 transition-all group">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-accent rounded-lg text-muted-foreground">
                          <Edit size={14} />
                        </div>
                        <span className="text-sm font-medium">{lesson.title}</span>
                      </div>
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {/* Edit Lesson triggers */}
                        <button className="text-xs font-semibold text-primary hover:underline px-2 py-1">
                          Edit Content
                        </button>
                      </div>
                    </div>
                  ))}
                  {module.lessons.length === 0 && (
                    <div className="text-center py-6 border-2 border-dashed border-border rounded-xl">
                      <p className="text-sm text-muted-foreground mb-2">No lessons in this module</p>
                    </div>
                  )}

                  {/* Add Lesson Button - Simple Form for now */}
                  <form action={async () => {
                    "use server";
                    await createLesson(module.id, "New Lesson");
                  }} className="pt-2">
                    <button type="submit" className="w-full py-3 border border-dashed border-border rounded-xl text-sm font-semibold text-muted-foreground hover:text-primary hover:border-primary/50 hover:bg-primary/5 transition-all flex items-center justify-center gap-2 group">
                      <div className="bg-primary/10 text-primary rounded-full p-1 group-hover:scale-110 transition-transform">
                        <Plus size={14} />
                      </div>
                      Add Lesson
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar Help */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-primary/10 to-transparent border border-primary/20 p-6 rounded-2xl sticky top-6">
            <h3 className="font-bold text-foreground mb-4 text-lg">Curriculum Guide</h3>
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="bg-background p-2 rounded-lg h-fit border border-border shadow-sm">
                  <CheckCircle size={16} className="text-green-500" />
                </div>
                <div>
                  <p className="font-semibold text-sm">Auto-Save Enabled</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Changes to titles are saved automatically when you hit enter.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="bg-background p-2 rounded-lg h-fit border border-border shadow-sm">
                  <CheckCircle size={16} className="text-green-500" />
                </div>
                <div>
                  <p className="font-semibold text-sm">Publish to Students</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Drafts are private. Hit "Publish" to make them live.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

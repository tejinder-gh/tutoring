import { addLesson, addModule, createAssignment } from "@/lib/actions/academic";
import { db } from "@/lib/db";
import { ArrowLeft, FileText, Video } from "lucide-react";
import Link from "next/link";

interface PageProps {
  params: Promise<{ courseId: string }>;
}

export default async function CourseDetailPage(props: PageProps) {
  const params = await props.params;
  const course = await db.course.findUnique({
    where: { id: params.courseId },
    include: {
      curriculums: {
        where: { teacherId: null }, // Fetch default curriculum
        include: {
          modules: {
            orderBy: { order: "asc" },
            include: {
              lessons: { orderBy: { order: "asc" } },
              assignments: { orderBy: { createdAt: 'desc' } },
              quizzes: { orderBy: { createdAt: 'desc' } },
            },
          },
          assignments: {
            where: { moduleId: null }, // Only general assignments here
            orderBy: { createdAt: 'desc' }
          }
        }
      }
    },
  });

  if (!course) return <div>Course not found</div>;

  const curriculum = course.curriculums[0];

  return (
    <div>
      <div className="mb-8">
        <Link
          href="/admin/courses"
          className="flex items-center gap-2 text-text-muted hover:text-foreground mb-4"
        >
          <ArrowLeft size={16} /> Back to Courses
        </Link>
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold">{course.title}</h1>
            <p className="text-text-muted mt-2 max-w-2xl">
              {course.description}
            </p>
          </div>
          {/* Future: Edit Course Settings Button */}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content: Modules List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">Curriculum</h2>
          </div>

          <div className="space-y-4">
            {curriculum?.modules.map((module: any) => (
              <div
                key={module.id}
                className="border border-border rounded-xl overflow-hidden bg-accent/10"
              >
                <div className="p-4 bg-accent/20 border-b border-border flex justify-between items-center">
                  <h3 className="font-semibold text-lg flex gap-2 items-center">
                    <span className="text-text-muted text-sm">
                      Module {module.order}:
                    </span>
                    {module.title}
                  </h3>
                  <div className="flex items-center gap-2">
                    {/* Module Actions */}
                    <Link
                      href={`/admin/courses/${course.id}/modules/${module.id}/notes`}
                      className="text-xs bg-white border border-border px-2 py-1 rounded hover:bg-gray-50"
                    >
                      {module.richTextContent ? "Edit Notes" : "Add Notes"}
                    </Link>
                  </div>
                </div>

                {module.richTextContent && (
                  <div className="px-4 py-2 bg-yellow-50/50 border-b border-yellow-100 text-sm text-gray-600 prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: module.richTextContent }} />
                )}

                <div className="divide-y divide-border/50">
                  {/* Assignments Section */}
                  {module.assignments.length > 0 && (
                    <div className="bg-blue-50/30 p-2">
                      <p className="text-xs font-bold text-blue-800 mb-1 px-2 uppercase tracking-wide">Assignments</p>
                      {module.assignments.map((assignment: any) => (
                        <div key={assignment.id} className="px-2 py-1 flex justify-between text-sm text-blue-900">
                          <span>{assignment.title}</span>
                          <span className="text-xs opacity-70">{assignment.dueInDays ? `${assignment.dueInDays}d` : ''}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {module.lessons.map((lesson: any) => (
                    <div
                      key={lesson.id}
                      className="p-4 flex items-center gap-3 hover:bg-accent/5"
                    >
                      {lesson.content?.includes("http") ? (
                        <Video size={16} className="text-primary" />
                      ) : (
                        <FileText size={16} className="text-secondary" />
                      )}
                      <span>{lesson.title}</span>
                      <span className="ml-auto text-xs text-gray-400">Weight: {lesson.weightage}</span>
                    </div>
                  ))}

                  {/* Add Lesson Form (Simplified inline for now) */}
                  <div className="p-4 bg-background/50">
                    <form
                      action={addLesson.bind(null, module.id, course.id)}
                      className="flex gap-2"
                    >
                      <input
                        type="text"
                        name="title"
                        placeholder="New Lesson Title"
                        required
                        className="flex-1 bg-background border border-border rounded px-3 py-1 text-sm"
                      />
                      <input
                        type="text"
                        name="content"
                        placeholder="Content URL / Text"
                        className="flex-1 bg-background border border-border rounded px-3 py-1 text-sm"
                      />
                      <input
                        type="number"
                        name="weightage"
                        step="0.1"
                        defaultValue="1.0"
                        placeholder="Wgt"
                        className="w-16 bg-background border border-border rounded px-2 py-1 text-sm text-center"
                      />
                      <button
                        type="submit"
                        className="bg-secondary text-black text-xs font-bold px-3 py-1 rounded hover:opacity-90"
                      >
                        Add Lesson
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Add Module Block */}
          <div className="border border-dashed border-border rounded-xl p-6 text-center">
            <h3 className="text-lg font-semibold mb-4">Add New Module</h3>
            <form action={addModule.bind(null, course.id)} className="max-w-md mx-auto flex gap-2">
              <input
                type="text"
                name="title"
                placeholder="Module Title (e.g. Introduction to React)"
                required
                className="flex-1 bg-background border border-border rounded-lg px-4 py-2"
              />
              <button type="submit" className="bg-primary text-black font-bold px-4 py-2 rounded-lg">
                Add Module
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Sidebar: Assignments & Course Stats */}
      <div className="space-y-6">
        <div className="bg-accent/20 border border-border p-6 rounded-xl">
          <h3 className="font-bold mb-4">Assignments</h3>
          <div className="space-y-4">
            {curriculum?.assignments.map((assignment: any) => (
              <div key={assignment.id} className="p-3 bg-background rounded-lg border border-border">
                <h4 className="font-semibold text-sm">{assignment.title}</h4>
                <p className="text-xs text-text-muted mt-1 truncate">{assignment.description}</p>
                <div className="mt-2 text-xs flex justify-between">
                  <span className={assignment.dueInDays ? "text-primary" : "text-text-muted"}>
                    Due: {assignment.dueInDays ? `In ${assignment.dueInDays} days` : 'No deadline'}
                  </span>
                </div>
              </div>
            ))}
            {curriculum?.assignments.length === 0 && <p className="text-sm text-text-muted">No assignments yet.</p>}
          </div>

          <div className="mt-6 pt-6 border-t border-border">
            <h4 className="text-sm font-semibold mb-3">Create Assignment</h4>
            <form action={createAssignment.bind(null, course.id)} className="space-y-3">
              <input
                type="text" name="title" placeholder="Title" required
                className="w-full bg-background border border-border rounded px-3 py-2 text-sm"
              />
              <textarea
                name="description" placeholder="Instructions..."
                className="w-full bg-background border border-border rounded px-3 py-2 text-sm h-20"
              />

              <select name="moduleId" className="w-full bg-background border border-border rounded px-3 py-2 text-sm">
                <option value="">-- General Assignment --</option>
                {curriculum?.modules.map((m: any) => (
                  <option key={m.id} value={m.id}>{m.title}</option>
                ))}
              </select>

              <input
                type="number" name="dueInDays" placeholder="Due in (days)"
                className="w-full bg-background border border-border rounded px-3 py-2 text-sm"
              />
              <button type="submit" className="w-full bg-primary text-black font-bold py-2 rounded text-sm hover:opacity-90">
                Create Assignment
              </button>
            </form>
          </div>
        </div>

        <div className="bg-accent/20 border border-border p-6 rounded-xl">
          <h3 className="font-bold mb-4">Course Info</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-text-muted">Modules</span>
              <span>{curriculum?.modules.length || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted">Total Lessons</span>
              <span>{curriculum?.modules.reduce((acc: number, m: any) => acc + m.lessons.length, 0) || 0}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import { auth } from "@/auth";
import { getAllQuizzes } from "@/lib/actions/quiz";
import { requirePermission } from "@/lib/permissions";
import { ClipboardList, Plus } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminQuizzesPage() {
  await requirePermission("manage", "course");
  const session = await auth();

  const quizzes = await getAllQuizzes();

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Quizzes</h1>
          <p className="text-text-muted">
            Create and manage course assessments
          </p>
        </div>
        <Link
          href="/admin/quizzes/new"
          className="flex items-center gap-2 px-5 py-2.5 bg-primary text-black font-bold rounded-xl hover:opacity-90 transition-opacity"
        >
          <Plus size={18} />
          Create Quiz
        </Link>
      </div>

      {quizzes.length === 0 ? (
        <div className="text-center py-20 bg-accent/20 rounded-2xl border border-border">
          <ClipboardList className="mx-auto text-text-muted mb-4" size={48} />
          <h2 className="text-xl font-bold text-foreground mb-2">
            No Quizzes Yet
          </h2>
          <p className="text-text-muted mb-6">
            Create your first quiz to assess students
          </p>
          <Link
            href="/admin/quizzes/new"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-black font-bold rounded-xl hover:opacity-90 transition-opacity"
          >
            <Plus size={18} />
            Create Quiz
          </Link>
        </div>
      ) : (
        <div className="bg-accent/10 rounded-xl border border-border overflow-hidden">
          <table className="w-full">
            <thead className="bg-accent/20">
              <tr>
                <th className="text-left p-4 text-sm font-medium text-text-muted">
                  Title
                </th>
                <th className="text-left p-4 text-sm font-medium text-text-muted">
                  Course
                </th>
                <th className="text-left p-4 text-sm font-medium text-text-muted">
                  Lesson
                </th>
                <th className="text-left p-4 text-sm font-medium text-text-muted">
                  Questions
                </th>
                <th className="text-left p-4 text-sm font-medium text-text-muted">
                  Attempts
                </th>
                <th className="text-left p-4 text-sm font-medium text-text-muted">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {quizzes.map((quiz) => (
                <tr
                  key={quiz.id}
                  className="border-t border-border hover:bg-accent/10"
                >
                  <td className="p-4">
                    <Link
                      href={`/admin/quizzes/${quiz.id}`}
                      className="font-medium text-foreground hover:text-primary transition-colors"
                    >
                      {quiz.title}
                    </Link>
                  </td>
                  <td className="p-4 text-text-muted">{quiz.course.title}</td>
                  <td className="p-4 text-text-muted">
                    {quiz.lesson?.title || "—"}
                  </td>
                  <td className="p-4 text-text-muted">
                    {quiz._count.questions}
                  </td>
                  <td className="p-4 text-text-muted">
                    {quiz._count.attempts}
                  </td>
                  <td className="p-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${quiz.isActive
                          ? "bg-green-500/10 text-green-500"
                          : "bg-red-500/10 text-red-500"
                        }`}
                    >
                      {quiz.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

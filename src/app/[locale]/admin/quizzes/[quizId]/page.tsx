import { getQuizWithQuestions } from "@/lib/actions/quiz";
import { requirePermission } from "@/lib/permissions";
import { ArrowLeft, CheckCircle, Circle, GripVertical } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import AddQuestionForm from "./AddQuestionForm";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ quizId: string }>;
};

export default async function QuizEditorPage({ params }: Props) {
  await requirePermission("manage", "course");
  const { quizId } = await params;

  const quiz = await getQuizWithQuestions(quizId);
  if (!quiz) notFound();

  return (
    <div>
      <div className="mb-8">
        <Link
          href="/admin/quizzes"
          className="text-sm text-text-muted hover:text-primary transition-colors inline-flex items-center gap-1 mb-4"
        >
          <ArrowLeft size={14} />
          Back to Quizzes
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">{quiz.title}</h1>
            <p className="text-text-muted mt-1">
              {quiz.course.title}
              {quiz.lesson && ` → ${quiz.lesson.title}`}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${quiz.isActive
                  ? "bg-green-500/10 text-green-500"
                  : "bg-red-500/10 text-red-500"
                }`}
            >
              {quiz.isActive ? "Active" : "Inactive"}
            </span>
          </div>
        </div>
      </div>

      {/* Quiz Stats */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="p-4 bg-accent/20 border border-border rounded-xl">
          <div className="text-2xl font-bold">{quiz.questions.length}</div>
          <div className="text-sm text-text-muted">Questions</div>
        </div>
        <div className="p-4 bg-accent/20 border border-border rounded-xl">
          <div className="text-2xl font-bold">{quiz._count.attempts}</div>
          <div className="text-sm text-text-muted">Attempts</div>
        </div>
        <div className="p-4 bg-accent/20 border border-border rounded-xl">
          <div className="text-2xl font-bold">{quiz.passingScore}%</div>
          <div className="text-sm text-text-muted">Pass Score</div>
        </div>
        <div className="p-4 bg-accent/20 border border-border rounded-xl">
          <div className="text-2xl font-bold">
            {quiz.duration ? `${quiz.duration}m` : "∞"}
          </div>
          <div className="text-sm text-text-muted">Duration</div>
        </div>
      </div>

      {/* Questions List */}
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4">Questions</h2>
        {quiz.questions.length === 0 ? (
          <div className="p-8 text-center bg-accent/10 border border-border rounded-xl text-text-muted">
            No questions yet. Add your first question below.
          </div>
        ) : (
          <div className="space-y-4">
            {quiz.questions.map((question, idx) => (
              <div
                key={question.id}
                className="p-5 bg-card border border-border rounded-xl"
              >
                <div className="flex items-start gap-4">
                  <div className="text-text-muted">
                    <GripVertical size={18} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-bold text-primary">
                        Q{idx + 1}
                      </span>
                      <span className="text-xs bg-accent/50 px-2 py-0.5 rounded">
                        {question.type.replace("_", " ")}
                      </span>
                      <span className="text-xs text-text-muted">
                        {question.points} pt{question.points > 1 ? "s" : ""}
                      </span>
                    </div>
                    <p className="font-medium text-foreground mb-3">
                      {question.text}
                    </p>

                    {/* Options */}
                    {question.options.length > 0 && (
                      <div className="space-y-2 ml-4">
                        {question.options.map((option) => (
                          <div
                            key={option.id}
                            className={`flex items-center gap-2 text-sm ${option.isCorrect
                                ? "text-green-500"
                                : "text-text-muted"
                              }`}
                          >
                            {option.isCorrect ? (
                              <CheckCircle size={14} />
                            ) : (
                              <Circle size={14} />
                            )}
                            {option.text}
                          </div>
                        ))}
                      </div>
                    )}

                    {question.explanation && (
                      <div className="mt-3 p-3 bg-accent/20 rounded-lg text-sm text-text-muted">
                        <strong>Explanation:</strong> {question.explanation}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Question Form */}
      <div className="border-t border-border pt-8">
        <h2 className="text-xl font-bold mb-4">Add Question</h2>
        <AddQuestionForm quizId={quizId} />
      </div>
    </div>
  );
}

import { auth } from "@/auth";
import { getQuizResult } from "@/lib/actions/quiz";
import { ArrowLeft, CheckCircle, Home, Trophy, XCircle } from "lucide-react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ courseId: string; quizId: string }>;
  searchParams: Promise<{ attemptId?: string }>;
};

export default async function QuizResultPage({ params, searchParams }: Props) {
  const { courseId, quizId } = await params;
  const { attemptId } = await searchParams;

  const session = await auth();
  if (!session?.user) redirect("/login");

  if (!attemptId) notFound();

  const result = await getQuizResult(attemptId);
  if (!result) notFound();

  const passed = result.passed;
  const score = result.score;
  const passingScore = result.quiz.passingScore;

  // Map responses by questionId for easy lookup
  const responseMap = new Map(result.responses.map((r) => [r.questionId, r]));

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4 max-w-3xl">
        {/* Result Header */}
        <div
          className={`p-8 rounded-2xl text-center mb-8 ${passed
              ? "bg-gradient-to-br from-green-500/20 to-green-500/5 border border-green-500/30"
              : "bg-gradient-to-br from-red-500/20 to-red-500/5 border border-red-500/30"
            }`}
        >
          <div
            className={`w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center ${passed ? "bg-green-500" : "bg-red-500"
              }`}
          >
            {passed ? (
              <Trophy size={40} className="text-white" />
            ) : (
              <XCircle size={40} className="text-white" />
            )}
          </div>
          <h1 className="text-3xl font-black text-foreground mb-2">
            {passed ? "Congratulations!" : "Keep Trying!"}
          </h1>
          <p className="text-text-muted">
            {passed
              ? "You passed the quiz successfully"
              : `You need ${passingScore}% to pass. Don't give up!`}
          </p>

          <div className="mt-6 flex items-center justify-center gap-8">
            <div>
              <div className={`text-5xl font-black ${passed ? "text-green-500" : "text-red-500"}`}>
                {score}%
              </div>
              <div className="text-sm text-text-muted mt-1">Your Score</div>
            </div>
            <div className="h-16 w-px bg-border" />
            <div>
              <div className="text-5xl font-black text-text-muted">{passingScore}%</div>
              <div className="text-sm text-text-muted mt-1">Pass Score</div>
            </div>
          </div>
        </div>

        {/* Question Breakdown */}
        <h2 className="text-xl font-bold text-foreground mb-4">Question Review</h2>
        <div className="space-y-4">
          {result.quiz.questions.map((question, idx) => {
            const response = responseMap.get(question.id);
            const isCorrect = response?.isCorrect === true;
            const pointsEarned = response?.pointsEarned || 0;

            return (
              <div
                key={question.id}
                className={`p-5 rounded-xl border ${isCorrect
                    ? "bg-green-500/5 border-green-500/30"
                    : "bg-red-500/5 border-red-500/30"
                  }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${isCorrect ? "bg-green-500" : "bg-red-500"
                      }`}
                  >
                    {isCorrect ? (
                      <CheckCircle size={14} className="text-white" />
                    ) : (
                      <XCircle size={14} className="text-white" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-bold">Q{idx + 1}</span>
                      <span
                        className={`text-xs ${isCorrect ? "text-green-500" : "text-red-500"
                          }`}
                      >
                        {pointsEarned}/{question.points} pt
                      </span>
                    </div>
                    <p className="font-medium text-foreground mb-3">
                      {question.text}
                    </p>

                    {/* Options with correct/selected marking */}
                    {question.options.length > 0 && (
                      <div className="space-y-2">
                        {question.options.map((option) => {
                          const wasSelected = response?.selectedIds.includes(option.id);
                          const isCorrectOption = option.isCorrect;

                          return (
                            <div
                              key={option.id}
                              className={`flex items-center gap-2 text-sm p-2 rounded-lg ${isCorrectOption
                                  ? "bg-green-500/10 text-green-500"
                                  : wasSelected
                                    ? "bg-red-500/10 text-red-500"
                                    : "text-text-muted"
                                }`}
                            >
                              {isCorrectOption ? (
                                <CheckCircle size={14} />
                              ) : wasSelected ? (
                                <XCircle size={14} />
                              ) : (
                                <div className="w-3.5" />
                              )}
                              <span>{option.text}</span>
                              {wasSelected && !isCorrectOption && (
                                <span className="text-xs">(your answer)</span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Short answer */}
                    {question.type === "SHORT_ANSWER" && response?.textAnswer && (
                      <div className="mt-2 p-3 bg-accent/20 rounded-lg">
                        <p className="text-sm text-text-muted">Your answer:</p>
                        <p className="text-foreground">{response.textAnswer}</p>
                      </div>
                    )}

                    {/* Explanation */}
                    {question.explanation && (
                      <div className="mt-3 p-3 bg-accent/30 rounded-lg border border-border">
                        <p className="text-sm text-text-muted mb-1">Explanation:</p>
                        <p className="text-sm text-foreground">{question.explanation}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Actions */}
        <div className="flex gap-4 mt-8">
          <Link
            href={`/student/learn/${courseId}`}
            className="flex-1 flex items-center justify-center gap-2 px-5 py-3 bg-accent/50 border border-border rounded-xl hover:border-primary/50 transition-colors"
          >
            <ArrowLeft size={18} />
            Back to Course
          </Link>
          <Link
            href="/student/learn"
            className="flex-1 flex items-center justify-center gap-2 px-5 py-3 bg-primary text-black font-bold rounded-xl hover:opacity-90 transition-opacity"
          >
            <Home size={18} />
            My Learning
          </Link>
        </div>
      </div>
    </div>
  );
}

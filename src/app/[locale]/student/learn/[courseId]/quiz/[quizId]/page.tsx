import { auth } from "@/auth";
import { getQuizForStudent, startQuizAttempt } from "@/lib/actions/quiz";
import { notFound, redirect } from "next/navigation";
import QuizTaker from "./QuizTaker";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ courseId: string; quizId: string }>;
};

export default async function TakeQuizPage({ params }: Props) {
  const { courseId, quizId } = await params;
  const session = await auth();
  if (!session?.user) redirect("/login");

  const quiz = await getQuizForStudent(quizId);
  if (!quiz) notFound();

  // Start or resume attempt
  const result = await startQuizAttempt(quizId);
  if (!result.success || !result.attempt) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">Error</h1>
          <p className="text-text-muted">{result.error || "Failed to start quiz"}</p>
        </div>
      </div>
    );
  }

  return (
    <QuizTaker
      quiz={quiz}
      attemptId={result.attempt.id}
      courseId={courseId}
    />
  );
}

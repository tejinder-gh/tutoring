"use client";

import { submitQuizAttempt } from "@/lib/actions/quiz";
import { QuestionType } from "@prisma/client";
import { ArrowLeft, ArrowRight, CheckCircle, Clock, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";

interface Question {
  id: string;
  text: string;
  type: QuestionType;
  points: number;
  options: { id: string; text: string }[];
}

interface Quiz {
  id: string;
  title: string;
  description?: string | null;
  duration?: number | null;
  passingScore: number;
  questions: Question[];
}

interface QuizTakerProps {
  quiz: Quiz;
  attemptId: string;
  courseId: string;
}

export default function QuizTaker({ quiz, attemptId, courseId }: QuizTakerProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState<Map<string, { selectedIds: string[]; textAnswer?: string }>>(
    new Map()
  );
  const [timeRemaining, setTimeRemaining] = useState(quiz.duration ? quiz.duration * 60 : null);
  const [showConfirm, setShowConfirm] = useState(false);

  const currentQuestion = quiz.questions[currentQuestionIndex];

  if (!currentQuestion) {
    return <div>Error: Question not found</div>;
  }

  const currentResponse = responses.get(currentQuestion.id);

  // Timer
  useEffect(() => {
    if (timeRemaining === null) return;

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev === null || prev <= 0) {
          clearInterval(interval);
          // Auto-submit when time runs out
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timeRemaining]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleOptionSelect = (optionId: string) => {
    const newResponses = new Map(responses);
    const current = newResponses.get(currentQuestion.id) || { selectedIds: [] };

    if (currentQuestion.type === "MULTIPLE_CHOICE" || currentQuestion.type === "TRUE_FALSE") {
      // Single select
      newResponses.set(currentQuestion.id, { selectedIds: [optionId] });
    } else if (currentQuestion.type === "MULTIPLE_SELECT") {
      // Multi select
      const selectedIds = current.selectedIds.includes(optionId)
        ? current.selectedIds.filter((id) => id !== optionId)
        : [...current.selectedIds, optionId];
      newResponses.set(currentQuestion.id, { selectedIds });
    }

    setResponses(newResponses);
  };

  const handleTextAnswer = (text: string) => {
    const newResponses = new Map(responses);
    newResponses.set(currentQuestion.id, { selectedIds: [], textAnswer: text });
    setResponses(newResponses);
  };

  const handleSubmit = () => {
    startTransition(async () => {
      const responseData = quiz.questions.map((q) => {
        const r = responses.get(q.id);
        return {
          questionId: q.id,
          selectedIds: r?.selectedIds || [],
          textAnswer: r?.textAnswer,
        };
      });

      const result = await submitQuizAttempt(attemptId, responseData);

      if (result.success) {
        router.push(`/student/learn/${courseId}/quiz/${quiz.id}/result?attemptId=${attemptId}`);
      }
    });
  };

  const answeredCount = responses.size;
  const progress = (answeredCount / quiz.questions.length) * 100;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-foreground">{quiz.title}</h1>
            <div className="flex items-center gap-4">
              {timeRemaining !== null && (
                <div
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-mono font-bold ${timeRemaining < 60
                    ? "bg-red-500/10 text-red-500"
                    : "bg-accent/50 text-foreground"
                    }`}
                >
                  <Clock size={18} />
                  {formatTime(timeRemaining)}
                </div>
              )}
              <button
                onClick={() => setShowConfirm(true)}
                disabled={isPending}
                className="px-5 py-2 bg-primary text-black font-bold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                Submit Quiz
              </button>
            </div>
          </div>

          {/* Progress */}
          <div className="mt-3">
            <div className="flex items-center justify-between text-xs text-text-muted mb-1">
              <span>
                Question {currentQuestionIndex + 1} of {quiz.questions.length}
              </span>
              <span>{answeredCount} answered</span>
            </div>
            <div className="h-1.5 bg-accent/50 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Question */}
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-sm font-bold text-primary">
              Question {currentQuestionIndex + 1}
            </span>
            <span className="text-xs bg-accent/50 px-2 py-0.5 rounded">
              {currentQuestion.points} point{currentQuestion.points > 1 ? "s" : ""}
            </span>
          </div>
          <h2 className="text-2xl font-bold text-foreground">
            {currentQuestion.text}
          </h2>
        </div>

        {/* Options */}
        {currentQuestion.type === "SHORT_ANSWER" ? (
          <textarea
            value={currentResponse?.textAnswer || ""}
            onChange={(e) => handleTextAnswer(e.target.value)}
            placeholder="Type your answer here..."
            rows={4}
            className="w-full px-5 py-4 bg-accent/20 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary resize-none text-lg"
          />
        ) : (
          <div className="space-y-3">
            {currentQuestion.options.map((option) => {
              const isSelected = currentResponse?.selectedIds.includes(option.id);
              return (
                <button
                  key={option.id}
                  onClick={() => handleOptionSelect(option.id)}
                  className={`w-full p-5 text-left rounded-xl border-2 transition-all ${isSelected
                    ? "border-primary bg-primary/10"
                    : "border-border hover:border-primary/50 bg-card"
                    }`}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${isSelected
                        ? "border-primary bg-primary"
                        : "border-border"
                        }`}
                    >
                      {isSelected && <CheckCircle size={14} className="text-black" />}
                    </div>
                    <span className="font-medium text-foreground">
                      {option.text}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between mt-10 pt-6 border-t border-border">
          <button
            onClick={() => setCurrentQuestionIndex((prev) => prev - 1)}
            disabled={currentQuestionIndex === 0}
            className="flex items-center gap-2 px-5 py-2.5 bg-accent/50 border border-border rounded-lg disabled:opacity-50 hover:border-primary/50 transition-colors"
          >
            <ArrowLeft size={18} />
            Previous
          </button>

          {currentQuestionIndex < quiz.questions.length - 1 ? (
            <button
              onClick={() => setCurrentQuestionIndex((prev) => prev + 1)}
              className="flex items-center gap-2 px-5 py-2.5 bg-primary text-black font-bold rounded-lg hover:opacity-90 transition-opacity"
            >
              Next
              <ArrowRight size={18} />
            </button>
          ) : (
            <button
              onClick={() => setShowConfirm(true)}
              disabled={isPending}
              className="flex items-center gap-2 px-5 py-2.5 bg-primary text-black font-bold rounded-lg hover:opacity-90 transition-opacity"
            >
              Finish Quiz
              <CheckCircle size={18} />
            </button>
          )}
        </div>

        {/* Question Navigator */}
        <div className="mt-10">
          <p className="text-sm text-text-muted mb-3">Jump to question:</p>
          <div className="flex flex-wrap gap-2">
            {quiz.questions.map((q, idx) => {
              const isAnswered = responses.has(q.id);
              const isCurrent = idx === currentQuestionIndex;
              return (
                <button
                  key={q.id}
                  onClick={() => setCurrentQuestionIndex(idx)}
                  className={`w-10 h-10 rounded-lg font-bold text-sm transition-colors ${isCurrent
                    ? "bg-primary text-black"
                    : isAnswered
                      ? "bg-green-500/20 text-green-500 border border-green-500/30"
                      : "bg-accent/50 border border-border text-text-muted hover:border-primary/50"
                    }`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Submit Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-background border border-border rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
            <h3 className="text-xl font-bold text-foreground mb-4">
              Submit Quiz?
            </h3>
            <p className="text-text-muted mb-2">
              You have answered {answeredCount} of {quiz.questions.length} questions.
            </p>
            {answeredCount < quiz.questions.length && (
              <p className="text-yellow-500 text-sm mb-4">
                Warning: You have {quiz.questions.length - answeredCount} unanswered questions.
              </p>
            )}
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 px-5 py-3 bg-accent/50 border border-border rounded-xl hover:bg-accent transition-colors"
              >
                Continue Quiz
              </button>
              <button
                onClick={handleSubmit}
                disabled={isPending}
                className="flex-1 px-5 py-3 bg-primary text-black font-bold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isPending && <Loader2 size={18} className="animate-spin" />}
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

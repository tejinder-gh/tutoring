"use client";

import { ArrowRight, CheckCircle, ClipboardList, Clock, XCircle } from "lucide-react";
import Link from "next/link";

interface QuizCardProps {
  id: string;
  title: string;
  description?: string | null;
  courseId: string;
  lessonTitle?: string | null;
  questionCount: number;
  duration?: number | null;
  passingScore: number;
  // Student-specific props
  lastAttempt?: {
    id: string;
    score: number | null;
    passed: boolean | null;
    submittedAt: Date | null;
  } | null;
  isAdmin?: boolean;
}

export default function QuizCard({
  id,
  title,
  description,
  courseId,
  lessonTitle,
  questionCount,
  duration,
  passingScore,
  lastAttempt,
  isAdmin = false,
}: QuizCardProps) {
  const href = isAdmin
    ? `/admin/quizzes/${id}`
    : `/student/learn/${courseId}/quiz/${id}`;

  const hasAttempted = !!lastAttempt?.submittedAt;
  const hasPassed = lastAttempt?.passed === true;

  return (
    <Link
      href={href}
      className="block p-5 bg-card border border-border rounded-2xl hover:border-primary/50 hover:shadow-lg transition-all group"
    >
      <div className="flex items-start gap-4">
        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-colors ${hasPassed
            ? "bg-green-500/10 text-green-500"
            : hasAttempted
              ? "bg-red-500/10 text-red-500"
              : "bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground"
            }`}
        >
          {hasPassed ? (
            <CheckCircle size={24} />
          ) : hasAttempted ? (
            <XCircle size={24} />
          ) : (
            <ClipboardList size={24} />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1">
            {title}
          </h3>
          {description && (
            <p className="text-sm text-text-muted mt-1 line-clamp-2">
              {description}
            </p>
          )}

          {/* Meta info */}
          <div className="flex items-center gap-4 mt-3 text-xs text-text-muted">
            <span>{questionCount} questions</span>
            {duration && (
              <span className="flex items-center gap-1">
                <Clock size={12} />
                {duration} min
              </span>
            )}
            <span>Pass: {passingScore}%</span>
          </div>

          {/* Last attempt info */}
          {hasAttempted && (
            <div
              className={`mt-3 text-sm font-medium ${hasPassed ? "text-green-500" : "text-red-500"
                }`}
            >
              {hasPassed ? "Passed" : "Failed"} - Score: {lastAttempt.score}%
            </div>
          )}
        </div>

        <ArrowRight
          size={18}
          className="text-text-muted group-hover:text-primary transition-colors shrink-0"
        />
      </div>

      {lessonTitle && (
        <div className="mt-3 pt-3 border-t border-border/50">
          <span className="text-xs text-text-muted">Lesson: {lessonTitle}</span>
        </div>
      )}
    </Link>
  );
}

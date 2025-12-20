"use client";

import { markLessonComplete, markLessonIncomplete } from "@/lib/actions/progress";
import { CheckCircle, Circle, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

interface MarkCompleteButtonProps {
  lessonId: string;
  completed: boolean;
}

export default function MarkCompleteButton({
  lessonId,
  completed: initialCompleted,
}: MarkCompleteButtonProps) {
  const [completed, setCompleted] = useState(initialCompleted);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleToggle = () => {
    startTransition(async () => {
      if (completed) {
        const result = await markLessonIncomplete(lessonId);
        if (result.success) {
          setCompleted(false);
          router.refresh();
        }
      } else {
        const result = await markLessonComplete(lessonId);
        if (result.success) {
          setCompleted(true);
          router.refresh();
        }
      }
    });
  };

  if (completed) {
    return (
      <button
        onClick={handleToggle}
        disabled={isPending}
        className="flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/30 text-green-500 rounded-xl font-bold text-sm hover:bg-green-500/20 transition-colors disabled:opacity-50"
      >
        {isPending ? (
          <Loader2 size={18} className="animate-spin" />
        ) : (
          <CheckCircle size={18} />
        )}
        Completed
      </button>
    );
  }

  return (
    <button
      onClick={handleToggle}
      disabled={isPending}
      className="flex items-center gap-2 px-4 py-2 bg-primary text-black rounded-xl font-bold text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
    >
      {isPending ? (
        <Loader2 size={18} className="animate-spin" />
      ) : (
        <Circle size={18} />
      )}
      Mark Complete
    </button>
  );
}

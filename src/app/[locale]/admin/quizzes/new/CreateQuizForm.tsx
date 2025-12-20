"use client";

import { createQuiz } from "@/lib/actions/quiz";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

interface Course {
  id: string;
  title: string;
  modules: {
    id: string;
    title: string;
    lessons: { id: string; title: string }[];
  }[];
}

interface CreateQuizFormProps {
  courses: Course[];
}

export default function CreateQuizForm({ courses }: CreateQuizFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [courseId, setCourseId] = useState("");
  const [lessonId, setLessonId] = useState("");
  const [duration, setDuration] = useState("");
  const [passingScore, setPassingScore] = useState("70");
  const [error, setError] = useState("");

  const selectedCourse = courses.find((c) => c.id === courseId);
  const allLessons = selectedCourse?.modules.flatMap((m) =>
    m.lessons.map((l) => ({ ...l, moduleName: m.title }))
  ) || [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!title.trim()) {
      setError("Title is required");
      return;
    }
    if (!courseId) {
      setError("Please select a course");
      return;
    }

    startTransition(async () => {
      const result = await createQuiz({
        title: title.trim(),
        description: description.trim() || undefined,
        courseId,
        lessonId: lessonId || undefined,
        duration: duration ? parseInt(duration) : undefined,
        passingScore: passingScore ? parseInt(passingScore) : 70,
      });

      if (result.success && result.quiz) {
        router.push(`/admin/quizzes/${result.quiz.id}`);
      } else {
        setError(result.error || "Failed to create quiz");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl">
      <div className="space-y-6">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium mb-2">Quiz Title *</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., JavaScript Fundamentals Quiz"
            className="w-full px-4 py-3 bg-accent/20 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium mb-2">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Brief description of the quiz..."
            rows={3}
            className="w-full px-4 py-3 bg-accent/20 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary resize-none"
          />
        </div>

        {/* Course */}
        <div>
          <label className="block text-sm font-medium mb-2">Course *</label>
          <select
            value={courseId}
            onChange={(e) => {
              setCourseId(e.target.value);
              setLessonId("");
            }}
            className="w-full px-4 py-3 bg-accent/20 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">Select a course</option>
            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.title}
              </option>
            ))}
          </select>
        </div>

        {/* Lesson (optional) */}
        {courseId && allLessons.length > 0 && (
          <div>
            <label className="block text-sm font-medium mb-2">
              Attach to Lesson (optional)
            </label>
            <select
              value={lessonId}
              onChange={(e) => setLessonId(e.target.value)}
              className="w-full px-4 py-3 bg-accent/20 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Course-level quiz (no specific lesson)</option>
              {allLessons.map((lesson) => (
                <option key={lesson.id} value={lesson.id}>
                  {lesson.moduleName} → {lesson.title}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          {/* Duration */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Time Limit (minutes)
            </label>
            <input
              type="number"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder="Leave empty for unlimited"
              min="1"
              className="w-full px-4 py-3 bg-accent/20 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Passing Score */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Passing Score (%)
            </label>
            <input
              type="number"
              value={passingScore}
              onChange={(e) => setPassingScore(e.target.value)}
              min="0"
              max="100"
              className="w-full px-4 py-3 bg-accent/20 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/30 text-red-500 rounded-xl text-sm">
            {error}
          </div>
        )}

        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            disabled={isPending}
            className="px-6 py-3 bg-primary text-black font-bold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
          >
            {isPending && <Loader2 size={18} className="animate-spin" />}
            Create Quiz
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-3 bg-accent/50 border border-border rounded-xl hover:bg-accent transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </form>
  );
}

"use client";

import { CheckCircle, ChevronDown, ChevronRight, Circle, PlayCircle } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

interface Lesson {
  id: string;
  title: string;
  completed: boolean;
}

interface Module {
  id: string;
  title: string;
  lessons: Lesson[];
}

interface CourseSidebarProps {
  courseId: string;
  courseTitle: string;
  modules: Module[];
  currentLessonId?: string;
  progressPercent: number;
}

export default function CourseSidebar({
  courseId,
  courseTitle,
  modules,
  currentLessonId,
  progressPercent,
}: CourseSidebarProps) {
  // Track which modules are expanded
  const [expandedModules, setExpandedModules] = useState<Set<string>>(() => {
    // Default: expand module containing current lesson
    const moduleWithCurrentLesson = modules.find((m) =>
      m.lessons.some((l) => l.id === currentLessonId)
    );
    // Explicitly handle undefined to ensure we return Set<string>
    if (moduleWithCurrentLesson) {
      return new Set([moduleWithCurrentLesson.id]);
    }
    const firstModuleId = modules[0]?.id;
    return new Set(firstModuleId ? [firstModuleId] : []);
  });

  const pathname = usePathname();

  const toggleModule = (moduleId: string) => {
    setExpandedModules((prev) => {
      const next = new Set(prev);
      if (next.has(moduleId)) {
        next.delete(moduleId);
      } else {
        next.add(moduleId);
      }
      return next;
    });
  };

  return (
    <div className="w-full h-full flex flex-col bg-background border-r border-border">
      {/* Course Header */}
      <div className="p-4 border-b border-border">
        <Link
          href={`/student/learn/${courseId}`}
          className="font-bold text-lg text-foreground hover:text-primary transition-colors line-clamp-2"
        >
          {courseTitle}
        </Link>

        {/* Progress bar */}
        <div className="mt-3">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-text-muted">Progress</span>
            <span className="font-bold text-primary">{progressPercent}%</span>
          </div>
          <div className="h-2 bg-accent/50 rounded-full overflow-hidden">
            <div
              className="h-full bg-linear-to-r from-primary to-primary/80 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Modules & Lessons */}
      <div className="flex-1 overflow-y-auto">
        {modules.map((module, moduleIndex) => {
          const isExpanded = expandedModules.has(module.id);
          const completedLessons = module.lessons.filter((l) => l.completed).length;
          const allComplete = completedLessons === module.lessons.length && module.lessons.length > 0;

          return (
            <div key={module.id} className="border-b border-border/50">
              {/* Module Header */}
              <button
                onClick={() => toggleModule(module.id)}
                className="w-full p-4 flex items-start gap-3 hover:bg-accent/50 transition-colors text-left"
              >
                <span className="text-xs font-bold text-primary mt-0.5">
                  {String(moduleIndex + 1).padStart(2, "0")}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-foreground line-clamp-2">
                      {module.title}
                    </span>
                    {allComplete && (
                      <CheckCircle className="text-green-500 shrink-0" size={14} />
                    )}
                  </div>
                  <span className="text-xs text-text-muted mt-0.5 block">
                    {completedLessons}/{module.lessons.length} lessons
                  </span>
                </div>
                {isExpanded ? (
                  <ChevronDown size={18} className="text-text-muted shrink-0 mt-0.5" />
                ) : (
                  <ChevronRight size={18} className="text-text-muted shrink-0 mt-0.5" />
                )}
              </button>

              {/* Lessons */}
              {isExpanded && (
                <div className="pb-2">
                  {module.lessons.map((lesson) => {
                    const isActive = lesson.id === currentLessonId;

                    return (
                      <Link
                        key={lesson.id}
                        href={`/student/learn/${courseId}/${lesson.id}`}
                        className={`flex items-center gap-3 px-4 py-2.5 mx-2 rounded-lg transition-all ${isActive
                          ? "bg-primary/10 text-primary"
                          : "hover:bg-accent/50 text-text-muted hover:text-foreground"
                          }`}
                      >
                        {lesson.completed ? (
                          <CheckCircle
                            size={16}
                            className={isActive ? "text-primary" : "text-green-500"}
                          />
                        ) : (
                          <Circle size={16} className="opacity-50" />
                        )}
                        <span className="text-sm font-medium line-clamp-1 flex-1">
                          {lesson.title}
                        </span>
                        {isActive && (
                          <PlayCircle size={14} className="shrink-0" />
                        )}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

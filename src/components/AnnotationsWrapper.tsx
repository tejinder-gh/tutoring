"use client";

import type { LessonHighlight } from "@prisma/client";
import { Sidebar } from "lucide-react";
import { useState } from "react";
import AnnotationsSidebar from "./AnnotationsSidebar";
import HighlightableContent from "./HighlightableContent";

interface AnnotationsWrapperProps {
  lessonId: string;
  initialHighlights: LessonHighlight[];
  content: string;
}

export default function AnnotationsWrapper({
  lessonId,
  initialHighlights,
  content
}: AnnotationsWrapperProps) {
  const [highlights, setHighlights] = useState<LessonHighlight[]>(initialHighlights);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Sync highlights if needed with AnnotationSidebar callback
  const handleDeleteHighlight = (id: string) => {
    setHighlights(prev => prev.filter(h => h.id !== id));
  };

  return (
    <div className="relative">
      {/* Sidebar Toggle */}
      <div className="absolute top-0 right-0 z-10 p-2">
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="p-2 text-text-muted hover:text-primary transition-colors bg-card/80 backdrop-blur-sm rounded-lg border border-border shadow-sm"
          title="Show Annotations"
        >
          <Sidebar size={20} />
        </button>
      </div>

      <HighlightableContent
        content={content}
        lessonId={lessonId}
        initialHighlights={highlights}
      />

      <AnnotationsSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        highlights={highlights}
        onDeleteHighlight={handleDeleteHighlight}
      />
    </div>
  );
}

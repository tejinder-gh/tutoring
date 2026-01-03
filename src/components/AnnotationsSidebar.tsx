"use client";

import { deleteHighlight } from "@/lib/actions/annotations";
import type { LessonHighlight } from "@prisma/client";
import { BookOpen, Trash2, X } from "lucide-react";

interface AnnotationsSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  highlights: LessonHighlight[];
  onDeleteHighlight?: (id: string) => void; // Callback to update parent state
}

export default function AnnotationsSidebar({
  isOpen,
  onClose,
  highlights,
  onDeleteHighlight,
}: AnnotationsSidebarProps) {
  const handleDelete = async (id: string) => {
    if (!confirm("Delete this highlight?")) return;

    const result = await deleteHighlight(id);
    if (result.success) {
      if (onDeleteHighlight) onDeleteHighlight(id);
    }
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 right-0 z-50 w-80 bg-card border-l border-border transform transition-transform duration-300 ease-in-out ${isOpen ? "translate-x-0" : "translate-x-full"
          }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="font-bold text-foreground flex items-center gap-2">
            <BookOpen size={20} className="text-primary" />
            Annotations
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-accent/20 rounded-lg text-text-muted hover:text-foreground"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-4 overflow-y-auto h-[calc(100vh-65px)]">
          {highlights.length === 0 ? (
            <div className="text-center py-8 text-text-muted text-sm">
              <p>No highlights yet.</p>
              <p className="mt-2 text-xs">
                Select text in the lesson to add a highlight.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {highlights.map((highlight) => (
                <div
                  key={highlight.id}
                  className="p-3 rounded-xl border border-border bg-background hover:border-primary/50 transition-colors group"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div
                      className="w-3 h-3 rounded-full mt-1.5 shrink-0"
                      style={{ backgroundColor: highlight.color }}
                    />
                    <button
                      onClick={() => handleDelete(highlight.id)}
                      className="text-text-muted hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  <blockquote className="text-sm text-text-muted border-l-2 border-border pl-2 italic mb-2 line-clamp-3">
                    "{highlight.selectedText}"
                  </blockquote>

                  {highlight.note && (
                    <p className="text-xs text-foreground bg-accent/10 p-2 rounded">
                      {highlight.note}
                    </p>
                  )}

                  <p className="text-[10px] text-text-muted mt-2 text-right">
                    {new Date(highlight.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

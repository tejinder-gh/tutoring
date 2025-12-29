"use client";

import { submitCurriculumAction, updateLessonContent } from "@/app/actions/curriculum-editor";
import { RichTextEditor } from "@/components/editor/RichTextEditor";
import { FileText, Save, Video } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
// Wait, I found cn doesn't exist earlier? I should check if I created it.
// I didn't create it. I should avoid using it or create it.
// I'll avoid it and use template literals.

interface CurriculumEditorProps {
  curriculum: any; // Type this properly if possible, but any is practical for complex Prisma include
  courseId: string;
}

export function CurriculumEditor({ curriculum, courseId }: CurriculumEditorProps) {
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(
    curriculum.modules[0]?.lessons[0]?.id || null
  );

  // Find selected lesson
  const selectedLesson = curriculum.modules
    .flatMap((m: any) => m.lessons)
    .find((l: any) => l.id === selectedLessonId);

  const [content, setContent] = useState(selectedLesson?.richTextContent || selectedLesson?.content || "");
  const [isPending, startTransition] = useTransition();
  const [isSaved, setIsSaved] = useState(true);
  const router = useRouter();

  // Update content state when selection changes
  // Note: This pattern needs care to not overwrite unsaved changes
  const handleLessonSelect = (id: string) => {
    if (!isSaved) {
      if (!confirm("You have unsaved changes. Discard them?")) return;
    }

    const newLesson = curriculum.modules
      .flatMap((m: any) => m.lessons)
      .find((l: any) => l.id === id);

    setSelectedLessonId(id);
    setContent(newLesson?.richTextContent || newLesson?.content || "");
    setIsSaved(true);
  };

  const handleSave = () => {
    if (!selectedLessonId) return;

    startTransition(async () => {
      try {
        await updateLessonContent(selectedLessonId, content);
        setIsSaved(true);
        router.refresh(); // Refresh to update server state
      } catch (err) {
        console.error(err);
        alert("Failed to save");
      }
    });
  };

  const handleSubmitInternal = () => {
    if (!confirm("Submit these changes for Director approval?")) return;
    startTransition(async () => {
      await submitCurriculumAction(curriculum.id);
      router.push(`/teacher/courses/${courseId}`);
    })
  }

  return (
    <div className="flex h-[calc(100vh-100px)] border rounded-xl overflow-hidden bg-white shadow-sm">
      {/* Sidebar - Lesson Navigation */}
      <div className="w-80 border-r bg-gray-50 overflow-y-auto flex flex-col">
        <div className="p-4 border-b">
          <h2 className="font-bold text-lg">Modules</h2>
          <p className="text-xs text-gray-500">Select a lesson to edit</p>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {curriculum.modules.map((module: any) => (
            <div key={module.id}>
              <h3 className="font-semibold text-sm mb-2 text-gray-700">Module {module.order}: {module.title}</h3>
              <div className="space-y-1">
                {module.lessons.map((lesson: any) => (
                  <button
                    key={lesson.id}
                    onClick={() => handleLessonSelect(lesson.id)}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm flex items-center gap-2 transition-colors ${selectedLessonId === lesson.id ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-gray-200 text-gray-600'}`}
                  >
                    {lesson.contentType === 'video' ? <Video size={14} /> : <FileText size={14} />}
                    <span className="truncate">{lesson.title}</span>
                    {lesson.richTextContent && <span className="w-1.5 h-1.5 rounded-full bg-blue-500 ml-auto" title="Has customized content" />}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 border-t bg-white">
          <button
            onClick={handleSubmitInternal}
            disabled={isPending}
            className="w-full py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 text-sm font-medium"
          >
            Submit for Approval
          </button>
        </div>
      </div>

      {/* Main Content - Editor */}
      <div className="flex-1 flex flex-col min-w-0 bg-white">
        {selectedLesson ? (
          <>
            <div className="border-b p-4 flex justify-between items-center bg-white sticky top-0 z-10">
              <div>
                <h2 className="text-xl font-bold">{selectedLesson.title}</h2>
                <span className={`text-xs ${isSaved ? 'text-green-600' : 'text-amber-600 font-medium'}`}>
                  {isSaved ? 'All changes saved' : 'Unsaved changes'}
                </span>
              </div>
              <button
                onClick={handleSave}
                disabled={isPending || isSaved}
                className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-colors ${isSaved ? 'bg-gray-100 text-gray-400' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
              >
                {isPending ? <div className="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full" /> : <Save size={16} />}
                Save Changes
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 bg-gray-50/50">
              <div className="max-w-4xl mx-auto">
                <RichTextEditor
                  content={content}
                  onChange={(html) => {
                    setContent(html);
                    setIsSaved(false);
                  }}
                />
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            Select a lesson to start editing
          </div>
        )}
      </div>
    </div>
  );
}

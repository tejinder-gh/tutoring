"use client";

import { saveLessonContent } from '@/lib/actions/lessons';
import MDEditor from '@uiw/react-md-editor';
import { AlertCircle, Save, Upload } from 'lucide-react';
import { useEffect, useState } from 'react';

interface LessonEditorProps {
  lessonId: string;
  initialContent?: string;
  onSave?: (contentUrl: string) => void;
}

export default function LessonEditor({
  lessonId,
  initialContent = '',
  onSave,
}: LessonEditorProps) {
  const [markdown, setMarkdown] = useState(initialContent);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isDirty, setIsDirty] = useState(false);

  // Autosave draft to localStorage
  useEffect(() => {
    const timer = setTimeout(() => {
      if (markdown !== initialContent) {
        localStorage.setItem(`lesson-draft-${lessonId}`, markdown);
        setIsDirty(true);
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [markdown, lessonId, initialContent]);

  // Load draft from localStorage on mount
  useEffect(() => {
    const draft = localStorage.getItem(`lesson-draft-${lessonId}`);
    if (draft && draft !== initialContent) {
      const useDraft = confirm(
        'A draft was found for this lesson. Would you like to restore it?'
      );
      if (useDraft) {
        setMarkdown(draft);
        setIsDirty(true);
      }
    }
  }, [lessonId, initialContent]);

  const handleSave = async () => {
    setIsSaving(true);
    setMessage(null);

    try {
      // Convert markdown to Blob for upload
      const blob = new Blob([markdown], { type: 'text/markdown' });
      const file = new File([blob], `lesson-${lessonId}.md`, { type: 'text/markdown' });

      // Upload to UploadThing
      const formData = new FormData();
      formData.append('file', file);

      const uploadResponse = await fetch('/api/uploadthing?slug=lessonContent', {
        method: 'POST',
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload content');
      }

      const uploadData = await uploadResponse.json();
      const contentUrl = uploadData[0]?.url;

      if (!contentUrl) {
        throw new Error('No URL returned from upload');
      }

      // Save lesson with new contentUrl
      const result = await saveLessonContent(lessonId, markdown, contentUrl, 'markdown');

      if (!result.success) {
        throw new Error(result.error || 'Failed to save lesson');
      }

      // Clear draft and mark as saved
      localStorage.removeItem(`lesson-draft-${lessonId}`);
      setIsDirty(false);
      setMessage({ type: 'success', text: 'Lesson saved successfully!' });

      if (onSave) {
        onSave(contentUrl);
      }
    } catch (error) {
      console.error('Error saving lesson:', error);
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Failed to save lesson',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-4 bg-card border border-border rounded-xl">
        <div className="flex items-center gap-4">
          {isDirty && (
            <div className="flex items-center gap-2 text-sm text-text-muted">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span>Unsaved changes</span>
            </div>
          )}
        </div>

        <button
          onClick={handleSave}
          disabled={isSaving || !isDirty}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground font-bold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSaving ? (
            <>
              <Upload size={18} className="animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save size={18} />
              Save Lesson
            </>
          )}
        </button>
      </div>

      {/* Messages */}
      {message && (
        <div
          className={`p-4 rounded-xl border flex items-start gap-3 ${message.type === 'success'
            ? 'bg-green-500/10 border-green-500/50 text-green-600'
            : 'bg-red-500/10 border-red-500/50 text-red-600'
            }`}
        >
          <AlertCircle size={20} className="shrink-0 mt-0.5" />
          <span className="text-sm font-medium">{message.text}</span>
        </div>
      )}

      {/* MDX Editor */}
      <div data-color-mode="dark">
        <MDEditor
          value={markdown}
          onChange={(val) => setMarkdown(val || '')}
          height={600}
          preview="live"
          previewOptions={{
            rehypePlugins: [],
          }}
        />
      </div>

      {/* Help Text */}
      <div className="p-4 bg-accent/20 border border-border rounded-xl text-sm text-text-muted">
        <h4 className="font-bold text-foreground mb-2">Editor Tips:</h4>
        <ul className="list-disc list-inside space-y-1">
          <li>Use GitHub Flavored Markdown for formatting</li>
          <li>Changes are auto-saved to your browser every second</li>
          <li>Click "Save Lesson" to upload content to the server</li>
          <li>Preview pane shows how content will appear to students</li>
        </ul>
      </div>
    </div>
  );
}

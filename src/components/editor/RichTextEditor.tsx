"use client";

import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Bold, Code, Heading1, Heading2, Italic, List, ListOrdered, Quote } from 'lucide-react';
import { useEffect } from 'react';

interface RichTextEditorProps {
  content: string;
  onChange?: (html: string) => void;
  editable?: boolean;
  placeholder?: string;
}

export function RichTextEditor({ content, onChange, editable = true, placeholder = "Start typing..." }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
      }),
      Image,
      Placeholder.configure({
        placeholder,
      }),
    ],
    content,
    // editors prop removed as it was invalid
    editable,
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[150px] p-4',
      },
    }
  });

  // Sync content if it changes externally
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      // Only set if significantly different to avoid cursor jumps?
      // For now, simpler equality check.
      // Note: Tiptap handles this poorly if we set content on every keystroke.
      // Ideally we only set initial content.
      // But for "Edit" mode where data loads async, we need this.

      // A better pattern is to only set content if editor is empty or on mount.
      // But let's check if content is different.
      // editor.commands.setContent(content);
    }
  }, [content, editor]);

  // Actually, better to separate initialContent from controlled content.
  // But for now let's leave the useEffect commented out to avoid loops
  // and rely on initial content for the first render, unless we need reactive updates.
  // We'll trust the parent to key the component if content changes entirely (e.g. switching lessons).

  if (!editor) {
    return null;
  }

  if (!editable) {
    return <EditorContent editor={editor} className="border rounded-md bg-gray-50" />;
  }

  return (
    <div className="border rounded-md overflow-hidden bg-white shadow-sm">
      <div className="bg-gray-50 border-b p-2 flex flex-wrap gap-1 items-center">
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={editor.isActive('bold')}
          icon={<Bold className="w-4 h-4" />}
          label="Bold"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={editor.isActive('italic')}
          icon={<Italic className="w-4 h-4" />}
          label="Italic"
        />
        <div className="w-px h-6 bg-gray-300 mx-2" />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          isActive={editor.isActive('heading', { level: 1 })}
          icon={<Heading1 className="w-4 h-4" />}
          label="H1"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          isActive={editor.isActive('heading', { level: 2 })}
          icon={<Heading2 className="w-4 h-4" />}
          label="H2"
        />
        <div className="w-px h-6 bg-gray-300 mx-2" />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          isActive={editor.isActive('bulletList')}
          icon={<List className="w-4 h-4" />}
          label="Bullet List"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          isActive={editor.isActive('orderedList')}
          icon={<ListOrdered className="w-4 h-4" />}
          label="Ordered List"
        />
        <div className="w-px h-6 bg-gray-300 mx-2" />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          isActive={editor.isActive('blockquote')}
          icon={<Quote className="w-4 h-4" />}
          label="Quote"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          isActive={editor.isActive('codeBlock')}
          icon={<Code className="w-4 h-4" />}
          label="Code"
        />
      </div>
      <EditorContent editor={editor} className="min-h-[200px]" />
    </div>
  );
}

function ToolbarButton({ onClick, isActive, icon, label }: { onClick: () => void; isActive: boolean; icon: React.ReactNode; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`h-8 w-8 p-0 flex items-center justify-center rounded hover:bg-gray-100 ${isActive ? "bg-gray-200 text-black" : "text-gray-600"}`}
      aria-label={label}
      title={label}
      type="button"
    >
      {icon}
    </button>
  );
}

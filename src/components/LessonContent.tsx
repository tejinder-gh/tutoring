"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface LessonContentProps {
  content: string | null;
  className?: string;
}

export default function LessonContent({
  content,
  className = "",
}: LessonContentProps) {
  if (!content) {
    return (
      <div className={`text-text-muted italic text-center py-12 ${className}`}>
        No content available for this lesson yet.
      </div>
    );
  }

  // Check if content looks like HTML (contains tags)
  const isHtml = /<[a-z][\s\S]*>/i.test(content);

  if (isHtml) {
    return (
      <div
        className={`prose prose-lg dark:prose-invert max-w-none ${className}`}
        dangerouslySetInnerHTML={{ __html: content }}
      />
    );
  }

  // Treat as Markdown
  return (
    <div className={`prose prose-lg dark:prose-invert max-w-none ${className}`}>
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    </div>
  );
}

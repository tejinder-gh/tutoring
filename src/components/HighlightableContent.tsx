"use client";

import { createHighlight, deleteHighlight } from "@/lib/actions/annotations";
import { LessonHighlight } from "@prisma/client";
import { useEffect, useRef, useState } from "react";
import { remark } from "remark";
import html from "remark-html";
import HighlightToolbar from "./HighlightToolbar";

interface HighlightableContentProps {
  content: string;
  lessonId: string;
  initialHighlights: LessonHighlight[];
  className?: string;
}

export default function HighlightableContent({
  content,
  lessonId,
  initialHighlights,
  className = "",
}: HighlightableContentProps) {
  const [htmlContent, setHtmlContent] = useState("");
  const [highlights, setHighlights] = useState(initialHighlights);
  const [toolbarState, setToolbarState] = useState<{
    position: { x: number; y: number };
    selection: { text: string; start: number; end: number };
  } | null>(null);

  const [draftColor, setDraftColor] = useState("#FFD700");
  const [draftNote, setDraftNote] = useState("");

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const processContent = async () => {
      if (!content) return;
      try {
        const file = await remark().use(html).process(content);
        setHtmlContent(String(file));
      } catch (error) {
        console.error("Error processing markdown:", error);
        setHtmlContent(content || "");
      }
    };
    processContent();
  }, [content]);

  useEffect(() => {
    if (!htmlContent || !containerRef.current) return;
    containerRef.current.innerHTML = htmlContent;

    const textNodes: { node: Text; start: number; end: number }[] = [];
    const walker = document.createTreeWalker(containerRef.current, NodeFilter.SHOW_TEXT, null);

    let offset = 0;
    let node = walker.nextNode();
    while (node) {
      const length = node.textContent?.length || 0;
      textNodes.push({ node: node as Text, start: offset, end: offset + length });
      offset += length;
      node = walker.nextNode();
    }

    const sortedHighlights = [...highlights].sort((a, b) => a.startOffset - b.startOffset);

    [...sortedHighlights].reverse().forEach(h => {
      const startNodeData = textNodes.find(n => h.startOffset >= n.start && h.startOffset < n.end);
      const endNodeData = textNodes.find(n => h.endOffset > n.start && h.endOffset <= n.end);

      if (startNodeData && endNodeData && startNodeData.node === endNodeData.node) {
        try {
          const range = document.createRange();
          const start = h.startOffset - startNodeData.start;
          const end = h.endOffset - startNodeData.start;

          if (end > start) {
            range.setStart(startNodeData.node, start);
            range.setEnd(startNodeData.node, end);

            const mark = document.createElement('mark');
            mark.style.backgroundColor = h.color;
            mark.className = "cursor-pointer transition-opacity hover:opacity-80 relative group";
            mark.onclick = async (e) => {
              e.stopPropagation();
              if (confirm("Delete this highlight?")) {
                const result = await deleteHighlight(h.id);
                if (result.success) setHighlights(prev => prev.filter(item => item.id !== h.id));
              }
            };
            if (h.note) mark.title = h.note;
            range.surroundContents(mark);
          }
        } catch (e) {
          console.warn("Failed to apply highlight:", h.id, e);
        }
      }
    });
  }, [htmlContent, highlights]);

  const handleMouseUp = () => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed || !containerRef.current) return;
    if (!containerRef.current.contains(selection.anchorNode)) return;

    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    const text = selection.toString();
    if (!text.trim()) return;

    const preSelectionRange = range.cloneRange();
    preSelectionRange.selectNodeContents(containerRef.current);
    preSelectionRange.setEnd(range.startContainer, range.startOffset);
    const startStr = preSelectionRange.toString();

    setToolbarState({
      position: { x: rect.left + rect.width / 2, y: rect.top },
      selection: { text, start: startStr.length, end: startStr.length + text.length },
    });
    setDraftColor("#FFD700");
    setDraftNote("");
  };

  const handleSaveHighlight = async () => {
    if (!toolbarState) return;
    const { text, start, end } = toolbarState.selection;

    const tempId = Date.now().toString();
    const newHighlight = {
      id: tempId, lessonId, userId: "curr", selectedText: text,
      startOffset: start, endOffset: end, color: draftColor, note: draftNote,
      createdAt: new Date(), updatedAt: new Date(),
    };

    setHighlights(prev => [...prev, newHighlight]);
    setToolbarState(null);
    window.getSelection()?.removeAllRanges();

    const result = await createHighlight(lessonId, {
      selectedText: text, startOffset: start, endOffset: end, color: draftColor, note: draftNote
    });

    if (result.success && result.highlight) {
      setHighlights(prev => prev.map(h => h.id === tempId ? result.highlight! : h));
    } else {
      setHighlights(prev => prev.filter(h => h.id !== tempId));
    }
  };

  return (
    <div className="relative group">
      <div
        ref={containerRef}
        className={`prose prose-lg dark:prose-invert max-w-none ${className}`}
        onMouseUp={handleMouseUp}
      />
      {toolbarState && (
        <HighlightToolbar
          position={toolbarState.position}
          initialColor={draftColor}
          initialNote={draftNote}
          onColorSelect={setDraftColor}
          onNoteChange={setDraftNote}
          onSave={handleSaveHighlight}
          onCancel={() => {
            setToolbarState(null);
            window.getSelection()?.removeAllRanges();
          }}
        />
      )}
    </div>
  );
}

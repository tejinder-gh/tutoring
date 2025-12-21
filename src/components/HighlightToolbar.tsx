"use client";

import { Check, MessageSquare, Trash2 } from "lucide-react";

interface HighlightToolbarProps {
  position: { x: number; y: number } | null;
  onColorSelect: (color: string) => void;
  onDelete?: () => void;
  onNoteChange?: (note: string) => void;
  onSave?: () => void;
  onCancel: () => void;
  initialColor?: string;
  initialNote?: string;
}

const HIGHLIGHT_COLORS = [
  "#FFD700", // Gold/Yellow
  "#90EE90", // Light Green
  "#87CEEB", // Sky Blue
  "#FFB6C1", // Light Pink
  "#D8BFD8", // Thistle/Purple
];

export default function HighlightToolbar({
  position,
  onColorSelect,
  onDelete,
  onNoteChange,
  onSave,
  onCancel,
  initialColor = "#FFD700",
  initialNote = "",
}: HighlightToolbarProps) {
  if (!position) return null;

  return (
    <div
      className="fixed z-50 p-2 bg-card border border-border shadow-lg rounded-xl flex flex-col gap-2 w-64 animate-in fade-in zoom-in-95 duration-200"
      style={{
        left: position.x,
        top: position.y,
        transform: "translate(-50%, -100%) translateY(-10px)",
      }}
    >
      {/* Colors */}
      <div className="flex items-center justify-between gap-1">
        <div className="flex items-center gap-1">
          {HIGHLIGHT_COLORS.map((color) => (
            <button
              key={color}
              onClick={() => onColorSelect(color)}
              className={`w-6 h-6 rounded-full border border-border transition-transform hover:scale-110 ${initialColor === color ? "ring-2 ring-primary ring-offset-1" : ""
                }`}
              style={{ backgroundColor: color }}
              title="Select color"
            />
          ))}
        </div>

        {onDelete && (
          <button
            onClick={onDelete}
            className="p-1.5 text-text-muted hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
            title="Delete highlight"
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>

      {/* Note Input */}
      {onNoteChange && (
        <div className="relative">
          <MessageSquare
            size={14}
            className="absolute left-2.5 top-2.5 text-text-muted"
          />
          <textarea
            placeholder="Add a note..."
            defaultValue={initialNote}
            onChange={(e) => onNoteChange(e.target.value)}
            className="w-full pl-8 pr-2 py-2 text-xs bg-background border border-border rounded-lg min-h-[60px] resize-none focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-end gap-2 mt-1">
        <button
          onClick={onCancel}
          className="p-1 px-2 text-xs font-medium text-text-muted hover:text-foreground hover:bg-accent/20 rounded-lg transition-colors"
        >
          Cancel
        </button>
        {onSave && (
          <button
            onClick={onSave}
            className="flex items-center gap-1 p-1 px-3 text-xs font-bold bg-primary text-black rounded-lg hover:opacity-90 transition-opacity"
          >
            <Check size={12} />
            Save
          </button>
        )}
      </div>

      {/* Pointer arrow */}
      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[8px] border-t-border"
      />
      <div
        className="absolute bottom-[1px] left-1/2 -translate-x-1/2 translate-y-full w-0 h-0 border-l-[7px] border-l-transparent border-r-[7px] border-r-transparent border-t-[7px] border-t-card"
      />
    </div>
  );
}

"use client";

import { toggleBookmark } from "@/lib/actions/annotations";
import { Bookmark } from "lucide-react";
import { useState } from "react";

interface BookmarkButtonProps {
  lessonId: string;
  initialIsBookmarked?: boolean;
}

export default function BookmarkButton({
  lessonId,
  initialIsBookmarked = false,
}: BookmarkButtonProps) {
  const [isBookmarked, setIsBookmarked] = useState(initialIsBookmarked);
  const [isLoading, setIsLoading] = useState(false);

  const handleToggle = async () => {
    setIsLoading(true);
    try {
      const result = await toggleBookmark(lessonId);
      if (result.success && result.isBookmarked !== undefined) {
        setIsBookmarked(result.isBookmarked);
      }
    } catch (error) {
      console.error("Error toggling bookmark:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggle}
      disabled={isLoading}
      className="p-2 rounded-full hover:bg-accent/20 transition-colors disabled:opacity-50"
      title={isBookmarked ? "Remove Bookmark" : "Bookmark Lesson"}
    >
      <Bookmark
        size={20}
        className={
          isBookmarked
            ? "fill-primary text-primary"
            : "text-text-muted hover:text-primary"
        }
      />
    </button>
  );
}

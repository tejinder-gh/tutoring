"use client";

import { createTeacherCurriculumDraft } from "@/app/actions/curriculum-versioning";
import { Copy } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

interface CustomizeCurriculumButtonProps {
  courseId: string;
  hasExistingVersion?: boolean;
}

export function CustomizeCurriculumButton({ courseId, hasExistingVersion }: CustomizeCurriculumButtonProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleCustomize = () => {
    startTransition(async () => {
      try {
        const result = await createTeacherCurriculumDraft(courseId);
        if (result.success) {
          router.push(`/teacher/courses/${courseId}/customize`);
        }
      } catch (error) {
        console.error("Failed to create draft:", error);
        alert("Failed to start customization. Please try again.");
      }
    });
  };

  return (
    <button
      onClick={handleCustomize}
      disabled={isPending}
      className={`inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background bg-primary text-primary-foreground hover:bg-primary/90 h-10 py-2 px-4 ${hasExistingVersion ? "bg-amber-600 hover:bg-amber-700 text-white" : ""}`}
    >
      <Copy className="mr-2 h-4 w-4" />
      {hasExistingVersion ? "Edit My Version" : "Customize Curriculum"}
    </button>
  );
}

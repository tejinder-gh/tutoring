"use client";

import { submitAssignment } from "@/lib/actions/submission";
import { UploadButton } from "@/utils/uploadthing";
import { CheckCircle, FileText } from "lucide-react";
import { useState } from "react";

export default function AssignmentCard({ assignment, userId }: { assignment: any, userId: string }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submission = assignment.submissions[0]; // Assuming one submission per assignment for now

  const handleUploadComplete = async (res: any) => {
    setIsSubmitting(true);
    const fileUrl = res[0].url;
    await submitAssignment(assignment.id, userId, fileUrl);
    setIsSubmitting(false);
  };

  return (
    <div className="bg-accent/20 border border-border p-6 rounded-xl flex flex-col h-full">
      <div className="mb-4 flex-1">
        <div className="flex justify-between items-start mb-2">
            <h3 className="font-bold text-lg">{assignment.title}</h3>
            {submission ? (
                 <span className="text-green-500 bg-green-500/10 px-2 py-1 rounded text-xs font-bold flex items-center gap-1">
                    <CheckCircle size={12} /> Done
                 </span>
            ) : (
                <span className="text-yellow-500 bg-yellow-500/10 px-2 py-1 rounded text-xs font-bold">Pending</span>
            )}
        </div>
        <p className="text-sm text-text-muted mb-4">{assignment.description}</p>
        <p className="text-xs text-text-muted">
             Due: {assignment.dueDate ? new Date(assignment.dueDate).toLocaleDateString() : 'No date'}
        </p>
      </div>

      <div className="mt-auto pt-4 border-t border-border">
         {submission ? (
             <div className="text-sm">
                 <p className="font-medium mb-1">Submitted File:</p>
                 <a href={submission.fileUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center gap-2">
                    <FileText size={16} /> View Submission
                 </a>
                 {submission.grade && (
                     <div className="mt-2 p-2 bg-primary/10 rounded">
                         <span className="font-bold text-primary">Grade: {submission.grade}/100</span>
                     </div>
                 )}
             </div>
         ) : (
             <div>
                 <UploadButton
                    endpoint="assignmentSubmission"
                    onClientUploadComplete={handleUploadComplete}
                    onUploadError={(error: Error) => {
                        alert(`ERROR! ${error.message}`);
                    }}
                 />
             </div>
         )}
      </div>
    </div>
  );
}

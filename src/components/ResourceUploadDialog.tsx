"use client";

import { createResource } from "@/lib/actions/resources";
import { UploadButton } from "@/utils/uploadthing";
import { ResourceType } from "@prisma/client";
import { AlertCircle, FileText, Link as LinkIcon, Loader2, X } from "lucide-react";
import { useState } from "react";

interface ResourceUploadDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialType?: ResourceType;
}

export default function ResourceUploadDialog({
  isOpen,
  onClose,
  onSuccess,
  initialType = "DOCUMENT",
}: ResourceUploadDialogProps) {
  const [activeTab, setActiveTab] = useState<"UPLOAD" | "LINK">("UPLOAD");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [url, setUrl] = useState("");
  const [type, setType] = useState<ResourceType>(initialType);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<{
    url: string;
    name: string;
    size: number;
    type: string;
  } | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      if (activeTab === "UPLOAD" && !uploadedFile) {
        throw new Error("Please upload a file");
      }

      if (activeTab === "LINK" && !url) {
        throw new Error("Please enter a URL");
      }

      const resourceUrl = activeTab === "UPLOAD" ? uploadedFile!.url : url;
      const resourceType = activeTab === "UPLOAD"
        ? determineResourceType(uploadedFile!.type)
        : "LINK";

      // Override with user selection if it's explicitly set (e.g. for forced video)
      const finalType = activeTab === "LINK" ? type : resourceType;

      const result = await createResource({
        title,
        description,
        url: resourceUrl,
        type: finalType,
        fileSize: uploadedFile?.size,
        mimeType: uploadedFile?.type,
        isPublic: true, // Default to public
      });

      if (!result.success) {
        throw new Error(result.error || "Failed to create resource");
      }

      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const determineResourceType = (mimeType: string): ResourceType => {
    if (mimeType.startsWith("video/")) return "VIDEO";
    if (mimeType.startsWith("image/")) return "IMAGE";
    if (mimeType === "application/pdf") return "PDF";
    return "DOCUMENT";
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <div className="bg-card border border-border rounded-xl w-full max-w-lg shadow-xl flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-xl font-bold text-foreground">Add New Resource</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-accent/20 rounded-lg transition-colors"
          >
            <X size={20} className="text-text-muted" />
          </button>
        </div>

        <div className="flex border-b border-border">
          <button
            className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === "UPLOAD"
              ? "text-primary border-b-2 border-primary"
              : "text-text-muted hover:text-primary hover:bg-accent/5"
              }`}
            onClick={() => setActiveTab("UPLOAD")}
          >
            <span className="flex items-center justify-center gap-2">
              <FileText size={16} /> Upload File
            </span>
          </button>
          <button
            className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === "LINK"
              ? "text-primary border-b-2 border-primary"
              : "text-text-muted hover:text-primary hover:bg-accent/5"
              }`}
            onClick={() => setActiveTab("LINK")}
          >
            <span className="flex items-center justify-center gap-2">
              <LinkIcon size={16} /> External Link
            </span>
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-lg flex items-center gap-2 text-red-600 text-sm">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          <form id="resource-form" onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-muted mb-1">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Course Syllabus"
                className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-muted mb-1">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Optional description..."
                rows={3}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors resize-none"
              />
            </div>

            {activeTab === "UPLOAD" ? (
              <div className="space-y-4">
                {!uploadedFile ? (
                  <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary/50 transition-colors bg-accent/5">
                    <UploadButton
                      endpoint="resourceFile"
                      onClientUploadComplete={(res) => {
                        const file = res[0];
                        setUploadedFile({
                          url: file.url,
                          name: file.name,
                          size: file.size,
                          type: file.type,
                        });
                        // Auto-fill title if empty
                        if (!title) setTitle(file.name);
                        setError(null);
                      }}
                      onUploadError={(error: Error) => {
                        setError(`Upload failed: ${error.message}`);
                      }}
                      appearance={{
                        button: "bg-primary text-primary-foreground font-bold hover:opacity-90",
                        allowedContent: "text-text-muted text-xs"
                      }}
                    />
                  </div>
                ) : (
                  <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="p-2 bg-green-500/20 rounded-lg text-green-600">
                        <FileText size={20} />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-foreground truncate">{uploadedFile.name}</p>
                        <p className="text-xs text-text-muted">
                          {(uploadedFile.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setUploadedFile(null)}
                      className="text-text-muted hover:text-red-500 transition-colors"
                    >
                      <X size={18} />
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text-muted mb-1">
                    Resource URL <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-muted mb-1">
                    Resource Type
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as ResourceType)}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg outline-none"
                  >
                    <option value="LINK">Link</option>
                    <option value="VIDEO">Video</option>
                    <option value="DOCUMENT">Document</option>
                  </select>
                </div>
              </div>
            )}
          </form>
        </div>

        <div className="p-4 border-t border-border flex justify-end gap-3 sticky bottom-0 bg-card">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 hover:bg-accent/20 text-foreground font-medium rounded-lg transition-colors"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            form="resource-form"
            disabled={isSubmitting || (activeTab === "UPLOAD" && !uploadedFile)}
            className="flex items-center gap-2 px-6 py-2 bg-primary text-primary-foreground font-bold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Saving...
              </>
            ) : (
              "Add Resource"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

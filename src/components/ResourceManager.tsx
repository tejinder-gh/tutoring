"use client";

import {
  deleteResource,
  toggleResourceVisibility
} from "@/lib/actions/resources";
import { ResourceType } from "@prisma/client";
import {
  Download,
  Eye,
  EyeOff,
  FileText,
  Filter,
  Image,
  Link2,
  Plus,
  Trash2,
  Video
} from "lucide-react";
import { useState } from "react";
import ResourceUploadDialog from "./ResourceUploadDialog";

type ResourceWithRelations = {
  id: string;
  title: string;
  description: string | null;
  url: string;
  type: ResourceType;
  fileSize: number | null;
  mimeType: string | null;
  isPublic: boolean;
  createdAt: Date;
  uploadedBy: { id: string; name: string | null; email: string | null } | null;
  course: { id: string; title: string } | null;
  lesson: { id: string; title: string } | null;
  quiz: { id: string; title: string } | null;
  assignment: { id: string; title: string } | null;
};

const resourceIcons: Record<ResourceType, React.ElementType> = {
  VIDEO: Video,
  DOCUMENT: FileText,
  PDF: FileText,
  LINK: Link2,
  IMAGE: Image,
};

const resourceColors: Record<ResourceType, string> = {
  VIDEO: "text-purple-500",
  DOCUMENT: "text-blue-500",
  PDF: "text-red-500",
  LINK: "text-green-500",
  IMAGE: "text-yellow-500",
};

export default function ResourceManager({
  resources: initialResources,
}: {
  resources: ResourceWithRelations[];
}) {
  const [resources, setResources] = useState(initialResources);
  const [filter, setFilter] = useState<ResourceType | "ALL">("ALL");
  const [showPublicOnly, setShowPublicOnly] = useState(false);
  const [isAddingNew, setIsAddingNew] = useState(false);

  const filteredResources = resources.filter((resource) => {
    if (filter !== "ALL" && resource.type !== filter) return false;
    if (showPublicOnly && !resource.isPublic) return false;
    return true;
  });

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this resource?")) return;

    const result = await deleteResource(id);
    if (result.success) {
      setResources((prev) => prev.filter((r) => r.id !== id));
    } else {
      alert(result.error || "Failed to delete resource");
    }
  };

  const handleToggleVisibility = async (id: string, currentState: boolean) => {
    const result = await toggleResourceVisibility(id, !currentState);
    if (result.success && result.resource) {
      setResources((prev) =>
        prev.map((r) => (r.id === id ? { ...r, isPublic: !currentState } : r))
      );
    } else {
      alert(result.error || "Failed to toggle visibility");
    }
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return "Unknown";
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    const mb = kb / 1024;
    return `${mb.toFixed(1)} MB`;
  };

  const getEntityName = (resource: ResourceWithRelations) => {
    if (resource.course) return `Course: ${resource.course.title}`;
    if (resource.lesson) return `Lesson: ${resource.lesson.title}`;
    if (resource.quiz) return `Quiz: ${resource.quiz.title}`;
    if (resource.assignment) return `Assignment: ${resource.assignment.title}`;
    return "Not linked";
  };

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-card border border-border rounded-xl">
        <div className="flex items-center gap-3">
          <Filter size={20} className="text-text-muted" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as ResourceType | "ALL")}
            className="px-3 py-2 bg-background border border-border rounded-lg text-sm"
          >
            <option value="ALL">All Types</option>
            <option value="VIDEO">Videos</option>
            <option value="DOCUMENT">Documents</option>
            <option value="PDF">PDFs</option>
            <option value="LINK">Links</option>
            <option value="IMAGE">Images</option>
          </select>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={showPublicOnly}
              onChange={(e) => setShowPublicOnly(e.target.checked)}
              className="rounded"
            />
            <span className="text-text-muted">Public only</span>
          </label>
        </div>

        <button
          onClick={() => setIsAddingNew(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-black font-bold rounded-lg hover:opacity-90 transition-opacity"
        >
          <Plus size={18} />
          Add Resource
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 bg-card border border-border rounded-xl">
          <p className="text-sm text-text-muted mb-1">Total Resources</p>
          <p className="text-2xl font-black text-foreground">
            {resources.length}
          </p>
        </div>
        <div className="p-4 bg-card border border-border rounded-xl">
          <p className="text-sm text-text-muted mb-1">Public</p>
          <p className="text-2xl font-black text-green-500">
            {resources.filter((r) => r.isPublic).length}
          </p>
        </div>
        <div className="p-4 bg-card border border-border rounded-xl">
          <p className="text-sm text-text-muted mb-1">Private</p>
          <p className="text-2xl font-black text-yellow-500">
            {resources.filter((r) => !r.isPublic).length}
          </p>
        </div>
        <div className="p-4 bg-card border border-border rounded-xl">
          <p className="text-sm text-text-muted mb-1">Linked</p>
          <p className="text-2xl font-black text-primary">
            {
              resources.filter(
                (r) => r.course || r.lesson || r.quiz || r.assignment
              ).length
            }
          </p>
        </div>
      </div>

      {/* Resources Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-accent/20">
                <th className="text-left px-4 py-3 text-sm font-bold text-foreground">
                  Resource
                </th>
                <th className="text-left px-4 py-3 text-sm font-bold text-foreground">
                  Type
                </th>
                <th className="text-left px-4 py-3 text-sm font-bold text-foreground">
                  Linked To
                </th>
                <th className="text-left px-4 py-3 text-sm font-bold text-foreground">
                  Size
                </th>
                <th className="text-left px-4 py-3 text-sm font-bold text-foreground">
                  Visibility
                </th>
                <th className="text-right px-4 py-3 text-sm font-bold text-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredResources.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-text-muted">
                    No resources found. Create one to get started!
                  </td>
                </tr>
              ) : (
                filteredResources.map((resource) => {
                  const Icon = resourceIcons[resource.type];
                  const color = resourceColors[resource.type];

                  return (
                    <tr
                      key={resource.id}
                      className="border-b border-border hover:bg-accent/10 transition-colors"
                    >
                      <td className="px-4 py-4">
                        <div className="flex items-start gap-3">
                          <div
                            className={`w-10 h-10 rounded-lg bg-accent/30 flex items-center justify-center shrink-0 ${color}`}
                          >
                            <Icon size={20} />
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-foreground truncate">
                              {resource.title}
                            </p>
                            {resource.description && (
                              <p className="text-sm text-text-muted line-clamp-1">
                                {resource.description}
                              </p>
                            )}
                            {resource.uploadedBy && (
                              <p className="text-xs text-text-muted mt-1">
                                by {resource.uploadedBy.name}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className="inline-flex items-center px-2 py-1 rounded-full bg-accent/30 text-xs font-semibold">
                          {resource.type}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-sm text-text-muted">
                          {getEntityName(resource)}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-sm text-text-muted">
                          {formatFileSize(resource.fileSize)}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <button
                          onClick={() =>
                            handleToggleVisibility(
                              resource.id,
                              resource.isPublic
                            )
                          }
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold transition-colors ${resource.isPublic
                            ? "bg-green-500/20 text-green-600"
                            : "bg-yellow-500/20 text-yellow-600"
                            }`}
                        >
                          {resource.isPublic ? (
                            <>
                              <Eye size={12} /> Public
                            </>
                          ) : (
                            <>
                              <EyeOff size={12} /> Private
                            </>
                          )}
                        </button>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <a
                            href={resource.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 hover:bg-accent/30 rounded-lg transition-colors"
                            title="View resource"
                          >
                            <Download size={16} className="text-primary" />
                          </a>
                          <button
                            onClick={() => handleDelete(resource.id)}
                            className="p-2 hover:bg-red-500/10 rounded-lg transition-colors"
                            title="Delete resource"
                          >
                            <Trash2 size={16} className="text-red-500" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Resource Modal */}
      <ResourceUploadDialog
        isOpen={isAddingNew}
        onClose={() => setIsAddingNew(false)}
        onSuccess={() => {
          // Refresh the page to show new resource
          window.location.reload();
        }}
      />
    </div>
  );
}

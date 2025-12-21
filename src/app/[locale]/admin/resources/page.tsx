import { auth } from "@/auth";
import ResourceManager from "@/components/ResourceManager";
import { getAllResources } from "@/lib/actions/resources";
import { redirect } from "next/navigation";

export default async function ResourcesPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  // TODO: Add proper permission check for admin/teacher roles

  const resources = await getAllResources();

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-black text-foreground mb-2">
            Resource Library
          </h1>
          <p className="text-text-muted">
            Manage files, videos, and links that can be attached to courses, lessons, quizzes, and assignments
          </p>
        </div>

        {/* Resource Manager Component */}
        <ResourceManager resources={resources} />
      </div>
    </div>
  );
}


import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function CreateAssignmentPage() {
  const session = await auth();
  if (!session?.user) redirect('/login');

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">Create New Assignment</h1>
      <p className="text-text-muted mb-8">Select a course and module to assign work to students.</p>

      <div className="bg-accent/10 border border-primary/20 p-8 rounded-xl text-center">
        <p className="text-lg font-medium">Assignment creation wizard coming soon.</p>
        <p className="text-sm text-text-muted mt-2">Please use the Curriculum Manager in the Course details to add assignments for now.</p>
      </div>
    </div>
  );
}

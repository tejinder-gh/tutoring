import { getEffectiveCurriculum } from "@/app/actions/curriculum-versioning";
import { auth } from "@/auth";
import { CurriculumEditor } from "@/components/curriculum/CurriculumEditor";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";

// Force dynamic since we use auth and DB
export const dynamic = 'force-dynamic';

export default async function CustomizeCurriculumPage({ params }: { params: Promise<{ courseId: string }> }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { courseId } = await params;

  // Verify Teacher Access
  const teacherProfile = await prisma.teacherProfile.findUnique({
    where: { userId: session.user.id }
  });

  if (!teacherProfile) {
    return (
      <div className="p-8 text-center text-red-600">
        Only teachers can access this page.
      </div>
    );
  }

  const curriculum = await getEffectiveCurriculum(courseId);

  // If fetch failed or user doesn't own this version (impossible via getEffectiveCurriculum logic for teacher but good to check)
  if (!curriculum) {
    return notFound();
  }

  // Check if this is truly the teacher's draft/version
  if (curriculum.teacherId !== teacherProfile.id) {
    return (
      <div className="p-8 text-center text-amber-600">
        <h1 className="text-xl font-bold mb-2">No Custom Version Found</h1>
        <p>You need to create a custom version first.</p>
        {/* Redirect back or provide button? Button exists on main page. */}
        <a href={`/teacher/courses/${courseId}`} className="text-blue-600 underline mt-4 inline-block">Go back</a>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 h-screen flex flex-col">
      <div className="mb-4 flex items-center justify-between shrink-0">
        <h1 className="text-2xl font-bold">Customize Curriculum</h1>
        <a href={`/teacher/courses/${courseId}`} className="text-sm text-gray-500 hover:text-gray-900">
          Exit Editor
        </a>
      </div>

      <CurriculumEditor curriculum={curriculum} courseId={courseId} />
    </div>
  );
}

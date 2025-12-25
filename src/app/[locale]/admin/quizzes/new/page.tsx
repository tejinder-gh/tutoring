import { requirePermission } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import CreateQuizForm from "./CreateQuizForm";

export const dynamic = "force-dynamic";

export default async function NewQuizPage() {
  await requirePermission("manage", "course");

  // Get courses for dropdown
  // Get courses for dropdown
  const coursesData = await prisma.course.findMany({
    where: { isActive: true },
    include: {
      curriculum: {
        include: {
          modules: {
            include: {
              lessons: { select: { id: true, title: true } },
            },
            orderBy: { order: "asc" },
          },
        }
      }
    },
    orderBy: { title: "asc" },
  });

  const courses = coursesData.map(c => ({
    ...c,
    modules: c.curriculum?.modules || []
  }));

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Create Quiz</h1>
        <p className="text-text-muted">
          Create a new quiz for student assessment
        </p>
      </div>

      <CreateQuizForm courses={courses} />
    </div>
  );
}

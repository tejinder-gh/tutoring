import { prisma } from "@/lib/prisma";
import { Plus } from "lucide-react";
import Link from "next/link";

export const dynamic = 'force-dynamic';

export default async function CoursesPage() {
  const courses = await prisma.course.findMany({
    include: {
      _count: {
        select: { enrollments: true }
      },
      curriculums: { // Changed from curriculum to curriculums
        where: { teacherId: null }, // Added where clause
        include: {
          _count: {
            select: { modules: true, assignments: true }
          }
        },
        take: 1 // Added take: 1
      }
    },
    orderBy: { createdAt: "desc" }, // Changed orderBy field and direction
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-6"> {/* Changed mb-8 to mb-6 */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Courses Management</h1> {/* Changed h1 text */}
          {/* Removed <p className="text-text-muted">Manage courses, modules, and lessons.</p> */}
        </div>
        <Link href="/admin/courses/new">
          <button className="flex items-center gap-2 bg-primary text-black px-4 py-2 rounded-lg font-semibold hover:opacity-90 transition-all">
            <Plus className="mr-2 h-4 w-4" /> New Course
          </button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course: any) => (
          <Link
            href={`/admin/courses/${course.id}`}
            key={course.id}
            className="group block bg-accent/20 border border-border p-6 rounded-xl hover:border-primary/50 transition-all"
          >
            <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">{course.title}</h3>
            <p className="text-sm text-text-muted line-clamp-2 mb-4 h-10">
              {course.description || "No description provided."}
            </p>

            <div className="flex gap-4 text-sm text-text-muted">
              <div>
                <span className="block font-bold text-foreground">{course.curriculum?._count.modules || 0}</span>
                Modules
              </div>
              <div>
                <span className="block font-bold text-foreground">{course.curriculum?._count.assignments || 0}</span>
                Assignments
              </div>
              <div>
                <span className="block font-bold text-foreground">{course._count.enrollments}</span>
                Students
              </div>
            </div>
          </Link>
        ))}

        {courses.length === 0 && (
          <div className="col-span-full text-center py-12 text-text-muted border border-dashed border-border rounded-xl">
            <p>No courses found. Create your first course to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
}

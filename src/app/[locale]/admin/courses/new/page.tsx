import { createCourse } from "@/lib/actions/academic";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NewCoursePage() {
  return (
    <div className="max-w-2xl mx-auto">
        <div className="mb-8">
            <Link href="/admin/courses" className="flex items-center gap-2 text-text-muted hover:text-foreground mb-4">
                <ArrowLeft size={16} /> Back to Courses
            </Link>
            <h1 className="text-3xl font-bold">Create New Course</h1>
        </div>

      <form action={createCourse} className="space-y-6 bg-accent/10 p-8 rounded-xl border border-border">
        <div>
          <label htmlFor="title" className="block text-sm font-medium mb-2">
            Course Title
          </label>
          <input
            type="text"
            name="title"
            id="title"
            required
            placeholder="e.g. Full Stack Web Development"
            className="w-full bg-background border border-border rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary focus:outline-none"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium mb-2">
            Description
          </label>
          <textarea
            name="description"
            id="description"
            rows={4}
            placeholder="Brief overview of what students will learn..."
            className="w-full bg-background border border-border rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary focus:outline-none"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-primary text-black font-bold py-3 rounded-lg hover:opacity-90 transition-all"
        >
          Create Course
        </button>
      </form>
    </div>
  );
}

import { createTeacher } from "@/lib/actions/staff";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NewTeacherPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <Link href="/admin/teachers" className="flex items-center gap-2 text-text-muted hover:text-foreground mb-4">
          <ArrowLeft size={16} /> Back to Staff
        </Link>
        <h1 className="text-3xl font-bold">Add New Teacher</h1>
      </div>

      <form action={createTeacher} className="space-y-6 bg-accent/10 p-8 rounded-xl border border-border">
        <div>
          <label className="block text-sm font-medium mb-2">Full Name</label>
          <input
            type="text" name="name" required
            className="w-full bg-background border border-border rounded-lg px-4 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Email</label>
          <input
            type="email" name="email" required
            className="w-full bg-background border border-border rounded-lg px-4 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Password</label>
          <input
            type="password" name="password" required minLength={6}
            placeholder="Initial password"
            className="w-full bg-background border border-border rounded-lg px-4 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Domain</label>
          <input
            type="text" name="domain" required
            placeholder="e.g. Frontend, Mathematics"
            className="w-full bg-background border border-border rounded-lg px-4 py-2"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-primary text-black font-bold py-3 rounded-lg hover:opacity-90 transition-all"
        >
          Create Teacher Account
        </button>
      </form>
    </div>
  );
}

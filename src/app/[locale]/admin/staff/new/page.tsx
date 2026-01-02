"use client";

import { createStaff } from "@/app/actions/staff";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

const departments = [
  "Administration",
  "Finance",
  "Human Resources",
  "IT Support",
  "Marketing",
  "Operations",
  "Student Services",
  "Other",
];

export default function NewStaffPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const formData = new FormData(e.currentTarget);

    try {
      const result = await createStaff({
        name: formData.get("name") as string,
        email: formData.get("email") as string,
        department: formData.get("department") as string,
        designation: formData.get("designation") as string,
      });
      if (result.success) {
        router.push("/admin/staff");
      } else {
        setError(result.error || "Failed to create staff member");
        setIsSubmitting(false);
      }
    } catch (err) {
      setError("An unexpected error occurred");
      setIsSubmitting(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Link
        href="/admin/staff"
        className="inline-flex items-center gap-2 text-sm text-text-muted hover:text-primary mb-6"
      >
        <ArrowLeft size={16} />
        Back to Staff
      </Link>

      <div className="bg-card border border-border rounded-xl p-8">
        <h1 className="text-2xl font-bold mb-2">Add New Staff Member</h1>
        <p className="text-text-muted mb-8">
          Enter the details for the new staff member
        </p>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg p-4 mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                required
                placeholder="Enter full name"
                className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                required
                placeholder="email@example.com"
                className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition"
              />
            </div>
          </div>

          {/* Department & Designation */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Department <span className="text-red-500">*</span>
              </label>
              <select
                name="department"
                required
                className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition"
              >
                <option value="">Select department...</option>
                {departments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Designation <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="designation"
                required
                placeholder="e.g., Office Manager"
                className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition"
              />
            </div>
          </div>

          {/* Joining Date & Base Salary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Joining Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="joiningDate"
                required
                defaultValue={new Date().toISOString().split("T")[0]}
                className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Base Salary (₹)
              </label>
              <input
                type="number"
                name="baseSalary"
                placeholder="e.g., 30000"
                className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition"
              />
            </div>
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium mb-2">Phone Number</label>
            <input
              type="tel"
              name="phone"
              placeholder="+91 98765 43210"
              className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition"
            />
          </div>

          {/* Temporary Password Notice */}
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
            <p className="text-sm text-blue-400">
              <strong>Note:</strong> A temporary password will be generated and should be
              shared securely with the staff member. They can change it after their first login.
            </p>
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Link
              href="/admin/staff"
              className="px-6 py-3 text-text-muted hover:text-foreground transition"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-3 bg-primary text-black font-medium rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
            >
              {isSubmitting && <Loader2 size={16} className="animate-spin" />}
              {isSubmitting ? "Creating..." : "Create Staff Member"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

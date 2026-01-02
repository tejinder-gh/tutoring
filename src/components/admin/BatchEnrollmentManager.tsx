"use client";

import {
  enrollStudentInBatch,
  getEnrollableStudents,
  removeStudentFromBatch,
} from "@/lib/actions/batches";
import { Loader2, Search, Trash2, UserPlus, X } from "lucide-react";
import { useEffect, useState, useTransition } from "react";

interface Student {
  id: string;
  userId: string;
  name: string;
  email: string;
}

interface Enrollment {
  id: string;
  studentProfileId: string;
  studentName: string;
  studentEmail: string;
  status: string;
  discount: number;
  enrolledAt: Date;
}

export function BatchEnrollmentManager({
  batchId,
  initialEnrollments,
}: {
  batchId: string;
  initialEnrollments: Enrollment[];
}) {
  const [enrollments, setEnrollments] = useState(initialEnrollments);
  const [showDialog, setShowDialog] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (showDialog) {
      setIsLoading(true);
      getEnrollableStudents(batchId).then((data) => {
        setStudents(data);
        setIsLoading(false);
      });
    }
  }, [showDialog, batchId]);

  const filteredStudents = students.filter(
    (s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEnroll = (student: Student) => {
    startTransition(async () => {
      try {
        await enrollStudentInBatch(batchId, student.id);
        setStudents((prev) => prev.filter((s) => s.id !== student.id));
        setEnrollments((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            studentProfileId: student.id,
            studentName: student.name,
            studentEmail: student.email,
            status: "ACTIVE",
            discount: 0,
            enrolledAt: new Date(),
          },
        ]);
      } catch (error) {
        alert("Failed to enroll student");
      }
    });
  };

  const handleRemove = (enrollment: Enrollment) => {
    if (!confirm(`Remove ${enrollment.studentName} from this batch?`)) return;

    startTransition(async () => {
      try {
        await removeStudentFromBatch(batchId, enrollment.studentProfileId);
        setEnrollments((prev) =>
          prev.filter((e) => e.studentProfileId !== enrollment.studentProfileId)
        );
      } catch (error) {
        alert("Failed to remove student");
      }
    });
  };

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <div className="p-4 border-b border-border flex justify-between items-center">
        <div>
          <h3 className="font-bold text-lg">Enrolled Students</h3>
          <p className="text-sm text-text-muted">{enrollments.length} students</p>
        </div>
        <button
          onClick={() => setShowDialog(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground font-medium rounded-lg hover:opacity-90 text-sm"
        >
          <UserPlus size={16} />
          Add Student
        </button>
      </div>

      {/* Enrollments Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-accent/30 text-text-muted">
            <tr>
              <th className="text-left p-3 font-medium">Student</th>
              <th className="text-left p-3 font-medium">Enrolled</th>
              <th className="text-left p-3 font-medium">Status</th>
              <th className="text-center p-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {enrollments.map((enrollment) => (
              <tr key={enrollment.id} className="hover:bg-accent/10">
                <td className="p-3">
                  <div className="font-medium">{enrollment.studentName}</div>
                  <div className="text-xs text-text-muted">
                    {enrollment.studentEmail}
                  </div>
                </td>
                <td className="p-3 text-text-muted text-xs">
                  {new Date(enrollment.enrolledAt).toLocaleDateString()}
                </td>
                <td className="p-3">
                  <span
                    className={`text-xs px-2 py-1 rounded font-medium ${enrollment.status === "ACTIVE"
                        ? "bg-green-500/10 text-green-500"
                        : "bg-gray-500/10 text-gray-500"
                      }`}
                  >
                    {enrollment.status}
                  </span>
                </td>
                <td className="p-3 text-center">
                  <button
                    onClick={() => handleRemove(enrollment)}
                    disabled={isPending}
                    className="p-2 hover:bg-red-500/10 text-red-500 rounded transition"
                    title="Remove from batch"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
            {enrollments.length === 0 && (
              <tr>
                <td colSpan={4} className="p-8 text-center text-text-muted">
                  No students enrolled yet. Click &quot;Add Student&quot; to enroll.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add Student Dialog */}
      {showDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowDialog(false)}
          />
          <div className="relative bg-card border border-border rounded-2xl shadow-2xl w-full max-w-md mx-4 max-h-[80vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h2 className="text-lg font-bold">Add Student to Batch</h2>
              <button
                onClick={() => setShowDialog(false)}
                className="p-2 hover:bg-accent rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-4 border-b border-border">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted h-4 w-4" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search students..."
                  className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg text-sm"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-2">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="animate-spin text-primary" size={24} />
                </div>
              ) : filteredStudents.length === 0 ? (
                <div className="text-center py-8 text-text-muted">
                  <UserPlus size={32} className="mx-auto mb-2 opacity-30" />
                  <p>No available students found</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredStudents.map((student) => (
                    <div
                      key={student.id}
                      className="flex items-center justify-between p-3 bg-accent/20 rounded-lg hover:bg-accent/30 transition"
                    >
                      <div>
                        <div className="font-medium">{student.name}</div>
                        <div className="text-xs text-text-muted">
                          {student.email}
                        </div>
                      </div>
                      <button
                        onClick={() => handleEnroll(student)}
                        disabled={isPending}
                        className="px-3 py-1 bg-primary text-primary-foreground rounded text-sm font-medium hover:opacity-90 disabled:opacity-50"
                      >
                        {isPending ? "..." : "Enroll"}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

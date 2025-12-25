import { submitGrade } from "@/lib/actions/grading";
import { prisma } from "@/lib/prisma";
import { ArrowLeft, CheckCircle, FileText } from "lucide-react";
import Link from "next/link";

interface PageProps {
    params: Promise<{ assignmentId: string }>;
}

export default async function GradingPage(props: PageProps) {
    const params = await props.params;
    const assignment = await prisma.assignment.findUnique({
        where: { id: params.assignmentId },
        include: {
            curriculum: {
                include: {
                    course: true
                }
            },
            submissions: {
                include: {
                    student: true
                }
            }
        }
    });

    if (!assignment) return <div>Assignment not found</div>;

    return (
        <div>
            <div className="mb-8">
                <Link href="/teacher/assignments" className="flex items-center gap-2 text-text-muted hover:text-foreground mb-4">
                    <ArrowLeft size={16} /> Back to List
                </Link>
                <h1 className="text-3xl font-bold">{assignment.title}</h1>
                <p className="text-text-muted">{assignment.curriculum?.course.title}</p>
            </div>

            <div className="space-y-6">
                <h2 className="text-xl font-bold">Submissions ({assignment.submissions.length})</h2>

                <div className="grid grid-cols-1 gap-4">
                    {assignment.submissions.map((sub: any) => (
                        <div key={sub.id} className="bg-accent/10 border border-border p-6 rounded-xl">
                            <div className="flex flex-col md:flex-row justify-between gap-6">
                                <div>
                                    <h3 className="font-bold text-lg">{sub.student.name}</h3>
                                    <p className="text-sm text-text-muted mb-2">{sub.student.email}</p>
                                    <a
                                        href={sub.fileUrl}
                                        target="_blank"
                                        className="inline-flex items-center gap-2 text-primary hover:underline"
                                    >
                                        <FileText size={16} /> View Submission File
                                    </a>
                                    <p className="text-xs text-text-muted mt-2">Submitted: {new Date(sub.submittedAt).toLocaleString()}</p>
                                </div>

                                <div className="flex-1 max-w-md bg-background p-4 rounded-lg border border-border">
                                    {sub.grade ? (
                                        <div>
                                            <div className="flex items-center gap-2 text-green-500 mb-2">
                                                <CheckCircle size={18} />
                                                <span className="font-bold">Graded: {sub.grade}/100</span>
                                            </div>
                                            {sub.feedback && (
                                                <p className="text-sm text-text-muted italic border-l-2 border-primary/50 pl-3">&quot;{sub.feedback}&quot;</p>
                                            )}
                                            {/* Optional: Add button to edit grade */}
                                        </div>
                                    ) : (
                                        <form action={submitGrade.bind(null, sub.id)} className="space-y-3">
                                            <div>
                                                <label className="block text-xs font-bold mb-1">Grade (0-100)</label>
                                                <input
                                                    type="number" name="grade" min="0" max="100" required
                                                    className="w-full bg-accent/20 border border-border rounded px-3 py-1 text-sm"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold mb-1">Feedback</label>
                                                <textarea
                                                    name="feedback" rows={2}
                                                    className="w-full bg-accent/20 border border-border rounded px-3 py-1 text-sm"
                                                />
                                            </div>
                                            <button type="submit" className="w-full bg-primary text-black font-bold py-2 rounded text-sm hover:opacity-90">
                                                Submit Grade
                                            </button>
                                        </form>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}

                    {assignment.submissions.length === 0 && (
                        <p className="text-text-muted italic">No submissions yet.</p>
                    )}
                </div>
            </div>
        </div>
    );
}

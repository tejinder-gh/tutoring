import { submitAttendance } from "@/lib/actions/attendance";
import { prisma } from "@/lib/prisma";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

interface PageProps {
    params: Promise<{ batchId: string }>;
}

export default async function MarkAttendancePage(props: PageProps) {
    const params = await props.params;
    const batch = await prisma.batch.findUnique({
        where: { id: params.batchId },
        include: {
            students: {
                include: { user: true },
                orderBy: { user: { name: 'asc' } }
            }
        }
    });

    if (!batch) return <div>Batch not found</div>;

    return (
        <div className="max-w-4xl mx-auto">
            <div className="mb-8">
                <Link href="/teacher/attendance" className="flex items-center gap-2 text-text-muted hover:text-foreground mb-4">
                    <ArrowLeft size={16} /> Back to Batches
                </Link>
                <h1 className="text-3xl font-bold">Mark Attendance</h1>
                <p className="text-text-muted">{batch.name}</p>
            </div>

            <form action={submitAttendance.bind(null, batch.id)} className="bg-accent/10 border border-border rounded-xl p-6">
                <div className="mb-6">
                    <label className="block text-sm font-bold mb-2">Date</label>
                    <input
                        type="date"
                        name="date"
                        required
                        defaultValue={new Date().toISOString().split('T')[0]}
                        className="bg-background border border-border px-4 py-2 rounded-lg"
                    />
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-border/50 text-text-muted text-sm">
                                <th className="py-3 px-4">Student</th>
                                <th className="py-3 px-4">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/30">
                            {batch.students.map(profile => (
                                <tr key={profile.id} className="hover:bg-accent/5">
                                    <td className="py-3 px-4 font-medium">{profile.user.name}</td>
                                    <td className="py-3 px-4">
                                        <div className="flex gap-4">
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input type="radio" name={`status_${profile.user.id}`} value="PRESENT" defaultChecked className="accent-green-500 w-4 h-4" />
                                                <span className="text-sm">Present</span>
                                            </label>
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input type="radio" name={`status_${profile.user.id}`} value="ABSENT" className="accent-red-500 w-4 h-4" />
                                                <span className="text-sm">Absent</span>
                                            </label>
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input type="radio" name={`status_${profile.user.id}`} value="LATE" className="accent-yellow-500 w-4 h-4" />
                                                <span className="text-sm">Late</span>
                                            </label>
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input type="radio" name={`status_${profile.user.id}`} value="EXCUSED" className="accent-blue-500 w-4 h-4" />
                                                <span className="text-sm">Excused</span>
                                            </label>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="mt-8 flex justify-end">
                    <button type="submit" className="bg-primary text-black font-bold px-8 py-3 rounded-lg hover:opacity-90">
                        Save Attendance
                    </button>
                </div>
            </form>
        </div>
    );
}

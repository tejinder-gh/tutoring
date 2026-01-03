import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Users } from "lucide-react";
import Link from "next/link";

export const dynamic = 'force-dynamic';

export default async function AttendanceBatchesPage() {
    const session = await auth();
    if (!session?.user?.id) return <div>Unauthorized</div>;

    const teacherProfile = await prisma.teacherProfile.findUnique({
        where: { userId: session.user.id },
        include: {
            courses: {
                include: {
                    batches: {
                        include: {
                            _count: { select: { students: true } }
                        }
                    }
                }
            }
        }
    });

    if (!teacherProfile) return <div>Profile not found</div>;

    const batches = teacherProfile.courses.flatMap(c => c.batches.map(b => ({ ...b, courseTitle: c.title })));

    return (
        <div>
            <h1 className="text-3xl font-bold mb-8">Attendance Recording</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {batches.map(batch => (
                    <Link
                        href={`/teacher/attendance/${batch.id}`}
                        key={batch.id}
                        className="group bg-accent/20 border border-border p-6 rounded-xl hover:border-primary/50 transition-all"
                    >
                        <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">{batch.name}</h3>
                        <p className="text-sm text-text-muted mb-4">{batch.courseTitle}</p>
                        <div className="flex items-center gap-2">
                            <Users size={18} />
                            <span className="font-bold">{batch._count.students} Students</span>
                        </div>
                    </Link>
                ))}
                {batches.length === 0 && <p>No active batches found for your courses.</p>}
            </div>
        </div>
    );
}

"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";

export interface SubjectProgress {
    subject: string;
    attendance: number;
    avgTestScore: number;
    assignmentsCompleted: number;
    totalAssignments: number;
    teacherFeedback: string | null;
}

export interface StudentProgressReport {
    studentName: string;
    studentId: string;
    branchName: string;
    batchName: string;
    overallAttendance: number;
    overallGrade: string; // A, B, C...
    subjects: SubjectProgress[];
    recentAchievements: string[];
    generatedAt: Date;
}

export async function getStudentProgressReport(studentId?: string): Promise<StudentProgressReport | null> {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    let targetStudentId = studentId;

    // Check role from DB to be safe
    const userWithRole = await db.user.findUnique({
        where: { id: session.user.id },
        include: { role: true }
    });

    // If student, can only view own report
    if (userWithRole?.role?.name === 'STUDENT') {
        const profile = await db.studentProfile.findUnique({ where: { userId: session.user.id } });
        if (!profile) return null;
        targetStudentId = profile.id;
    } else {
        // Staff/Admin/Teacher
        if (!targetStudentId) throw new Error("Student ID required");
        // await requirePermission("read", "academic"); // Optional: add specific permission check
    }

    const studentProfile = await db.studentProfile.findUnique({
        where: { id: targetStudentId }
    });

    if (!studentProfile) throw new Error("Student not found");

    const studentUser = await db.user.findUnique({
        where: { id: studentProfile.userId },
        include: { branch: true }
    });

    if (!studentUser) throw new Error("User not found");

    const enrollments = await db.enrollment.findMany({
        where: {
            studentProfileId: studentProfile.id,
            status: 'ACTIVE'
        },
        include: {
            batch: true,
            course: true
        }
    });

    // Fetch Attendance
    const attendanceRecords = await db.attendance.findMany({
        where: { userId: studentProfile.userId }
    });
    const totalDays = attendanceRecords.length;
    const presentDays = attendanceRecords.filter(a => a.status === 'PRESENT').length;
    const overallAttendance = totalDays > 0 ? (presentDays / totalDays) * 100 : 100;

    // Fetch Quiz/Test Results
    const quizAttempts = await db.quizAttempt.findMany({
        where: { userId: studentProfile.userId },
        include: { quiz: true }
    });

    // Group by Course (Subject)
    const subjectsMap = new Map<string, SubjectProgress>();

    for (const enrollment of enrollments) {
        const courseTitle = enrollment.course.title;

        // Simplify quiz scoring (mock or aggregate)
        // In real app, we filter quizzes by courseId (via Quiz -> Curriculum -> Course)
        // Here we assume global avg if not filterable easily
        const avgScore = 0; // Placeholder

        subjectsMap.set(courseTitle, {
            subject: courseTitle,
            attendance: overallAttendance, // Per subject attendance if available, else overall
            avgTestScore: avgScore,
            assignmentsCompleted: 0,
            totalAssignments: 0,
            teacherFeedback: "Doing well, needs more focus on practicals."
        });
    }

    return {
        studentName: studentUser.name,
        studentId: studentProfile.id,
        branchName: studentUser.branch?.name || "Main Branch",
        batchName: enrollments[0]?.batch?.name || "N/A",
        overallAttendance: Math.round(overallAttendance),
        overallGrade: calculateGrade(overallAttendance), // Simple logic
        subjects: Array.from(subjectsMap.values()),
        recentAchievements: ["Perfect Attendance in Oct", "Top Scorer in Quiz 1"], // Placeholder
        generatedAt: new Date()
    };
}

function calculateGrade(percentage: number): string {
    if (percentage >= 90) return 'A+';
    if (percentage >= 80) return 'A';
    if (percentage >= 70) return 'B';
    if (percentage >= 60) return 'C';
    return 'D';
}

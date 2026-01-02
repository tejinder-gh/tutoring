import { getStudentProgressReport } from "@/app/actions/progress";
import { auth } from "@/auth";
import { Link } from "@/i18n/routing";
import { format } from "date-fns";
import { ArrowLeft, BookOpen, Calendar, CheckCircle, GraduationCap, Trophy } from "lucide-react";
import { redirect } from "next/navigation";

export default async function ProgressPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/login");

  const report = await getStudentProgressReport();

  if (!report) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold">Progress Report not found</h1>
        <p className="text-muted-foreground">You may not have an active student profile.</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 p-6">
      <div className="flex items-center gap-4">
        <Link href="/student/dashboard" className="p-2 hover:bg-muted rounded-full transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Academic Progress Report</h1>
          <p className="text-muted-foreground">Comprehensive view of your academic journey.</p>
        </div>
        <div className="ml-auto text-right">
          <div className="text-sm font-medium">Generated on</div>
          <div className="text-sm text-muted-foreground">{format(new Date(report.generatedAt), "MMM d, yyyy")}</div>
        </div>
      </div>

      {/* Student Info Card */}
      <div className="bg-card border rounded-xl p-6 shadow-sm grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Student Name</div>
            <div className="font-bold">{report.studentName}</div>
          </div>
        </div>
        <div>
          <div className="text-sm text-muted-foreground">Batch</div>
          <div className="font-medium">{report.batchName}</div>
        </div>
        <div>
          <div className="text-sm text-muted-foreground">Branch</div>
          <div className="font-medium">{report.branchName}</div>
        </div>
        <div className="flex justify-end items-center">
          <div className="text-right">
            <div className="text-sm text-muted-foreground">Overall Grade</div>
            <div className={`text-2xl font-bold ${getGradeColor(report.overallGrade)}`}>{report.overallGrade}</div>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-card border rounded-xl p-6 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-green-100 text-green-700 rounded-lg">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Attendance</div>
            <div className="text-2xl font-bold">{report.overallAttendance}%</div>
          </div>
        </div>
        {/* Add more overall metrics here if available */}
      </div>

      {/* Detailed Subject Performance */}
      <div className="bg-card border rounded-xl overflow-hidden shadow-sm">
        <div className="p-6 border-b">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            Subject Performance
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr className="text-left">
                <th className="p-4 font-medium text-muted-foreground">Subject</th>
                <th className="p-4 font-medium text-muted-foreground">Attendance</th>
                <th className="p-4 font-medium text-muted-foreground">Avg Test Score</th>
                <th className="p-4 font-medium text-muted-foreground">Feedback</th>
              </tr>
            </thead>
            <tbody>
              {report.subjects.map((subject) => (
                <tr key={subject.subject} className="border-b last:border-0 hover:bg-muted/50">
                  <td className="p-4 font-medium">{subject.subject}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-2 bg-secondary rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary"
                          style={{ width: `${subject.attendance}%` }}
                        />
                      </div>
                      <span className="text-xs">{Math.round(subject.attendance)}%</span>
                    </div>
                  </td>
                  <td className="p-4 font-medium">
                    {subject.avgTestScore > 0 ? `${Math.round(subject.avgTestScore)}%` : '-'}
                  </td>
                  <td className="p-4 text-muted-foreground max-w-xs truncate">
                    {subject.teacherFeedback || "No remarks"}
                  </td>
                </tr>
              ))}
              {report.subjects.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-muted-foreground">No subjects enrolled.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Achievements */}
      <div className="bg-card border rounded-xl p-6 shadow-sm">
        <h2 className="text-lg font-bold flex items-center gap-2 mb-4">
          <Trophy className="w-5 h-5 text-yellow-500" />
          Recent Achievements
        </h2>
        <div className="grid gap-3">
          {report.recentAchievements.map((ach, i) => (
            <div key={i} className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span>{ach}</span>
            </div>
          ))}
          {report.recentAchievements.length === 0 && (
            <p className="text-muted-foreground">No recent achievements recorded.</p>
          )}
        </div>
      </div>
    </div>
  );
}

function getGradeColor(grade: string) {
  if (grade.startsWith('A')) return 'text-green-600';
  if (grade.startsWith('B')) return 'text-blue-600';
  if (grade.startsWith('C')) return 'text-yellow-600';
  return 'text-red-600';
}

import Sidebar from "@/components/Sidebar";

export default function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar role="TEACHER" />
      <div className="pl-64">
        <main className="p-8">{children}</main>
      </div>
    </div>
  );
}

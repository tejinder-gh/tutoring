import Sidebar from "@/components/Sidebar";

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar role="STUDENT" />
      <div className="pl-64">
        <main className="p-8">{children}</main>
      </div>
    </div>
  );
}

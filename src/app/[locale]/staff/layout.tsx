import Sidebar from "@/components/Sidebar";

export default function StaffLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar role="STAFF" />
      <main className="flex-1 overflow-y-auto ml-64">
        {children}
      </main>
    </div>
  );
}

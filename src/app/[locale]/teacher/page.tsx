import { auth } from "@/../auth";

export default async function TeacherDashboard() {
  const session = await auth();

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Teacher Portal - {session?.user?.name}</h1>
      <p>Manage your classes, assignments, and students from here.</p>
      {/* Teacher stats will go here */}
    </div>
  );
}


import { getAllTodos } from "@/app/actions/todos";
import { db } from "@/lib/db";
import TodosClient from "./TodosClient";

export default async function Page({ searchParams }: { searchParams: { branchId?: string } }) {
  const todos = await getAllTodos(searchParams.branchId);

  // Fetch potential assignees (Staff/Teachers/Admins) - exclude students for now or include if needed
  const users = await db.user.findMany({
    where: {
      role: { name: { in: ['ADMIN', 'TEACHER', 'DIRECTOR', 'STAFF'] } },
      isActive: true
    },
    select: { id: true, name: true, email: true },
    orderBy: { name: 'asc' }
  });

  return <TodosClient initialTodos={todos} users={users} />;
}

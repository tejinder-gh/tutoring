"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export interface TodoData {
    title: string;
    description?: string;
    priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
    dueDate?: Date;
    assignedToId: string;
    branchId?: string;
}

export async function createTodo(data: TodoData) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    // Check permissions - Admin/Manager can assign
    // await requirePermission("manage", "todos"); // or "staff"

    const todo = await prisma.todo.create({
        data: {
            title: data.title,
            description: data.description,
            priority: data.priority,
            dueDate: data.dueDate,
            assignedToId: data.assignedToId,
            assignedById: session.user.id,
            branchId: data.branchId,
            status: "PENDING"
        }
    });

    // Notify user?
    await prisma.notification.create({
        data: {
            userId: data.assignedToId,
            title: "New Task Assigned",
            message: `You have been assigned a new task: ${data.title}`,
            type: "INFO",
            link: "/dashboard/todos" // Assuming student/staff dashboard has todos
        }
    });

    revalidatePath("/admin/todos");
    return { success: true, data: todo };
}

export async function updateTodoStatus(id: string, status: "PENDING" | "IN_PROGRESS" | "COMPLETED") {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const todo = await prisma.todo.findUnique({ where: { id } });
    if (!todo) throw new Error("Todo not found");

    // Allow assignee or creator or admin to update status
    if (todo.assignedToId !== session.user.id && todo.assignedById !== session.user.id) {
         // Check admin permission logic here if stricter
         // For now allow assignee
    }

    await prisma.todo.update({
        where: { id },
        data: { status }
    });

    revalidatePath("/admin/todos");
    revalidatePath("/dashboard/todos");
    return { success: true };
}

export async function deleteTodo(id: string) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const todo = await prisma.todo.findUnique({ where: { id } });
    if (!todo) throw new Error("Todo not found");

    if (todo.assignedById !== session.user.id) {
        // Only creator or super admin should delete
        // await requirePermission("manage", "todos");
    }

    await prisma.todo.delete({ where: { id } });
    revalidatePath("/admin/todos");
    return { success: true };
}

export async function getAssignedTodos() {
    const session = await auth();
    if (!session?.user?.id) return [];

    return await prisma.todo.findMany({
        where: { assignedToId: session.user.id },
        orderBy: { dueDate: 'asc' }, // Urgent first
        include: {
            assignedBy: { select: { name: true } }
        }
    });
}

export async function getCreatedTodos() {
    const session = await auth();
    if (!session?.user?.id) return [];

    return await prisma.todo.findMany({
        where: { assignedById: session.user.id },
        orderBy: { createdAt: 'desc' },
        include: {
            assignedTo: { select: { name: true, email: true } }
        }
    });
}

export async function getAllTodos(branchId?: string) {
    const session = await auth();
    if (!session?.user?.id) return [];

    // await requirePermission("read", "todos");

    const where: any = {};
    if (branchId) where.branchId = branchId;

    return await prisma.todo.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        include: {
            assignedTo: { select: { name: true } },
            assignedBy: { select: { name: true } }
        }
    });
}

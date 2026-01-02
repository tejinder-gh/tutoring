"use client";

import { createTodo, deleteTodo, TodoData } from "@/app/actions/todos";
import { format } from "date-fns";
import { CheckCircle, Clock, Plus, Trash2 } from "lucide-react";
import { useState } from "react";

interface Todo {
  id: string;
  title: string;
  priority: string;
  status: string;
  dueDate: Date | null;
  assignedTo: { name: string };
  assignedBy: { name: string };
  createdAt: Date;
}

interface UserOption {
  id: string;
  name: string;
  email: string;
}

export default function TodosClient({ initialTodos, users }: { initialTodos: any[], users: UserOption[] }) {
  const [todos, setTodos] = useState<any[]>(initialTodos);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [filter, setFilter] = useState("ALL"); // ALL, PENDING, COMPLETED

  const [formData, setFormData] = useState<Partial<TodoData>>({
    title: "",
    description: "",
    priority: "MEDIUM",
    dueDate: undefined,
    assignedToId: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await createTodo(formData as TodoData);
      window.location.reload();
    } catch (error) {
      console.error(error);
      alert("Failed to assign task");
    } finally {
      setIsLoading(false);
      setIsDialogOpen(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this task?")) return;
    try {
      await deleteTodo(id);
      setTodos(prev => prev.filter(t => t.id !== id));
    } catch (err) {
      alert("Failed to delete");
    }
  };

  const activeTodos = todos.filter(t => filter === 'ALL' || t.status === filter);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Task Management</h1>
          <p className="text-muted-foreground">Assign and track tasks across the team.</p>
        </div>
        <button
          onClick={() => setIsDialogOpen(true)}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 text-sm font-medium transition-colors"
        >
          <Plus className="h-4 w-4" /> Assign Task
        </button>
      </div>

      <div className="flex gap-2 border-b pb-2">
        {['ALL', 'PENDING', 'IN_PROGRESS', 'COMPLETED'].map(status => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-3 py-1 text-sm rounded-md font-medium transition-colors ${filter === status ? 'bg-secondary text-secondary-foreground' : 'text-muted-foreground hover:bg-muted'}`}
          >
            {status.replace('_', ' ')}
          </button>
        ))}
      </div>

      <div className="grid gap-4">
        {activeTodos.map((todo) => (
          <div key={todo.id} className="flex items-start justify-between bg-card border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex gap-3">
              <div className={`mt-1 ${todo.status === 'COMPLETED' ? 'text-green-500' : 'text-muted-foreground'}`}>
                {todo.status === 'COMPLETED' ? <CheckCircle className="w-5 h-5" /> : <div className="w-5 h-5 border-2 rounded-full" />}
              </div>
              <div>
                <div className="font-medium flex items-center gap-2">
                  {todo.title}
                  <span className={`text-[10px] px-2 py-0.5 rounded-full border ${getPriorityColor(todo.priority)}`}>
                    {todo.priority}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mt-1 line-clamp-1">{todo.description}</p>
                <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <span>Assigned to <b>{todo.assignedTo.name}</b></span>
                  </div>
                  {todo.dueDate && (
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {format(new Date(todo.dueDate), "MMM d, yyyy")}
                    </div>
                  )}
                  <div>By {todo.assignedBy.name}</div>
                </div>
              </div>
            </div>
            <button onClick={() => handleDelete(todo.id)} className="text-muted-foreground hover:text-destructive p-2">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
        {activeTodos.length === 0 && (
          <div className="text-center p-8 text-muted-foreground">No tasks found.</div>
        )}
      </div>

      {isDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-background w-full max-w-md rounded-lg shadow-lg border p-6 space-y-4">
            <h2 className="text-lg font-bold">Assign New Task</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Title</label>
                <input
                  required
                  className="w-full border rounded-md px-3 py-2 text-sm bg-background"
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Update Syllabus"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <textarea
                  className="w-full border rounded-md px-3 py-2 text-sm bg-background"
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Priority</label>
                  <select
                    className="w-full border rounded-md px-3 py-2 text-sm bg-background"
                    value={formData.priority}
                    onChange={e => setFormData({ ...formData, priority: e.target.value as any })}
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="URGENT">Urgent</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Due Date</label>
                  <input
                    type="date"
                    className="w-full border rounded-md px-3 py-2 text-sm bg-background"
                    onChange={e => setFormData({ ...formData, dueDate: new Date(e.target.value) })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Assign To</label>
                <select
                  required
                  className="w-full border rounded-md px-3 py-2 text-sm bg-background"
                  value={formData.assignedToId}
                  onChange={e => setFormData({ ...formData, assignedToId: e.target.value })}
                >
                  <option value="">Select User</option>
                  {users.map(u => (
                    <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setIsDialogOpen(false)} className="px-4 py-2 text-sm hover:bg-muted rounded-md transition-colors">Cancel</button>
                <button disabled={isLoading} type="submit" className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors">
                  Assign
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function getPriorityColor(p: string) {
  switch (p) {
    case 'URGENT': return 'bg-red-100 text-red-700 border-red-200';
    case 'HIGH': return 'bg-orange-100 text-orange-700 border-orange-200';
    case 'MEDIUM': return 'bg-blue-100 text-blue-700 border-blue-200';
    default: return 'bg-gray-100 text-gray-600 border-gray-200';
  }
}

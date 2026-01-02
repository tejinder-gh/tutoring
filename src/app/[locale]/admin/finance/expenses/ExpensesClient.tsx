"use client";

import { addExpense, deleteExpense, ExpenseData, updateExpense } from "@/app/actions/expenses";
import { format } from "date-fns";
import { Edit2, Plus, Trash2 } from "lucide-react";
import { useState } from "react";

interface Expense {
  id: string;
  title: string;
  amount: string; // Decimal comes as string
  category: string;
  date: Date;
  description?: string | null;
  branch?: { name: string } | null;
}

export default function ExpensesPage({ initialExpenses, categories }: { initialExpenses: any[], categories: string[] }) {
  const [expenses, setExpenses] = useState<any[]>(initialExpenses);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Quick filters
  const [selectedCategory, setSelectedCategory] = useState("ALL");

  const [formData, setFormData] = useState<Partial<ExpenseData>>({
    title: "",
    amount: 0,
    category: "OPERATIONAL",
    date: new Date(),
    description: "",
  });
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (editingId) {
        await updateExpense(editingId, formData);
      } else {
        await addExpense(formData as ExpenseData);
      }
      // Ideally we re-fetch or router.refresh(), but for now let's reload to keep it simple with server components
      window.location.reload();
    } catch (error) {
      console.error(error);
      alert("Failed to save expense");
    } finally {
      setIsLoading(false);
      setIsDialogOpen(false);
      setEditingId(null);
      setFormData({ title: "", amount: 0, category: "OPERATIONAL", date: new Date(), description: "" });
    }
  };

  const handleEdit = (expense: any) => {
    setFormData({
      title: expense.title,
      amount: Number(expense.amount),
      category: expense.category,
      date: new Date(expense.date),
      description: expense.description || ""
    });
    setEditingId(expense.id);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure?")) return;
    try {
      await deleteExpense(id);
      setExpenses(prev => prev.filter(e => e.id !== id));
    } catch (err) {
      alert("Failed to delete");
    }
  };

  const filteredExpenses = selectedCategory === "ALL" ? expenses : expenses.filter(e => e.category === selectedCategory);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Expenses</h1>
          <p className="text-muted-foreground">Manage operational expenses and bookkeeping.</p>
        </div>
        <button
          onClick={() => { setEditingId(null); setIsDialogOpen(true); }}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 text-sm font-medium transition-colors"
        >
          <Plus className="h-4 w-4" /> Add Expense
        </button>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex gap-2">
          <button
            onClick={() => setSelectedCategory("ALL")}
            className={`px-3 py-1 text-sm rounded-full ${selectedCategory === "ALL" ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}`}
          >
            All
          </button>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 text-sm rounded-full ${selectedCategory === cat ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="border rounded-lg bg-card">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 border-b">
            <tr className="text-left">
              <th className="p-4 font-medium text-muted-foreground">Date</th>
              <th className="p-4 font-medium text-muted-foreground">Title</th>
              <th className="p-4 font-medium text-muted-foreground">Category</th>
              <th className="p-4 font-medium text-muted-foreground">Branch</th>
              <th className="p-4 font-medium text-muted-foreground text-right">Amount</th>
              <th className="p-4 font-medium text-muted-foreground text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredExpenses.map((expense) => (
              <tr key={expense.id} className="border-b last:border-0 hover:bg-muted/50 transition-colors">
                <td className="p-4">{format(new Date(expense.date), "MMM d, yyyy")}</td>
                <td className="p-4 font-medium">{expense.title}
                  {expense.description && <div className="text-xs text-muted-foreground font-normal">{expense.description}</div>}
                </td>
                <td className="p-4">
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                    {expense.category}
                  </span>
                </td>
                <td className="p-4 text-muted-foreground">{expense.branch?.name || "-"}</td>
                <td className="p-4 text-right font-medium">₹{Number(expense.amount).toLocaleString()}</td>
                <td className="p-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => handleEdit(expense)} className="p-1 hover:bg-muted rounded text-primary">
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button onClick={() => handleDelete(expense.id)} className="p-1 hover:bg-muted rounded text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredExpenses.length === 0 && (
              <tr>
                <td colSpan={6} className="p-8 text-center text-muted-foreground">No expenses found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-background w-full max-w-md rounded-lg shadow-lg border p-6 space-y-4">
            <h2 className="text-lg font-bold">{editingId ? "Edit Expense" : "Add Expense"}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Title</label>
                <input
                  required
                  className="w-full border rounded-md px-3 py-2 text-sm bg-background"
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Amount</label>
                  <input
                    required
                    type="number"
                    min="0"
                    className="w-full border rounded-md px-3 py-2 text-sm bg-background"
                    value={formData.amount}
                    onChange={e => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Category</label>
                  <select
                    className="w-full border rounded-md px-3 py-2 text-sm bg-background"
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                  >
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Date</label>
                <input
                  required
                  type="date"
                  className="w-full border rounded-md px-3 py-2 text-sm bg-background"
                  value={formData.date ? format(new Date(formData.date), "yyyy-MM-dd") : ""}
                  onChange={e => setFormData({ ...formData, date: new Date(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <textarea
                  className="w-full border rounded-md px-3 py-2 text-sm bg-background"
                  value={formData.description || ""}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setIsDialogOpen(false)} className="px-4 py-2 text-sm hover:bg-muted rounded-md transition-colors">Cancel</button>
                <button disabled={isLoading} type="submit" className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors">
                  {isLoading ? "Saving..." : "Save Expense"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

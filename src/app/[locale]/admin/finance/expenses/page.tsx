
import { getExpenseCategories, getExpenses } from "@/app/actions/expenses";
import ExpensesClient from "./ExpensesClient";

export default async function Page() {
  const [expenses, categories] = await Promise.all([
    getExpenses(),
    getExpenseCategories()
  ]);

  return <ExpensesClient initialExpenses={expenses} categories={categories} />;
}

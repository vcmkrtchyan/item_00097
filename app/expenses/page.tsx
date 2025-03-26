import { MainLayout } from "@/components/layouts/main-layout"
import { ExpenseTracker } from "@/components/expenses/expense-tracker"

export default function ExpensesPage() {
  return (
    <MainLayout>
      <ExpenseTracker />
    </MainLayout>
  )
}


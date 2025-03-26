"use client"

import { useState } from "react"
import { useTravel, type Expense } from "@/context/travel-context"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Edit, Trash2 } from "lucide-react"
import { ExpenseForm } from "./expense-form"
import { formatDate } from "@/lib/utils"
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog"
import { toast } from "sonner"

interface ExpenseListProps {
  expenses: Expense[]
  tripId?: string
}

export function ExpenseList({ expenses, tripId }: ExpenseListProps) {
  const { deleteExpense, trips } = useTravel()
  const [editingExpenseId, setEditingExpenseId] = useState<string | null>(null)
  const [expenseToDelete, setExpenseToDelete] = useState<string | null>(null)

  // Sort expenses by date (most recent first)
  const sortedExpenses = [...expenses].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  const getTripTitle = (tripId: string) => {
    const trip = trips.find((t) => t.id === tripId)
    return trip ? trip.title : "Unknown Trip"
  }

  const getCurrencySymbol = (currencyCode: string) => {
    switch (currencyCode) {
      case "USD":
        return "$"
      case "EUR":
        return "€"
      case "GBP":
        return "£"
      case "JPY":
        return "¥"
      case "CAD":
        return "C$"
      case "AUD":
        return "A$"
      default:
        return "$"
    }
  }

  const handleDeleteExpense = () => {
    if (expenseToDelete) {
      const expense = expenses.find((e) => e.id === expenseToDelete)
      if (expense) {
        deleteExpense(expenseToDelete)
        toast.success("Expense deleted", {
          description: `${getCurrencySymbol(expense.currency)}${expense.amount.toFixed(2)} expense has been deleted.`,
        })
      }
      setExpenseToDelete(null)
    }
  }

  if (editingExpenseId) {
    const expense = expenses.find((e) => e.id === editingExpenseId)
    if (!expense) return null

    return (
      <Card className="p-6">
        <h3 className="text-lg font-medium mb-4">Edit Expense</h3>
        <ExpenseForm
          expenseId={editingExpenseId}
          tripId={tripId}
          onCancel={() => setEditingExpenseId(null)}
          onSuccess={() => setEditingExpenseId(null)}
        />
      </Card>
    )
  }

  if (sortedExpenses.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-muted-foreground mb-4">No expenses recorded yet</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {sortedExpenses.map((expense) => (
        <div key={expense.id} className="flex items-start justify-between p-4 border rounded-lg">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-medium">
                {getCurrencySymbol(expense.currency)}
                {expense.amount.toFixed(2)}
              </span>
              <span className="text-sm px-2 py-0.5 bg-muted rounded-full">{expense.category}</span>
            </div>
            <p className="text-sm text-muted-foreground">{expense.description}</p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>{formatDate(expense.date)}</span>
              {!tripId && (
                <>
                  <span>•</span>
                  <span>{getTripTitle(expense.tripId)}</span>
                </>
              )}
            </div>
          </div>
          <div className="flex space-x-2">
            <Button variant="ghost" size="icon" onClick={() => setEditingExpenseId(expense.id)}>
              <Edit className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setExpenseToDelete(expense.id)}>
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        </div>
      ))}

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={!!expenseToDelete}
        onClose={() => setExpenseToDelete(null)}
        onConfirm={handleDeleteExpense}
        title="Delete Expense"
        description="Are you sure you want to delete this expense? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
      />
    </div>
  )
}


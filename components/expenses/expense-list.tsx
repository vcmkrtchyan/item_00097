"use client"

import { useState } from "react"
import { useTravel, type Expense } from "@/context/travel-context"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Edit, Trash2 } from "lucide-react"
import { ExpenseForm } from "./expense-form"
import { formatDate } from "@/lib/utils"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface ExpenseListProps {
  expenses: Expense[]
  tripId?: string
}

export function ExpenseList({ expenses, tripId }: ExpenseListProps) {
  const { deleteExpense, trips } = useTravel()
  const [editingExpenseId, setEditingExpenseId] = useState<string | null>(null)

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
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete this expense. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => deleteExpense(expense.id)}>Delete</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      ))}
    </div>
  )
}


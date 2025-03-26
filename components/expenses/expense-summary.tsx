"use client"

import type { Expense } from "@/context/travel-context"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface ExpenseSummaryProps {
  expenses: Expense[]
}

export function ExpenseSummary({ expenses }: ExpenseSummaryProps) {
  if (expenses.length === 0) {
    return (
      <div className="text-center py-6">
        <p className="text-muted-foreground">No expenses recorded yet</p>
      </div>
    )
  }

  // Calculate total expenses
  const totalAmount = expenses.reduce((sum, expense) => sum + expense.amount, 0)

  // Group expenses by category
  const expensesByCategory = expenses.reduce(
    (acc, expense) => {
      const { category, amount } = expense
      if (!acc[category]) {
        acc[category] = 0
      }
      acc[category] += amount
      return acc
    },
    {} as Record<string, number>,
  )

  // Sort categories by amount (highest first)
  const sortedCategories = Object.entries(expensesByCategory).sort((a, b) => b[1] - a[1])

  // Calculate percentages
  const categoryPercentages = sortedCategories.map(([category, amount]) => ({
    category,
    amount,
    percentage: (amount / totalAmount) * 100,
  }))

  return (
    <Tabs defaultValue="chart">
      <TabsList className="mb-4">
        <TabsTrigger value="chart">Chart</TabsTrigger>
        <TabsTrigger value="breakdown">Breakdown</TabsTrigger>
      </TabsList>

      <TabsContent value="chart">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Total Expenses</span>
            <span className="text-2xl font-bold">${totalAmount.toFixed(2)}</span>
          </div>

          <div className="space-y-2">
            {categoryPercentages.map(({ category, amount, percentage }) => (
              <div key={category}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm">{category}</span>
                  <span className="text-sm font-medium">${amount.toFixed(2)}</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2.5">
                  <div className="bg-primary h-2.5 rounded-full" style={{ width: `${percentage}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </TabsContent>

      <TabsContent value="breakdown">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Total Expenses</span>
            <span className="text-2xl font-bold">${totalAmount.toFixed(2)}</span>
          </div>

          <div className="space-y-2">
            {categoryPercentages.map(({ category, amount, percentage }) => (
              <Card key={category}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-medium">{category}</h4>
                      <p className="text-sm text-muted-foreground">{percentage.toFixed(1)}% of total</p>
                    </div>
                    <span className="text-lg font-bold">${amount.toFixed(2)}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </TabsContent>
    </Tabs>
  )
}

